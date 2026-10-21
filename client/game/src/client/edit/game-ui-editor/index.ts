import { CameraBindingMode, MouseButton } from '@box/schema/input/input-schema';
import {
  DEFAULT_SCREEN_ID,
  UITextFontFamily,
  type UIElementType,
} from '@box/schema/project/ui-rda/defs';
import { EventBus } from '@box/utils/event';
import { ROOT_ID } from '@box/schema/project/murda-tree';
import { retrieveWithImage } from '@box/content-server/image';
import { GameUIClient } from 'src/engine/game-ui';
import { reduxDispatch, store } from 'src/redux/edit';
import {
  setContextMenu,
  setHoveredId,
  setSelectedIds,
  setGameUIVisible,
  setSelectedScreenId,
  setHiddenScreenIds,
} from 'src/redux/edit/game-ui';
import { HoverBox } from './hover-box';
import { CURSOR_MAP, Item, SelectBox } from './select-box';
import type {
  UIDragEvent,
  UIPointerEvent,
  UISelectEvent,
} from 'src/engine/game-ui/controls/drag';
import { AddElementPosition, UITreeController } from './ui-tree-controller';
import type { GetDefaultScreenId, GetUITree, UpdateUITree } from './defs';
import { EventMode } from 'src/engine/game-ui/nodes/defs';
import type { GameUINode } from 'src/engine/game-ui/nodes/base';
import {
  getHitArea,
  hasAbsRotation,
  hitTest,
  isRenderable,
  isScrollbar,
  isScrollBox,
  isUIElementNodeId,
} from 'src/engine/game-ui/util';
import { TransformManager } from './transform-manager';
import { TextInputManager } from './text-input-manager';
import { setSelectedTreeNodes } from 'src/redux/edit/seeds';
import { seedsDataController } from 'src/views/edit/components/stage-area/seedsData';
import type { ClientProjectTransaction } from 'src/client/edit/replica/transaction/client-project-transaction';
import { setIsTerrainPenActive } from 'src/redux/edit/creator';
import { setSelectedModel } from 'src/redux/edit/ui';
import type { ClientStateType } from 'src/client/edit/edit-schema';
import type { GameClient } from 'src/engine/game-client';
import type { EditReplicaClient } from 'src/client/edit/replica/replica-client';
import { GameUINodeManager } from './node-manager';
import { GameUIScreen } from 'src/engine/game-ui/nodes/screen';
import { ImageStatus } from 'src/engine/resource/schema';
import type { GameUIRenderable } from 'src/engine/game-ui/nodes/renderable';
import type { GameUIScrollBox } from 'src/engine/game-ui/nodes/scroll-box';
import { GameUIInput } from 'src/engine/game-ui/nodes/input';
import { isNodeInScreen } from 'src/client/edit/game-ui-editor/util';
import { isUIScreen } from '@box/schema/project/ui-rda/util';
import { UIWheelEvent } from 'src/engine/game-ui/controls/drag';

type Spec = {
  editState: ClientStateType;
  game: GameClient;
  replica: EditReplicaClient;
  projectTransaction: ClientProjectTransaction;
};

export class GameUIEditor {
  private readonly editState: ClientStateType;
  private readonly game: GameClient;
  private readonly gameUI: GameUIClient;
  private readonly replica: EditReplicaClient;

  private readonly hoverBox: HoverBox;
  private readonly selectBox: SelectBox;
  private readonly transformManager: TransformManager;
  private readonly textInputControls: TextInputManager;

  private isDragging = false;

  public readonly nodeManager: GameUINodeManager;

  public readonly projectTransaction: ClientProjectTransaction;

  public readonly uiTreeController: UITreeController;

  public onChange = new EventBus();

  private readonly editRoot: GameUIScreen;

  private isScrolling = false;

  private disabledAxis = false;

