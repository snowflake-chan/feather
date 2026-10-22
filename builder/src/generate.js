'use strict';

const fs = require('fs');
const path = require('path');
const { MuWriteStream } = require('@box/mudb/stream');
const { FileSystemContentServer } = require('@box/content-server/file-system-store-node');
const { BuildSystem } = require('@box/build-system/build-system');
const { storeProject, retrieveProject } = require('@box/build-system/project/project-serialize');
const { createDefaultPermissions } = require('@box/build-system/permissions/permission-init');
const { AssetEntryRDA, AssetType } = require('@box/schema/project/project-rda');
const { ExtraProjectInfoSchema } = require('@box/schema/project/hot-schema');
const { createDefaultProject } = require('../../engine/dist/src/project/project-init');

function logger() {
  return {
    info: (...args) => console.error(...args),
    warn: (...args) => console.error(...args),
    error: (...args) => console.error(...args),
    debug: () => {},
    create: () => logger(),
  };
}

function cache() {
  return {
    retrieve: async () => undefined,
    invalidate: async () => {},
    store: async (_name, _params, factory) => factory(),
  };
}

function copyBlockInfo(blobs) {
  const bundled = process.env.BOX_BUNDLED_CONTENT_PATH ||
    path.resolve(__dirname, '../../test-fixtures/blobs');
  const hash = 'QmW2E9E8ipYUifsCfkMj5SULYMYbFQvP6BQxo52atXw7Zj';
  const source = path.join(bundled, hash);
  if (!fs.existsSync(source)) throw new Error(`missing bundled block info: ${source}`);
  fs.mkdirSync(blobs, { recursive: true });
  const target = path.join(blobs, hash);
  if (!fs.existsSync(target)) fs.copyFileSync(source, target);
}

function assetEntry(hash, type) {
  const asset = AssetEntryRDA.stateSchema.alloc();
  asset.type = type;
  asset.hash = hash;
  asset.size = 0;
  asset.previewImage = '';
  asset.contentId = 0;
  asset.ownerId = 0;
  return asset;
}

function walk(root, dir) {
  const base = path.join(root, dir);
  if (!fs.existsSync(base) || !fs.statSync(base).isDirectory()) return [];
  const out = [];
  const visit = (current) => {
    for (const name of fs.readdirSync(current).sort()) {
      const full = path.join(current, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) visit(full);
      else if (stat.isFile()) out.push(full);
    }
  };
  visit(base);
  return out;
}

async function generateProject(workspace, dataRoot) {
  const source = path.resolve(workspace);
  const content = path.join(dataRoot, 'content');
  const blobs = path.join(content, 'blobs');
  fs.mkdirSync(blobs, { recursive: true });
  copyBlockInfo(blobs);

  const contentServer = new FileSystemContentServer(blobs);
  await contentServer.init();
  const log = logger();
  const bs = new BuildSystem(cache(), contentServer, contentServer, async () => [], log);

  // 官方 blank project：创建 terrain、默认资源、空入口脚本。
  const projectHash = await createDefaultProject({
    userId: 0,
    buildSystem: bs,
    logger: log,
    debugScripts: [],
    contentServer,
  });
  const { project } = await retrieveProject(bs, projectHash);

  const scripts = ['index.js', 'clientIndex.js'];
  for (const name of scripts) {
    const file = path.join(source, name);
    if (!fs.existsSync(file)) continue;
    const hash = await contentServer.store(fs.readFileSync(file));
    project.assets[name] = assetEntry(
      hash,
      name === 'clientIndex.js' ? AssetType.CLIENT_JS_SCRIPT : AssetType.JS_SCRIPT,
    );
    if (name === 'index.js') project.scriptIndex = name;
  }

  const extra = ExtraProjectInfoSchema.clone(ExtraProjectInfoSchema.identity);
  for (const file of walk(source, 'mesh')) {
    const logical = path.relative(source, file).split(path.sep).join('/');
    const hash = await contentServer.store(fs.readFileSync(file));
    project.assets[logical] = assetEntry(hash, AssetType.VOXEL_MODEL);
    extra.meshAssets[logical] = {
      modelId: 1,
      hash,
      modelPreviewHash: '',
      animated: false,
      updatedAt: '1970-01-01T00:00:00.000Z',
    };
  }
  for (const file of walk(source, 'audio')) {
    const logical = path.relative(source, file).split(path.sep).join('/');
    const hash = await contentServer.store(fs.readFileSync(file));
    project.audioAssets[logical] = {
      id: '',
      updateAt: 0,
      type: AssetType.AUDIO,
      hash,
      size: 0,
      previewImage: '',
    };
  }
  for (const file of walk(source, 'image')) {
    const logical = path.relative(source, file).split(path.sep).join('/');
    const hash = await contentServer.store(fs.readFileSync(file));
    project.pictureAssets[logical] = {
      id: '',
      updateAt: 0,
      type: AssetType.PICTURE,
      hash,
      size: 0,
      previewImage: '',
    };
  }

  const stored = await storeProject(bs, project);
  const permissionHash = await createDefaultPermissions({
    userId: 0,
    projectHash: stored.projectHash,
    contentServer,
    buildSystem: bs,
    logger: log,
  });
  const stream = new MuWriteStream(1);
  ExtraProjectInfoSchema.diff(ExtraProjectInfoSchema.identity, extra, stream);
  const extraProjectHash = await contentServer.store(stream.bytes());
  stream.destroy();

  fs.writeFileSync(
    path.join(content, 'project-state.json'),
    JSON.stringify({
      formatVersion: 1,
      permissionHash,
      extraProjectHash,
      updatedAt: '1970-01-01T00:00:00.000Z',
    }, null, 2) + '\n',
  );
  return { projectHash: stored.projectHash, permissionHash, extraProjectHash };
}

module.exports = { generateProject };
