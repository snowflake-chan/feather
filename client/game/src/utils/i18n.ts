import { IntlShape } from 'react-intl';
import { LangType } from 'src/apis/createra';
import { WebsiteStorage } from 'src/utils/storage/website';

export const Languages = {
  'zh': 'zh',
  'en': 'en',
  'en-US': 'en',
  'zh-CN': 'zh',
};

export const DEFAULT_LOCALE = 'zh-CN';

// TODO：website 相关内容删掉之后，可以删除getLang
export function getLang(locale?: string): LangType {
  const lang =
    WebsiteStorage.get('lang') || navigator.language || DEFAULT_LOCALE;
  const languageWithoutRegionCode = (locale || lang)
    .toLowerCase()
    .split(/[-_]+/)[0];

  return Languages[languageWithoutRegionCode] || 'en';
}

// 全局的 INTL 对象
let INTL: IntlShape;
export function resolve_intl(intls: IntlShape) {
  INTL = intls;
}

export function intl() {
  return INTL;
}

export let intlMessage = function (id: string, value?: any) {
  return INTL.formatMessage({ id: id }, value);
};
