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
exports.migrationTasks = void 0;
const migrations_1 = require("../../migrations");
const Project000 = __importStar(require("./project-0.0.0"));
const Project001 = __importStar(require("./project-0.0.1"));
const Project002 = __importStar(require("./project-0.0.2"));
const Project003 = __importStar(require("./project-0.0.3"));
const Project004 = __importStar(require("./project-0.0.4"));
const Project005 = __importStar(require("./project-0.0.5"));
const Project006 = __importStar(require("./project-0.0.6"));
const Project007 = __importStar(require("./project-0.0.7"));
const Project008 = __importStar(require("./project-0.0.8"));
const Project009 = __importStar(require("./project-0.0.9"));
const Project010 = __importStar(require("./project-0.0.10"));
const Project011 = __importStar(require("./project-0.0.11"));
const Project012 = __importStar(require("./project-0.0.12"));
const Project013 = __importStar(require("./project-0.0.13"));
const Project014 = __importStar(require("./project-0.0.14"));
const Project1_000 = __importStar(require("./project-0.1.0"));
const Project1_001 = __importStar(require("./project-0.1.1"));
const Project1_002 = __importStar(require("./project-0.1.2"));
const Project1_003 = __importStar(require("./project-0.1.3"));
const Project1_004 = __importStar(require("./project-0.1.4"));
const Project1_005 = __importStar(require("./project-0.1.5"));
const Project1_006 = __importStar(require("./project-0.1.6"));
const Project2_000 = __importStar(require("./project-0.2.0"));
const Project2_001 = __importStar(require("./project-0.2.1"));
const Project2_002 = __importStar(require("./project-0.2.2"));
const Project3_000 = __importStar(require("./project-0.3.0"));
const Project3_001 = __importStar(require("./project-0.3.1"));
const Project3_002 = __importStar(require("./project-0.3.2"));
const Project3_003 = __importStar(require("./project-0.3.3"));
const Project3_004 = __importStar(require("./project-0.3.4"));
const Project3_005 = __importStar(require("./project-0.3.5"));
const Project3_006 = __importStar(require("./project-0.3.6"));
const Project3_007 = __importStar(require("./project-0.3.7"));
const Project3_008 = __importStar(require("./project-0.3.8"));
const Project3_009 = __importStar(require("./project-0.3.9"));
const Project3_010 = __importStar(require("./project-0.3.10"));
const Project3_011 = __importStar(require("./project-0.3.11"));
const Project3_012 = __importStar(require("./project-0.3.12"));
const Project3_013 = __importStar(require("./project-0.3.13"));
const Project3_014 = __importStar(require("./project-0.3.14"));
const Project3_015 = __importStar(require("./project-0.3.15"));
const Project3_016 = __importStar(require("./project-0.3.16"));
const Project3_017 = __importStar(require("./project-0.3.17"));
const Project3_018 = __importStar(require("./project-0.3.18"));
const Project3_019 = __importStar(require("./project-0.3.19"));
const Project3_020 = __importStar(require("./project-0.3.20"));
const Project3_021 = __importStar(require("./project-0.3.21"));
const Project3_022 = __importStar(require("./project-0.3.22"));
const Project3_023 = __importStar(require("./project-0.3.23"));
const Project3_024 = __importStar(require("./project-0.3.24"));
const Project3_025 = __importStar(require("./project-0.3.25"));
const Project3_026 = __importStar(require("./project-0.3.26"));
const Project3_027 = __importStar(require("./project-0.3.27"));
const Project3_028 = __importStar(require("./project-0.3.28"));
const Project3_029 = __importStar(require("./project-0.3.29"));
const Project3_030 = __importStar(require("./project-0.3.30"));
const Project3_031 = __importStar(require("./project-0.3.31"));
const Permission000 = __importStar(require("./permission-0.0.0"));
const Permission001 = __importStar(require("./permission-0.0.1"));
const Permission1_000 = __importStar(require("./permission-0.1.0"));
const Permission1_001 = __importStar(require("./permission-0.1.1"));
const Permission1_002 = __importStar(require("./permission-0.1.2"));
const Permission1_003 = __importStar(require("./permission-0.1.3"));
const Permission1_004 = __importStar(require("./permission-0.1.4"));
const Permission1_005 = __importStar(require("./permission-0.1.5"));
const Permission1_006 = __importStar(require("./permission-0.1.6"));
const Permission1_007 = __importStar(require("./permission-0.1.7"));
const Permission1_008 = __importStar(require("./permission-0.1.8"));
const group_project_0_0_1_1 = require("./group-project/group-project-0.0.1");
const group_project_0_0_2_1 = require("./group-project/group-project-0.0.2");
exports.migrationTasks = (0, migrations_1.preprocessMigrations)([
    Project000,
    Project001,
    Project002,
    Project003,
    Project004,
    Project005,
    Project006,
    Project007,
    Project008,
    Project009,
    Project010,
    Project011,
    Project012,
    Project013,
    Project014,
    Project1_000,
    Project1_001,
    Project1_002,
    Project1_003,
    Project1_004,
    Project1_005,
    Project1_006,
    Project2_000,
    Project2_001,
    Project2_002,
    Project3_000,
    Project3_001,
    Project3_002,
    Project3_003,
    Project3_004,
    Project3_005,
    Project3_006,
    Project3_007,
    Project3_008,
    Project3_009,
    Project3_010,
    Project3_011,
    Project3_012,
    Project3_013,
    Project3_014,
    Project3_015,
    Project3_016,
    Project3_017,
    Project3_018,
    Project3_019,
    Project3_020,
    Project3_021,
    Project3_022,
    Project3_023,
    Project3_024,
    Project3_025,
    Project3_026,
    Project3_027,
    Project3_028,
    Project3_029,
    Project3_030,
    Project3_031,
    Permission000,
    Permission001,
    Permission1_000,
    Permission1_001,
    Permission1_002,
    Permission1_003,
    Permission1_004,
    Permission1_005,
    Permission1_006,
    Permission1_007,
    Permission1_008,
    group_project_0_0_1_1.UiTree_001,
    group_project_0_0_1_1.AudioAssets_001,
    group_project_0_0_2_1.UiTree_002,
    group_project_0_0_2_1.AudioAssets_002,
]).migrationTasks;
//# sourceMappingURL=migration-index.js.map