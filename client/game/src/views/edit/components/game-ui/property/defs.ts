import { createContext } from 'react';
import { MenuItemOptions } from '@box/box-design';
import { AutoResizeType } from '@box/schema/project/ui-rda/defs';
import { isEnumType } from 'src/engine/utils/enum-type-guard';

export enum PropTabType {
  Basic,
  Text,
  Input,
  Image,
  ScrollBox,
  AutoLayout,
  Screen,
}

export const isPropTabType = isEnumType(PropTabType);

export type GameUIPropsContextType = {
  selectedTab: PropTabType;
  /**
   * 点击左侧属性tab，选中tab并让卡片尽可能滚动至顶部。
   * @param tabType
   */
  scrollCardByTab: (tabType: PropTabType) => void;
  /**
   * 滑动右侧卡片，选中tab并让tab以一种很复杂的方式展示在可见区域。
   * @param tabType
   */
  selectTabByCard: (tabType: PropTabType) => void;
};

export const GameUIPropsContext = createContext<GameUIPropsContextType>({
  selectedTab: PropTabType.Basic,
  scrollCardByTab: () => undefined,
  selectTabByCard: () => undefined,
});

/**
 * 属性卡片的id前缀，用于查找真实DOM，处理滚动相关的DOM操作
 */
export const CARD_ID_PREFIX = 'card';
/**
 * 属性tab的id前缀，用于查找真实DOM，处理滚动相关的DOM操作
 */
export const TAB_ID_PREFIX = 'tab';

/**
 * 可选属性 - 卡片 - 菜单ID
 */
export enum OptionalPropMenuIds {
  Remove = 'remove',
}

export const AUTO_RESIZE_ITEMS: MenuItemOptions[] = [
  {
    id: AutoResizeType.NONE,
    text: 'None',
  },
  {
    id: AutoResizeType.X,
    text: 'X',
  },
  {
    id: AutoResizeType.Y,
    text: 'Y',
  },
  {
    id: AutoResizeType.XY,
    text: 'XY',
  },
];
