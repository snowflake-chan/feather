'use strict';

const fs = require('fs');
const path = require('path');
const { FileSystemContentServer } = require('@box/content-server/file-system-store-node');
const { BuildSystem } = require('@box/build-system/build-system');
const { retrievePermissions } = require('@box/build-system/permissions/permission-serialize');
const { retrieveProject } = require('@box/build-system/project/project-serialize');
const { ProjectRDA } = require('@box/schema/project/project-rda');
const { PermissionRDA } = require('@box/schema/permissions/permission-rda');
const { LUT_RES } = require('../../engine/dist/src/assets/lut');
const { WEATHER_RES } = require('../../engine/dist/src/assets/weather');
const { DEFAULT_SOUNDS_RES } = require('../../engine/dist/src/assets/default_sounds');

const ENGINE_ASSET_HASHES = new Set([
  ...Object.values(LUT_RES.lut || {}),
  ...Object.values(LUT_RES.preview || {}),
  ...Object.values(WEATHER_RES || {}),
  ...Object.values(DEFAULT_SOUNDS_RES || {}),
]);
function assetSource(entry) {
  return entry && ENGINE_ASSET_HASHES.has(entry.hash) ? 'engine' : 'project';
}

const CHUNK_SIZE = 32;

function logger() {
  return { info() {}, warn() {}, error() {}, debug() {}, create() { return logger(); } };
}
function cache() {
  return { retrieve: async () => undefined, invalidate: async () => {}, store: async (_n, _p, f) => f() };
}
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
async function readContent(contentServer, hash) {
  let bytes = await contentServer.retrieve(hash);
  if (!bytes && hash.includes('.')) {
    bytes = await contentServer.retrieve(hash.slice(0, hash.indexOf('.')));
  }
  return bytes;
}
function safeAssetPath(root, logical) {
  const file = path.resolve(root, logical);
  const rel = path.relative(root, file);
  if (rel.startsWith('..') || path.isAbsolute(rel)) throw new Error(`unsafe asset path: ${logical}`);
  return file;
}

async function openGraph(blobs) {
  const contentServer = new FileSystemContentServer(blobs);
  await contentServer.init();
  const bs = new BuildSystem(cache(), contentServer, contentServer, async () => [], logger());
  return { contentServer, bs };
}

async function readProjectGraph(contentDir) {
  const state = JSON.parse(fs.readFileSync(path.join(contentDir, 'project-state.json'), 'utf8'));
  const { bs, contentServer } = await openGraph(path.join(contentDir, 'blobs'));
  const permissions = await retrievePermissions(bs, state.permissionHash);
  const branch = permissions.permissions.versionControl.branches[
    permissions.permissions.versionControl.currentBranch || 'master'
  ];
  if (!branch?.headHash) throw new Error('permissions has no project head');
  const project = await retrieveProject(bs, branch.headHash);
  return { state, bs, contentServer, permissions: permissions.permissions, project: project.project };
}

