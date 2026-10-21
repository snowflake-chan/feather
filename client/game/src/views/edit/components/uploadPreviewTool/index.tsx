import * as React from 'react';
import { Toast } from '@box/box-design';
import { IconLoading, IconMusic, IconPlay } from '@box/icons';
import { IntlShape, injectIntl } from 'react-intl';
import { RadioBtn } from '../../../components/basic/radioBtn';
import { preloadSoundSample } from 'src/engine/sound/client-sound-controller';
import { editor } from 'src/client/edit/edit-client';
import { transformName } from '../script-manager/utils';
import { copyToClipboard } from 'src/utils/copy2clipboard';

import style from './style.module.scss';

export class Player {
  private _state = 'stopped';
  private _offset = 0;
  private _startTime = 0;
  private _finished = false;
  constructor(
    private audioBuffer: AudioBuffer,
    private audioContext: AudioContext,
  ) {}

  private _loopStart = 0;
  public set loopStart(value: number) {
    this._loopStart = value;
    if (this._source) {
      this._source.loopStart = Math.max(
        0,
        Math.min(this._loopStart, this.audioBuffer.duration),
      );
    }
  }

  private _loopEnd = Infinity;
  public set loopEnd(value: number) {
    this._loopEnd = value;
    if (this._source) {
      this._source.loopEnd = Math.min(this._loopEnd, this.audioBuffer.duration);
    }
  }

  private _loop = false;
  public set loop(flag: boolean) {
    this._loop = flag;
  }

  private _source: AudioBufferSourceNode | null = null;

  private now() {
    return this.audioContext.currentTime;
  }

  public start(startTime?: number, offset?: number) {
    if (startTime === undefined) {
      startTime = this.now();
    }
    if (offset === undefined) {
      if (this._loop) {
        offset = this._loopStart;
      } else {
        offset = 0;
      }
    }
    this._source = this.audioContext.createBufferSource();
    this._source.connect(this.audioContext.destination);
    this._source.buffer = this.audioBuffer;
    this._source.onended = () => {
      const now = this.now();
      if (!this._loop) {
        const passTime = now - this._startTime + this._offset;
        if (passTime >= this.audioBuffer.duration) {
          this._finished = true;
        } else if (
          this.audioBuffer.duration - passTime >= 0 &&
          this.audioBuffer.duration - passTime <= 1e-4
        ) {
          this._finished = true;
        }
      }
    };
    this._source.loop = this._loop;
    this._source.loopStart = this._loopStart;
    this._source.loopEnd = Math.min(this._loopEnd, this.audioBuffer.duration);
    this._state = 'started';
    this._source.start(startTime, offset);
    this._offset = offset;
    this._startTime = startTime;
  }

  public get state() {
    return this._state;
  }

  public get finished() {
    return this._finished;
  }

  public stop(time?: number) {
    if (time === undefined) {
      time = this.now();
    }
    if (this._source) {
      this._source.stop(time);
      this._source.disconnect();
      this._state = 'stopped';
    }
  }

  public seek(offset: number, time: number) {
    this.stop(time);
    this.start(time, offset);
  }
}

function computeWaveForm(container: HTMLDivElement, buffer: AudioBuffer) {
  const peaks: number[] = [];
  const chann0 = buffer.getChannelData(0) as ArrayBuffer;
  // const sampleSize = props.buffer.length / props.waveformWidth;
  const sampleSize = buffer.length / container.clientWidth;
  const sampleStep = ~~(sampleSize / 10) || 1;

  for (let i = 0; i < container.clientWidth; i++) {
    // for (let i = 0; i < props.waveformWidth; i++) {
    const start = ~~(i * sampleSize);
    const end = ~~(start + sampleSize);
    let topCount = 0;
    let bottomCount = 0;
    let bottom = 0;
    let top = 0;
    for (var j = start; j < end; j += sampleStep) {
      const value = chann0[j];
      if (value > 0) {
        bottom += value * value;
        bottomCount++;
      }
      if (value < 0) {
        top += value * value;
        topCount++;
      }
    }
    peaks[2 * i] = Math.sqrt(bottom / bottomCount) * 256;
    peaks[2 * i + 1] = -Math.sqrt(top / topCount) * 256;
  }
  return peaks;
}

