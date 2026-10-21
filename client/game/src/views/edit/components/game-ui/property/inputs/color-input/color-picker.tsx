import React, { ReactNode, memo, useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { IconCancel } from '@box/icons';
import { Input } from '@box/box-design';
import { useClassName } from '@box/box-design/build/util';
import { InputPauseFlags } from '@box/schema/input/input-schema';
import {
  hexToRGB,
  hsvToRGB,
  RGBToHex,
  RGBToHsv,
} from '../../../../../../../utils/color';
import { HueSlider, SaturationValueSketch } from './slider-sketch';
import { InputPause, useInputPause } from 'src/views/components/input-lock';
import { vec3 } from 'gl-matrix';

import styles from './color-picker.module.scss';

export type ColorPickerInfo = {
  rgb: vec3;
  ids: string[];
  rect: DOMRect;
};

export type ColorPickerProps = {
  rgb: vec3;
  ids: string[];
  onClose: () => void;
  onColorChange: (ids: string[], newRgb: vec3, shouldCommit: boolean) => void;
};
export const ColorPicker = memo((props: ColorPickerProps) => {
  const intl = useIntl();
  const { ids, rgb, onClose, onColorChange } = props;
  const [r, g, b] = rgb; // 获取 r g b
  const [hsv, setHsv] = useState<vec3>(RGBToHsv(r, g, b)); // rgb -> hsv,缓存 hsv ,以避免RGB和HSV相互转化引起的数据抖动

  const onHSVChange = useCallback(
    (newHsv: vec3, shouldCommit: boolean) => {
      const [h, s, v] = newHsv;
      const newRgb = hsvToRGB(h, s, v);
      setHsv(newHsv);
      onColorChange(ids, newRgb, shouldCommit);
    },
    [ids, onColorChange],
  );

  return (
    <div className={styles.settings}>
      <div className={styles.title}>
        <div className={styles.name}>
          {intl.formatMessage({ id: 'gameUIColorPicker' })}
        </div>
        <IconCancel onClick={onClose} />
      </div>
      <SaturationValueSketch hsv={hsv} onChange={onHSVChange} />
      <div className={styles.slider}>
        <HueSlider hsv={hsv} onChange={onHSVChange} />
      </div>
      <PaletteInputs hsv={hsv} onHSVChange={onHSVChange} />
    </div>
  );
});

const PaletteInputs = memo(PaletteInputsView);

function PaletteInputsView(options: {
  hsv: vec3;
  onHSVChange: (newHsv: vec3, shouldCommit: boolean) => void;
}) {
  const { hsv, onHSVChange } = options;
  const getColor = useCallback((rgb: vec3) => {
    const [r, g, b] = rgb;
    const hex = RGBToHex(r, g, b).toUpperCase();
    return {
      r,
      g,
      b,
      hex,
    };
  }, []);

  const onConfirm = useCallback(
    (hexStr: string) => {
      const newRgb = hexToRGB(hexStr);
      if (!newRgb) {
        return;
      }
      const [R, G, B] = newRgb;
      const newHsv = RGBToHsv(R, G, B);
      onHSVChange(newHsv, true);
    },
    [onHSVChange],
  );

  const { r, g, b, hex } = useMemo(() => {
    const [h, s, v] = hsv;
    const newRgb = hsvToRGB(h, s, v);
    return getColor(newRgb);
  }, [getColor, hsv]);

  return (
    <div className={styles.inputs}>
      <PaletteInput
        className={styles.hex}
        value={hex}
        onConfirm={(value) => {
          onConfirm(value.toString());
        }}
      >
        HEX
      </PaletteInput>
      <PaletteInput
        value={r}
        onConfirm={(value) => {
          const v = RGBToHex(Number(value), g, b);
          onConfirm(v);
        }}
      >
        R
      </PaletteInput>
      <PaletteInput
        value={g}
        onConfirm={(value) => {
          const v = RGBToHex(r, Number(value), b);
          onConfirm(v);
        }}
      >
        G
      </PaletteInput>
      <PaletteInput
        value={b}
        onConfirm={(value) => {
          const v = RGBToHex(r, g, Number(value));
          onConfirm(v);
        }}
      >
        B
      </PaletteInput>
    </div>
  );
}

const PaletteInput = memo(PaletteInputView);

function PaletteInputView(options: {
  className?: string;
  children?: ReactNode;
  value: string | number;
  onConfirm: (value: string | number) => void;
}) {
  const { className: optionClassName, children, value, onConfirm } = options;
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const { inputPauseChange } = useInputPause();

  const className = useClassName(
    [styles.input, optionClassName],
    [optionClassName],
  );

  const isNumber = typeof value === 'number';
  const rbgValidator = useCallback((value: string) => {
    return /^\d{0,3}$/.test(value);
  }, []);
  const hexValidator = useCallback((value: string) => {
    return /^[a-fA-F\d]{0,6}$/.test(value);
  }, []);

  return (
    <div className={className}>
      {isFocused && (
        <InputPause flags={InputPauseFlags.ALL} change={inputPauseChange} />
      )}
      <Input
        className={styles.value}
        type="primary"
        size="small"
        center
        min={isNumber ? 0 : undefined}
        max={isNumber ? 255 : undefined}
        valueType={isNumber ? 'number' : 'string'}
        value={value}
        onFocus={() => {
          setIsFocused(true);
        }}
        onBlur={(value) => {
          setIsFocused(false);
          onConfirm && onConfirm(value);
        }}
        validator={isNumber ? rbgValidator : hexValidator}
      />
      <div className={styles.label}>{children}</div>
    </div>
  );
}
