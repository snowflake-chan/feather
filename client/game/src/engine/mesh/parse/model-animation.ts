import {
  calcEasing,
  lerp,
  modelV7,
  ChannelNodePath,
  ProjectInterpolationType,
  MotionMetaData,
} from '@box/voxa-project';
import { NetModelMotion } from '@box/schema/mesh/model-schema';
import { MS_PER_TICK } from '@box/schema/clock/clock-schema';
import { mat4, quat, vec3 } from 'gl-matrix';
import { MeshRenderable } from '../renderable-schema';
import {
  KeyframeSchema,
  NodeKeyframes,
  NodesInfoSchema,
  Animation,
  NodeTransformSchema,
} from './mesh-schema';
import { GameClientState } from '../../game-client-schema';

type ModelAnimation = typeof modelV7.AnimationSchema.identity;
type ModelNodes = typeof modelV7.ModelNodesSchema.identity;
type ModelKeyframe = typeof KeyframeSchema.identity;

interface PendingKeyframe {
  time: number;
  interpolation: ProjectInterpolationType;
  translate?: vec3;
  rotation?: quat;
  scale?: vec3;
  alpha?: number;
}

export function parseModelAnimation(
  modelAnimation: ModelAnimation,
  modelNodes: ModelNodes,
  motionMetaData?: MotionMetaData,
) {
  const animation: Animation = {
    id: modelAnimation.id,
    name: modelAnimation.name,
    duration: motionMetaData?.duration || 0,
    isTransparent: false,
    nodes: {},
  };
  const nodesKeyframe: Record<string, Record<string, PendingKeyframe>> = {};

  modelAnimation.channels.forEach((channel) => {
    const nodeIdx = channel.target.node;
    if (!nodesKeyframe[nodeIdx]) {
      nodesKeyframe[nodeIdx] = {};
    }

    const keyframes = nodesKeyframe[nodeIdx];
    const sampler = modelAnimation.samplers[channel.sampler];
    sampler.input.forEach((time, inputIdx) => {
      if (!keyframes[time]) {
        keyframes[time] = {
          time,
          interpolation: sampler.interpolation,
        };
      }
      /**
       * 同一个关键帧（keyframes[time]）可能会被再次查找到，因为上一帧段的结尾是下一帧段的开始
       * 只有当关键帧作为起始帧的时候，才应该取sampler的补帧方式
       * 因为sampler会依序遍历，这里只需要每次检索到都赋值sampler的补帧方式即可
       */
      keyframes[time].interpolation = sampler.interpolation;

      switch (channel.target.path) {
        case ChannelNodePath.Alpha:
          keyframes[time].alpha = sampler.output.data[inputIdx] as number;
          return;
        case ChannelNodePath.Rotation:
          keyframes[time].rotation = quat.fromValues(
            sampler.output.data[inputIdx][0],
            sampler.output.data[inputIdx][1],
            sampler.output.data[inputIdx][2],
            sampler.output.data[inputIdx][3],
          );
          return;
        case ChannelNodePath.Translation:
          keyframes[time].translate = vec3.fromValues(
            sampler.output.data[inputIdx][0],
            sampler.output.data[inputIdx][1],
            sampler.output.data[inputIdx][2],
          );
          return;
        case ChannelNodePath.Scale:
          keyframes[time].scale = vec3.fromValues(
            sampler.output.data[inputIdx][0],
            sampler.output.data[inputIdx][1],
            sampler.output.data[inputIdx][2],
          );
          return;
        default:
          return;
      }
    });
  });
  const pendingNodes: Record<string, PendingKeyframe[]> = {};
  Object.keys(nodesKeyframe).forEach((nodeIdx) => {
    pendingNodes[nodeIdx] = Object.values(nodesKeyframe[nodeIdx]).sort(
      (a, b) => a.time - b.time,
    );
  });

  Object.keys(pendingNodes).forEach((nodeIdx) => {
    const nodeKeyframe: ModelKeyframe[] = [];
    animation.nodes[nodeIdx] = nodeKeyframe;

    const pendingKeyframes = pendingNodes[nodeIdx];
    const getPrevFrame = (frameIdx: number) => {
      if (frameIdx > 0) {
        const keyframe = nodeKeyframe[frameIdx - 1];
        return {
          translate: keyframe.translate,
          rotation: keyframe.rotation,
          scale: keyframe.scale,
          alpha: keyframe.alpha,
        };
      }
      const nodes = modelNodes[parseInt(nodeIdx)];
      return {
        translate: nodes.translation,
        rotation: nodes.rotation,
        scale: nodes.scale,
        alpha: nodes.alpha,
      };
    };
    for (let i = 0; i < pendingKeyframes.length; i++) {
      const frame = pendingKeyframes[i];
      const prevFrame = getPrevFrame(i);
      const alpha = frame.alpha !== undefined ? frame.alpha : prevFrame.alpha;

      // 只要有一个部件一帧透明度不为1，整个动画在不透明的队列里渲染
      if (alpha !== 1 && !animation.isTransparent) {
        animation.isTransparent = true;
      }
      nodeKeyframe.push({
        time: frame.time,
        interpolation: frame.interpolation,
        translate: frame.translate || prevFrame.translate,
        rotation: frame.rotation || prevFrame.rotation,
        scale: frame.scale || prevFrame.scale,
        alpha,
      });
    }
  });

  // 如果动画数据已经表明此动画为透明的，不需要再检查直接返回
  // 否则需要再检查一遍此时所有的游离部件是否有透明的
  if (animation.isTransparent) {
    return animation;
  }

  for (let i = 0; i < modelNodes.length; i++) {
    if (animation.nodes[i]) {
      continue;
    }
    if (modelNodes[i].alpha !== 1) {
      animation.isTransparent = true;
      return animation;
    }
  }

  return animation;
}
export interface ParsedPlayInfo {
  playbackTime: number;
  animation: Animation;
}