function drawWaveForm(
  canvasEle: HTMLCanvasElement,
  container: HTMLDivElement,
  peaks: number[],
  waveformHeight: number,
) {
  if (canvasEle && container) {
    const cvsCtx = canvasEle.getContext('2d');
    if (cvsCtx) {
      let dirty = false;
      if (canvasEle.height !== waveformHeight) {
        dirty = true;
        canvasEle.style.height = waveformHeight + 'px';
        canvasEle.height = waveformHeight;
      }
      if (canvasEle.width !== container.clientWidth) {
        dirty = true;
        canvasEle.style.width = container.clientWidth + 'px';
        canvasEle.width = container.clientWidth;
      }
      if (dirty) {
        cvsCtx.translate(0.5, waveformHeight / 2);
        cvsCtx.scale(0.5, waveformHeight / 256);
        cvsCtx.lineWidth = 2;
      } else {
        cvsCtx.setTransform(1, 0, 0, 1, 0, 0);
        cvsCtx.translate(0.5, waveformHeight / 2);
        cvsCtx.scale(0.5, waveformHeight / 256);
      }

      cvsCtx.clearRect(0, 0, canvasEle.width, canvasEle.height);
      cvsCtx.strokeStyle = 'white';
      cvsCtx.fillStyle = 'white';
      const start = 0;
      const end = container.clientWidth;
      // const end = props.waveformWidth;
      for (let e = start; e < end; e += 1) {
        // const ptr = 2 * (e % props.waveformWidth);
        const ptr = 2 * (e % container.clientWidth);
        let xPos = 2 * (e - start);
        let top = peaks[ptr + 1];
        let bottom = peaks[ptr];
        if (top >= -0.5 && bottom <= 0.5) {
          const i = xPos;
          for (; e < end; e += 1) {
            // const a = 2 * (e % props.waveformWidth);
            const a = 2 * (e % container.clientWidth);
            if (peaks[a + 1] < -0.5 || peaks[a] > 0.5) {
              e -= 1;
              break;
            }
            xPos = 2 * (e - start);
          }
          if (i === xPos) {
            cvsCtx.moveTo(xPos, -0.5);
            cvsCtx.lineTo(xPos, 0.5);
          } else {
            cvsCtx.stroke();
            cvsCtx.lineWidth = 1;
            cvsCtx.beginPath();
            cvsCtx.moveTo(i - 0.5, 0);
            cvsCtx.lineTo(xPos + 0.5, 0);
            cvsCtx.stroke();
            cvsCtx.lineWidth = 2;
            cvsCtx.beginPath();
          }
        } else {
          if (top > -0.5) {
            top = -0.5;
          }
          if (bottom < 0.5) {
            bottom = 0.5;
          }
          cvsCtx.moveTo(xPos, top);
          cvsCtx.lineTo(xPos, bottom);
        }
      }
      cvsCtx.stroke();
    }
  }
}

interface Props {
  intl: IntlShape;
  audioContext: AudioContext;
  buffer: AudioBuffer;
  onChange: (startPos: number, endPos: number, quality: number) => void;
  waveformHeight: number; // > 0
}

enum AudioQuality {
  low = 8000,
  middle = 22050,
  high = 32000,
}

interface State {
  startPos: number;
  endPos: number;
  isPlaying: boolean;
  quality: AudioQuality;
}

class AudioUploadPreview extends React.Component<Props, State> {
  private player: Player | null = null;
  private canvasRef: React.RefObject<HTMLCanvasElement | null> =
    React.createRef();
  private containerRef: React.RefObject<HTMLDivElement | null> =
    React.createRef();
  private containerWidth = 0;
  constructor(props) {
    super(props);
    this.state = {
      startPos: 0,
      endPos: props.buffer.duration,
      isPlaying: false,
      quality: AudioQuality.middle,
    };
  }

