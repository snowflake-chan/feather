import { MuClientProtocol, MuClient } from '@box/mudb/client';
import { Semaphore } from '@box/utils/semaphore';
import { GameClientState } from '../game-client-schema';
import {
  SoundProtocolSchema,
  SoundEffect,
} from '@box/schema/sound/sound-protocol';
import {
  SoundResourceSchema,
  SoundNodeSchema,
  SoundNode,
  HashSetSchema,
  BackgroundSoundNode,
  SoundResource,
} from './client-sound-state';
import { vec3 } from 'gl-matrix';
import { getById } from '@box/utils/id';
import type { ContentResolver } from '@box/content-server/content-fetch';
import { resumeAudioContext } from './resume-audio-context';
import { userInteract } from '../utils/user-interact';
import type { EngineProfiler } from '../profile/profiler';
import { hashURL } from 'src/utils/hash-url';
import { GameAudio, OnGameAudioPause } from './game-audio';
import {
  ABORT_BATCH_PRELOAD,
  ABORT_LOADING_MESSAGE,
  GameAudioState,
} from './defs';

/**
 * 加载资源，转成audioBuffer
 * @param state GameClient状态
 * @param hash ipfs哈希 / url
 * @returns 加载的promise
 */
export async function preloadSoundSample(
  state: GameClientState,
  hash: string,
): Promise<SoundResource | null> {
  const soundState = state.sound;
  const { context, sampleCache } = soundState;

  if (!context) {
    return Promise.reject('Sound context is not available.');
  }

  if (hash in sampleCache) {
    return sampleCache[hash].promise;
  }

  const sample = SoundResourceSchema.alloc();

  sample.hash = hash;
  sample.loading = true;
  sample.buffer = null;
  sample.promise = null;

  sampleCache[hash] = sample;

  const loadAudioBuffer = generateLoadAudioBufferFn(state.content, context);

  sample.promise = loadAudioBuffer(hash)
    .then((audioBuffer) => {
      sample.buffer = audioBuffer;

      return sample;
    })
    .finally(() => {
      sample.loading = false;
    });

  return sample.promise;
}

type LoadAudioBuffer = (hash: string) => Promise<AudioBuffer>;

let loadAudioBufferFn: LoadAudioBuffer | undefined;

/**
 * 根据运行环境，动态生成方法，用于加载音频资源并生成audioBuffer
 */
function generateLoadAudioBufferFn(
  contentResolver: ContentResolver,
  audioContext: AudioContext,
) {
  if (loadAudioBufferFn) {
    return loadAudioBufferFn;
  }

  // 如果rustyLoadAudio存在，说明在rusty环境，直接用该方法
  if (window.rustyLoadAudio) {
    const { rustyLoadAudio } = window;

    loadAudioBufferFn = async (hash) => {
      try {
        return rustyLoadAudio(audioContext, hashURL(hash));
      } catch (err) {
        throw new Error('error when rusty loading audio: ' + hash);
      }
    };

    return loadAudioBufferFn;
  }

  /**
   * 旧版本浏览器的decodeAudioData不会返回Promise结果，而是需要入参callback
   * 这里保留旧代码的处理，如果浏览器提供的是webkitAudioContext，则入参callback
   */
  // old safari's webkitAudioContext don't support promise decodeAudioData
  if (
    typeof window !== 'undefined' &&
    typeof window['webkitAudioContext'] !== 'undefined'
  ) {
    loadAudioBufferFn = async (hash) => {
      const buffer = (await contentResolver.retrieve(hash))?.buffer;

      if (!buffer || !(buffer instanceof ArrayBuffer)) {
        throw new Error('error initializing audio sample ' + hash);
      }

      return new Promise((resolve, reject) => {
        audioContext.decodeAudioData(buffer, resolve, (err) =>
          reject(`error decoding audio sample: ${hash}.  reason: ${err}`),
        );
      });
    };

    return loadAudioBufferFn;
  }

  loadAudioBufferFn = async (hash) => {
    const buffer = (await contentResolver.retrieve(hash))?.buffer;

    if (!buffer || !(buffer instanceof ArrayBuffer)) {
      throw new Error('error initializing audio sample ' + hash);
    }

    try {
      return audioContext.decodeAudioData(buffer);
    } catch (err) {
      throw new Error(`error decoding audio sample: ${hash}.  reason: ${err}`);
    }
  };

  return loadAudioBufferFn;
}

