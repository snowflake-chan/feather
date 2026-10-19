"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUrl = isUrl;
exports.isSwear = isSwear;
exports.matchSwear = matchSwear;
exports.filterSwear = filterSwear;
const CN_U18_1 = require("./CN_U18");
const RES = {
    CN_U18: CN_U18_1.CN_RE,
};
function isUrl(s) {
    return /^https?:\/\/[\x00-\x7F]+$/m.test(s);
}
function isSwear(text, re) {
    if (isUrl(text) || !re) {
        return false;
    }
    return new RegExp(RES[re]).test(text);
}
function matchSwear(text, re) {
    if (isUrl(text) || !re) {
        return null;
    }
    return text.match(RES[re]);
}
function filterSwear(text, re, filterText = '喵') {
    if (isUrl(text) || !re) {
        return text;
    }
    return text.replace(new RegExp(RES[re]), filterText);
}
