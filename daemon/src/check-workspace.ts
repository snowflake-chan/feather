import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { buildCommand } from './build';
import { unpackCommand } from './unpack';

interface AssetEntry {
  source?: string;
  hash?: string;
  type?: number;
}
interface AssetConfig {
  assets?: Record<string, AssetEntry>;
  audioAssets?: Record<string, AssetEntry>;
  pictureAssets?: Record<string, AssetEntry>;
  scriptIndex?: string;
}

function readManifest(fmap: string) {
  const result = spawnSync('tar', ['-xOf', fmap, 'feather.json'], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'missing feather.json');
  return JSON.parse(result.stdout) as {
    map: { id: string; name?: string; version?: string };
    storage?: { volume?: string };
    runtime?: { port?: number; memoryMb?: number | null; playerLimit?: number | null };
    content: { hash: string };
  };
}

function readAssetConfig(workspace: string): AssetConfig {
  return JSON.parse(fs.readFileSync(path.join(workspace, 'project', 'assets.json'), 'utf8')) as AssetConfig;
}

async function expectFailure(label: string, run: () => Promise<unknown>, contains: string) {
  try {
    await run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(contains)) throw new Error(`${label}: unexpected error: ${message}`);
    return;
  }
  throw new Error(`${label}: expected failure`);
}

async function main() {
  const fixture = path.resolve(__dirname, '../../test-fixtures/roundtrip.fmap');
  if (!fs.existsSync(fixture)) throw new Error(`missing fixture: ${fixture}`);
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'feather-workspace-check-'));
  try {
    const before = readManifest(fixture);
    const unpacked = path.join(root, 'unpacked');
    await unpackCommand({ archive: fixture, dir: unpacked });
    for (const required of ['project/info.json', 'project/assets.json']) {
      if (!fs.existsSync(path.join(unpacked, required))) throw new Error(`missing ${required}`);
    }
    if (!fs.existsSync(path.join(unpacked, 'chunks'))) throw new Error('missing chunks/');

    const config = readAssetConfig(unpacked);
    const entries = Object.entries(config.assets || {});
    const fail: string[] = [];
    const lut = entries.filter(([name]) => name.startsWith('lut/'));
    if (lut.length === 0) fail.push('fixture has no lut/* assets');
    for (const [name, entry] of lut) {
      if (entry.source !== 'engine') fail.push(`${name} source=${entry.source}`);
      if (fs.existsSync(path.join(unpacked, 'assets', name))) fail.push(`${name} wrote engine bytes`);
    }
    for (const [name, entry] of entries) {
      if ((name.startsWith('snow/')) && entry.source !== 'engine') fail.push(`${name} source=${entry.source}`);
    }
    if (!entries.some(([, entry]) => entry.source === 'engine')) fail.push('no engine entries');
    if (!entries.some(([, entry]) => entry.source === 'project')) fail.push('no project entries');

    const rebuilt = path.join(root, 'rebuilt.fmap');
    await buildCommand({ root: unpacked, output: rebuilt });
    const after = readManifest(rebuilt);
    if (before.map.id !== after.map.id) fail.push('map.id');
    if (before.map.name !== after.map.name) fail.push(`map.name ${before.map.name} != ${after.map.name}`);
    if (before.map.version !== after.map.version) fail.push('map.version');
    if (before.storage?.volume !== after.storage?.volume) fail.push('storage.volume');
    if (JSON.stringify(before.runtime) !== JSON.stringify(after.runtime)) fail.push('runtime');
    if (before.content.hash !== after.content.hash) fail.push(`content.hash ${before.content.hash} != ${after.content.hash}`);

    // audioAssets / pictureAssets must survive an archive round-trip.
    const custom = path.join(root, 'custom');
    fs.cpSync(unpacked, custom, { recursive: true });
    const customConfig = readAssetConfig(custom);
    const customAsset = { ownerId: 0, contentId: 0, size: 5, type: 6, animated: false, bounds: [0, 0, 0], hash: '', previewImage: '', source: 'project' };
    customConfig.audioAssets = { 'audio/custom.mp3': customAsset };
    customConfig.pictureAssets = { 'picture/custom.png': { ...customAsset, type: 8 } };
    fs.mkdirSync(path.join(custom, 'assets', 'audio'), { recursive: true });
    fs.mkdirSync(path.join(custom, 'assets', 'picture'), { recursive: true });
    fs.writeFileSync(path.join(custom, 'assets', 'audio', 'custom.mp3'), 'audio');
    fs.writeFileSync(path.join(custom, 'assets', 'picture', 'custom.png'), 'image');
    fs.writeFileSync(path.join(custom, 'project', 'assets.json'), `${JSON.stringify(customConfig, null, 2)}\n`);
    const customFmap = path.join(root, 'custom.fmap');
    await buildCommand({ root: custom, output: customFmap });
    const customUnpacked = path.join(root, 'custom-unpacked');
    await unpackCommand({ archive: customFmap, dir: customUnpacked });
    const customAfter = readAssetConfig(customUnpacked);
    if (!customAfter.audioAssets?.['audio/custom.mp3']) fail.push('audioAssets lost');
    if (!customAfter.pictureAssets?.['picture/custom.png']) fail.push('pictureAssets lost');

    // An engine entry must be usable with no local file.
    const engineName = entries.find(([, entry]) => entry.source === 'engine')?.[0];
    if (engineName && fs.existsSync(path.join(unpacked, 'assets', engineName))) {
      fs.rmSync(path.join(unpacked, 'assets', engineName));
    }
    const engineBuild = path.join(root, 'engine-build.fmap');
    await buildCommand({ root: unpacked, output: engineBuild });

    // A missing project asset must fail, not silently disappear.
    const projectEntry = entries.find(([, entry]) => entry.source === 'project');
    if (projectEntry) {
      const [projectName, projectMeta] = projectEntry;
      const isScript = projectMeta.type === 1 || projectMeta.type === 7;
      const projectFile = path.join(unpacked, isScript ? 'scripts' : 'assets', projectName);
      if (fs.existsSync(projectFile)) fs.rmSync(projectFile);
      await expectFailure('missing project asset', () => buildCommand({ root: unpacked, output: path.join(root, 'bad.fmap') }), 'missing project asset');
    }

    if (fail.length) throw new Error(`workspace mismatch: ${fail.join(', ')}`);
    process.stdout.write(`workspace checks passed: ${before.content.hash}\n`);
  } finally {
    if (!process.env.KEEP) fs.rmSync(root, { recursive: true, force: true });
    else process.stdout.write(`kept: ${root}\n`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