function updateNodeGain(
  state: GameClientState,
  node: SoundNode,
  isClientScript: boolean,
) {
  if (!node.gameAudio) {
    return;
  }

  const { gainNode, sourceNode } = node.gameAudio;

  if (!gainNode) {
    return;
  }

  let volume = state.settings.masterMute
    ? 0
    : node.volumeModifier * state.settings.masterVolume;

  // 客户端脚本播放的音频目前只受“主音量”控制
  if (!isClientScript) {
    if (node.spatial) {
      if (state.settings.effectsMute) {
        volume = 0;
      } else {
        volume *= state.settings.effectsVolume;
        if (node.entity) {
          const b = getById(state.renderBoxes, node.entity);
          if (!b) {
            volume = 0;
            if (sourceNode) {
              muteNode(state.sound.activeSoundEffects, node, node.id);
            }
          } else {
            node.position[0] = b.anchorX;
            node.position[1] = b.anchorY;
            node.position[2] = b.anchorZ;
          }
        }
        const d2 = vec3.sqrDist(state.camera.eye, node.position);
        const r2 = node.radius * node.radius;
        if (d2 >= r2) {
          volume = 0;
        } else {
          volume *= Math.exp(-1 / (1 - d2 / r2));
        }
      }
    } else {
      if (state.settings.uiMute) {
        volume = 0;
      } else {
        volume *= state.settings.uiVolume;
      }
    }
  }

  if (volume !== node.volume || volume !== gainNode.gain.value) {
    node.volume = volume;
    gainNode.gain.value = volume;
  }
}

/**
 * 禁用音频节点
 * - 暂停gameAudio
 * - 把节点从“激活数组”（activeSoundEffects）中移除
 * - 根据节点clearOnMuted是否为true来决定是否回收节点（SoundNodeSchema.free()）
 */
function muteNode(soundNodes: SoundNode[], node: SoundNode, id: number) {
  if (node.id !== id) {
    return;
  }

  if (!node.playing) {
    return;
  }

  // clear playing flag
  node.playing = false;
  node.id = 0;

  // clear audio
  node.gameAudio?.pause();
  node.gameAudio = null;

  // remove from active list
  const idx = soundNodes.indexOf(node);
  if (idx >= 0) {
    soundNodes.splice(idx, 1);
  }

  // free node
  SoundNodeSchema.free(node);
}

export function playSoundEffectLocal(
  state: GameClientState,
  effect: SoundEffect,
) {
  if (effect.sampleId) {
    playSound(
      state,
      effect.sampleId,
      effect.gain + (Math.random() - 0.5) * effect.gainRange,
      effect.pitch + (Math.random() - 0.5) * effect.pitchRange,
      false,
      Infinity,
      0,
      0,
      0,
      0,
      0,
    );
  }
}

export function playSoundEffectEntity(
  state: GameClientState,
  effect: SoundEffect,
  id: number,
) {
  if (effect.sampleId) {
    const box = getById(state.renderBoxes, id);
    if (!box) {
      return;
    }
    playSound(
      state,
      effect.sampleId,
      effect.gain + (Math.random() - 0.5) * effect.gainRange,
      effect.pitch + (Math.random() - 0.5) * effect.pitchRange,
      true,
      effect.radius,
      id,
      box.anchorX,
      box.anchorY,
      box.anchorZ,
      0,
    );
  }
}

export function playSoundEffectSpatial(
  state: GameClientState,
  effect: SoundEffect,
  x: number,
  y: number,
  z: number,
  delay: number = 0,
) {
  if (effect.sampleId) {
    playSound(
      state,
      effect.sampleId,
      effect.gain + (Math.random() - 0.5) * effect.gainRange,
      effect.pitch + (Math.random() - 0.5) * effect.pitchRange,
      true,
      effect.radius,
      0,
      x,
      y,
      z,
      delay,
    );
  }
}

