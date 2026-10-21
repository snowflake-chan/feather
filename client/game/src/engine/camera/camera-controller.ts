import {
  Camera,
  CameraSchema,
  UP,
  MIN_CAMERA_DISTANCE,
  EMISSIVE_SCALE,
  CameraConfiguration,
  CameraMode,
  CameraFreezedAxis,
} from '@box/schema/camera/camera-schema';
import { mat4, vec3, quat, mat3, vec4, vec2 } from 'gl-matrix';
import { setFrustumMatrix } from '../utils/frustum';
import { GameClientState } from '../game-client-schema';
import { getById } from '@box/utils/id';
import {
  Mat3Schema,
  Mat4Schema,
  Vec3Schema,
} from '@box/schema/utils/math-schema';
import { fromPolar } from './polar';
import {
  VoxelRaycastHitResult,
  raycast,
} from '@box/schema/voxel/voxel-raycast';
import { PLAYER_HEIGHT } from '@box/schema/player/player-move';
import { PlayerButtonState } from '@box/schema/player/player-schema';
import { DialogCommonConfig } from '@box/schema/dialog/dialog-protocol';

const scratchVec4 = vec4.create();
export function screenToRay(
  camera: Camera,
  screenX: number,
  screenY: number,
  out?: vec3,
): vec3 {
  vec4.set(scratchVec4, screenX, screenY, 1, 1);
  vec4.transformMat4(scratchVec4, scratchVec4, camera.invProjection);
  scratchVec4[3] = 0;
  vec4.transformMat4(scratchVec4, scratchVec4, camera.invView);
  return vec3.normalize(out || vec3.create(), scratchVec4 as any);
}

export function pixelToRay(
  state: GameClientState,
  pixelX: number,
  pixelY: number,
  out?: vec3,
): vec3 {
  const ratio = state.settings.resolutionScale || 1;
  return screenToRay(
    state.camera,
    (2 * pixelX) / (state.camera.viewport[0] / ratio) - 1,
    1 - (2 * pixelY) / (state.camera.viewport[1] / ratio),
    out || vec3.create(),
  );
}

/**
 * 把世界坐标转换成裁剪空间的坐标。
 */
export function worldPosToClipPos(out: vec3, vertex: vec3, camera: Camera) {
  return vec3.transformMat4(out, vertex, camera.viewProjection);
}

export type ElementRect = {
  width: number;
  height: number;
  top: number;
  left: number;
};
/**
 * 计算裁剪空间坐标的屏幕坐标
 */
export function clipPosToScreenPos(
  out: vec2,
  clipPos: vec3,
  elementRect: ElementRect,
) {
  if (
    -1 < clipPos[0] &&
    clipPos[0] < 1 &&
    -1 < clipPos[1] &&
    clipPos[1] < 1 &&
    -1 < clipPos[2] &&
    clipPos[2] < 1
  ) {
    const { width, height, top, left } = elementRect;

    out[0] = ((clipPos[0] + 1) * width) / 2 + left;
    out[1] = ((clipPos[1] - 1) * height) / -2 + top;
    return out;
  }
  return false;
}

function recalcCameraProps(camera: Camera) {
  const { eye, viewProjection, invViewProjection, projection, view, rotation } =
    camera;

  // compute view matrix
  mat4.fromQuat(view, rotation);
  for (let i = 0; i < 3; ++i) {
    let v = 0;
    for (let j = 0; j < 3; ++j) {
      v += eye[j] * view[4 * j + i];
    }
    view[12 + i] = -v;
  }
  mat4.invert(camera.invView, view);

  // compute projection matrix
  mat4.perspective(
    camera.projection,
    camera.fovY,
    camera.viewport[0] / camera.viewport[1],
    camera.zNear,
    camera.zFar,
  );
  mat4.invert(camera.invProjection, camera.projection);

  // compute camera frustum
  mat4.mul(viewProjection, projection, view);
  mat4.invert(invViewProjection, viewProjection);
  setFrustumMatrix(camera.frustum, viewProjection, invViewProjection);
}

