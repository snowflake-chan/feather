import {
  UIAutoLayoutRDA,
  UIBoxRDA,
  UIElement,
  UIImage,
  UIInput,
  UIInputRDA,
  UILayoutType,
  UIScreen,
  UIScrollBox,
  UIScrollBoxRDA,
  UIText,
  UITextRDA,
  UITreeNode,
} from '@box/schema/project/ui-rda/defs';
import {
  isUIAutoLayout,
  isUIElement,
  isUIImageElement,
  isUIInputElement,
  isUIScreen,
  isUIScrollBoxElement,
  isUITextElement,
} from '@box/schema/project/ui-rda/util';
import { GameUINode } from './base';
import { GameUIText } from './text';
import { GameUIImage } from './image';
import { GameUIRenderable } from './renderable';
import { GameUIAutoLayout } from './auto-layout';
import { isRenderable, isScreen } from '../util';
import { GameUIScrollBox } from './scroll-box';
import { GameUIInput } from 'src/engine/game-ui/nodes/input';
import { GameUIScreen } from 'src/engine/game-ui/nodes/screen';

/**
 * TODO UIScale组件还没正式放进编辑态中，先留在这里
 * 待后续有正式的配置项后，再去掉
 */
export type UIScaleProps = { scale: number };

export const DEFAULT_SCALE: UIScaleProps = {
  scale: 1,
};

/**
 * 同步节点树的数据给GameUI实例
 */
export function updateByUITreeNode(out: GameUINode, treeNode: UITreeNode) {
  if (!treeNode.value) {
    return;
  }

  out.name = treeNode.name;

  if (isUIElement(treeNode.value) && isRenderable(out)) {
    updateByUIElement(out, treeNode.value.data);
    return;
  }

  if (isUIScreen(treeNode.value) && isScreen(out)) {
    updateByUIScreen(out, treeNode.value.data);
    return;
  }
}

/**
 * 同步节点树的组件数据
 */
function updateComponents(
  out: GameUINode,
  components: { layout: UILayoutType },
) {
  const { layout } = components;

  if (!isUIAutoLayout(layout)) {
    out.components.uiAutoLayout = undefined;

    return;
  }

  if (!out.components.uiAutoLayout) {
    out.components.uiAutoLayout = new GameUIAutoLayout();
  }

  UIAutoLayoutRDA.stateSchema.assign(out.components.uiAutoLayout, layout.data);
}

/**
 * 同步元素的数据
 */
export function updateByUIElement(
  out: GameUIRenderable,
  elementData: UIElement,
) {
  updateComponents(out, elementData.data);

  // Box是最基础的元素，它有的属性，其他元素都有。用它来作为Renderable的基础属性同步。
  const { anchor, backgroundColor, position, size } =
    UIBoxRDA.stateSchema.muData;

  anchor.assign(out.anchor, elementData.data.anchor);

  out.autoResize = elementData.data.autoResize;

  backgroundColor.assign(out.backgroundColor, elementData.data.backgroundColor);
  out.backgroundOpacity = elementData.data.backgroundOpacity;

  out.clipsDescendants = elementData.data.clipsDescendants;

  out.layoutOrder = elementData.data.layoutOrder;

  position.assign(out.transform.position, elementData.data.position);
  size.assign(out.transform.size, elementData.data.size);

  out.visible = elementData.data.visible;

  out.zIndex = elementData.data.zIndex;

  out.rotation = elementData.data.rotation;

  if (isUITextElement(elementData) && out instanceof GameUIText) {
    applyTextProps(out, elementData.data);

    return;
  }

  if (isUIInputElement(elementData) && out instanceof GameUIInput) {
    applyInputProps(out, elementData.data);
    return;
  }

  if (isUIImageElement(elementData) && out instanceof GameUIImage) {
    applyImageProps(out, elementData.data);

    return;
  }

  if (isUIScrollBoxElement(elementData) && out instanceof GameUIScrollBox) {
    applyScrollBoxProps(out, elementData.data);

    return;
  }
}

/**
 * 同步屏幕数据
 * @param out
 * @param screenData
 */
export function updateByUIScreen(out: GameUIScreen, screenData: UIScreen) {
  out.visible = screenData.enable;
  out.zIndex = screenData.zIndex;
  updateComponents(out, screenData);
}

function applyTextProps(out: GameUIText, textData: UIText) {
  const { textColor, textStrokeColor } = UITextRDA.stateSchema.muData;

  textColor.assign(out.textColor, textData.textColor);
  out.textContent = textData.textContent;

  out.textFontSize = textData.textFontSize;

  out.textOpacity = textData.textOpacity;

  out.textXAlignment = textData.textXAlignment;
  out.textYAlignment = textData.textYAlignment;
  out.autoWordWrap = textData.autoWordWrap;
  out.textLineHeight = textData.textLineHeight;

  textStrokeColor.assign(out.textStrokeColor, textData.textStrokeColor);
  out.textStrokeOpacity = textData.textStrokeOpacity;
  out.textStrokeThickness = textData.textStrokeThickness;

  out.textFontFamily = textData.textFontFamily;
  out.richText = textData.richText;
}

function applyInputProps(out: GameUIInput, textData: UIInput) {
  const { textColor, textStrokeColor, placeholderColor } =
    UIInputRDA.stateSchema.muData;
  textColor.assign(out.textColor, textData.textColor);
  out.textContent = textData.textContent;
  out.textFontSize = textData.textFontSize;
  out.textOpacity = textData.textOpacity;
  out.textXAlignment = textData.textXAlignment;
  out.textYAlignment = textData.textYAlignment;
  out.autoWordWrap = textData.autoWordWrap;
  out.textLineHeight = textData.textLineHeight;
  // placeholder
  out.placeholder = textData.placeholder;
  placeholderColor.assign(out.placeholderColor, textData.placeholderColor);
  out.placeholderOpacity = textData.placeholderOpacity;

  textStrokeColor.assign(out.textStrokeColor, textData.textStrokeColor);
  out.textStrokeOpacity = textData.textStrokeOpacity;
  out.textStrokeThickness = textData.textStrokeThickness;

  out.textFontFamily = textData.textFontFamily;
}

function applyImageProps(out: GameUIImage, imageData: UIImage) {
  out.image = imageData.image;

  out.imageOpacity = imageData.imageOpacity;

  out.imageDisplayMode = imageData.imageDisplayMode;
}

function applyScrollBoxProps(out: GameUIScrollBox, scrollBoxData: UIScrollBox) {
  const { scrollbarColor, scrollPosition, scrollCanvasSize } =
    UIScrollBoxRDA.stateSchema.muData;

  out.scrollDirection = scrollBoxData.scrollDirection;

  scrollbarColor.assign(out.scrollbarColor, scrollBoxData.scrollbarColor);

  out.scrollbarOpacity = scrollBoxData.scrollbarOpacity;

  out.scrollbarThickness = scrollBoxData.scrollbarThickness;

  out.scrollbarVisibility = scrollBoxData.scrollbarVisibility;

  out.scrollbarHorizontal = scrollBoxData.scrollbarHorizontal;
  out.scrollbarVertical = scrollBoxData.scrollbarVertical;

  out.scrollCanvasAutoResize = scrollBoxData.scrollCanvasAutoResize;

  scrollCanvasSize.assign(out.scrollCanvasSize, scrollBoxData.scrollCanvasSize);

  scrollPosition.assign(out.scrollPosition, scrollBoxData.scrollPosition);
}
