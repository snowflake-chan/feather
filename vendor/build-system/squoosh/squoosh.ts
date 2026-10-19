// Minimal API from Squoosh
import {
  ImageCodec,
  codecs,
  preprocessors,
  PreprocessorName,
  PreprocessorOption,
  CodecName,
  CodecOption,
} from './codecs';
import { ContentServer } from '@box/content-server';

export async function preprocessImage<P extends PreprocessorName>(spec: {
  content: ContentServer;
  data: Uint8ClampedArray;
  width: number;
  height: number;
  preprocessor: P;
  options?: Partial<PreprocessorOption[P]>;
}) {
  const preprocessor = preprocessors[spec.preprocessor];
  const instance = await preprocessor.instantiate(spec.content);
  const options: any = Object.assign({}, preprocessor.defaultOptions);
  if (spec.options) {
    Object.assign(options, spec.options);
  }
  return instance(spec.data, spec.width, spec.height, options);
}

export async function decodeImage(spec: {
  content: ContentServer;
  hash: string;
}) {
  const bytes = await spec.content.retrieve(spec.hash);
  if (!bytes) {
    throw new Error(`Error retrieving image ${spec.hash}`);
  }
  let firstChunkString: string = '';
  for (let i = 0; i < Math.min(16, bytes.length); ++i) {
    firstChunkString += String.fromCodePoint(bytes[i]);
  }
  const formats = Object.keys(codecs);
  for (let i = 0; i < formats.length; ++i) {
    const key = formats[i];
    const codec: ImageCodec<any> = codecs[key];
    if (codec.detectors.some((detector) => detector.exec(firstChunkString))) {
      return (await codec.dec(spec.content)).decode(bytes);
    }
  }
  throw new Error('Unrecognized image format for ' + spec.hash);
}

export async function encodeImage<C extends CodecName>(spec: {
  content: ContentServer;
  data: Uint8ClampedArray;
  width: number;
  height: number;
  codec: C;
  options?: Partial<CodecOption[C]>;
}) {
  const codec = codecs[spec.codec];
  if (!codec) {
    throw new Error('Invalid codec: ' + spec.codec);
  }
  const encoder = await codec.enc(spec.content);
  const options: any = Object.assign({}, codec.defaultEncoderOptions);
  if (spec.options) {
    Object.assign(options, spec.options);
  }
  const buffer = encoder.encode(spec.data, spec.width, spec.height, options);
  if (!buffer) {
    throw new Error(`Error encoding image with codec ${spec.codec}`);
  }
  return await spec.content.store(buffer);
}
