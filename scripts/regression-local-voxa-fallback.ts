import assert from 'assert';
import { once } from 'events';
import { createServer } from 'http';

import { createLocalContentWithVoxa } from '../src/content/local-content-with-voxa';
import {
  getLocalExtraProject,
  mergeExtraProjectInfo,
} from '../src/project/project-extra';
import { ExtraProjectInfoSchema } from '@box/schema/project/hot-schema';

const validModelHash = 'QmSKfrPgmkCoomW2tbpHkynGL5aCd4qRA2JSBG1QDhRJzJ';

async function checkAllLocalVoxaAssetsAreVisible() {
  const previousPermissionSecret = process.env.PERMISSION_TOKEN_SECRET;
  process.env.PERMISSION_TOKEN_SECRET = 'local-voxa-regression-secret';
  const models = [
    {
      modelId: 1,
      modelName: 'Private model',
      modelType: 0,
      creativeMode: 1,
      modelFileHash: validModelHash,
      modelPreviewHash: 'private-model-preview',
      animated: false,
      updatedAt: '2026-08-18T00:00:00.000Z',
    },
    {
      modelId: 2,
      modelName: 'Private skin',
      modelType: 0,
      creativeMode: 2,
      modelFileHash: 'private-skin-hash',
    },
    {
      modelId: 3,
      modelName: 'Extension skin',
      modelType: 3,
      creativeMode: 2,
      modelFileHash: 'extension-skin-hash',
    },
  ];
  const server = createServer((request, response) => {
    const url = new URL(request.url || '/', 'http://127.0.0.1');
    response.setHeader('content-type', 'application/json');
    if (request.headers.authorization !== 'Bearer local-voxa-regression-secret') {
      response.statusCode = 401;
      response.end(JSON.stringify({ code: 'AUTH_REQUIRED' }));
      return;
    }
    if (url.pathname === '/api/local/default-skin') {
      response.end('{}');
      return;
    }
    const modelType = url.searchParams.get('modelType');
    const creativeMode = url.searchParams.get('creativeMode');
    const rows = models.filter(
      (model) =>
        (modelType === null || model.modelType === Number(modelType)) &&
        (creativeMode === null || model.creativeMode === Number(creativeMode)),
    );
    response.end(JSON.stringify({ rows, count: rows.length }));
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const extra = await getLocalExtraProject(
      `http://127.0.0.1:${address.port}`,
      0,
      { info: () => undefined, error: () => undefined } as never,
    );
    assert.equal(
      Object.keys(extra.meshAssets).length,
      1,
      'all locally owned VOXA models must be visible in Creator regardless of modelType',
    );
    assert.equal(
      Object.keys(extra.skinAssets).length,
      2,
      'all locally owned VOXA skins must be visible in Creator regardless of modelType',
    );
  } finally {
    server.close();
    await once(server, 'close');
    if (previousPermissionSecret === undefined) delete process.env.PERMISSION_TOKEN_SECRET;
    else process.env.PERMISSION_TOKEN_SECRET = previousPermissionSecret;
  }
  console.log('PASS: Creator includes every local VOXA model and skin');
}

async function main() {
  await checkAllLocalVoxaAssetsAreVisible();
  const expected = Buffer.from('voxa-model-bytes');
  const bundledRuntime = Buffer.from('bundled-block-info');
  const local = {
    init: async () => undefined,
    store: async () => 'QmStored',
    retrieve: async () => undefined,
  };
  const bundled = {
    init: async () => undefined,
    store: async () => 'QmSharedStored',
    retrieve: async (hash: string) =>
      hash === 'QmBundledRuntime' ? bundledRuntime : undefined,
  };
  const logger = { debug: () => undefined };
  let requestedHash = '';
  const content = createLocalContentWithVoxa(
    local,
    logger,
    'http://voxa.test',
    async (hash) => {
      requestedHash = hash;
      return expected;
    },
    bundled,
  );

  assert.deepEqual(
    Buffer.from(await content.retrieve('QmBundledRuntime') || []),
    bundledRuntime,
  );
  assert.equal(
    requestedHash,
    '',
    'bundled runtime content must be read before the remote VOXA fallback',
  );
  console.log('PASS: project content reads fall back to bundled runtime blobs');

  assert.deepEqual(Buffer.from(await content.retrieve('QmMissingLocally') || []), expected);
  assert.equal(requestedHash, 'QmMissingLocally');
  console.log('PASS: local OSS reads fall back to VOXA blobs');

  const packaged = ExtraProjectInfoSchema.clone(ExtraProjectInfoSchema.identity);
  packaged.meshAssets['mesh/cloud.vb'] = {
    modelId: 1,
    hash: validModelHash,
    modelPreviewHash: '',
    animated: false,
    updatedAt: '',
  };
  packaged.scriptAssets.cloud = {
    id: 'cloud',
    hash: 'cloud-script',
    name: 'cloud',
    isClient: false,
    isShare: true,
    order: 1,
    lockedMapTitle: '',
    lockedMapId: 0,
  };
  const shared = ExtraProjectInfoSchema.clone(ExtraProjectInfoSchema.identity);
  shared.meshAssets['mesh/local.vb'] = {
    modelId: 2,
    hash: validModelHash,
    modelPreviewHash: '',
    animated: false,
    updatedAt: '',
  };
  const merged = mergeExtraProjectInfo(packaged, shared);
  assert.equal(merged.meshAssets['mesh/cloud.vb'].hash, validModelHash);
  assert.equal(merged.meshAssets['mesh/local.vb'].hash, validModelHash);
  assert.equal(merged.scriptAssets.cloud.hash, 'cloud-script');
  shared.scriptAssets.stale = {
    ...packaged.scriptAssets.cloud,
    id: 'stale',
    name: 'stale.js',
  };
  const afterGroupUnshare = mergeExtraProjectInfo(
    ExtraProjectInfoSchema.clone(ExtraProjectInfoSchema.identity),
    shared,
  );
  assert.equal(
    afterGroupUnshare.scriptAssets.stale,
    undefined,
    'VOXA refresh must not resurrect a script removed from the group snapshot',
  );
  delete shared.scriptAssets.stale;
  console.log('PASS: imported extraProject keeps cloud assets and adds the shared local library');

  packaged.meshAssets['mesh/New-model__local_2.vb'] = {
    modelId: 2,
    hash: validModelHash,
    modelPreviewHash: '',
    animated: false,
    updatedAt: '',
  };
  packaged.meshAssets['mesh/cloud-id-collision.vb'] = {
    modelId: 2,
    hash: validModelHash,
    modelPreviewHash: '',
    animated: false,
    updatedAt: '',
  };
  shared.meshAssets['mesh/Renamed__local_2.vb'] = {
    modelId: 2,
    hash: validModelHash,
    modelPreviewHash: '',
    animated: false,
    updatedAt: '',
  };
  const renamed = mergeExtraProjectInfo(packaged, shared);
  assert.equal(
    renamed.meshAssets['mesh/New-model__local_2.vb'],
    undefined,
    'stale local aliases must not survive a VOXA rename',
  );
  assert.equal(
    renamed.meshAssets['mesh/Renamed__local_2.vb'].hash,
    validModelHash,
  );
  assert.equal(
    renamed.meshAssets['mesh/cloud-id-collision.vb'].hash,
    validModelHash,
    'ordinary packaged assets must survive a modelId collision',
  );
  console.log('PASS: VOXA rename removes only stale local aliases');

  const deletedLocalPath = 'mesh/Renamed__local_2.vb';
  const afterDeleteRefresh = mergeExtraProjectInfo(
    renamed,
    shared,
    new Set([deletedLocalPath]),
  );
  assert.equal(
    afterDeleteRefresh.meshAssets[deletedLocalPath],
    undefined,
    'a deleted local-derived project model must not be re-injected by VOXA refresh',
  );
  assert.equal(
    afterDeleteRefresh.meshAssets['mesh/cloud-id-collision.vb'].hash,
    validModelHash,
    'a project-model tombstone must only exclude its exact mesh path',
  );
  console.log('PASS: deleted project models stay deleted across VOXA refresh');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
