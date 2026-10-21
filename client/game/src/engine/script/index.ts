import { MS_PER_TICK } from '@box/schema/clock/clock-schema';
import {
  RemoteClientEventSchema,
  RemoteClientEventsSchema,
} from '@box/schema/events/remote-channel-event-schema';
import type { ClientConsole } from '@box/script-api';
import { Semaphore } from '@box/utils/semaphore';
import type { Logger } from 'pino';

import { GameUIInputEvents } from 'src/engine/game-ui/controls/input-manager';
import { formatScreenSize } from 'src/engine/script/ses/apis';
import { GameClientState } from '../game-client-schema';
import type { GameUIClient } from '../game-ui';
import type { UIPointerEvent } from '../game-ui/controls/drag';
import { isBlockPassThrough, isPointerEventDisabled } from '../game-ui/util';
import type { InputController } from '../input/input-controller';
import type { SoundClient } from '../sound/client-sound-controller';
import { ScriptClientWorldController } from './controllers/world';
import { ScriptClientRemoteChannel } from './remote';
import { createScriptScheduler } from './scheduler';
import { ClientScriptEventsSchema } from './schema';
import { SesContext } from './ses/ses-client';

export const SERVER_REWIND_TICKS = 4;
export const SERVER_BUFFER_TICKS = 16;
export const SERVER_MAX_NET_BUFFER = SERVER_BUFFER_TICKS + SERVER_REWIND_TICKS;

export class ClientScript {
  /**
   * 执行脚本的上下文
   */
  private scriptContext?: SesContext;
  public logger: Logger;
  public state: GameClientState;
  public clientConsole: ClientConsole;

  private _waitForSync = false;
  private scriptRemoteChannel: ScriptClientRemoteChannel;
  private _pendingEvents = ClientScriptEventsSchema.alloc();

  /**
   * 时钟模块，提供各种计时器给脚本，产生计时器任务，模拟浏览器的微任务
   */
  private scheduler?: ReturnType<typeof createScriptScheduler>;

  /**
   * 是否完成 Poll 阶段，用于给时钟模块做 workaround 区分计时器任务是否需要继续执行
   */
  private _pollDone = false;

  /**
   * GUI 模块，提供相关能力给脚本
   */
  private guiClient: GameUIClient;

  private _syncFinish = new Semaphore(0);

  /**
   * Game的输入控制模块
   */
  private inputController: InputController;
  private worldController: ScriptClientWorldController;

  /**
   * 音频控制器
   */
  private soundClient: SoundClient;

  constructor(spec: {
    logger: Logger;
    state: GameClientState;
    _console: ClientConsole;
    scriptRemoteChannel: ScriptClientRemoteChannel;
    guiClient: GameUIClient;
    inputController: InputController;
    soundClient: SoundClient;
  }) {
    const { logger, state, _console } = spec;
    this.state = state;
    this.clientConsole = _console;
    this.state.clientScript.runSemaphore = new Semaphore(0);
    this.state.clientScript.stopSemaphore = new Semaphore(1);
    this.state.clientScript.isolateStartSemaphore = new Semaphore(0);
    this.state.clientScript.isolateStopSemaphore = new Semaphore(0);

    this.logger = logger;
    this.scriptRemoteChannel = spec.scriptRemoteChannel;
    this.guiClient = spec.guiClient;
    this.inputController = spec.inputController;
    this.soundClient = spec.soundClient;
    this.worldController = new ScriptClientWorldController(state);
  }

  /**
   * 绑定到 GUI 的监听器，负责转发用户输入的 pointerup 到脚本中
   * @param event
   */
  private onPointerUpCallback = (event: UIPointerEvent) => {
    for (let i = 0; i < event.nodes.length; i++) {
      const node = event.nodes[i];
      const uiNode = node.api();

      if (!isPointerEventDisabled(node.pointerEventBehavior)) {
        const uiEvent = { target: uiNode };

        uiNode.events.emit('pointerup', uiEvent);

        this.scriptContext?.getUiEvents()?.emit('pointerup', uiEvent);
      }

      if (isBlockPassThrough(node.pointerEventBehavior)) {
        return;
      }
    }
  };

  /**
   * 绑定到 GUI 的监听器，负责处理输入框的聚焦
   * @param event
   */
  private onInputFocus(event: GameUIInputEvents) {
    const { target } = event;
    const uiNode = target.api();
    uiNode.events.emit('focus', { target: uiNode });
  }

  /**
   * 绑定到 GUI 的监听器，负责处理输入框的失焦
   * @param event
   */
  private onInputBlur(event: GameUIInputEvents) {
    const { target } = event;
    const uiNode = target.api();
    uiNode.events.emit('blur', { target: uiNode });
  }

  /**
   * 绑定到 GUI 的监听器，转发用户输入的 pointerdown 到脚本中
   * @param event
   */
  private onPointerDownCallback = (event: UIPointerEvent) => {
    for (let i = 0; i < event.nodes.length; i++) {
      const node = event.nodes[i];
      const uiNode = node.api();

      if (!isPointerEventDisabled(node.pointerEventBehavior)) {
        const uiEvent = { target: uiNode };

        uiNode.events.emit('pointerdown', uiEvent);

        this.scriptContext?.getUiEvents()?.emit('pointerdown', uiEvent);

        this.scriptContext?.notifyPointerDown(uiEvent);
      }

      if (isBlockPassThrough(node.pointerEventBehavior)) {
        return;
      }
    }
  };

  private onUnhandleRejection = (event: PromiseRejectionEvent) => {
    this.clientConsole.error(event.reason);
  };

  public notifySync() {
    if (this._waitForSync) {
      this._waitForSync = false;
      this._syncFinish.v();
    }
  }

