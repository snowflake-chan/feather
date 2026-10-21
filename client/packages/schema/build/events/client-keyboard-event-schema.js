"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyBoardEventType = exports.ClientKeyboardEventsSchema = exports.ClientKeyboardEventSchema = void 0;
const schema_1 = require("@box/mudb/schema");
exports.ClientKeyboardEventSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    tick: new schema_1.MuVarint(),
    keyDownState: new schema_1.MuArray(new schema_1.MuUint8(), Infinity),
    prevKeyDownState: new schema_1.MuArray(new schema_1.MuUint8(), Infinity),
});
exports.ClientKeyboardEventsSchema = new schema_1.MuArray(exports.ClientKeyboardEventSchema, Infinity);
var KeyBoardEventType;
(function (KeyBoardEventType) {
    KeyBoardEventType[KeyBoardEventType["KeyDown"] = 0] = "KeyDown";
    KeyBoardEventType[KeyBoardEventType["keyUp"] = 1] = "keyUp";
})(KeyBoardEventType || (exports.KeyBoardEventType = KeyBoardEventType = {}));
//# sourceMappingURL=client-keyboard-event-schema.js.map