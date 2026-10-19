// Generic extension point for putting in random 1-off features in the editor
// Easy to add simple messages/rpc calls to this system

import {
  MuBoolean,
  MuVoid,
  MuStruct,
  MuUint32,
  MuASCII,
  MuVarint,
  MuBytes,
  MuUTF8,
  MuFloat64,
} from '@box/mudb/schema';

export const EditRPCProtocol = {
  name: 'edit-rpc',
  client: {
    buildVoxelResponse: new MuStruct({
      meshHash: new MuASCII(),
      id: new MuVarint(),
    }),
    uploadAudioResponse: new MuStruct({
      audioHash: new MuASCII(),
      id: new MuVarint(),
    }),
    uploadImageResponse: new MuStruct({
      imgHash: new MuASCII(),
      id: new MuVarint(),
    }),
    uploadAudioReject: new MuStruct({
      reason: new MuUTF8(''),
      id: new MuVarint(),
    }),
  },
  server: {
    setHacking: new MuBoolean(),
    buildVoxel: new MuStruct({
      hash: new MuASCII(),
      id: new MuVarint(),
    }),
    genAudioFromUploader: new MuStruct({
      sampleRate: new MuVarint(),
      buffer: new MuBytes(),
      id: new MuVarint(),
    }),
    genImageFromUploader: new MuStruct({
      imgBuffer: new MuBytes(),
      type: new MuUTF8('png'),
      width: new MuFloat64(0),
      height: new MuFloat64(0),
      id: new MuVarint(),
    }),
  },
};
