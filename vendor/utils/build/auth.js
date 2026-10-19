"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPasswordValid = exports.StrByteLength = exports.VALIDUNICODE = exports.MAX_PASSWORD_LENGTH = exports.MIN_PASSWORD_LENGTH = exports.MAX_DESCRIPTION_LENGTH = exports.MAX_DISPLAYNAME_LENGTH = exports.MIN_DISPLAYNAME_LENGTH = exports.MAX_USERNAME_LENGTH = exports.MIN_USERNAME_LENGTH = void 0;
exports.isEmail = isEmail;
exports.isPhone = isPhone;
exports.isChinesePhone = isChinesePhone;
exports.isChinesePhoneWithoutCode = isChinesePhoneWithoutCode;
exports.isCaptcha = isCaptcha;
exports.isValidUsername = isValidUsername;
exports.isValidDisplayname = isValidDisplayname;
exports.isValidDescription = isValidDescription;
exports.isLeapYear = isLeapYear;
exports.isDate = isDate;
exports.MIN_USERNAME_LENGTH = 3;
exports.MAX_USERNAME_LENGTH = 15;
exports.MIN_DISPLAYNAME_LENGTH = 3;
exports.MAX_DISPLAYNAME_LENGTH = 30;
exports.MAX_DESCRIPTION_LENGTH = 330;
exports.MIN_PASSWORD_LENGTH = 8;
exports.MAX_PASSWORD_LENGTH = 15;
exports.VALIDUNICODE = /([\u0021-\u007E]|[\u4E00-\u62FF]|[\u6300-\u77FF]|[\u7800-\u8CFF]|[\u8D00-\u9FFF])+/g;
const StrByteLength = (s) => {
    return Buffer.byteLength(s, 'utf8');
};
exports.StrByteLength = StrByteLength;
function isEmail(email) {
    return /^\S+@\S+\.\S+$/.test(email);
}
function isPhone(phone) {
    return /^\+?\d+$/.test(phone);
}
function isChinesePhone(phone) {
    return /^\+861[3-9]\d{9}$/.test(phone);
}
function isChinesePhoneWithoutCode(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
}
function isCaptcha(value) {
    return /\d{6}/.test(value);
}
function isValidUsername(username) {
    return ((0, exports.StrByteLength)(username) >= exports.MIN_USERNAME_LENGTH &&
        (0, exports.StrByteLength)(username) <= exports.MAX_USERNAME_LENGTH &&
        /^[a-zA-Z0-9]*[a-zA-Z][a-zA-Z0-9]*$/.test(username));
}
function isValidDisplayname(displayname) {
    return ((0, exports.StrByteLength)(displayname) >= exports.MIN_DISPLAYNAME_LENGTH &&
        (0, exports.StrByteLength)(displayname) <= exports.MAX_DISPLAYNAME_LENGTH &&
        displayname.match(exports.VALIDUNICODE) &&
        displayname.match(exports.VALIDUNICODE)[0] === displayname);
}
function isValidDescription(v) {
    return ((0, exports.StrByteLength)(v) >= exports.MIN_DISPLAYNAME_LENGTH &&
        (0, exports.StrByteLength)(v) <= exports.MAX_DESCRIPTION_LENGTH);
}
function isLeapYear(year) {
    return year % 4 === 0 && year % 100 !== 0;
}
function isDate(year, month, day) {
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
const isPasswordValid = (password) => {
    if (password.length >= exports.MIN_PASSWORD_LENGTH &&
        password.length <= exports.MAX_PASSWORD_LENGTH) {
        return true;
    }
    return false;
};
exports.isPasswordValid = isPasswordValid;
