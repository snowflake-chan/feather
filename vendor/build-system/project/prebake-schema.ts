import { MuArray, MuASCII, MuBytes, MuStruct } from '@box/mudb/schema';
import { ProjectRDA } from '@box/schema/project/project-rda';
import {
  ExtraProjectInfoSchema,
  HotProjectSchema,
} from '@box/schema/project/hot-schema';
import { PermissionRDA } from '@box/schema/permissions/permission-rda';

export const PrebakeCacheSchema = new MuStruct({
  voxelBytes: new MuArray(new MuBytes(), Infinity),
  hotProject: HotProjectSchema,
  coldProject: ProjectRDA.stateSchema,
  permissions: PermissionRDA.stateSchema,
  extraProjectInfo: ExtraProjectInfoSchema,
  permissionsHash: new MuASCII(),
  projectHash: new MuASCII(),
});

export type PrebakeCache = typeof PrebakeCacheSchema.identity;
