import { EventEmitter } from 'events';
import { ROOT_ID } from '@box/schema/project/murda-tree';
import { MuClient } from '@box/mudb';
import { MuClientProtocol } from '@box/mudb/client';
import { GameUIProtocol } from '@box/schema/game-ui/game-ui-protocol';
import {
  PictureAsset,
  PictureAssetSet,
  PictureAssetSetSchema,
} from '@box/schema/project/hot-schema';
import { retrieveWithImage } from '@box/content-server/image';
import type { GameClientState } from '../game-client-schema';
import { GameUICanvasRenderer } from './canvas-renderer';
import {
  DragControls,
  UIDragEvent,
  UIHoverEvent,
  UISelectEvent,
  UIWheelEvent,
} from './controls/drag';
import type { GetContext } from './nodes/interface';
import type { GetImageData } from './nodes/image';
import type { ResourceController } from '../resource';
import { GameUILayout } from './layout';
import { GameUINodeLoader } from './node-loader';
import { GameUIScreen } from './nodes/screen';
import { ImageStatus } from '../resource/schema';
import { ScrollControls } from './controls/scroll';
import { isScrollBox } from './util';
import { InputManager } from 'src/engine/game-ui/controls/input-manager';
import { InputController } from 'src/engine/input/input-controller';
import { GameUIInput } from 'src/engine/game-ui/nodes/input';
import {
  DEFAULT_SCREEN_ID,
  UITextFontFamily,
  UITree,
  UITreeRDA,
} from '@box/schema/project/ui-rda/defs';
import { UI_FONT_FACE_MAP } from './nodes/defs';
import { RichTextParser } from './nodes/rich-text-parser';

type Spec = {
  state: GameClientState;
  context?: CanvasRenderingContext2D;
  client: MuClient;
  resourceController: ResourceController;
  inputController: InputController;
};

type EventMap = {
  /**
   * 开始运行
   */
  started: undefined;
  /**
   * 停止运行
   */
  stopped: undefined;
};

export interface IGameUI {
  emit<K extends keyof EventMap>(type: K, data: EventMap[K]): boolean;
  addListener<K extends keyof EventMap>(
    type: K,
    listener: (e: EventMap[K]) => void,
  ): this;
  removeListener<K extends keyof EventMap>(
    type: K,
    listener: (e: EventMap[K]) => void,
  ): this;
}

/**
 * 可编辑的GUI
 */
export class GameUIClient extends EventEmitter {
  private readonly inputController: InputController;
  public readonly nodeLoader: GameUINodeLoader;
  public readonly layout: GameUILayout;
  public readonly canvasRenderer: GameUICanvasRenderer;
  public readonly dragControls: DragControls;
  public readonly scrollControls: ScrollControls = new ScrollControls();

  private enabled = false;

  private readonly state: GameClientState;
  private context?: CanvasRenderingContext2D;
  /**
   * engine层的root，在运行时启用
   */
  public readonly root: GameUIScreen;
  /**
   * 指向当前的root
   */
  private currentRoot: GameUIScreen;

  /**
   * 是否处理拖拽滚动
   *
   * 运行时由gameUI处理，非运行时由外部（gameUIEditor）处理，因为外部要处理拖拽移动等交互优先级。
   */
  public dragScrollEnabled = true;
  private isScrolling = false;

  private protocol: MuClientProtocol<typeof GameUIProtocol>;
  private resourceController: ResourceController;

  private pictureAssets: PictureAssetSet = PictureAssetSetSchema.alloc();

  /**
   * 运行时，使用该数据加载UI节点到画布中
   * 该数据由reset消息进行同步
   */
  private uiTree: UITree = UITreeRDA.stateSchema.alloc();

  public inputManager: InputManager;

  public defaultScreenId: string = DEFAULT_SCREEN_ID;

  public readonly richTextParser: RichTextParser;

  constructor(spec: Spec) {
    super();

    const { state, context, client, resourceController, inputController } =
      spec;

    this.state = state;
    this.resourceController = resourceController;
    this.inputController = inputController;
    this.protocol = client.protocol(GameUIProtocol);
    this.protocol.configure({
      message: {
        reset: ({ uiTree, pictureAssets, defaultScreenId }) => {
          this.defaultScreenId = defaultScreenId;

          PictureAssetSetSchema.assign(this.pictureAssets, pictureAssets);

          UITreeRDA.stateSchema.assign(this.uiTree, uiTree);
        },
      },
    });

    this.root = new GameUIScreen({
      id: ROOT_ID,
    });

    this.currentRoot = this.root;

    this.dragControls = new DragControls({
      getRoot: this.getRoot,
      inputController: this.inputController,
    });

    this.inputManager = new InputManager({
      getTextareaContainer: () => state.dom.element || undefined,
      inputController: this.inputController,
    });

    this.richTextParser = new RichTextParser();

    this.nodeLoader = new GameUINodeLoader({
      root: this.root,
      getContext: this.getContext,
      getImageData: this.getImageData,
      inputManager: this.inputManager,
      loadTextFontFace: this.loadTextFontFace,
      richTextParser: this.richTextParser,
    });

    this.layout = new GameUILayout({
      getContext: this.getContext,
    });

    this.canvasRenderer = new GameUICanvasRenderer();

    this.dragControls.addListeners();

    this.dragControls.addListener('dragStart', this.onDragStart);
    this.dragControls.addListener('drag', this.onDrag);
    this.dragControls.addListener('dragEnd', this.onDragEnd);
    this.dragControls.addListener('wheel', this.onWheel);
    this.dragControls.addListener('selected', this.onSelected);
    this.dragControls.addListener('hoverOn', this.onHoverOn);
    this.dragControls.addListener('hoverOff', this.onHoverOff);

    context && this.setContext(context);

    this.enable();
  }