  private now() {
    return this.props.audioContext.currentTime;
  }

  public shouldComponentUpdate(nextProps: Props, nextState: State) {
    if (nextProps.waveformHeight !== this.props.waveformHeight) {
      if (this.containerRef.current && this.canvasRef.current) {
        const peaks = computeWaveForm(
          this.containerRef.current,
          this.props.buffer,
        );
        drawWaveForm(
          this.canvasRef.current,
          this.containerRef.current,
          peaks,
          this.props.waveformHeight,
        );
      }
      return true;
    }
    if (
      nextState.endPos !== this.state.endPos ||
      nextState.startPos !== this.state.startPos ||
      nextState.quality !== this.state.quality ||
      nextState.isPlaying !== this.state.isPlaying
    ) {
      return true;
    }
    return false;
  }

  private _onResizeChange = (ev) => {
    if (this.containerRef.current && this.canvasRef.current) {
      if (this.containerRef.current.clientWidth !== this.containerWidth) {
        const peaks = computeWaveForm(
          this.containerRef.current,
          this.props.buffer,
        );
        drawWaveForm(
          this.canvasRef.current,
          this.containerRef.current,
          peaks,
          this.props.waveformHeight,
        );
        this.containerWidth = this.containerRef.current.clientWidth;
      }
    }
  };

