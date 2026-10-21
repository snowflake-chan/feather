import React, { type JSX } from 'react';
import { ComponentOptions, SerializedVec3 } from '../interfaces';
interface AxisInputsOptions extends ComponentOptions {
    vec3Value: SerializedVec3;
    min?: number;
    max?: number;
    onConfirm?: (newValue: SerializedVec3) => void;
}
export declare const AxisInputs: React.MemoExoticComponent<typeof AxisInputsView>;
export declare function AxisInputsView(props: AxisInputsOptions): JSX.Element;
export {};
//# sourceMappingURL=index.d.ts.map