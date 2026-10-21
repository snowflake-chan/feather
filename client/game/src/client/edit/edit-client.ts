import { GlobalNoticeSchema } from '@box/schema/chat/chat-schema';
import { FileDictRDA } from '@box/schema/code-editor/code-editor-common-state';
import { CodeEditorProtocol } from '@box/schema/code-editor/code-editor-protocol';
import { CameraBindingMode } from '@box/schema/input/input-schema';
import {
  PostMessageSchema,
  PostMessageType,
} from '@box/schema/navigator/navigator-schema';
import { quat, vec3 } from 'gl-matrix';
import { GameAdminClient } from 'src/entry/admin-client';
import { GameUIEditor } from 'src/client/edit/game-ui-editor';
import { CloseType, GameClientAppState } from 'src/engine/game-client-schema';
import type { GameWheelEvent } from 'src/engine/input/events';
import type { Settings } from 'src/engine/settings/settings-schema';
import { messenger } from 'src/messenger';
import { reduxDispatch } from 'src/redux/edit';
import { setIsRunning } from 'src/redux/edit/ui';
import { touchable } from 'src/utils/mobile';
import { createGameClient } from '..';
import type { Notices } from '../../views/components/common/notice';
import { EngineClient } from '../client';
import { getMuRef } from '../client-schema';
import { ReactEvents } from '../react-event';
import { drawCoordinate } from './2d-visiual/coordinate';
import { AiClient } from './ai-client';
import { MuCodeEditorReplicaClient } from './code-editor-replica/client';
import { CodeEditorClientController } from './code-editor/code-editor-client-controller';
import { EditContentStorage } from './content';
import { DebuggerClient } from './debugger/debugger-client';
import { DebuggerConsole } from './debugger/debugger-console';
import {
  ClientStateSchema,
  FrameClientStateSchema,
  frameStateSchemasMap,
  FrameStateSchemasMapType,
} from './edit-schema';
import { PublishClient } from './publish/publish-client';
import { EditReplicaClient } from './replica/replica-client';
import { EditRPCClient } from './rpc/rpc-client';
import { syncSeedDisplay, tickPendingSeedDisplay } from './seed/seed-helper';
import { AssetController } from './state-controller/asset-controller';
import { EnvironmentController } from './state-controller/environment-controller';
import { GamepadController } from './state-controller/gamepad-controller';
import { PermissionController } from './state-controller/permission-controller';
import { SeedController } from './state-controller/seed-controller';

let notices: Notices | undefined;
if (!process.env.RUSTY) {
  import('../../views/components/common/notice').then(({ notice }) => {
    notices = notice;
  });
}

export class EditClient extends EngineClient {
  public frameState = FrameClientStateSchema.clone(
    FrameClientStateSchema.identity,
  );
  private reactEvent = new ReactEvents<FrameStateSchemasMapType>(
    frameStateSchemasMap,
  );
  public listeners = this.reactEvent.listeners;
  public state = ClientStateSchema.clone(ClientStateSchema.identity);
  private preRunning: boolean | undefined = undefined;
  public debugging = false;

  public codeEditorController = getMuRef<CodeEditorClientController>();
  public replica = getMuRef<EditReplicaClient>();
  public debugger = getMuRef<DebuggerClient>();
  public ai = getMuRef<AiClient>();
  public rpc = getMuRef<EditRPCClient>();
  public publish = getMuRef<PublishClient>();
  public seedController = getMuRef<SeedController>();
  public assetController = getMuRef<AssetController>();
  public envController = getMuRef<EnvironmentController>();
  public gamepadController = getMuRef<GamepadController>();
  public permissionController = getMuRef<PermissionController>();

  /**
   * 编辑端存储资源到OSS的模块
   */
  public editContentStorage = getMuRef<EditContentStorage>();
  public gameUIEditor = getMuRef<GameUIEditor>();

  public gameFrameCb: Function | undefined = undefined;

  constructor() {
    super('edit');
  }

  public addMessengerEventListeners = () => {
    messenger.messageTool.eventOn('togglePlayerRender', ({ hide }) => {
      this.hidePlayers(hide);
    });
    // 监听screenshot事件并回传截图
    messenger.messageTool.eventOn('screenshot', async () => {
      try {
        await this.sendScreenshot();
      } catch (error) {
        window.console.error(error);
      }
    });
    // 监听edit start和stop的事件
    messenger.messageTool.eventOn('startProject', () => {
      this.replica.startProject();
    });
    messenger.messageTool.eventOn('stopProject', () => {
      this.replica.stopProject();
    });

    messenger.messageTool.eventOn(
      'setSettings',
      (settings: Partial<Settings>) => {
        this.setGameSettings(settings);
      },
    );

    messenger.messageTool.eventOn(
      'getSettings',
      <K extends keyof Settings>(keys?: K[]) => {
        const settings = this.game.state.settings;
        if (!keys) {
          messenger.messageTool.emitEvent('responseGetSettings', settings);
        } else {
          const result = {} as Pick<Settings, K>;
          keys.forEach((key) => {
            result[key] = settings[key];
          });
          messenger.messageTool.emitEvent('responseGetSettings', result);
        }
      },
    );
  };

