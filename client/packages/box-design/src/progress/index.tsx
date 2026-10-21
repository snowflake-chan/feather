import React, { memo, useMemo } from 'react';
import styles from './style.module.scss';
import type { ComponentOptions } from '../interfaces';
import { useClassName } from '../util';

export interface ProgressOptions extends ComponentOptions {
  percent: number;
}

export const PROGRESS_CLASS_NAME = 'boxProgress';
export const PROGRESS_THUMB_CLASS_NAME = 'boxProgressThumb';

function ProgressView(props: ProgressOptions) {
  const { percent, className: optionClassName } = props;

  const style = useMemo(() => ({ width: `${percent}%` }), [percent]);

  const className = useClassName(
    [styles.progress, PROGRESS_CLASS_NAME, optionClassName],
    [optionClassName],
  );

  return (
    <div className={className}>
      <div className={styles.inner}>
        <div className={PROGRESS_THUMB_CLASS_NAME} style={style} />
      </div>
      <div className={styles.percentage}>{percent}%</div>
    </div>
  );
}

export const Progress = memo(ProgressView);
