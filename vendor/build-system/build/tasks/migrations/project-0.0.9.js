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
exports.fromVersion = '0.0.9';
exports.toVersion = '0.0.10';
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield bs.retrieveJSON(hash);
        project.version = '0.0.10';
        project.prevHash = hash;
        // update spawn point and initial position
        const shape = project.voxels.shape;
        project.player.movementBounds = {
            lo: {
                x: -50,
                y: -50,
                z: -50,
            },
            hi: {
                x: shape.x + 50,
                y: shape.y + 50,
                z: shape.z + 50,
            },
        };
        project.player.initialPosition = {
            x: 0.5 * shape.x,
            y: shape.y + 25,
            z: 0.5 * shape.z,
        };
        return bs.storeJSON(project);
    });
}
//# sourceMappingURL=project-0.0.9.js.map