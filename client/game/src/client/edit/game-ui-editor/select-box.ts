import { mat2d, vec2 } from 'gl-matrix';
import { store } from 'src/redux/edit';
import type { SerializedVec2 } from 'src/engine/interfaces';
import { BaseSpec, GameUINode } from 'src/engine/game-ui/nodes/base';
import {
  hasAbsRotation,
  HitArea,
  parseWorldLayout,
  positionReverseRotation,
} from 'src/engine/game-ui/util';
import type {
  GetContext,
  UITransform,
} from 'src/engine/game-ui/nodes/interface';
import { drawOutline, drawWhiteBlueOutline } from './outline';
import { DragControls, UIDragEvent } from 'src/engine/game-ui/controls/drag';
import { EventMode } from 'src/engine/game-ui/nodes/defs';
import { TransformManager } from './transform-manager';
import { SizeLabel } from './size-label';
import { MeasureTool } from './measure-tool';
import { GameUIRenderable } from 'src/engine/game-ui/nodes/renderable';
import type { GetRenderableNode, ISelectBox } from './defs';
import type { GetParentLayoutData } from 'src/engine/game-ui/interfaces';
import type { LoadTextFontFace } from 'src/engine/game-ui/nodes/text';
import type { RichTextParser } from 'src/engine/game-ui/nodes/rich-text-parser';
import { setTransformByMat2d } from 'src/engine/utils/canvas';

/**
 * 临时变量，用于计算节点的右下角坐标
 * 最后用于计算选中框整体的尺寸
 */
const TEMP_BOTTOM_RIGHT: SerializedVec2 = [0, 0];
const TEMP_OFFSET_RATIO = vec2.create();
const TEMP_SIZE_RATIO = vec2.create();

const CORNER_SIZE: SerializedVec2 = [7, 7];
const CORNER_BORDER_COLOR = '#00C2FF';
const CORNER_BG_COLOR = '#FFFFFF';

enum InteractiveId {
  Left = 'selectLeft',
  Top = 'selectTop',
  Bottom = 'selectBottom',
  Right = 'selectRight',

  LeftTop = 'selectLeftTop',
  LeftBottom = 'selectLeftBottom',
  RightTop = 'selectRightTop',
  RightBottom = 'selectRightBottom',

  /**
   * 新增选中框可交互的元素，在一定条件下显示。
   * - 元素的父元素为自动布局元素
   * - 在特定方向上允许修改
   */
  LeftCenter = 'selectLeftCenter',
  RightCenter = 'selectRightCenter',
  TopCenter = 'selectTopCenter',
  BottomCenter = 'selectBottomCenter',
}

export const CURSOR_MAP = {
  [InteractiveId.Left]: 'w-resize',
  [InteractiveId.Top]: 'n-resize',
  [InteractiveId.Bottom]: 's-resize',
  [InteractiveId.Right]: 'e-resize',

  [InteractiveId.LeftTop]: 'nw-resize',
  [InteractiveId.LeftBottom]: 'sw-resize',
  [InteractiveId.RightTop]: 'ne-resize',
  [InteractiveId.RightBottom]: 'se-resize',

  [InteractiveId.LeftCenter]: 'w-resize',
  [InteractiveId.RightCenter]: 'e-resize',
  [InteractiveId.TopCenter]: 'n-resize',
  [InteractiveId.BottomCenter]: 's-resize',
};

type InteractiveItem = {
  type: 'corner' | 'border';
  id: InteractiveId;
  transform: UITransform;
};

