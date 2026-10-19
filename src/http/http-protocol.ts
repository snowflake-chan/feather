import {
  MuArray,
  MuASCII,
  MuBytes,
  MuDictionary,
  MuInt16,
  MuStruct,
  MuUnion,
  MuUTF8,
  MuVarint,
} from '@box/mudb/schema';

export const HeadersSchema = new MuDictionary(
  new MuArray(new MuASCII(), Infinity),
  Infinity,
);

const ErrorSchema = new MuStruct({
  handle: new MuVarint(),
  error: new MuUTF8(),
});

export const HttpScriptProtocol = {
  name: 'http',
  client: {
    fetchResponseHead: new MuStruct({
      handle: new MuVarint(),
      headers: HeadersSchema,
      statusCode: new MuInt16(200),
      statusMessage: new MuASCII('OK'),
    }),
    fetchError: ErrorSchema,
    fetchBodyText: new MuStruct({
      handle: new MuVarint(),
      body: new MuUTF8(),
    }),
    fetchBodyArrayBuffer: new MuStruct({
      handle: new MuVarint(),
      body: new MuBytes(),
    }),
    readBodyError: ErrorSchema,
  },
  server: {
    fetch: new MuStruct({
      handle: new MuVarint(),
      url: new MuASCII(),
      timeout: new MuVarint(5000),
      method: new MuASCII('GET'),
      headers: HeadersSchema,
      body: new MuUnion({
        arrayBuffer: new MuBytes(),
        text: new MuUTF8(),
      }),
    }),
    readText: new MuVarint(),
    readArrayBuffer: new MuVarint(),
    close: new MuVarint(),
  },
};
