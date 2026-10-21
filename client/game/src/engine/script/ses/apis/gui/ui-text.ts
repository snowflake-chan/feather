import {
  TextXAlignType,
  TextYAlignType,
} from '@box/schema/project/ui-rda/defs';
import type * as I from '@box/script-api';
import { TEXT_STROKE_THICKNESS_RANGE } from 'src/engine/game-ui/nodes/defs';
import { GameUIText } from 'src/engine/game-ui/nodes/text';
import { isFontFamily } from 'src/views/edit/components/game-ui/property/util';
import { ClientScriptContext } from '../context/const';
import { Vec3 } from '../math';
import { UiRenderable } from './ui-renderable';

export class UiText extends UiRenderable implements I.UiText {
  textContent!: string;
  textFontSize!: number;
  readonly textColor: Vec3;
  textXAlignment!: 'Center' | 'Left' | 'Right';
  textYAlignment!: 'Center' | 'Top' | 'Bottom';
  textLineHeight!: number;
  autoWordWrap!: boolean;
  readonly textStrokeColor: Vec3;
  textStrokeOpacity!: number;
  textStrokeThickness!: number;
  textFontFamily!: I.UITextFontFamily;
  richText!: boolean;

  constructor(node: GameUIText) {
    super(node);

    this.textColor = new Vec3(node.textColor);
    this.textStrokeColor = new Vec3(node.textStrokeColor);

    Object.defineProperties(this, {
      autoWordWrap: {
        get() {
          return node.autoWordWrap;
        },
        set(autoWordWrap: boolean) {
          if (typeof autoWordWrap !== 'boolean') {
            ClientScriptContext.scriptConsole?.warn(
              'Text autoWordWrap should be a boolean.',
            );
            return;
          }
          node.autoWordWrap = autoWordWrap;
        },
      },
      textLineHeight: {
        get() {
          return node.textLineHeight;
        },
        set(textLineHeight: number) {
          if (typeof textLineHeight !== 'number') {
            ClientScriptContext.scriptConsole?.warn(
              'textLineHeight should be a number.',
            );
            return;
          }
          node.textLineHeight = textLineHeight;
        },
      },
      textContent: {
        get() {
          return node.textContent;
        },
        set(textContent: string) {
          if (typeof textContent !== 'string') {
            ClientScriptContext.scriptConsole?.warn(
              'Text content should be a string.',
            );

            return;
          }
          node.textContent = textContent;
        },
      },
      textFontSize: {
        get() {
          return node.textFontSize;
        },
        set(textFontSize: number) {
          node.textFontSize = textFontSize;
        },
      },
      textXAlignment: {
        get() {
          switch (node.textXAlignment) {
            case TextXAlignType.Center:
              return 'Center';
            case TextXAlignType.Left:
              return 'Left';
            case TextXAlignType.Right:
              return 'Right';
            default:
              throw new Error(
                `Unknown textXAlignment type: ${node.textXAlignment}`,
              );
          }
        },
        set(textXAlignment: 'Center' | 'Left' | 'Right') {
          node.textXAlignment = TextXAlignType[textXAlignment];
        },
      },
      textYAlignment: {
        get() {
          switch (node.textYAlignment) {
            case TextYAlignType.Center:
              return 'Center';
            case TextYAlignType.Top:
              return 'Top';
            case TextYAlignType.Bottom:
              return 'Bottom';
            default:
              throw new Error(
                `Unknown textYAlignment type: ${node.textYAlignment}`,
              );
          }
        },
        set(textYAlignment: 'Center' | 'Top' | 'Bottom') {
          node.textYAlignment = TextYAlignType[textYAlignment];
        },
      },
      textStrokeOpacity: {
        get() {
          return node.textStrokeOpacity;
        },
        set(textStrokeOpacity: number) {
          if (typeof textStrokeOpacity !== 'number') {
            ClientScriptContext.scriptConsole?.warn(
              'Opacity should be a number.',
            );
            return;
          }

          node.textStrokeOpacity = textStrokeOpacity;
        },
      },
      textStrokeThickness: {
        get() {
          return node.textStrokeThickness;
        },
        set(textStrokeThickness: number) {
          const [min, max] = TEXT_STROKE_THICKNESS_RANGE;

          if (textStrokeThickness < min || textStrokeThickness > max) {
            ClientScriptContext.scriptConsole?.warn(
              `textStrokeThickness should be a number within the range of ${min} to ${max}`,
            );
            return;
          }

          node.textStrokeThickness = textStrokeThickness;
        },
      },
      textFontFamily: {
        get() {
          return node.textFontFamily;
        },
        set(fontFamily: I.UITextFontFamily) {
          if (!isFontFamily(fontFamily)) {
            ClientScriptContext.scriptConsole?.warn('FontFamily is invalid');
            return;
          }

          node.textFontFamily = fontFamily;
        },
      },
      richText: {
        configurable: true,
        get() {
          return node.richText;
        },
        set(richText: boolean) {
          if (typeof richText !== 'boolean') {
            ClientScriptContext.scriptConsole?.warn('RichText is invalid');
            return;
          }

          node.richText = richText;
        },
      },
    });
  }

  static create() {
    return ClientScriptContext.createRenderable('text');
  }
}
