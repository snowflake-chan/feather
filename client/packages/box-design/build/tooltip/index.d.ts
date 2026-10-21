import React from 'react';
import { ComponentOptions } from '../interfaces';
import { TriggerChildren, TriggerOptions } from '../trigger';
export type ImageMedia = {
    type: 'image';
    src: string;
};
export type VideoMedia = {
    type: 'video';
    src: string;
    loopGap?: number;
    playbackRate?: number;
};
export interface TooltipOptions extends ComponentOptions {
    text: string;
    title?: string;
    media?: ImageMedia | VideoMedia;
    addition?: string;
}
export declare function Tooltip(props: TooltipOptions): React.JSX.Element;
export type TooltipTriggerOptions = TooltipOptions & TriggerOptions;
interface TooltipTriggerProps extends TooltipTriggerOptions {
    children?: TriggerChildren;
}
export declare function TooltipTrigger(options: TooltipTriggerProps): React.JSX.Element;
export {};
//# sourceMappingURL=index.d.ts.map