/** Expand an official project-state + blobs into the named workspace layout. */
async function unpackWorkspace(contentDir, target, meta) {
  const { bs, contentServer, permissions, project } = await readProjectGraph(contentDir);
  const raw = ProjectRDA.stateSchema.toJSON(project);
  if (meta.name) raw.info.displayName = meta.name;
  const permissionRaw = PermissionRDA.stateSchema.toJSON(permissions);
  const projectDir = path.join(target, 'project');
  fs.mkdirSync(projectDir, { recursive: true });

  for (const key of [
    'info', 'environment', 'player', 'physics', 'collisionFilter', 'zones',
    'gamepad', 'ambientSound', 'features',
  ]) {
    writeJson(path.join(projectDir, `${key === 'collisionFilter' ? 'collision-filter' : key === 'ambientSound' ? 'ambient-sound' : key}.json`), raw[key]);
  }
  writeJson(path.join(projectDir, 'permissions.json'), permissionRaw);
  writeJson(path.join(projectDir, 'ui.json'), { defaultScreenId: raw.defaultScreenId });
  const assetsJson = {
    version: 1,
    assets: Object.fromEntries(Object.entries(raw.assets || {}).map(([key, entry]) => [key, { ...entry, source: assetSource(entry) }])),
    audioAssets: Object.fromEntries(Object.entries(raw.audioAssets || {}).map(([key, entry]) => [key, { ...entry, source: assetSource(entry) }])),
    pictureAssets: Object.fromEntries(Object.entries(raw.pictureAssets || {}).map(([key, entry]) => [key, { ...entry, source: assetSource(entry) }])),
    deleteAssets: raw.deleteAssets || [],
    scriptIndex: raw.scriptIndex || 'index.js',
  };
  writeJson(path.join(projectDir, 'assets.json'), assetsJson);
  for (const [id, node] of Object.entries(raw.entitiesTree || {})) {
    writeJson(safeAssetPath(path.join(projectDir, 'entities'), `${id}.json`), node);
  }
  for (const [id, node] of Object.entries(raw.uiTree || {})) {
    writeJson(safeAssetPath(path.join(projectDir, 'ui'), `${id}.json`), node);
  }

  const chunksDir = path.join(target, 'chunks');
  fs.mkdirSync(chunksDir, { recursive: true });
  const nx = raw.voxels.shape.x / CHUNK_SIZE;
  const ny = raw.voxels.shape.y / CHUNK_SIZE;
  let index = 0;
  for (let z = 0; z < raw.voxels.shape.z / CHUNK_SIZE; z++) {
    for (let y = 0; y < raw.voxels.shape.y / CHUNK_SIZE; y++) {
      for (let x = 0; x < nx; x++) {
        const hash = raw.voxels.chunks[index++];
        const bytes = await readContent(contentServer, hash);
        if (!bytes) throw new Error(`missing chunk: ${hash}`);
        fs.writeFileSync(path.join(chunksDir, `${x},${y},${z}.bin`), bytes);
      }
    }
  }

  const scriptsDir = path.join(target, 'scripts');
  const assetsDir = path.join(target, 'assets');
  fs.mkdirSync(scriptsDir, { recursive: true });
  fs.mkdirSync(assetsDir, { recursive: true });
  const allAssets = { ...(raw.assets || {}), ...(raw.audioAssets || {}), ...(raw.pictureAssets || {}) };
  for (const [logical, entry] of Object.entries(allAssets)) {
    if (!entry?.hash) continue;
    if (assetSource(entry) === 'engine') continue;
    const isScript = entry.type === 1 || entry.type === 7;
    const file = safeAssetPath(isScript ? scriptsDir : assetsDir, logical);
    const bytes = await readContent(contentServer, entry.hash);
    if (!bytes) throw new Error(`missing project asset: ${logical}`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
  }

  const id = meta.id;
  const version = meta.version || raw.info?.version || '1.0.0';
  const toml = [
    'schema_version = 1', '',
    '[project]', `id = ${JSON.stringify(id)}`, `version = ${JSON.stringify(version)}`, '',
    '[build]', 'kind = "baked"', `output = "dist/${id}.fmap"`, '',
    ...(meta.volume ? ['[storage]', `volume = ${JSON.stringify(meta.volume)}`, ''] : []),
    '[runtime]',
    `port = ${Number(meta.runtime?.port) || 0}`,
    `memoryMb = ${typeof meta.runtime?.memoryMb === 'number' ? meta.runtime.memoryMb : 512}`,
    `playerLimit = ${typeof meta.runtime?.playerLimit === 'number' ? meta.runtime.playerLimit : 32}`,
    '',
  ].join('\n');
  fs.writeFileSync(path.join(target, 'feather.toml'), toml);
  return { map: id, projectDir };
}

module.exports = { readProjectGraph, unpackWorkspace };

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function assetType(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.js') return path.basename(file) === 'clientIndex.js' ? 7 : 1;
  if (ext === '.vb') return 2;
  if (ext === '.lut') return 3;
  if (ext === '.part') return 4;
  if (ext === '.mp3') return 6;
  return 5;
}
function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const visit = (current) => {
    for (const name of fs.readdirSync(current).sort()) {
      const full = path.join(current, name);
      if (fs.statSync(full).isDirectory()) visit(full);
      else if (fs.statSync(full).isFile()) out.push(full);
    }
  };
  visit(dir);
  return out;
}

