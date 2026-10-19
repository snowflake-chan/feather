import { MuBoolean, MuStruct, MuUTF8, MuVarint } from '@box/mudb/schema';

export const GUIScriptProtocol = {
  name: 'gui',
  client: {
    return: new MuStruct({
      handle: new MuVarint(),
      value: new MuUTF8(),
    }),
    throw: new MuStruct({
      handle: new MuVarint(),
      message: new MuUTF8(),
    }),
    sendMessage: new MuStruct({
      id: new MuVarint(),
      name: new MuUTF8(),
      payload: new MuUTF8(),
    }),
  },
  server: {
    init: new MuStruct({
      id: new MuVarint(),
      handle: new MuVarint(),
      data: new MuUTF8(),
    }),
    append: new MuStruct({
      id: new MuVarint(),
      handle: new MuVarint(),
      selector: new MuUTF8(),
      data: new MuUTF8(),
    }),
    remove: new MuStruct({
      id: new MuVarint(),
      handle: new MuVarint(),
      selector: new MuUTF8(),
    }),
    show: new MuStruct({
      id: new MuVarint(),
      handle: new MuVarint(),
      name: new MuUTF8(),
      allowMultiple: new MuBoolean(false),
    }),
    getAttribute: new MuStruct({
      id: new MuVarint(),
      handle: new MuVarint(),
      selector: new MuUTF8(),
      name: new MuUTF8(),
    }),
    setAttribute: new MuStruct({
      id: new MuVarint(),
      handle: new MuVarint(),
      selector: new MuUTF8(),
      name: new MuUTF8(),
      value: new MuUTF8(),
    }),
  },
};
