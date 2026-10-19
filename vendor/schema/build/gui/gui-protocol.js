"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GUIProtocol = void 0;
const schema_1 = require("@box/mudb/schema");
exports.GUIProtocol = {
    name: 'gui',
    client: {
        init: new schema_1.MuStruct({
            handle: new schema_1.MuVarint(),
            data: new schema_1.MuUTF8(),
        }),
        append: new schema_1.MuStruct({
            handle: new schema_1.MuVarint(),
            selector: new schema_1.MuUTF8(),
            data: new schema_1.MuUTF8(),
        }),
        remove: new schema_1.MuStruct({
            handle: new schema_1.MuVarint(),
            selector: new schema_1.MuUTF8(),
        }),
        show: new schema_1.MuStruct({
            handle: new schema_1.MuVarint(),
            name: new schema_1.MuUTF8(),
            allowMultiple: new schema_1.MuBoolean(false),
        }),
        getAttribute: new schema_1.MuStruct({
            handle: new schema_1.MuVarint(),
            selector: new schema_1.MuUTF8(),
            name: new schema_1.MuUTF8(),
        }),
        setAttribute: new schema_1.MuStruct({
            handle: new schema_1.MuVarint(),
            selector: new schema_1.MuUTF8(),
            name: new schema_1.MuUTF8(),
            value: new schema_1.MuUTF8(),
        }),
        reset: new schema_1.MuVoid(),
    },
    server: {
        return: new schema_1.MuStruct({
            handle: new schema_1.MuVarint(),
            value: new schema_1.MuUTF8(),
        }),
        throw: new schema_1.MuStruct({
            handle: new schema_1.MuVarint(),
            message: new schema_1.MuUTF8(),
        }),
        sendMessage: new schema_1.MuStruct({
            name: new schema_1.MuUTF8(),
            payload: new schema_1.MuUTF8(),
        }),
    },
};
//# sourceMappingURL=gui-protocol.js.map