// 按照交互设计优先级 右下角 > 右上角 > 左下角 > 左上角 > 右边框 > 下边框 > 上边框 > 左边框 的反向顺序创建
const ITEMS: InteractiveItem[] = [
  // 左边框
  {
    id: InteractiveId.Left,
    type: 'border',
    transform: {
      position: {
        ratio: [0, 0],
        offset: [-1, 0],
      },
      size: {
        ratio: [0, 1],
        offset: [1, 0],
      },
    },
  },
  // 上边框
  {
    id: InteractiveId.Top,
    type: 'border',
    transform: {
      position: {
        ratio: [0, 0],
        offset: [0, -1],
      },
      size: {
        ratio: [1, 0],
        offset: [0, 1],
      },
    },
  },
  // 下边框
  {
    id: InteractiveId.Bottom,
    type: 'border',
    transform: {
      position: {
        ratio: [0, 1],
        offset: [0, 1],
      },
      size: {
        ratio: [1, 0],
        offset: [0, 1],
      },
    },
  },
  // 右边框
  {
    id: InteractiveId.Right,
    type: 'border',
    transform: {
      position: {
        ratio: [1, 0],
        offset: [1, 0],
      },
      size: {
        ratio: [0, 1],
        offset: [1, 0],
      },
    },
  },
  // 左上角
  {
    id: InteractiveId.LeftTop,
    type: 'corner',
    transform: {
      position: {
        ratio: [0, 0],
        offset: [-1, -1],
      },
      size: {
        offset: CORNER_SIZE,
        ratio: [0, 0],
      },
    },
  },
  // 左下角
  {
    id: InteractiveId.LeftBottom,
    type: 'corner',
    transform: {
      position: {
        ratio: [0, 1],
        offset: [-1, 0],
      },
      size: {
        offset: CORNER_SIZE,
        ratio: [0, 0],
      },
    },
  },
  // 右上角
  {
    id: InteractiveId.RightTop,
    type: 'corner',
    transform: {
      position: {
        ratio: [1, 0],
        offset: [0, -1],
      },
      size: {
        offset: CORNER_SIZE,
        ratio: [0, 0],
      },
    },
  },
  // 右下角
  {
    id: InteractiveId.RightBottom,
    type: 'corner',
    transform: {
      position: {
        ratio: [1, 1],
        offset: [0, 0],
      },
      size: {
        offset: CORNER_SIZE,
        ratio: [0, 0],
      },
    },
  },

  // 受限制
  // 左中
  {
    id: InteractiveId.LeftCenter,
    type: 'corner',
    transform: {
      position: {
        ratio: [0, 0.5],
        offset: [-1, -1],
      },
      size: {
        offset: CORNER_SIZE,
        ratio: [0, 0],
      },
    },
  },
  // 上中
  {
    id: InteractiveId.TopCenter,
    type: 'corner',
    transform: {
      position: {
        ratio: [0.5, 0],
        offset: [-1, 0],
      },
      size: {
        offset: CORNER_SIZE,
        ratio: [0, 0],
      },
    },
  },
  // 右中
  {
    id: InteractiveId.RightCenter,
    type: 'corner',
    transform: {
      position: {
        ratio: [1, 0.5],
        offset: [0, -1],
      },
      size: {
        offset: CORNER_SIZE,
        ratio: [0, 0],
      },
    },
  },
  // 下中
  {
    id: InteractiveId.BottomCenter,
    type: 'corner',
    transform: {
      position: {
        ratio: [0.5, 1],
        offset: [0, 0],
      },
      size: {
        offset: CORNER_SIZE,
        ratio: [0, 0],
      },
    },
  },
];

/**
 * 交互热区扩展距离，在原有尺寸上增加5px
 */
const HIT_AREA_OFFSET = 5;

interface Spec extends BaseSpec {
  getRenderableNode: GetRenderableNode;
  dragControls: DragControls;
  transformManager: TransformManager;
  getContext: GetContext;
  getParentLayoutData: GetParentLayoutData;
  loadTextFontFace: LoadTextFontFace;
  richTextParser: RichTextParser;
}

export class SelectBox extends GameUIRenderable implements ISelectBox {
  public readonly id = 'selectBox';

  private getRenderableNode: GetRenderableNode;

  private getParentLayoutData: GetParentLayoutData;

  private dragControls: DragControls;

  public eventMode = EventMode.Passive;

  public children: GameUINode[] = [];

  private isDragging = false;

  private transformManager: TransformManager;

  public sizeLabel: SizeLabel;
  public renderSizeLabel = true;

  public measureTool: MeasureTool;

  public customLayout: boolean = true;

