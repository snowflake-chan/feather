import { DependencyList, MouseEvent } from 'react';
export declare function useClassName(classNames: (string | undefined)[], deps?: DependencyList): string;
export declare function useInteraction(options: {
    onLongPress?: () => void;
    onClick?: () => void;
    clearDeps?: React.DependencyList;
}): {
    onStart: () => void;
    onEnd: () => void;
};
export declare function isMac(): boolean;
export declare function isMetaKeyPressed(evt: MouseEvent | KeyboardEvent): boolean;
export declare function isValidNumber(text: string): boolean;
export declare function substringByWidth(str: string, limit: number): string;
export declare function getStringWidth(str: string): number;
export declare function popStringByWidth(str: string, popWidth: number): string;
//# sourceMappingURL=util.d.ts.map