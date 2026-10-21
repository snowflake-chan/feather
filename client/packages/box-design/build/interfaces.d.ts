import type { CSSProperties } from 'react';
export interface ComponentOptions {
    className?: string;
    style?: CSSProperties;
}
export type AxisType = 'X' | 'Y' | 'Z';
export declare const AXIS: AxisType[];
export type SerializedVec3 = [number, number, number];
export type SerializedVec2 = [number, number];
export type ItemId = string | number;
//# sourceMappingURL=interfaces.d.ts.map