  /**
   * 以子元素id为key，子元素节点为value的字典
   * 用于控制各个交互点的显示、是否可交互的逻辑。
   */
  private childrenRecord: Record<string, Item> = {};

  constructor(spec: Spec) {
    const {
      getRenderableNode,
      dragControls,
      transformManager,
      getContext,
      getParentLayoutData,
      loadTextFontFace,
      richTextParser,
      ...base
    } = spec;

    super(base);

    this.getRenderableNode = getRenderableNode;
    this.getParentLayoutData = getParentLayoutData;
    this.dragControls = dragControls;
    this.transformManager = transformManager;

    ITEMS.forEach(({ id, type, transform }) => {
      const item = type === 'corner' ? new Corner({ id }) : new Item({ id });

      const { position, size } = transform;
      const { position: destPos, size: destSize } = item.transform;

      vec2.copy(destPos.offset, position.offset);
      vec2.copy(destPos.ratio, position.ratio);
      vec2.copy(destSize.offset, size.offset);
      vec2.copy(destSize.ratio, size.ratio);

      this.add(item);

      this.childrenRecord[id] = item;
    });

    this.sizeLabel = new SizeLabel({
      getContext,
      id: 'selectBoxSize',
      loadTextFontFace,
      richTextParser,
    });
    this.add(this.sizeLabel);

    this.measureTool = new MeasureTool({
      id: 'selectBoxMeasure',
      getContext,
      getRenderableNode,
      getParentLayoutData: this.getParentLayoutData,
      loadTextFontFace,
      richTextParser,
    });
    this.add(this.measureTool);

    this.addListeners();
  }

  public shouldUpdateAbsData = true;

  public cornersVisible = true;

