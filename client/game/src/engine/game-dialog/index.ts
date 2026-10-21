import {
  InputDialogConfig,
  SelectDialogConfig,
  TextDialogConfig,
} from '@box/schema/dialog/dialog-protocol';
import { GameClientState } from '../game-client-schema';
import { InputController } from '../input/input-controller';
import { Dialog, InteractivePanel, InteractiveType, Spec } from './interface';
import { TextDialog } from './text-dialog';
import {
  GameElement,
  GameElementType,
  GameTouchesEvent,
  IntersectElementsFun,
  PointerEventType,
} from '../input/events';
import { SerializedVec2 } from '../interfaces';
import { SelectDialog } from './select-dialog';
import { InputDialog } from './input';
import {
  contentPadding,
  drawBackground,
  drawCloseButton,
  drawTitle,
  maxWidth,
  minHeight,
  parseCommonConfigColor,
  radiusHeight,
  scrollbarWidth,
  fontSize,
  hitTest,
  TAP_TIME,
  widthPadding,
  minWidth,
  getMaxHeightRatioAndBottom,
} from './util';
import {
  drawRoundRect,
  setTransformByScale,
  wrapTextBreakAll,
} from '../utils/canvas';
import { InputPauseFlags } from '@box/schema/input/input-schema';

class CloseButton extends InteractivePanel {
  public interactiveType: InteractiveType = InteractiveType.CloseButton;
}

class Content extends InteractivePanel {
  public interactiveType: InteractiveType = InteractiveType.Content;
}

class Scrollbar extends InteractivePanel {
  public interactiveType: InteractiveType = InteractiveType.Scrollbar;
  public barRatio = 1;
}

type DialogRenderer =
  | Dialog<InputDialogConfig>
  | Dialog<SelectDialogConfig>
  | Dialog<TextDialogConfig>;

export class GameDialog {
  private state: GameClientState;
  private input: InputController;

  private closeButton: CloseButton = new CloseButton();
  private content: Content = new Content();
  private scrollbar = new Scrollbar();
  private scrollY: number = 0;

  private isPointerdownScrollbar: boolean = false;
  private hoveringScrollbar: boolean = false;
  private isTouchstartContent: boolean = false;

  private textDialog: TextDialog;
  private selectDialog: SelectDialog;
  private inputDialog: InputDialog;

  private dialogRenderer?: DialogRenderer;
  private touchIdentifier?: number;
  private touchstartTime = 0;

  constructor(spec: Spec) {
    const { state, input } = spec;
    this.state = state;
    this.input = input;

    this.textDialog = new TextDialog(spec);
    this.selectDialog = new SelectDialog(spec);
    this.inputDialog = new InputDialog(spec);

    this.input.unlockedWheel.sub((ev) => {
      if (this.includesContent(ev.targets)) {
        this.scrollY += ev.deltaY;
        this.dialogRenderer?.onMove?.(ev.targets);
      }
    });
    this.input.unlockedClick.sub((ev) => {
      this.dialogRenderer?.onClick?.(ev.targets);
    });

    this.input.unlockedMouseDown.sub((ev) => {
      this.isPointerdownScrollbar = this.isHitScrollbar(ev.targets);
    });
    this.input.unlockedMouseMove.sub((ev) => {
      this.dialogRenderer?.onMove?.(ev.targets);

      this.hoveringScrollbar = this.isHitScrollbar(ev.targets);

      if (this.isPointerdownScrollbar) {
        this.scrollY += ev.movement[1] / this.scrollbar.barRatio;
      }
    });
    this.input.unlockedMouseUp.sub(() => {
      this.isPointerdownScrollbar = false;
    });

    this.input.touchStart.sub((ev) => {
      this.touchstartTime = this.state.clock.clock;
      const res = this.getGameDialogElements(ev);
      if (!res) {
        return;
      }

      this.touchIdentifier = res.identifier;

      this.dialogRenderer?.onMove?.(res.elements);
      this.isPointerdownScrollbar = this.isHitScrollbar(res.elements);
      this.hoveringScrollbar = this.isPointerdownScrollbar;

      if (this.isPointerdownScrollbar) {
        return;
      }
      this.isTouchstartContent = this.includesContent(res.elements);
    });

    this.input.touchMove.sub((ev) => {
      const touch = ev.touches.find(
        (t) => t.identifier === this.touchIdentifier,
      );
      if (!touch) {
        return;
      }

      this.dialogRenderer?.onMove?.(touch.targets);

      if (this.isPointerdownScrollbar) {
        this.scrollY += touch.movement[1] / this.scrollbar.barRatio;
        return;
      }

      if (this.isTouchstartContent) {
        this.scrollY -= touch.movement[1];
      }
    });

    this.input.touchEnd.sub((ev) => {
      if (this.state.clock.clock - this.touchstartTime < TAP_TIME) {
        const res = this.getGameDialogElements(ev);
        if (res) {
          this.dialogRenderer?.onClick?.(res.elements);
        }
      }
      this.dialogRenderer?.onMove?.([]);
      this.hoveringScrollbar = false;
      this.isPointerdownScrollbar = false;
      this.isTouchstartContent = false;
      this.touchIdentifier = undefined;
    });
  }

