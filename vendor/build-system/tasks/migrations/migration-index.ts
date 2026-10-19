import { preprocessMigrations } from '../../migrations';

import * as Project000 from './project-0.0.0';
import * as Project001 from './project-0.0.1';
import * as Project002 from './project-0.0.2';
import * as Project003 from './project-0.0.3';
import * as Project004 from './project-0.0.4';
import * as Project005 from './project-0.0.5';
import * as Project006 from './project-0.0.6';
import * as Project007 from './project-0.0.7';
import * as Project008 from './project-0.0.8';
import * as Project009 from './project-0.0.9';
import * as Project010 from './project-0.0.10';
import * as Project011 from './project-0.0.11';
import * as Project012 from './project-0.0.12';
import * as Project013 from './project-0.0.13';
import * as Project014 from './project-0.0.14';
import * as Project1_000 from './project-0.1.0';
import * as Project1_001 from './project-0.1.1';
import * as Project1_002 from './project-0.1.2';
import * as Project1_003 from './project-0.1.3';
import * as Project1_004 from './project-0.1.4';
import * as Project1_005 from './project-0.1.5';
import * as Project1_006 from './project-0.1.6';
import * as Project2_000 from './project-0.2.0';
import * as Project2_001 from './project-0.2.1';
import * as Project2_002 from './project-0.2.2';
import * as Project3_000 from './project-0.3.0';
import * as Project3_001 from './project-0.3.1';
import * as Project3_002 from './project-0.3.2';
import * as Project3_003 from './project-0.3.3';
import * as Project3_004 from './project-0.3.4';
import * as Project3_005 from './project-0.3.5';
import * as Project3_006 from './project-0.3.6';
import * as Project3_007 from './project-0.3.7';
import * as Project3_008 from './project-0.3.8';
import * as Project3_009 from './project-0.3.9';
import * as Project3_010 from './project-0.3.10';
import * as Project3_011 from './project-0.3.11';
import * as Project3_012 from './project-0.3.12';
import * as Project3_013 from './project-0.3.13';
import * as Project3_014 from './project-0.3.14';
import * as Project3_015 from './project-0.3.15';
import * as Project3_016 from './project-0.3.16';
import * as Project3_017 from './project-0.3.17';
import * as Project3_018 from './project-0.3.18';
import * as Project3_019 from './project-0.3.19';
import * as Project3_020 from './project-0.3.20';
import * as Project3_021 from './project-0.3.21';
import * as Project3_022 from './project-0.3.22';
import * as Project3_023 from './project-0.3.23';
import * as Project3_024 from './project-0.3.24';
import * as Project3_025 from './project-0.3.25';
import * as Project3_026 from './project-0.3.26';
import * as Project3_027 from './project-0.3.27';
import * as Project3_028 from './project-0.3.28';
import * as Project3_029 from './project-0.3.29';
import * as Project3_030 from './project-0.3.30';
import * as Project3_031 from './project-0.3.31';

import * as Permission000 from './permission-0.0.0';
import * as Permission001 from './permission-0.0.1';
import * as Permission1_000 from './permission-0.1.0';
import * as Permission1_001 from './permission-0.1.1';
import * as Permission1_002 from './permission-0.1.2';
import * as Permission1_003 from './permission-0.1.3';
import * as Permission1_004 from './permission-0.1.4';
import * as Permission1_005 from './permission-0.1.5';
import * as Permission1_006 from './permission-0.1.6';
import * as Permission1_007 from './permission-0.1.7';
import * as Permission1_008 from './permission-0.1.8';

import {
  UiTree_001,
  AudioAssets_001,
} from './group-project/group-project-0.0.1';
import {
  UiTree_002,
  AudioAssets_002,
} from './group-project/group-project-0.0.2';

export const migrationTasks = preprocessMigrations([
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

  UiTree_001,
  AudioAssets_001,
  UiTree_002,
  AudioAssets_002,
]).migrationTasks;