  public onBeforeAbsDataUpdate() {
    if (!this.shouldUpdateAbsData) {
      return;
    }

    const { selectedIds } = store.getState().gameUI;

    this.sizeLabel.visible =
      this.renderSizeLabel && selectedIds.length === 1 && !hasAbsRotation(this);

    if (selectedIds.length === 0) {
      return;
    }

    vec2.set(this.layoutPosition, Infinity, Infinity);
    vec2.set(TEMP_BOTTOM_RIGHT, -Infinity, -Infinity);

    let verticalEnabled = true;
    let horizontalEnabled = true;

    let hasVisibleNode = false;

    if (selectedIds.length > 1) {
      this.rotation = 0;

      selectedIds.forEach((id) => {
        const node = this.getRenderableNode(id);

        if (!node || !node.visible) {
          return;
        }

        hasVisibleNode = true;

        const { matrixWorld, rotatePivot, absSize } = node;

        positionReverseRotation(TEMP_OFFSET_RATIO, matrixWorld, rotatePivot);

        vec2.min(this.layoutPosition, this.layoutPosition, TEMP_OFFSET_RATIO);

        vec2.add(this.absSize, absSize, TEMP_OFFSET_RATIO);
        vec2.max(TEMP_BOTTOM_RIGHT, TEMP_BOTTOM_RIGHT, this.absSize);

        if (node.parent && node.parent.components.uiAutoLayout) {
          if (horizontalEnabled) {
            horizontalEnabled =
              !node.parent.components.uiAutoLayout.columnWidthEnabled;
          }
          if (verticalEnabled) {
            verticalEnabled =
              !node.parent.components.uiAutoLayout.lineHeightEnabled;
          }
        }
      });

      vec2.sub(this.absSize, TEMP_BOTTOM_RIGHT, this.layoutPosition);
      vec2.copy(this.position, this.layoutPosition);
    } else {
      const node = this.getRenderableNode(selectedIds[0]);

      if (node && node.visible) {
        hasVisibleNode = true;

        parseWorldLayout(this, node);

        if (node.parent && node.parent.components.uiAutoLayout) {
          if (horizontalEnabled) {
            horizontalEnabled =
              !node.parent.components.uiAutoLayout.columnWidthEnabled;
          }
          if (verticalEnabled) {
            verticalEnabled =
              !node.parent.components.uiAutoLayout.lineHeightEnabled;
          }
        }
      }
    }

    if (!hasVisibleNode) {
      vec2.zero(this.layoutPosition);
      vec2.zero(this.absSize);
    }

    if (!this.cornersVisible) {
      [
        InteractiveId.LeftTop,
        InteractiveId.LeftBottom,
        InteractiveId.RightTop,
        InteractiveId.RightBottom,
        InteractiveId.LeftCenter,
        InteractiveId.RightCenter,
        InteractiveId.TopCenter,
        InteractiveId.BottomCenter,
      ].forEach((id) => {
        this.childrenRecord[id].visible = false;
      });
    } else if (!verticalEnabled || !horizontalEnabled) {
      // 四个角全隐藏
      [
        InteractiveId.LeftTop,
        InteractiveId.RightTop,
        InteractiveId.LeftBottom,
        InteractiveId.RightBottom,
      ].forEach((id) => {
        this.childrenRecord[id].visible = false;
      });

      // 居中的方块按条件显示
      // 水平方向可调整
      if (horizontalEnabled) {
        [InteractiveId.LeftCenter, InteractiveId.RightCenter].forEach((id) => {
          this.childrenRecord[id].visible = true;
        });
        [InteractiveId.Left, InteractiveId.Right].forEach((id) => {
          this.childrenRecord[id].eventMode = EventMode.Interactive;
        });
      } else {
        [InteractiveId.LeftCenter, InteractiveId.RightCenter].forEach((id) => {
          this.childrenRecord[id].visible = false;
        });
        [InteractiveId.Left, InteractiveId.Right].forEach((id) => {
          this.childrenRecord[id].eventMode = EventMode.None;
        });
      }

      // 垂直方向
      if (verticalEnabled) {
        [InteractiveId.TopCenter, InteractiveId.BottomCenter].forEach((id) => {
          this.childrenRecord[id].visible = true;
        });
        [InteractiveId.Top, InteractiveId.Bottom].forEach((id) => {
          this.childrenRecord[id].eventMode = EventMode.Interactive;
        });
      } else {
        [InteractiveId.TopCenter, InteractiveId.BottomCenter].forEach((id) => {
          this.childrenRecord[id].visible = false;
        });
        [InteractiveId.Top, InteractiveId.Bottom].forEach((id) => {
          this.childrenRecord[id].eventMode = EventMode.None;
        });
      }
    } else {
      // 四个角全显示，隐藏居中的方块
      [
        InteractiveId.LeftTop,
        InteractiveId.RightTop,
        InteractiveId.LeftBottom,
        InteractiveId.RightBottom,
      ].forEach((id) => {
        this.childrenRecord[id].visible = true;
      });
      [
        InteractiveId.LeftCenter,
        InteractiveId.TopCenter,
        InteractiveId.RightCenter,
        InteractiveId.BottomCenter,
      ].forEach((id) => {
        this.childrenRecord[id].visible = false;
      });
      // 四条边全都可交互
      [
        InteractiveId.Left,
        InteractiveId.Top,
        InteractiveId.Right,
        InteractiveId.Bottom,
      ].forEach((id) => {
        this.childrenRecord[id].eventMode = EventMode.Interactive;
      });
    }
  }

  public draw(context: CanvasRenderingContext2D, dpr: number): void {
    const { selectedIds } = store.getState().gameUI;

    if (selectedIds.length === 0) {
      return;
    }

    context.beginPath();

    if (selectedIds.length > 1) {
      selectedIds.forEach((id) => {
        const node = this.getRenderableNode(id);

        if (!node || !node.visible) {
          return;
        }

        const { rotatePivot, absSize, matrixWorld } = node;

        setTransformByMat2d(context, matrixWorld, dpr);

        drawWhiteBlueOutline({
          context,
          pivot: rotatePivot,
          size: absSize,
        });
      });
    }

    setTransformByMat2d(context, this.matrixWorld, dpr);

    drawWhiteBlueOutline({
      context,
      pivot: this.rotatePivot,
      size: this.absSize,
    });

    context.closePath();
  }

