import { vec2, vec3 } from 'gl-matrix';
import { nanoid } from 'nanoid/non-secure';
import { equals, pick } from 'ramda';
import {
  AutoResizeType,
  TextXAlignType,
  TextYAlignType,
  UITextFontFamily,
} from '@box/schema/project/ui-rda/defs';
import type { GetContext } from './interface';
import type { BaseSpec } from './base';
import { getTextFont, maxByAutoResize } from '../util';
import { GameUIRenderable } from './renderable';
import { drawRoundRect } from 'src/engine/utils/canvas';
import { UiText } from 'src/engine/script/ses/apis/gui/ui-text';
import {
  FontStyle,
  isTextNode,
  RichTextNodeAttributes,
  StrokeStyle,
  TEXT_NODE_NAME,
  type RichTextNode,
  type RichTextParser,
} from './rich-text-parser';
import {
  computeHangingBaseline,
  fontAscenderToAscent,
  getFontMetaData,
} from './fonts';

export const TEXT_ALIGN_MAP: Record<TextXAlignType, string> = {
  [TextXAlignType.Center]: 'center',
  [TextXAlignType.Left]: 'left',
  [TextXAlignType.Right]: 'right',
};

const NEW_LINE_EXP = /\n/g;

/**
 * 文本节点位移尺寸信息更新时的回调
 */
export type TextTransformUpdateCallback = (node: GameUIText) => void;

/**
 * 每一行的文本数据
 */
type ContentLine = {
  /**
   * 当前行总宽度
   */
  width: number;
  /**
   * 当前行的高度，取当前行的最高的内容高度
   */
  height: number;
  /**
   * 字体上升线的高度，取当前行的最高的上升线
   */
  fontAscent: number;
  /**
   * 字体顶部的留白
   */
  leading: number;
  /**
   * 由于富文本的存在，一行中可能存在不同样式
   */
  contents: ContentNode[];
};

type ContentNode = {
  text: string;
  style: ContentLineNodeStyle;
  width: number;
  height: number;
};

export type ContentLineNodeStyle = {
  font: FontStyle;
  stroke: StrokeStyle;
};

export type LoadTextFontFace = (fontFamily: UITextFontFamily) => void;

export interface Spec extends BaseSpec {
  getContext: GetContext;
  loadTextFontFace: LoadTextFontFace;
  richTextParser: RichTextParser;
}

export class GameUIText extends GameUIRenderable {
  protected ApiType = UiText;

  public _api: InstanceType<typeof this.ApiType> | undefined;

  public api() {
    if (!this._api) {
      this._api = new this.ApiType(this);
    }

    return this._api;
  }

  public textContent: string = '';

  public readonly textColor = vec3.create();

  public textOpacity = 1;

  public textFontSize = 14;

  public textXAlignment = TextXAlignType.Center;
  public textYAlignment = TextYAlignType.Center;

  /**
   * 自动换行
   */
  public autoWordWrap = false;

  public borderRadius?: number;

  /**
   * 所有文本（单行、多行）构成的最小包围盒左上角的本地坐标（以旋转轴心为[0, 0]）
   */
  public readonly contentPosition = vec2.create();
  /**
   * 所有文本（单行、多行）构成的最小包围盒的尺寸。
   */
  public readonly contentSize = vec2.create();

  protected getContext: GetContext;

  /**
   * 是否绘制文本内容
   * 进入编辑状态时会禁止绘制文本，避免误差导致重影
   */
  public renderContent = true;

  public transformUpdateCallback?: TextTransformUpdateCallback;

  /**
   * 在updateContentSize时，会把单行文本解析为多行文本。
   * 存储至该数组。方便复用
   */
  protected contentLines: ContentLine[] = [];
  /**
   * 在updateContentSize时，测量出行高。
   * 同个文本节点内容下，行高都是相同的，所以只存一个就可以。
   */
  public textLineHeight = 1;

  /**
   * 描边颜色
   */
  public readonly textStrokeColor = vec3.create();
  /**
   * 描边不透明度
   */
  public textStrokeOpacity = 1;
  /**
   * 描边厚度
   */
  public textStrokeThickness = 0;
  /**
   * 字体
   */
  public textFontFamily = UITextFontFamily.Default;

  private loadTextFontFace: LoadTextFontFace;