  constructor(spec: Spec) {
    const { editState, game, replica, projectTransaction } = spec;

    this.editState = editState;
    this.game = game;
    this.gameUI = this.game.gameUI;
    this.replica = replica;
    this.projectTransaction = projectTransaction;

    this.uiTreeController = new UITreeController(
      this.getUITree,
      this.projectTransaction,
      this.getDefaultScreenId,
    );

    this.editRoot = new GameUIScreen({
      id: ROOT_ID,
    });

    this.nodeManager = new GameUINodeManager({
      root: this.editRoot,
      getContext: this.gameUI.getContext,
      inputManager: this.gameUI.inputManager,
      getImageData: (image) => {
        if (!image) {
          return ImageStatus.Error;
        }
        const { pictureAssets } = this.editState.replica.project;
        const asset = pictureAssets[image];
        if (!asset) {
          return ImageStatus.Error;
        }
        return this.game.resourceController.fetchImageByMetadataHash(
          asset.hash,
          retrieveWithImage,
        );
      },
      loadTextFontFace: this.gameUI.loadTextFontFace,
      richTextParser: this.gameUI.richTextParser,
    });

    this.hoverBox = new HoverBox({
      id: 'hoverBox',
      getRenderableNode: this.nodeManager.getRenderableNode,
      getContext: this.gameUI.getContext,
      loadTextFontFace: this.gameUI.loadTextFontFace,
      richTextParser: this.gameUI.richTextParser,
    });
    this.hoverBox.zIndex = 2;

    this.transformManager = new TransformManager({
      getRenderableNode: this.nodeManager.getRenderableNode,
      projectTransaction: this.projectTransaction,
      getUITree: this.getUITree,
      updateUITree: this.updateUITree,
      layout: this.gameUI.layout,
      root: this.editRoot,
      getSelectBox: () => this.selectBox,
    });

    this.selectBox = new SelectBox({
      id: 'selectBox',
      getRenderableNode: this.nodeManager.getRenderableNode,
      dragControls: this.gameUI.dragControls,
      transformManager: this.transformManager,
      getContext: this.gameUI.getContext,
      getParentLayoutData: this.gameUI.layout.getParentLayoutData,
      loadTextFontFace: this.gameUI.loadTextFontFace,
      richTextParser: this.gameUI.richTextParser,
    });
    this.selectBox.zIndex = 3;
    this.selectBox.visible = false;

    this.editRoot.add(this.hoverBox, this.selectBox);

    this.textInputControls = new TextInputManager({
      inputController: this.game.input,
      selectBox: this.selectBox,
      getTextareaContainer: this.getDOMElement,
      projectTransaction: this.projectTransaction,
      updateUITree: this.updateUITree,
    });

    this.replica.onProjectChange.sub(this.updateUITree);

    this.gameUI.addListener('started', () => this.onStateChanged(true));
    this.gameUI.addListener('stopped', () => this.onStateChanged(false));

    this.gameUI.setRoot(this.editRoot);

    this.addEvents();

    this.onStateChanged(false);
  }

  /**
   * 监听gameUI启动或停止，做对应的状态管理
   * @param started 是否进入运行状态
   */
  private onStateChanged = (started: boolean) => {
    if (started) {
      this.gameUI.setRoot();
      this.gameUI.setDragScrollEnabled(true);

      this.hoverBox.visible = false;
      this.selectBox.visible = false;

      this.gameUI.dragControls.setHoverEnabled(true);

      this.game.setEvent3DPropagation(true);
    } else {
      this.gameUI.setRoot(this.editRoot);
      this.gameUI.setDragScrollEnabled(false);

      this.hoverBox.visible = true;

      const hasSelection = store.getState().gameUI.selectedIds.length > 0;

      this.selectBox.visible = hasSelection;
      this.selectBox.eventMode = hasSelection
        ? EventMode.Passive
        : EventMode.None;

      this.gameUI.dragControls.setHoverEnabled(hasSelection);

      this.game.setEvent3DPropagation(!hasSelection);
    }
  };

