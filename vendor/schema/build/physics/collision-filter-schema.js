"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollisionFilterSchema = exports.CollisionGroupSchema = void 0;
const schema_1 = require("@box/mudb/schema");
exports.CollisionGroupSchema = new schema_1.MuSortedArray(new schema_1.MuVarint(), Infinity, (a, b) => a - b);
exports.CollisionFilterSchema = new schema_1.MuArray(exports.CollisionGroupSchema, Infinity);
//# sourceMappingURL=collision-filter-schema.js.map