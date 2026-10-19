"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNon200Error = isNon200Error;
function isNon200Error(e) {
    return e !== undefined && e.non200 === true;
}
