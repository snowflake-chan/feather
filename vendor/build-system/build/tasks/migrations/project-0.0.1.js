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
exports.fromVersion = '0.0.1';
exports.toVersion = '0.0.2';
function migration(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield bs.retrieveJSON(hash);
        project.version = '0.0.2';
        project.prevHash = hash;
        project.scriptIndex = [];
        project.player = {
            initialYaw: 0,
            allowFlight: false,
            allowMove: true,
            noClip: false,
            walkSpeed: 0.22,
            walkAcceleration: 0.19,
            runSpeed: 0.4,
            runAcceleration: 0.35,
            crouchSpeed: 0.1,
            crouchAcceleration: 0.09,
            swimSpeed: 0.4,
            swimAcceleration: 0.1,
            flySpeed: 2,
            flyAcceleration: 2,
            fallSpeed: 3.4e38,
            fallAcceleration: 0.05,
            jumpSpeedFactor: 0.85,
            jumpAccelerationFactor: 0.55,
            jumpPower: 0.96,
            doubleJumpPower: 0.9,
            mass: 1,
            friction: 0,
            restitution: 0,
            color: [1, 1, 1],
            emissive: 0,
            shininess: 0,
            metalness: 0,
        };
        return bs.storeJSON(project);
    });
}
//# sourceMappingURL=project-0.0.1.js.map