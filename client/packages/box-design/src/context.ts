import { createContext } from 'react';
import type { ItemId } from './interfaces';

export interface ToolbarMenuContextProps {
  selectedItem?: ItemId;
  onItemSelect: (options: { id: ItemId }) => void;
}

/**
 * 被Toolbar和Menu共享的Context
 */
export const ToolbarMenuContext = createContext<ToolbarMenuContextProps>({
  selectedItem: undefined,
  onItemSelect: () => {},
});

/**
 * 共享Tips状态的Context。
 * - 比如都在toolbar里，一旦触发过一次tips显示，后续都不需要再有延时。
 * - 但在指针离过开toolbar后，需要重置标记。
 */
export type SharedTipsContextType = {
  displayed: boolean;
  setDisplayed: (displayed: boolean) => void;
  delay: number;
  disabled: boolean;
  setDisabled: (disabled: boolean) => void;
};

export const SharedTipsContext = createContext<SharedTipsContextType>({
  displayed: false,
  setDisplayed: (displayed: boolean) => {},
  delay: 500,
  disabled: false,
  setDisabled: (disabled: boolean) => {},
});

export interface FileMenuContextProps {
  onClose: () => void;
}

export const FileMenuContext = createContext<FileMenuContextProps>({
  onClose: () => {},
});
