import { HotProject } from '@box/schema/project/hot-schema';
import { buildMigrate } from '../migrations';
import { BuildSystemAPI } from '../type';
import {
  AssetType,
  GroupProjectMetaData,
  ProjectInfo,
  ProjectRDA,
} from '@box/schema/project/project-rda';

const CURRENT_VERSION = ProjectRDA.stateSchema.identity.version;

export interface StoreProjectRes {
  projectHash: string;
  groupProjectMetaData: GroupProjectMetaData;
}

export async function storeProjectJSON(
  bs: BuildSystemAPI,
  rawJSON: any,
): Promise<StoreProjectRes> {
  // split assets into scripts and everything else
  const assets: any = {};
  const scriptAssets: any = {};
  const keys = Object.keys(rawJSON.assets);
  keys.sort();
  for (let i = 0; i < keys.length; ++i) {
    const path = keys[i];
    const asset = rawJSON.assets[path];
    if (
      asset.type === AssetType.JS_SCRIPT ||
      asset.type === AssetType.CLIENT_JS_SCRIPT
    ) {
      scriptAssets[path] = asset;
    } else {
      assets[path] = asset;
    }
  }

  const [
    infoHash,
    entitiesTreeHash,
    assetsHash,
    scriptAssetsHash,
    deleteAssetsHash,
    voxelsHash,
    playerHash,
    environmentHash,
    physicsHash,
    ambientSoundHash,
    zonesHash,
    gamepadHash,
    uiTree,
    audioAssets,
    pictureAssets,
  ] = await Promise.all([
    bs.storeJSON(rawJSON.info),
    bs.storeJSON(rawJSON.entitiesTree),
    bs.storeJSON(assets),
    bs.storeJSON(scriptAssets),
    bs.storeJSON(rawJSON.deleteAssets),
    bs.storeJSON(rawJSON.voxels),
    bs.storeJSON(rawJSON.player),
    bs.storeJSON(rawJSON.environment),
    bs.storeJSON(rawJSON.physics),
    bs.storeJSON(rawJSON.ambientSound),
    bs.storeJSON(rawJSON.zones || []),
    bs.storeJSON(rawJSON.gamepad),
    bs.storeJSON(rawJSON.uiTree),
    bs.storeJSON(rawJSON.audioAssets),
    bs.storeJSON(rawJSON.pictureAssets),
  ]);

  rawJSON.info = infoHash;
  rawJSON.entitiesTree = entitiesTreeHash;
  rawJSON.assets = assetsHash;
  rawJSON.scriptAssets = scriptAssetsHash;
  rawJSON.deleteAssets = deleteAssetsHash;
  rawJSON.voxels = voxelsHash;
  rawJSON.player = playerHash;
  rawJSON.environment = environmentHash;
  rawJSON.physics = physicsHash;
  rawJSON.ambientSound = ambientSoundHash;
  rawJSON.zones = zonesHash;
  rawJSON.gamepad = gamepadHash;
  rawJSON.uiTree = uiTree;
  rawJSON.audioAssets = audioAssets;
  rawJSON.pictureAssets = pictureAssets;

  const projectHash = await bs.storeJSON(rawJSON);

  return {
    projectHash,
    groupProjectMetaData: {
      version: rawJSON.version,
      hashes: {
        uiTree: uiTree,
        audioAssets: audioAssets,
        pictureAssets: pictureAssets,
      },
    },
  };
}

export async function storeProject(bs: BuildSystemAPI, project: ProjectInfo) {
  return storeProjectJSON(bs, ProjectRDA.stateSchema.toJSON(project));
}

export async function retrieveProject(
  bs: BuildSystemAPI,
  hash: string,
): Promise<{ hash: string; project: ProjectInfo }> {
  const rawJSON = await bs.retrieveJSON(hash);
  if (rawJSON.type !== 'project') {
    throw new Error(
      'invalid project hash: ' +
        hash +
        '.  expected type "project", got ' +
        rawJSON.type,
    );
  }
  if (rawJSON.version !== CURRENT_VERSION) {
    // run a migration
    bs.logger.info(
      `project ${hash} is an older version (${rawJSON.version}), migrating to latest project ${CURRENT_VERSION}`,
    );
    const nextHash = await buildMigrate(
      bs,
      bs.logger,
      'project',
      rawJSON.version,
      CURRENT_VERSION,
      hash,
    );
    if (!nextHash) {
      throw new Error(
        `error migrating project ${hash} from ${rawJSON.version} to ${CURRENT_VERSION}.  DID YOU REMEMBER TO WRITE A MIGRATION IN src/build/migrations/ ????  DID YOU???????????`,
      );
    }
    bs.logger.info(
      `successfully migrated project ${hash} from ${rawJSON.version} to ${CURRENT_VERSION}.  new hash = ${nextHash}`,
    );
    return retrieveProject(bs, nextHash);
  }

  // load all the subresources
  const [
    info,
    entitiesTree,
    assets,
    scriptAssets,
    deleteAssets,
    voxels,
    player,
    environment,
    physics,
    ambientSound,
    zones,
    gamepad,
    uiTree,
    audioAssets,
    pictureAssets,
  ] = await Promise.all([
    bs.retrieveJSON(rawJSON.info),
    bs.retrieveJSON(rawJSON.entitiesTree),
    bs.retrieveJSON(rawJSON.assets),
    bs.retrieveJSON(rawJSON.scriptAssets),
    bs.retrieveJSON(rawJSON.deleteAssets),
    bs.retrieveJSON(rawJSON.voxels),
    bs.retrieveJSON(rawJSON.player),
    bs.retrieveJSON(rawJSON.environment),
    bs.retrieveJSON(rawJSON.physics),
    bs.retrieveJSON(rawJSON.ambientSound),
    bs.retrieveJSON(rawJSON.zones),
    bs.retrieveJSON(rawJSON.gamepad),
    rawJSON.uiTree ? bs.retrieveJSON(rawJSON.uiTree) : undefined,
    rawJSON.audioAssets ? bs.retrieveJSON(rawJSON.audioAssets) : undefined,
    bs.retrieveJSON(rawJSON.pictureAssets),
  ]);

  rawJSON.info = info;
  rawJSON.entitiesTree = entitiesTree;
  rawJSON.assets = {
    ...assets,
    ...scriptAssets,
  };
  rawJSON.deleteAssets = deleteAssets;
  rawJSON.voxels = voxels;
  rawJSON.player = player;
  rawJSON.environment = environment;
  rawJSON.physics = physics;
  rawJSON.ambientSound = ambientSound;
  rawJSON.zones = zones;
  rawJSON.gamepad = gamepad;
  rawJSON.uiTree = uiTree;
  rawJSON.audioAssets = audioAssets;
  rawJSON.pictureAssets = pictureAssets;

  return {
    hash,
    project: ProjectRDA.stateSchema.fromJSON(rawJSON),
  };
}

export async function updateProjectByHotProject(
  out: { hash: string; project: ProjectInfo },
  bs: BuildSystemAPI,
  hotProject: HotProject,
) {
  Object.keys(hotProject.seeds).forEach((id) => {
    const seed = hotProject.seeds[id];
    const entityNode = out.project.entitiesTree[id];
    if (!entityNode?.value) {
      return;
    }
    entityNode.value.mesh = seed.mesh;
    entityNode.value.defaultMotionId = seed.defaultMotionId;
    entityNode.value.bounds[0] = seed.bounds[0];
    entityNode.value.bounds[1] = seed.bounds[1];
    entityNode.value.bounds[2] = seed.bounds[2];
  });

  out.hash = (await storeProject(bs, out.project)).projectHash;
}
