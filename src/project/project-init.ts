// FIXME: remove all this stuff, should use project templates from now on
import fs from 'fs';
import {
  ProjectRDA,
  AssetEntryRDA,
  AssetType,
  ProjectInfo,
} from '@box/schema/project/project-rda';
import { GroupAssetEntryRDA } from '@box/schema/group-project/rda';
import { ContentServer } from '@box/content-server';
import { encodeUTF8, MuReadStream } from '@box/mudb/stream';
import { Logger } from '@box/utils/logger';
import { BuildSystemAPI } from '@box/build-system/type';
import { initTerrain } from './terrain/init-terrain';
import { TerrainTheme } from './terrain';
import { LUT_RES } from '../assets/lut';
import { WEATHER_RES } from '../assets/weather';
import { DEFAULT_SOUNDS_RES } from '../assets/default_sounds';
import { BLOCK_INFO_RES } from '../assets/block_info';
import { BlockInfoSchema } from '@box/schema/voxel/block-schema';
import { storeProject } from '@box/build-system/project/project-serialize';
import { Vec3Schema } from '@box/schema/utils/math-schema';

function initialTerrainTheme() {
  const terrain = String(process.env.BOX_INITIAL_TERRAIN_THEME || '').trim();
  return terrain === 'arena'
    ? TerrainTheme.arena
    : terrain === 'raceway'
      ? TerrainTheme.raceway
      : TerrainTheme.plane;
}

function addDefaultSounds(project: ProjectInfo) {
  Object.keys(DEFAULT_SOUNDS_RES).forEach((sound) => {
    const asset = GroupAssetEntryRDA.stateSchema.clone(
      GroupAssetEntryRDA.stateSchema.identity,
    );
    asset.type = AssetType.AUDIO;
    asset.hash = DEFAULT_SOUNDS_RES[sound];
    project.audioAssets[`audio/${sound}.mp3`] = asset;
  });

  // set default player sounds
  const playerEntitySounds = project.player.sounds;
  playerEntitySounds.die.sample = 'audio/die.mp3';
  playerEntitySounds.hurt.sample = 'audio/hurt.mp3';
  playerEntitySounds.chat.sample = 'audio/chat.mp3';

  const playerSounds = project.player.playerSounds;
  playerSounds.jump.sample = 'audio/jump.mp3';
  playerSounds.doubleJump.sample = 'audio/double_jump.mp3';
  playerSounds.land.sample = 'audio/land.mp3';
  playerSounds.step.sample = 'audio/step.mp3';
  playerSounds.step.pitchRange = 0.2;
  playerSounds.spawn.sample = 'audio/spawn.mp3';
  playerSounds.swim.sample = 'audio/swim.mp3';
  playerSounds.enterWater.sample = 'audio/dive.mp3';
  playerSounds.leaveWater.sample = 'audio/splash.mp3';

  // set ambient sounds
  const ambient = project.ambientSound;
  ambient.placeVoxel.sample = 'audio/place_block.mp3';
  ambient.breakVoxel.sample = 'audio/break_block.mp3';
}