  private receiveScriptMessage(message: PostMessageType) {
    try {
      const value = JSON.parse(message.value);
      if (message.isOld && message.type === 'share') {
        messenger.messageTool.emitEvent(message.type as any, value);
      }
    } catch (error) {
      console.log('parse server message error: ', error);
    }
    this.game.navigator.clearPostMessage();
    PostMessageSchema.assign(this.state.iframeMessage, message);
  }

  public connectGame(hash: string, serverId?: string) {}

  // 初始化engine
  public preconnect() {
    const { bufferSink, logger, pinoLogger, state } = this;
    const console = new DebuggerConsole(state);
    const { game, client } = createGameClient(
      {
        bufferSink,
        logger,
        pinoLogger,
        console,
        // RUSTY环境需要自动创建
        autoCreateElement: !!process.env.RUSTY,
        connectGame: this.connectGame,
      },
      (config) => {
        if (config.admin) this.admin.init();
        this.state.isAdmin = config.admin;
      },
      (groupName: string, partName: string) => {
        const path = this.state.replica.project.gamepad[groupName]?.[partName];
        const asset = this.state.replica.project.pictureAssets[path];
        if (!asset) {
          return '';
        }
        return asset.hash;
      },
    );

    this.setGame(game);

    // 初始化绑定state数据源
    this.initState();

    this.codeEditorController = new CodeEditorClientController(
      state,
      client.protocol(CodeEditorProtocol),
      game.state.content,
      new MuCodeEditorReplicaClient({
        client: client,
        rda: FileDictRDA,
        name: 'code-editor-files',
      }),
    );

    this.replica = new EditReplicaClient({
      client,
      game: this.game,
      logger,
      state,
    });
    this.debugger = new DebuggerClient({
      client,
      state,
      console,
    });
    this.ai = new AiClient({
      client,
      logger: pinoLogger,
    });
    this.rpc = new EditRPCClient({
      client,
      state,
    });
    this.publish = new PublishClient({
      client,
      state,
    });

    // create controller helpers
    this.seedController = new SeedController(state, this.replica, pinoLogger);
    this.gamepadController = new GamepadController(this.replica, state);
    this.assetController = new AssetController(
      this.replica,
      state,
      this.gamepadController,
    );
    this.envController = new EnvironmentController(this.replica, state);
    this.permissionController = new PermissionController(
      this.replica,
      state,
      this.game.state,
    );

    this.editContentStorage = new EditContentStorage({
      resourceController: this.game.resourceController,
    });

    // 注册admin client
    this.admin = new GameAdminClient({
      app: this,
      client,
      rpc: this.rpc,
      seedController: this.seedController,
      assetController: this.assetController,
      editContentStorage: this.editContentStorage,
    });

    this.gameUIEditor = new GameUIEditor({
      editState: this.state,
      game: this.game,
      replica: this.replica,
      projectTransaction: this.replica.projectTransaction(),
    });

    this.replica.onProjectChange.sub(() => {
      syncSeedDisplay(this.state, this.game.state);
    });

    this.game.preconnect();
    this.addMessengerEventListeners();
  }

  // 将game.state和state进行绑定
  private initState = () => {
    this.state.hyperLink = this.game.state.hyperLink;
    this.state.sound = {
      sampleCache: this.game.state.sound.sampleCache,
    };
    for (const i in this.frameState) {
      this.frameState[i] = this.state[i];
    }
  };

