"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SciptCollisionFilterSpecSchema = void 0;
const struct_1 = require("@box/mudb/schema/struct");
const utf8_1 = require("@box/mudb/schema/utf8");
exports.SciptCollisionFilterSpecSchema = new struct_1.MuStruct({
    a: new utf8_1.MuUTF8(),
    b: new utf8_1.MuUTF8(),
});
