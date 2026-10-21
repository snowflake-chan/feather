import React, {
  ReactNode,
  useMemo,
  memo,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useSelector } from 'react-redux';
import { Input } from '@box/box-design';
import { IconPercentage } from '@box/icons';
import { InputPauseFlags } from '@box/schema/input/input-schema';
import { InputPause, useInputPause } from 'src/views/components/input-lock';
import { RootState } from 'src/redux/edit';
import style from './index.module.scss';

export type AnchorAxisValue = {
  value: number;
  mixed: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
};

interface AnchorAxisInputProps extends AnchorAxisValue {
  prefix: ReactNode;
  suffix?: ReactNode;
  onChange: (ids: string[], val: number) => void;
}
export const AnchorAxisInput = memo((props: AnchorAxisInputProps) => {
  const {
    prefix: prefixOption,
    suffix: suffixOption = <IconPercentage />,
    value,
    mixed,
    disabled,
    onChange: propsOnChange,
    min = 0,
    max = 100,
  } = props;
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const { inputPauseChange } = useInputPause();
  const selectedIds = useSelector(
    (state: RootState) => state.gameUI.selectedIds,
  );
  const editingIds = useRef<string[]>([]);

  const onChange = useCallback(
    (v: string) => {
      propsOnChange(editingIds.current, Number(v));
    },
    [propsOnChange],
  );
  const prefix = useMemo(() => {
    return <div className={style.prefix}>{prefixOption}</div>;
  }, [prefixOption]);

  const className = useMemo(() => {
    const list = [style.container];

    if (disabled) {
      list.push(style.disabled);
    }

    return list.join(' ');
  }, [disabled]);

  const suffix = useMemo(() => {
    return <div className={style.suffix}>{suffixOption}</div>;
  }, [suffixOption]);

  return (
    <div
      className={className}
      onFocus={() => {
        !isFocused && setIsFocused(true);
        editingIds.current = selectedIds;
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
        type="primary"
        valueType="number"
        prefix={prefix}
        precision={1}
        min={min}
        max={max}
        value={value}
        mixed={mixed}
        disabled={disabled}
        suffix={suffix}
        onBlur={onChange}
      />
    </div>
  );
});
