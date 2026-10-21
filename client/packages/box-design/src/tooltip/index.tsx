import React, {
  ReactEventHandler,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { ComponentOptions } from '../interfaces';
import { Trigger, TriggerChildren, TriggerOptions } from '../trigger';
import styles from './style.module.scss';

export type ImageMedia = {
  type: 'image';
  src: string;
};

export type VideoMedia = {
  type: 'video';
  src: string;
  /**
   * 循环播放时的时间间隔。单位是ms。
   * @default 0
   */
  loopGap?: number;
  /**
   * 视频播放速率。
   * @default 1
   */
  playbackRate?: number;
};

export interface TooltipOptions extends ComponentOptions {
  text: string;
  title?: string;
  /**
   * 媒体资源。
   * 目前支持图片和视频。
   */
  media?: ImageMedia | VideoMedia;
  /**
   * 额外的内容。
   * 比如工具栏的提示中的快捷键符号。
   */
  addition?: string;
}

export function Tooltip(props: TooltipOptions) {
  const {
    text,
    title: optionTitle,
    media: optionMedia,
    addition: optionAddition,
    className: optionClassName,
    style,
  } = props;

  const title = useMemo(() => {
    if (!optionTitle) {
      return;
    }

    return <p className={styles.title}>{optionTitle}</p>;
  }, [optionTitle]);

  const media = useMemo(() => {
    if (!optionMedia) {
      return;
    }

    let child: ReactNode | undefined;
    if (optionMedia.type === 'image') {
      child = <img src={optionMedia.src} alt="" />;
    } else {
      child = <TooltipVideo {...optionMedia} />;
    }

    return <div className={styles.media}>{child}</div>;
  }, [optionMedia]);

  const addition = useMemo(() => {
    if (!optionAddition) {
      return;
    }

    return (
      <div className={styles.addition}>
        <div>{optionAddition}</div>
      </div>
    );
  }, [optionAddition]);

  const className = useMemo(() => {
    const list = [styles.tooltip];

    if (title) {
      list.push(styles.withTitle);
    }

    if (optionAddition) {
      list.push(styles.withAddition);
    }

    if (optionClassName) {
      list.push(optionClassName);
    }

    return list.join(' ');
  }, [optionClassName, title, optionAddition]);

  return (
    <div className={className} style={style}>
      {media}
      <div className={styles.content}>
        <div className={styles.textContent}>
          {title}
          <p className={styles.text}>{text}</p>
        </div>
        {addition}
      </div>
    </div>
  );
}

export type TooltipTriggerOptions = TooltipOptions & TriggerOptions;

interface TooltipTriggerProps extends TooltipTriggerOptions {
  children?: TriggerChildren;
}

/**
 * 带有触发器的Tooltip。
 * children需要支持props传入onMouseEnter、onMouseLeave、onMouseDown和onClick。
 * 以及支持设置ref。
 * 详见<Trigger />
 *
 * 使用方式：
 * <TooltipTrigger {...tooltipOptions} >
 *   <Target />
 * </TooltipTrigger>
 */
export function TooltipTrigger(options: TooltipTriggerProps) {
  const {
    children,
    placement,
    align,
    delay,
    disabled,
    popupVisible,
    moveWithCursor,
    onPopupVisibleChange,
    ...tooltipOptions
  } = options;

  return (
    <Trigger
      popup={<Tooltip {...tooltipOptions} />}
      popupVisible={popupVisible}
      onPopupVisibleChange={onPopupVisibleChange}
      placement={placement}
      align={align}
      delay={delay}
      disabled={disabled}
      moveWithCursor={moveWithCursor}
    >
      {children}
    </Trigger>
  );
}

function TooltipVideo(options: VideoMedia) {
  const { src, loopGap, playbackRate = 1 } = options;

  const loopTimer = useRef(-1);

  const videoElement = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoElement.current) {
      videoElement.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const { loop, onEnded } = useMemo(() => {
    let loop = false;
    let onEnded: ReactEventHandler<HTMLVideoElement> | undefined = undefined;

    if (loopGap === undefined || loopGap <= 0) {
      loop = true;
    } else {
      loop = false;
      onEnded = () => {
        clearTimeout(loopTimer.current);

        loopTimer.current = window.setTimeout(() => {
          videoElement.current?.play();
        }, loopGap);
      };
    }

    return { loop, onEnded };
  }, [loopGap, loopTimer]);

  useEffect(() => {
    return () => {
      clearTimeout(loopTimer.current);
    };
  }, []);

  return (
    <video
      ref={videoElement}
      src={src}
      autoPlay
      muted
      loop={loop}
      onEnded={onEnded}
    ></video>
  );
}
