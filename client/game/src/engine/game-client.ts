import { MuClient } from '@box/mudb/client';
import { MuScheduler } from '@box/mudb/scheduler/scheduler';
import type { ClientConsole } from '@box/script-api';

import type { Logger as PinoLogger } from 'pino';
import { loadSettings } from './settings/settings-controller';
import { ContentResolver } from '@box/content-server/content-fetch';
import { CameraBindingMode } from '@box/schema/input/input-schema';
import {
  CloseType,
  GameClientAppState,
  GameClientStateSchema,
} from './game-client-schema';
import {
  destroyVoxelWorker,
  initializeVoxelWorker,
  tickVoxelClient,
  tickVoxelWorker,
} from './voxel/voxel-controller';
import { destroyMesh } from './mesh/renderable-schema';
import { tickCamera } from './camera/camera-controller';
import { tickEnvironment } from './environment/environment-controller';
import { ClientEventSchema } from '@box/schema/events/client-event-schema';
import { NetClient } from './net/net-client-controller';
import { ClockClient, tickClientClock } from './clock/clock-client-controller';
import {
  updateClientGeometry,
  VoxelClient,
  VoxelClientEvents,
} from './voxel/voxel-client';
import { InputController } from './input/input-controller';
import { ClientClockStateSchema } from './clock/clock-client-schema';
import {
  computeNetClientInput,
  forgetClientNetStates,
  getClientNetState,
  getLastAuthoritativeClientNetStateIndex,
  setClientNetInput,
  setPredictedStateFromNetState,
} from './net/net-client-tick';
import {
  tickPlayerIndex,
  tickPlayerInputEvents,
  updatePlayerInput,
} from './player/player-client-controller';
import { EventBus } from '@box/utils/event';
import {
  initializePlayerAnimations,
  tickPlayerAnimations,
} from './player/player-animations';
import { ChatClient } from './chat/chat-client';
import { NetClientInputSchema } from '@box/schema/net/net-schema';
import { tickChatBubbles } from './chat/bubble-controller';
import { tickEffects } from './effect/effect-controller';
import { ModelClient, tickClientModels } from './mesh/client-model-controller';
import { processUI3DEvents } from './ui3d/ui3d-controller';
import { processSeedEvents } from './seed/seeds-model-controller';
import { interpolateClientNetState } from './net/net-client-interpolate';
import { Logger } from '@box/utils/logger';
import { pollExtensions } from './gl/poll-extensions';
import { tickPerf } from './perf/perf-client-controller';
import { initializeElements } from './gl/quad';
import { isIos, isMobile, touchable } from '../utils/mobile';
import { clientConfig, type ClientConfig } from '../config/client';
import { FeatureFlag } from '@box/env/constants';
import {
  setupClientParticles,
  tickClientParticles,
} from './particle/particle-client-controller';
import { SoundClient } from './sound/client-sound-controller';
import { InteractClient } from './interact/interact-client';
import { DialogClient } from './dialog/dialog-client';
import { clearMemoryPool } from './utils/pool';
import { clearBodyLocks } from '@box/schema/physics/physics-solve';
import { LoadingController } from '@box/utils/loading/loading-controller';
import { Semaphore } from '@box/utils/semaphore';
import { TaskTypeEnum } from '@box/utils/loading/loading-schema';
import { HrefClient } from './href/href-client';
import { RTCClient } from './rtc/rtc-client';
import { PhysicsZoneIndex } from '@box/schema/physics/zone-index';
import { tickClientKeyframes } from './keyframes/keyframe-client';
import { GUIClient } from './gui/gui-client';
import { NavigatorClient } from './navigator/navigator-client';
import { MarketClient } from './market/market-client';
import { ClientScriptEventsSchema } from './script/schema';
import { TeleportClient } from './teleport/teleport-client';
import { GameUIClient } from './game-ui';
import { messenger } from 'src/messenger';
import { ResourceController } from './resource';
import { RemoteChannelClient } from './remote-channel/channel-client';

import type { ClientScript } from './script';
import { PlayerClient } from './player/player-client';
import { ScriptClientRemoteChannel } from './script/remote';
import { gpuMain } from './gpu/main';
import { initializeIndexBuffer } from './gpu/quad';
import { resizeRenderTarget } from './gpu/render-target';
import { initOverlay } from './overlay/main';
import { tickEntityName } from './overlay/entity-name';
import { MobileGamepad } from './gamepad';
import { Cancellable } from 'regl/regl';
import { GameMouseEvent } from './input/events';
import { GameDialog } from './game-dialog';
import type { GLMainReturnValue, CreateGameREGL } from './gl/main';
import { getCanvas2DContext } from './utils/device';
import { EngineProfiler } from './profile/profiler';
import { ImportClientScript } from './defer-imports';
import { drawProfiler } from './overlay/profiler';
import { tickRenderBox } from './render-box/controller';
import { getReWGPU } from './gpu/gpu-cache';

// if no frames render in 1s, then consider game to be idling
const MIN_IDLE_TIME = 1000;

// wait time before firing a second poll event
const IOS_RESIZE_DEBOUNCE = 500;

const FULLSCREEN_STYLE = {
  border: 0,
  margin: 0,
  padding: 0,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  position: 'absolute',
  overflow: 'auto',
};

const CANVAS_STYLE = {
  'border': 0,
  'margin': 0,
  'padding': 0,
  'top': 0,
  'left': 0,
  'width': '100%',
  'height': '100%',
  'min-height': '100%',
  'position': 'absolute',
  'overflow': 'auto',
};

