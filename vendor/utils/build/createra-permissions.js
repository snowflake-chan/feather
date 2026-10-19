"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateraPermissionNameMap = exports.Permissions = void 0;
exports.mapPermissionToCreatera = mapPermissionToCreatera;
exports.Permissions = {
    editPublish: 'engine:publish',
    debugger: 'engine:debug',
    editScripts: 'engine:script',
    editVoxels: 'engine:terrain',
    editModel: 'engine:model',
    editScene: 'engine:scene',
    editFile: 'engine:file',
    playButton: 'engine:run',
    editMarket: 'engine:market',
    editStatisticsData: 'statistics:data',
    editPlayer: 'engine:player',
};
exports.CreateraPermissionNameMap = Object.assign({}, Object.entries(exports.Permissions).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
}, {}));
function mapPermissionToCreatera(enginePermissions) {
    const res = [];
    Object.entries(enginePermissions).forEach(([key, havePermission]) => {
        if (havePermission && exports.Permissions[key]) {
            res.push(exports.Permissions[key]);
        }
    });
    return res;
}
