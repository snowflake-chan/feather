"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasks = void 0;
const buildUtils = __importStar(require("./tasks/utils"));
const imageProcess = __importStar(require("./tasks/image-process"));
const thumbnail = __importStar(require("./tasks/thumbnail"));
const buildResource = __importStar(require("./tasks/build-resource"));
const optimize = __importStar(require("./tasks/optimize"));
const importProject = __importStar(require("./tasks/import-project"));
const prebake = __importStar(require("./tasks/prebake"));
const buildTextures = __importStar(require("./tasks/texture"));
const buildSkin = __importStar(require("./tasks/build-skin"));
const buildVoxel = __importStar(require("./tasks/build-voxel"));
const migrateVoxel = __importStar(require("./tasks/migrate-voxel"));
const migrateSkin = __importStar(require("./tasks/migrate-skin"));
const voxelBounds = __importStar(require("./tasks/voxel-bounds"));
const audioProcess = __importStar(require("./tasks/audio-process"));
const buildAnim = __importStar(require("./tasks/build-anim"));
const buildBloomFilter = __importStar(require("./tasks/build-bloom-filter"));
const chineseHoliday = __importStar(require("./tasks/chinese-holiday"));
const migrateProject = __importStar(require("./tasks/migrate-project"));
const migration_index_1 = require("./tasks/migrations/migration-index");
exports.tasks = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, migration_index_1.migrationTasks), migrateProject), buildUtils), buildResource), optimize), imageProcess), thumbnail), importProject), prebake), buildTextures), buildSkin), buildVoxel), migrateVoxel), migrateSkin), voxelBounds), audioProcess), buildAnim), buildBloomFilter), chineseHoliday);
//# sourceMappingURL=task-index.js.map