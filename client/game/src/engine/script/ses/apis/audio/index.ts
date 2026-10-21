import { MediaError, MediaErrorCode } from '@box/script-api';
import { toString } from 'ramda';
import { GameAudioState } from 'src/engine/sound/defs';
import { isSafeUrl } from 'src/engine/utils/safe-url';
import { ClientScriptContext } from '../context/const';
import { EventEmitter } from '../events';

export type AudioEvent = {
  target: Audio;
};

export type AudioEventMap = {
  ended: AudioEvent;
  loadeddata: AudioEvent;
  error: AudioEvent;
};

/**
 * 客户端脚本使用的音频对象，自己人不要用
 */
export class Audio extends EventEmitter<AudioEventMap> {
  private _src: string = '';

  private _volume: number = 1;

  private abortLoadingController?: AbortController;

  private soundNodeId?: number;

  private audioBuffer?: AudioBuffer;

  private loading?: Promise<AudioBuffer>;

  /**
   * 暂停时，播放的偏移量
   */
  private offset: number = 0;

  private state = GameAudioState.Paused;

  /**
   * 存储加载相关的错误
   */
  public error: MediaError | null = null;

  constructor(url?: string) {
    super();

    // url变化时重新触发loading
    if (typeof url === 'string') {
      this.src = new URL(url, location.href).toString();
    }
  }

  set src(url: string) {
    this._src = url;

    // 只要修改src，就会无情的触发中断加载，即使是相同的url也是
    this.load();
  }

  get src() {
    return this._src;
  }

  get volume() {
    return this._volume;
  }

  set volume(vol: number) {
    if (vol < 0 || vol > 1) {
      ClientScriptContext.scriptConsole?.error(
        'Volume should be a number within the range of 0 to 1',
      );
      return;
    }

    this._volume = vol;

    if (ClientScriptContext.soundClient && this.soundNodeId !== undefined) {
      ClientScriptContext.soundClient.setVolume(this.soundNodeId, this._volume);
    }
  }

  /**
   * 重新加载、重置播放进度
   * - 重新加载会走缓存
   * - 同步方法
   * - [HTMLMediaElement: load() method]https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/load
   */
  public load() {
    // load方法本身不会抛错
    this.loadAudioBuffer().catch(() => {});
  }

  private async loadAudioBuffer() {
    this.abortLoading();

    this.pause();

    this.offset = 0;

    this.audioBuffer = undefined;

    this.error = null;

    if (
      !ClientScriptContext.soundClient ||
      !ClientScriptContext.soundClient.state.sound.context
    ) {
      this.error = new MediaError(
        MediaErrorCode.MEDIA_ERR_DECODE,
        'Sound client is not available',
      );

      this.emit('error', {
        target: this,
      });

      throw this.error;
    }

    if (!isSafeUrl(this._src)) {
      this.error = new MediaError(
        MediaErrorCode.MEDIA_ERR_SRC_NOT_SUPPORTED,
        'Src is not supported',
      );

      this.emit('error', {
        target: this,
      });

      throw this.error;
    }

    const { promise, abortController } =
      ClientScriptContext.soundClient.preload(this.src);

    this.abortLoadingController = abortController;

    this.loading = promise
      .then((soundResource) => {
        // 这里soundResource和soundResource.buffer可能为null是因为他们是MuRef
        if (!soundResource || !soundResource.buffer) {
          // 这里通过catch去构造GameClientMediaError，直接抛出message即可
          throw 'Sound resource is invalid';
        }

        this.audioBuffer = soundResource.buffer;

        this.emit('loadeddata', { target: this });

        return this.audioBuffer;
      })
      .catch((err) => {
        this.error = new MediaError(
          MediaErrorCode.MEDIA_ERR_SRC_NOT_SUPPORTED,
          this.formatErrorMessage(err),
        );

        this.emit('error', {
          target: this,
        });

        throw this.error;
      });

    return this.loading;
  }

  private formatErrorMessage(err: unknown): string {
    if (typeof err === 'string') {
      return err;
    }

    if (err instanceof Error) {
      return err.message;
    }

    return toString(err);
  }

  private abortLoading() {
    if (this.abortLoadingController) {
      this.abortLoadingController.abort();

      this.abortLoadingController = undefined;
    }

    this.loading = undefined;
  }

  /**
   * 播放
   * - [HTMLMediaElement: play() method](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play)
   */
  public async play(): Promise<void> {
    if (!ClientScriptContext.soundClient) {
      throw new Error('Sound client is not available');
    }

    if (
      this.state === GameAudioState.Playing ||
      this.state === GameAudioState.Pending
    ) {
      return;
    }

    this.state = GameAudioState.Pending;

    let audioBuffer = this.audioBuffer;

    try {
      if (!audioBuffer) {
        if (this.loading) {
          audioBuffer = await this.loading;
        } else {
          audioBuffer = await this.loadAudioBuffer();
        }
      }
    } catch (err) {
      throw new Error('Failed to load because no supported source was found.');
    }

    // 有可能还在Loading就暂停掉了
    if (this.state !== GameAudioState.Pending) {
      return;
    }

    // 此时尚未真正开始播放，重置回Paused状态
    this.state = GameAudioState.Paused;

    this.soundNodeId = ClientScriptContext.soundClient.playClientNode({
      url: this.src,
      audioBuffer,
      volumeModifier: this._volume,
      offset: this.offset,
      onEnded: this.onSoundEnded,
      onPause: this.onSoundPause,
    });

    this.state = GameAudioState.Playing;
  }

  private onSoundEnded = () => {
    this.state = GameAudioState.Ended;

    this.offset = 0;

    this.emit('ended', { target: this });
  };

  /**
   * 监听soundController内部发起的暂停，同步节点状态
   */
  private onSoundPause = (offset: number) => {
    if (this.state === GameAudioState.Paused) {
      return;
    }

    this.offset = offset;

    this.state = GameAudioState.Paused;

    this.soundNodeId = undefined;
  };

  /**
   * 暂停
   * - [HTMLMediaElement: pause() method](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/pause)
   */
  public pause() {
    if (this.state === GameAudioState.Paused) {
      return;
    }

    this.state = GameAudioState.Paused;

    // 暂停方法即使没有可实际执行的内容，也不需要报错
    if (!ClientScriptContext.soundClient || this.soundNodeId === undefined) {
      return;
    }

    this.offset = ClientScriptContext.soundClient.pauseNode(this.soundNodeId);

    this.soundNodeId = undefined;
  }
}
