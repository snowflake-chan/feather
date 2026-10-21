'use strict';

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function contentHash(content) {
  const digest = crypto.createHash('sha256').update(content).digest();
  const multihash = Buffer.concat([Buffer.from([0x12, 0x20]), digest]);
  let value = 0n;
  for (const byte of multihash) value = (value << 8n) | BigInt(byte);
  let out = '';
  while (value > 0n) {
    out = BASE58[Number(value % 58n)] + out;
    value /= 58n;
  }
  return out;
}

function treeHash(dir) {
  const hash = crypto.createHash('sha256');
  const walk = (current) => {
    for (const name of fs.readdirSync(current).sort()) {
      const full = path.join(current, name);
      const rel = path.relative(dir, full).split(path.sep).join('/');
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        hash.update(`d\0${rel}\0`);
        walk(full);
      } else if (stat.isFile()) {
        hash.update(`f\0${rel}\0`);
        hash.update(fs.readFileSync(full));
      }
    }
  };
  walk(dir);
  return `sha256:${hash.digest('hex')}`;
}

function buildProjectArchive(archive, output, options = {}) {
  const source = path.resolve(archive);
  if (!fs.existsSync(source)) throw new Error(`archive not found: ${source}`);
  const out = path.resolve(output || `${path.basename(source, '.boxproject')}.fmap`);
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-builder-'));
  const projectsRoot = path.join(temporary, 'projects');
  try {
    const worker = path.join(__dirname, 'build-worker.js');
    const result = spawnSync(
      process.execPath,
      [worker, source, options.version || '1.0.0'],
      {
        encoding: 'utf8',
        env: {
          ...process.env,
          BOX_LOCAL_PROJECTS_PATH: projectsRoot,
          BOX_LOCAL_DIST_PATH: path.join(temporary, 'dist'),
          FEATHER_LOCAL_ENGINE_REPO_ROOT: path.resolve(__dirname, '../..'),
        },
      },
    );
    if (result.status !== 0) {
      throw new Error(`official publish failed: ${result.stderr || result.stdout || result.error}`);
    }
    const { imported, release, releaseRoot } = JSON.parse(result.stdout);
    const releaseData = path.join(releaseRoot, 'data');
    if (!fs.existsSync(path.join(releaseData, 'project-state.json'))) {
      throw new Error(`release has no project-state.json: ${releaseData}`);
    }

    const fmap = fs.mkdtempSync(path.join(temporary, 'fmap-'));
    const content = path.join(fmap, 'content');
    fs.mkdirSync(content, { recursive: true });
    fs.copyFileSync(path.join(releaseData, 'project-state.json'), path.join(content, 'project-state.json'));
    fs.cpSync(path.join(releaseData, 'blobs'), path.join(content, 'blobs'), {
      recursive: true,
      dereference: true,
    });
    const manifest = {
      format: 'feather.map',
      formatVersion: 1,
      map: {
        id: imported.id,
        name: imported.name,
        version: release.version,
      },
      content: {
        state: 'content/project-state.json',
        blobs: 'content/blobs',
        hash: treeHash(content),
      },
      storage: { volume: release.permanentMapGroupId || release.mapGroupId || release.id },
      runtime: { port: 0, memoryMb: null, playerLimit: null },
      source: {
        kind: 'boxproject',
        version: release.version,
        hash: `sha256:${crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex')}`,
      },
      requires: { feather: '>=0.1.0', format: 1 },
    };
    fs.writeFileSync(path.join(fmap, 'feather.json'), JSON.stringify(manifest, null, 2) + '\n');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const tar = spawnSync('tar', ['-czf', out, '-C', fmap, 'feather.json', 'content'], {
      encoding: 'utf8',
    });
    if (tar.status !== 0) throw new Error(`failed to pack ${out}: ${tar.stderr || tar.error}`);
    return { output: out, manifest, imported, release };
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

module.exports = { buildProjectArchive };