  private addListeners() {
    this.dragControls.addListener('dragStart', this.onDragStart);
    this.dragControls.addListener('drag', this.onDrag);
    this.dragControls.addListener('dragEnd', this.onDragEnd);
  }

  private updateCursorStyle(id?: string) {
    const cursor = id ? CURSOR_MAP[id] : undefined;

    document.body.style.cursor = cursor || 'auto';
  }

  private onDragStart = (e: UIDragEvent) => {
    const { selectedIds } = store.getState().gameUI;

    const [node] = e.nodes;

    if (!selectedIds.length || !node || !this.children.includes(node)) {
      return;
    }

    this.isDragging = true;

    this.updateCursorStyle(node.id);

    this.updateMovementRatio(
      {
        sizeRatio: TEMP_SIZE_RATIO,
        offsetRatio: TEMP_OFFSET_RATIO,
      },
      node.id,
    );

    this.transformManager.start({
      mouse: e.mouse,
      offsetRatio: TEMP_OFFSET_RATIO,
      sizeRatio: TEMP_SIZE_RATIO,
      type: 'size',
    });
  };

  private onDrag = (e: UIDragEvent) => {
    this.isDragging && this.transformManager.drag({ mouse: e.mouse });
  };

  private onDragEnd = () => {
    if (!this.isDragging) {
      return;
    }

    this.isDragging = false;
    this.transformManager.end();
    this.updateCursorStyle();
  };

  private updateMovementRatio(
    out: { sizeRatio: vec2; offsetRatio: vec2 },
    id: string,
  ) {
    let sizeX = 0;
    let sizeY = 0;
    let posX = 0;
    let posY = 0;

    switch (id) {
      case InteractiveId.Left:
      case InteractiveId.LeftCenter:
        sizeX = -1;
        posX = 1;
        break;
      case InteractiveId.Top:
      case InteractiveId.TopCenter:
        sizeY = -1;
        posY = 1;
        break;
      case InteractiveId.Bottom:
      case InteractiveId.BottomCenter:
        sizeY = 1;
        break;
      case InteractiveId.Right:
      case InteractiveId.RightCenter:
        sizeX = 1;
        break;
      case InteractiveId.LeftTop:
        sizeX = -1;
        sizeY = -1;
        posX = 1;
        posY = 1;
        break;
      case InteractiveId.LeftBottom:
        sizeX = -1;
        sizeY = 1;
        posX = 1;
        break;
      case InteractiveId.RightTop:
        sizeX = 1;
        sizeY = -1;
        posY = 1;
        break;
      case InteractiveId.RightBottom:
        sizeX = 1;
        sizeY = 1;
        break;
    }

    vec2.set(out.sizeRatio, sizeX, sizeY);
    vec2.set(out.offsetRatio, posX, posY);
  }
}

/**
 * 选中框的子元素
 * - 自定义交互热区
 */
export class Item extends GameUIRenderable {
  public readonly hitArea: HitArea = {
    size: [0, 0],
    matrixWorld: mat2d.create(),
    rotatePivot: [0, 0],
  };

  public onAfterReflow(): void {
    mat2d.copy(this.hitArea.matrixWorld, this.matrixWorld);

    vec2.copy(this.hitArea.rotatePivot, this.rotatePivot);

    vec2.add(this.hitArea.size, this.absSize, [
      HIT_AREA_OFFSET * 2,
      HIT_AREA_OFFSET * 2,
    ]);
  }
}

/**
 * 四个角
 */
class Corner extends Item {
  public anchor: vec2 = [0.5, 0.5];

  public draw(context: CanvasRenderingContext2D, dpr: number): void {
    context.beginPath();

    setTransformByMat2d(context, this.matrixWorld, dpr);

    const x = -this.rotatePivot[0];
    const y = -this.rotatePivot[1];
    const [w, h] = this.absSize;

    context.fillStyle = CORNER_BG_COLOR;
    context.fillRect(x, y, w, h);

    drawOutline({
      context,
      pivot: this.rotatePivot,
      size: [w, h],
      outline: {
        width: 1,
        color: CORNER_BORDER_COLOR,
        offset: 0,
      },
    });

    context.closePath();
  }
}
