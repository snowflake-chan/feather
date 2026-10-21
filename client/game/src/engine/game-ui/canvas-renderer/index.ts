import type { GameUINode } from '../nodes/base';
import type { GameUILayout } from '../layout';
import { getSortedChildNodes, isRenderable } from '../util';
import type { GameUIScreen } from '../nodes/screen';
import {
  setTransformByMat2d,
  setTransformByScale,
} from 'src/engine/utils/canvas';

type RenderParams = {
  context: CanvasRenderingContext2D;
  root: GameUIScreen;
  layout: GameUILayout;
};

export class GameUICanvasRenderer {
  private devicePixelRatio = 1;

  public render(params: RenderParams) {
    const { root, context, layout } = params;

    this.devicePixelRatio = window.devicePixelRatio || 1;

    setTransformByScale(context, this.devicePixelRatio);

    layout.layout(root);

    this.renderNode(context, root);
  }

  private renderNode(context: CanvasRenderingContext2D, node: GameUINode) {
    if (!node.visible) {
      return;
    }

    let toRestore = false;

    if (isRenderable(node)) {
      setTransformByMat2d(context, node.matrixWorld, this.devicePixelRatio);

      if (node.clipsDescendants) {
        toRestore = true;

        context.save();

        const path = new Path2D();

        path.rect(
          -node.rotatePivot[0],
          -node.rotatePivot[1],
          node.absSize[0],
          node.absSize[1],
        );

        context.clip(path);
      }

      node.draw(context, this.devicePixelRatio);

      setTransformByScale(context, this.devicePixelRatio);
    }

    const sorted = getSortedChildNodes(node);

    if (sorted?.length > 0) {
      for (let i = sorted.length - 1; i >= 0; i--) {
        this.renderNode(context, sorted[i]);
      }
    }

    if (toRestore) {
      context.restore();
    }
  }
}
