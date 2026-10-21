import type { BaseSpec } from 'src/engine/game-ui/nodes/base';
import { store } from 'src/redux/edit';
import { drawWhiteBlueOutline } from './outline';
import { EventMode } from 'src/engine/game-ui/nodes/defs';
import { SizeLabel } from './size-label';
import type { GetContext } from 'src/engine/game-ui/nodes/interface';
import { GameUIRenderable } from 'src/engine/game-ui/nodes/renderable';
import {
  hasAbsRotation,
  isRenderable,
  parseWorldLayout,
} from 'src/engine/game-ui/util';
import type { GetRenderableNode } from './defs';
import type { LoadTextFontFace } from 'src/engine/game-ui/nodes/text';
import type { RichTextParser } from 'src/engine/game-ui/nodes/rich-text-parser';
import { setTransformByMat2d } from 'src/engine/utils/canvas';

interface Spec extends BaseSpec {
  getRenderableNode: GetRenderableNode;
  getContext: GetContext;
  loadTextFontFace: LoadTextFontFace;
  richTextParser: RichTextParser;
}

export class HoverBox extends GameUIRenderable {
  private getRenderableNode: GetRenderableNode;

  public eventMode = EventMode.None;

  public customLayout: boolean = true;

  private sizeLabel: SizeLabel;

  constructor(spec: Spec) {
    const {
      getRenderableNode: getNode,
      getContext,
      loadTextFontFace,
      richTextParser,
      ...base
    } = spec;

    super(base);

    this.getRenderableNode = getNode;

    this.sizeLabel = new SizeLabel({
      getContext,
      id: 'hoverBoxSize',
      loadTextFontFace,
      richTextParser,
    });

    this.add(this.sizeLabel);
  }

  public onBeforeAbsDataUpdate() {
    const { hoveredId } = store.getState().gameUI;

    const node = hoveredId ? this.getRenderableNode(hoveredId) : undefined;

    if (!node || !isRenderable(node)) {
      this.sizeLabel.visible = false;
      return;
    }

    this.sizeLabel.visible = !hasAbsRotation(node);

    parseWorldLayout(this, node);
  }

  public draw(context: CanvasRenderingContext2D, dpr: number): void {
    const { hoveredId } = store.getState().gameUI;

    if (!hoveredId) {
      return;
    }

    const node = this.getRenderableNode(hoveredId);

    if (!node) {
      return;
    }

    setTransformByMat2d(context, node.matrixWorld, dpr);

    context.beginPath();

    drawWhiteBlueOutline({
      context,
      pivot: this.rotatePivot,
      size: this.absSize,
    });

    context.closePath();
  }
}