  public setContext(context: CanvasRenderingContext2D) {
    this.context = context;
  }

  public getContext: GetContext = () => this.context;

  public render() {
    if (!this.context) {
      return;
    }

    this.canvasRenderer.render({
      context: this.context,
      root: this.currentRoot,
      layout: this.layout,
    });
  }

  /**
   * 启用APP，并启动相关组件
   */
  public enable() {
    if (this.enabled) {
      return;
    }

    this.enabled = true;

    this.dragControls.enable();
  }

  /**
   * 禁用APP，并禁用相关组件
   */
  public disable() {
    if (!this.enabled) {
      return;
    }

    this.enabled = false;

    this.dragControls.disable();
  }

  /**
   * 当前图的默认屏幕enable是true，其它都是false
   * @private
   */
  private handleScreenEffect = () => {
    this.root.children.forEach((screenNode) => {
      screenNode.visible = screenNode.id === this.defaultScreenId;
    });
  };

  public addListener<K extends keyof EventMap>(
    type: K,
    listener: (e: EventMap[K]) => void,
  ) {
    return super.addListener(type, listener);
  }

  public removeListener<K extends keyof EventMap>(
    type: K,
    listener: (e: EventMap[K]) => void,
  ) {
    return super.removeListener(type, listener);
  }

  public emit<K extends keyof EventMap>(type: K, data: EventMap[K]) {
    return super.emit(type, data);
  }

  public setRoot = (root?: GameUIScreen) => {
    this.currentRoot = root ? root : this.root;
  };

  public getRoot = () => this.currentRoot;

  /**
   * 通过图片路径名or外部地址查询图片数据的方法
   */
  public getImageData: GetImageData = (image) => {
    if (!image) {
      return ImageStatus.Error;
    }
    const pictureAsset = this.pictureAssets[image];
    if (pictureAsset) {
      return this.getImageDataByAsset(pictureAsset);
    }
    return this.resourceController.fetchImageByURL(image, retrieveWithImage);
  };

  private getImageDataByAsset(asset: PictureAsset) {
    const { metadataHash, ...metadata } = asset;

    return this.resourceController.fetchImageByMetadata(
      metadataHash,
      metadata,
      retrieveWithImage,
    );
  }

  private onDragStart = (evt: UIDragEvent) => {
    if (!this.dragScrollEnabled) {
      return;
    }

    this.isScrolling = this.scrollControls.dragScrollStart(evt);
  };

  private onDrag = (evt: UIDragEvent) => {
    if (!this.dragScrollEnabled || !this.isScrolling) {
      return;
    }

    this.scrollControls.dragScroll(evt);
  };

  private onDragEnd = () => {
    if (!this.dragScrollEnabled || !this.isScrolling) {
      return;
    }

    this.scrollControls.dragScrollEnd();
  };

  public setDragScrollEnabled(enabled: boolean) {
    if (this.dragScrollEnabled === enabled) {
      return;
    }

    if (!enabled && this.isScrolling) {
      this.scrollControls.dragScrollEnd();
    }

    this.dragScrollEnabled = enabled;
  }

  private onWheel = (evt: UIWheelEvent) => {
    if (!this.state.replica.running) {
      return;
    }

    const { nodes } = evt;

    if (nodes.length === 0) {
      return;
    }

    const scrollBox = nodes.find(isScrollBox);

    if (!scrollBox) {
      return;
    }

    this.scrollControls.wheelScroll(scrollBox, evt);
  };

  private onSelected = (evt: UISelectEvent) => {
    if (!(evt.node instanceof GameUIInput) || !this.state.replica.running) {
      return;
    }
    // 阻止touchend触发attach的textarea的blur事件
    const nativeEvent = evt.nativeEvent;
    if (nativeEvent?.type === 'touchend') {
      nativeEvent.preventDefault();
    }
    this.inputManager.attach(evt.node);
  };

  private onHoverOn = (evt: UIHoverEvent) => {
    if (evt.node instanceof GameUIInput) {
      document.body.style.cursor = 'text';
    }
  };
  private onHoverOff = (evt: UIHoverEvent) => {
    document.body.style.cursor = 'auto';
  };

  /**
   * 客户端脚本启动时调用该方法
   */
  public start() {
    this.root.children.length = 0;

    this.currentRoot = this.root;

    this.nodeLoader.loadUITree(this.uiTree);
    this.handleScreenEffect();

    this.emit('started', undefined);
  }

  /**
   * 客户端脚本停止时调用该方法
   */
  public stop() {
    this.root.children.length = 0;

    this.inputManager.detach();

    this.emit('stopped', undefined);
  }

  /**
   * 加载文本节点、输入框节点所使用的字体
   */
  public loadTextFontFace = (fontFamily: UITextFontFamily) => {
    const fontFaceConfig = UI_FONT_FACE_MAP[fontFamily];

    this.resourceController.loadFontFace(
      fontFaceConfig.fontFamily,
      `url(${fontFaceConfig.src})`,
      {
        display: 'swap',
        weight: fontFaceConfig.weight,
      },
    );
  };
}
