import * as React from 'react';
import { injectIntl, IntlShape } from 'react-intl';
import { intlMessage } from 'src/utils/i18n';
import { EventBus } from '@box/utils/event';
import { Task, TaskTypeEnum } from '@box/utils/loading/loading-schema';
import { Settings } from 'src/engine/settings/settings-schema';
import style from './index.module.css';
import lottie, { AnimationItem } from 'lottie-web';
import AnimateData from './animation.json';

export type ConnectingProps = {
  intl: IntlShape;
  getProgress: () => number;
  loadingEvent: EventBus<Task>;
  isPlay: boolean;
  setSettings: (settings: Partial<Settings>) => void;
};

type ConnectingState = {
  taskName: string;
  progress: number;
};

export class Connecting extends React.Component<
  ConnectingProps,
  ConnectingState
> {
  constructor(props) {
    super(props);
    this.state = {
      taskName: intlMessage('loadingStart'),
      progress: 0,
    };
    this._animationRef = React.createRef();
  }

  private _animationRef: React.RefObject<HTMLDivElement | null>;
  private _animationInstance: AnimationItem | null = null;

  private handleTaskChange = (task: Task) => {
    const { taskName = '', taskType } = task;
    const progress = this.props.getProgress();
    if (progress === 1) {
      if (this.interval) {
        clearInterval(this.interval);
      }
    }
    const progressNum = Math.floor(progress * 100);
    let taskContent = '';
    switch (taskType) {
      case TaskTypeEnum.Get: {
        taskContent = `${intlMessage('loadingGet', { taskName })}`;
        break;
      }
      case TaskTypeEnum.Image: {
        taskContent = `${intlMessage('loadingImage', { taskName })}`;
        break;
      }
      case TaskTypeEnum.Downloaded: {
        taskContent = `${intlMessage('loadingDownloaded', { taskName })}`;
        break;
      }
      case TaskTypeEnum.Decompress: {
        taskContent = `${intlMessage('loadingDecompress', { taskName })}`;
        break;
      }
      case TaskTypeEnum.Steam: {
        taskContent = `${intlMessage('loadingSteam', { taskName })}`;
        break;
      }
      case TaskTypeEnum.Chunk: {
        taskContent = `${intlMessage('loadingChunk', { taskName })}`;
        break;
      }
      case TaskTypeEnum.Mesh: {
        taskContent = `${intlMessage('loadingMeshChunk', { taskName })}`;
        break;
      }
      case TaskTypeEnum.Normal: {
        taskContent = `${intlMessage(taskName)}`;
        break;
      }
    }
    this.setState((prev) => {
      return {
        taskName: taskContent,
        progress: Math.max(progressNum, prev.progress),
      };
    });
  };

  private interval = setInterval(() => {
    this.setState((prev) => {
      return {
        progress: Math.min(Math.floor(prev.progress) + 1, 99),
      };
    });
  }, 500);

  private startAnimation() {
    if (!this._animationRef.current) return;
    this._animationInstance = lottie.loadAnimation({
      container: this._animationRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: AnimateData,
    });
  }

  public componentDidMount() {
    this.props.loadingEvent.sub(this.handleTaskChange);
    this.startAnimation();
  }

  public componentWillUnmount() {
    this.props.loadingEvent.unsub(this.handleTaskChange);
    if (this._animationInstance) {
      this._animationInstance.destroy();
    }
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  public render() {
    const { taskName, progress } = this.state;

    return (
      <div className={style.wrapper}>
        <div className={style.loadingWrapper}>
          <div ref={this._animationRef} className={style.animateContainer} />
          <div className={style.progressBar}>
            <div
              style={{ width: `${progress}%` }}
              className={`${style.progress} ${
                progress === 100 ? style.completed : ''
              }`}
            ></div>
          </div>
          <div className={style.loadingText}>{taskName}</div>
        </div>
      </div>
    );
  }
}

export const ConnectingContainer = injectIntl(Connecting);
