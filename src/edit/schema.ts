import {
  MuStruct,
  MuUint32,
  MuUTF8,
  MuArray,
  MuUint8,
  MuDictionary,
  MuBoolean,
  MuASCII,
  MuSchema,
} from '@box/mudb/schema';
import { DB } from '@box/schema/backend/database-type';

export enum EditorMode {
  GameEditor,
  ScriptEditor,
  VoxelEditor,
}

export enum EditorTab {
  None,
  GameObject,
  Terrain,
  Script,
  Environment,
  Hierarchy,
  CodeHierarchy,
  Setting,
  SeedDetail,
  File,
  GameDetail,
  Publish,
  Collaborator,
  FileSystem,
  VersionControl,
}

export enum EditorUIEvent {
  openMusicLibrary,
  onMusicLibraryClose,
}

export const ModelSchema = new MuStruct({
  id: new MuUint32(),
  name: new MuUTF8(),
  previewHash: new MuUTF8(),
  meshHash: new MuUTF8(),
  projectHash: new MuUTF8(),
});
export type Model = typeof ModelSchema.identity;

export const ProjectReviewInfoSchema = new MuStruct({
  reason: new MuArray(new MuUint8(), Infinity),
  title: new MuUTF8(),
  details: new MuUTF8(),
});
export type ProjectReviewInfo = typeof ProjectReviewInfoSchema.identity;

export const ModelListSchema = new MuStruct({
  onlineModel: new MuStruct({
    models: new MuArray(ModelSchema, Infinity),
    count: new MuUint32(),
  }),
  privateModel: new MuStruct({
    models: new MuArray(ModelSchema, Infinity),
    count: new MuUint32(),
  }),
  projectModel: new MuStruct({
    models: new MuArray(ModelSchema, Infinity),
  }),
});
export type ModelList = typeof ModelListSchema.identity;

export const TerrainRecord = new MuStruct({
  lastVoxel: new MuUint32(),
  selectedVoxel: new MuDictionary(new MuUint32(), Infinity),
  voxelUsed: new MuDictionary(new MuUint32(), Infinity),
});
