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
import { Vec3Schema } from '@box/schema/utils/math-schema';
import { ModelType } from '@box/apis';

export enum EditorUIEvent {
  openMusicLibrary,
  onMusicLibraryClose,
}

export const ModelSchema = new MuStruct({
  id: new MuUint32(),
  name: new MuUTF8(),
  previewFileHash: new MuUTF8(),
  modelFileHash: new MuUTF8(),
  bounds: Vec3Schema,
  /**
   * 此类型在后端字段中已不再区分Public与Private
   * Private类型的模型也会存在已发布的模型数据
   * 因此需要注意：
   * 不要赋值「从getModelsUsingGetV2接口获取的模型信息的返回值」
   * 直接赋值「调用getModelsUsingGetV2接口时的入参modelType」
   */
  type: <MuSchema<ModelType>>new MuUint8(),
  animated: new MuBoolean(false),
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
  extendsionLibModel: new MuStruct({
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
