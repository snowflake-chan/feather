import type { ItemId } from './interfaces';
export interface ToolbarMenuContextProps {
    selectedItem?: ItemId;
    onItemSelect: (options: {
        id: ItemId;
    }) => void;
}
export declare const ToolbarMenuContext: import("react").Context<ToolbarMenuContextProps>;
export type SharedTipsContextType = {
    displayed: boolean;
    setDisplayed: (displayed: boolean) => void;
    delay: number;
    disabled: boolean;
    setDisabled: (disabled: boolean) => void;
};
export declare const SharedTipsContext: import("react").Context<SharedTipsContextType>;
export interface FileMenuContextProps {
    onClose: () => void;
}
export declare const FileMenuContext: import("react").Context<FileMenuContextProps>;
//# sourceMappingURL=context.d.ts.map