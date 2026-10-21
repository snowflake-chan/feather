import { vec3 } from 'gl-matrix';
import React, { memo, useState, useCallback, useMemo, useRef } from 'react';
import { Input } from '@box/box-design';
import { InputPauseFlags } from '@box/schema/input/input-schema';

import { InputPause, useInputPause } from 'src/views/components/input-lock';
import { RGBToHex, hexToRGB } from 'src/utils/color';

import style from './index.module.scss';

export type ColorGroup = {
  groupId: string;
  ids: string[];
  color: vec3;
  opacity: number;
};
export type ColorGroups = Record<string, ColorGroup>;

export type ColorInputProps = {
  ids: string[];
  groupId: string;
  rgb: vec3;
  opacity: number;
  changeRGB: (ids: string[], newRgb: vec3) => void;
  changeOpacity: (ids: string[], newOpacity: number) => void;
  setColorPicker: (rect: DOMRect) => void;
};
export const ColorInput = memo((props: ColorInputProps) => {
  const {
    ids,
    groupId,
    rgb,
    opacity,
    changeRGB,
    changeOpacity,
    setColorPicker,
  } = props;
  const [r, g, b] = rgb;
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const { inputPauseChange } = useInputPause();
  const editingIds = useRef<string[]>([]);

  const onHexChange = useCallback(
    (newHex: string) => {
      const newRgb = hexToRGB(newHex);
      if (!newRgb) {
        // 若输入的内容不能转为合法的hex格式，则不修改
        return;
      }
      changeRGB(editingIds.current, newRgb);
    },
    [changeRGB],
  );

  const onOpacityChange = useCallback(
    (v: number) => {
      changeOpacity(editingIds.current, v);
    },
    [changeOpacity],
  );

  return (
    <div className={style.container}>
      {isFocused && (
        <InputPause flags={InputPauseFlags.ALL} change={inputPauseChange} />
      )}
      <div
        style={{ backgroundColor: useRGBStr(rgb) }}
        className={style.colorPreview}
        onClick={(e) => setColorPicker(e.currentTarget.getBoundingClientRect())}
      />
      <div className={`${style.hex} ${style.colorInput}`}>
        <Input
          center
          size="small"
          type="line"
          valueType="string"
          value={RGBToHex(r, g, b).toUpperCase()} // RGB -> Hex
          formatter={(value) => `#${value}`} // 格式化为：以 # 开头 且 大写
          onFocus={() => {
            setIsFocused(true);
            editingIds.current = ids;
          }}
          onBlur={(value) => {
            setIsFocused(false);
            onHexChange(value);
          }}
        />
      </div>
      <div className={`${style.opacity} ${style.colorInput}`}>
        <Input
          center
          size="small"
          type="line"
          valueType="number"
          max={100}
          min={0}
          precision={0}
          step={1}
          value={Math.round(opacity * 100)}
          formatter={(v) => `${v}%`} // 格式化为百分比格式
          onFocus={() => {
            setIsFocused(true);
            editingIds.current = ids;
          }}
          onBlur={(value) => {
            setIsFocused(false);
            onOpacityChange(Number(value) / 100);
          }}
        />
      </div>
    </div>
  );
});

/**
 * 根据vec3 Rgb 生成rgb字符串
 */
function useRGBStr(rgb: vec3): string {
  return useMemo(() => {
    const [r, g, b] = rgb;

    return `rgb(${r}, ${g}, ${b})`;
  }, [rgb]);
}
