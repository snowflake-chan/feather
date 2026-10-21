import { useCallback, useEffect, useState, useRef } from 'react';
import style from './index.module.css';
import defaultBanner from '../../assets/banner.jpg';
import { LoadingStage } from 'src/defs/loading-stage';
import { useIntl } from 'react-intl';

function easeOutQuart(x: number): number {
  return 1 - Math.pow(1 - x, 4);
}

function easeInOutCirc(x: number): number {
  return x < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
}

type PlayLoadingProps = {
  stage: LoadingStage;
  gameCover?: string;
  loadingConfig: boolean;
  progress?: number;
  message?: string;
  error?: boolean;
  actions?: React.ReactNode;
};

export const PlayLoading = (props: PlayLoadingProps) => {
  const banner = defaultBanner.src;
  const rateTextRef = useRef<HTMLElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const tipsRef = useRef<HTMLParagraphElement>(null);
  const intl = useIntl();

  const setProgress = useCallback((num: number) => {
    if (rateTextRef.current && progressBarRef.current && tipsRef.current) {
      rateTextRef.current.innerText = Math.floor(num) + '%';
      progressBarRef.current.style.transform = `translateX(-${100 - num}%)`;
      tipsRef.current.style.backgroundImage = `linear-gradient(90deg, rgba(0, 0, 0, 1) ${num}%, #fff ${num}%)`;
    }
  }, []);

  useEffect(() => {
    if (typeof props.progress === 'number') {
      setProgress(Math.min(100, Math.max(0, props.progress)));
      return;
    }
    // 阶段0的总时间（s）和最大进度
    const stage0Time = 2;
    const stage0MaxNum = 50;
    // 阶段1的总时间（s）和最大进度
    const stage1Time = 15;
    const stage1MaxNum = 99;

    let num = 0;
    let time = 0;
    let animation;

    // 100%
    if (props.stage === LoadingStage.done) {
      setProgress(100);
    }

    function progress() {
      // 0-50% 应用 easeOutQuart 函数
      if (props.stage === LoadingStage.file && time < stage0Time) {
        num = stage0MaxNum * easeOutQuart(time / stage0Time);
        time += 1 / 60;
        setProgress(num);
      }

      // 50%-99% 应用 easeInOutCirc 函数
      if (props.stage === LoadingStage.game && time < stage0Time + stage1Time) {
        if (time < stage0Time) {
          time = stage0Time;
        } else {
          time += 1 / 60;
        }
        num =
          stage0MaxNum +
          (stage1MaxNum - stage0MaxNum) *
            easeInOutCirc((time - stage0Time) / stage1Time);
        setProgress(num);
      }
      animation = requestAnimationFrame(progress);
    }
    animation = requestAnimationFrame(progress);
    return () => {
      cancelAnimationFrame(animation);
    };
  }, [props.progress, props.stage, setProgress]);

  return (
    <div
      className={style.wrapper}
      style={{
        backgroundImage: props.loadingConfig
          ? ''
          : `url(${props.gameCover || banner})`,
      }}
    >
      <div className={style.header}>
        {/* <svg className={style.logo}>
          <use xlinkHref={`#icon-createra-logo`}></use>
        </svg> */}
      </div>
      <div className={style.progressWrapper}>
        <p className={style.tips} ref={tipsRef}>
          {!props.loadingConfig && !props.message && (
            <span className={style.tipsCont}>
              {intl.formatMessage({ id: 'playLoadingTip' })}
            </span>
          )}
          {props.message ? <span className={style.tipsCont}>{props.message}</span> : null}
          <span className={style.progressNum} ref={rateTextRef}></span>
        </p>
        <div className={style.progressBarWrapper}>
          <div className={style.progressBar} ref={progressBarRef}>
            <div className={style.rollWrapper}></div>
          </div>
        </div>
      </div>
      {props.error && props.actions ? <div className={style.errorActions}>{props.actions}</div> : null}
    </div>
  );
};
