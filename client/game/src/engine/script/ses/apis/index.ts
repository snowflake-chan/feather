import {
  ClientGlobalThis,
  ClientWorld,
  DeviceType,
  MediaError,
  MediaErrorCode,
} from '@box/script-api';
import { ScriptScheduler } from '@box/utils/script/script-scheduler';
import type { GameUIClient } from 'src/engine/game-ui';
import type { InputController } from 'src/engine/input/input-controller';
import { ClientHttp } from 'src/engine/script/ses/apis/http';
import { ClientMedia } from 'src/engine/script/ses/apis/media';
import { createNavigatorGlobals } from 'src/engine/script/ses/apis/navigator';
import type { SoundClient } from 'src/engine/sound/client-sound-controller';
import { ScriptClientWorldController } from '../../controllers/world';
import { ScriptClientRemoteChannel } from '../../remote';
import { Audio } from './audio';
import { ScriptClientConsole } from './console';
import { initClientScriptContext } from './context';
import { EventEmitter } from './events';
import { getGUIGlobals } from './gui';
import { InputSystem } from './input';
import { Coord2, Vec2, Vec3 } from './math';
import { ClientRemoteChannel } from './remote';
import { ClientScreen } from './screen';
import { messenger } from 'src/messenger';

export * from './math';

export type GetGlobalsSpec = {
  guiClient: GameUIClient;
  scheduler: ScriptScheduler;
  remoteChannel: ScriptClientRemoteChannel;
  scriptClientConsole: ScriptClientConsole;
  inputController: InputController;
  soundClient: SoundClient;
  worldController: ScriptClientWorldController;
};

export function formatScreenSize(size: number) {
  // 保留两位小数,四舍五入
  return Math.round(size * 100) / 100;
}

export function getGlobals(
  spec: GetGlobalsSpec & {
    getGlobalScreenSize: () => {
      width: number;
      height: number;
    };
  },
): ClientGlobalThis {
  let screenWidth = 0;
  let screenHeight = 0;

  const context = spec.guiClient.getContext();
  if (context) {
    screenWidth = formatScreenSize(context.canvas.width / devicePixelRatio);
    screenHeight = formatScreenSize(context.canvas.height / devicePixelRatio);
  }

  initClientScriptContext(spec);

  return {
    console: spec.scriptClientConsole,

    // gui相关
    ...getGUIGlobals(spec.guiClient),

    ...createNavigatorGlobals(spec.getGlobalScreenSize),

    InputSystem: InputSystem,
    input: new InputSystem({ inputController: spec.inputController }),

    ClientScreen,
    screen: new ClientScreen(),

    ClientWorld: ClientWorld,
    /**
     * Client World
     * 存储游戏世界的状态，内容还比较少就直接放这里了
     */
    world: new ClientWorld({
      get() {
        return spec.worldController.getRendering3d();
      },
      set(value) {
        if (typeof value !== 'boolean') {
          spec.scriptClientConsole.warn(
            'Property rendering3d should be boolean but get: ' + value,
          );
        }
        spec.worldController.setRendering3d(Boolean(value));
      },
    }),
    http: new ClientHttp(),

    media: new ClientMedia(),

    FormData,

    ClientRemoteChannel,
    remoteChannel: new ClientRemoteChannel(spec.remoteChannel),

    // 计时器相关
    setInterval: spec.scheduler.scheduler.setInterval,
    clearInterval: spec.scheduler.scheduler.clearInterval,
    setTimeout: spec.scheduler.scheduler.setTimeout,
    clearTimeout: spec.scheduler.scheduler.clearTimeout,
    sleep: function sleep(timeMS: number) {
      const targetTime = spec.scheduler.currentMS() + (+timeMS || 0);
      return new Promise<void>((resolve) => {
        spec.scheduler.scheduleAt(() => {
          resolve();
          return true;
        }, targetTime);
      });
    },

    EventEmitter,

    Coord2,
    Vec3,
    Vec2,

    screenWidth,
    screenHeight,

    // ses 去掉了 Math.random, 从而避免被推测出时间变化。
    // 不过我们本来就要暴露时间，所以可以直接加回来。
    // 安全性问题我们通过审核来避免。
    Math,
    // 同Math
    Date,

    Audio,
    MediaErrorCode,
    MediaError,
    DeviceType,
    call: function call(key: string, value: any, callback?: () => void) {
      if (callback) {
        return messenger.messageTool.webview.emitEvent(
          'fromScript',
          {
            type: key,
            value,
          },
          callback,
        );
      }
      return messenger.emitEvent('fromScript', {
        type: key,
        value,
      });
    },
    callAsync: function callAsync(key: string, value: any) {
      return messenger.callAsync('fromScript', {
        type: key,
        value,
      });
    },
  };
}
