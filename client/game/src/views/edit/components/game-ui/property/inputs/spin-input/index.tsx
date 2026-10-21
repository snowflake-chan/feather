import React, {
  memo,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { clamp } from 'ramda';
import { Input } from '@box/box-design';
import { InputPauseFlags } from '@box/schema/input/input-schema';
import { isUIScreen } from '@box/schema/project/ui-rda/util';
import { UITreeContext } from '../../../hooks';

import { InputPause, useInputPause } from 'src/views/components/input-lock';

import style from './index.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from 'src/redux/edit';

export type SpinInputProps = {
  value: number;
  mixed: boolean;
  onChange: (ids: string[], val: number) => void;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
};
const STEP = 1;
const MIN = 0;
export const SpinInput = memo((props: SpinInputProps) => {
  const {
    value,
    mixed,
    onChange: propsOnChange,
    className: propsClassName,
    precision = 0,
    min = MIN,
    max = Infinity,
    step = STEP,
  } = props;

  const [isFocused, setIsFocused] = useState<boolean>(false);

  const { inputPauseChange } = useInputPause();
  const { selectedIds, selectedScreenId } = useSelector((state: RootState) => ({
    selectedIds: state.gameUI.selectedIds,
    selectedScreenId: state.gameUI.screen.selectedScreenId,
  }));
  const { uiTree } = useContext(UITreeContext);

  const editingIds = useRef<string[]>([]);

  const onChange = useCallback(
    (v: number, isBtn?: boolean) => {
      if (!isBtn) {
        propsOnChange(editingIds.current, v);
        return;
      }
      if (selectedIds.length) {
        propsOnChange(selectedIds, v);
        return;
      }
      if (selectedScreenId) {
        propsOnChange([selectedScreenId], v);
      }
    },
    [propsOnChange, selectedIds, selectedScreenId],
  );

  const spinButton = useMemo(() => {
    const update = (ratio: number) => {
      !mixed && onChange(clamp(min, max, value + step * ratio), true);
    };

    return (
      <div className={style.spinButton}>
        <div
          className={`${style.spinBtn} ${mixed && style.disabled}`}
          onClick={() => update(1)}
        >
          <div className={style.addBtn} />
        </div>
        <div className={style.spinBtnDivider}></div>
        <div
          className={`${style.spinBtn} ${mixed && style.disabled}`}
          onClick={() => update(-1)}
        >
          <div className={style.subBtn} />
        </div>
      </div>
    );
  }, [mixed, value, onChange, min, max, step]);

  const className = useMemo(() => {
    const list = [style.container];

    if (propsClassName) {
      list.push(propsClassName);
    }

    return list.join(' ');
  }, [propsClassName]);

  return (
    <div
      className={className}
      onFocus={() => {
        !isFocused && setIsFocused(true);
        if (selectedIds.length) {
          editingIds.current = selectedIds;
          return;
        }
        if (selectedScreenId) {
          // 当前选中的是屏幕节点
          const screenNode = uiTree[selectedScreenId];
          if (screenNode && screenNode.value && isUIScreen(screenNode.value)) {
            editingIds.current = [selectedScreenId];
          }
        }
      }}
      onBlur={() => {
        isFocused && setIsFocused(false);
      }}
    >
      {isFocused && (
        <InputPause flags={InputPauseFlags.ALL} change={inputPauseChange} />
      )}
      <Input
        mixed={mixed}
        size="small"
        type="primary"
        valueType="number"
        value={value}
        precision={precision}
        min={min}
        max={max}
        step={step}
        onFocus={() => {
          setIsFocused(true);
        }}
        onBlur={(v) => {
          setIsFocused(false);
          onChange(Number(v));
        }}
        suffix={spinButton}
      />
    </div>
  );
});
