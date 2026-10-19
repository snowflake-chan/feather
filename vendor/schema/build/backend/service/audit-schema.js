"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditSchema = exports.UploadHistorySchema = exports.AuditResultSchema = exports.AuditDetailSchema = exports.AuditStatus = exports.AuditType = void 0;
const schema_1 = require("@box/mudb/schema");
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
exports.AuditDetailSchema = new schema_1.MuStruct({
    startTime: new schema_1.MuVarint(), // second
    endTime: new schema_1.MuVarint(),
    text: new schema_1.MuUTF8(),
    label: new schema_1.MuUTF8(),
    // persons: new MuJSON(), // supported when request
    // url: new MuUTF8(), // same here
    hintWords: new schema_1.MuOption(new schema_1.MuArray(new schema_1.MuUTF8(), Infinity)),
    keyword: new schema_1.MuUTF8(),
    libName: new schema_1.MuUTF8(), // see details here https://help.aliyun.com/document_detail/89630.html
});
exports.AuditResultSchema = new schema_1.MuStruct({
    scene: new schema_1.MuUTF8(),
    label: new schema_1.MuUTF8(),
    suggestion: new schema_1.MuUTF8(),
    rate: new schema_1.MuVarint(),
    details: new schema_1.MuOption(new schema_1.MuArray(exports.AuditDetailSchema, Infinity)),
});
exports.UploadHistorySchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    user_id: new schema_1.MuVarint(),
    hash: new schema_1.MuUTF8(),
    type: new schema_1.MuVarint(),
    scence: new schema_1.MuVarint(),
    created_at: new schema_1.MuDate(),
    updated_at: new schema_1.MuDate(),
});
exports.AuditSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    hash: new schema_1.MuUTF8(),
    type: new schema_1.MuVarint(),
    task_id: new schema_1.MuUTF8(),
    original_info: exports.AuditResultSchema,
    error_log: new schema_1.MuUTF8(),
    status: new schema_1.MuVarint(),
    created_at: new schema_1.MuDate(),
    updated_at: new schema_1.MuDate(),
});
//# sourceMappingURL=audit-schema.js.map