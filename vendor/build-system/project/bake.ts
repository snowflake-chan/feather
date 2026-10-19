import { BuildSystemAPI } from '../type';
import * as Cold from '@box/schema/project/project-rda';
import * as Hot from '@box/schema/project/hot-schema';
import { ContentServer, Hash } from '@box/content-server';
import { MuReadStream } from '@box/mudb/stream';
import { BlockInfo, BlockInfoSchema } from '@box/schema/voxel/block-schema';
import { IntBoundsSchema } from './bounds-schema';
import { MuSchema } from '@box/mudb/schema';
import { SciptCollisionFilterSpecSchema } from '@box/schema/script/script-protocol';
import { TreeNodeType } from '@box/schema/project/murda-tree';
import type { ModelMetaData } from '@box/voxa-project';
import { getSkinMetaData } from '@box/voxa-project';

import { UITreeRDA } from '@box/schema/project/ui-rda/defs';
import { Vec3Schema } from '@box/schema/utils/math-schema';

export function copySoundAssets(hp: Hot.HotProject) {
  Hot.SoundTableSchema.assign(hp.soundAssets, Hot.SoundTableSchema.identity);

  const { audioAssets } = hp;

  Object.keys(audioAssets).forEach((path) => {
    const asset = audioAssets[path];

    if (asset.type === Cold.AssetType.AUDIO) {
      const hash = asset.hash;
      if (hash in hp.soundAssets.hashId) {
        return;
      }
      hp.soundAssets.hashId[path] = hp.soundAssets.hashId[hash] =
        hp.soundAssets.hashes.length;
      hp.soundAssets.hashes.push(hash);
    }
  });
}

export type RuntimeMeshInfo = {
  hash: string;
  path: string;
  bounds: [number, number, number];
  motionIds: string[];
};

/**
 * An imported cloud project can contain a dangling model-library entry whose
 * hash was never saved. Do not pass an empty value into migrateVoxel: there is
 * no resource to migrate, and failing the complete prebake makes an otherwise
 * playable map permanently unavailable.
 */
export function hasRuntimeAssetHash(hash: unknown): hash is string {
  return typeof hash === 'string' && hash.trim().length > 0;
}

/**
 * A local project model and its VOXA source can legitimately have the same
 * numeric model id. The entity path is authoritative in that case. Falling
 * back to model id preserves Boxes' rename/migration behaviour for legacy
 * entities whose old path no longer exists.
 */
export function resolveSeedMeshInfo(
  meshPath: string,
  meshId: number,
  meshAssets: Hot.HotProject['meshAssets'],
  meshIdSetCache: { [id: number]: RuntimeMeshInfo },
): RuntimeMeshInfo | undefined {
  const mesh = meshAssets[meshPath];
  if (mesh) {
    return {
      hash: mesh.hash,
      path: meshPath,
      bounds: [mesh.bounds[0], mesh.bounds[1], mesh.bounds[2]],
      motionIds: mesh.motionList.map((motion) => motion.id),
    };
  }
  return meshIdSetCache[meshId];
}

export class ProjectBakeCache {
  public content: ContentServer;
  public build: BuildSystemAPI;
  public meshIdSetCache: { [id: number]: RuntimeMeshInfo } = {};

  private _meshInfoCache: { [hash: string]: Hot.MeshAssetInfo } = {};
  private _blockInfoCache: { [hash: string]: BlockInfo } = {};
  private _pictureInfoCache: { [hash: string]: Hot.PictureAsset } = {};
  private _skinInfoCache: { [hash: string]: Hot.SkinAsset } = {};

  constructor(
    content: ContentServer,
    build: BuildSystemAPI,
    public blockInfoHash: string,
  ) {
    this.content = content;
    this.build = build;
  }

