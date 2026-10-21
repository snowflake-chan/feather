import React, { ReactNode, memo } from 'react';
import { UICoord2Keys } from '@box/schema/project/ui-rda/defs';

import { AxisInput, AxisInputValue } from '../axis-input';

import styles from './style.module.scss';

export type OnCoord2InputChange = (
  ids: string[],
  axis: 'x' | 'y',
  type: UICoord2Keys,
  val: number,
) => void;

export type Coord2InputValue = {
  x: AxisInputValue;
  y: AxisInputValue;
};

export interface Props extends Coord2InputValue {
  title: string;
  prefixX: ReactNode;
  prefixY: ReactNode;
  onChange: OnCoord2InputChange;
}

export const UICoord2Input = memo((props: Props) => {
  const { title, x, y, prefixX, prefixY, onChange } = props;

  return (
    <div className={styles.coord2Input}>
      <div className={styles.title}>{title}</div>
      <AxisInput
        prefix={prefixX}
        offset={x.offset}
        ratio={x.ratio}
        disabled={x.disabled}
        onChange={(ids, type, val) => onChange(ids, 'x', type, val)}
      />
      <AxisInput
        prefix={prefixY}
        offset={y.offset}
        ratio={y.ratio}
        disabled={y.disabled}
        onChange={(ids, type, val) => onChange(ids, 'y', type, val)}
      />
    </div>
  );
});
