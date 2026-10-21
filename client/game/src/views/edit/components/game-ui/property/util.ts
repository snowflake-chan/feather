import { useMemo } from 'react';
import type { IntlShape } from 'react-intl';
import {
  AutoLayoutFillDirection,
  AutoLayoutHorizontalAlignType,
  AutoLayoutStartCorner,
  AutoLayoutVerticalAlignType,
  AutoResizeType,
  ImageDisplayMode,
  UICoord2,
  UIScrollDirection,
  UIScrollbarHorizontal,
  UIScrollbarVertical,
  UIScrollbarVisibility,
  UITextFontFamily,
} from '@box/schema/project/ui-rda/defs';
import type { MenuItemOptions } from '@box/box-design';
import { CARD_ID_PREFIX, PropTabType, isPropTabType } from './defs';
import type { AxisInputValue } from './inputs/axis-input';
import { isEnumType } from 'src/engine/utils/enum-type-guard';
import { UI_FONT_FACE_MAP } from 'src/engine/game-ui/nodes/defs';

/**
 * 判断属性卡片是否激活，如果激活返回卡片对应的属性
 * @param card 卡片本片
 * @param cardsScrollTop 卡片容器的垂直滚动数值
 */
export function isCardActive(
  card: HTMLDivElement,
  cardsScrollTop: number,
): PropTabType | undefined {
  const { offsetTop, offsetHeight } = card;

  const top = offsetTop - cardsScrollTop;

  if (top <= 0 && offsetHeight + top >= 0) {
    // 切换选中的tab
    const [, tabTypeStr] = card.id.split(CARD_ID_PREFIX);

    const tabType = parseInt(tabTypeStr);

    if (isPropTabType(tabType)) {
      return tabType;
    }
  }

  return;
}

export const isAutoResize = isEnumType(AutoResizeType);

export const isDisplayMode = isEnumType(ImageDisplayMode);

export const isStartCorner = isEnumType(AutoLayoutStartCorner);

export const isFillDirection = isEnumType(AutoLayoutFillDirection);

export const isScrollDirection = isEnumType(UIScrollDirection);

export const isScrollbarHorizontal = isEnumType(UIScrollbarHorizontal);
export const isScrollbarVertical = isEnumType(UIScrollbarVertical);

export const isScrollbarVisibility = isEnumType(UIScrollbarVisibility);

export const isFontFamily = isEnumType(UITextFontFamily);

export function mergeConfig<T, R>(spec: {
  out?: MergedConfig<T>;
  b: R;
  isConflict: (a: T, b: R) => boolean;
  transform: (b: R, out?: T) => T;
}): MergedConfig<T> {
  const { out, b, isConflict, transform } = spec;

  if (!out) {
    return {
      mixed: false,
      value: transform(b),
    };
  }

  if (isConflict(out.value, b)) {
    out.mixed = true;
    out.value = transform(b, out.value);
  }

  return out;
}

export function composeMergeConfig<T, R = T>(
  isConflict: (a: T, b: R) => boolean,
  transform: (b: R, out?: T) => T,
) {
  return (spec: { out?: MergedConfig<T>; b: R }) =>
    mergeConfig({
      out: spec.out,
      b: spec.b,
      isConflict,
      transform,
    });
}

export function mergeBasicType<T>(spec: { out?: MergedConfig<T>; b: T }) {
  return mergeConfig({
    out: spec.out,
    b: spec.b,
    isConflict: (a, b) => a !== b,
    transform: (b) => b,
  });
}
export type MergedConfig<T> = {
  mixed: boolean;
  value: T;
};

export function mergeAxisInputValue(spec: {
  out?: AxisInputValue;
  coord2: UICoord2;
  type: 'x' | 'y';
}): AxisInputValue {
  const { out, coord2, type } = spec;

  const idx = type === 'x' ? 0 : 1;

  if (!out) {
    return {
      offset: {
        value: coord2.offset[idx],
        mixed: false,
      },
      ratio: {
        value: coord2.ratio[idx],
        mixed: false,
      },
    };
  }

  out.offset = mergeBasicType({
    out: out.offset,
    b: coord2.offset[idx],
  });

  out.ratio = mergeBasicType({
    out: out.ratio,
    b: coord2.ratio[idx],
  });

  return out;
}

export type HorizontalAlignmentConfig =
  MergedConfig<AutoLayoutHorizontalAlignType>;
export type VerticalAlignmentConfig = MergedConfig<AutoLayoutVerticalAlignType>;

export function useFontFamilySelections(intl: IntlShape) {
  return useMemo<MenuItemOptions[]>(() => {
    const selections: MenuItemOptions[] = [
      UITextFontFamily.Default,
      UITextFontFamily.BoldRound,
      UITextFontFamily.CodeNewRomanBold,
      UITextFontFamily.ENSerif,
    ].map((id) => {
      const fontFaceConfig = UI_FONT_FACE_MAP[id];

      let text: string;

      if (id !== UITextFontFamily.Default) {
        text = fontFaceConfig.selectionName;
      } else {
        text = intl.formatMessage({ id: 'gameUIFontFamilyDefault' });
      }

      return {
        id,
        text,
      };
    });

    return selections;
  }, [intl]);
}
