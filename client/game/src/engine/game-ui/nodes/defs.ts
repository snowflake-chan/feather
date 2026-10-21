import { UITextFontFamily } from '@box/schema/project/ui-rda/defs';
import RubikTTF from 'assets/fonts/Rubik-Regular.ttf';
import RubikWOFF from 'assets/fonts/rubik-v20-latin-regular.woff2';
import CodeNewRomanBoldOTF from 'assets/fonts/Code-New-Roman-Bold.otf';
import CodeNewRomanBoldWOFF from 'assets/fonts/Code-New-Roman-Bold.woff';
import ChillRoundGothicBoldTTF from 'assets/fonts/ChillRoundGothic-Bold.ttf';
import ChillRoundGothicBoldWOFF from 'assets/fonts/ChillRoundGothic-Bold.woff';
import DoulosSILR from 'assets/fonts/DoulosSILR.ttf';

export enum EventMode {
  /**
   * 自身不可交互，子节点不可交互
   */
  None,
  /**
   * 自身可交互，子节点可交互
   */
  Interactive,
  /**
   * 自身不可交互，子节点可交互
   */
  Passive,
}

export enum GameUINodeType {
  Renderable,
  Screen,
}

export enum GameUIComponentType {
  Scale,
  AutoLayout,
}

export const MAX_SCREEN_COUNT = 1000;

/**
 * 文本、输入框节点的描边粗细范围
 */
export const TEXT_STROKE_THICKNESS_RANGE = [0, 25];

/**
 * 文本、输入框节点的字体大小范围
 */
export const TEXT_FONT_SIZE_RANGE = [0, 255];

type UIFontFaceConfig = {
  /**
   * 加载字体时，指定字体名
   */
  fontFamily: string;
  /**
   * 字体文件
   */
  src: string;
  /**
   * 作为“选项”时的名字
   */
  selectionName: string;
  /**
   * 字重
   */
  weight?: string;
  /**
   * 这些数据用于计算字体数据（fontSize、hangingBaseline、alphabeticBaseline）
   * 数据源于字体文件。
   * 通过在线工具获取，详见：https://opentype.js.org/font-inspector.html
   *
   * 理论上可以通过measureText()测量出字体数据，但对浏览器兼容性要求较高，因此进行“预处理”
   *
   * TODO 这个预处理流程可以优化成自动化
   * - 工程自动化，打包时自动取数据
   * - 运行时自动化，参照opentype.js，解析字体二进制文件，来取对应的数据
   */
  metadata: FontMetaData;
};

type FontMetaData = {
  /**
   * [head - Font Header Table](https://learn.microsoft.com/en-us/typography/opentype/spec/head)
   */
  header: {
    unitsPerEm: number;
  };
  /**
   * [hhea - Horizontal Header Table](https://learn.microsoft.com/en-us/typography/opentype/spec/hhea)
   */
  horizontalHeader: {
    ascender: number;
    descender: number;
  };
};

/**
 * 字体枚举值 - 字体配置
 * 用于显示加载字体（gameUI加载字体）时，指定字体名字
 */
export const UI_FONT_FACE_MAP: Record<UITextFontFamily, UIFontFaceConfig> = {
  [UITextFontFamily.Default]: {
    fontFamily: 'Rubik',
    src: process.env.RUSTY ? RubikTTF : RubikWOFF,
    /**
     * 默认选项不需要名字，会通过i18n翻译“默认”
     */
    selectionName: '',
    metadata: {
      header: {
        unitsPerEm: 1000,
      },
      horizontalHeader: {
        ascender: 935,
        descender: -250,
      },
    },
  },
  [UITextFontFamily.BoldRound]: {
    fontFamily: 'Bold-Round',
    src: process.env.RUSTY ? ChillRoundGothicBoldTTF : ChillRoundGothicBoldWOFF,
    selectionName: '粗圆体',
    metadata: {
      header: {
        unitsPerEm: 1000,
      },
      horizontalHeader: {
        ascender: 1160,
        descender: -288,
      },
    },
  },
  [UITextFontFamily.CodeNewRomanBold]: {
    fontFamily: 'Code-New-Roman-Bold',
    src: process.env.RUSTY ? CodeNewRomanBoldOTF : CodeNewRomanBoldWOFF,
    selectionName: 'Code New Roman Bold',
    metadata: {
      header: {
        unitsPerEm: 2048,
      },
      horizontalHeader: {
        ascender: 1521,
        descender: -527,
      },
    },
  },
  [UITextFontFamily.ENSerif]: {
    fontFamily: 'EN-Serif',
    src: DoulosSILR,
    selectionName: 'EN-Serif',
    metadata: {
      header: {
        unitsPerEm: 2048,
      },
      horizontalHeader: {
        ascender: 2324,
        descender: -810,
      },
    },
  },
};