  public destroy() {
    Object.keys(this._blockInfoCache).forEach((hash) => {
      const blockInfo = this._blockInfoCache[hash];
      BlockInfoSchema.free(blockInfo);
    });
    this._blockInfoCache = {};

    Object.keys(this._meshInfoCache).forEach((hash) => {
      const meshInfo = this._meshInfoCache[hash];
      Hot.MeshAssetSchema.free(meshInfo);
    });
    this._meshInfoCache = {};

    Object.keys(this._pictureInfoCache).forEach((hash) => {
      const pictureInfo = this._pictureInfoCache[hash];
      Hot.PictureAssetSchema.free(pictureInfo);
    });
    this._pictureInfoCache = {};

    Object.keys(this._skinInfoCache).forEach((hash) => {
      const skinInfo = this._skinInfoCache[hash];
      Hot.SkinAssetSchema.free(skinInfo);
    });
    this._skinInfoCache = {};
  }

  public async getMeshInfo(
    hash: string,
    type: Cold.AssetType,
  ): Promise<Hot.MeshAssetInfo> {
    const prev = this._meshInfoCache[hash];
    if (prev) {
      return prev;
    }
    const info = Hot.MeshAssetSchema.alloc();
    info.hash = hash;

    if (type === Cold.AssetType.IMAGE) {
      info.hashType = Hot.HashType.IMAGE;
      info.meshHash = hash;
      const bounds = await this._retrieveImageBounds(info.meshHash);
      info.bounds[0] = bounds.hix - bounds.lox;
      info.bounds[1] = bounds.hiy - bounds.loy;
      info.bounds[2] = bounds.hiz - bounds.loz;

      info.renderBoxOffset[0] = 0;
      info.renderBoxOffset[1] = 0;
      info.renderBoxOffset[2] = 0;
    } else if (type === Cold.AssetType.GLTF_MODEL) {
      info.hashType = Hot.HashType.GLTF_MODEL;
      info.meshHash = hash;

      const bounds = this.retrieveGLTFMetaData(info.meshHash);
      info.bounds[0] = bounds[0];
      info.bounds[1] = bounds[1];
      info.bounds[2] = bounds[2];

      info.renderBoxOffset[0] = 0;
      info.renderBoxOffset[1] = 0;
      info.renderBoxOffset[2] = 0;
    } else {
      info.hashType = Hot.HashType.VOXEL_MODEL;
      info.meshHash = await this.build.build('migrateVoxel', hash);
      const {
        bounds,
        motionList,
        useCustomBounds,
        customBounds,
        renderBoxOffset,
      } = await this._retrieveVoxelMetaData(info.meshHash);
      info.bounds[0] = bounds.hix - bounds.lox;
      info.bounds[1] = bounds.hiy - bounds.loy;
      info.bounds[2] = bounds.hiz - bounds.loz;
      info.motionList = motionList;
      info.useCustomBounds = useCustomBounds;
      info.customBounds = customBounds;
      info.renderBoxOffset = renderBoxOffset;
    }
    this._meshInfoCache[hash] = info;
    return info;
  }

  private async _retrieveImageBounds(hash: string) {
    const imgBuffer = await this.content.retrieve(hash);
    if (!imgBuffer || !imgBuffer.length) {
      return IntBoundsSchema.clone(IntBoundsSchema.identity);
    }
    const imgJson = JSON.parse(Buffer.from(imgBuffer).toString());
    const intBounds = IntBoundsSchema.alloc();
    intBounds.lox = 0;
    intBounds.loy = 0;
    intBounds.loz = 0;
    intBounds.hix = imgJson.width;
    intBounds.hiy = imgJson.height;
    intBounds.hiz = 0;
    return intBounds;
  }

