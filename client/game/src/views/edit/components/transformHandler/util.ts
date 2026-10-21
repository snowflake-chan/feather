import { vec3 } from 'gl-matrix';
import type { EntitySeed } from '@box/schema/project/project-rda';
import {
  RenderBoxResult,
  renderBoxFromRenderable,
  computeRenderBox,
} from 'src/engine/seed/util';
import { assetToRenderable } from 'src/client/edit/seed/seed-helper';
import type { GameClientState } from 'src/engine/game-client-schema';
import type { ClientStateType } from 'src/client/edit/edit-schema';

export enum HoverObject {
  none,
  arrowX,
  arrowY,
  arrowZ,
  cubeX,
  cubeY,
  cubeZ,
  cubeW,
  ringX,
  ringY,
  ringZ,
}

export const hoverColor = vec3.fromValues(1, 1, 1);

/**
 * 根据选中的节点，计算操纵杆的位置、包围盒尺寸
 * - 单选时，以节点的外观框作为包围盒，以节点的锚点作为位置
 * - 多选时，包围盒由多个节点的外观框形成最小外接矩形，以矩形的中心点作为位置
 */
export function calcBoxDimension(
  seedIds: string[],
  editState: ClientStateType,
  gameState: GameClientState,
): RenderBoxResult {
  const entitiesTree = editState.replica.project.entitiesTree;

  // 仅选中1个时，以当前节点的锚点计算坐标
  if (seedIds.length === 1) {
    const [id] = seedIds;
    const treeNode = entitiesTree[id];

    if (treeNode && treeNode.value) {
      const { dimension } = computeEntitySeedRenderBox(
        gameState,
        treeNode.value,
      );

      const [x, y, z] = treeNode.value.position;

      return {
        position: [x, y, z],
        dimension,
      };
    }

    return {
      // 这里保持原来的计算，如果没有任何有效节点，返回的结果就是NaN
      position: [NaN, NaN, NaN],
      dimension: [NaN, NaN, NaN],
    };
  }

  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;

  // 多选时，以外观框构成的最小外接几何作为dimension，以其中心作为操作轴的位置
  seedIds.forEach((id) => {
    const treeNode = entitiesTree[id];
    if (!treeNode || !treeNode.value) {
      return;
    }
    const { position, dimension } = computeEntitySeedRenderBox(
      gameState,
      treeNode.value,
    );

    maxX = Math.max(maxX, position[0] + dimension[0] * 0.5);
    maxY = Math.max(maxY, position[1] + dimension[1] * 0.5);
    maxZ = Math.max(maxZ, position[2] + dimension[2] * 0.5);

    minX = Math.min(minX, position[0] - dimension[0] * 0.5);
    minY = Math.min(minY, position[1] - dimension[1] * 0.5);
    minZ = Math.min(minZ, position[2] - dimension[2] * 0.5);
  });
  return {
    position: vec3.fromValues(
      (maxX + minX) / 2,
      (maxY + minY) / 2,
      (maxZ + minZ) / 2,
    ),
    dimension: vec3.fromValues(maxX - minX, maxY - minY, maxZ - minZ),
  };
}

/**
 * 基于EntitySeed数据，计算外观框的维度和位置
 */
export function computeEntitySeedRenderBox(
  gameState: GameClientState,
  seed: EntitySeed,
): RenderBoxResult {
  const { position, scale, orientation, mesh } = seed;

  const bounds: vec3 = [0, 0, 0];
  const anchor: vec3 = [0, 0, 0];

  const renderable = assetToRenderable(gameState, mesh);

  if (!renderable) {
    return {
      dimension: bounds,
      position,
    };
  }

  renderBoxFromRenderable({ bounds, offset: anchor }, renderable);

  return computeRenderBox({
    position,
    scale,
    orientation,
    renderBoxBounds: bounds,
    renderBoxOffset: anchor,
  });
}
