import React from 'react';
import type { ComponentOptions } from '../interfaces';
export interface ProgressOptions extends ComponentOptions {
    percent: number;
}
export declare const PROGRESS_CLASS_NAME = "boxProgress";
export declare const PROGRESS_THUMB_CLASS_NAME = "boxProgressThumb";
declare function ProgressView(props: ProgressOptions): React.JSX.Element;
export declare const Progress: React.MemoExoticComponent<typeof ProgressView>;
export {};
//# sourceMappingURL=index.d.ts.map