  private _clickedStart = false;
  public start(spec: {
    ready: () => void;
    close: (closeError: CloseType) => void;
  }) {
    this.logger.trace(
      `start clicked ${(
        (Date.now() - this.game.state.enginePreconnectTimeStamp) /
        1000
      ).toFixed(2)}`,
    );

    // prevent clicking start twice
    if (this._clickedStart) {
      return;
    }
    this._clickedStart = true;

    // check if user has permission
    this.game.state.serverError =
      this.game.checkUserPermission(
        this.frameState.replica.isInviteLinkExpired,
      ) || this.game.state.serverError;

    // install webgl overlays
    const game = this.game;
    let listenCameraChange = false;

    if (this.preRunning == undefined) {
      this.preRunning = this.game.state.replica.running;
      reduxDispatch(setIsRunning(!!this.preRunning));
    }

    game.onTick.sub(() => {
      const curRunning = this.game.state.replica.running;
      if (this.preRunning !== curRunning) {
        if (this.game.clientScript) {
          if (curRunning) {
            this.game.clientScript.start();
          } else {
            this.game.clientScript.stop();
          }
        }

        reduxDispatch(setIsRunning(curRunning));
        messenger.emitEvent('editRunningStatusChange', curRunning);
        this.replica.setVoxelInvisible(curRunning);
        this.game.state.particles.resetNeeded = true;
        if (!touchable) {
          if (!this.preRunning) {
            this.game.input.setCameraBindingMode(CameraBindingMode.leftKey);
            this.frameState.rotationTutorial = 'left';
            listenCameraChange = true;
          } else {
            this.game.input.setCameraBindingMode(CameraBindingMode.rightKey);
            this.frameState.rotationTutorial = 'right';
            listenCameraChange = true;
          }
        }
      }
      this.preRunning = curRunning;

      // tick replica
      this.replica.tick();

      if (!curRunning) {
        tickPendingSeedDisplay(this.state, this.game.state);
      }
    });

    if (game.state.appState === GameClientAppState.DISCONNECT) {
      spec.close && spec.close(this.game.state.serverError);
    }

    game.onReady.sub(() => {
      spec.ready && spec.ready();
      if (!touchable) {
        game.input.setCameraBindingMode(CameraBindingMode.rightKey);
      }
      game.input.onAxisChange.sub(() => {
        if (listenCameraChange) {
          listenCameraChange = false;
          setTimeout(() => {
            this.frameState.rotationTutorial = '';
          }, 3000);
        }
      });
    });

    game.rendererReady(() => {
      this.replica.setVoxelInvisible(this.game.state.replica.running);
    });

    game.onFrame.sub(() => {
      this.debugging && drawCoordinate(this.state, this.game.state);

      this.initState();
      this.reactEvent.frameState(this.frameState);
      if (
        !PostMessageSchema.equal(
          this.state.iframeMessage,
          this.game.state.navigator.postMessage,
        )
      ) {
        this.receiveScriptMessage(this.game.state.navigator.postMessage);
      }
      // global notice
      const { title, detail } = this.game.state.globalNotice;
      if (title || detail) {
        // 看起来只有sendGlobalNotice
        /**
         * 看起来目前没有路径触发
         *
         * 唯一能触发的路径：
         * client.chatClient.sendGlobalNotice ->
         * server.chatServer.noticeMessage ->
         * client.globalNotice ->
         * state.globalNotice
         *
         * 而sendGlobalNotice没有任何调用
         */
        notices?.success({ title, detail });
        this.game.state.globalNotice = GlobalNoticeSchema.identity;
      }
      this.gameFrameCb && this.gameFrameCb();
    });

    game.onClose.sub((message: CloseType) => {
      spec.close && spec.close(message);
    });

    this.game.input.unlockedWheel.sub(this._handleCameraDistance);

    vec3.set(game.state.camera.targetLook, 0, 0, 0);
    quat.set(game.state.camera.rotation, 0, 0, 0, 1);

    if (!process.env.RUSTY) {
      const gl = game.gl;
      const loader = game.state.gl.reglLoader;
      if (gl && loader) {
        import('./gl/main').then(({ default: editGLMain }) => {
          /**
           * 这里是为了渲染“玩家编辑代码中（Hacking）“的状态
           * - 只有edit有
           * - 用了一种挂监听来增加渲染流程的方式
           * - 这样子打包的时候，就只在edit的包里
           * - 仅在编辑模式的构建中启用
           */
          const editGL = loader.require(editGLMain);
          editGL.init(this.state);
          gl.onForwardPass.sub(() => {
            editGL.forward(this.state, this.game.state);
          });
          gl.onAlphaPass.sub(() => {
            editGL.alphaPre(this.state);
            editGL.alphaPost(this.game.state);
          });
          gl.onShadowPass.sub(() => {
            editGL.shadow(this.state);
          });
        });
      }
    }

    // 编辑模式下人物不可交互
    game.interact.playerIntractable = false;

    game.start();
  }

  // TODO: 临时用法
  public setGameframeCb(cb) {
    if (cb) {
      this.gameFrameCb = cb;
    }
  }

  public requestToken = async (durationMS: number, group: string) => {
    return this.replica.requestToken(durationMS, group);
  };

  public scriptEval = (script: string) => {
    if (script.length) {
      this.debugger.scriptEval(script);
      this.frameState.debugger.debugInput.push(script);
      while (this.frameState.debugger.debugInput.length > 100) {
        this.frameState.debugger.debugInput.shift();
      }
    }
  };

  private _handleCameraDistance = (e: GameWheelEvent) => {
    if (e.targets.length) {
      return;
    }
    this.game.state.camera.distance += e.deltaY / 100;
  };
}

export let editor: EditClient;
export function resolveEditor(value: EditClient) {
  if (!editor) {
    editor = value;

    if (process.env.NODE_ENV === 'development') {
      window['editor'] = editor;
    }
  }
}