  /**
   * 是否开启富文本
   */
  public richText: boolean = false;

  protected readonly richTextParser: RichTextParser;

  private richTextNodes: RichTextNode[] = [];

  /**
   * 判断富文本是否需要重新解析的缓存
   */
  private richTextCache?: {
    input: string;
    richText: boolean;
  };

  private textStylesCache: Pick<
    CanvasRenderingContext2D,
    'font' | 'textBaseline' | 'textAlign'
  > = {
    font: '',
    textBaseline: 'middle',
    textAlign: 'center',
  };

  constructor(spec: Spec) {
    const { getContext, loadTextFontFace, richTextParser, ...base } = spec;

    super(base);

    this.getContext = getContext;

    this.loadTextFontFace = loadTextFontFace;

    this.richTextParser = richTextParser;
  }

  protected updateContentSize(applyScale: boolean, content?: string) {
    const context = this.getContext();
    if (!context) {
      return;
    }
    const text = content === undefined ? this.textContent : content;
    // 计算contentSize时，不一定是在render阶段，对context的修改需要还原
    this.saveContextTextStyle(context);

    this.parseContentLines(text, applyScale ? this.absScaleValue : 1);

    this.restoreContextTextStyle(context);
  }

  public updateContentPosition() {
    const x = -this.rotatePivot[0];
    const y = -this.rotatePivot[1];
    const [w, h] = this.absSize;
    const [contentWidth, contentHeight] = this.contentSize;

    let contentX = 0;
    let contentY = 0;

    // 根据对齐文本方式，计算文本的锚点坐标
    switch (this.textXAlignment) {
      case TextXAlignType.Left:
        contentX = contentWidth / 2;
        break;
      case TextXAlignType.Center:
        contentX = w / 2;
        break;
      case TextXAlignType.Right:
        contentX = w - contentWidth / 2;
        break;
    }

    switch (this.textYAlignment) {
      case TextYAlignType.Top:
        contentY = contentHeight / 2;
        break;
      case TextYAlignType.Center:
        contentY = h / 2;
        break;
      case TextYAlignType.Bottom:
        contentY = h - contentHeight / 2;
        break;
    }

    vec2.set(this.contentPosition, x + contentX, y + contentY);
    vec2.sub(this.contentPosition, this.contentPosition, [
      contentWidth / 2,
      contentHeight / 2,
    ]);

    this.transformUpdateCallback?.(this);
  }