  /**
   * 更新选中的节点id，并更新交互状态。
   */
  public setSelectedIds = (newIds: string[]) => {
    const ids = newIds.filter((id) => id !== DEFAULT_SCREEN_ID);

    reduxDispatch(setSelectedIds(ids));

    // 当有选中的UI元素时，允许hover检测
    const hasSelection = ids.length !== 0;

    if (hasSelection) {
      const { seeds, creator, ui } = store.getState();

      if (seeds.selectedTreeNodes.length > 0) {
        reduxDispatch(setSelectedTreeNodes([]));
      }

      if (seedsDataController.hoverSeedIds.length > 0) {
        seedsDataController.setHoverSeedIds([]);
      }

      creator.isTerrainPenActive && reduxDispatch(setIsTerrainPenActive(false));

      ui.selectedModel && reduxDispatch(setSelectedModel(undefined));
    }

    this.gameUI.dragControls.setHoverEnabled(hasSelection);

    this.selectBox.visible = hasSelection && this.isSelectedScreenVisible();
    this.selectBox.eventMode =
      hasSelection && this.isSelectedScreenVisible()
        ? EventMode.Passive
        : EventMode.None;

    this.game.setEvent3DPropagation(!hasSelection);
  };

  private isNodeInVisibleSelectedScreen(node?: GameUINode) {
    const { selectedScreenId } = store.getState().gameUI.screen;
    if (!selectedScreenId || !node) {
      return false;
    }
    return (
      this.isSelectedScreenVisible() &&
      isNodeInScreen(node.id, selectedScreenId, this.getUITree())
    );
  }

  private isSelectedScreenVisible() {
    const { selectedScreenId } = store.getState().gameUI.screen;
    if (!selectedScreenId) {
      return false;
    }
    return !!this.nodeManager.getNode(selectedScreenId)?.visible;
  }

  // 当前是否存在ui元素
  private hasUIElement = () => {
    const uiTree = this.getUITree();
    const screenIds = uiTree[ROOT_ID].childrenIds;
    for (let i = 0; i < screenIds.length; i++) {
      if (uiTree[screenIds[i]].childrenIds.length > 0) {
        return true;
      }
    }
    return false;
  };

  private onSelected = ({
    node: eventNode,
    mouseButton,
    clientPosition,
    nativeEvent,
  }: UISelectEvent) => {
    // 仅在非运行时执行
    const { running } = this.game.state.replica;
    if (running) {
      return;
    }

    const node = eventNode && this.getDragEventTreeNode(eventNode);
    const { selectedIds } = store.getState().gameUI;

    if (
      mouseButton === MouseButton.right &&
      clientPosition &&
      !this.isEditing3D() &&
      this.hasUIElement()
    ) {
      let pointerDownNodeId: string | undefined;

      // 检查3d相关的编辑事件
      if (
        node &&
        this.isUIElementNodeId(node.id) &&
        // 如果没有选中当前节点，或者仅选中当前节点，展开右键菜单
        (!selectedIds.includes(node.id) || selectedIds.length === 1)
      ) {
        pointerDownNodeId = node.id;
      }

      reduxDispatch(
        setContextMenu({
          position: [...clientPosition],
          pointerDownNodeId,
          insideCanvas: true,
        }),
      );

      return;
    }

    // 未选中时，未进入UI编辑状态，除右键外不响应
    if (selectedIds.length === 0) {
      return;
    }

    // 左键可能是切换选中元素、多选、反选
    if (
      mouseButton === MouseButton.left &&
      !this.isInteractingSelectBox(node)
    ) {
      // 仅元素节点可被选中
      const id = node && this.isUIElementNodeId(node.id) ? node.id : undefined;
      // 空选
      if (!id) {
        this.select();
        return;
      }

      if (!this.isNodeInVisibleSelectedScreen(node)) {
        return;
      }

      if (nativeEvent && nativeEvent.shiftKey) {
        this.multiSelect(id);
      } else {
        // 文本框单击选中
        if (node instanceof GameUIInput) {
          // 阻止touchend触发attach的textarea的blur事件
          if (nativeEvent?.type === 'touchend') {
            nativeEvent.preventDefault();
          }
          this.textInputControls.attach(node);
        }
        this.select(id);
      }
    }
  };

