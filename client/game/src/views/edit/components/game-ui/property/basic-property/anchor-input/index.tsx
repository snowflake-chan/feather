import React, { memo } from 'react';
import { useIntl } from 'react-intl';
import { IconPositionX, IconPositionY } from '@box/icons';
import {
  AnchorAxisInput,
  AnchorAxisValue,
} from '../../inputs/anchor-axis-input';
import styles from './style.module.scss';

type AnchorProps = {
  x: AnchorAxisValue;
  y: AnchorAxisValue;
  onChange: (ids: string[], axis: 'x' | 'y', value: number) => void;
};

export const AnchorInput = memo((props: AnchorProps) => {
  const intl = useIntl();
  const { x, y, onChange } = props;

  return (
    <div className={styles.anchorInput}>
      <div className={styles.title}>
        {intl.formatMessage({
          id: 'gameUIPropAnchor',
        })}
      </div>
      <div className={styles.inputs}>
        <AnchorAxisInput
          prefix={<IconPositionX />}
          value={x.value * 100}
          mixed={x.mixed}
          disabled={x.disabled}
          onChange={(ids, val) => {
            onChange(ids, 'x', val / 100);
          }}
        />
        <AnchorAxisInput
          prefix={<IconPositionY />}
          value={y.value * 100}
          mixed={y.mixed}
          disabled={y.disabled}
          onChange={(ids, val) => {
            onChange(ids, 'y', val / 100);
          }}
        />
      </div>
    </div>
  );
});