/**
 * 创建并播放声音节点
 * @param state 引擎状态
 * @param sampleId 音频的id
 * @param volume 音量
 * @param pitch 音高，用于修改播放速度（playbackRate.value）
 * @param spatial 是否空间音频
 * @param radius 空间音频的范围，也会影响其衰减计算
 * @param entityId 实体id，也跟空间音频计算有关
 * @param x 空间音频x坐标
 * @param y 空间音频y坐标
 * @param z 空间音频z坐标
 * @param delay 播放延时
 */
function playSound(
  state: GameClientState,
  sampleId: number,
  volume: number,
  pitch: number,
  spatial: boolean,
  radius: number,
  entityId: number,
  x: number,
  y: number,
  z: number,
  delay: number,
) {
  const { sound } = state;

  if (
    !sound.ready ||
    !sound.context ||
    exceededActiveSoundsLimit(state) ||
    sound.muted ||
    isNodeMuted({ volumeModifier: volume, pitchModifier: pitch })
  ) {
    return;
  }

  // get sample buffer
  const hash = sound.soundTable[sampleId];
  if (!hash) {
    return;
  }

  const sampleCache = sound.sampleCache[hash];
  if (!sampleCache) {
    preloadSoundSample(state, hash).catch((err) =>
      state.logger.error(`error loading sample ${hash}. reason: ${err}`),
    );
    return;
  }
  if (sampleCache.loading) {
    return;
  }

  const gameAudio = new GameAudio({
    audioContext: sound.context,
    audioBuffer: sampleCache.buffer,
    playbackRate: pitch,
    getOutput: () => sound.ambientFilter,
  });

  const soundNode = SoundNodeSchema.alloc();
  soundNode.id = sound.sfxId++;
  soundNode.hash = hash;
  soundNode.volumeModifier = volume;
  soundNode.pitchModifier = pitch;
  soundNode.radius = radius;
  soundNode.spatial = spatial;
  soundNode.entity = entityId;
  vec3.set(soundNode.position, x, y, z);

  soundNode.gameAudio = gameAudio;

  soundNode.playing = true;

  gameAudio.onEnded = () => {
    muteNode(state.sound.activeSoundEffects, soundNode, soundNode.id);
  };

  // 立即播放
  gameAudio.play(delay);

  updateNodeGain(state, soundNode, false);

  // push in active effect list
  sound.activeSoundEffects.push(soundNode);

  return gameAudio;
}

function muteBackgroundSound(node: BackgroundSoundNode) {
  // mute background sound
  if (node.sourceNode) {
    node.sourceNode.stop();
    node.sourceNode.disconnect();
    node.sourceNode = null;
  }

  if (node.gainNode) {
    node.gainNode.disconnect();
    node.gainNode = null;
  }

  node.hash = '';
  node.playing = false;
  node.volumeModifier = 1;
  node.pitchModifier = 1;
  node.buffer = null;
}

function updateBackgroundSound(
  state: GameClientState,
  node: BackgroundSoundNode,
  sfx: SoundEffect,
) {
  const context = state.sound.context;
  if (!context) {
    return;
  }

  const volumeScale =
    state.settings.musicMute || state.settings.masterMute
      ? 0
      : state.settings.musicVolume * state.settings.masterVolume;
  if (
    sfx.gain === 0 ||
    !sfx.sampleId ||
    !state.replica.running ||
    volumeScale == 0
  ) {
    muteBackgroundSound(node);
    return;
  }

  const hash = state.sound.soundTable[sfx.sampleId];
  if (!hash) {
    muteBackgroundSound(node);
    return;
  }

  if (!node.playing || node.hash !== hash) {
    // first mute and reset sound if already playing
    muteBackgroundSound(node);

    // next create a new gain node and source node and hook it up
    const sampleCache = state.sound.sampleCache[hash];
    if (!sampleCache) {
      preloadSoundSample(state, hash).catch((err) =>
        state.logger.error(`error loading sample ${hash}. reason: ${err}`),
      );
      return;
    }
    if (sampleCache.loading) {
      return;
    }

    // store modifiers
    node.hash = hash;
    node.volumeModifier = sfx.gain * volumeScale;
    node.pitchModifier = sfx.pitch;
    node.playing = true;

    // create source node
    const source = (node.sourceNode = context.createBufferSource());
    source.buffer = node.buffer = sampleCache.buffer;
    source.loop = true;
    source.playbackRate.value = node.pitchModifier;

    // create gain node
    const gain = (node.gainNode = context.createGain());
    gain.gain.value = node.volumeModifier;
    source.connect(gain);

    // connect gain to destination
    gain.connect(context.destination);

    // start playing sound
    source.start(0);
  } else {
    // update gains
    if (node.pitchModifier !== sfx.pitch) {
      if (node.sourceNode) {
        node.sourceNode.playbackRate.value = sfx.pitch;
      }
      node.pitchModifier = sfx.pitch;
    }

    const v = sfx.gain * volumeScale;
    if (node.volumeModifier !== v) {
      if (node.gainNode) {
        node.gainNode.gain.value = v;
      }
      node.volumeModifier = v;
    }
  }
}