  public async start() {
    const clientJsEntry = 'clientIndex.js';
    try {
      if (this.state.clientScript.runSemaphore.counter > 0) {
        this.logger.warn('cannot start a started client script.');
        return;
      }
      // signal run semaphore
      this.state.clientScript.runSemaphore.v();
      // reset
      await this.state.clientScript.stopSemaphore.p();
      // wait for state to synchronize if we are stuck here
      while (this.state.prevSync) {
        this._waitForSync = true;
        await this._syncFinish.p();
      }
      this.logger.debug('starting client script...');

      // 更新前端脚本内时钟的时间
      this.scheduler = createScriptScheduler((e) => {
        this.clientConsole.error(e);
      });
      this.scheduler.setTime(this.state.clock.tick * MS_PER_TICK);

      // 初始化 GUI
      this.guiClient.dragControls.addListener(
        'pointerDown',
        this.onPointerDownCallback,
      );
      this.guiClient.dragControls.addListener(
        'pointerUp',
        this.onPointerUpCallback,
      );
      this.guiClient.inputManager.addListener('focus', this.onInputFocus);
      this.guiClient.inputManager.addListener('blur', this.onInputBlur);

      this.guiClient.start();

      // 初始化异步错误捕获
      window.addEventListener('unhandledrejection', this.onUnhandleRejection);
      try {
        // 每次运行初始化新的上下文
        this.scriptContext = new SesContext(
          this.logger,
          this.state.clientModules,
        );
        this.scriptContext.evalCode(clientJsEntry, {
          clientConsole: this.clientConsole,
          remoteChannel: this.scriptRemoteChannel,
          guiClient: this.guiClient,
          scheduler: this.scheduler,
          inputController: this.inputController,
          soundClient: this.soundClient,
          worldController: this.worldController,
        });
      } catch (error) {
        // TODO: 异常捕获
        console.error('evalCode throw exception', error);
      }

      this.state.clientScript.isolateStartSemaphore.v();
      // done
      this.logger.debug('starting client script finished');
    } catch (e) {
      this.state.clientScript.runSemaphore.p();
      this.logger.error(e, `starting client script failed.`);
    }
  }

  public async stop() {
    if (this.state.clientScript.stopSemaphore.counter > 0) {
      this.logger.warn('cannot stop a stopped client script.');
      return;
    }
    this.logger.debug('stopping all client scripts...');
    // wait for the run flag to clear
    // clear active script
    this.state.clientScript.runSemaphore.p();
    // await this.quickjs.close();
    this.scriptContext?.reset();

    this.worldController.reset();

    this.scriptRemoteChannel.clear();

    // 清理异步错误捕获
    window.removeEventListener('unhandledrejection', this.onUnhandleRejection);

    // TODO: 清理未执行的events
    // this.gameAPI.clear();

    // 清理未执行的events
    ClientScriptEventsSchema.assign(
      this._pendingEvents,
      ClientScriptEventsSchema.identity,
    );

    // 清理 GUI
    this.guiClient.dragControls.removeListener(
      'pointerDown',
      this.onPointerDownCallback,
    );
    this.guiClient.dragControls.removeListener(
      'pointerUp',
      this.onPointerUpCallback,
    );

    this.guiClient.inputManager.removeListener('focus', this.onInputFocus);
    this.guiClient.inputManager.removeListener('blur', this.onInputBlur);

    this.guiClient.stop();

    // 重置时钟
    this.scheduler = undefined;

    // signal stop is finished
    this.logger.debug('stopping all client scripts finished.');
    this.state.clientScript.stopSemaphore.v();
  }

  public tick() {
    // tick events
    const events = this.state.clientScript.events;
    if (this.state.clientScript.isolateStartSemaphore.counter <= 0) {
      events.remoteChannel.forEach((evt) => {
        this._pendingEvents.remoteChannel.push(
          RemoteClientEventSchema.clone(evt),
        );
      });

      RemoteClientEventsSchema.free(events.remoteChannel);
    } else {
      // notify pending events
      this.notifyScriptEvents(this._pendingEvents);
      this.notifyScriptEvents(events);
    }
  }

  /**
   * 开始 Poll 阶段，在 Tick 前应用来自脚本的变更
   */
  public startPoll() {
    this._pollDone = false;
    this.poll(this.state.clock.tick * MS_PER_TICK);
  }

  /**
   * Poll 的递归函数，根据需要执行的计时器任务，可能会执行多次
   * @param targetTime
   */
  public poll(targetTime: number) {
    if (this._pollDone) {
      this.scheduler?.setTime(targetTime);
    } else {
      if (!this.scheduler?.poll(targetTime)) {
        this._pollDone = true;
      } else {
        while (this.scheduler.poll(targetTime)) {
          continue;
        }
      }

      // 避免在 setTimeout 中安排 setTimeout 造成无限循环
      setTimeout(() => {
        this.poll(targetTime);
      }, 0);
    }
  }

  public notifyScriptEvents(events: typeof ClientScriptEventsSchema.identity) {
    // notify remote channel events
    events.remoteChannel.forEach((e) => {
      try {
        const args = JSON.parse(e.args);
        this.scriptRemoteChannel.receiveClientEvent(args);
      } catch (error) {}
    });

    // clear events
    ClientScriptEventsSchema.assign(events, ClientScriptEventsSchema.identity);
  }

  public onException = (errorMsg: string) => {
    this.clientConsole.error(errorMsg);
  };

  public onResize = (canvasWidth: number, canvasHeight: number) => {
    const context = this.guiClient.getContext();

    if (!context) {
      return;
    }

    this.scriptContext?.notifyResize({
      screenWidth: formatScreenSize(canvasWidth / devicePixelRatio),
      screenHeight: formatScreenSize(canvasHeight / devicePixelRatio),
    });
  };
}