export class GameClient {
  // mudb instance
  public client: MuClient;
  public scheduler: MuScheduler;

  private destroyed = false;

  // game state
  public state = GameClientStateSchema.clone(GameClientStateSchema.identity);

  // input handler
  public input: InputController;

  // loading handler
  public loading: LoadingController;

  // network protocols
  public model: ModelClient;
  public net: NetClient;
  public clock: ClockClient;
  public sound: SoundClient;
  public voxel: VoxelClient;
  public chat: ChatClient;
  public player: PlayerClient;
  public interact: InteractClient;
  public dialog: DialogClient;
  public href: HrefClient;
  public rtc: RTCClient;
  public navigator: NavigatorClient;
  public gui: GUIClient;
  public market: MarketClient;
  public teleport: TeleportClient;
  public remoteChannel: RemoteChannelClient;
  public clientScript?: ClientScript;

  // webgl rendering hooks
  public gl?: GLMainReturnValue;

  // webGpu rendering hooks
  public gpu?: ReturnType<typeof gpuMain>;

  private isRendererReady?: Promise<void>;
  /**
   * 当renderer连接成功时，执行回调。
   */
  public rendererReady(onReady: () => void) {
    if (!this.isRendererReady) {
      return;
    }
    this.isRendererReady.then(onReady);
  }

  private overlay?: ReturnType<typeof initOverlay>;

  public gamepad?: MobileGamepad;

  // user defined call backs
  public onReady = new EventBus<void>();
  public onPoll = new EventBus<void>();
  public onTick = new EventBus<void>();
  public onFrame = new EventBus<void>();
  public onClose = new EventBus<CloseType>();

  private _offLostReglCb: Cancellable = { cancel: () => {} };
  private _offRestoreReglCb: Cancellable = { cancel: () => {} };

  // preconnect semaphore
  public preconnectBarrier = new Semaphore(0);

  // idle state info
  private _frameHandle: number = 0;

  /**
   * gameUI模块
   */
  public gameUI: GameUIClient;

  /**
   * game dialog模块
   */
  public gameDialog: GameDialog;

  /**
   * 管理资源缓存的模块，目前gameUI和gamepad使用
   */
  public resourceController: ResourceController;

  protected logger: PinoLogger;
  public profiler: EngineProfiler;
  public showFps = !!(
    process.env.RUSTY && process.env.NODE_ENV === 'development'
  );

  /**
   * 是否把事件传递到3D层
   */
  private event3DPropagation = true;

  private _pollViewport = () => {
    const element = this.state.dom.element;
    if (element && !this.state.gl.contextLost) {
      let width = window.innerWidth;
      let height = window.innerHeight;
      if (!this.state.dom.autoCreateElement) {
        width = element.clientWidth;
        height = element.clientHeight;
      } else {
        this.state.dom.joystickBottomGap = 0;
        if (this.state.dom.isIOS) {
          if (width < height) {
            const docHeight = document.documentElement.clientHeight;
            if (docHeight < window.innerHeight) {
              height = window.outerHeight;
            }
          } else {
            // HACK: ios landscape mode viewport is sometimes a bit too large, need to shift joystick up a bit
            // this amount is just a rough guess at the shift, its probably off
            const outerHeight = window.outerHeight;
            if (outerHeight > height) {
              this.state.dom.joystickBottomGap = outerHeight - height + 20;
            }
          }
        }
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
      }

      // this.state.logger.log(`${width}x${height} gap=${this.state.dom.joystickBottomGap} inner:${window.innerWidth}x${window.innerHeight} outer:${window.outerWidth}x${window.outerHeight} scroll:${document.documentElement.scrollTop}, ${this.state.dom.element?.scrollHeight}`);

      if (width === this.state.dom.width && height === this.state.dom.height) {
        return;
      }

      this.state.dom.width = width;
      this.state.dom.height = height;

      const canvasGL = this.state.dom.canvas;
      if (canvasGL) {
        const pixelRatioGL = this.state.settings.resolutionScale;
        canvasGL.width = Math.ceil(width * pixelRatioGL);
        canvasGL.height = Math.ceil(height * pixelRatioGL);

        this.restrainCanvasSize();
      }

      const canvas2D = this.state.dom.canvas2D;
      if (canvas2D) {
        const pixelRatio2D = window.devicePixelRatio || 1;
        canvas2D.width = Math.ceil(width * pixelRatio2D);
        canvas2D.height = Math.ceil(height * pixelRatio2D);

        this.state.replica.running &&
          this.clientScript?.onResize(canvas2D.width, canvas2D.height);
      }

      // another dumb ios bug: clock desyncs when we resize...
      if (this.state.dom.isIOS) {
        this.clock && this.clock.reset();
      }
    }
  };

  private _pollViewport_IOSHack = () => {
    if (typeof document === 'undefined') {
      return;
    }

    // need to poll ios because the bottom toolbar vanishes a few moments *after* orientation change without firing resize
    this._pollViewport();
    if (this.state.dom.isIOS) {
      setTimeout(() => {
        this._pollViewport();
      }, IOS_RESIZE_DEBOUNCE);
    }
  };

  private _firstFrame() {
    if (
      typeof window === 'undefined' ||
      typeof window.scrollTo === 'undefined'
    ) {
      return;
    }
    window.scrollTo(0, 0);
    this._pollViewport_IOSHack();
  }