export class SoundClient {
  public protocol: MuClientProtocol<typeof SoundProtocolSchema>;
  public state: GameClientState;
  private readonly gameAudios = new Map<number, GameAudio>();

  private readonly preloadList: PreloadRequest[] = [];

  /**
   * 批量加载时，并发数量限制，避免大量音频解析阻塞js执行（特别是在rusty环境中）
   */
  private readonly batchPreloadSemaphore: Semaphore = new Semaphore(20);
  private readonly batchPreloadAbortController = new AbortController();
  private readonly batchPreloadAborted: Promise<void>;

  constructor(spec: { client: MuClient; state: GameClientState }) {
    this.protocol = spec.client.protocol(SoundProtocolSchema);
    this.state = spec.state;

    this.protocol.configure({
      message: {
        resetDictionary: (samples) => {
          if (HashSetSchema.equal(this.state.sound.soundTable, samples)) {
            return;
          }

          HashSetSchema.assign(this.state.sound.soundTable, samples);

          this.preloadSoundSamples(this.state.sound.soundTable);
        },
        play: (message) => {
          const setSound = (s: ReturnType<typeof playSound>) => {
            if (s) {
              this.gameAudios.set(message.soundId, s);
            }
          };

          // play a sample at some location
          switch (message.position.type) {
            case 'player':
            case 'global':
              setSound(
                playSound(
                  this.state,
                  message.sampleId,
                  message.gain,
                  message.pitch,
                  false,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                ),
              );
              break;
            case 'entity':
              const id = <number>message.position.data;
              const box = getById(this.state.renderBoxes, id);
              if (box) {
                setSound(
                  playSound(
                    this.state,
                    message.sampleId,
                    message.gain,
                    message.pitch,
                    true,
                    message.radius,
                    id,
                    box.anchorX,
                    box.anchorY,
                    box.anchorZ,
                    0,
                  ),
                );
              }
              break;
            case 'position':
              const p = <vec3>message.position.data;
              setSound(
                playSound(
                  this.state,
                  message.sampleId,
                  message.gain,
                  message.pitch,
                  true,
                  message.radius,
                  0,
                  p[0],
                  p[1],
                  p[2],
                  0,
                ),
              );
              break;
          }
        },
        resume: (message) => {
          const s = this.gameAudios.get(message);
          if (s) {
            s.play();
          }
        },
        pause: (message) => {
          const s = this.gameAudios.get(message);
          if (s) {
            s.pause();
          }
        },

        stop: (message) => {
          const s = this.gameAudios.get(message);

          /**
           * stop其实是强制清理节点（muteNode）
           * 但sounds缓存的是gameAudio，而不是soundNode。
           *
           * 而通过playSound()方法创建的gameAudio必定会有onEnded，onEnded里会调用muteNode。
           * 这里就直接“偷鸡”取巧
           */
          if (s && s.onEnded) {
            s.onEnded();
          }
        },

        /**
         * 更新音频“当前时间”，而且不会改变音频播放状态
         * - 如果音频正在播放，跳转到“当前时间”接着播放
         * - 如果音频正在暂停，更新暂停时间为“当前时间”，下次继续播放就会从该时间播放
         */
        setCurrentTime: (message) => {
          const s = this.gameAudios.get(message.soundId);

          if (!s || s.getState() === GameAudioState.Ended) {
            return;
          }

          s.setOffset(message.currentTime);
        },

        /**
         * 当音频暂停时，从指定时间继续播放
         */
        setCurrentTimeAndResume: (message) => {
          const s = this.gameAudios.get(message.soundId);

          if (!s || s.getState() !== GameAudioState.Paused) {
            return;
          }

          s.setOffset(message.currentTime);
          s.play();
        },
      },
    });

    this.batchPreloadAborted = new Promise<void>((resolve, reject) => {
      this.batchPreloadAbortController.signal.onabort = () =>
        reject(ABORT_BATCH_PRELOAD);
    });

    this.initContext();

    // 如果运行在rusty_box，不需要用户交互就能够播放声音
    if (window.rustyLoadAudio) {
      this.state.sound.ready = true;

      return;
    }

    // 如果是在浏览器运行，需要在用户交互时，解锁音频播放限制
    userInteract(this.resumeContext);
  }

