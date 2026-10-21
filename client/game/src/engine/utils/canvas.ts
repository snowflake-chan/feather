import { mat2d } from 'gl-matrix';

export function drawRoundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  if (w < 2 * r) {
    r = w / 2;
  }
  if (h < 2 * r) {
    r = h / 2;
  }

  context.beginPath();

  // 以左上圆弧终点为起点，顺时针绘制
  context.moveTo(x + r, y);

  /**
   * 右上圆弧起点
   *   ──────
   */
  context.lineTo(x + w - r, y);

  /**
   * 右上圆弧终点
   *   ──────╮
   */
  context.arcTo(x + w, y, x + w, y + r, r);

  /**
   * 右下圆弧起点
   *   ──────╮
   *         │
   */
  context.lineTo(x + w, y + h - r);

  /**
   * 右下圆弧终点
   *   ──────╮
   *         │
   *         ╯
   */
  context.arcTo(x + w, y + h, x + w - r, y + h, r);

  /**
   * 左下圆弧起点
   *   ──────╮
   *         │
   *   ──────╯
   */
  context.lineTo(x + r, y + h);

  /**
   * 左下圆弧终点
   *   ──────╮
   *         │
   *  ╰──────╯
   */
  context.arcTo(x, y + h, x, y + h - r, r);

  /**
   * 左上圆弧起点
   *   ──────╮
   *  │      │
   *  ╰──────╯
   */
  context.lineTo(x, y + r);

  /**
   * 左上圆弧终点
   *  ╭──────╮
   *  │      │
   *  ╰──────╯
   */
  context.arcTo(x, y, x + r, y, r);
}

export function getTextBoxWidth(textMetrics: TextMetrics) {
  // https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics#measuring_text_width
  // 理论上「textMetrics.actualBoundingBoxRight + textMetrics.actualBoundingBoxLeft」计算的是更为精准的css字体盒子宽度
  // 但是其数据计算会刨除左右两边的无用空格，当测量内容左右两边带有空格的时候无法计算出带有空格的数据，与预期偏差较大
  // 因此返回只根据字体字号测量的宽度数据，不考虑斜体粗体等设置带来的细小偏差
  return textMetrics.width;
}
export function getTextBoxHeight(textMetrics: TextMetrics) {
  return (
    textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent
  );
}

export const ELLIPSIS = '...';

/**
 * 单行文字剪切
 * 效果相当于css配置：
 * white-space: nowrap;
 * text-overflow: ellipsis;
 * @param context canvas context
 * @param content 文本
 * @param maxWidth 最大宽度
 * @returns
 */
export function nowrapEllipsisText(
  context: CanvasRenderingContext2D,
  content: string,
  maxWidth: number,
): {
  text: string;
  textLen: number;
} {
  const contentLen = getTextBoxWidth(context.measureText(content));

  if (contentLen < maxWidth) {
    return {
      text: content,
      textLen: contentLen,
    };
  }

  let nowrapText = content;
  let textLen = getTextBoxWidth(context.measureText(nowrapText + ELLIPSIS));
  // 从后往前剪裁，一直剪裁到加上ellipse宽度小于最大宽度，或者text只剩最后一个字符
  while (textLen > maxWidth && nowrapText.length > 1) {
    nowrapText = nowrapText.substring(0, nowrapText.length - 1);
    textLen = getTextBoxWidth(context.measureText(nowrapText + ELLIPSIS));
  }

  return {
    text: nowrapText + ELLIPSIS,
    textLen,
  };
}

/**
 * 计算文本换行后的数组，根据字符换行，和word-break:break-all效果一致
 * @param context canvas context
 * @param text 文本
 * @param maxWidth 最大宽度
 */
export function wrapTextBreakAll(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): {
  lines: string[];
  maxLineWidth: number;
} {
  let oneLine = '';
  let maxLineWidth = 0;

  const lines = text.split('\n');
  const texts: string[] = [];
  while (lines.length) {
    const line = lines.shift();
    if (line === undefined) {
      break;
    }
    const lineWidth = context.measureText(line).width;
    if (lineWidth <= maxWidth) {
      texts.push(line);
      maxLineWidth = Math.max(maxLineWidth, lineWidth);
      continue;
    }

    oneLine = line[0];
    for (let i = 1; i < line.length; i++) {
      if (context.measureText(oneLine + line[i]).width > maxWidth) {
        texts.push(oneLine);
        maxLineWidth = Math.max(
          maxLineWidth,
          context.measureText(oneLine).width,
        );
        oneLine = '';
        lines.unshift(line.slice(i));
        break;
      } else {
        oneLine += line[i];
      }
    }
  }
  if (oneLine) {
    texts.push(oneLine);
    maxLineWidth = Math.max(maxLineWidth, context.measureText(oneLine).width);
  }
  return {
    lines: texts,
    maxLineWidth,
  };
}

