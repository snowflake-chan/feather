import { MuASCII } from '@box/mudb/schema/ascii';

export const HashSchema = new MuASCII();
export type Hash = typeof HashSchema.identity;