export function resetCamera(camera: Camera) {
  const base = CameraSchema.identity;
  vec3.copy(camera.eye, base.eye);
  quat.copy(camera.rotation, base.rotation);
  camera.fovY = base.fovY;
  camera.zNear = base.zNear;
  camera.zFar = base.zFar;
  camera.distance = (camera.viewport[0] / camera.viewport[1]) * base.distance;
  recalcCameraProps(camera);
}

function lookAtCamera(camera: Camera, eye: vec3, target: vec3, up?: vec3) {
  // Set target eye
  vec3.copy(camera.targetEye, eye);

  // Compute rotate from ONB
  const scratchMat3 = Mat3Schema.alloc();
  const scratchMat4 = Mat4Schema.alloc();
  quat.fromMat3(
    camera.targetRotation,
    mat3.fromMat4(
      scratchMat3,
      mat4.lookAt(scratchMat4, eye, target, up || vec3.fromValues(0, 1, 0)),
    ),
  );
  Mat3Schema.free(scratchMat3);
  Mat4Schema.free(scratchMat4);
}

function tickFixed(camera: Camera, config: CameraConfiguration) {
  vec3.sub(camera.axis, config.target, config.eye);
  vec3.normalize(camera.axis, camera.axis);
  lookAtCamera(camera, config.eye, config.target, config.up);
}

const SCRATCH_AXIS = vec3.create();
function tickFPS(state: GameClientState, config: CameraConfiguration) {
  const local = state.local;
  const playerBody = getById(state.bodies, config.targetId);
  if (!playerBody) {
    return;
  }
  const axis = fromPolar(state.camera.axis, local.pitch, local.yaw, 1);
  const camera = state.camera;
  playerBody.copyPosition(camera.targetEye);
  const eye = camera.targetEye;

  let crouching = false;
  const input = getById(state.playerInputs, config.targetId);
  if (input && input.state & PlayerButtonState.CROUCH) {
    crouching = true;
  }

  eye[1] += (crouching ? 0.25 : 0.6) * playerBody.ry;
  const target = vec3.scaleAndAdd(
    camera.targetLook,
    eye,
    vec3.negate(SCRATCH_AXIS, axis),
    1,
  );
  lookAtCamera(state.camera, eye, target);
  state.camera.fpsID = config.targetId;
}

const HIT_RESULT = new VoxelRaycastHitResult();
const N_AXIS = vec3.create();
const R_AXIS = vec3.create();

const LIGHT_DIR = vec4.create();

function getCameraDistance(
  state: GameClientState,
  origin: vec3,
  axis: vec3,
  distance: number,
  u: number,
  v: number,
) {
  vec3.scaleAndAdd(N_AXIS, axis, R_AXIS, u);
  N_AXIS[1] += v;
  vec3.normalize(N_AXIS, N_AXIS);
  const hit = raycast(
    HIT_RESULT,
    state.blockIndex,
    state.voxel,
    origin,
    N_AXIS,
    distance,
    true,
  );
  if (hit) {
    return Math.min(distance, HIT_RESULT.hitDistance);
  } else {
    return distance;
  }
}

