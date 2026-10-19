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
exports.fromVersion = '0.0.8';
exports.toVersion = '0.0.9';
function defaultDamage() {
    return {
        enabled: false,
        showHealth: true,
        hp: 100,
        maxHp: 100,
    };
}
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield bs.retrieveJSON(hash);
        project.version = '0.0.9';
        project.prevHash = hash;
        project.player.damage = defaultDamage();
        const seeds = project.seeds;
        const seedIds = Object.keys(seeds);
        for (let i = 0; i < seedIds.length; ++i) {
            const s = seeds[seedIds[i]];
            s.props.damage = defaultDamage;
        }
        return bs.storeJSON(project);
    });
}
//# sourceMappingURL=project-0.0.8.js.map