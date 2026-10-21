import React from 'react';
import { ReactNode, MutableRefObject } from 'react';
import type { ComponentOptions } from '../interfaces';
type SliderType = 'normal' | 'withButton';
export interface SliderOptions extends ComponentOptions {
    type: SliderType;
    min?: number;
    max?: number;
    value?: number;
    step?: number;
    onMouseDown?: () => void;
    onChange?: (value: number) => void;
    onAfterChange?: (value: number) => void;
    abortRef?: MutableRefObject<() => void>;
    sliderClassName?: string;
    input?: ReactNode;
    disabled?: boolean;
    buttonIncIcon?: ReactNode;
    buttonDecIcon?: ReactNode;
    buttonSteps?: number;
}
declare function SliderView(options: SliderOptions): React.JSX.Element;
export declare const Slider: React.MemoExoticComponent<typeof SliderView>;
export {};
//# sourceMappingURL=index.d.ts.map