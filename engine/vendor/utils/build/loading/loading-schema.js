"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskSchema = exports.TaskTypeEnum = void 0;
const schema_1 = require("@box/mudb/schema");
var TaskTypeEnum;
(function (TaskTypeEnum) {
    TaskTypeEnum[TaskTypeEnum["Get"] = 0] = "Get";
    TaskTypeEnum[TaskTypeEnum["Image"] = 1] = "Image";
    TaskTypeEnum[TaskTypeEnum["Downloaded"] = 2] = "Downloaded";
    TaskTypeEnum[TaskTypeEnum["Mesh"] = 3] = "Mesh";
    TaskTypeEnum[TaskTypeEnum["Steam"] = 4] = "Steam";
    TaskTypeEnum[TaskTypeEnum["Chunk"] = 5] = "Chunk";
    TaskTypeEnum[TaskTypeEnum["Decompress"] = 6] = "Decompress";
    TaskTypeEnum[TaskTypeEnum["Normal"] = 7] = "Normal";
})(TaskTypeEnum || (exports.TaskTypeEnum = TaskTypeEnum = {}));
exports.TaskSchema = new schema_1.MuStruct({
    taskName: new schema_1.MuUTF8(),
    taskType: new schema_1.MuUint8(0),
});