  /**
   * 初始化AudioContext
   * - AudioContext的初始化和音频数据加载并不需要跟用户交互强绑定，可以提前执行
   * - 在Chrome里，提前初始化会在控制台产生警报“The AudioContext was not allowed to start”。
   *   不过无关紧要，此时只是初始化用来加载数据，并不播放。
   */
  private initContext = () => {
    const { sound } = this.state;

    if (!sound.supported || sound.ready) {
      return;
    }

    if (!sound.context) {
      let context: AudioContext;

      if (typeof AudioContext !== 'undefined') {
        context = new AudioContext();
      } else if (typeof window['webkitAudioContext'] !== 'undefined') {
        context = new window['webkitAudioContext']();
      } else {
        sound.supported = false;

        return;
      }

      sound.context = context;
    }

    const { context } = sound;

    const ambientFilter = (sound.ambientFilter = context.createBiquadFilter());

    ambientFilter.frequency.value = context.sampleRate / 2;
    ambientFilter.Q.value = 10;
    ambientFilter.type = 'lowpass';
    ambientFilter.connect(context.destination);
  };

  /**
   * 通过播放空白音频的方式，使audioContext从暂停（suspended）切换到运行（running）
   * 需要在用户交互中绑定
   */
  private resumeContext = async () => {
    if (!this.state.sound.context || this.state.sound.ready) {
      return;
    }

    try {
      await resumeAudioContext(this.state.sound.context);

      this.state.sound.ready = true;
    } catch (err) {
      this.state.logger.error(`Resume AudioContext error : ${err}`);
    }
  };

  /**
   * 批量加载音频数据
   * - 只进行一次加载，不保证全部成功
   */
  public preloadSoundSamples = (samples: string[]) => {
    return Promise.all(
      samples.map((sampleHash) => {
        if (!sampleHash) {
          return;
        }

        return Promise.race([
          this.batchPreloadAborted,
          this.batchPreloadSemaphore.p(1),
        ])
          .then(() => preloadSoundSample(this.state, sampleHash))
          .catch((err) => {
            if (err === ABORT_BATCH_PRELOAD) {
              return;
            }

            this.state.logger.error(
              `SoundClient failed to preload sample ${sampleHash} error: ${err}`,
            );
          })
          .finally(() => this.batchPreloadSemaphore.v(1));
      }),
    );
  };

  public destroy() {
    const soundState = this.state.sound;
    const { activeSoundEffects, activeClientNodes } = soundState;
    activeSoundEffects.forEach((node) =>
      muteNode(activeSoundEffects, node, node.id),
    );
    activeClientNodes.forEach((node) =>
      muteNode(activeClientNodes, node, node.id),
    );
    muteBackgroundSound(this.state.sound.backgroundSound);
    muteBackgroundSound(this.state.sound.music);

    this.preloadList.forEach(({ abortController }) => abortController.abort());
    this.preloadList.length = 0;

    this.batchPreloadAbortController.abort();

    // 清掉audioBuffer
    Object.values(this.state.sound.sampleCache).forEach((sample) => {
      sample.buffer = null;
      sample.promise = null;
    });
    soundState.ambientFilter?.disconnect();
    soundState.ambientFilter = null;
    soundState.context?.close();
    soundState.context = null;

    loadAudioBufferFn = undefined;
  }

