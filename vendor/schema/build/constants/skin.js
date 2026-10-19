"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FREE_SKINS_BOX3 = exports.FREE_SKINS_CREATERA = void 0;
exports.getFreeSkinNames = getFreeSkinNames;
exports.FREE_SKINS_CREATERA = [
    'bearPlaymate',
    'coolExplorer',
    'pandaDeacons',
    'researcher',
    'sunnyGirl',
];
exports.FREE_SKINS_BOX3 = ['man', 'woman'];
function getFreeSkinNames(appEdition) {
    return appEdition === 'createra'
        ? [...exports.FREE_SKINS_CREATERA]
        : [...exports.FREE_SKINS_BOX3];
}
//# sourceMappingURL=skin.js.map