  public draw(context: CanvasRenderingContext2D, dpr: number): void {
    context.beginPath();

    const [r, g, b] = this.backgroundColor;

    context.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.backgroundOpacity})`;

    const x = -this.rotatePivot[0];
    const y = -this.rotatePivot[1];
    const [w, h] = this.absSize;

    if (!this.borderRadius) {
      context.fillRect(x, y, w, h);
    } else {
      drawRoundRect(context, x, y, w, h, this.borderRadius);
      context.fill();
    }

    if (this.renderContent) {
      this.saveContextTextStyle(context);

      this.drawTextLines(context, true);

      this.restoreContextTextStyle(context);
    }

    context.closePath();
  }

  protected saveContextTextStyle(context: CanvasRenderingContext2D) {
    this.textStylesCache.font = context.font;
    this.textStylesCache.textAlign = context.textAlign;
    this.textStylesCache.textBaseline = context.textBaseline;
  }

  protected restoreContextTextStyle(context: CanvasRenderingContext2D) {
    context.font = this.textStylesCache.font;
    context.textAlign = this.textStylesCache.textAlign;
    context.textBaseline = this.textStylesCache.textBaseline;
  }

  protected setContextTextStyle(
    context: CanvasRenderingContext2D,
    fontSize: number,
    fontFamily?: UITextFontFamily,
  ) {
    const family = fontFamily ? fontFamily : this.textFontFamily;
    context.font = getTextFont(fontSize, family);
    context.textAlign = 'center';
    context.textBaseline = 'alphabetic';

    this.loadTextFontFace(fontFamily ? fontFamily : family);
  }

  /**
   * 绘制多行文本
   * @param context 画布上下文
   * @param enableStrokeText 是否绘制文本描边
   * @param overrideStyle 覆盖样式，用于“输入框元素”展示“提示文本”（placeholder）时，使用“提示文本样式”
   */
  protected drawTextLines(
    context: CanvasRenderingContext2D,
    enableStrokeText: boolean,
    overrideStyle?: ContentLineNodeStyle,
  ) {
    const fontSize = this.textFontSize * this.absScaleValue;

    this.setContextTextStyle(context, fontSize);

    const lineJoinCache = context.lineJoin;

    let totalLineHeight = 0;

    this.contentLines.forEach((line) => {
      // 以左上角为绘制起点，每一行可能有多个节点，需要逐个节点绘制
      let x = this.contentPosition[0];

      // 根据水平方向对齐方式计算
      switch (this.textXAlignment) {
        case TextXAlignType.Center:
          x += (this.contentSize[0] - line.width) / 2;
          break;
        case TextXAlignType.Right:
          x = x + this.contentSize[0] - line.width;
          break;
      }

      const leading = line.leading / 2;

      const y =
        this.contentPosition[1] +
        totalLineHeight +
        computeHangingBaseline(line.fontAscent) +
        leading;

      totalLineHeight += line.height;

      line.contents.forEach((cNode) => {
        const { style: nodeStyle, text, width } = cNode;

        let style = overrideStyle ? overrideStyle : nodeStyle;

        const fontSize = style.font.size * this.absScaleValue;

        const [r, g, b] = style.font.color;

        context.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.textOpacity})`;

        this.setContextTextStyle(context, fontSize);

        // TODO 兼容rusty，目前rusty没有strokeText接口
        if (
          context.strokeText &&
          enableStrokeText &&
          style.stroke.thickness > 0
        ) {
          /**
           * textStrokeThickness指的是外描边的厚度
           * 而strokeText是居中描边，因此用厚度乘以2，保证外描边的厚度符合期望
           */
          context.lineWidth = style.stroke.thickness * 2 * this.absScaleValue;
          context.lineJoin = 'round';

          const [r, g, b] = style.stroke.color;

          context.strokeStyle = `rgba(${r}, ${g}, ${b}, ${style.stroke.opacity})`;

          context.strokeText(text, x + width / 2, y);
        }

        context.fillText(text, x + width / 2, y);

        x += width;
      });
    });

    context.lineJoin = lineJoinCache;
  }

  /**
   * 根据文本行宽、内容区的x坐标和宽度、水平方向对齐方式计算文本行的x坐标
   * @param lineWidth 行宽
   */
  protected calcLineX(lineWidth: number) {
    switch (this.textXAlignment) {
      case TextXAlignType.Center:
        return this.contentPosition[0] + (this.contentSize[0] - lineWidth) / 2;
      case TextXAlignType.Right:
        return this.contentPosition[0] + this.contentSize[0] - lineWidth;
      default:
        return this.contentPosition[0];
    }
  }

  public copy(source: GameUIText) {
    super.copy(source);

    this.textContent = source.textContent;
    vec3.copy(this.textColor, source.textColor);
    this.textOpacity = source.textOpacity;
    this.textFontSize = source.textFontSize;
    this.textXAlignment = source.textXAlignment;
    this.textYAlignment = source.textYAlignment;
    this.autoWordWrap = source.autoWordWrap;
    this.textLineHeight = source.textLineHeight;

    vec3.copy(this.textStrokeColor, source.textStrokeColor);
    this.textStrokeOpacity = source.textStrokeOpacity;
    this.textStrokeThickness = source.textStrokeThickness;

    this.textFontFamily = source.textFontFamily;

    this.richText = source.richText;

    return this;
  }

  public clone() {
    return new (this.constructor as typeof GameUIText)({
      id: nanoid(),
      getContext: this.getContext,
      loadTextFontFace: this.loadTextFontFace,
      richTextParser: this.richTextParser,
    }).copy(this);
  }

  public onExpandByChildren(): void {
    this.updateContentSize(false);

    maxByAutoResize(
      this.absSize,
      this.absSize,
      this.contentSize,
      this.autoResize,
    );
  }

  public onAfterReflow(): void {
    this.updateContentSize(true);

    this.updateContentPosition();
  }

  /**
   * 对比富文本缓存，判断是否需要重新解析富文本
   */
  private richTextNeedsUpdate(input: string): boolean {
    const cache = {
      input,
      richText: this.richText,
    };

    let isEqual = false;

    if (this.richTextCache) {
      isEqual = equals(this.richTextCache, cache);

      Object.assign(this.richTextCache, cache);
    } else {
      isEqual = false;

      this.richTextCache = cache;
    }

    return isEqual;
  }

  private pickStyles(node: GameUIText): ContentLineNodeStyle {
    return {
      font: {
        color: node.textColor,
        size: node.textFontSize,
      },
      stroke: {
        color: node.textStrokeColor,
        thickness: node.textStrokeThickness,
        opacity: node.textStrokeOpacity,
      },
    };
  }

  private parseContentLines(input: string, scale: number) {
    this.parseRichTextNodes(input);

    const context = this.getContext();

    if (!context) {
      return;
    }

    this.contentLines.length = 0;

    vec2.zero(this.contentSize);

    let lineIdx = 0;

    // 自动换行在autoResize没有X的时候生效
    const toWrapText =
      this.autoWordWrap &&
      this.autoResize !== AutoResizeType.X &&
      this.autoResize !== AutoResizeType.XY;

    const rootStyle = this.pickStyles(this);

    const stylesStack: ContentLineNodeStyle[] = [rootStyle];

    const getCurrContentLine = (idx: number) => {
      let line = this.contentLines[idx];

      if (!line) {
        line = {
          width: 0,
          height: 0,
          fontAscent: 0,
          leading: 0,
          contents: [],
        };

        this.contentLines[idx] = line;
      }

      return line;
    };

    const onRichTextNode = (rtNode: RichTextNode) => {
      const curStyle = stylesStack[stylesStack.length - 1] || rootStyle;

      let newStyle: ContentLineNodeStyle | undefined;

      if (isTextNode(rtNode)) {
        const currContentLine = getCurrContentLine(lineIdx);

        const fontSize = curStyle.font.size * scale;

        this.setContextTextStyle(context, fontSize);

        const lineHeight = fontSize * this.textLineHeight;
        const leading = lineHeight - fontSize;

        const { header, horizontalHeader } = getFontMetaData(
          this.textFontFamily,
        );
        const fontAscent = fontAscenderToAscent(
          horizontalHeader.ascender,
          header.unitsPerEm,
          fontSize,
        );

        const lines = toWrapText
          ? wrapTextLinesBreakAll(
              context,
              rtNode.textContent,
              this.absSize[0],
              currContentLine.width,
            )
          : splitTextLines(context, rtNode.textContent);

        lines.forEach((line, i) => {
          const currContentLine = getCurrContentLine(lineIdx);

          currContentLine.contents.push({
            text: line.text,
            style: curStyle,
            width: line.width,
            height: lineHeight,
          });

          // 当前行可能已经有其他节点的文本，因此采用加算
          currContentLine.width += line.width;

          currContentLine.height = Math.max(currContentLine.height, lineHeight);
          currContentLine.fontAscent = Math.max(
            currContentLine.fontAscent,
            fontAscent,
          );
          currContentLine.leading = Math.max(currContentLine.leading, leading);

          this.contentSize[0] = Math.max(
            this.contentSize[0],
            currContentLine.width,
          );

          // 如果存在下一行，说明contentLines也要换行
          if (i !== lines.length - 1) {
            this.contentSize[1] += currContentLine.height;
            lineIdx++;
          }
        });
      } else {
        if (rtNode.nodeName in curStyle) {
          newStyle = {
            ...curStyle,
            [rtNode.nodeName]: mergeNodeStyle(
              curStyle[rtNode.nodeName],
              rtNode.attributes,
            ),
          };

          stylesStack.push(newStyle);
        }
      }

      rtNode.children.forEach(onRichTextNode);

      if (newStyle) {
        stylesStack.pop();
      }
    };

    this.richTextNodes.forEach(onRichTextNode);

    /**
     * 递归结束后，内容区总高度加上“最后一行”的高度
     * 在递归更新行的数据时，行高是在换行时确定最终值的，“最后一行”没有换行的时机，只能在递归结束后统计
     */
    this.contentSize[1] += getCurrContentLine(lineIdx).height;
  }

  private parseRichTextNodes(input: string) {
    if (this.richTextNeedsUpdate(input)) {
      return;
    }

    this.richTextNodes.length = 0;

    let wrapInputToNode = !this.richText;

    // 如果开启了富文本，使用富文本解析
    if (this.richText) {
      try {
        this.richTextParser.parse(this.richTextNodes, input);
      } catch (err) {
        console.error('Cannot parse rich text', err);

        // 如果解析失败，直接包装成单个文本节点
        wrapInputToNode = true;

        this.richTextNodes.length = 0;
      }
    }

    if (wrapInputToNode) {
      this.richTextNodes.push({
        nodeName: TEXT_NODE_NAME,
        attributes: {},
        children: [],
        textContent: input,
      });
    }
  }
}