  public poll(profiler: EngineProfiler) {
    const soundState = this.state.sound;
    const context = soundState.context;
    if (!soundState.supported || !soundState.ready || !context) {
      return;
    }

    if (profiler.viewAudioProfilingEnabled) {
      profiler.profileActiveSoundEffects(this.state.sound.activeSoundEffects);
    }

    const settings = this.state.settings;

    const isMasterMute = settings.masterMute || settings.masterVolume === 0;
    const isRunningStateChanged =
      this.state.idle ||
      !this.state.ready ||
      this.state.prevRunning !== this.state.replica.running;

    const nextMuted = isMasterMute || isRunningStateChanged;

    const underwaterFilter = soundState.ambientFilter;
    // enter mute state, clear all sounds
    if (nextMuted && !soundState.muted) {
      soundState.muted = true;

      // stop all effects
      const sounds = soundState.activeSoundEffects;

      while (sounds.length > 0) {
        const s = sounds.pop();
        if (s) {
          muteNode(soundState.activeSoundEffects, s, s.id);
        }
      }

      if (underwaterFilter) {
        underwaterFilter.disconnect(context.destination);
      }

      // mute background sound
      muteBackgroundSound(this.state.sound.backgroundSound);
      muteBackgroundSound(this.state.sound.music);
    }

    /**
     * 客户端脚本的音频只在状态切换时，清空音频
     */
    if (isRunningStateChanged) {
      while (soundState.activeClientNodes.length > 0) {
        const s = soundState.activeClientNodes.pop();
        if (!s) {
          continue;
        }

        muteNode(soundState.activeClientNodes, s, s.id);
      }

      this.preloadList.forEach(({ abortController }) =>
        abortController.abort(),
      );
    } else {
      for (let i = soundState.activeClientNodes.length - 1; i >= 0; --i) {
        updateNodeGain(this.state, soundState.activeClientNodes[i], true);
      }
    }

    // muted, skip sound update
    if (nextMuted && soundState.muted) {
      return;
    }

    if (underwaterFilter) {
      if (soundState.muted) {
        underwaterFilter.connect(context.destination);
      }
      if (this.state.camera.underwater) {
        underwaterFilter.frequency.value = 300;
      } else {
        underwaterFilter.frequency.value = context.sampleRate / 2;
      }
    }

    // turn off muted flag
    soundState.muted = false;

    // update volume for all nodes
    for (let i = soundState.activeSoundEffects.length - 1; i >= 0; --i) {
      updateNodeGain(this.state, soundState.activeSoundEffects[i], false);
    }

    // update background sound and music
    updateBackgroundSound(
      this.state,
      this.state.sound.backgroundSound,
      this.state.replica.sound.ambientSound.ambient,
    );
    updateBackgroundSound(
      this.state,
      this.state.sound.music,
      this.state.secret.replica.music,
    );
  }

  /**
   * 首次加载已配置的音频
   */
  public async loadFirstSampleHashes(sampleHashes: string[]) {
    if (this.state.sound.firstLoaded) {
      return;
    }

    await this.preloadSoundSamples(sampleHashes);

    this.state.sound.firstLoaded = true;
  }

  /**
   * 播放客户端脚本音频
   */
  public playClientNode(spec: PlayNodeSpec) {
    // 上下文不可用
    if (!this.state.sound.ready || !this.state.sound.context) {
      throw new Error('Audio context is not available');
    }

    // 超过播放数量限制
    if (exceededActiveSoundsLimit(this.state)) {
      throw new Error('Exceeded active sounds limit');
    }

    const { offset, ...createNodeSpec } = spec;

    const { soundNode, gameAudio } = this.createNode(
      createNodeSpec,
      this.state.sound.context,
    );

    if (typeof offset !== 'undefined') {
      gameAudio.setOffset(offset);
    }
    gameAudio.play();

    updateNodeGain(this.state, soundNode, true);

    this.state.sound.activeClientNodes.push(soundNode);

    return soundNode.id;
  }

