"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyBoardEventType = exports.ClientKeyboardEventsSchema = exports.ClientKeyboardEventSchema = void 0;
const array_1 = require("@box/mudb/schema/array");
const struct_1 = require("@box/mudb/schema/struct");
const uint8_1 = require("@box/mudb/schema/uint8");
const varint_1 = require("@box/mudb/schema/varint");
exports.ClientKeyboardEventSchema = new struct_1.MuStruct({
    id: new varint_1.MuVarint(),
    tick: new varint_1.MuVarint(),
    keyDownState: new array_1.MuArray(new uint8_1.MuUint8(), Infinity),
    prevKeyDownState: new array_1.MuArray(new uint8_1.MuUint8(), Infinity),
});
exports.ClientKeyboardEventsSchema = new array_1.MuArray(exports.ClientKeyboardEventSchema, Infinity);
var KeyBoardEventType;
(function (KeyBoardEventType) {
    KeyBoardEventType[KeyBoardEventType["KeyDown"] = 0] = "KeyDown";
    KeyBoardEventType[KeyBoardEventType["keyUp"] = 1] = "keyUp";
})(KeyBoardEventType || (exports.KeyBoardEventType = KeyBoardEventType = {}));