function tickFollow(state: GameClientState, config: CameraConfiguration) {
  const local = state.local;
  const playerBody = getById(state.bodies, config.targetId);
  if (!playerBody) {
    return;
  }

  const scaleDistance = playerBody.ry / PLAYER_HEIGHT;

  // move look target above player a bit to make cursor easier to see
  const delta = Vec3Schema.alloc();
  const origin = Vec3Schema.alloc();
  playerBody.copyPosition(origin);
  vec3.sub(delta, origin, state.camera.targetLook);
  const dy = 0.5 + playerBody.ry;
  const targetHit = raycast(
    HIT_RESULT,
    state.blockIndex,
    state.voxel,
    origin,
    UP,
    dy,
    true,
  );
  if (targetHit) {
    delta[1] += Math.max(HIT_RESULT.hitDistance - 0.1, 0);
  } else {
    delta[1] += dy;
  }

  // TODO: maybe apply some smoothing
  vec3.add(state.camera.targetLook, state.camera.targetLook, delta);
  Vec3Schema.free(delta);
  Vec3Schema.free(origin);

  // compute camera axis
  fromPolar(state.camera.axis, local.pitch, local.yaw, 1);

  // compute camera distance
  R_AXIS[0] = -state.camera.axis[2];
  R_AXIS[1] = 0;
  R_AXIS[2] = state.camera.axis[0];
  vec3.normalize(R_AXIS, R_AXIS);

  let distance = scaleDistance * state.camera.distance + 1;
  for (let u = -1; u <= 1; u += 1) {
    for (let v = -1; v <= 1; v += 1) {
      distance = getCameraDistance(
        state,
        state.camera.targetLook,
        state.camera.axis,
        distance,
        0.05 * u,
        0.05 * v,
      );
    }
  }

  let currentDistance = state.camera.currentDistance;
  if (distance < currentDistance) {
    currentDistance = distance;
  } else {
    currentDistance = Math.min(
      currentDistance + 0.03 * state.clock.deltaClock,
      distance,
    );
  }
  state.camera.currentDistance = currentDistance;

  if (currentDistance < 3 * scaleDistance) {
    tickFPS(state, <any>config);
  } else {
    vec3.scaleAndAdd(
      state.camera.targetEye,
      state.camera.targetLook,
      state.camera.axis,
      currentDistance - 1,
    );
    lookAtCamera(state.camera, state.camera.targetEye, state.camera.targetLook);
  }
}

function tickRelative(state: GameClientState, config: CameraConfiguration) {
  const playerBody = getById(state.bodies, config.targetId);
  if (!playerBody) {
    return;
  }

  const target = state.camera.targetLook;
  playerBody.copyPosition(target);
  if (config.freezedAxis & CameraFreezedAxis.X) {
    target[0] = config.target[0];
  }
  if (config.freezedAxis & CameraFreezedAxis.Y) {
    target[1] = config.target[1];
  }
  if (config.freezedAxis & CameraFreezedAxis.Z) {
    target[2] = config.target[2];
  }
  const eye = vec3.add(state.camera.targetEye, target, config.eye);
  lookAtCamera(state.camera, eye, target);
}

const UP_SCRATCH = vec3.create();

function tickDialogCamera(state: GameClientState, dialog: DialogCommonConfig) {
  let needsUpdate = false;

  if (dialog.lookTargetEnabled) {
    needsUpdate = true;
    const b = getById(state.renderBoxes, dialog.lookTargetEntity);
    const t = state.camera.targetLook;
    if (b) {
      t[0] = b.anchorX;
      t[1] = b.anchorY;
      t[2] = b.anchorZ;
    } else {
      vec3.set(t, 0, 0, 0);
    }
    t[0] += dialog.lookTargetOffset.x;
    t[1] += dialog.lookTargetOffset.y;
    t[2] += dialog.lookTargetOffset.z;
  }

  if (dialog.lookEyeEnabled) {
    needsUpdate = true;
    const b = getById(state.renderBoxes, dialog.lookEyeEntity);
    const e = state.camera.targetEye;
    if (b) {
      e[0] = b.anchorX;
      e[1] = b.anchorY;
      e[2] = b.anchorZ;
      if (
        dialog.lookEyeOffset.x === 0 &&
        dialog.lookEyeOffset.y === 0 &&
        dialog.lookEyeOffset.z === 0
      ) {
        state.camera.fpsID = dialog.lookEyeEntity;
      }
    } else {
      vec3.set(e, 0, 0, 0);
    }
    e[0] += dialog.lookEyeOffset.x;
    e[1] += dialog.lookEyeOffset.y;
    e[2] += dialog.lookEyeOffset.z;
  }

  if (dialog.lookUpEnabled) {
    needsUpdate = true;
    UP_SCRATCH[0] = dialog.lookUp.x;
    UP_SCRATCH[1] = dialog.lookUp.y;
    UP_SCRATCH[2] = dialog.lookUp.z;
    vec3.normalize(UP_SCRATCH, UP_SCRATCH);
  } else {
    UP_SCRATCH[0] = 0;
    UP_SCRATCH[1] = 1;
    UP_SCRATCH[2] = 0;
  }

  if (needsUpdate) {
    lookAtCamera(
      state.camera,
      state.camera.targetEye,
      state.camera.targetLook,
      UP_SCRATCH,
    );
  }
}

