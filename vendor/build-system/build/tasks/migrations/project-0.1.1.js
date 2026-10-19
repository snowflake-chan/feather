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
exports.fromVersion = '0.1.0';
exports.toVersion = '0.1.1';
// adds particles
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield bs.retrieveJSON(hash);
        project.version = '0.1.1';
        project.prevHash = hash;
        project.timestamp = new Date();
        // initialize particle state
        const entities = project.entities;
        Object.keys(entities).forEach((id) => {
            const entity = entities[id];
            entity.particle = {
                // emit rate
                rate: 0,
                rateSpread: 0,
                limit: 0,
                lifetime: 10,
                lifetimeSpread: 0,
                // color
                color0: { r: 1, g: 1, b: 1 },
                color1: { r: 1, g: 1, b: 1 },
                color2: { r: 1, g: 1, b: 1 },
                color3: { r: 1, g: 1, b: 1 },
                color4: { r: 1, g: 1, b: 1 },
                // size
                size0: 1,
                size1: 1,
                size2: 1,
                size3: 1,
                size4: 1,
                sizeSpread: 0,
                // motion parameters
                velocity: { x: 0, y: 0, z: 0 },
                velocitySpread: { x: 0, y: 0, z: 0 },
                acceleration: { x: 0, y: 0, z: 0 },
                damping: 0,
                noiseAmpl: 0,
                noiseFreq: 0,
            };
        });
        return bs.storeJSON(project);
    });
}
//# sourceMappingURL=project-0.1.1.js.map