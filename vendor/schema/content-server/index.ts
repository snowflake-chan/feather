import { MuASCII } from '@box/mudb/schema';

export const HashSchema = new MuASCII();
export type Hash = typeof HashSchema.identity;
