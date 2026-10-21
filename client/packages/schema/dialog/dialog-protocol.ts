import {
  MuStruct,
  MuVarint,
  MuUTF8,
  MuUnion,
  MuVoid,
  MuBoolean,
  MuArray,
  MuQuantizedFloat,
} from '@box/mudb/schema';

export const RGBASchema = new MuStruct({
  r: new MuQuantizedFloat(1 / 256, 1),
  g: new MuQuantizedFloat(1 / 256, 1),
  b: new MuQuantizedFloat(1 / 256, 1),
  a: new MuQuantizedFloat(1 / 256, 1),
});

export const XYZSchema = new MuStruct({
  x: new MuQuantizedFloat(1 / 64, 0),
  y: new MuQuantizedFloat(1 / 64, 0),
  z: new MuQuantizedFloat(1 / 64, 0),
});

export const DialogCommonConfigSchema = new MuStruct({
  title: new MuUTF8(''),
  content: new MuUTF8(''),
  titleBackgroundColor: RGBASchema,
  titleTextColor: RGBASchema,
  contentBackgroundColor: RGBASchema,
  contentTextColor: RGBASchema,

  lookTargetEnabled: new MuBoolean(),
  lookTargetEntity: new MuVarint(0),
  lookTargetOffset: XYZSchema,

  lookUpEnabled: new MuBoolean(),
  lookUp: XYZSchema,

  lookEyeEnabled: new MuBoolean(),
  lookEyeEntity: new MuVarint(0),
  lookEyeOffset: XYZSchema,
});

export type DialogCommonConfig = typeof DialogCommonConfigSchema.identity;

export const TextDialogConfigSchema = new MuStruct({
  common: DialogCommonConfigSchema,
  hasArrow: new MuBoolean(false),
});
export type TextDialogConfig = typeof TextDialogConfigSchema.identity;

export const InputDialogConfigSchema = new MuStruct({
  common: DialogCommonConfigSchema,
  placeholder: new MuUTF8(),
  confirmText: new MuUTF8(),
});
export type InputDialogConfig = typeof InputDialogConfigSchema.identity;

export const SelectDialogConfigSchema = new MuStruct({
  common: DialogCommonConfigSchema,
  options: new MuArray(new MuUTF8(), Infinity),
});
export type SelectDialogConfig = typeof SelectDialogConfigSchema.identity;

export const DialogConfigSchema = new MuUnion({
  // TODO: you can add more dialog types here
  text: TextDialogConfigSchema,
  input: InputDialogConfigSchema,
  select: SelectDialogConfigSchema,
});

export type DialogConfig = typeof DialogConfigSchema.identity;

const DialogSelectResultSchema = new MuStruct({
  index: new MuVarint(),
  value: new MuUTF8(),
});

export type DialogSelectResult = typeof DialogSelectResultSchema.identity;

export const DialogResultSchema = new MuUnion({
  close: new MuVoid(),

  // TODO: you can add more dialog response types here
  // must use same names as in config schema
  text: new MuUTF8(),
  input: new MuUTF8(),
  select: DialogSelectResultSchema,
});

export type DialogResult = typeof DialogResultSchema.identity;

export const OpenDialogSchema = new MuStruct({
  rpcId: new MuVarint(),
  config: DialogConfigSchema,
});

export type OpenDialog = typeof OpenDialogSchema.identity;

export const CloseDialogSchema = new MuStruct({
  rpcId: new MuVarint(),
  result: DialogResultSchema,
});

export const DialogProtocol = {
  name: 'dialog',
  client: {
    open: OpenDialogSchema,
    cancelDialogs: new MuVoid(),
    cancelDialog: new MuVarint(),
  },
  server: {
    close: CloseDialogSchema,
  },
};
