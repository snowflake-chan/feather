import {
  MuStruct,
  MuUTF8,
  MuArray,
  MuVarint,
  MuDate,
  MuSchema,
  MuOption,
} from '@box/mudb/schema';
import { UploadScene } from '../rpc/user-protocol';

export enum AuditType {
  image,
  audio,
}

export enum AuditStatus {
  init,
  waiting,
  reject,
  accept,
  manuallyReject,
  manuallyAccept,
  error,
}

export type Label =
  | 'normal'
  | 'spam'
  | 'ad'
  | 'politics'
  | 'terrorism'
  | 'abuse'
  | 'porn'
  | 'flood'
  | 'contraband'
  | 'meaningless'
  | 'customized';
export type Suggestion = 'pass' | 'review' | 'block';

export const AuditDetailSchema = new MuStruct({
  startTime: new MuVarint(), // second
  endTime: new MuVarint(),
  text: new MuUTF8(),
  label: <MuSchema<Label>>new MuUTF8(),
  // persons: new MuJSON(), // supported when request
  // url: new MuUTF8(), // same here
  hintWords: new MuOption(new MuArray(new MuUTF8(), Infinity)),
  keyword: new MuUTF8(),
  libName: new MuUTF8(), // see details here https://help.aliyun.com/document_detail/89630.html
});

export const AuditResultSchema = new MuStruct({
  scene: new MuUTF8(),
  label: <MuSchema<Label>>new MuUTF8(),
  suggestion: <MuSchema<Suggestion>>new MuUTF8(),
  rate: new MuVarint(),
  details: new MuOption(new MuArray(AuditDetailSchema, Infinity)),
});

export const UploadHistorySchema = new MuStruct({
  id: new MuVarint(),
  user_id: new MuVarint(),
  hash: new MuUTF8(),
  type: <MuSchema<AuditType>>new MuVarint(),
  scence: <MuSchema<UploadScene>>new MuVarint(),
  created_at: new MuDate(),
  updated_at: new MuDate(),
});

export const AuditSchema = new MuStruct({
  id: new MuVarint(),
  hash: new MuUTF8(),
  type: <MuSchema<AuditType>>new MuVarint(),
  task_id: new MuUTF8(),
  original_info: AuditResultSchema,
  error_log: new MuUTF8(),
  status: <MuSchema<AuditStatus>>new MuVarint(),
  created_at: new MuDate(),
  updated_at: new MuDate(),
});
