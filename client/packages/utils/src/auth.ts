export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 15;
export const MIN_DISPLAYNAME_LENGTH = 3;
export const MAX_DISPLAYNAME_LENGTH = 30;
export const MAX_DESCRIPTION_LENGTH = 330;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 15;

// https://en.wikipedia.org/wiki/List_of_Unicode_characters#American_scripts
// Basic Latin (except space \u0020)
// CJK_Unified_Ideographs (4 ranges)
// notice: extend not active on. just write here in case.
// extend a \u3400-\u4DBF
// extend b \u{20000}–\u{2A6DF}
// extend c \u{2A700}–\u{2B73F}
export const VALIDUNICODE =
  /([\u0021-\u007E]|[\u4E00-\u62FF]|[\u6300-\u77FF]|[\u7800-\u8CFF]|[\u8D00-\u9FFF])+/g;
export const StrByteLength = (s: string) => {
  return Buffer.byteLength(s, 'utf8');
};
export function isEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

export function isPhone(phone: string) {
  return /^\+?\d+$/.test(phone);
}

export function isChinesePhone(phone: string) {
  return /^\+861[3-9]\d{9}$/.test(phone);
}

export function isChinesePhoneWithoutCode(phone: string) {
  return /^1[3-9]\d{9}$/.test(phone);
}

export function isCaptcha(value: string) {
  return /\d{6}/.test(value);
}

export function isValidUsername(username: string) {
  return (
    StrByteLength(username) >= MIN_USERNAME_LENGTH &&
    StrByteLength(username) <= MAX_USERNAME_LENGTH &&
    /^[a-zA-Z0-9]*[a-zA-Z][a-zA-Z0-9]*$/.test(username)
  );
}

export function isValidDisplayname(displayname: string) {
  return (
    StrByteLength(displayname) >= MIN_DISPLAYNAME_LENGTH &&
    StrByteLength(displayname) <= MAX_DISPLAYNAME_LENGTH &&
    displayname.match(VALIDUNICODE) &&
    displayname.match(VALIDUNICODE)![0] === displayname
  );
}

export function isValidDescription(v: string) {
  return (
    StrByteLength(v) >= MIN_DISPLAYNAME_LENGTH &&
    StrByteLength(v) <= MAX_DESCRIPTION_LENGTH
  );
}

export function isLeapYear(year: number) {
  return year % 4 === 0 && year % 100 !== 0;
}

export function isDate(year: number, month: number, day: number) {
  const monthMaxDays = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12 || day < 1) {
    return false;
  }
  if (isLeapYear(year)) {
    monthMaxDays[2]++;
  }
  if (day > monthMaxDays[month]) {
    return false;
  }
  return true;
}

export const isPasswordValid = (password: string) => {
  if (
    password.length >= MIN_PASSWORD_LENGTH &&
    password.length <= MAX_PASSWORD_LENGTH
  ) {
    return true;
  }
  return false;
};
