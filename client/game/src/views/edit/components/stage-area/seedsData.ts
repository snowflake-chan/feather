import { vec3 } from 'gl-matrix';
import { lerp } from '@box/voxa-project';
import { UI3DVoxelEventSchema } from 'src/engine/ui3d/ui3d-schema';
import {
  getRenderableGLTF,
  getRenderableMesh,
  getRenderableTexture,
} from '../../../../engine/mesh/controller';
import { editor } from 'src/client/edit/edit-client';
import { getSquareVoxelCenter } from '../terrainPanel/voxel-helper';
import { AssetType, TreeNodes } from '@box/schema/project/project-rda';
import { TreeNodeType } from '@box/schema/project/murda-tree';

/**
 * 透明度动画一个循环1秒
 */
const alphaDuration = 1000;

function applyAlphaEasing(weight: number) {
  if (weight < 0.5) {
    return 2 * weight;
  }

  return -2 * weight + 2;
}

export class SeedsData {
  public hitRes = UI3DVoxelEventSchema.alloc();
  public hoverSeedIds: string[] = [];
  public hoverSeedId: string = '';
  public loadingAlpha = 1;

  private startTime?: number;
  private loadingAnimation?: number;

  public startLoadingAnimation = () => {
    if (this.loadingAnimation !== undefined) {
      return;
    }
    this.loadingAnimation = requestAnimationFrame(this.onFrame);
  };

  public cancelLoadingAnimation = () => {
    if (this.loadingAnimation === undefined) {
      return;
    }
    cancelAnimationFrame(this.loadingAnimation);
    this.startTime = undefined;
    this.loadingAnimation = undefined;
  };

  private onFrame = (timestamp: number) => {
    if (this.loadingAnimation === undefined) {
      return;
    }

    if (this.startTime === undefined) {
      this.startTime = timestamp;
    }
    const delta = (timestamp - this.startTime) % alphaDuration;
    const weight = applyAlphaEasing(delta / alphaDuration);
    // 透明度在「1 - 0.3」之间过度变化
    this.loadingAlpha = lerp(1, 0.3, weight);
    this.loadingAnimation = requestAnimationFrame(this.onFrame);
  };

  public getSeedData(entitiesTree: TreeNodes) {
    const treeIdList = Object.keys(entitiesTree);
    const unVisitedSeeds: string[] = [];
    const preparedSeeds: string[] = [];

    for (let i = 0; i < treeIdList.length; i++) {
      const treeNode = entitiesTree[treeIdList[i]];
      if (!treeNode || !treeNode.value) {
        continue;
      }
      const fileName = treeNode.value.mesh;
      const asset = this.getAssetByMesh(fileName);
      if (!asset) {
        unVisitedSeeds.push(treeIdList[i]);
        continue;
      }

      const modelCache = editor.game.state.modelCache;
      if (
        modelCache.imageIndex[asset.hash] ||
        modelCache.modelIndex[asset.hash]
      ) {
        preparedSeeds.push(treeIdList[i]);
      } else {
        switch (asset.type) {
          case AssetType.IMAGE:
            getRenderableTexture(editor.game.state, asset.hash);
            break;
          case AssetType.GLTF_MODEL:
            getRenderableGLTF(editor.game.state, asset.hash);
            break;
          default:
            getRenderableMesh(editor.game.state, asset.hash);
            break;
        }
      }
    }
    return { unVisitedSeeds, preparedSeeds };
  }

  public getAssetByMesh(
    mesh: string,
  ): { hash: string; type: AssetType } | undefined {
    const asset = editor.state.replica.project.assets[mesh];
    if (asset && [AssetType.IMAGE, AssetType.GLTF_MODEL].includes(asset.type)) {
      return asset;
    }

    // 模型实体资源需要在extraProject信息中查询
    const meshAsset = editor.state.replica.extraProjectInfo.meshAssets[mesh];
    if (meshAsset) {
      return {
        hash: meshAsset.hash,
        type: AssetType.VOXEL_MODEL,
      };
    }

    return;
  }

