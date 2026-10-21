import type { CSSProperties } from 'react';

/**
 * 组件通用的参数
 */
export interface ComponentOptions {
  className?: string;
  style?: CSSProperties;
}

export type AxisType = 'X' | 'Y' | 'Z';
export const AXIS: AxisType[] = ['X', 'Y', 'Z'];

export type SerializedVec3 = [number, number, number];

export type SerializedVec2 = [number, number];

export type ItemId = string | number;
