import { vec2, vec3 } from 'gl-matrix';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { hsvToRGB } from '../../../../../../../utils/color';
import { useAppSlider } from 'src/views/hooks';

import styles from './color-picker.module.scss';

const HUE_MAX = 360; // H - 色相

const SATURATION_MAX = 100; // S - 饱和度

const VALUE_MAX = 100; // V - 明度

const HALF_THUMB_SIZE = 9; // Thumb半径

type HueSliderProps = {
  hsv: vec3;
  onChange: (newHsv: vec3, shouldCommit: boolean) => void;
};
export function HueSlider(props: HueSliderProps) {
  const { hsv, onChange } = props;
  const [hue, saturation, value] = hsv; // 获取 h s v

  const hueRGBStr = useHueRGB(hue); // hue色相 -> RGB字符串

  const trackRef = useRef<HTMLDivElement | null>(null); // 滑动条轨道
  const [thumbOffset, setThumbOffset] = useState<string>(''); // 滑块偏移量

  const { onDragging, onDragEnd } = useMemo(() => {
    const update = (shouldCommit: boolean) => {
      return ([x]: [number, number]) => {
        const ratio = x / HUE_MAX;
        const newHue = Math.floor(HUE_MAX * ratio);
        onChange([newHue, saturation, value], shouldCommit);
      };
    };
    const onDragging = update(false);
    const onDragEnd = update(true);
    return { onDragging, onDragEnd };
  }, [onChange, saturation, value]);

  const { onMouseDown: trigger, railRect } = useAppSlider({
    railRef: trackRef,
    min: [0, 0],
    max: [HUE_MAX, 0],
    onChange: onDragging,
    onAfterChange: onDragEnd,
  });

  useEffect(() => {
    if (!railRect.current) {
      return;
    }
    const offset =
      (hue / HUE_MAX) * railRect.current.width - HALF_THUMB_SIZE * 2;
    setThumbOffset(`translateX(${offset}px)`);
  }, [hue, railRect, thumbOffset]);

  return (
    <div className={styles.bar} ref={trackRef} onMouseDown={trigger}>
      <div
        className={styles.thumb}
        style={{ transform: thumbOffset, backgroundColor: hueRGBStr }}
      />
    </div>
  );
}

type SaturationSliderProps = {
  hsv: vec3;
  onChange: (newRgb: vec3, shouldCommit: boolean) => void;
};
export function SaturationValueSketch(props: SaturationSliderProps) {
  const { hsv, onChange } = props;
  const [hue, saturation, value] = hsv;
  const hueRGBStr = useHueRGB(hue);

  const rgb = useMemo(() => {
    const [r, g, b] = hsvToRGB(hue, saturation, value);

    return `rgb(${r}, ${g}, ${b})`;
  }, [hue, saturation, value]);

  const railRef = useRef<HTMLDivElement | null>(null);

  const [thumbOffset, setThumbOffset] = useState<string>('');

  const { onDragging, onDragEnd } = useMemo(() => {
    const update = (shouldCommit: boolean) => {
      return (pos: vec2) => {
        const [x, y] = pos;

        const newS = x;

        const newV = 100 - y;

        onChange([hue, newS, newV], shouldCommit);
      };
    };
    const onDragging = update(false);
    const onDragEnd = update(true);
    return { onDragging, onDragEnd };
  }, [hue, onChange]);

  const { onMouseDown: trigger, railRect } = useAppSlider({
    railRef,
    min: [0, 0],
    max: [SATURATION_MAX, VALUE_MAX],
    onChange: onDragging,
    onAfterChange: onDragEnd,
  });

  useEffect(() => {
    if (!railRect.current) {
      return;
    }

    const { width, height } = railRect.current;

    const offsetX = (saturation / SATURATION_MAX) * width - HALF_THUMB_SIZE * 2;
    const offsetY =
      ((VALUE_MAX - value) / VALUE_MAX) * height - HALF_THUMB_SIZE;

    setThumbOffset(`translate(${offsetX}px, ${offsetY}px)`);
  }, [saturation, railRect, value]);

  return (
    <div className={styles.picker}>
      <div
        ref={railRef}
        className={styles.background}
        style={{ backgroundColor: hueRGBStr }}
        onMouseDown={trigger}
      />
      <div className={styles.backgroundSaturation} />
      <div className={styles.backgroundValue} />
      <div
        className={styles.thumb}
        style={{ transform: thumbOffset, backgroundColor: rgb }}
      ></div>
    </div>
  );
}

/**
 * 根据Hue值，计算[Hue, S_MAX, V_MAX]的RGB。
 */
function useHueRGB(hue: number): string {
  return useMemo(() => {
    const [r, g, b] = hsvToRGB(hue, SATURATION_MAX, VALUE_MAX);

    return `rgb(${r}, ${g}, ${b})`;
  }, [hue]);
}
