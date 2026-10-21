import { DialogCommonConfig } from '@box/schema/dialog/dialog-protocol';
import { drawRoundRect, nowrapEllipsisText } from '../utils/canvas';
import { Scrollbar } from './interface';
import { SerializedVec2 } from '../interfaces';
import { isPhoneSize, isPortrait } from 'src/utils/mobile';
import type { HitArea } from '../input/events';

export const TAP_TIME = 200;

export const maxWidth = 440;
export const widthPadding = 72;
export const minHeight = 200;
export const radiusHeight = 20;

export const contentPadding = 16;
export const minWidth = 10 + radiusHeight * 2 + contentPadding * 2;

const maxHeightRatio = 0.5;
const bottom = 48;

const maxPhoneLandscapeRatio = 0.8;
const phoneLandscapeBottom = 32;

const phonePortraitBottom = 72;

export function getMaxHeightRatioAndBottom(): {
  maxHeightRatio: number;
  bottom: number;
} {
  if (isPhoneSize()) {
    if (isPortrait()) {
      return {
        maxHeightRatio,
        bottom: phonePortraitBottom,
      };
    }

    return {
      maxHeightRatio: maxPhoneLandscapeRatio,
      bottom: phoneLandscapeBottom,
    };
  }

  return {
    maxHeightRatio,
    bottom,
  };
}

export const fontSize = 16;
export const lineHeight = fontSize * 1.2;

export const scrollbarWidth = 4;

const titleHeight = 40;
const titleMinWidth = 96;
const titleMaxWidthPadding = 40;
const titleContentPadding = 16;

const closeIconSize = 24;
const closeIconTop = -10;
const closeLinePadding = 5;

export function drawBackground(
  context2D: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fillStyle: string,
) {
  context2D.beginPath();

  const bgX = x + radiusHeight;
  const bgY = y + radiusHeight;
  const innerWidth = width - radiusHeight * 2;
  const innerHeight = height - radiusHeight * 2;

  context2D.moveTo(bgX, bgY);
  // 上面贝塞尔曲线
  context2D.quadraticCurveTo(
    bgX + innerWidth / 2,
    bgY - radiusHeight * 2,
    bgX + innerWidth,
    bgY,
  );

  // 右侧贝塞尔曲线
  context2D.quadraticCurveTo(
    bgX + innerWidth + radiusHeight * 2,
    bgY + innerHeight / 2,
    bgX + innerWidth,
    bgY + innerHeight,
  );

  // 下面贝塞尔曲线
  context2D.quadraticCurveTo(
    bgX + innerWidth / 2,
    bgY + innerHeight + radiusHeight * 2,
    bgX,
    bgY + innerHeight,
  );
  // 左侧贝塞尔曲线
  context2D.quadraticCurveTo(
    bgX - radiusHeight * 2,
    bgY + innerHeight / 2,
    bgX,
    bgY,
  );

  context2D.fillStyle = fillStyle;
  context2D.fill();
  context2D.closePath();
}

export function drawTextLines(
  context2D: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  clipHeight: number,
  contentHeight: number,
  fillStyle: string,
  lines: string[],
  scrollY: number,
  clipX?: number,
  clipWidth?: number,
  drawExtra?: (y: number) => void,
): Scrollbar {
  context2D.save();
  context2D.beginPath();
  context2D.rect(clipX || x, y, clipWidth || width, clipHeight);
  context2D.clip();
  context2D.fillStyle = fillStyle;

  const minTextY = y + lineHeight / 2;
  let textY = y + clipHeight / 2 - contentHeight / 2 + lineHeight / 2;

  const offset = Math.max(0, Math.min(scrollY, contentHeight - clipHeight));

  textY = Math.max(minTextY, textY) - offset;

  for (let i = 0; i < lines.length; i++) {
    context2D.fillText(lines[i], x, textY + lineHeight * i);
  }

  drawExtra?.(textY + lineHeight * lines.length);

  context2D.closePath();
  context2D.restore();

  return {
    scrollY: offset,
    scrollbarHeight:
      contentHeight > clipHeight
        ? (clipHeight * clipHeight) / contentHeight
        : 0,
    scrollbarPositionY: (clipHeight * offset) / contentHeight + y,
  };
}

export function drawTitle(
  context2D: CanvasRenderingContext2D,
  x: number,
  y: number,
  title: string,
  backgroundFillStyle: string,
  textFillStyle: string,
  backgroundWidth: number,
) {
  context2D.font = `${fontSize}px`;
  context2D.textAlign = 'center';
  const maxTextWidth =
    backgroundWidth - titleMaxWidthPadding - titleContentPadding * 2;
  const { text, textLen } = nowrapEllipsisText(context2D, title, maxTextWidth);

  const titleWidth = Math.max(textLen + titleContentPadding * 2, titleMinWidth);

  context2D.beginPath();
  context2D.fillStyle = backgroundFillStyle;
  drawRoundRect(
    context2D,
    x,
    y - titleHeight / 2,
    titleWidth,
    titleHeight,
    titleHeight / 2,
  );
  context2D.fill();
  context2D.closePath();

  context2D.beginPath();
  context2D.fillStyle = textFillStyle;
  context2D.fillText(text, x + titleWidth / 2, y);
  context2D.closePath();
}

export function drawCloseButton(
  context2D: CanvasRenderingContext2D,
  x: number,
  y: number,
  backgroundWidth: number,
) {
  context2D.beginPath();
  context2D.strokeStyle = '#FFFFFFFF';
  context2D.lineWidth = 2;
  const hitArea: HitArea = {
    x: x + backgroundWidth - closeIconSize,
    y: y + closeIconTop,
    w: closeIconSize,
    h: closeIconSize,
  };
  const lineRight = hitArea.x + closeIconSize - closeLinePadding;
  const lineTop = hitArea.y + closeLinePadding;
  const lineLeft = hitArea.x + closeLinePadding;
  const lineBottom = hitArea.y + closeIconSize - closeLinePadding;

  context2D.moveTo(lineRight, lineTop);
  context2D.lineTo(lineLeft, lineBottom);

  context2D.moveTo(lineLeft, lineTop);
  context2D.lineTo(lineRight, lineBottom);

  context2D.stroke();
  context2D.closePath();

  return hitArea;
}

function transformToCanvasColor(color: {
  r: number;
  g: number;
  b: number;
  a: number;
}) {
  const { r, g, b, a } = color;
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(
    b * 255,
  )}, ${a})`;
}

export function parseCommonConfigColor(common: DialogCommonConfig) {
  const {
    titleBackgroundColor,
    titleTextColor,
    contentBackgroundColor,
    contentTextColor,
  } = common;

  return {
    titleColor: {
      text: transformToCanvasColor(titleTextColor),
      background: transformToCanvasColor(titleBackgroundColor),
    },
    contentColor: {
      text: transformToCanvasColor(contentTextColor),
      background: transformToCanvasColor(contentBackgroundColor),
    },
  };
}

export function hitTest(pos: SerializedVec2, area?: HitArea) {
  return (
    area &&
    pos[0] > area.x &&
    pos[0] < area.x + area.w &&
    pos[1] > area.y &&
    pos[1] < area.y + area.h
  );
}
