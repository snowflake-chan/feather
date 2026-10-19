"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMuPrimitiveType = isMuPrimitiveType;
const muPrimitiveTypes = [
    'ascii',
    'boolean',
    'fixed-ascii',
    'float32',
    'float64',
    'int8',
    'int16',
    'int32',
    'uint8',
    'uint16',
    'uint32',
    'utf8',
    'void',
];
function isMuPrimitiveType(muType) {
    return muPrimitiveTypes.indexOf(muType) > -1;
}
//# sourceMappingURL=is-primitive.js.map