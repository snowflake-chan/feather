import {
  MuBoolean,
  MuStruct,
  MuUTF8,
  MuVarint,
  MuVoid,
} from '@box/mudb/schema';

export const GUIProtocol = {
  name: 'gui',
  client: {
    init: new MuStruct({
      handle: new MuVarint(),
      data: new MuUTF8(),
    }),
    append: new MuStruct({
      handle: new MuVarint(),
      selector: new MuUTF8(),
      data: new MuUTF8(),
    }),
    remove: new MuStruct({
      handle: new MuVarint(),
      selector: new MuUTF8(),
    }),
    show: new MuStruct({
      handle: new MuVarint(),
      name: new MuUTF8(),
      allowMultiple: new MuBoolean(false),
    }),
    getAttribute: new MuStruct({
      handle: new MuVarint(),
      selector: new MuUTF8(),
      name: new MuUTF8(),
    }),
    setAttribute: new MuStruct({
      handle: new MuVarint(),
      selector: new MuUTF8(),
      name: new MuUTF8(),
      value: new MuUTF8(),
    }),
    reset: new MuVoid(),
  },
  server: {
    return: new MuStruct({
      handle: new MuVarint(),
      value: new MuUTF8(),
    }),
    throw: new MuStruct({
      handle: new MuVarint(),
      message: new MuUTF8(),
    }),
    sendMessage: new MuStruct({
      name: new MuUTF8(),
      payload: new MuUTF8(),
    }),
  },
};
