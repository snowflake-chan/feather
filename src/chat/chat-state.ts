import { MuArray, MuDictionary, MuStruct, MuUTF8 } from '@box/mudb/schema';

export const ChatStateSchema = new MuStruct({
  tempChats: new MuDictionary(
    new MuArray(new MuUTF8(), Infinity, []),
    Infinity,
  ),
});