const TEMP_NODES_MATRIX: mat4[] = [];
const TEMP_TRANSFORM = NodeTransformSchema.alloc();
export function setTextureData(
  out: {
    matrixData: Float32Array | mat4[];
    alphaData: Uint8Array | Float32Array;
  },
  nodesInfo: typeof NodesInfoSchema.identity,
  parsedPlayInfo?: ParsedPlayInfo,
) {
  if (TEMP_NODES_MATRIX.length < nodesInfo.length) {
    for (let i = TEMP_NODES_MATRIX.length; i < nodesInfo.length; i++) {
      TEMP_NODES_MATRIX.push(mat4.create());
    }
  }
  TEMP_NODES_MATRIX.length = nodesInfo.length;

  const useRGBA = out.alphaData instanceof Uint8Array;
  for (let i = 0; i < nodesInfo.length; i++) {
    const info = nodesInfo[i];
    const currMatrix = TEMP_NODES_MATRIX[i];

    let useTemp = false;

    // 如果入参parsedPlayInfo, 说明需要解析当前播放的动画数据
    if (parsedPlayInfo) {
      const { animation, playbackTime } = parsedPlayInfo;
      const nodeKeyframes = animation.nodes[i];
      if (nodeKeyframes) {
        setNodeInfo(TEMP_TRANSFORM, playbackTime, nodeKeyframes);
        useTemp = true;
      }
    }

    if (useTemp) {
      mat4.fromRotationTranslationScale(
        currMatrix,
        TEMP_TRANSFORM.rotation,
        TEMP_TRANSFORM.translate,
        TEMP_TRANSFORM.scale,
      );
    } else {
      mat4.fromRotationTranslationScale(
        currMatrix,
        info.rotation,
        info.translate,
        info.scale,
      );
    }

    let a00 = info.parentScaleMat3[0],
      a01 = info.parentScaleMat3[1],
      a02 = info.parentScaleMat3[2];
    let a10 = info.parentScaleMat3[3],
      a11 = info.parentScaleMat3[4],
      a12 = info.parentScaleMat3[5];
    let a20 = info.parentScaleMat3[6],
      a21 = info.parentScaleMat3[7],
      a22 = info.parentScaleMat3[8];
    let b0 = currMatrix[0],
      b1 = currMatrix[1],
      b2 = currMatrix[2],
      b3 = currMatrix[3];
    currMatrix[0] = b0 * a00 + b1 * a10 + b2 * a20;
    currMatrix[1] = b0 * a01 + b1 * a11 + b2 * a21;
    currMatrix[2] = b0 * a02 + b1 * a12 + b2 * a22;
    currMatrix[3] = b3;
    b0 = currMatrix[4];
    b1 = currMatrix[5];
    b2 = currMatrix[6];
    b3 = currMatrix[7];
    currMatrix[4] = b0 * a00 + b1 * a10 + b2 * a20;
    currMatrix[5] = b0 * a01 + b1 * a11 + b2 * a21;
    currMatrix[6] = b0 * a02 + b1 * a12 + b2 * a22;
    currMatrix[7] = b3;
    b0 = currMatrix[8];
    b1 = currMatrix[9];
    b2 = currMatrix[10];
    b3 = currMatrix[11];
    currMatrix[8] = b0 * a00 + b1 * a10 + b2 * a20;
    currMatrix[9] = b0 * a01 + b1 * a11 + b2 * a21;
    currMatrix[10] = b0 * a02 + b1 * a12 + b2 * a22;
    currMatrix[11] = b3;
    b0 = currMatrix[12];
    b1 = currMatrix[13];
    b2 = currMatrix[14];
    b3 = currMatrix[15];
    currMatrix[12] = b0 * a00 + b1 * a10 + b2 * a20;
    currMatrix[13] = b0 * a01 + b1 * a11 + b2 * a21;
    currMatrix[14] = b0 * a02 + b1 * a12 + b2 * a22;
    currMatrix[15] = b3;

    if (info.parent > -1) {
      a00 = TEMP_NODES_MATRIX[info.parent][0];
      a01 = TEMP_NODES_MATRIX[info.parent][1];
      a02 = TEMP_NODES_MATRIX[info.parent][2];
      const a03 = TEMP_NODES_MATRIX[info.parent][3];

      a10 = TEMP_NODES_MATRIX[info.parent][4];
      a11 = TEMP_NODES_MATRIX[info.parent][5];
      a12 = TEMP_NODES_MATRIX[info.parent][6];
      const a13 = TEMP_NODES_MATRIX[info.parent][7];

      a20 = TEMP_NODES_MATRIX[info.parent][8];
      a21 = TEMP_NODES_MATRIX[info.parent][9];
      a22 = TEMP_NODES_MATRIX[info.parent][10];
      const a23 = TEMP_NODES_MATRIX[info.parent][11];

      const a30 = TEMP_NODES_MATRIX[info.parent][12],
        a31 = TEMP_NODES_MATRIX[info.parent][13],
        a32 = TEMP_NODES_MATRIX[info.parent][14],
        a33 = TEMP_NODES_MATRIX[info.parent][15];

      b0 = currMatrix[0];
      b1 = currMatrix[1];
      b2 = currMatrix[2];
      b3 = currMatrix[3];
      currMatrix[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      currMatrix[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      currMatrix[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      currMatrix[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = currMatrix[4];
      b1 = currMatrix[5];
      b2 = currMatrix[6];
      b3 = currMatrix[7];
      currMatrix[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      currMatrix[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      currMatrix[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      currMatrix[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = currMatrix[8];
      b1 = currMatrix[9];
      b2 = currMatrix[10];
      b3 = currMatrix[11];
      currMatrix[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      currMatrix[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      currMatrix[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      currMatrix[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = currMatrix[12];
      b1 = currMatrix[13];
      b2 = currMatrix[14];
      b3 = currMatrix[15];
      currMatrix[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      currMatrix[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      currMatrix[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      currMatrix[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    }

    if (Array.isArray(out.matrixData)) {
      out.matrixData.push(mat4.clone(currMatrix));
    } else {
      out.matrixData.set(currMatrix, i * 16);
    }

    const alpha = useTemp ? TEMP_TRANSFORM.alpha : info.alpha;
    if (useRGBA) {
      // 按照RGBA的规则给图片数据赋值，前三位为空，第四位放置透明度数据
      out.alphaData.set([0, 0, 0, Math.round(alpha * 255)], i * 4);
    } else {
      out.alphaData.set([alpha], i);
    }
  }
}

function setNodeInfo(
  out: typeof NodeTransformSchema.identity,
  time: number,
  nodeKeyframes: typeof NodeKeyframes.identity,
) {
  const { translate, rotation, scale } = out;

  const nextFrameIdx = nodeKeyframes.findIndex((i) => i.time > time);

  if (nextFrameIdx <= 0) {
    const lastKeyframe = nodeKeyframes[nodeKeyframes.length - 1];
    vec3.copy(translate, lastKeyframe.translate);
    quat.copy(rotation, lastKeyframe.rotation);
    vec3.copy(scale, lastKeyframe.scale);
    out.alpha = lastKeyframe.alpha;
    return;
  }

  const currKeyframe = nodeKeyframes[nextFrameIdx - 1];
  const nextKeyframe = nodeKeyframes[nextFrameIdx];

  const duration = nextKeyframe.time - currKeyframe.time;
  let weight = (time - currKeyframe.time) / duration;
  weight = calcEasing(currKeyframe.interpolation, weight);

  vec3.lerp(translate, currKeyframe.translate, nextKeyframe.translate, weight);
  quat.slerp(rotation, currKeyframe.rotation, nextKeyframe.rotation, weight);
  vec3.lerp(scale, currKeyframe.scale, nextKeyframe.scale, weight);
  out.alpha = lerp(currKeyframe.alpha, nextKeyframe.alpha, weight);
}

/**
 * 取余。如果除数为0，则返回0
 * @param value 被除数
 * @param divisor 除数
 * @returns 余数
 */
function mod(value: number, divisor: number) {
  if (!divisor) {
    return 0;
  }
  return value % divisor;
}

export function parsePlayback(
  state: GameClientState,
  glMesh: MeshRenderable,
  modelMotion: NetModelMotion,
): ParsedPlayInfo | undefined {
  const { paused, pausedTick } = modelMotion;
  const { cycleCount, motions, startTick } = modelMotion.playback;

  // 没有动作需要播放
  if (!motions.length) {
    return;
  }

  // 先通过motion数据解析出渲染相关数据
  let onceTime = 0;
  const animationsInfo: {
    animation: Animation;
    playTime: number;
  }[] = [];

  for (let i = 0; i < motions.length; i++) {
    const motion = motions[i];
    const animation = glMesh.animations.find((a) => a.id === motion.motionId);
    if (!animation) {
      return;
    }
    const playTime =
      motion.cycleCount < 0 ? Infinity : motion.cycleCount * animation.duration;
    animationsInfo.push({
      animation,
      playTime,
    });
    onceTime += playTime;
  }
  const currTick = paused ? pausedTick : state.clock.tick;
  let playbackTime = ((currTick - startTick) * MS_PER_TICK) / 1000;
  let animation: Animation | undefined;

  // 无限循环或者没有播放完成，取余算当前次数的动作播放时间
  if (cycleCount < 0 || playbackTime < cycleCount * onceTime) {
    playbackTime = mod(playbackTime, onceTime);
  }

  // 计算确定当前时间在动作链中的哪一个动作的哪个时间点
  for (let i = 0; i < animationsInfo.length; i++) {
    const info = animationsInfo[i];
    if (info.playTime === Infinity || playbackTime <= info.playTime) {
      playbackTime = mod(playbackTime, info.animation.duration);
      animation = info.animation;
      break;
    }
    playbackTime = playbackTime - info.playTime;
  }

  if (!animation) {
    return;
  }

  return {
    animation,
    playbackTime,
  };
}

export function parseDefaultMotion(
  glMesh: MeshRenderable,
  defaultMotion: {
    id: string;
    startTick: number;
    currTick: number;
  },
): ParsedPlayInfo | undefined {
  const { id, startTick, currTick } = defaultMotion;
  const defaultAnimation = glMesh.animations.find((a) => a.id === id);
  if (!defaultAnimation) {
    return;
  }
  // 默认动作无限循环播放
  return {
    playbackTime: mod(
      ((currTick - startTick) * MS_PER_TICK) / 1000,
      defaultAnimation.duration,
    ),
    animation: defaultAnimation,
  };
}
