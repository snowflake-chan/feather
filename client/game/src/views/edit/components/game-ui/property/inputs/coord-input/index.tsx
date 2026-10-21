import React, { ReactNode, memo, useMemo } from 'react';
import { IconPositionX, IconPositionY } from '@box/icons';
import {
  AnchorAxisInput,
  AnchorAxisValue,
} from '../../inputs/anchor-axis-input';
import styles from './style.module.scss';

export type CoordInputProps = {
  x: AnchorAxisValue;
  y: AnchorAxisValue;
  name: string;
  onChange: (axis: 'x' | 'y', ids: string[], value: number) => void;
  suffix: ReactNode;
};

export const CoordInput = memo((props: CoordInputProps) => {
  const { name, x, y, onChange, suffix } = props;

  const { onXChange, onYChange } = useMemo(() => {
    return {
      onXChange: (ids: string[], value: number) => onChange('x', ids, value),
      onYChange: (ids: string[], value: number) => onChange('y', ids, value),
    };
  }, [onChange]);

  return (
    <div className={styles.coordInput}>
      <div className={styles.title}>{name}</div>
      <div className={styles.inputs}>
        <AnchorAxisInput
          prefix={<IconPositionX />}
          value={x.value}
          mixed={x.mixed}
          min={x.min}
          max={x.max}
          disabled={x.disabled}
          onChange={onXChange}
          suffix={suffix}
        />
        <AnchorAxisInput
          prefix={<IconPositionY />}
          value={y.value}
          mixed={y.mixed}
          min={y.min}
          max={y.max}
          disabled={y.disabled}
          onChange={onYChange}
          suffix={suffix}
        />
      </div>
    </div>
  );
});