  public componentDidMount() {
    window.addEventListener('resize', this._onResizeChange);

    if (this.containerRef.current) {
      this.containerWidth = this.containerRef.current.clientWidth;
    }
    if (this.canvasRef.current && this.containerRef.current) {
      const peaks = computeWaveForm(
        this.containerRef.current,
        this.props.buffer,
      );
      drawWaveForm(
        this.canvasRef.current,
        this.containerRef.current,
        peaks,
        this.props.waveformHeight,
      );
    }
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this._onResizeChange);
    this.stop();
  }

  private play = () => {
    if (this.player !== null) {
      return;
    }
    this.player = new Player(this.props.buffer, this.props.audioContext);
    this.player.loop = true;
    this.player.loopStart = this.state.startPos;
    this.player.loopEnd = this.state.endPos;
    this.player.start();
  };

  private stop = () => {
    if (this.player !== null) {
      this.player.stop();
      this.player = null;
    }
  };

  public render() {
    const { isPlaying, startPos, endPos } = this.state;
    return (
      <div className={style.container} ref={this.containerRef}>
        <div
          className={[style.playButton, isPlaying ? style.stop : ''].join(' ')}
          onClick={() => {
            if (isPlaying) {
              this.setState({ isPlaying: false });
              this.stop();
            } else {
              this.setState({ isPlaying: true });
              this.play();
            }
          }}
        >
          <div className={[style.Icon, style.tabIcon].join(' ')}></div>
        </div>
        <div
          className={style.waveformWrapper}
          style={{
            height: this.props.waveformHeight + 'px',
          }}
        >
          <canvas
            style={{
              height: this.props.waveformHeight + 'px',
            }}
            ref={this.canvasRef}
          ></canvas>
          <div
            className={style.waveformMask}
            style={{
              left: '0',
              width: (startPos / this.props.buffer.duration) * 100 + '%',
            }}
          ></div>
          <div
            className={style.waveformMask}
            style={{
              right: '0',
              width: (1 - endPos / this.props.buffer.duration) * 100 + '%',
            }}
          ></div>
        </div>
        <div className={style.sliderWrapper}>
          <label>
            {this.props.intl.formatMessage({ id: 'AudioStartPos' })} :{' '}
          </label>
          <span>{startPos} s</span>
          <input
            className={[style.small, style.input].join(' ')}
            type={'range'}
            min={0}
            max={this.props.buffer.duration}
            step={0.001}
            value={startPos}
            onChange={(ev) => {
              const _value = Number(ev.target.value);
              if (_value < endPos) {
                this.setState({ startPos: _value });
                if (isPlaying && this.player) {
                  this.player.loopStart = _value;
                }
                this.props.onChange(
                  _value,
                  this.state.endPos,
                  this.state.quality,
                );
              }
            }}
          ></input>
        </div>

        <div className={style.sliderWrapper}>
          <label className={style.label}>
            {this.props.intl.formatMessage({ id: 'AudioEndPos' })} :{' '}
          </label>
          <span>{endPos.toFixed(3)} s</span>
          <input
            className={[style.small, style.input].join(' ')}
            type={'range'}
            min={0}
            max={this.props.buffer.duration}
            step={0.001}
            value={endPos}
            onChange={(ev) => {
              const _value = Number(ev.target.value);
              if (_value > startPos) {
                this.setState({ endPos: _value });
                if (isPlaying && this.player) {
                  this.player.loopEnd = _value;
                }
                this.props.onChange(
                  this.state.startPos,
                  endPos,
                  this.state.quality,
                );
              }
            }}
          ></input>
        </div>

        <div className={style.AudioQualityWrapper}>
          <label className={style.label}>
            {this.props.intl.formatMessage({ id: 'AudioQuality' })}
          </label>
          <div
            style={{
              display: 'flex',
              padding: '0 10px',
              marginTop: '5px',
            }}
          >
            <div
              className={[
                style.qualityRatioItem,
                this.state.quality === AudioQuality.low ? style.selected : '',
              ].join(' ')}
              onClick={() => {
                this.setState({ quality: AudioQuality.low });
                this.props.onChange(
                  this.state.startPos,
                  this.state.endPos,
                  AudioQuality.low,
                );
              }}
            >
              {this.props.intl.formatMessage({ id: 'Low' })}(8kHZ)
            </div>
            <div
              className={[
                style.qualityRatioItem,
                this.state.quality === AudioQuality.middle
                  ? style.selected
                  : '',
              ].join(' ')}
              onClick={() => {
                this.setState({ quality: AudioQuality.middle });
                this.props.onChange(
                  this.state.startPos,
                  this.state.endPos,
                  AudioQuality.middle,
                );
              }}
            >
              {this.props.intl.formatMessage({ id: 'Middle' })}(22kHZ)
            </div>
            <div
              className={[
                style.qualityRatioItem,
                this.state.quality === AudioQuality.high ? style.selected : '',
              ].join(' ')}
              onClick={() => {
                this.setState({ quality: AudioQuality.high });
                this.props.onChange(
                  this.state.startPos,
                  this.state.endPos,
                  AudioQuality.high,
                );
              }}
            >
              {this.props.intl.formatMessage({ id: 'High' })}(32kHZ)
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export const AudioUploadPreviewTool = injectIntl(AudioUploadPreview);

interface PreviewProps {
  audioContext: AudioContext;
  waveformHeight: number;
  data: string | AudioBuffer;
  fetchAudio: (hash: string, callback: (data: AudioBuffer) => void) => void;
}

interface PreviewState {
  loaded: boolean;
  isPlaying: boolean;
  theSeekToPos: number;
}

export class AudioPreviewPlayer extends React.Component<
  PreviewProps,
  PreviewState
> {
  private player: Player | null = null;
  private canvasRef: React.RefObject<HTMLCanvasElement | null> =
    React.createRef();
  private containerRef: React.RefObject<HTMLDivElement | null> =
    React.createRef();
  private waveformMaskRef: React.RefObject<HTMLDivElement | null> =
    React.createRef();
  private playerProgressRef: React.RefObject<HTMLInputElement | null> =
    React.createRef();
  private currPosRef: React.RefObject<HTMLDivElement | null> =
    React.createRef();

  private containerWidth = 0;

  private audioBuffer: AudioBuffer | null = null;

  private _animationId: number | null = null;

  private _startTime: number = 0;

  private _changingSeekTime = false;

  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      isPlaying: false,
      theSeekToPos: 0,
    };
  }

  private now() {
    return this.props.audioContext.currentTime;
  }

  public shouldComponentUpdate(
    nextProps: PreviewProps,
    nextState: PreviewState,
  ) {
    if (nextProps.data !== this.props.data) {
      if (typeof nextProps.data === 'string') {
        this.fetchAudio(nextProps.data);
      } else {
        this.audioBuffer = nextProps.data;
        this.setState({
          loaded: true,
        });
      }
      return true;
    } else {
      if (nextProps.waveformHeight !== this.props.waveformHeight) {
        this.onload();
        return true;
      }
    }
    if (
      nextState.loaded !== this.state.loaded ||
      nextState.isPlaying !== this.state.isPlaying ||
      nextState.theSeekToPos !== this.state.theSeekToPos
    ) {
      return true;
    }
    return false;
  }

  private fetchAudio(hash: string) {
    this.audioBuffer = null;
    this.props.fetchAudio(hash, (audioBuffer: AudioBuffer) => {
      if (!(this.containerRef.current && this.canvasRef.current)) {
        return;
      }
      this.audioBuffer = audioBuffer;
      this.setState(
        {
          loaded: true,
        },
        this.onload,
      );
    });
  }

  private onload = () => {
    if (
      this.canvasRef.current &&
      this.containerRef.current &&
      this.audioBuffer
    ) {
      const peaks = computeWaveForm(
        this.containerRef.current,
        this.audioBuffer,
      );
      drawWaveForm(
        this.canvasRef.current,
        this.containerRef.current,
        peaks,
        this.props.waveformHeight,
      );
    }
  };

  private _onResizeChange = (ev) => {
    if (
      this.containerRef.current &&
      this.canvasRef.current &&
      this.state.loaded &&
      this.audioBuffer
    ) {
      if (this.containerRef.current.clientWidth !== this.containerWidth) {
        const peaks = computeWaveForm(
          this.containerRef.current,
          this.audioBuffer,
        );
        drawWaveForm(
          this.canvasRef.current,
          this.containerRef.current,
          peaks,
          this.props.waveformHeight,
        );
        this.containerWidth = this.containerRef.current.clientWidth;
      }
    }
  };

  public updatePlayProgress = () => {
    if (!this._changingSeekTime) {
      const progress = this.playerProgressRef.current;
      const waveformMask = this.waveformMaskRef.current;
      const passTime = this.now() - this._startTime + this.state.theSeekToPos;
      if (
        progress &&
        this.state.isPlaying &&
        this.audioBuffer &&
        this.player &&
        this.player.state === 'started' &&
        this.player.finished === false
      ) {
        const duration = this.audioBuffer.duration;
        const progressPercent = ((passTime % duration) * 100) / duration + '%';
        progress.style.background = `linear-gradient(90deg, white ${progressPercent}, #595959 ${progressPercent})`;
        if (waveformMask) {
          waveformMask.style.width = progressPercent;
        }
        progress.value = (passTime % duration).toFixed(3);
        if (this.currPosRef.current) {
          this.currPosRef.current.innerText = progress.value;
        }
      }
      if (this.player && this.player.finished && this.state.isPlaying) {
        this.stop();
      }
    }
    this._animationId = requestAnimationFrame(this.updatePlayProgress);
  };

  private _resetProgressUI = () => {
    if (this.waveformMaskRef.current) {
      this.waveformMaskRef.current.style.width = '0';
    }
    if (this.currPosRef.current) {
      this.currPosRef.current.innerText = '0';
    }
    if (this.playerProgressRef.current) {
      this.playerProgressRef.current.style.background = '';
    }
  };

  public componentDidMount() {
    window.addEventListener('resize', this._onResizeChange);
    if (typeof this.props.data === 'string') {
      this.fetchAudio(this.props.data);
    } else {
      this.audioBuffer = this.props.data;
      this.setState(
        {
          loaded: true,
        },
        this.onload,
      );
    }
    this.updatePlayProgress();
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this._onResizeChange);
    this.stop();
    if (this._animationId !== null) {
      cancelAnimationFrame(this._animationId);
    }
  }

  private play = () => {
    if (this.player !== null || this.audioBuffer === null) {
      return;
    }
    this.player = new Player(this.audioBuffer, this.props.audioContext);
    const now = this.now();
    this.player.start(now, this.state.theSeekToPos);
    this._startTime = now;
  };

  private stop = () => {
    if (this.player !== null) {
      this.player.stop();
      this.player = null;
      this.setState(
        {
          isPlaying: false,
          theSeekToPos: 0,
        },
        this._resetProgressUI,
      );
    }
  };

  private onMouseUp = () => {
    if (
      this._changingSeekTime &&
      this.player &&
      !this.player.finished &&
      this.state.isPlaying
    ) {
      const now = this.now();
      this.player.seek(this.state.theSeekToPos, now);
      this._startTime = now;
    }
    this._changingSeekTime = false;
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('touchend', this.onMouseUp);
  };

  private bindMouseEvent = () => {
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('touchend', this.onMouseUp);
  };

  public render() {
    return (
      <div className={style.container} ref={this.containerRef}>
        <div
          className={[
            style.waveformWrapper,
            this.state.loaded ? '' : style.loading,
          ].join(' ')}
        >
          <canvas
            style={{
              height: this.props.waveformHeight + 'px',
            }}
            ref={this.canvasRef}
          ></canvas>
          <div
            className={style.waveformMask}
            ref={this.waveformMaskRef}
            style={{
              left: '0',
              width:
                (this.state.theSeekToPos /
                  (this.audioBuffer ? this.audioBuffer.duration : Infinity)) *
                  100 +
                '%',
            }}
          ></div>
        </div>
        {this.state.loaded ? (
          ''
        ) : (
          <div className={style.loadingIconWrapper}>
            <div className={style.loadingIcon}></div>
          </div>
        )}
        {this.state.loaded ? (
          <div className={style.playTool}>
            <div
              className={[
                style.playButton,
                this.state.isPlaying ? style.stop : '',
              ].join(' ')}
              onClick={() => {
                if (this.state.isPlaying) {
                  // stop
                  this.stop();
                } else {
                  // start
                  this.setState({ isPlaying: true }, () => {
                    this.play();
                  });
                }
              }}
            >
              <div className={[style.Icon, style.tabIcon].join(' ')}></div>
            </div>
            <div className={style.playtrack}>
              <div className={style.sliderWrapper} style={{ marginTop: 0 }}>
                <label>
                  <div
                    style={{ display: 'inline-block' }}
                    ref={this.currPosRef}
                  >
                    {this.state.theSeekToPos}
                  </div>
                  s
                </label>
                <span>
                  {this.audioBuffer ? this.audioBuffer.duration.toFixed(3) : 0}s
                </span>
                <input
                  className={[style.small, style.input].join(' ')}
                  type={'range'}
                  min={0}
                  max={(this.audioBuffer as AudioBuffer).duration}
                  ref={this.playerProgressRef}
                  step={0.001}
                  value={this.state.theSeekToPos}
                  onTouchStart={() => {
                    this.bindMouseEvent();
                  }}
                  onMouseDown={() => {
                    this.bindMouseEvent();
                  }}
                  onChange={(ev) => {
                    this._changingSeekTime = true;
                    const _value = Number(ev.target.value);
                    const progressPercent = this.audioBuffer
                      ? (_value * 100) / this.audioBuffer.duration
                      : 0;
                    this.setState({ theSeekToPos: _value });
                    ev.target.style.background = `linear-gradient(90deg, white ${progressPercent}%, #595959 ${progressPercent}%)`;
                  }}
                ></input>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

interface AudioItemProps {
  audioContext: AudioContext;
  data: string | AudioBuffer;
  path: string;
  selectedSample: string;
  setSelectedSample: (audioPath: string) => void;
  currPlayingAudio: string;
  setCurrPlayingAudio: (audioPath: string) => void;
  intl: IntlShape;
}

interface AudioItemState {
  isAudioBufferCached: boolean;
  isPlaying: boolean;
  theSeekToPos: number;
}

class AudioItemView extends React.Component<AudioItemProps, AudioItemState> {
  private player: Player | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private playerProgressRef: React.RefObject<HTMLInputElement | null> =
    React.createRef();
  private currPosRef: React.RefObject<HTMLDivElement | null> =
    React.createRef();

  private _animationId: number | null = null;

  private _startTime: number = 0;

  private _changingSeekTime = false;

  constructor(props) {
    super(props);
    this.state = {
      isAudioBufferCached: false,
      isPlaying: false,
      theSeekToPos: 0,
    };
  }

  public shouldComponentUpdate(
    nextProps: AudioItemProps,
    nextState: AudioItemState,
  ) {
    if (nextProps.data !== this.props.data) {
      if (typeof nextProps.data === 'string') {
        this.fetchAudio(nextProps.data);
      } else {
        this.audioBuffer = nextProps.data;
        this.setState({
          isAudioBufferCached: true,
        });
        if (this.state.isPlaying) {
          this.play();
        }
      }
      return true;
    }
    if (
      nextState.isAudioBufferCached !== this.state.isAudioBufferCached ||
      nextState.isPlaying !== this.state.isPlaying ||
      nextState.theSeekToPos !== this.state.theSeekToPos ||
      nextProps.selectedSample !== this.props.selectedSample ||
      nextProps.currPlayingAudio !== this.props.currPlayingAudio
    ) {
      return true;
    }
    return false;
  }

  public componentDidUpdate(): void {
    if (
      !this.state.isPlaying ||
      this.props.currPlayingAudio === this.props.path
    ) {
      return;
    }
    if (this.audioBuffer === null) {
      this.setState({ isPlaying: false });
      return;
    }
    this.stop();
  }

  private fetchAudio(hash: string) {
    this.audioBuffer = null;
    preloadSoundSample(editor.game.state, hash).catch((err) => {
      console.error(err);
    });
  }

  private now() {
    return this.props.audioContext.currentTime;
  }

  public updatePlayProgress = () => {
    if (!this._changingSeekTime) {
      const progress = this.playerProgressRef.current;
      const passTime = this.now() - this._startTime + this.state.theSeekToPos;
      if (
        progress &&
        this.state.isPlaying &&
        this.audioBuffer &&
        this.player &&
        this.player.state === 'started' &&
        this.player.finished === false
      ) {
        const duration = this.audioBuffer.duration;
        const res = ((passTime % duration) * 100) / duration;
        progress.style.background = `linear-gradient(90deg, white ${res}%, #595959 ${res}%)`;
        progress.value = (passTime % duration).toFixed(3);
        if (this.currPosRef.current) {
          this.currPosRef.current.innerText = progress.value;
        }
      }
      if (this.player && this.player.finished && this.state.isPlaying) {
        this.stop();
      }
    }
    this._animationId = requestAnimationFrame(this.updatePlayProgress);
  };

  private _resetProgressUI = () => {
    if (this.currPosRef.current) {
      this.currPosRef.current.innerText = '0';
    }
    if (this.playerProgressRef.current) {
      this.playerProgressRef.current.style.background = '';
    }
  };

  public componentDidMount() {
    if (typeof this.props.data === 'string') {
      this.fetchAudio(this.props.data);
    } else {
      this.audioBuffer = this.props.data;
      this.setState({ isAudioBufferCached: true });
    }
    this.updatePlayProgress();
  }

  public componentWillUnmount() {
    this.stop();
    if (this._animationId !== null) {
      cancelAnimationFrame(this._animationId);
    }
  }

  public play = () => {
    if (this.player !== null || this.audioBuffer === null) {
      return;
    }
    this.player = new Player(this.audioBuffer, this.props.audioContext);
    const now = this.now();
    this.player.start(now, this.state.theSeekToPos);
    this._startTime = now;
  };

  public stop = () => {
    if (this.player !== null) {
      this.player.stop();
      this.player = null;
      this.setState(
        {
          isPlaying: false,
          theSeekToPos: 0,
        },
        this._resetProgressUI,
      );
    }
  };

  private onMouseUp = () => {
    if (
      this._changingSeekTime &&
      this.player &&
      !this.player.finished &&
      this.state.isPlaying
    ) {
      const now = this.now();
      this.player.seek(this.state.theSeekToPos, now);
      this._startTime = now;
    }
    this._changingSeekTime = false;
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('touchend', this.onMouseUp);
  };

  private bindMouseEvent = () => {
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('touchend', this.onMouseUp);
  };

  public onPlayBtnClick = (ev) => {
    ev.stopPropagation();
    if (this.state.isPlaying) {
      // stop
      this.stop();
    } else {
      // start
      this.props.setCurrPlayingAudio(this.props.path);
      this.setState({ isPlaying: true }, () => {
        this.play();
      });
    }
  };

  public render() {
    const { isAudioBufferCached, isPlaying } = this.state;
    const duration = `${
      this.audioBuffer ? this.audioBuffer.duration.toFixed(3) : 0
    }s`;
    return (
      <div
        className={style.purePlayTool}
        onClick={(ev) => {
          ev.stopPropagation();
          this.props.setSelectedSample(this.props.path);
        }}
      >
        <div
          className={`${style.iconWrapper} ${isPlaying ? style.playing : ''}`}
          onClick={this.onPlayBtnClick}
        >
          {isPlaying ? (
            isAudioBufferCached ? (
              <div className={style.playingIcon}>
                <div />
                <div />
                <div />
                <div />
                <div />
              </div>
            ) : (
              <IconLoading className={style.iconLoading} />
            )
          ) : (
            <>
              <IconMusic className={style.iconMusic} />
              <IconPlay className={style.iconPlay} />
            </>
          )}
        </div>
        <div
          className={[
            style.audioInfo,
            isPlaying && isAudioBufferCached ? style.hide : style.show,
          ].join(' ')}
        >
          <div
            className={style.audioName}
            onClick={(ev) => {
              ev.stopPropagation();
              copyToClipboard(transformName(this.props.path, true));
              Toast.success({
                content: this.props.intl.formatMessage({
                  id: 'copySuccess',
                }),
              });
            }}
          >
            {transformName(this.props.path, false)}
          </div>
          <div className={style.audioDuration}>{duration}</div>
        </div>
        <div
          className={[
            style.purePlayTrack,
            isPlaying && isAudioBufferCached ? style.show : style.hide,
          ].join(' ')}
        >
          <div className={style.sliderWrapper} style={{ marginTop: 0 }}>
            <label>
              <div style={{ display: 'inline-block' }} ref={this.currPosRef}>
                {this.state.theSeekToPos}
              </div>
              s
            </label>
            <span>{duration}</span>
            <input
              className={[style.smallest, style.input].join(' ')}
              style={{ marginTop: 19 }}
              type={'range'}
              min={0}
              max={this.audioBuffer?.duration}
              ref={this.playerProgressRef}
              step={0.001}
              value={this.state.theSeekToPos}
              onClick={(ev) => ev.stopPropagation()}
              onTouchStart={() => {
                this.bindMouseEvent();
              }}
              onMouseDown={() => {
                this.bindMouseEvent();
              }}
              onChange={(ev) => {
                this._changingSeekTime = true;
                const _value = Number(ev.target.value);
                const progressPercent = this.audioBuffer
                  ? (_value * 100) / this.audioBuffer.duration
                  : 0;
                this.setState({ theSeekToPos: _value });
                ev.target.style.background = `linear-gradient(90deg, white ${progressPercent}%, #595959 ${progressPercent}%)`;
              }}
            ></input>
          </div>
        </div>
        <div className={style.radioBtnWrapper}>
          <RadioBtn
            checked={this.props.path === this.props.selectedSample}
            onChange={(checked) => {
              if (checked) {
                this.props.setSelectedSample(this.props.path);
              } else {
                this.props.setSelectedSample('');
              }
            }}
          />
        </div>
      </div>
    );
  }
}
export const AudioItem = injectIntl(AudioItemView);
