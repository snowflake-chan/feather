import fs = require('fs');
import path = require('path');

import { MuReadStream, encodeUTF8 } from '@box/mudb/stream';
import { GoIPFSStore } from '@box/content-server/ipfs-http-store-node';
import { CachingContentServer } from '@box/content-server/caching-content-server';
import { ContentSplitter } from '@box/content-server/content-split';
import { ObjectStoreService } from '@box/content-server/object-store-service';
import { restoreVoxels, VoxelView } from '@box/utils/voxel';
import { getConfig } from '../../config/server';
import { ProjectRDA } from '@box/schema/project/project-rda';
import { storeProjectJSON } from '@box/build-system/project/project-serialize';
import { saveVoxelData } from '../../src/voxel/voxel-server';
import { BuildSystem } from '@box/build-system/build-system';
import { MockBuildCache } from '@box/build-system/build-cache-mock';
import { rootLogger } from '../../src/utils/logger';

function mapVoxels(outVoxels: VoxelView, table: number[]) {
  for (let i = 0; i < outVoxels.shape[0]; i++) {
    for (let j = 0; j < outVoxels.shape[1]; j++) {
      for (let k = 0; k < outVoxels.shape[2]; k++) {
        const d = outVoxels.getVoxel(i, j, k);
        if (d != 0) {
          outVoxels.setVoxel(i, j, k, table[d]);
        }
      }
    }
  }
}

function getVoxels(terrainEncodeData: number[], textureTableData: string) {
  const inp = new MuReadStream(new Uint8Array(terrainEncodeData));
  const mapping = JSON.parse(textureTableData);
  const outVoxels = restoreVoxels(inp).voxels;
  mapVoxels(outVoxels, mapping);
  return outVoxels;
}

async function generateTerrain(size?: [x: number, y: number, z: number]) {
  if (!size || !size[0] || !size[1] || !size[2]) {
    size = [128, 128, 128];
  }
  console.log('generating mapped voxels...', ...size);
  const terrain = [
    size[0],
    0,
    0,
    0,
    size[1],
    0,
    0,
    0,
    size[2],
    0,
    0,
    0,
    255,
    255,
    (size[0] + size[2]) / 2 - 1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
  ];
  const boxJsonPath = path.join(__dirname, './box.json');
  const outVoxels = getVoxels(terrain, fs.readFileSync(boxJsonPath).toString());
  console.log('creating content server...');
  const logger = rootLogger.child({ caller: 'generate-terrain' });
  const config = await getConfig();
  let nextUid = 1;
  const contentServer = new ContentSplitter(
    new CachingContentServer(
      logger,
      new GoIPFSStore({
        logger,
        uri: config.CONTENT_SERVER_URL || '',
        pin: true,
        maxConcurrency: config.MAX_CONTENT_SERVER_CONNECTIONS,
      }),
    ),
  );
  const ossContentServer = new ObjectStoreService({
    logger,
    uri:
      config.APP_EDITION === 'createra'
        ? config.CREATERA_BACKEND_SERVER_URL
        : config.MAAS_BACKEND_SERVER_URL,
    maxConcurrency: config.MAX_CONTENT_SERVER_CONNECTIONS,
    cdnPath: config.OSS_CDN_URL,
  });
  const buildCache = new MockBuildCache();
  const buildSystem = new BuildSystem(
    buildCache,
    contentServer,
    ossContentServer,
    async ({ num }) =>
      Array.from({ length: num }, () => `local-${nextUid++}`),
    logger,
    false,
  );
  const project = ProjectRDA.stateSchema.clone(ProjectRDA.stateSchema.identity);
  console.log('saving voxels...');
  const voxels = await saveVoxelData(contentServer, outVoxels);
  if (!voxels) {
    console.error('save voxeld failed.');
    process.exit(1);
    return;
  }
  project.voxels = voxels;

  const { lo, hi } = project.player.movementBounds;
  lo.x = -50;
  lo.y = -50;
  lo.z = -50;
  hi.x = voxels.shape.x + 50;
  hi.y = voxels.shape.y + 50;
  hi.z = voxels.shape.z + 50;

  const spawn = project.player.initialPosition;
  spawn.x = 0.5 * voxels.shape.x;
  spawn.y = voxels.shape.y + 25;
  spawn.z = 0.5 * voxels.shape.z;

  console.log('saving project...');
  const hash = (await storeProjectJSON(buildSystem, project)).projectHash;
  console.log('saved.');
  console.log(`HASH: ${hash}`);
}

try {
  const size = [
    Number(process.argv[2]),
    Number(process.argv[3]),
    Number(process.argv[4]),
  ];
  generateTerrain(size as any);
} catch (error) {
  console.error(error);
}