  // High priority events, fired regardless whether we are updating
  private _pollEvent = (ev: { timeStamp: number }) => {
    this._poll(ev.timeStamp || this.scheduler.now());
  };
  private _poll = (timeStamp: number) => {
    if (this.state.appState === GameClientAppState.DISCONNECT) {
      return;
    }

    // update clock
    this.clock.poll(timeStamp);

    const element = this.state.dom.element;
    if (element) {
      // Check if hidden
      const hiddenCSS = this.state.dom.hiddenCSS;
      if (hiddenCSS && typeof document !== 'undefined') {
        this.state.dom.visible = !document[hiddenCSS];
      }

      // poll user input
      this.input.poll();
    }

    // check ready state for game
    if (!this.state.loadFinished) {
      this.state.idle = true;

      // 音频不可用，或者音频首次加载结束，都视作音频初始化结束
      const soundInitFinished =
        !this.state.sound.supported || this.state.sound.firstLoaded;

      this.state.loadFinished =
        this.state.clock.ready &&
        this.state.voxelState.ready &&
        soundInitFinished &&
        !!this.state.secret.id;
      if (this.state.loadFinished) {
        this.loading.endTask('loadFinished', TaskTypeEnum.Normal);
        this.state.logger.trace(
          'load finished ' +
            (
              (Date.now() - this.state.enginePreconnectTimeStamp) /
              1000
            ).toFixed(2),
        );

        // clear loading controller refs, avoids useless logging
        this.state.loadEvents.appLoaded = true;
        this.state.content.loadingController = null;
      }
    }

    // check if the game needs to transition into idle mode
    if (this.state.loadFinished) {
      const prevIdle = this.state.idle;
      this.state.idle =
        this.state.appState !== GameClientAppState.CONNECTED ||
        this.state.headless
          ? false
          : !(
              this.state.dom.visible ||
              this.state.clock.clock < this.state.lastFrameClock + MIN_IDLE_TIME
            );
      if (prevIdle !== this.state.idle) {
        this.net.setPause(this.state.idle);
      }

      if (!this.state.ready) {
        const ready = this.state.net.states.length > 0;
        this.state.net.netSkip = true;
        if (ready) {
          this.loading.endTask('physicsSynchronized', TaskTypeEnum.Normal);
          this.state.logger.trace(
            'physics ready ' +
              (
                (Date.now() - this.state.enginePreconnectTimeStamp) /
                1000
              ).toFixed(2),
          );
          this.state.ready = true;
          if (this.state.replica.running) {
            this.clientScript?.start().then(() => {
              const notifyReadyGameClient = () => {
                this.onReady.notify();
                this.onFrame.unsub(notifyReadyGameClient);
              };
              this.onFrame.sub(notifyReadyGameClient);
            });
          } else {
            this.onReady.notify();
          }
        }
      }
    }

    // poll sound
    this.sound.poll(this.profiler);

    // 更新前端脚本带来的变动
    this.clientScript?.startPoll();

    // call user poll functions
    this.onPoll.notify();
  };

