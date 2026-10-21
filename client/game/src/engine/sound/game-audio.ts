import { GameAudioState } from './defs';

export type GameAudioSpec = {
  /**
   * 音频上下文
   */
  audioContext: AudioContext;
  /**
   * 音频资源内存
   */
  audioBuffer: AudioBuffer | null;
  /**
   * 播放速率
   */
  playbackRate: number;
  /**
   * 获取音频输出节点，播放（play）时，会连接至该节点
   * @returns 音频输出节点
   */
  getOutput: () => AudioNode | null;
  /**
   * 播放结束时的事件回调
   */
  onEnded?: () => void;
  /**
   * 播放暂停时的事件毁掉
   */
  onPause?: OnGameAudioPause;
};

export type OnGameAudioPause = (offset: number) => void;

/**
 * 音频播放、控制的类
 * - 需要把gainNode连接到输出节点，才能够播放
 */
export class GameAudio {
  private state = GameAudioState.Paused;

  /**
   * 当前播放时间（自身只会在pause的时候更新）
   * 以秒为单位
   */
  private offset = 0;

  /**
   * 记录调用play时，上下文的时间（audioContext.currentTime）
   * 以秒为单位
   */
  private when = 0;

  public playbackRate: number = 1;

  public sourceNode?: AudioBufferSourceNode;
  public gainNode: GainNode;

  private audioContext: AudioContext;
  private audioBuffer: AudioBuffer | null;

  public getOutput: () => AudioNode | null;
  public onEnded?: () => void;
  public onPause?: (offset: number) => void;

  constructor(spec: GameAudioSpec) {
    const {
      audioContext,
      audioBuffer,
      playbackRate,
      getOutput,
      onEnded,
      onPause,
    } = spec;

    this.audioContext = audioContext;
    this.audioBuffer = audioBuffer;
    this.gainNode = audioContext.createGain();
    this.playbackRate = playbackRate;

    this.getOutput = getOutput;
    this.onEnded = onEnded;
    this.onPause = onPause;
  }

  /**
   * 开始播放，如果已经在播放，或者没有播放资源，则不会有效果。
   * @param delay 播放延迟，以秒为单位
   * @returns 是否成功播放
   */
  public play(delay = 0) {
    if (this.state === GameAudioState.Playing || !this.audioBuffer) {
      return false;
    }

    this.state = GameAudioState.Playing;

    this.sourceNode = this.createSourceNode();

    this.when = this.audioContext.currentTime + delay;

    this.sourceNode.start(this.when, this.offset);

    const outputNode = this.getOutput();
    outputNode && this.gainNode.connect(outputNode);

    return true;
  }

  private createSourceNode() {
    const sourceNode = this.audioContext.createBufferSource();

    sourceNode.buffer = this.audioBuffer;
    sourceNode.playbackRate.value = this.playbackRate;

    sourceNode.addEventListener('ended', this.onSourceNodeEnded);

    sourceNode.connect(this.gainNode);

    return sourceNode;
  }

  private onSourceNodeEnded = () => {
    if (this.state === GameAudioState.Ended) {
      return;
    }

    this.clearNodes();

    this.state = GameAudioState.Ended;

    // 仅在播放结束时，清空进度记录
    this.offset = 0;

    this.onEnded?.();
  };

  /**
   * 清理节点
   * - 移除ended监听
   * - 停止播放
   * - 断开节点连接
   * - 清理引用
   */
  private clearNodes = () => {
    if (this.sourceNode) {
      this.sourceNode.removeEventListener('ended', this.onSourceNodeEnded);

      this.sourceNode.stop();

      this.sourceNode.disconnect();

      this.sourceNode = undefined;
    }

    this.gainNode.disconnect();
  };

  public pause() {
    if (this.state !== GameAudioState.Playing) {
      return;
    }

    this.state = GameAudioState.Paused;

    this.clearNodes();

    // 暂停时，要累计播放进度
    this.offset += this.audioContext.currentTime - this.when;

    this.when = 0;

    this.onPause?.(this.offset);
  }

  public getState() {
    return this.state;
  }

  /**
   * 设置偏移，不会改变当前播放状态
   * @param offset 偏移，以秒为单位
   */
  public setOffset(offset: number) {
    if (this.state === GameAudioState.Paused) {
      this.offset = offset;

      return;
    }

    this.pause();
    this.offset = offset;
    this.play();
  }

  public getOffset() {
    return this.offset;
  }
}
