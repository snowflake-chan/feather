import { vec3, mat3, vec4 } from 'gl-matrix';
import { ClientStateType } from '../edit-schema';
import { GameClientState } from 'src/engine/game-client-schema';
import { drawText3D } from 'src/engine/overlay/overlays';
import { EntitySeed } from '@box/schema/project/project-rda';
import { raycastEye } from 'src/engine/utils/raycast-eye';
import { computeEntitySeedRenderBox } from 'src/views/edit/components/transformHandler/util';

export function drawCoordinate(
  editState: ClientStateType,
  gameState: GameClientState,
) {
  const entitiesTree = editState.replica.project.entitiesTree;
  for (const id in entitiesTree) {
    const treeNode = entitiesTree[id];

    if (!treeNode || !treeNode.value) {
      return;
    }

    const { position } = computeEntitySeedRenderBox(gameState, treeNode.value);

    if (raycastEye(gameState, position)) {
      const seed = treeNode.value;
      drawText3D(
        gameState,
        `x:${seed.position[0].toFixed(2)}, y:${seed.position[1].toFixed(
          2,
        )}, z:${seed.position[2].toFixed(2)}`,
        seed.position,
      );
    }
  }
}

const bounds = vec3.create();
const M = mat3.create();
const size = vec3.create();
const _clipPos = vec4.create();
const _worldPos = vec4.create();
const vertices = [
  vec3.fromValues(0.5, 0.5, 0.5),
  vec3.fromValues(0.5, 0.5, -0.5),
  vec3.fromValues(-0.5, 0.5, -0.5),
  vec3.fromValues(-0.5, 0.5, 0.5),
  vec3.fromValues(0.5, -0.5, 0.5),
  vec3.fromValues(0.5, -0.5, -0.5),
  vec3.fromValues(-0.5, -0.5, -0.5),
  vec3.fromValues(-0.5, -0.5, 0.5),
];

export function compute2Dinformation(
  seed: EntitySeed,
  gameState: GameClientState,
) {
  let _left = 0;
  let _top = 0;
  let _width = 0;
  let _height = 0;

  const scale = seed.scale;
  const seedBounds = seed.bounds;
  bounds[0] = bounds[1] = bounds[2] = 0;
  mat3.fromQuat(M, seed.orientation);

  for (let j = 0; j < 8; ++j) {
    const x = 0.5 * (j & 1 ? scale[0] : -scale[0]) * seedBounds[0];
    const y = 0.5 * (j & 2 ? scale[1] : -scale[1]) * seedBounds[1];
    const z = 0.5 * (j & 4 ? scale[2] : -scale[2]) * seedBounds[2];
    bounds[0] = Math.max(bounds[0], Math.abs(x * M[0] + y * M[3] + z * M[6]));
    bounds[1] = Math.max(bounds[1], Math.abs(x * M[1] + y * M[4] + z * M[7]));
    bounds[2] = Math.max(bounds[2], Math.abs(x * M[2] + y * M[5] + z * M[8]));
  }

  size[0] = bounds[0] * 2;
  size[1] = bounds[1] * 2;
  size[2] = bounds[2] * 2;

  const viewProj = gameState.camera.viewProjection;
  const context2D = gameState.overlays.context;
  if (context2D === null) {
    throw new Error('context2d is null');
  }

  let visible = true;
  let minX = 10000;
  let minY = 10000;
  let maxX = 0;
  let maxY = 0;
  const ratio = window.devicePixelRatio;

  for (let i = 0; i < vertices.length; i++) {
    const pos = vertices[i];
    _worldPos[0] = pos[0] * size[0] + seed.position[0];
    _worldPos[1] = pos[1] * size[1] + seed.position[1];
    _worldPos[2] = pos[2] * size[2] + seed.position[2];
    _worldPos[3] = 1;
    vec4.transformMat4(_clipPos, _worldPos, viewProj);
    if (
      -_clipPos[3] < _clipPos[0] &&
      _clipPos[0] < _clipPos[3] &&
      -_clipPos[3] < _clipPos[1] &&
      _clipPos[1] < _clipPos[3] &&
      -_clipPos[3] < _clipPos[2] &&
      _clipPos[2] < _clipPos[3]
    ) {
      const x =
        (0.5 * context2D.canvas.width * (1 + _clipPos[0] / _clipPos[3])) /
        ratio;
      const y =
        (0.5 * context2D.canvas.height * (1 - _clipPos[1] / _clipPos[3])) /
        ratio;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);

      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    } else {
      visible = false;
      _left = 0;
      _top = 0;
      _width = 0;
      _height = 0;
      break;
    }
  }
  if (visible) {
    _left = minX - 10;
    _top = minY - 10;
    _width = maxX - minX + 20;
    _height = maxY - minY + 20;
  }

  return {
    left: _left,
    top: _top,
    width: _width,
    height: _height,
  };
}

interface Bounds2D {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export function isRectOverlap(rect1: Bounds2D, rect2: Bounds2D) {
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.top > rect2.bottom ||
    rect1.bottom < rect2.top
  );
}