  // called to update game state.  once per frame unless game is idling
  private _tick = () => {
    // update collision mesh
    updateClientGeometry(this.state);

    const prevClock = ClientClockStateSchema.clone(this.state.clock);
    const nextClock = tickClientClock(prevClock);
    this.state.clock = ClientClockStateSchema.assign(
      this.state.clock,
      nextClock,
    );

    if (
      this.state.ready &&
      this.state.voxelState.ready &&
      !(this.state.idle || this.state.secret.netPaused) &&
      this.state.net.states.length > 0
    ) {
      const id = this.state.secret.id;

      if (this.state.firstFrame) {
        this.loading.endTask('firstFrame', TaskTypeEnum.Normal);
        this.state.logger.trace(
          'first frame ' +
            ((Date.now() - this.state.engineStartTimestamp) / 1000).toFixed(2),
        );
        this._firstFrame();
      }
      this.state.firstFrame = false;

      if (this.state.net.netSkip) {
        // for net frame skip need to set state to an authoritative snap shot
        this.state.net.frameNetTicks = Infinity;
        const skipIndex = getLastAuthoritativeClientNetStateIndex(
          this.state.net,
          Infinity,
        );
        if (skipIndex >= 0) {
          const tick = this.state.net.oldestTick + skipIndex;
          this.clock.timeWarp(tick);
          setPredictedStateFromNetState(
            this.state,
            this.state.net.states[skipIndex],
          );
          forgetClientNetStates(this.state);
          this.state.net.netSkip = false;
        } else {
          this.clock.reset();
        }
        this.state.particles.resetNeeded = true;
      } else if (nextClock.frameskip) {
        // handle clock frameskip case
        const nTick = Math.floor(nextClock.tick);
        this.state.net.frameNetTicks = Infinity;
        const target = getClientNetState(this.state, nTick);
        if (target) {
          setPredictedStateFromNetState(this.state, target);
          forgetClientNetStates(this.state);
        }
      } else {
        // reset net tick count
        this.state.net.frameNetTicks = Math.max(
          this.state.settings.frameNetTicks,
          Math.ceil(
            (0.25 + nextClock.deltaTick) *
              (nextClock.tick - nextClock.serverTick),
          ),
        );

        // update player inputs
        updatePlayerInput(this.state);

        // 发送键盘事件
        this.net.sendKeyBoardEvent();

        const tickSteps = Math.ceil(nextClock.deltaTick);
        let _prevTick = prevClock.tick;
        this.state.clock.deltaTick = nextClock.deltaTick / tickSteps;
        const finalTick = Math.floor(nextClock.tick);
        for (let i = 0; i < tickSteps; ++i) {
          const startTick = _prevTick;
          const endTick = prevClock.tick + (i + 1) * this.state.clock.deltaTick;
          _prevTick = endTick;

          // run tick from start to end
          if (this.state.voxelState.voxelCollisionReady) {
            interpolateClientNetState(
              this.state.secret.id,
              this.state.physics,
              this.state.filter,
              this.state.zoneSelectors,
              this.state.physicsZones,
              this.state.bodies,
              this.state.net.errors,
              this.state.players,
              this.state.playerInputs,
              this.state.contact,
              this.state.blockIndex,
              this.state.collision,
              this.state.zoneIndex,
              this.state,
              startTick,
              endTick,
            );
          }

          // if we pass one of the tick counters, need to generate an input packet
          const pTick = Math.floor(startTick);
          const nTick = Math.floor(endTick);

          if (id && nTick !== pTick && nTick === finalTick) {
            // compute player input
            // 这里是客户端用户输入更新的计算
            const input = computeNetClientInput(
              this.state,
              this.state.playerInputs,
              this.state.bodies,
            );

            // clear all local locks
            clearBodyLocks(this.state.bodies);

            // record input packet into net state
            // 这里把计算用户输入的结果放到client state中
            setClientNetInput(this.state.net, nTick, id, input);

            // send input to server
            // 客户端数据发送到server
            this.net.input(input, nTick);

            // release input object
            NetClientInputSchema.free(input);
          }
        }

        // Update state
        this.state.clock.tick = nextClock.tick;
        this.state.clock.deltaTick = nextClock.deltaTick;
      }

      // update everything else
      tickRenderBox(this.state);
      tickVoxelClient(this.state, this.voxel);
      tickClientKeyframes(this.state);
      tickPlayerIndex(this.state);
      tickCamera(this.state);
      tickEnvironment(this.state);
      tickPlayerAnimations(this.state);
      this.interact.tick();
      tickEntityName(this.state);
      tickChatBubbles(this.state);
      tickClientParticles(this.state);
      tickPlayerInputEvents(this.state);
      tickEffects(this.state);
      tickClientModels(this.state);
      if (process.env.NODE_ENV === 'development') {
        tickPerf(this.state, this.client);
      }
    }
    this.clientScript?.tick();

    if (this.state.ready) {
      // call user ticks events
      this.onTick.notify();
    }

    // process events
    let propagation = this.event3DPropagation;
    propagation = propagation && processUI3DEvents(this.state);
    propagation && processSeedEvents(this.state);

    // update voxel worker
    tickVoxelWorker(this.state);

    // release buffered network states
    forgetClientNetStates(this.state);

    // Clear all events
    ClientEventSchema.assign(this.state.events, ClientEventSchema.identity);
    ClientScriptEventsSchema.assign(
      this.state.clientScript.events,
      ClientScriptEventsSchema.identity,
    );

    // release clock
    ClientClockStateSchema.free(nextClock);
    ClientClockStateSchema.free(prevClock);

    // cycle running flag
    this.state.prevRunning = this.state.replica.running;
    if (this.state.prevSync && !this.state.replica.sync) {
      this.clientScript?.notifySync();
    }
    this.state.prevSync = this.state.replica.sync;
  };

  // called by request animation frame
  private _frame = (timeStamp: number) => {
    // schedule next frame call
    this._frameHandle = requestAnimationFrame(this._frame);

    // poll for any high priority changes
    this._poll(timeStamp || this.scheduler.now());

    // store frame clock
    this.state.lastFrameClock = this.state.clock.clock;
    this.state.frameCount++;

    // tick game state and update all animations
    this._tick();

    // render everything
    if (this.state.appState === GameClientAppState.CONNECTED) {
      const regl = this.state.gl.regl;

      if (this.state.gpu.rewgpu && this.gpu) {
        if (this.state.rendering3d) {
          this.gpu.draw(this.state, this.profiler);
        }

        this.overlay?.draw(this.state);

        this.onFrame.notify();
      } else if (!this.state.gl.contextLost && this.gl && regl) {
        regl.poll();
        if (this.state.rendering3d) {
          this.gl.draw(this.state, this.profiler);
        }

        this.overlay?.draw(this.state);

        this.onFrame.notify();
        regl._gl.flush();
      }
      if (this.showFps) {
        drawProfiler(this.state, this.profiler);
        this.profiler.profileFps(this.state.clock.deltaClock);
      }
    }
  };

  // idle is called from requestIdleCallback and also triggered by network state updates
  private idle = () => {
    const timeStamp = this.scheduler.now();
    if (
      this.state.idle ||
      timeStamp > this.state.clock.lastTimeStamp + MIN_IDLE_TIME
    ) {
      this._poll(this.scheduler.now());
      if (this.state.idle) {
        this._tick();
      }
    }
  };

