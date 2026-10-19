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
exports.fromVersion = '0.3.1';
exports.toVersion = '0.3.2';
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield bs.retrieveJSON(hash);
        project.version = '0.3.2';
        project.prevHash = hash;
        // turn on trigger API for legacy scripts, projects created after version 0.3.2 do not get access to triggers
        project.features = {
            enableTriggerAPI: true,
        };
        // set up collision filter
        project.collisionFilter = [];
        // store zones
        project.zones = yield bs.storeJSON([]);
        // update fog for environment
        const env = yield bs.retrieveJSON(project.environment);
        env.fog = {
            fogColor: env.sky.fogColor,
            fogStartDistance: env.sky.fogStartDistance,
            fogHeightOffset: env.sky.fogHeightOffset,
            fogHeightFalloff: env.sky.fogHeightFalloff,
            fogDensity: env.sky.fogDensity,
            maxFog: env.sky.maxFog,
        };
        project.environment = yield bs.storeJSON(env);
        return bs.storeJSON(project);
    });
}
//# sourceMappingURL=project-0.3.2.js.map