export async function createDefaultProject(spec: {
  contentServer: ContentServer;
  buildSystem: BuildSystemAPI;
  logger: Logger;
  debugScripts: string[];
  userId: number;
}) {
  const { contentServer } = spec;
  const logger = spec.logger.create('init-project');

  logger.info(`initializing default project`);
  const projectInfo = ProjectRDA.stateSchema.clone(
    ProjectRDA.stateSchema.identity,
  );

  // initialize scripts
  const indexScripts: string[] = await Promise.all(
    spec.debugScripts.map(async (name) => {
      const bytes = await fs.promises.readFile(name);
      const hash = await spec.contentServer.store(new Uint8Array(bytes));
      if (!hash) {
        throw new Error('error savign bytes');
      }
      const asset = AssetEntryRDA.stateSchema.alloc();
      asset.type = AssetType.JS_SCRIPT;
      asset.contentId = 0;
      asset.ownerId = spec.userId;
      asset.hash = hash;
      asset.previewImage = '';
      asset.size = bytes.length;

      const fileName = name.slice(name.indexOf('/') + 1);
      projectInfo.assets[fileName] = asset;

      return fileName;
    }),
  );
  if (indexScripts.length === 1) {
    projectInfo.scriptIndex = indexScripts[0];
  } else if (indexScripts.length > 1) {
    const indexSrc: string[] = [];
    for (let i = 0; i < indexScripts.length; ++i) {
      indexSrc.push(`require("./${indexScripts[i]}");`);
    }
    const hash = await spec.contentServer.store(
      encodeUTF8(indexSrc.join('\n')),
    );
    if (!hash) {
      throw new Error('error saving index script bytes');
    }

    const asset = AssetEntryRDA.stateSchema.alloc();
    asset.type = AssetType.JS_SCRIPT;
    asset.contentId = 0;
    asset.ownerId = spec.userId;
    asset.hash = hash;
    asset.previewImage = '';
    asset.size = 0;

    let fileName = 'index';
    while (fileName + '.js' in projectInfo.assets) {
      fileName += '_';
    }
    fileName += '.js';

    projectInfo.assets[fileName] = asset;
    projectInfo.scriptIndex = fileName;
  } else {
    async function createIndexFile(name: string, type: AssetType) {
      const asset = AssetEntryRDA.stateSchema.alloc();
      asset.type = type;
      asset.contentId = 0;
      asset.ownerId = spec.userId;
      asset.hash = await contentServer.store(new Uint8Array(0));
      asset.previewImage = '';
      asset.size = 0;
      projectInfo.assets[name] = asset;
      projectInfo.scriptIndex = name;
    }

    await createIndexFile('clientIndex.js', AssetType.CLIENT_JS_SCRIPT);
    await createIndexFile('index.js', AssetType.JS_SCRIPT);
  }

  // temporarily load block info
  const blockInfoBytes = await contentServer.retrieve(BLOCK_INFO_RES.blockInfo);
  if (!blockInfoBytes) {
    throw new Error('error loading block info');
  }
  const blockInfo = BlockInfoSchema.patch(
    BlockInfoSchema.identity,
    new MuReadStream(blockInfoBytes),
  );
  function blockId(name: string) {
    const idx = blockInfo.names.indexOf(name);
    if (idx >= 0) {
      return blockInfo.ids[idx];
    }
    return 0;
  }

  // initialize voxels
  const voxels = await initTerrain({
    theme: initialTerrainTheme(),
    baseBlock: blockId('dirt'),
    bottomBlock: blockId('stone'),
    surfaceBlock: blockId('grass'),
    waterBlock: blockId('water'),
    contentServer,
  });
  if (voxels) {
    projectInfo.voxels = voxels;
  } else {
    throw new Error('error initializing terrain');
  }

  // initialize snow textures
  await Promise.all(
    Object.keys(WEATHER_RES).map((snowName) => {
      const snowHash = WEATHER_RES[snowName];
      const fileName = `snow/${snowName}.part`;
      projectInfo.assets[fileName] = {
        ownerId: 0,
        contentId: 0,
        type: AssetType.PARTICLE_TEXTURE,
        hash: snowHash,
        previewImage: snowHash,
        size: 0,
        bounds: Vec3Schema.clone(Vec3Schema.identity),
        animated: false,
      };
    }),
  );

  // initialize color LUTs
  Object.keys(LUT_RES.lut).forEach((lutName) => {
    const lutHash = LUT_RES.lut[lutName];
    const lutPreview = LUT_RES.preview[lutName];
    const fileName = `lut/${lutName}.lut`;
    projectInfo.assets[fileName] = {
      ownerId: 0,
      contentId: 0,
      type: AssetType.COLOR_LUT,
      hash: lutHash,
      previewImage: lutPreview,
      size: 0,
      bounds: Vec3Schema.clone(Vec3Schema.identity),
      animated: false,
    };
  });

  // add default sounds to project
  addDefaultSounds(projectInfo);

  // initialize description
  projectInfo.info.displayName =
    projectInfo.info.displayName ||
    ProjectRDA.stateSchema.identity.info.displayName;
  projectInfo.info.description = projectInfo.info.description || '';
  projectInfo.info.previewImage = projectInfo.info.previewImage || '';

  // save result and check consistency
  return (await storeProject(spec.buildSystem, projectInfo)).projectHash;
}