/** Assemble a named `project/` + `chunks/` + `assets/` workspace into content/. */
async function buildBakedWorkspace(workspace, contentDir) {
  const blobs = path.join(contentDir, 'blobs');
  fs.mkdirSync(blobs, { recursive: true });
  const contentServer = new FileSystemContentServer(blobs);
  await contentServer.init();
  const bs = new BuildSystem(cache(), contentServer, contentServer, async () => [], logger());
  const projectDir = path.join(workspace, 'project');
  const raw = {};
  for (const [file, key] of [
    ['info.json', 'info'],
    ['environment.json', 'environment'],
    ['player.json', 'player'],
    ['physics.json', 'physics'],
    ['collision-filter.json', 'collisionFilter'],
    ['zones.json', 'zones'],
    ['gamepad.json', 'gamepad'],
    ['ambient-sound.json', 'ambientSound'],
    ['features.json', 'features'],
  ]) {
    raw[key] = readJson(path.join(projectDir, file));
  }
  const uiConfig = readJson(path.join(projectDir, 'ui.json'));
  raw.defaultScreenId = uiConfig.defaultScreenId;
  raw.entitiesTree = {};
  for (const file of walkFiles(path.join(projectDir, 'entities'))) {
    raw.entitiesTree[path.basename(file, '.json')] = readJson(file);
  }
  raw.uiTree = {};
  for (const file of walkFiles(path.join(projectDir, 'ui'))) {
    raw.uiTree[path.basename(file, '.json')] = readJson(file);
  }

  const chunkFiles = walkFiles(path.join(workspace, 'chunks'));
  if (chunkFiles.length === 0) throw new Error('workspace has no chunks/*.bin');
  let maxX = 0, maxY = 0, maxZ = 0;
  const chunkByCoord = new Map();
  for (const file of chunkFiles) {
    const match = path.basename(file).match(/^(\d+),(\d+),(\d+)\.bin$/);
    if (!match) throw new Error(`invalid chunk file: ${file}`);
    const [x, y, z] = [Number(match[1]), Number(match[2]), Number(match[3])];
    maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); maxZ = Math.max(maxZ, z);
    chunkByCoord.set(`${x},${y},${z}`, file);
  }
  const nx = maxX + 1, ny = maxY + 1, nz = maxZ + 1;
  const chunks = [];
  for (let z = 0; z < nz; z++) {
    for (let y = 0; y < ny; y++) {
      for (let x = 0; x < nx; x++) {
        const file = chunkByCoord.get(`${x},${y},${z}`);
        if (!file) throw new Error(`missing chunk: ${x},${y},${z}`);
        chunks.push(await contentServer.store(fs.readFileSync(file)));
      }
    }
  }
  raw.voxels = { shape: { x: nx * CHUNK_SIZE, y: ny * CHUNK_SIZE, z: nz * CHUNK_SIZE }, chunks };

  const readOptional = (name, fallback) => {
    const file = path.join(projectDir, name);
    return fs.existsSync(file) ? readJson(file) : fallback;
  };
  const assetsConfig = readOptional('assets.json', undefined);
  raw.deleteAssets = assetsConfig ? assetsConfig.deleteAssets || [] : [];
  raw.scriptIndex = assetsConfig ? assetsConfig.scriptIndex || 'index.js' : '';
  raw.assets = {};
  raw.audioAssets = {};
  raw.pictureAssets = {};

  if (assetsConfig) {
    const loadEntry = async (logical, entry, root) => {
      if (entry.source === 'engine') {
        const clean = { ...entry };
        delete clean.source;
        return clean;
      }
      const file = path.join(root, logical);
      if (!fs.existsSync(file)) throw new Error(`missing project asset: ${logical}`);
      const bytes = fs.readFileSync(file);
      const base = String(entry.hash || '').split('.')[0];
      let storedHash = await contentServer.store(bytes);
      const actual = storedHash;
      if (base && actual !== base) {
        throw new Error(`asset hash mismatch: ${logical}`);
      }
      if (entry.hash && entry.hash.includes('.')) storedHash += entry.hash.slice(entry.hash.indexOf('.'));
      const clean = { ...entry, hash: storedHash, size: typeof entry.size === 'number' ? entry.size : bytes.length };
      delete clean.source;
      return clean;
    };
    for (const [logical, entry] of Object.entries(assetsConfig.assets || {})) {
      const isScript = entry.type === 1 || entry.type === 7;
      raw.assets[logical] = await loadEntry(logical, entry, isScript ? path.join(workspace, 'scripts') : path.join(workspace, 'assets'));
    }
    for (const [logical, entry] of Object.entries(assetsConfig.audioAssets || {})) {
      raw.audioAssets[logical] = await loadEntry(logical, entry, path.join(workspace, 'assets'));
    }
    for (const [logical, entry] of Object.entries(assetsConfig.pictureAssets || {})) {
      raw.pictureAssets[logical] = await loadEntry(logical, entry, path.join(workspace, 'assets'));
    }
  } else {
    const assetRoots = [
      [path.join(workspace, 'assets'), ''],
      [path.join(workspace, 'scripts'), ''],
    ];
    for (const [root] of assetRoots) {
      for (const file of walkFiles(root)) {
        const logical = path.relative(root, file).split(path.sep).join('/');
        const bytes = fs.readFileSync(file);
        raw.assets[logical] = {
          ownerId: 0,
          contentId: 0,
          size: bytes.length,
          type: assetType(file),
          animated: false,
          bounds: [0, 0, 0],
          hash: await contentServer.store(bytes),
          previewImage: '',
        };
      }
    }
    raw.scriptIndex = fs.existsSync(path.join(workspace, 'scripts', 'index.js')) ? 'index.js' : '';
  }

  raw.type = 'project';
  raw.version = '0.3.31';
  raw.prevHash = '';
  raw.timestamp = '1970-01-01T00:00:00.000Z';
  raw.storageMode = 'sqlite';
  raw.committerId = 0;

  const permissionRaw = readJson(path.join(projectDir, 'permissions.json'));
  const permissions = PermissionRDA.stateSchema.fromJSON(permissionRaw);
  const project = ProjectRDA.stateSchema.fromJSON(raw);
  const stored = await require('@box/build-system/project/project-serialize').storeProject(bs, project);
  const branchName = permissions.versionControl.currentBranch || 'master';
  if (permissions.versionControl.branches[branchName]) {
    permissions.versionControl.branches[branchName].headHash = stored.projectHash;
  }
  const permissionHash = await require('@box/build-system/permissions/permission-serialize').storePermissions(bs, permissions);
  writeJson(path.join(contentDir, 'project-state.json'), {
    formatVersion: 1,
    permissionHash,
    extraProjectHash: '',
    updatedAt: '1970-01-01T00:00:00.000Z',
  });
  return { projectHash: stored.projectHash, permissionHash };
}

module.exports = { readProjectGraph, unpackWorkspace, buildBakedWorkspace };