export function tickCamera(state: GameClientState) {
  const camera = state.camera;

  if (state.gl.regl) {
    camera.viewport[0] = state.gl.regl._gl.drawingBufferWidth;
    camera.viewport[1] = state.gl.regl._gl.drawingBufferHeight;
  } else if (state.gpu.rewgpu) {
    const { width, height } = state.gpu.rewgpu.canvas;
    camera.viewport[0] = width;
    camera.viewport[1] = height;
  } else {
    camera.viewport[0] = camera.viewport[1] = 1;
  }

  // Based on camera configuration update camera easing targets
  const config = state.secret.replica.camera;

  // Copy over propertioes
  camera.zFar = state.environment.drawDistance;
  camera.distance = Math.max(
    state.replica.running ? config.distance : camera.distance,
    MIN_CAMERA_DISTANCE,
  );
  state.camera.fpsID = 0;
  if (!camera.freezeFovY) {
    camera.fovY = config.fovY * Math.PI;
  }
  switch (config.mode) {
    case CameraMode.FIXED:
      tickFixed(camera, config);
      break;

    case CameraMode.FPS:
      tickFPS(state, config);
      break;

    case CameraMode.FOLLOW:
      tickFollow(state, config);
      break;

    case CameraMode.RELATIVE:
      tickRelative(state, config);
      break;
  }

  // apply dialog overrides
  if (state.dialog.dialogQueue.length > 0) {
    tickDialogCamera(state, state.dialog.dialogQueue[0].config.data.common);
  }

  // FIXME: apply some easing here
  vec3.copy(camera.eyeVelocity, camera.eye);
  vec3.copy(camera.eye, camera.targetEye);
  quat.copy(camera.rotation, camera.targetRotation);
  vec3.sub(camera.eyeVelocity, camera.eye, camera.eyeVelocity);
  if (state.clock.deltaTick > 0.001) {
    vec3.scale(
      camera.eyeVelocity,
      camera.eyeVelocity,
      1 / state.clock.deltaTick,
    );
  }

  // Recompute camera matrices
  recalcCameraProps(camera);

  const playerBody = getById(state.bodies, state.secret.id);
  if (playerBody) {
    const ray = Vec3Schema.alloc();
    const origin = Vec3Schema.alloc();

    // Compute cursor ray and hit voxel info
    screenToRay(state.camera, 0, 0, ray);
    vec3.scaleAndAdd(origin, state.camera.eye, ray, 0.5);
    const h = raycast(
      HIT_RESULT,
      state.blockIndex,
      state.voxel,
      origin,
      ray,
      32,
      true,
    );
    if (h && playerBody.vecDist(HIT_RESULT.hitPosition) <= 12) {
      state.camera.focalDistance = vec3.dist(
        HIT_RESULT.hitPosition,
        state.camera.eye,
      );
      state.local.isLooking = true;
      vec3.copy(state.local.lookTarget, HIT_RESULT.hitVoxel);
      vec3.copy(state.local.lookNormal, HIT_RESULT.hitNormal);
    } else {
      if (config.mode === CameraMode.FPS) {
        state.camera.focalDistance = 8;
      } else {
        state.camera.focalDistance = playerBody.vecDist(state.camera.eye);
      }
      state.local.isLooking = false;
    }

    // Update cross hair separation
    if (h) {
      if (config.mode === CameraMode.FPS) {
        state.camera.crosshairSeparation = 10 / (1 + HIT_RESULT.hitDistance);
      } else {
        state.camera.crosshairSeparation =
          10 / (1 + 0.25 * HIT_RESULT.hitDistance);
      }
    } else {
      state.camera.crosshairSeparation = 0;
    }

    Vec3Schema.free(ray);
    Vec3Schema.free(origin);
  }

  // Compute eye voxel
  const shape = state.voxel.shape;
  if (shape[0] > 0 && shape[1] > 0 && shape[2] > 0) {
    state.camera.eyeVoxel = state.voxel.getVoxel(
      Math.min(shape[0] - 1, Math.max(0, Math.floor(state.camera.eye[0]))),
      Math.min(shape[1] - 1, Math.max(0, Math.floor(state.camera.eye[1]))),
      Math.min(shape[2] - 1, Math.max(0, Math.floor(state.camera.eye[2]))),
    );
  } else {
    state.camera.eyeVoxel = 0;
  }

  const fluidType = state.blockIndex.fluid[state.camera.eyeVoxel & 0x0fff];
  state.camera.underwater = !!fluidType && state.camera.eyeVoxel !== 0;

  // get cached ambient light value from voxel worker
  const outdoor = state.light.ambient;

  // estimate brightness based on sun brightness and emissive light scale
  const { sunColor, skyFront, skyBack, skyLeft, skyRight, globalLight } =
    state.environment;
  const sideBrightness =
    Math.max(
      skyFront[0] + skyFront[1] + skyFront[2],
      skyBack[0] + skyBack[1] + skyBack[2],
      skyLeft[0] + skyLeft[1] + skyLeft[2],
      skyRight[0] + skyRight[1] + skyRight[2],
    ) / 3;
  const sunBrightness = Math.max(sunColor[0], sunColor[1], sunColor[2]);

  let outdoorBrightness = outdoor * sunBrightness;
  let indoorBrightness = (1 - outdoor) * sideBrightness;

  // HACK: boost night exposure a bit
  if (!state.environment.sunUp) {
    outdoorBrightness *= 2;
    indoorBrightness *= 2;
  }

  const brightness =
    outdoor * outdoorBrightness +
    EMISSIVE_SCALE / 32 +
    (1 - outdoor) *
      (EMISSIVE_SCALE / 20) *
      (globalLight ? indoorBrightness * globalLight : 1);
  state.camera.targetExposure = 1.0 / brightness;

  // when recovering from netskip just fastforward time of day
  if (state.net.netSkip) {
    state.camera.logExposureVelocity = 0;
    state.camera.currentExposure = state.camera.targetExposure;
  } else {
    // interpolate exposure
    const ce = Math.log(state.camera.currentExposure);
    const te = Math.log(state.camera.targetExposure);
    let de = te - ce;

    // Exposure adjusts more slowly when brightness has
    // increased. This "fixes" the issue where everything
    // indoors suddenly, inexplicably, goes totally dark when
    // a view towards the bright outdoors enters your POV.
    if (de < 0) {
      de = 0.2 * de;
    }
    state.camera.logExposureVelocity =
      0.9 * state.camera.logExposureVelocity + de * 0.004;
    state.camera.currentExposure = Math.exp(
      ce + state.camera.logExposureVelocity,
    );
  }

  // calculate screenLightPos
  for (let i = 0; i < 3; ++i) {
    LIGHT_DIR[i] = state.environment.sunDirection[i];
  }
  LIGHT_DIR[3] = 0;
  vec4.transformMat4(LIGHT_DIR, LIGHT_DIR, state.camera.viewProjection);
  state.camera.screenLightPos[0] = LIGHT_DIR[0] / LIGHT_DIR[3];
  state.camera.screenLightPos[1] = LIGHT_DIR[1] / LIGHT_DIR[3];
  state.camera.screenLightPos[2] = LIGHT_DIR[2];
}
