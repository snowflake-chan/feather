"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OBBContactConstraint = exports.AABBContactConstraint = void 0;
const aabb_1 = require("./aabb");
const obb_1 = require("./obb");
exports.AABBContactConstraint = new aabb_1.AABBContact();
exports.OBBContactConstraint = new obb_1.OBBContact();
