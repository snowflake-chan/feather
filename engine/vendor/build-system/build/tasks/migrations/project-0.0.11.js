"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toVersion = exports.fromVersion = exports.name = void 0;
exports.migration = migration;
exports.name = 'project';
exports.fromVersion = '0.0.11';
exports.toVersion = '0.0.12';
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield bs.retrieveJSON(hash);
        project.version = '0.0.12';
        project.prevHash = hash;
        // update project name and description
        project.description = '';
        project.previewImage = '';
        delete project.environment.fog;
        const sky = project.environment.sky;
        sky.skyType = 0;
        sky.sunDirection = { x: 0, y: 1, z: 0 };
        sky.sunColor = { r: 1000, g: 1000, b: 1000 };
        sky.skyLeft = { r: 0, g: 0, b: 0 };
        sky.skyRight = { r: 0, g: 0, b: 0 };
        sky.skyTop = { r: 0, g: 0, b: 0 };
        sky.skyBottom = { r: 0, g: 0, b: 0 };
        sky.skyFront = { r: 0, g: 0, b: 0 };
        sky.skyBack = { r: 0, g: 0, b: 0 };
        sky.fogStartDistance = 0;
        sky.fogHeightDensity = 0;
        sky.fogHeightOffset = 0;
        sky.fogHeightFalloff = 0.8;
        sky.fogDensity = 0;
        sky.maxFog = 1;
        return bs.storeJSON(project);
    });
}
//# sourceMappingURL=project-0.0.11.js.map