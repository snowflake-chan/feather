import { vec3 } from 'gl-matrix';

const CAMERA_POS_OFFSET = 26;

/**
 * 获得空间中心点作为摄像机目标
 */
export function getCameraTarget(max: vec3, min: vec3): vec3 {
  const target = vec3.create();
  vec3.sub(target, max, min);
  vec3.scale(target, target, 0.5);
  vec3.add(target, target, min);
  return target;
}

/**
 * 根据模型空间大小和摄像机目标计算摄像机位置
 */
export function getCameraPosition(max: vec3, min: vec3, target: vec3) {
  const distance = getCameraDefaultDist(max, min, Math.PI / 4);
  const dir = vec3.create();
  getCameraDir(dir, Math.PI / 4, Math.PI / 6);

  return vec3.scaleAndAdd(vec3.create(), target, dir, distance);
}

/**
 * 根据俯仰角和偏航角计算摄像机方向
 */
function getCameraDir(out: vec3, pitch: number, yaw: number) {
  const x = Math.cos(pitch) * Math.sin(yaw);
  const y = Math.sin(pitch);
  const z = Math.cos(pitch) * Math.cos(yaw);
  vec3.set(out, x, y, z);
}

/**
 * 根据空间大小和fov计算默认视角的相机距离
 */
function getCameraDefaultDist(max: vec3, min: vec3, fov: number) {
  const radius = vec3.distance(max, min) * 0.5;
  const sinFov = Math.sin(fov * 0.5);

  return radius / sinFov + CAMERA_POS_OFFSET;
}