  // 在跳转时会调用两次：1，setGame调用；2，socket断开调用
  // Clean up all resources
  public destroy() {
    if (this.destroyed) {
      return;
    }

    this.state.content.destroy();
    this.voxel.destroy();
    // cancel idle and frame callbacks
    if (!this.state.headless) {
      cancelAnimationFrame(this._frameHandle);
    }

    // destroy connection
    if (this.client.running) {
      this.client.destroy();
    }
    // clear client script
    this.clientScript?.stop();

    // TODO clean up all resources

    destroyVoxelWorker(this.state);
    this.state.particles.worker?.terminate();
    destroyMesh(this.state);

    // TODO: remove all input handlers and other event listeners
    this.input.destroy();

    // clear sound
    this.sound.destroy();

    // clean up webgl resources
    if (this.state.gl.regl) {
      this.state.gl.regl.destroy();
      this.state.gl.regl = null;

      this._offRestoreReglCb.cancel();
      this._offLostReglCb.cancel();
    }

    // clean up webgpu resources
    if (this.state.gpu.rewgpu) {
      this.gpu?.clear(this.state);
      this.state.gpu.rewgpu.clear();

      this.gpu = undefined;
      this.state.gpu.rewgpu = null;
    }

    // clean pendingProbes
    this.state.light.pendingProbes.length = 0;

    // remove visibility change handlers
    const visibilityChange = this.state.dom.visibilityChangeCSS;
    if (visibilityChange) {
      document.removeEventListener(visibilityChange, this._pollEvent);
    }

    // destroy all dom elements
    const element = this.state.dom.element;
    if (element) {
      const canvas = this.state.dom.canvas;
      if (canvas) {
        if (element.contains(canvas)) {
          element.removeChild(canvas);
        }
        this.state.dom.canvas = canvas;
      }
      const canvas2d = this.state.dom.canvas2D;
      if (canvas2d) {
        element.removeChild(canvas2d);
        this.state.dom.canvas2D = canvas2d;
      }
      // to prevent play mode react element deleted together with `element`
      const playReactContainer = document.getElementById('react-container');
      if (playReactContainer) {
        document.body.appendChild(playReactContainer);
      }
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }

    // remove resize listener
    if (!this.state.headless) {
      window.removeEventListener('resize', this._pollViewport_IOSHack);
      window.removeEventListener(
        'orientationchange',
        this._pollViewport_IOSHack,
      );
      const vv: any = (<any>window).visualViewport;
      // 这里为什么会addEventListener?
      // 用ios测过了，即使注释掉下面几行，断线重连页面是正常的
      // if (vv) {
      //   vv.addEventListener('resize', this._pollViewport_IOSHack);
      // }

      this.removeListeners();
    }

    // unsub all events
    this.onClose.unsubAll();
    this.onFrame.unsubAll();
    this.onPoll.unsubAll();
    this.onReady.unsubAll();

    GameClientStateSchema.free(this.state);
    this.destroyed = true;
  }