type TextLine = {
  text: string;
  width: number;
};

/**
 * 自动换行（兼容不同样式文本在同一行排列）
 * 计算文本换行后的数组，根据字符换行，和word-break:break-all效果一致
 * 能够处理不同样式文本的换行计算
 * @param context canvas context
 * @param input 文本
 * @param maxWidth 最大宽度
 * @param firstLineOffset 首行偏移（用于支持同一行渲染不同样式的文本）
 */
function wrapTextLinesBreakAll(
  context: CanvasRenderingContext2D,
  input: string,
  maxWidth: number,
  firstLineOffset: number,
): TextLine[] {
  let oneLineText = '';

  /**
   * 先处理“换行符”
   */
  const splitted = input.split(NEW_LINE_EXP);

  const textLines: TextLine[] = [];

  /**
   * 获取偏移量，只有首行才可能有偏移量，其余行为0
   *
   * 通过这个偏移量，来处理一些“特殊行”（首行）
   * 首行有一系列特殊的地方
   * - 偏移量为0时，说明不存在跟别的节点一起排列，按原有流程来判断即可。
   * - 偏移量大于0时，说明跟别的节点一起排列
   *   - 如果已经是一个字符还放不下，可以换行。
   *   - 计算行的最大宽度时，应该考虑偏移量的影响
   */
  const getOffset = () => (textLines.length === 0 ? firstLineOffset : 0);

  while (splitted.length) {
    const text = splitted.shift();

    if (text === undefined) {
      break;
    }

    const offset = getOffset();

    const { width } = context.measureText(text);

    if (width + offset <= maxWidth) {
      textLines.push({
        text,
        width,
      });
      continue;
    }

    /**
     * 如果当前行已经有文本，则可能一个字符都放不下
     * 比如：
     * abc（当前行已有文本，字号是20），def（现在换行的文本字号是30）
     *
     * abc的宽度是90，每一行的最大宽度是100，
     * d这个字符的宽度是20，
     *
     * 那么d是不能放到这一行的。
     *
     * 而如果没有abc，而且此时最大宽度是10，d是可以放第一行的。
     */
    let startIdx: number;

    if (offset > 0) {
      oneLineText = '';
      startIdx = 0;
    } else {
      oneLineText = text[0];
      startIdx = 1;
    }

    // 逐个字符测量宽度，计算当前行能放下的文本
    for (let i = startIdx; i < text.length; i++) {
      const additionalWidth = getOffset();

      const { width } = context.measureText(oneLineText + text[i]);

      if (width + additionalWidth > maxWidth) {
        const { width } = context.measureText(oneLineText);

        textLines.push({
          text: oneLineText,
          width,
        });

        oneLineText = '';

        splitted.unshift(text.slice(i));
        break;
      } else {
        oneLineText += text[i];
      }
    }
  }

  if (oneLineText) {
    const { width } = context.measureText(oneLineText);

    textLines.push({
      text: oneLineText,
      width,
    });
  }

  return textLines;
}

/**
 * 根据换行符把文本逐行分割，并测量每行宽度
 */
function splitTextLines(
  context: CanvasRenderingContext2D,
  input: string,
): TextLine[] {
  return input.split(NEW_LINE_EXP).map<TextLine>((text) => {
    const { width } = context.measureText(text);

    return {
      text,
      width,
    };
  });
}

function mergeNodeStyle(
  source: ContentLineNodeStyle[keyof ContentLineNodeStyle],
  attributes: RichTextNodeAttributes,
): ContentLineNodeStyle[keyof ContentLineNodeStyle] {
  const props = pick(Object.keys(source), attributes);

  const merged = {
    ...source,
    ...props,
  };

  return merged;
}
