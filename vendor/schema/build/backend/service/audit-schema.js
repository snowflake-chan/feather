"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditSchema = exports.UploadHistorySchema = exports.AuditResultSchema = exports.AuditDetailSchema = exports.AuditStatus = exports.AuditType = void 0;
const array_1 = require("@box/mudb/schema/array");
const date_1 = require("@box/mudb/schema/date");
const option_1 = require("@box/mudb/schema/option");
const struct_1 = require("@box/mudb/schema/struct");
const utf8_1 = require("@box/mudb/schema/utf8");
const varint_1 = require("@box/mudb/schema/varint");
var AuditType;
(function (AuditType) {
    AuditType[AuditType["image"] = 0] = "image";
    AuditType[AuditType["audio"] = 1] = "audio";
})(AuditType || (exports.AuditType = AuditType = {}));
var AuditStatus;
(function (AuditStatus) {
    AuditStatus[AuditStatus["init"] = 0] = "init";
    AuditStatus[AuditStatus["waiting"] = 1] = "waiting";
    AuditStatus[AuditStatus["reject"] = 2] = "reject";
    AuditStatus[AuditStatus["accept"] = 3] = "accept";
    AuditStatus[AuditStatus["manuallyReject"] = 4] = "manuallyReject";
    AuditStatus[AuditStatus["manuallyAccept"] = 5] = "manuallyAccept";
    AuditStatus[AuditStatus["error"] = 6] = "error";
})(AuditStatus || (exports.AuditStatus = AuditStatus = {}));
exports.AuditDetailSchema = new struct_1.MuStruct({
    startTime: new varint_1.MuVarint(), // second
    endTime: new varint_1.MuVarint(),
    text: new utf8_1.MuUTF8(),
    label: new utf8_1.MuUTF8(),
    // persons: new MuJSON(), // supported when request
    // url: new MuUTF8(), // same here
    hintWords: new option_1.MuOption(new array_1.MuArray(new utf8_1.MuUTF8(), Infinity)),
    keyword: new utf8_1.MuUTF8(),
    libName: new utf8_1.MuUTF8(), // see details here https://help.aliyun.com/document_detail/89630.html
});
exports.AuditResultSchema = new struct_1.MuStruct({
    scene: new utf8_1.MuUTF8(),
    label: new utf8_1.MuUTF8(),
    suggestion: new utf8_1.MuUTF8(),
    rate: new varint_1.MuVarint(),
    details: new option_1.MuOption(new array_1.MuArray(exports.AuditDetailSchema, Infinity)),
});
exports.UploadHistorySchema = new struct_1.MuStruct({
    id: new varint_1.MuVarint(),
    user_id: new varint_1.MuVarint(),
    hash: new utf8_1.MuUTF8(),
    type: new varint_1.MuVarint(),
    scence: new varint_1.MuVarint(),
    created_at: new date_1.MuDate(),
    updated_at: new date_1.MuDate(),
});
exports.AuditSchema = new struct_1.MuStruct({
    id: new varint_1.MuVarint(),
    hash: new utf8_1.MuUTF8(),
    type: new varint_1.MuVarint(),
    task_id: new utf8_1.MuUTF8(),
    original_info: exports.AuditResultSchema,
    error_log: new utf8_1.MuUTF8(),
    status: new varint_1.MuVarint(),
    created_at: new date_1.MuDate(),
    updated_at: new date_1.MuDate(),
});