  /**
   * 销毁节点，并返回当前播放进度
   */
  public pauseNode(nodeId: number) {
    const { activeClientNodes } = this.state.sound;

    const soundNode = activeClientNodes.find(({ id }) => id === nodeId);

    if (!soundNode) {
      return 0;
    }

    soundNode.gameAudio?.pause();
    const offset = soundNode.gameAudio?.getOffset() || 0;

    muteNode(this.state.sound.activeClientNodes, soundNode, soundNode.id);

    return offset;
  }

  /**
   * 播放客户端脚本音频
   */
  private createNode(
    spec: CreateNodeSpec,
    context: AudioContext,
  ): {
    soundNode: SoundNode;
    gameAudio: GameAudio;
  } {
    const { sound } = this.state;

    const {
      url,
      audioBuffer,
      volumeModifier,
      pitchModifier = 1,
      onEnded,
      onPause,
    } = spec;

    const gameAudio = new GameAudio({
      audioContext: context,
      audioBuffer,
      playbackRate: pitchModifier,
      getOutput: () => sound.context?.destination || null,
    });

    const soundNode = SoundNodeSchema.alloc();

    soundNode.id = sound.sfxId++;

    soundNode.hash = url;
    soundNode.buffer = audioBuffer;
    soundNode.volumeModifier = volumeModifier;
    soundNode.pitchModifier = pitchModifier;

    soundNode.gameAudio = gameAudio;

    // 以下这些状态暂时不能控制
    soundNode.entity = 0;
    soundNode.spatial = false;
    soundNode.radius = 0;

    soundNode.playing = true;

    gameAudio.onEnded = () => {
      muteNode(this.state.sound.activeClientNodes, soundNode, soundNode.id);
      onEnded?.();
    };

    gameAudio.onPause = onPause;

    return { soundNode, gameAudio };
  }

  public setVolume(nodeId: number, volume: number) {
    const { activeClientNodes } = this.state.sound;

    const node = activeClientNodes.find(({ id }) => id === nodeId);

    if (node) {
      node.volumeModifier = volume;
    }
  }

  public preload(url: string): PreloadRequest {
    const abortController = new AbortController();

    const abort = new Promise<SoundResource>((resolve, reject) => {
      // 没有用signal.reason是因为浏览器兼容性要求较高
      abortController.signal.onabort = () => reject(ABORT_LOADING_MESSAGE);
    });
    const preloadPromise = preloadSoundSample(this.state, url);

    const res = Promise.race([preloadPromise, abort]).finally(() => {
      const idx = this.preloadList.findIndex((item) => item === preloadRequest);

      if (idx >= 0) {
        this.preloadList.splice(idx, 1);
      }
    });

    const preloadRequest = {
      abortController,
      promise: res,
    };

    this.preloadList.push(preloadRequest);

    return preloadRequest;
  }
}

type CreateNodeSpec = {
  url: string;
  audioBuffer: AudioBuffer;
  volumeModifier: number;
  pitchModifier?: number;
  onEnded?: () => void;
  onPause?: OnGameAudioPause;
};

interface PlayNodeSpec extends CreateNodeSpec {
  offset?: number;
}

type PreloadRequest = {
  promise: Promise<SoundResource | null>;
  abortController: AbortController;
};

/**
 * “激活的音频”数量是否已到达限制
 */
function exceededActiveSoundsLimit(state: GameClientState) {
  const { sound, settings } = state;

  const total =
    sound.activeSoundEffects.length + sound.activeClientNodes.length;

  return total >= settings.maxSoundEffects;
}

/**
 * 判断一个声音是否为静音
 * - 音量系数小于0.1
 * - 速率系数小于0.1
 */
function isNodeMuted(
  spec: Pick<SoundNode, 'volumeModifier' | 'pitchModifier'>,
) {
  return spec.volumeModifier < 0.1 || spec.pitchModifier < 0.1;
}
