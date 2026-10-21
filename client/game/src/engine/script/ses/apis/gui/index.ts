import {
  ImageDisplayMode,
  PointerEventBehavior,
  UIBoxRDA,
  UIElement,
  UIElementType,
  UIImageRDA,
  UIInputRDA,
  UIScreenRDA,
  UIScrollBoxRDA,
  UITextFontFamily,
  UITextRDA,
} from '@box/schema/project/ui-rda/defs';
import { nanoid } from 'nanoid/non-secure';
import type { GameUIClient } from 'src/engine/game-ui';
import { GameUIBox } from 'src/engine/game-ui/nodes/box';
import { MAX_SCREEN_COUNT } from 'src/engine/game-ui/nodes/defs';
import { GameUIImage } from 'src/engine/game-ui/nodes/image';
import { GameUIInput } from 'src/engine/game-ui/nodes/input';
import type { GameUIRenderable } from 'src/engine/game-ui/nodes/renderable';
import { GameUIScale } from 'src/engine/game-ui/nodes/scale';
import { GameUIScreen } from 'src/engine/game-ui/nodes/screen';
import { GameUIScrollBox } from 'src/engine/game-ui/nodes/scroll-box';
import { GameUIText } from 'src/engine/game-ui/nodes/text';
import {
  updateByUIElement,
  updateByUIScreen,
} from 'src/engine/game-ui/nodes/update-node';
import { isScreen } from 'src/engine/game-ui/util';
import { UiInput } from 'src/engine/script/ses/apis/gui/ui-input';
import type { ScriptClientConsole } from '../console';
import { ClientScriptContext } from '../context/const';
import { UiBox } from './ui-box';
import { UiComponent } from './ui-component';
import { UiImage } from './ui-image';
import { UiNode } from './ui-node';
import { UiRenderable } from './ui-renderable';
import { UiScale } from './ui-scale';
import { UiScreen } from './ui-screen';
import { UiScrollBox } from './ui-scroll-box';
import { UiText } from './ui-text';

export function getGUIGlobals(guiClient: GameUIClient) {
  // 默认屏幕
  let defaultScreen = guiClient.root.children.find(
    (node) => node.id === guiClient.defaultScreenId,
  );

  if (!defaultScreen) {
    defaultScreen = new GameUIScreen({ id: guiClient.defaultScreenId });
  }

  return {
    // gui相关
    ui: defaultScreen.api(),
    UiNode,
    UiRenderable,
    UiComponent,
    UiBox,
    UiText,
    UiInput,
    UiImage,
    UiScale,
    UiScrollBox,

    UiScreen,
    PointerEventBehavior,
    ImageDisplayMode,
    UITextFontFamily,
  };
}

/**
 * 生成创建渲染节点的函数
 */
export function createRenderable(guiClient: GameUIClient) {
  function create(type: 'box'): UiBox;
  function create(type: 'text'): UiText;
  function create(type: 'input'): UiInput;
  function create(type: 'image'): UiImage;
  function create(type: 'scrollBox'): UiScrollBox;
  function create(type: UIElementType): UiRenderable {
    let node: GameUIRenderable;
    let elementData: UIElement['data'];

    const id = nanoid();

    switch (type) {
      case 'text':
        node = new GameUIText({
          id,
          getContext: guiClient.getContext,
          loadTextFontFace: guiClient.loadTextFontFace,
          richTextParser: guiClient.richTextParser,
        });
        elementData = UITextRDA.stateSchema.identity;
        break;
      case 'input':
        node = new GameUIInput({
          id,
          getContext: guiClient.getContext,
          loadTextFontFace: guiClient.loadTextFontFace,
          richTextParser: guiClient.richTextParser,
        });
        elementData = UIInputRDA.stateSchema.identity;
        break;
      case 'image': {
        node = new GameUIImage({
          id,
          getImageData: guiClient.getImageData,
        });
        elementData = UIImageRDA.stateSchema.identity;
        break;
      }
      case 'scrollBox':
        node = new GameUIScrollBox({ id });
        elementData = UIScrollBoxRDA.stateSchema.identity;
        break;
      default: {
        node = new GameUIBox({ id });
        elementData = UIBoxRDA.stateSchema.identity;
        break;
      }
    }

    updateByUIElement(node, { type, data: elementData });

    guiClient.nodeLoader.objectSet?.add(node);

    return node.api();
  }

  return create;
}

/**
 * 生成创建节点的函数
 */
export function createComponent(guiClient: GameUIClient) {
  function create(type: 'scale'): UiScale {
    const component = new GameUIScale();

    guiClient.nodeLoader.objectSet?.add(component);

    return component.api();
  }

  return create;
}

/**
 * 生成创建屏幕的函数
 */
export function createScreen(guiClient: GameUIClient) {
  function create(): UiScreen {
    if (ClientScriptContext.getAllScreen().length > MAX_SCREEN_COUNT) {
      ClientScriptContext.scriptConsole?.warn(
        `screen count exceeds ${MAX_SCREEN_COUNT}`,
      );
    }

    const id = nanoid();
    const screen = new GameUIScreen({
      id,
    });
    const data = UIScreenRDA.stateSchema.identity;

    updateByUIScreen(screen, data);

    guiClient.nodeLoader.objectSet?.add(screen);

    // 新创建的屏幕放在root上
    guiClient.root.addChildAt(screen, 0);

    return screen.api();
  }

  return create;
}

/**
 * 获取所有屏幕的函数
 */
export function getAllScreen(guiClient: GameUIClient) {
  return function () {
    const screens: UiScreen[] = [];
    const rootChildren = guiClient.root.children;
    for (let i = 0; i < rootChildren.length; i++) {
      const gameUINode = rootChildren[i];
      if (isScreen(gameUINode)) {
        screens.push(gameUINode.api());
      }
    }
    return screens;
  };
}
