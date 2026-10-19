import { MuStruct, MuUTF8, MuBoolean } from '@box/mudb/schema';

export const HyperLinkSchema = new MuStruct({
  href: new MuUTF8(''),
  warning: new MuBoolean(false),
  isConfirm: new MuBoolean(true),
  isNewTab: new MuBoolean(true),
});

export type HyperLink = typeof HyperLinkSchema.identity;
