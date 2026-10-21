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
exports.fromVersion = '0.0.0';
exports.toVersion = '0.0.1';
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield bs.retrieveJSON(hash);
        project.version = '0.0.1';
        project.jsScript = '';
        project.prevHash = hash;
        project.physics = {
            gravity: -0.1,
            velocityDamping: 0.02,
        };
        project.environment = project.environment || {
            fog: {
                extinction: {
                    r: 0.001,
                    g: 0.0012,
                    b: 0.0014,
                },
                scattering: {
                    r: 0.001,
                    g: 0.0012,
                    b: 0.0014,
                },
            },
            sky: {
                sunPhase: 0,
                sunFrequency: 0.1,
                lunarPhase: 0.5,
            },
            snow: {
                density: 0.11,
                size: {
                    w: 1,
                    h: 1,
                },
                texture: '',
                fallSpeed: 1,
                spinSpeed: 0,
                color: {
                    r: 1,
                    g: 1,
                    b: 1,
                    a: 1,
                },
            },
            rain: {
                density: 0,
                phi: 0,
                theta: Math.PI / 2 + 0.3,
                speed: 1,
                size: {
                    w: 0,
                    h: 0,
                },
                interference: 0.04,
                color: {
                    r: 1,
                    g: 1,
                    b: 1,
                    a: 1,
                },
            },
        };
        project.seeds = project.seeds || {};
        project.assets = project.assets || {};
        return bs.storeJSON(project);
    });
}
//# sourceMappingURL=project-0.0.0.js.map