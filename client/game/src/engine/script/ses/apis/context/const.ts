import type { UiBox } from '../gui/ui-box';
import type { UiText } from '../gui/ui-text';
import type { UiImage } from '../gui/ui-image';
import type { UiInput } from '../gui/ui-input';
import type { UiScale } from '../gui/ui-scale';
import type { ScriptClientConsole } from '../console';
import type { InputManager } from 'src/engine/game-ui/controls/input-manager';
import type { UiScreen } from '../gui/ui-screen';
import type { SoundClient } from 'src/engine/sound/client-sound-controller';
import { UiScrollBox } from '../gui/ui-scroll-box';

export type ClientScriptContextType = {
  inputManager?: InputManager;
  scriptConsole?: ScriptClientConsole;
  soundClient?: SoundClient;
  /**
   * 创建渲染节点的方法
   * 会在运行客户端脚本注入环境变量时生成该方法
   */
  createRenderable: {
    (type: 'box'): UiBox;
    (type: 'text'): UiText;
    (type: 'input'): UiInput;
    (type: 'image'): UiImage;
    (type: 'scrollBox'): UiScrollBox;
  };
  /**
   * 创建组件的方法
   * 会在运行客户端脚本注入环境变量时生成该方法
   */
  createComponent: {
    (type: 'scale'): UiScale;
  };
  createScreen: {
    (): UiScreen;
  };
  getAllScreen: {
    (): UiScreen[];
  };
};

// 提供给客户端脚本运行时的上下文，提供一些内部方法给api使用
export const ClientScriptContext: ClientScriptContextType = {
  scriptConsole: undefined,
  inputManager: undefined,
  soundClient: undefined,
  createRenderable: () => {
    throw new Error('Not implemented');
  },
  createComponent: () => {
    throw new Error('Not implemented');
  },
  createScreen: () => {
    throw new Error('Not implemented');
  },
  getAllScreen: () => {
    throw new Error('Not implemented');
  },
};