  private async _retrieveVoxelMetaData(hash: string) {
    const intBounds = IntBoundsSchema.clone(IntBoundsSchema.identity);
    const motionList = Hot.MotionListSchema.clone(
      Hot.MotionListSchema.identity,
    );
    const customBounds = Hot.CustomBoundsSchema.clone(
      Hot.CustomBoundsSchema.identity,
    );
    const renderBoxOffset = Vec3Schema.clone(Vec3Schema.identity);

    const metaDataBytes = await this.build.retrieveContentFromS3(hash);
    if (!metaDataBytes || !metaDataBytes.length) {
      return {
        bounds: intBounds,
        motionList,
        useCustomBounds: false,
        customBounds,
        renderBoxOffset,
      };
    }

    const metaData: ModelMetaData = JSON.parse(
      Buffer.from(metaDataBytes).toString(),
    );

    intBounds.lox = 0;
    intBounds.loy = 0;
    intBounds.loz = 0;
    intBounds.hix = metaData.bounds[0];
    intBounds.hiy = metaData.bounds[1];
    intBounds.hiz = metaData.bounds[2];
    if (metaData.motionList) {
      metaData.motionList.forEach((motion) => {
        motionList.push({
          id: motion.id,
          name: motion.name,
          duration: motion.duration,
        });
      });
    }

    if (metaData.customBounds) {
      const { offset, size } = metaData.customBounds;
      customBounds.offset[0] = offset[0];
      customBounds.offset[1] = offset[1];
      customBounds.offset[2] = offset[2];

      customBounds.size[0] = size[0];
      customBounds.size[1] = size[1];
      customBounds.size[2] = size[2];
    } else {
      // 模型文件没有自定义物理框数据就用默认物理框数据
      customBounds.size[0] = intBounds.hix - intBounds.lox;
      customBounds.size[1] = intBounds.hiy - intBounds.loy;
      customBounds.size[2] = intBounds.hiz - intBounds.loz;
    }

    if (metaData.renderBoxOffset) {
      renderBoxOffset[0] = metaData.renderBoxOffset[0];
      renderBoxOffset[1] = metaData.renderBoxOffset[1];
      renderBoxOffset[2] = metaData.renderBoxOffset[2];
    } else {
      renderBoxOffset[0] = 0;
      renderBoxOffset[1] = 0;
      renderBoxOffset[2] = 0;
    }

    return {
      bounds: intBounds,
      motionList,
      useCustomBounds: !!metaData.useCustomBounds,
      customBounds,
      renderBoxOffset,
    };
  }

  private async retrieveGLTFMetaData(hash: string) {
    const metaDataBytes = await this.build.retrieveContentFromS3(hash);

    if (!metaDataBytes) {
      return {
        bounds: [0, 0, 0],
      };
    }

    const metaData = JSON.parse(Buffer.from(metaDataBytes).toString());

    return {
      bounds: metaData.bounds,
    };
  }

  private async _getPicture(metadataHash: string): Promise<Hot.PictureAsset> {
    if (this._pictureInfoCache[metadataHash]) {
      return this._pictureInfoCache[metadataHash];
    }

    const bufferArr = await this.build.retrieveContentFromS3(metadataHash);

    const metadata: {
      hash: string;
      width: number;
      height: number;
    } = JSON.parse(Buffer.from(bufferArr).toString());

    this._pictureInfoCache[metadataHash] = { metadataHash, ...metadata };

    return this._pictureInfoCache[metadataHash];
  }

  private async _getSkinAsset(hash: string): Promise<Hot.SkinAsset> {
    const cache = this._skinInfoCache[hash];
    if (cache) {
      return cache;
    }
    const skinInfo = Hot.SkinAssetSchema.alloc();
    skinInfo.hash = hash;

    const metaDataBytes = await this.build.retrieveContentFromS3(hash);
    const metaData = getSkinMetaData(metaDataBytes);

    if (!metaData) {
      throw new Error(`Failed to get skin metaData with hash: ${hash}`);
    }

    const latestHash = await this.build.build('migrateSkin', hash, metaData);
    const bufferArr = await this.build.retrieveContentFromS3(latestHash);
    const skinMetaData = getSkinMetaData(bufferArr);

    Object.keys(skinInfo.parts).forEach((partName) => {
      const partHash = skinMetaData ? skinMetaData[partName] : '';
      skinInfo.parts[partName] = partHash || '';
    });

    this._skinInfoCache[hash] = skinInfo;
    return this._skinInfoCache[hash];
  }

  private async _getBlockInfo(hp: Hot.HotProject, hash: string) {
    hp.blockInfoHash = hash;
    if (!(hash in this._blockInfoCache)) {
      const bytes = await this.content.retrieve(hash);
      if (!bytes) {
        throw new Error('missing block info hash');
      }
      const stream = new MuReadStream(bytes);
      const info = BlockInfoSchema.patch(BlockInfoSchema.identity, stream);
      this._blockInfoCache[hash] = info;
      BlockInfoSchema.assign(hp.blockInfo, info);
    } else {
      BlockInfoSchema.assign(hp.blockInfo, this._blockInfoCache[hash]);
    }
  }

