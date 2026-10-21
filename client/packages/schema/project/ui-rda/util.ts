import type {
  UIElement,
  UIElementSpec,
  UIElementType,
  UILayoutSpecType,
  UILayoutType,
  UINode,
  UINodeSpec,
  UINodeType,
} from './defs';
import { MuRDAUnionSpec } from '../murda-union';

type UINodeSpecType = typeof UINodeSpec;

type UIElementSpecType = typeof UIElementSpec;

/**
 * 通过RDA字典和key，推断出对应RDA的stateSchema.identity
 */
type UnionRDAInstance<
  Spec extends MuRDAUnionSpec,
  Type extends keyof MuRDAUnionSpec,
> = {
  type: Type;
  data: Spec[Type]['stateSchema']['identity'];
};

type PickUIType<T extends UINodeType | UIElementType> = T extends UINodeType
  ? UnionRDAInstance<UINodeSpecType, T>
  : T extends UIElementType
  ? {
      type: 'element';
      data: UnionRDAInstance<UIElementSpecType, T>;
    }
  : undefined;

export function isUIScreen(value: UINode): value is PickUIType<'screen'> {
  return value.type === 'screen';
}

export function isUIElement(value: UINode): value is PickUIType<'element'> {
  return value.type === 'element';
}

export function isUIBoxElement(
  value: UIElement,
): value is PickUIType<'box'>['data'] {
  return value.type === 'box';
}
export function isUIBoxNode(value: UINode): value is PickUIType<'box'> {
  return isUIElement(value) && isUIBoxElement(value.data);
}

export function isUITextElement(
  value: UIElement,
): value is PickUIType<'text'>['data'] {
  return value.type === 'text';
}
export function isUITextNode(value: UINode): value is PickUIType<'text'> {
  return isUIElement(value) && isUITextElement(value.data);
}

export function isUIInputElement(
  value: UIElement,
): value is PickUIType<'input'>['data'] {
  return value.type === 'input';
}
export function isUIInputNode(value: UINode): value is PickUIType<'input'> {
  return isUIElement(value) && isUIInputElement(value.data);
}

export function isUIImageElement(
  value: UIElement,
): value is PickUIType<'image'>['data'] {
  return value.type === 'image';
}
export function isUIImageNode(value: UINode): value is PickUIType<'image'> {
  return isUIElement(value) && isUIImageElement(value.data);
}

export function isUIScrollBoxElement(
  value: UIElement,
): value is PickUIType<'scrollBox'>['data'] {
  return value.type === 'scrollBox';
}
export function isUIScrollBoxNode(
  value: UINode,
): value is PickUIType<'scrollBox'> {
  return isUIElement(value) && isUIScrollBoxElement(value.data);
}

export function isUIAutoLayout(
  value: UILayoutType,
): value is UnionRDAInstance<UILayoutSpecType, 'autoLayout'> {
  return value.type === 'autoLayout';
}

/**
 * 获取屏幕节点或元素节点的布局属性
 */
export function pickLayoutProp(value: UINode) {
  if (isUIElement(value)) {
    return value.data.data.layout;
  } else if (isUIScreen(value)) {
    return value.data.layout;
  } else {
    return;
  }
}

/**
 * 获取节点的自布局属性，如果未开启自动布局，返回undefined
 */
export function pickAutoLayoutProp(value: UINode) {
  const layout = pickLayoutProp(value);

  if (!layout || !isUIAutoLayout(layout)) {
    return;
  }

  return layout;
}
