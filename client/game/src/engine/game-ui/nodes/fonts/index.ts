import type { UITextFontFamily } from '@box/schema/project/ui-rda/defs';
import { UI_FONT_FACE_MAP } from '../defs';

/**
 * 计算fontBoundingBoxAscent
 * @param ascender 上升线高度（基于unitsPerEm）
 * @param unitsPerEm 字体度量单位
 * @param fontSize 字体大小（px）
 */
export function fontAscenderToAscent(
  ascender: number,
  unitsPerEm: number,
  fontSize: number,
) {
  return (ascender / unitsPerEm) * fontSize;
}

/**
 * 计算fontBoundingBoxDescent
 * @param ascender 下降线高度（基于unitsPerEm）
 * @param unitsPerEm 字体度量单位
 * @param fontSize 字体大小（px）
 */
export function fontDescenderToDescent(
  descender: number,
  unitsPerEm: number,
  fontSize: number,
) {
  return fontAscenderToAscent(Math.abs(descender), unitsPerEm, fontSize);
}

/**
 * 一般来说hangingBaseline是ascender的80%
 * TrueType 和 OpenType 字体没有明确定义 hanging baseline 的位置，因此没有直接从字体文件中读取的方式。
 * 0.8 是一种通常的估算，因为在大多数字体中，hanging baseline 会接近顶部，但不完全与字体上边界重合。
 */
const ASCENT_TO_HANGING_BASELINE = 0.8;
/**
 * 通过上升线高度（fontBoundingBoxAscent）计算悬挂基线高度（hangingBaseline）
 * 这里计算的是textBaseline为“alphabetic”时的hangingBaseline值）
 * @param ascent
 * @returns
 */
export function computeHangingBaseline(ascent: number) {
  return ascent * ASCENT_TO_HANGING_BASELINE;
}

export function getFontMetaData(fontFamily: UITextFontFamily) {
  return UI_FONT_FACE_MAP[fontFamily].metadata;
}

export function getFontBoundingBoxHeight(
  fontSize: number,
  fontFamily: UITextFontFamily,
) {
  const { header, horizontalHeader } = getFontMetaData(fontFamily);

  const ascent = fontAscenderToAscent(
    horizontalHeader.ascender,
    header.unitsPerEm,
    fontSize,
  );
  const descent = fontDescenderToDescent(
    horizontalHeader.descender,
    header.unitsPerEm,
    fontSize,
  );

  return ascent + descent;
}
