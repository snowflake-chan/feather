import React, {
  useMemo,
  memo,
  ReactNode,
  useState,
  useRef,
  useCallback,
  useContext,
} from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'src/redux/edit';
import { Input } from '@box/box-design';
import { IconPercentage, IconPixel } from '@box/icons';
import { InputPauseFlags } from '@box/schema/input/input-schema';
import { UICoord2Keys } from '@box/schema/project/ui-rda/defs';
import { isUIScreen } from '@box/schema/project/ui-rda/util';
import { InputPause, useInputPause } from 'src/views/components/input-lock';
import style from './index.module.scss';
import { UITreeContext } from '../../../hooks';

type ValueSpec = {
  value: number;
  mixed: boolean;
};

export type AxisInputValue = {
  offset: ValueSpec;
  ratio: ValueSpec;
  disabled?: boolean;
};

export interface AxisInputProps extends AxisInputValue {
  prefix: ReactNode;
  onChange: (ids: string[], type: UICoord2Keys, val: number) => void;
}

export const AxisInput = memo((props: AxisInputProps) => {
  const { selectedIds, selectedScreenId } = useSelector((state: RootState) => ({
    selectedIds: state.gameUI.selectedIds,
    selectedScreenId: state.gameUI.screen.selectedScreenId,
  }));
  const { uiTree } = useContext(UITreeContext);
  const {
    prefix: prefixOption,
    offset,
    ratio,
    onChange: propsOnChange,
    disabled,
  } = props;
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const { inputPauseChange } = useInputPause();
  const editingIds = useRef<string[]>([]);

  const prefix = useMemo(() => {
    return prefixOption && <div className={style.prefix}>{prefixOption}</div>;
  }, [prefixOption]);

  const ratioValue = ratio.value * 100;

  const className = useMemo(() => {
    const list: string[] = [style.container];

    if (disabled) {
      list.push(style.disabled);
    }

    return list.join(' ');
  }, [disabled]);

  const onChange = useCallback(
    (v: number, key: UICoord2Keys) => {
      propsOnChange(editingIds.current, key, v);
    },
    [propsOnChange],
  );

  return (
    <div
      className={className}
      // Input组件的onBlur并不是真正的onBlur，Mixed状态下不会触发，先在这层做统一处理
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
        size="small"
        type="noBorder"
        valueType="number"
        value={ratioValue}
        mixed={ratio.mixed}
        prefix={prefix}
        precision={1}
        disabled={disabled}
        suffix={
          <div className={style.suffix}>
            <IconPercentage />
          </div>
        }
        onBlur={(v) => onChange(Number(v) / 100, 'ratio')}
      />
      <div className={style.divider} />
      <Input
        size="small"
        type="noBorder"
        valueType="number"
        value={offset.value}
        mixed={offset.mixed}
        precision={1}
        disabled={disabled}
        suffix={
          <div className={style.suffix}>
            <IconPixel />
          </div>
        }
        onBlur={(v) => onChange(Number(v), 'offset')}
      />
    </div>
  );
});
