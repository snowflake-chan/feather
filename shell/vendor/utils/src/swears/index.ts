import { CN_RE } from './CN_U18';
const RES = {
  CN_U18: CN_RE,
};

export function isUrl(s) {
  return /^https?:\/\/[\x00-\x7F]+$/m.test(s);
}

export function isSwear(text: string, re?: string) {
  if (isUrl(text) || !re) {
    return false;
  }
  return new RegExp(RES[re]).test(text);
}

export function matchSwear(text: string, re?: string) {
  if (isUrl(text) || !re) {
    return null;
  }
  return text.match(RES[re]);
}

export function filterSwear(
  text: string,
  re: string,
  filterText: string = '喵',
) {
  if (isUrl(text) || !re) {
    return text;
  }
  return text.replace(new RegExp(RES[re]), filterText);
}
