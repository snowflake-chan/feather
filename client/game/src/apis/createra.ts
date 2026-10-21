import { LocaleFullType } from '@box/apis';

/**
 * 只读，定义了项目本身提供的、允许的语言。
 * SSR加载语言时，根据该标准来检查语言是否合法，
 * 从而确保项目使用的一定是已经加载的语言。
 */
export const VALID_LANGUAGE = <const>['en', 'zh'];

/**
 * 默认语言为英语
 */
export const DEFAULT_LANGUAGE: LangType = VALID_LANGUAGE[0];

/**
 * 前端国际化语言的取值不包含region, 例如'en'|'zh'
 */
export type LangType = typeof VALID_LANGUAGE[number];

type LocaleMapType = { [key in LangType]: LocaleFullType } & {
  [key in LocaleFullType]: LangType;
};

/**
 * 映射关系: 前端语言取值 <--> 后端语言取值
 * 后端: 对语言的取值包含下划线和region,例如'en_US'|'zh_CN'
 * 前端: 国际化语言的取值不包含region, 例如'en'|'zh'
 */
export const localeMap: LocaleMapType = {
  // 前端 -> 后端
  en: 'en_US',
  zh: 'zh_CN',
  // 后端 -> 前端
  en_US: 'en',
  zh_CN: 'zh',
};

/**
 * 定义了 monaco 编辑器的availableLanguages属性的合法值
 * 标准: node_modules/monaco-editor/min/vs/editor 下的文件后缀
 * 注意: 空字符串代表英文；中文区分繁简体。
 */
export const MONACO_LANGUAGE = <const>[
  '',
  'de',
  'es',
  'fr',
  'it',
  'ja',
  'ko',
  'ru',
  'zh-cn',
  'zh-tw',
];
export type MonacoLangType = typeof MONACO_LANGUAGE[number];

type monacoLocaleMapType =
  | { [key in LangType]: MonacoLangType }
  | { [key in MonacoLangType]: LangType };

/**
 * 映射关系:
 * react-intl的locale属性的合法值 <-->
 * monaco编辑器的availableLanguages属性的合法值
 */
export const monacoLocaleMap: monacoLocaleMapType = {
  // 前端 -> monaco
  'en': '',
  'zh': 'zh-cn',

  // monaco -> 前端
  '': 'en',
  'zh-cn': 'zh',
};

export async function setUserLanguage(language: LangType): Promise<void> {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('box-local-language', language);
  }
}