  constructor(spec: {
    client: MuClient;
    content: ContentResolver;
    logger: Logger;
    pinoLogger: PinoLogger;
    scheduler: MuScheduler;
    clientConfig: ClientConfig;
    loadingController: LoadingController;
    console: ClientConsole;
    autoCreateElement: boolean;
    connectGame: (hash: string, serverId?: string) => void;
    getGamepadHash?: (group: string, part: string) => string;
  }) {
    this.client = spec.client;
    this.scheduler = spec.scheduler;

    this.logger = spec.pinoLogger;
    this.state.logger = spec.logger.create('engine');
    this.state.content = spec.content;
    this.state.config = spec.clientConfig;
    this.state.loadEvents = spec.loadingController;
    this.state.zoneIndex = new PhysicsZoneIndex();
    this.state.joinAsCollaborator = true;
    this.state.dom.autoCreateElement = spec.autoCreateElement;

    this.loading = spec.loadingController;
    // Load settings
    loadSettings(this.state.settings);

    this.loading.startTask('startEngine', TaskTypeEnum.Normal, 7);

    // Set up submodules
    this.profiler = new EngineProfiler(this.state);

    // Set up protocols
    this.model = new ModelClient({
      client: this.client,
      state: this.state,
    });
    this.net = new NetClient({
      client: this.client,
      state: this.state,
      idle: this.idle,
    });
    this.clock = new ClockClient({
      client: this.client,
      state: this.state,
      scheduler: this.scheduler,
    });
    this.input = new InputController(this.client, this.state, this.clock);
    this.sound = new SoundClient({
      client: this.client,
      state: this.state,
    });
    this.voxel = new VoxelClient({
      client: this.client,
      state: this.state,
      scheduler: this.scheduler,
    });
    this.chat = new ChatClient({
      client: this.client,
      state: this.state,
    });
    this.player = new PlayerClient({
      client: this.client,
      state: this.state,
    });
    this.interact = new InteractClient({
      client: this.client,
      state: this.state,
      input: this.input,
    });
    this.dialog = new DialogClient({
      client: this.client,
      state: this.state,
    });
    this.navigator = new NavigatorClient({
      client: this.client,
      state: this.state,
    });
    this.href = new HrefClient({
      client: this.client,
      state: this.state,
    });
    this.rtc = new RTCClient({
      client: this.client,
    });
    this.gui = new GUIClient({
      client: this.client,
      state: this.state,
      input: this.input,
    });
    this.market = new MarketClient({
      client: this.client,
      state: this.state,
      inputController: this.input,
    });
    this.teleport = new TeleportClient({
      client: this.client,
      state: this.state,
      connectGame: spec.connectGame,
    });
    this.remoteChannel = new RemoteChannelClient({
      client: this.client,
      state: this.state,
    });

    this.state.gui.stage = this.gui.stage;

    // 按顺序添加事件监听
    this.resourceController = new ResourceController({
      resources: this.state.resources,
      contentResolver: this.state.content,
    });
    this.state.resourceController = this.resourceController;

    this.gameUI = new GameUIClient({
      state: this.state,
      client: this.client,
      resourceController: this.resourceController,
      inputController: this.input,
    });

    this.gameDialog = new GameDialog({
      state: this.state,
      input: this.input,
      dialogClient: this.dialog,
    });

    if (touchable) {
      this.gamepad = new MobileGamepad({
        state: this.state,
        input: this.input,
        resourceController: this.resourceController,
        setEvent3DPropagation: this.setEvent3DPropagation,
        getGamepadHash: spec.getGamepadHash,
      });
    }

    this.input.addIntersectElements(this.gameDialog.intersectElements);

    if (this.gamepad) {
      this.input.addIntersectElements(this.gamepad.intersectElements);
    }

    this.input.addIntersectElements(this.gameUI.dragControls.intersectElements);
    this.input.addIntersectElements(this.gui.intersectElements);

    ImportClientScript.then((ClientScript) => {
      this.clientScript = new ClientScript({
        logger: spec.pinoLogger.child({ caller: 'client-script' }),
        state: this.state,
        _console: spec.console,
        scriptRemoteChannel: new ScriptClientRemoteChannel(this.remoteChannel),
        guiClient: this.gameUI,
        inputController: this.input,
        soundClient: this.sound,
      });
    });

    const headless = (this.state.headless = spec.clientConfig.headless);
    if (!headless) {
      const hasDocument = typeof document !== 'undefined';

      // set ios hacks flag
      this.state.dom.isIOS = isIos();

      try {
        if (hasDocument) {
          this.addVisibilityChangeListener();

          this.isRendererReady = this.initWebRenderer();
        } else {
          this.isRendererReady = this.initRustyReWGPU();
        }

        this.addResizeListeners();

        this.voxel.once(VoxelClientEvents.Ready, () => {
          this._frameHandle = requestAnimationFrame(this._frame);
        });

        const { context: context2D } = this.initCanvas2D();

        if (!context2D) {
          throw new Error('canvas2d unsupported');
        }

        /**
         * document不存在时（rusty_box），只需绑定输入控制
         */
        if (!hasDocument) {
          // Hook input handlers
          this.input.setHandlers();
        } else if (this.state.dom.autoCreateElement) {
          /**
           * - edit模式
           *   - 非Rusty，autoCreateElement为false，外部会自行创建dom.element，通过appendCanvasDOM来更新状态
           *   - Rusty，autoCreateElement为true，走和play一样的流程
           * - play模式下，会自动创建dom.element
           */
          this.createDomElement();
        }

        this.overlay = initOverlay({
          context2D,
          state: this.state,
          gui: this.gui,
          gameUI: this.gameUI,
          gamepad: this.gamepad,
          gameDialog: this.gameDialog,
        });

        // load player animations
        initializePlayerAnimations(this.state)
          .then(() =>
            this.loading.endTask('downloadAnimations', TaskTypeEnum.Normal),
          )
          .catch(() => {});

        // poll for resize
        this._pollViewport_IOSHack();
      } catch (e) {
        this.state.serverError = CloseType.Webgl;
        return;
      }

      this.addListeners();
    }

    this.state.appState = GameClientAppState.CONNECTING;
  }

  private async initRegl(
    canvas: HTMLCanvasElement,
    createGameREGL: CreateGameREGL,
  ) {
    /**
     * Create both regl container and regl loader,
     * and load main webgl render procedure.
     */
    const { regl, reglLoader, glMainReturnValue } = createGameREGL(canvas);

    this.state.gl.regl = regl;
    this.state.gl.reglLoader = reglLoader;
    this.gl = glMainReturnValue;

    // update webgl shader stuff
    pollExtensions(this.state);

    if (!clientConfig.isLocalGameServer) {
      // collect performance stats and log
      const perfStats: any = {
        page: {
          width: screen.width,
          height: screen.height,
          language: navigator.language,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        },
        memory: navigator['deviceMemory'],
        settings: this.state.settings,
        webgl: regl.limits,
      };
      if (performance) {
        perfStats.timing = performance.timing.toJSON();
      }
      this.logger.info('user connect stats: %o', perfStats);
    }

    // initialize element buffers
    initializeElements(this.state);
    const extLose = regl._gl.getExtension('WEBGL_lose_context');
    if (extLose) {
      (<any>window).LOSE_CONTEXT = () => {
        extLose.loseContext();
      };
      (<any>window).RESTORE_CONTEXT = () => {
        extLose.restoreContext();
      };
    }

    this._offRestoreReglCb = regl.on('restore', () => {
      this.state.gl.contextLost = false;
      if (this.gl) {
        pollExtensions(this.state);
        this.gl.restore(this.state);
      }
      this._pollViewport_IOSHack();
    });
    this._offLostReglCb = regl.on('lost', () => {
      this.state.gl.contextLost = true;
      if (this.gl) {
        this.gl.lost(this.state);
      }
    });

    this.state.gl.floatBufferType = reglLoader.floatBuffer.type;
    this.state.gl.floatBufferFilter = reglLoader.floatBuffer.filter;
    reglLoader.preloadShaders(this.state);

    // Start voxel worker
    initializeVoxelWorker(this.state, this.logger);

    if (this.gl) {
      this.gl.init(this.state);
    }

    // set up particles
    setupClientParticles(this.state);
  }