  public async bake(
    cold: Cold.ProjectInfo,
    extra: Hot.ExtraProjectInfo,
    hp_?: Hot.HotProject,
  ) {
    const pending: Promise<any>[] = [];

    // make a copy so we can safely run asynchronously
    const hp = hp_ || Hot.HotProjectSchema.clone(Hot.HotProjectSchema.identity);

    // save project name
    hp.name = cold.info.displayName;

    // copy basic stuff
    Hot.EnvironmentSchema.assign(hp.environment, cold.environment);
    Hot.PhysicsSchema.assign(hp.physics, cold.physics);
    Hot.PlayerSchema.assign(hp.player, cold.player);
    Hot.GamepadSchema.assign(hp.gamepad, cold.gamepad);
    updateHotProjectAssets(hp, cold);
    Cold.AmbientSoundRDA.stateSchema.assign(hp.sound, cold.ambientSound);
    Cold.ProjectFeatureRDA.stateSchema.assign(hp.features, cold.features);
    Cold.ZoneSetRDA.stateSchema.assign(hp.zones, cold.zones);
    UITreeRDA.stateSchema.assign(hp.uiTree, cold.uiTree);

    Hot.VoxelSchema.assign(hp.voxels, cold.voxels);

    hp.scriptIndex = cold.scriptIndex;
    hp.defaultScreenId = cold.defaultScreenId;

    // copy collision rules
    Hot.HotCollisionRules.assign(
      hp.collisionRules,
      Hot.HotCollisionRules.identity,
    );
    Object.keys(cold.collisionFilter).forEach((id) => {
      const rule = cold.collisionFilter[id];
      const spec = SciptCollisionFilterSpecSchema.alloc();
      spec.a = rule.selectorA;
      spec.b = rule.selectorB;
      hp.collisionRules.push(spec);
    });

    // preload voxel data
    pending.push(this._getBlockInfo(hp, this.blockInfoHash));

    // sync all assets from cold to warm
    function syncAssets<C extends { hash: Hash }, W extends { hash: Hash }>(
      coldAssets: { [url: string]: C },
      validator: ((coldItem: C) => boolean) | undefined,
      schema: MuSchema<W>,
      warm: { [url: string]: W },
      load: (result: W, spec: C, url: string) => Promise<void>,
    ) {
      // update new assets
      const coldItems = Object.keys(coldAssets);
      for (let i = 0; i < coldItems.length; ++i) {
        const url = coldItems[i];
        const coldItem = coldAssets[url];
        if (validator && !validator(coldItem)) {
          continue;
        }
        if (url in warm) {
          const warmItem = warm[url];
          if (warmItem.hash !== coldItem.hash) {
            pending.push(load(warmItem, coldItem, url));
          }
        } else {
          const warmItem = schema.clone(schema.identity);
          warm[url] = warmItem;
          warmItem.hash = coldItem.hash;
          pending.push(load(warmItem, coldItem, url));
        }
      }

      // remove old assets
      const items = Object.keys(warm);
      for (let i = 0; i < items.length; ++i) {
        const url = items[i];
        if (
          !(url in coldAssets) ||
          (validator && !validator(coldAssets[url]))
        ) {
          const asset = warm[url];
          schema.free(asset);
          delete warm[url];
        }
      }
    }

    // copy sound asset hashes over
    copySoundAssets(hp);

    // synchornize assets
    syncAssets(
      cold.assets,
      (coldItem) => {
        return (
          coldItem.type === Cold.AssetType.JS_SCRIPT ||
          coldItem.type === Cold.AssetType.CLIENT_JS_SCRIPT
        );
      },
      Hot.ScriptAssetSchema,
      hp.modules,
      async (script, spec) => {
        script.hash = spec.hash;
        script.isClient = spec.type === Cold.AssetType.CLIENT_JS_SCRIPT;
      },
    );

    // 同步共享代码
    Object.keys(extra.scriptAssets)
      .filter((id) => {
        return extra.scriptAssets[id].isShare;
      })
      .forEach((id) => {
        const script = extra.scriptAssets[id];
        const warmItem = Hot.ScriptAssetSchema.clone(
          Hot.ScriptAssetSchema.identity,
        );
        warmItem.hash = script.hash;
        warmItem.isClient = script.isClient;
        hp.modules[script.name] = warmItem;
      });

    syncAssets(
      Object.assign({}, cold.assets, extra.meshAssets),
      (coldItem) => {
        const isMeshAsset =
          !!coldItem.modelId ||
          [
            Cold.AssetType.VOXEL_MODEL,
            Cold.AssetType.IMAGE,
            Cold.AssetType.GLTF_MODEL,
          ].includes(coldItem.type);
        if (isMeshAsset && !hasRuntimeAssetHash(coldItem.hash)) {
          this.build.logger.warn(
            'Skipping a model asset with an empty resource hash while baking the map.',
          );
          return false;
        }
        return isMeshAsset;
      },
      Hot.MeshAssetSchema,
      hp.meshAssets,
      async (mesh, spec, url) => {
        const info = await this.getMeshInfo(
          spec.hash,
          spec.modelId ? Cold.AssetType.VOXEL_MODEL : spec.type,
        );
        if (spec.modelId) {
          this.meshIdSetCache[spec.modelId] = {
            hash: spec.hash,
            path: url,
            bounds: [info.bounds[0], info.bounds[1], info.bounds[2]],
            motionIds: info.motionList.map((motion) => motion.id),
          };
        }
        Hot.MeshAssetSchema.assign(mesh, info);
      },
    );

    syncAssets(
      cold.pictureAssets,
      undefined,
      Hot.PictureAssetSchema,
      hp.pictureAssets,
      async (picture, spec) => {
        const info = await this._getPicture(spec.hash);
        Hot.PictureAssetSchema.assign(picture, info);
      },
    );

    syncAssets(
      extra.skinAssets,
      undefined,
      Hot.SkinAssetSchema,
      hp.skinAssets,
      async (result, spec) => {
        const info = await this._getSkinAsset(spec.hash);
        Hot.SkinAssetSchema.assign(result, info);
      },
    );
    hp.defaultSkinName = extra.defaultSkinName;
    // wait for all pending promises
    if (pending.length > 0) {
      await Promise.all(pending);
    }

    // copy seeds from entities tree
    Hot.SeedSetSchema.assign(hp.seeds, Hot.SeedSetSchema.identity);
    Object.keys(cold.entitiesTree).forEach((id) => {
      const entityNode = cold.entitiesTree[id];
      if (entityNode.type !== TreeNodeType.leaf || !entityNode.value) {
        return;
      }

      const seed = Hot.SeedSchema.clone(entityNode.value);
      const meshInfo = resolveSeedMeshInfo(
        seed.mesh,
        seed.meshId,
        hp.meshAssets,
        this.meshIdSetCache,
      );
      if (meshInfo) {
        seed.mesh = meshInfo.path;
        seed.bounds[0] = meshInfo.bounds[0];
        seed.bounds[1] = meshInfo.bounds[1];
        seed.bounds[2] = meshInfo.bounds[2];

        // 默认动作重置规则：
        // 非静态动作 且 在动作列表中不存在此动作时，重置为动作列表的首个动作
        if (
          seed.defaultMotionId &&
          !meshInfo.motionIds.includes(seed.defaultMotionId)
        ) {
          seed.defaultMotionId = meshInfo.motionIds[0] || '';
        }
      }
      hp.seeds[id] = seed;
    });

    return hp;
  }
}

/**
 * 通过ProjectRDA中的资源更新HotProject的资源
 */
export function updateHotProjectAssets(
  out: Hot.HotProject,
  projectInfo: Cold.ProjectInfo,
) {
  Cold.AssetsRDA.stateSchema.assign(out.assets, projectInfo.assets);
  Cold.GroupAssetsRDA.stateSchema.assign(
    out.audioAssets,
    projectInfo.audioAssets,
  );
}
