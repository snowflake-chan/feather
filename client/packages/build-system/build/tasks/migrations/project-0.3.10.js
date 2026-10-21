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
exports.fromVersion = '0.3.9';
exports.toVersion = '0.3.10';
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield bs.retrieveJSON(hash);
        project.version = '0.3.10';
        project.prevHash = hash;
        // add global light in environment sky
        const env = yield bs.retrieveJSON(project.environment);
        env.sky.globalLight = 0.0;
        // add global light in zones sky
        const zones = yield bs.retrieveJSON(project.zones);
        zones.forEach((zone) => {
            zone.sky.globalLight = 0.0;
        });
        project.environment = yield bs.storeJSON(env);
        project.zones = yield bs.storeJSON(zones);
        return bs.storeJSON(project);
    });
}
//# sourceMappingURL=project-0.3.10.js.map