  private initReWGPU(width: number, height: number) {
    // initialize render target
    resizeRenderTarget(this.state, width, height);

    // initialize index buffers
    initializeIndexBuffer(this.state);

    // Start voxel worker
    initializeVoxelWorker(this.state, this.logger);

    // Load main webgpu render procedure
    this.gpu?.init(this.state);

    // set up particles
    setupClientParticles(this.state);
  }

  public appendCanvasDom(element: HTMLDivElement) {
    const { dom } = this.state;
    const { canvas, canvas2D } = this.state.dom;

    dom.element = element;

    if (canvas) {
      element.appendChild(canvas);
    }

    if (canvas2D) {
      element.appendChild(canvas2D);
    }

    this._pollViewport_IOSHack();

    // Hook input handlers
    this.input.setHandlers();
  }

  public resize() {
    this._pollViewport_IOSHack();
  }

  public onResolutionScaleUpdate() {
    const element = this.state.dom.element;
    if (element && !this.state.gl.contextLost) {
      let width = window.innerWidth;
      let height = window.innerHeight;
      if (!this.state.dom.autoCreateElement) {
        width = element.clientWidth;
        height = element.clientHeight;
      }
      const canvasGL = this.state.dom.canvas;
      if (canvasGL) {
        const pixelRatioGL = this.state.settings.resolutionScale;
        canvasGL.width = Math.ceil(width * pixelRatioGL);
        canvasGL.height = Math.ceil(height * pixelRatioGL);

        this.restrainCanvasSize();
      }
    }
  }

  // webGPU需要自己管理最大宽高限制
  private restrainCanvasSize() {
    const canvasGL = this.state.dom.canvas;

    // webGPU需要自己管理最大宽高限制
    if (canvasGL && this.state.gpu.rewgpu) {
      const { maxTextureDimension2D } =
        this.state.gpu.rewgpu.config.device.limits;
      canvasGL.width = Math.max(
        1,
        Math.min(canvasGL.width, maxTextureDimension2D),
      );

      canvasGL.height = Math.max(
        1,
        Math.min(canvasGL.height, maxTextureDimension2D),
      );
      resizeRenderTarget(this.state, canvasGL.width, canvasGL.height);
    }
  }