  /**
   * 多选 & 反选交互
   */
  public multiSelect(nodeId: string) {
    const { selectedIds } = store.getState().gameUI;

    let newSelectedIds: string[];

    // 如果已经被选中，则取消选中
    if (selectedIds.includes(nodeId)) {
      newSelectedIds = selectedIds.filter((id) => id !== nodeId);
    } else {
      newSelectedIds = selectedIds.concat([nodeId]);
    }

    this.setSelectedIds(newSelectedIds);
  }

  /**
   * 单选交互
   */
  public select(nodeId?: string) {
    this.setSelectedIds(nodeId ? [nodeId] : []);
  }

  /**
   * 获取事件中uiTree的节点
   *
   * 比如与滚动条交互，需要找到滚动框
   */
  private getDragEventTreeNode(node: GameUIRenderable): GameUINode | undefined {
    return isScrollbar(node) ? node.scrollBox : node;
  }

  private onWheel = (evt: UIWheelEvent) => {
    if (this.game.state.replica.running) {
      return;
    }

    const { nodes } = evt;

    if (nodes.length === 0 || !this.isNodeInVisibleSelectedScreen(nodes[0])) {
      return;
    }

    const scrollBox = nodes.find(isScrollBox);

    if (!scrollBox) {
      return;
    }

    this.gameUI.scrollControls.wheelScroll(scrollBox, evt);
  };

  private onDragStart = (evt: UIDragEvent) => {
    if (this.game.state.replica.running) {
      return;
    }

    // 如果当前没有任何选中，判断是否要执行滚动
    if (store.getState().gameUI.selectedIds.length === 0) {
      // 在当前屏幕的元素才可以拖动滚动
      if (this.isNodeInVisibleSelectedScreen(evt.nodes[0])) {
        this.isScrolling = this.gameUI.scrollControls.dragScrollStart(evt);
      }

      return;
    }

    // 有选中，需要执行拖动
    this.startDragNodes(evt);
  };

  private onDragEnd = () => {
    if (this.isScrolling) {
      this.gameUI.scrollControls.dragScrollEnd();

      this.isScrolling = false;

      return;
    }

    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'auto';
    }

    if (!this.isDragging) {
      return;
    }

    this.selectBox.renderSizeLabel = true;