/**
 * 算文本换行后的数组，根据word换行
 * 效果模拟 word-break:break-word
 * 不管当前语言是什么，按空格切word，主要服务于英语
 * @param context canvas context
 * @param text 文本
 * @param maxWidth 最大宽度
 * @param maxLines 最大行数。如果文字超过最大行数，最后会补上ellipsis
 * @returns
 */
export function wrapTextBreakWord(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const textWidth = getTextBoxWidth(context.measureText(text));
  if (textWidth <= maxWidth) {
    return [text];
  }

  let oneLineText: string = '';
  const texts: string[] = [];

  // 给最后一行文本添加省略号
  const addEllipsis = (out: string[]) => {
    if (!out.length) {
      return;
    }
    let lastLine = out[out.length - 1];
    while (
      getTextBoxWidth(context.measureText(lastLine + ELLIPSIS)) > maxWidth &&
      lastLine.length > 1
    ) {
      lastLine = lastLine.substring(0, lastLine.length - 1);
    }
    out[out.length - 1] = lastLine + ELLIPSIS;
  };

  const words = text.split(' ');
  while (words.length) {
    const word = words.shift();
    /**
     * 这里需要精准判断world为undefined的时候才算计算完成
     * 当word为空字符串的时候代表当前单词为空格，不会break，应该继续计算
     */
    if (word === undefined) {
      break;
    }

    const lineWidth = getTextBoxWidth(
      context.measureText(oneLineText + word + ' '),
    );

    // 不需要换行，继续往上加单词
    if (lineWidth <= maxWidth) {
      oneLineText += word + ' ';
      continue;
    }

    const wordWidth = getTextBoxWidth(context.measureText(word + ' '));
    // 当前单词长度小于一行的长度，直接换行
    if (wordWidth <= maxWidth) {
      texts.push(oneLineText);
      if (texts.length >= maxLines) {
        addEllipsis(texts);
        return texts;
      }
      oneLineText = word + ' ';
      continue;
    }

    // 当前单词长度长于一行
    // 按字符串计算，先把一行长度占满，多的字符串生切到下一行
    for (let j = 0; j < word.length; j++) {
      const str = word[j];
      const strWidth = getTextBoxWidth(context.measureText(oneLineText + str));
      if (strWidth <= maxWidth) {
        oneLineText += str;
        continue;
      }

      // 当前行长度已占满，换行+切单词到下一行

      // 如果此时一行字符串为空，说明这一行的宽度一个字符串都放不下
      // 强行塞入一个字符串再换行，避免进入无限循环切空字符串换行
      // 此时单行宽度(一个字符串)会超过入参的最大宽度
      if (!oneLineText) {
        oneLineText += str;
      }

      texts.push(oneLineText);
      if (texts.length >= maxLines) {
        addEllipsis(texts);
        return texts;
      }
      oneLineText = '';
      words.unshift(word.slice(j));
      break;
    }
  }

  // 最后一行的内容放进去
  if (oneLineText) {
    texts.push(oneLineText);
  }
  return texts;
}

/**
 * 全量设置上下文的转换矩阵为等比缩放矩阵
 * @param {CanvasRenderingContext2D} context - 上下文
 * @param {number} scale - 缩放
 */
export function setTransformByScale(
  context: CanvasRenderingContext2D,
  scale: number,
) {
  context.setTransform(scale, 0, 0, scale, 0, 0);
}

/**
 * 重置上下文的转换矩阵为默认矩阵
 * 通过全量设置矩阵的方式处理，兼容无resetTransform接口的环境
 * see: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/resetTransform#polyfill
 * @param context 上下文
 */
export function resetTransform(context: CanvasRenderingContext2D) {
  setTransformByScale(context, 1);
}

/**
 * 通过mat2d更新更新context的矩阵
 */
export function setTransformByMat2d(
  context: CanvasRenderingContext2D,
  m: mat2d,
  scale: number = 1,
) {
  context.setTransform(
    m[0] * scale,
    m[1] * scale,
    m[2] * scale,
    m[3] * scale,
    m[4] * scale,
    m[5] * scale,
  );
}