  public preconnect() {
    if (this.state.appState !== GameClientAppState.CONNECTING) {
      this.state.logger.error(
        'preconnect called from invalid state ' +
          GameClientAppState[this.state.appState],
      );
    }

    this.state.enginePreconnectTimeStamp = Date.now();
    this.loading.endTask('startPreconnect', TaskTypeEnum.Normal);
    this.client.start({
      ready: () => {
        this.state.appState = GameClientAppState.PRECONNECTED;
        this.idle();
        this.loading.endTask('preconnected', TaskTypeEnum.Normal);
        // notify preconnect barrier
        Promise.resolve()
          .then(() => this.preconnectBarrier.v(Infinity))
          .catch(() => this.state.logger.error('error starting'));
      },
      close: () => {
        console.log('connection closed', this.state.serverError);
        this.state.logger.info(`connection closed`);
        this.state.appState = GameClientAppState.DISCONNECT;
        this.state.logger.info(`server error ${this.state.serverError}`);
        if (this.state.serverError !== CloseType.Normal) {
          this.onClose.notify(this.state.serverError);
          this.destroy();
          return;
        }
        console.log('exceedUserLimit:', this.state.exceedUserLimit);
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          this.state.serverError = CloseType.Network;
        } else if (this.state.exceedUserLimit) {
          this.state.serverError = CloseType.Max;
        } else {
          this.state.serverError = CloseType.Server;
        }

        this.onClose.notify(this.state.serverError);
        this.destroy();
      },
    });
  }

  // must be called from a click event
  public start() {
    this.preconnectBarrier
      .p(1)
      .then(() => {
        if (this.state.serverError || this.state.exceedUserLimit) {
          if (this.client.running) {
            this.client.destroy();
          }
          return;
        }
        if (this.state.appState !== GameClientAppState.PRECONNECTED) {
          return;
        }
        this.state.engineStartTimestamp = Date.now();
        this.state.appState = GameClientAppState.CONNECTED;

        this.loading.endTask('joinGame', TaskTypeEnum.Normal);
        this.net.join();
        this.state.logger.trace(
          `engine started ${(
            (this.state.engineStartTimestamp -
              this.state.enginePreconnectTimeStamp) /
            1000
          ).toFixed(2)}`,
        );

        // clear memory after load done
        setTimeout(() => {
          clearMemoryPool();
        }, 500);
      })
      .catch((err) => {
        this.state.logger.error(err);
      });
  }

  public checkUserPermission(isInviteLinkExpired: boolean) {
    if (isInviteLinkExpired) {
      return CloseType.LinkExpired;
    }
    return CloseType.Normal;
  }

  // 设置是否执行3d层的事件（ui3d、seed）
  public setEvent3DPropagation = (propagation: boolean) => {
    this.event3DPropagation = propagation;
  };

  private addListeners() {
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', this.onKeyDown);
      document.addEventListener('keyup', this.onKeyUp);
    }

    this.input.unlockedClick.sub(this.onPointerClicked);
  }

  private removeListeners() {
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.onKeyDown);
      document.removeEventListener('keyup', this.onKeyUp);
    }

    this.input.unlockedClick.unsub(this.onPointerClicked);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (this.state.input.keyPauseCount > 0) {
      return;
    }

    messenger.exposeKeysEventToParent('keydown', e);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (this.state.input.keyPauseCount > 0) {
      return;
    }

    messenger.exposeKeysEventToParent('keyup', e);
  };

  private onPointerClicked = (ev: GameMouseEvent) => {
    if (ev.targets.length) {
      return;
    }
    const { dom, input } = this.state;
    const { element } = dom;
    const { pointerLockPauseCount, cameraBindingMode } = input;

    if (
      !element ||
      pointerLockPauseCount > 0 ||
      cameraBindingMode !== CameraBindingMode.leftKey
    ) {
      return;
    }

    // Keep all pointer-lock requests in InputController so browser cooldowns
    // and rejected promises are handled consistently.
    this.input.requestPointerLock();
  };

  /**
   * 根据配置决定使用rewgpu还是regl，rewgpu不可用时，退回到regl
   */
  private async initRenderer(canvas: HTMLCanvasElement) {
    let toUseWebGPU = false;

    if (!process.env.RUSTY) {
      if (clientConfig.FEATURE_FLAGS) {
        // play和edit对应的featureFlag不同
        const gpuFlag =
          clientConfig.mode === 'edit'
            ? FeatureFlag.WebGPUEdit
            : FeatureFlag.WebGPU;

        toUseWebGPU = clientConfig.FEATURE_FLAGS.includes(gpuFlag);
      }
    } else {
      // rusty打包不会引入webgl相关代码和文件，所以如果有rusty标识，直接强制使用webGPU
      toUseWebGPU = true;
    }

    if (toUseWebGPU) {
      this.logger.info('Init renderer with WebGPU');

      try {
        const { rewgpu, gpu, config } = await getReWGPU(canvas);

        // 在web中，如果调用initRenderer，canvas一定是换了一个崭新的了
        // 如果是缓存的rewgpu，需要重新绑定canvas相关数据
        rewgpu.canvas = canvas;
        rewgpu.context = canvas.getContext('webgpu')!;
        rewgpu.context.configure({
          ...config,
          device: rewgpu.config.device,
          format: rewgpu.config.presentationFormat,
        });

        this.state.gpu.rewgpu = rewgpu;

        this.gpu = gpu;

        this.initReWGPU(canvas.width, canvas.height);
      } catch (err) {
        this.logger.error(`Failed to init WebGPU, error msg: ${err}`);
      }
    }

    // initReWGPU创建成功，this.state.gpu.rewgpu不为空
    if (this.state.gpu.rewgpu) {
      return;
    }

    // 未初始化regl或者、初始化rewgpu失败，退回到regl
    /**
     * rusty_box无法执行webgl，通过process.env.RUSTY来移除动态加载，避免引入gl相关代码
     */
    if (!process.env.RUSTY) {
      this.logger.info('Init renderer with WebGL');

      return import('./gl/main').then(({ createGameREGL }) => {
        this.initRegl(canvas, createGameREGL);
      });
    }
  }

  /**
   * 监听页面可见性变化事件
   */
  private addVisibilityChangeListener() {
    // Set the name of the hidden property and the change event for visibility
    if (typeof document.hidden !== 'undefined') {
      // Opera 12.10 and Firefox 18 and later support
      this.state.dom.hiddenCSS = 'hidden';
      this.state.dom.visibilityChangeCSS = 'visibilitychange';
    } else if (typeof document['msHidden'] !== 'undefined') {
      this.state.dom.hiddenCSS = 'msHidden';
      this.state.dom.visibilityChangeCSS = 'msvisibilitychange';
    } else if (typeof document['webkitHidden'] !== 'undefined') {
      this.state.dom.hiddenCSS = 'webkitHidden';
      this.state.dom.visibilityChangeCSS = 'webkitvisibilitychange';
    }

    const visibilityChangeCSS = this.state.dom.visibilityChangeCSS;

    if (visibilityChangeCSS) {
      document.addEventListener(visibilityChangeCSS, this._pollEvent);
    }
  }

  /**
   * 监听屏幕变化事件
   */
  private addResizeListeners() {
    // hook resize listener
    window.addEventListener('resize', this._pollViewport_IOSHack);
    window.addEventListener('orientationchange', this._pollViewport_IOSHack);
  }

  /**
   * 创建画布的容器（也就是state.dom.element本element）
   */
  private createDomElement() {
    // Create html element
    const element = document.createElement('div');
    Object.assign(element.style, FULLSCREEN_STYLE);
    document.body.appendChild(element);

    this.appendCanvasDom(element);
  }

  /**
   * 创建3D画布，并初始化渲染器
   */
  private async initWebRenderer() {
    // create regl canvas
    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, CANVAS_STYLE);
    this.state.dom.canvas = canvas;

    return this.initRenderer(canvas);
  }

  /**
   * 在rusty_box中初始化ReWGPU
   * 与web不同，画布的创建依赖adapter，需要先创建adapter再创建canvas
   */
  private async initRustyReWGPU() {
    try {
      const canvas = new window['WindowSurface']();

      const { rewgpu, gpu } = await getReWGPU(canvas);

      this.state.gpu.rewgpu = rewgpu;

      this.gpu = gpu;

      this.initReWGPU(canvas.width, canvas.height);
    } catch (err) {
      this.logger.error(err);
    }
  }

  /**
   * 初始化2D画布
   */
  private initCanvas2D() {
    const { canvas, context } = getCanvas2DContext();

    this.state.dom.canvas2D = canvas;

    if (typeof document !== 'undefined') {
      Object.assign(canvas.style, CANVAS_STYLE, {
        'pointer-events': 'none',
      });
    }

    return { canvas, context };
  }
}