    this.isDragging = false;
    this.transformManager.end();
    this.selectBox.measureTool.visible = false;
    this.gameUI.layout.layout(this.selectBox);
  };

  private onDrag = (evt: UIDragEvent) => {
    if (this.isScrolling) {
      this.gameUI.scrollControls.dragScroll(evt);
      return;
    }

    this.isDragging && this.transformManager.drag({ mouse: evt.mouse });
  };

  private isInteractingSelectBox(node?: GameUINode) {
    return node && this.selectBox.children.includes(node);
  }

  private isUIElementNodeId(nodeId: string) {
    return isUIElementNodeId(nodeId, this.getUITree());
  }

  private onDoubleClick = ({ nodes }: UIPointerEvent) => {
    if (!this.isNodeInVisibleSelectedScreen(nodes[0])) {
      return;
    }

    const { selectedIds } = store.getState().gameUI;

    if (
      !this.game.state.replica.running &&
      nodes[0] &&
      selectedIds.includes(nodes[0].id)
    ) {
      this.textInputControls.attach(nodes[0]);
    }
  };

  private getDOMElement = () => this.game.state.dom.element || undefined;

  /**
   * 创建节点并选中
   * @param type 节点类型
   * @param parentId 父节点id，没有则添加到当前屏幕
   */
  public addElementAndSelect = (type: UIElementType, parentId?: string) => {
    const { defaultScreenId } = this.editState.replica.project;
    const { selectedScreenId } = store.getState().gameUI.screen;
    // 没有parentId，则添加到当前屏幕
    const realParentId = parentId || selectedScreenId || defaultScreenId;

    const id = this.uiTreeController.createElement(type, realParentId);

    // 没有选中屏幕时，选中默认屏幕
    if (!selectedScreenId) {
      this.selectScreen(defaultScreenId);
    }

    this.select(id);
  };

  /**
   * 创建节点并选中
   * @param type 节点类型
   * @param position
   */
  public addElementAndMove = (
    type: UIElementType,
    position: AddElementPosition,
  ) => {
    const parentId = this.getUITree()[position.targetId]?.parentId;
    if (!parentId) {
      return;
    }

    const id = this.uiTreeController.createElement(type, parentId, false);
    this.uiTreeController.moveElement(id, position);

    this.select(id);
  };

  public addScreenAndSelect = () => {
    const id = this.uiTreeController.createScreen();
    this.selectScreen(id);
  };

  /**
   * 选中屏幕，不传id则是取消选中
   * @param id
   */
  public selectScreen = (id?: string) => {
    if (id === store.getState().gameUI.screen.selectedScreenId) {
      return;
    }
    // 切换屏幕，需要取消之前的选中
    this.select();
    reduxDispatch(setSelectedScreenId(id));
  };

  public setGameUIVisible = (visible: boolean) => {
    store.dispatch(setGameUIVisible(visible));

    this.editRoot.visible = visible;
    this.gameUI.root.visible = visible;

    if (store.getState().gameUI.selectedIds.length > 0) {
      this.setSelectedIds([]);
    }
  };

  public toggleGameUIScreenVisible = (screenId: string) => {
    const {
      screen: { hiddenScreenIds, selectedScreenId },
    } = store.getState().gameUI;
    let visible = false;
    const temp = hiddenScreenIds.filter((hiddenScreenId) => {
      if (hiddenScreenId === screenId) {
        visible = true;
        return false;
      }
      return true;
    });

    if (!visible) {
      temp.push(screenId);
      // 隐藏屏幕，则去掉当前隐藏屏幕节点的selectBox
      if (selectedScreenId === screenId) {
        this.selectBox.visible = false;
        this.selectBox.eventMode = EventMode.None;
        this.game.setEvent3DPropagation(true);
      }
    }
    reduxDispatch(setHiddenScreenIds(temp));
    const screenNode = this.nodeManager.getNode(screenId);
    if (screenNode) {
      screenNode.visible = visible;
    }
  };

  public setDefaultScreen = (screenId: string) => {
    const uiTree = this.getUITree();
    const node = uiTree[screenId];
    if (node && node.value && isUIScreen(node.value)) {
      // 设置默认屏幕
      this.projectTransaction.push((action) =>
        action.defaultScreenId(screenId),
      );
      this.projectTransaction.commit();
      return true;
    }
    return false;
  };

  public addEvents() {
    this.gameUI.dragControls.addListener('hoverOn', ({ node: eventNode }) => {
      const node = this.getDragEventTreeNode(eventNode);

      if (!node || this.game.state.replica.running) {
        return;
      }

      // 处理edit模式下的cursor
      const cursor = CURSOR_MAP[node.id];
      if (cursor && node instanceof Item) {
        document.body.style.cursor = cursor;
      }

      if (
        this.isUIElementNodeId(node.id) &&
        !store.getState().gameUI.selectedIds.includes(node.id) &&
        this.isNodeInVisibleSelectedScreen(node)
      ) {
        reduxDispatch(setHoveredId(node.id));
        this.gameUI.layout.layout(this.hoverBox);
      }
    });

    this.gameUI.dragControls.addListener('hoverOff', () => {
      if (this.game.state.replica.running) {
        return;
      }
      reduxDispatch(setHoveredId(undefined));
    });

    this.gameUI.dragControls.addListener('selected', this.onSelected);
    this.gameUI.dragControls.addListener('dragStart', this.onDragStart);
    this.gameUI.dragControls.addListener('drag', this.onDrag);
    this.gameUI.dragControls.addListener('dragEnd', this.onDragEnd);
    this.gameUI.dragControls.addListener('doubleClick', this.onDoubleClick);
    this.gameUI.dragControls.addListener('pointerDown', this.onPointerDown);
    this.gameUI.dragControls.addListener('pointerUp', this.onPointerUp);
    this.gameUI.dragControls.addListener('wheel', this.onWheel);

    this.gameUI.scrollControls.addListener('wheelScroll', this.onWheelScroll);
    this.gameUI.scrollControls.addListener('dragScroll', this.onDragScroll);
    this.gameUI.scrollControls.addListener(
      'dragScrollEnd',
      this.onDragScrollEnd,
    );
  }

  /**
   * 根据redux里hiddenScreenIds将GameUIScreen visible设置成false
   * 将其它screen的visible设置为true
   * @private
   */
  private handleScreenEffect = () => {
    const { hiddenScreenIds } = store.getState().gameUI.screen;
    this.getUITree()[ROOT_ID]?.childrenIds.forEach((screenId) => {
      const node = this.nodeManager.getNode(screenId);
      if (node) {
        node.visible = true;
      }
    });
    hiddenScreenIds.forEach((screenId) => {
      const node = this.nodeManager.getNode(screenId);
      if (node) {
        node.visible = false;
      }
    });
  };

  public updateUITree: UpdateUITree = () => {
    this.nodeManager.loadUITree(this.editState.replica.project.uiTree);

    this.handleScreenEffect();

    this.onChange.notify(undefined);
  };

  private getUITree: GetUITree = () => this.editState.replica.project.uiTree;
  private getDefaultScreenId: GetDefaultScreenId = () =>
    this.editState.replica.project.defaultScreenId;

  private onPointerDown = (e: UIPointerEvent) => {
    this.restoreEnableAxis();

    if (
      e.nodes.length > 0 ||
      (store.getState().gameUI.selectedIds.length > 0 &&
        hitTest(e.mouse, getHitArea(this.selectBox)))
    ) {
      this.game.setEvent3DPropagation(false);

      /**
       * 在移动端编辑时，pointerMove拖拽元素（比如拖拽滚动框滚动）会和旋转相机冲突。
       * 与gameUI交互时，禁用旋转相机。
       */
      if (
        this.game.state.input.cameraBindingMode === CameraBindingMode.leftKey
      ) {
        this.disabledAxis = true;

        this.game.input.disableAxis();
      }
    }
  };

  private onPointerUp = () => {
    this.game.setEvent3DPropagation(
      store.getState().gameUI.selectedIds.length === 0,
    );

    this.restoreEnableAxis();
  };

  private restoreEnableAxis() {
    if (this.disabledAxis) {
      this.disabledAxis = false;

      this.game.input.enableAxis();
    }
  }

  /**
   * 开始拖拽移动节点
   */
  private startDragNodes(evt: UIDragEvent) {
    const { mouse, nodes } = evt;

    if (this.isInteractingSelectBox(nodes[0])) {
      return;
    }

    const node = nodes[0] && this.getDragEventTreeNode(nodes[0]);

    // 在选中节点外拖动
    if (!hitTest(mouse, getHitArea(this.selectBox))) {
      // 如果在选中框区域外，且没有新的节点，或者有节点，但是是其它屏幕的，啥也不干。
      if (!node || !this.isNodeInVisibleSelectedScreen(node)) {
        return;
      }

      // 如果有交互到节点，则选中该节点
      this.setSelectedIds([node.id]);

      this.selectBox.onBeforeAbsDataUpdate();
      const { layout } = this.gameUI;
      layout.updateAbsData(
        this.selectBox,
        layout.getParentLayoutData(this.selectBox),
      );
    }

    // 如果选中了不可移动的节点，则大家都不准动
    const draggable = store.getState().gameUI.selectedIds.every((id) => {
      const node = this.nodeManager.getNode(id);

      if (node && node.parent && node.parent.components.uiAutoLayout) {
        return false;
      }

      return true;
    });

    if (!draggable) {
      document.body.style.cursor = 'not-allowed';
      return;
    }

    this.isDragging = true;

    this.transformManager.start({
      mouse: mouse,
      offsetRatio: [1, 1],
      sizeRatio: [0, 0],
      type: 'position',
    });

    this.selectBox.renderSizeLabel = false;

    const { selectedIds } = store.getState().gameUI;

    this.selectBox.measureTool.visible = false;

    let parentId = this.nodeManager.getNode(selectedIds[0])?.parent?.id;

    if (parentId) {
      const parent = this.nodeManager.getNode(parentId);

      if (parent) {
        /**
         * 显示测距线的条件（1）- 测距对象无旋转
         * - 选中框由测距对象组成，只需要判断选中框是否无旋转即可
         *
         * 显示测距线的条件（2）- 父节点无旋转
         * - 如果父节点是渲染节点，需要确保父元素无旋转
         * - 如果父节点不是渲染节点，则认为无旋转
         */
        if (
          !hasAbsRotation(this.selectBox) &&
          (!isRenderable(parent) || !hasAbsRotation(parent))
        ) {
          /**
           * 显示测距线的条件（3）- 多选时，所有节点的父节点是同一个
           */
          this.selectBox.measureTool.visible = selectedIds.every((id) => {
            const renderable = this.nodeManager.getRenderableNode(id);

            return renderable?.parent?.id === parentId;
          });
        }
      }
    }

    this.gameUI.layout.layout(this.selectBox);
  }

  /**
   * 监听gameUI.scrollControls的滚轮滚动事件
   * 每次事件都提交（commit: true），但是不会生成撤销重做记录（allowUndo: false）
   */
  private onWheelScroll = (scrollBox: GameUIScrollBox) => {
    if (
      this.game.state.replica.running ||
      !this.isNodeInVisibleSelectedScreen(scrollBox)
    ) {
      return;
    }

    this.uiTreeController.setScrollPositions(
      [scrollBox.id],
      scrollBox.scrollPosition,
      true,
      false,
    );
  };

  /**
   * 监听gameUI.scrollControls的拖拽滚动 - 滚动中事件
   * 事件不提交
   */
  private onDragScroll = (scrollBox: GameUIScrollBox) => {
    if (
      this.game.state.replica.running ||
      !this.isNodeInVisibleSelectedScreen(scrollBox)
    ) {
      return;
    }

    this.uiTreeController.setScrollPositions(
      [scrollBox.id],
      scrollBox.scrollPosition,
      false,
    );
  };

  /**
   * 监听gameUI.scrollControls的拖拽滚动 - 滚动结束事件
   * 事件提交（commit: true），生成撤销重做记录（allowUndo: true）
   */
  private onDragScrollEnd = (scrollBox: GameUIScrollBox) => {
    if (
      this.game.state.replica.running ||
      !this.isNodeInVisibleSelectedScreen(scrollBox)
    ) {
      return;
    }

    this.uiTreeController.setScrollPositions(
      [scrollBox.id],
      scrollBox.scrollPosition,
      true,
      true,
    );
  };

  /**
   * 判断是否“非UI编辑操作”
   */
  private isEditing3D() {
    const { ui, creator, seeds } = store.getState();

    return (
      !!ui.selectedModel ||
      creator.isTerrainPenActive ||
      seeds.selectedTreeNodes.length > 0
    );
  }

  /**
   * 更新节点的字体设置，并加载字体
   * 加载字体只需要在rusty上执行，web通过css配置`@font-face`即可
   */
  public setTextFontFamily(nodeIds: string[], fontFamily: UITextFontFamily) {
    this.uiTreeController.setTextFontFamily(nodeIds, fontFamily);

    this.gameUI.loadTextFontFace(fontFamily);
  }
}
