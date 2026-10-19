import { ProjectBakeCache } from '../project/bake';
import { MuReadStream, MuWriteStream } from '@box/mudb/stream';
import { PrebakeCacheSchema } from '../project/prebake-schema';
import {
  HotProjectSchema,
  ExtraProjectInfoSchema,
} from '@box/schema/project/hot-schema';
import {
  PermissionRDA,
  PermissionsSchema,
} from '@box/schema/permissions/permission-rda';
import { ProjectRDA } from '@box/schema/project/project-rda';
import { ContentServer } from '@box/content-server';
import { retrievePermissions } from '../permissions/permission-serialize';
import {
  retrieveProject,
  updateProjectByHotProject,
} from '../project/project-serialize';
import { createDefaultPermissions } from '../permissions/permission-init';
import { BuildSystemAPI } from '../type';
import { RetrievedGroupProjectMetaData } from '../group-project';

async function preloadHashes(content: ContentServer, hashes: string[]) {
  const chunks: Promise<Uint8Array | undefined>[] = new Array(hashes.length);
  for (let i = 0; i < hashes.length; ++i) {
    chunks[i] = content.retrieve(hashes[i]);
  }
  const bytes: Uint8Array[] = new Array(hashes.length);
  for (let i = 0; i < chunks.length; ++i) {
    const b = await chunks[i];
    if (!b) {
      // Imported projects can reference an asset that is no longer present in
      // the local content store. Keep the chunk slot so voxel indices remain
      // aligned, but treat the missing chunk as empty instead of aborting the
      // whole map startup.
      console.warn(`missing content hash ${hashes[i]}, using an empty chunk`);
      bytes[i] = new Uint8Array();
      continue;
    }
    bytes[i] = b;
  }
  return bytes;
}

export async function prebakeMap(
  bs: BuildSystemAPI,
  hash: string,
  blockInfoHash: string,
  hotVersion: string,
  permissionVersion: string,
  projectVersion: string,
  extraProjectHash: string,
  groupProjectMetaData?: RetrievedGroupProjectMetaData,
  dataFromBackend?: RetrievedGroupProjectMetaData[],
) {
  // check versions
  if (
    hotVersion !== HotProjectSchema.identity.version ||
    permissionVersion !== PermissionRDA.stateSchema.identity.version ||
    projectVersion !== ProjectRDA.stateSchema.identity.version
  ) {
    throw new Error(
      `Versions(hotVersion, permissionVersion, projectVersion) do not match, expected (${HotProjectSchema.identity.version}, ${PermissionRDA.stateSchema.identity.version}, ${ProjectRDA.stateSchema.identity.version} but got ${hotVersion}, ${permissionVersion} ${projectVersion}).`,
    );
  }
  // Legacy code: If we get an old project, we need to create permissions for it
  // In old versions we only stored project hashes without permission info, so need to apply the migration here
  // Unfortunately this means we need to fetch the hash twice when prebaking the project at start up.
  const json = await bs.retrieveJSON(hash);
  if (!(json.type === 'permission' || json.type === 'permissions')) {
    bs.logger.info('invalid project type ' + json.type + ' initiating prebake');
    return await prebakeMap(
      bs,
      await createDefaultPermissions({
        userId: 0,
        projectHash: hash,
        contentServer: (<any>bs).contentServer,
        buildSystem: bs,
        logger: bs.logger,
      }),
      blockInfoHash,
      hotVersion,
      permissionVersion,
      projectVersion,
      extraProjectHash,
      groupProjectMetaData,
      dataFromBackend,
    );
  }

  const permissionInfo = await retrievePermissions(bs, hash);
  const bakeCache = new ProjectBakeCache(
    (<any>bs).contentServer,
    bs,
    blockInfoHash,
  );
  try {
    const projectHash = await bs.build(
      'migrateGroupProject',
      permissionInfo.permissions.versionControl.branches['master'].headHash,
      groupProjectMetaData,
      dataFromBackend,
      projectVersion,
    );

    const projectInfo = await retrieveProject(bs, projectHash);

    bs.logger.info('Project retrieved.');

    const extraProjectBytes = await bs.retrieveContent(extraProjectHash);

    bs.logger.info('Extra project retrieved.');

    let extraProject: typeof ExtraProjectInfoSchema.identity;
    if (extraProjectBytes.length === 0) {
      extraProject = ExtraProjectInfoSchema.clone(
        ExtraProjectInfoSchema.identity,
      );
    } else {
      extraProject = ExtraProjectInfoSchema.patch(
        ExtraProjectInfoSchema.identity,
        new MuReadStream(extraProjectBytes),
      );
    }

    try {
      // preload all voxels
      const voxelsPromise = preloadHashes(
        (<any>bs).contentServer,
        projectInfo.project.voxels.chunks,
      );
      bs.logger.info('Voxels preload task created.');
      const hotProjectPromise = bakeCache.bake(
        projectInfo.project,
        extraProject,
        HotProjectSchema.clone(HotProjectSchema.identity),
      );
      bs.logger.info('Hot project bake task created.');
      const voxels = await voxelsPromise;
      bs.logger.info('Voxels preloaded.');
      if (!voxels) {
        throw new Error('error loading voxels');
      }
      const hotProject = await hotProjectPromise;
      bs.logger.info('Hot project baked.');

      await updateProjectByHotProject(projectInfo, bs, hotProject);

      bs.logger.info(`new projectHash in prebake cache = ${projectInfo.hash}`);
      try {
        const stream = new MuWriteStream(1 << 20);
        PrebakeCacheSchema.diff(
          PrebakeCacheSchema.identity,
          {
            voxelBytes: voxels,
            permissions: permissionInfo.permissions,
            permissionsHash: permissionInfo.hash,
            projectHash: projectInfo.hash,
            coldProject: projectInfo.project,
            hotProject,
            extraProjectInfo: extraProject,
          },
          stream,
        );
        try {
          return await bs.storeContent(stream.bytes());
        } finally {
          stream.destroy();
        }
      } finally {
        HotProjectSchema.free(hotProject);
      }
    } finally {
      ProjectRDA.stateSchema.free(projectInfo.project);
      ExtraProjectInfoSchema.free(extraProject);
    }
  } finally {
    PermissionsSchema.free(permissionInfo.permissions);
    bakeCache.destroy();
  }
}