  public getVoxelCursorInfo() {
    const cursorPos = vec3.create();
    const cursorTextPos = vec3.create();
    const { hitRes } = this;

    let offsetX =
      hitRes.hitNormal[0] === -1 ? -0.001 : hitRes.hitNormal[0] * 1.001;
    let offsetY =
      hitRes.hitNormal[1] === -1 ? -0.001 : hitRes.hitNormal[1] * 1.001;
    let offsetZ =
      hitRes.hitNormal[2] === -1 ? -0.001 : hitRes.hitNormal[2] * 1.001;
    if (hitRes.hitNormal[0]) {
      offsetY += 0.5;
      offsetZ += 0.5;
    } else if (hitRes.hitNormal[1]) {
      offsetX += 0.5;
      offsetZ += 0.5;
    } else if (hitRes.hitNormal[2]) {
      offsetX += 0.5;
      offsetY += 0.5;
    }
    getSquareVoxelCenter(this.hitRes, 1, cursorPos);

    cursorTextPos[0] = cursorPos[0] + offsetX;
    cursorTextPos[1] = cursorPos[1] + offsetY;
    cursorTextPos[2] = cursorPos[2] + offsetZ;
    return { offsetX, offsetY, offsetZ, cursorPos, cursorTextPos };
  }

  public setHitRes(data: typeof UI3DVoxelEventSchema.identity) {
    this.hitRes = data;
  }

  public setHoverSeedId(data: string) {
    this.hoverSeedId = data;
  }

  public setHoverSeedIds(data: string[]) {
    this.hoverSeedIds = data;
  }

  public parseTreeNodesSeeds = (treeNodes: string[], out: string[]) => {
    treeNodes.forEach((item) => {
      const node = editor.state.replica.project.entitiesTree[item];
      if (!node) {
        return;
      }
      if (node.type !== TreeNodeType.leaf) {
        this.parseTreeNodesSeeds(node.childrenIds, out);
        return;
      }
      node.value && out.push(item);
    });
    return out;
  };

  /**
   * 解析是否包含实体，找到第一个实体就返回结果
   */
  public checkNodeHasSeed = (nodeId: string) => {
    const { entitiesTree } = editor.state.replica.project;
    const childrenIds = entitiesTree[nodeId].childrenIds.slice();
    let hasSeed = false;

    while (!hasSeed && childrenIds.length) {
      const id = childrenIds.shift();
      if (!id) {
        break;
      }

      const node = entitiesTree[id];
      if (!node) {
        continue;
      }

      if (node.type !== TreeNodeType.leaf) {
        childrenIds.push(...node.childrenIds);
        continue;
      }

      if (node.value) {
        hasSeed = true;
        break;
      }
    }
    return hasSeed;
  };

  /**
   * 组内 含有实体 且 全部锁定的时候，组锁定，否则组未锁定
   */
  public parseNodeLockState = (nodeId: string) => {
    const { entitiesTree } = editor.state.replica.project;
    const childrenIds = entitiesTree[nodeId].childrenIds.slice();
    let hasSeed = false;
    let hasUnlockedSeed = false;

    while (!hasUnlockedSeed && childrenIds.length) {
      const id = childrenIds.shift();

      if (!id) {
        break;
      }

      const node = entitiesTree[id];

      if (!node) {
        continue;
      }

      if (node.type !== TreeNodeType.leaf) {
        childrenIds.push(...node.childrenIds);
        continue;
      }
      if (node.value) {
        hasSeed = true;
      }
      if (node.value?.editLock === false) {
        // 一旦遇到一个未锁定的实体就返回
        hasUnlockedSeed = true;
        break;
      }
    }
    // 如果找不到未锁定的实体，且组内含有实体，则表示该组内所有实体都锁定了
    return hasSeed && !hasUnlockedSeed;
  };
}

export const seedsDataController = new SeedsData();