  private isHitScrollbar(targets: GameElement[]) {
    const interactive = targets[0] as InteractivePanel;
    return (
      interactive && interactive.interactiveType === InteractiveType.Scrollbar
    );
  }

  private includesContent(targets: GameElement[]) {
    return !!targets.find(
      (e) =>
        (e as InteractivePanel).interactiveType === InteractiveType.Content,
    );
  }

  private getGameDialogElements(event: GameTouchesEvent):
    | {
        identifier: number;
        elements: GameElement[];
      }
    | undefined {
    const { touches } = event;
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];

      const elements = touch.targets.filter(
        (t) => t.elementType === GameElementType.GameDialog,
      );

      if (elements.length) {
        return {
          identifier: touch.identifier,
          elements,
        };
      }
    }
    return;
  }

  public intersectElements: IntersectElementsFun<GameElement> = (
    out: GameElement[],
    pos: SerializedVec2,
    eventType: PointerEventType,
  ) => {
    if (!this.state.dialog.dialogQueue.length) {
      return true;
    }

    this.dialogRenderer?.intersect?.(out, pos);

    if (hitTest(pos, this.closeButton.getHitArea())) {
      out.push(this.closeButton);
    }

    if (hitTest(pos, this.scrollbar.getHitArea())) {
      out.push(this.scrollbar);
    }

    if (hitTest(pos, this.content.getHitArea())) {
      out.push(this.content);
    }

    switch (this.state.dialog.dialogQueue[0].config.type) {
      case 'text':
        out.push(this.textDialog);
        break;
      case 'select':
        out.push(this.selectDialog);
        break;
      case 'input':
        out.push(this.inputDialog);
        break;
    }

    return !out.length;
  };

  private getScreenWH() {
    const ratio = window.devicePixelRatio || 1;
    return {
      screenWidth: (this.state.overlays.context?.canvas.width || 0) / ratio,
      screenHeight: (this.state.overlays.context?.canvas.height || 0) / ratio,
      ratio,
    };
  }

  public render() {
    this.closeButton.destroy();
    this.content.destroy();
    this.scrollbar.destroy();

    if (!this.state.dialog.dialogQueue.length) {
      if (this.dialogRenderer) {
        this.dialogRenderer.destroy();
        this.dialogRenderer = undefined;
        this.scrollY = 0;
        this.input.pauseChange(
          InputPauseFlags.KEYBOARD,
          InputPauseFlags.RELEASE,
        );
      }
      return;
    }
    const context2D = this.state.overlays.context;
    if (!context2D) {
      return;
    }

    const dialog = this.state.dialog.dialogQueue[0];
    let renderer: DialogRenderer;
    switch (dialog.config.type) {
      case 'text':
        renderer = this.textDialog;
        renderer.setDialogSchema({
          rpcId: dialog.rpcId,
          config: dialog.config.data as TextDialogConfig,
        });
        break;
      case 'select':
        renderer = this.selectDialog;
        renderer.setDialogSchema({
          rpcId: dialog.rpcId,
          config: dialog.config.data as SelectDialogConfig,
        });
        break;
      case 'input':
        renderer = this.inputDialog;
        renderer.setDialogSchema({
          rpcId: dialog.rpcId,
          config: dialog.config.data as InputDialogConfig,
        });
        break;
      default:
        return;
    }

    if (!this.dialogRenderer) {
      this.input.pauseChange(InputPauseFlags.RELEASE, InputPauseFlags.KEYBOARD);
      this.input.exitPointerLock();
    }
    this.dialogRenderer = renderer;

    const { ratio, screenWidth, screenHeight } = this.getScreenWH();
    const { maxHeightRatio, bottom } = getMaxHeightRatioAndBottom();

    setTransformByScale(context2D, ratio);

    const { titleColor, contentColor } = parseCommonConfigColor(
      dialog.config.data.common,
    );
    const { title, content } = dialog.config.data.common;

    context2D.font = `${fontSize}px Rubik, MiSans, Montserrat-Regular`;
    context2D.textAlign = 'left';

    const fitWidth = screenWidth - widthPadding;
    const width = Math.max(minWidth, Math.min(maxWidth, fitWidth));
    const maxContentWidth = width - radiusHeight * 2 - contentPadding * 2;

    const { lines, maxLineWidth } = wrapTextBreakAll(
      context2D,
      content,
      maxContentWidth,
    );
    const {
      contentHeight,
      contentWidth: rendererContentWidth,
      minContentHeight: rendererMinContentHeight,
    } = this.dialogRenderer.getContentWH(context2D, lines, maxContentWidth);

    let contentWidth = Math.min(maxContentWidth, maxLineWidth);
    // 如果有返回指定的文本宽度，直接使用指定的文本宽度
    if (rendererContentWidth !== undefined) {
      contentWidth = rendererContentWidth;
    }

    let minBgHeight = minHeight;
    // 如果有返回指定的文本最小高度，以返回值为准
    if (rendererMinContentHeight !== undefined) {
      minBgHeight =
        rendererMinContentHeight + radiusHeight * 2 + contentPadding * 2;
    }

    const bgHeight = Math.max(
      Math.min(
        contentHeight + radiusHeight * 2 + contentPadding * 2,
        screenHeight * maxHeightRatio,
      ),
      minBgHeight,
    );

    const x = screenWidth / 2 - width / 2;
    const y = screenHeight - bottom - bgHeight;

    drawBackground(context2D, x, y, width, bgHeight, contentColor.background);

    const maxContentX = x + radiusHeight + contentPadding;
    const contentX =
      maxContentX +
      (maxContentWidth - Math.min(contentWidth, maxContentWidth)) / 2;
    const contentY = y + radiusHeight + contentPadding;
    const { clipHeight, scrollY, scrollbarHeight, scrollbarPositionY } =
      this.dialogRenderer.drawContent(
        context2D,
        contentX,
        maxContentX,
        contentY,
        contentWidth,
        maxContentWidth,
        maxLineWidth,
        bgHeight,
        lines,
        contentColor.text,
        contentHeight,
        this.scrollY,
      );

    this.scrollY = scrollY;

    this.content.setHitArea({
      x: contentX,
      y: contentY,
      w: contentWidth,
      h: clipHeight,
    });

    if (scrollbarHeight) {
      context2D.beginPath();
      context2D.fillStyle = this.hoveringScrollbar
        ? 'rgba(175, 175, 175, 0.6)'
        : 'rgba(255, 255, 255, 0.6)';
      drawRoundRect(
        context2D,
        contentX + contentWidth,
        scrollbarPositionY,
        scrollbarWidth,
        scrollbarHeight,
        scrollbarWidth / 2,
      );
      context2D.fill();
      context2D.closePath();

      this.scrollbar.setHitArea({
        x: contentX + contentWidth,
        y: scrollbarPositionY,
        w: scrollbarWidth,
        h: scrollbarHeight,
      });
      this.scrollbar.barRatio = scrollbarHeight / clipHeight;
    }

    if (title) {
      drawTitle(
        context2D,
        x,
        y,
        title,
        titleColor.background,
        titleColor.text,
        width,
      );
    }

    this.closeButton.setHitArea(drawCloseButton(context2D, x, y, width));
  }
}
