import * as buildUtils from './tasks/utils';
import * as imageProcess from './tasks/image-process';
import * as thumbnail from './tasks/thumbnail';
import * as buildResource from './tasks/build-resource';
import * as optimize from './tasks/optimize';
import * as importProject from './tasks/import-project';
import * as prebake from './tasks/prebake';
import * as buildTextures from './tasks/texture';
import * as buildSkin from './tasks/build-skin';
import * as buildVoxel from './tasks/build-voxel';
import * as migrateVoxel from './tasks/migrate-voxel';
import * as migrateSkin from './tasks/migrate-skin';
import * as voxelBounds from './tasks/voxel-bounds';
import * as audioProcess from './tasks/audio-process';
import * as buildAnim from './tasks/build-anim';
import * as buildBloomFilter from './tasks/build-bloom-filter';
import * as chineseHoliday from './tasks/chinese-holiday';
import * as migrateProject from './tasks/migrate-project';
import { migrationTasks } from './tasks/migrations/migration-index';

export const tasks = {
  ...migrationTasks,
  ...migrateProject,
  ...buildUtils,
  ...buildResource,
  ...optimize,
  ...imageProcess,
  ...thumbnail,
  ...importProject,
  ...prebake,
  ...buildTextures,
  ...buildSkin,
  ...buildVoxel,
  ...migrateVoxel,
  ...migrateSkin,
  ...voxelBounds,
  ...audioProcess,
  ...buildAnim,
  ...buildBloomFilter,
  ...chineseHoliday,
};
