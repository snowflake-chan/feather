import { MuReadStream } from '@box/mudb/stream';
import { getCanvas2DContext } from '../utils/device';

export interface ParsedGIF {
  width: number;
  height: number;
  frames: FrameData[];
}

/**
 * 绘制方法
 */
export enum DisposalMethod {
  /**
   * 什么都不处理，直接画当前帧内容
   */
  None,
  /**
   * 覆盖绘制
   */
  Cover,
  /**
   * 恢复当前帧区域到背景颜色
   */
  RestoreToBackground,
  /**
   * 恢复当前帧区域到之前的数据
   * TODO: 没有理解跟覆盖绘制的区别，暂不处理，遇到bug再说【。
   */
  RestoreToPrevious,
}

export interface FrameData {
  top: number;
  left: number;
  width: number;
  height: number;
  delayTime: number;
  backgroundColor: [number, number, number, number];
  disposalMethod: DisposalMethod;
  imageData: ImageData;
}

export function parseGIF(bytes: Uint8Array): ParsedGIF {
  const stream = new MuReadStream(bytes);

  // title，永远是GIF
  stream.readASCII(3);
  // version，是89a或者87a
  stream.readASCII(3);

  const width = stream.readUint16();
  const height = stream.readUint16();

  const packedFields = stream.readUint8();
  const globalColorTableFlag = packedFields & (1 << 7) ? 1 : 0;
  const globalColorTableSize = packedFields & 0b111;

  // backgroundColorIndex
  const backgroundColorIndex = stream.readUint8();
  // pixelAspectRatio
  stream.readUint8();

  const globalColor: [number, number, number][] = [];

  if (globalColorTableFlag) {
    const colorSize = 1 << (globalColorTableSize + 1);
    for (let i = 0; i < colorSize; i++) {
      globalColor.push([
        stream.readUint8(),
        stream.readUint8(),
        stream.readUint8(),
      ]);
    }
  }

  const frames: FrameData[] = [];

  let currExtension: GraphicsControlExtension | undefined = undefined;
  // 循环解析数据本体，直到没有数据
  while (stream.offset + 1 < stream.length) {
    // 导入符，解析开始表示符，“!”、“,”、“;”
    const introducer = stream.readASCII(1);

    switch (introducer) {
      // “!”为扩展
      case '!':
        const extension = parseExtension(stream);
        if (extension) {
          currExtension = extension;
        }
        break;
      // “,”为图片
      case ',':
        const frameImage = parseImageData(stream);
        const transparency = currExtension?.transparentColorFlag
          ? currExtension.transparentColorIndex
          : undefined;
        const backgroundColor = getColorByIdx(
          backgroundColorIndex,
          globalColor,
          transparency,
        );
        const img = createImageData({
          colorTable: frameImage.localColorTable || globalColor,
          width: frameImage.width,
          height: frameImage.height,
          indexStream: frameImage.indexStream,
          transparency,
        });
        if (img) {
          frames.push({
            width: frameImage.width,
            height: frameImage.height,
            top: frameImage.top,
            left: frameImage.left,
            delayTime: (currExtension?.delayTime || 1) * 10,
            disposalMethod: currExtension?.disposalMethod || 0,
            backgroundColor,
            imageData: img,
          });
        }
        currExtension = undefined;
        break;
      // “;”表示结束了
      case ';':
        break;
      default:
        console.error(`parse gif error: Unknown introducer: ${introducer}`);
        break;
    }
  }

  return {
    width,
    height,
    frames,
  };
}

function dropSubBlocks(stream: MuReadStream) {
  let size = stream.readUint8();
  while (size) {
    stream.offset += size;
    size = stream.readUint8();
  }
}

interface GraphicsControlExtension {
  disposalMethod: number;
  transparentColorFlag: number;
  delayTime: number;
  transparentColorIndex: number;
}

function parseExtension(
  stream: MuReadStream,
): GraphicsControlExtension | undefined {
  // 扩展类型，label：0xF9、0xFE、0x01、0xFF
  const label = stream.readUint8();

  switch (label) {
    // 0xF9：解析 图形控制扩展
    case 0xf9:
      // blockSize
      stream.readUint8();
      const packedFields = stream.readUint8();
      // 第3-5位表示播放模式
      const disposalMethod = (packedFields & 0b11100) >> 2;
      const transparentColorFlag = packedFields & 0b1;
      const delayTime = stream.readUint16();
      const transparentColorIndex = stream.readUint8();
      // 结束标志
      stream.readASCII(1);

      return {
        disposalMethod,
        transparentColorFlag,
        delayTime,
        transparentColorIndex,
      };
    // 0xFE：解析 评论扩展
    case 0xfe:
    // 0x01：解析 纯文本扩展
    case 0x01:
    // 0xFF：解析 应用扩展
    case 0xff:
    default:
      // 这三个扩展对图片没有用处，不做解析，直接消耗字节空间即可
      dropSubBlocks(stream);
      return;
  }
}

interface FrameImageData {
  left: number;
  top: number;
  width: number;
  height: number;
  localColorTable?: [number, number, number][];
  indexStream: number[];
}
function parseImageData(stream: MuReadStream): FrameImageData {
  const left = stream.readUint16();
  const top = stream.readUint16();
  const width = stream.readUint16();
  const height = stream.readUint16();

  const packedFields = stream.readUint8();

  const localColorTableFlag = packedFields & (1 << 7) ? 1 : 0;

  const localColorTableSize = packedFields & 0b111;

  const localColor: [number, number, number][] = [];
  if (localColorTableFlag) {
    const colorSize = 1 << (localColorTableSize + 1);
    for (let i = 0; i < colorSize; i++) {
      localColor.push([
        stream.readUint8(),
        stream.readUint8(),
        stream.readUint8(),
      ]);
    }
  }

  const indexStream = parseImageContent(stream);

  return {
    left,
    top,
    width,
    height,
    localColorTable: localColorTableFlag ? localColor : undefined,
    indexStream: indexStream,
  };
}

interface LzwData {
  lzwMinimumCodeSize: number;
  blocks: {
    offset: number;
    length: number;
  }[];
}

function parseImageContent(stream: MuReadStream) {
  const lzwMinimumCodeSize = stream.readUint8();

  const offset = stream.offset;
  let blockSize = stream.readUint8();
  let length = 1;
  const blocks: Array<{
    offset: number;
    length: number;
  }> = [];
  while (blockSize > 0) {
    blocks.push({ offset: offset + length, length: blockSize });
    length += blockSize + 1;
    stream.offset += blockSize;
    blockSize = stream.readUint8();
  }
  length += 1;

  return lzwDecode(stream, {
    blocks,
    lzwMinimumCodeSize,
  });
}

function lzwDecode(stream: MuReadStream, data: LzwData) {
  const { blocks, lzwMinimumCodeSize } = data;

  const indexStream: Array<number> = [];
  const codeUnits: {
    stream: Array<number>;
    table: Array<Array<number>>;
    start: GetState;
  }[] = [];
  let codeStream: Array<number> = [];
  let codeTable: Array<Array<number>> = [];
  const br = new BitReader();
  const clearCode = 2 << (lzwMinimumCodeSize - 1);
  const eoiCode = clearCode + 1;

  let lastCode = eoiCode;
  let size = lzwMinimumCodeSize + 1;
  let growCode = (2 << (size - 1)) - 1;

  let isInitialized = false;
  let blockIndex = 0;

  for (const { offset, length } of blocks) {
    blockIndex++;
    br.pushBytes(new Uint8Array(stream.buffer.dataView.buffer, offset, length));
    while (br.hasBits(size)) {
      const codeStart = br.getState();
      const code = br.readBits(size);
      if (code === eoiCode) {
        codeStream.push(code);
        break;
      } else if (code === clearCode) {
        codeUnits.push({ stream: [], table: [], start: codeStart });
        codeStream = codeUnits[codeUnits.length - 1].stream;
        codeTable = codeUnits[codeUnits.length - 1].table;
        for (let i = 0; i <= eoiCode; i++) {
          codeTable[i] = i < clearCode ? [i] : [];
        }
        lastCode = eoiCode;
        size = lzwMinimumCodeSize + 1;
        growCode = (2 << (size - 1)) - 1;
        isInitialized = false;
      } else if (!isInitialized) {
        indexStream.push(...codeTable[code]);
        isInitialized = true;
      } else {
        let k = 0;
        const prevCode = codeStream[codeStream.length - 1];
        if (code <= lastCode) {
          indexStream.push(...codeTable[code]);
          k = codeTable[code][0];
        } else {
          k = codeTable[prevCode][0];
          indexStream.push(...codeTable[prevCode], k);
        }
        if (lastCode < 0xfff) {
          lastCode += 1;
          codeTable[lastCode] = [...codeTable[prevCode], k];
          if (lastCode === growCode && lastCode < 0xfff) {
            size += 1;
            growCode = (2 << (size - 1)) - 1;
          }
        }
      }
      codeStream.push(code);
    }
  }
  return indexStream;
}

type Bytes = Int8Array | Uint8Array;
type GetState = {
  bitOffset: number;
  byteOffset: number;
};

interface IBitReader {
  readBits(len: number): number;
  hasBits(len?: number): boolean;
  pushBytes(bytes: Bytes): void;
  getState(): GetState;
}

class BitReader implements IBitReader {
  private bytes: Bytes;
  private byteOffset: number;
  private bitOffset: number;
  private totalByteOffset: number;
  constructor(bytes?: Bytes) {
    this.bytes = bytes || new Int8Array();
    this.byteOffset = 0;
    this.bitOffset = 0;
    this.totalByteOffset = 0;
  }

  public readBits(len: number) {
    let result = 0;
    let rbits = 0;
    while (rbits < len) {
      if (this.byteOffset >= this.bytes.length) {
        throw new Error(
          `Not enough bytes to read ${len} bits (read ${rbits} bits)`,
        );
      }
      const bbits = Math.min(8 - this.bitOffset, len - rbits);
      const mask = (0xff >> (8 - bbits)) << this.bitOffset;
      result +=
        ((this.bytes[this.byteOffset] & mask) >> this.bitOffset) << rbits;
      rbits += bbits;
      this.bitOffset += bbits;
      if (this.bitOffset === 8) {
        this.byteOffset += 1;
        this.totalByteOffset += 1;
        this.bitOffset = 0;
      }
    }
    return result;
  }

  public hasBits(len: number = 1) {
    if (len > 12) {
      throw new Error(`Exceeds max bit size: ${len} (max: 12)`);
    }
    if (this.byteOffset >= this.bytes.length) {
      return false;
    }
    const bitsRemain = 8 - this.bitOffset;
    if (len <= bitsRemain) {
      return true;
    }
    const bytesRemain = this.bytes.length - this.byteOffset - 1;
    if (bytesRemain < 1) {
      return false;
    }
    if (len > bitsRemain + 8 * bytesRemain) {
      return false;
    }
    return true;
  }

  public pushBytes(bytes: Bytes): void {
    if (this.hasBits()) {
      const remainBytes = this.bytes.length - this.byteOffset;
      const extended = new Uint8Array(remainBytes + bytes.length);
      extended.set(this.bytes.slice(this.byteOffset));
      extended.set(bytes, remainBytes);
      this.bytes = extended;
      this.byteOffset = 0;
    } else {
      this.bytes = bytes;
      this.byteOffset = 0;
      this.bitOffset = 0;
    }
  }

  public getState(): GetState {
    return {
      bitOffset: this.bitOffset,
      byteOffset: this.totalByteOffset,
    };
  }
}

function getColorByIdx(
  idx: number,
  colorTable: [number, number, number][],
  transparency?: number,
): [number, number, number, number] {
  if (idx === transparency) {
    return [0, 0, 0, 0];
  }
  const color = colorTable[idx];
  if (!color) {
    return [0, 0, 0, 0];
  }
  return [color[0], color[1], color[2], 255];
}

let TEMP_CONTEXT: CanvasRenderingContext2D | null;
if (typeof document !== 'undefined') {
  TEMP_CONTEXT = getCanvas2DContext().context;
}
function createImageData(opt: {
  colorTable: [number, number, number][];
  indexStream: Array<number>;
  width: number;
  height: number;
  transparency?: number;
}): ImageData | undefined {
  if (!TEMP_CONTEXT) {
    return;
  }
  TEMP_CONTEXT.clearRect(
    0,
    0,
    TEMP_CONTEXT.canvas.width,
    TEMP_CONTEXT.canvas.height,
  );

  const { width, height, indexStream, transparency, colorTable } = opt;
  TEMP_CONTEXT.canvas.width = width;
  TEMP_CONTEXT.canvas.height = height;
  const imageData = TEMP_CONTEXT.createImageData(width, height);
  const pixels = imageData.data;
  for (let i = 0, poff = 0; i < indexStream.length; i += 1, poff += 4) {
    const [r, g, b, a] = getColorByIdx(
      indexStream[i],
      colorTable,
      transparency,
    );
    pixels[poff + 0] = r;
    pixels[poff + 1] = g;
    pixels[poff + 2] = b;
    pixels[poff + 3] = a;
  }
  return imageData;
}

/**
 * 仅解析gif的非图像数据，主要是拿到帧数、每一帧的时间
 * 使用场景是rusty_box项目，图像数据不在web处理
 */
export function parseGIFInfo(bytes: Uint8Array): ParsedGIF {
  const stream = new MuReadStream(bytes);

  // title，永远是GIF
  stream.readASCII(3);
  // version，是89a或者87a
  stream.readASCII(3);

  const width = stream.readUint16();
  const height = stream.readUint16();

  const packedFields = stream.readUint8();
  const globalColorTableFlag = packedFields & (1 << 7) ? 1 : 0;
  const globalColorTableSize = packedFields & 0b111;

  // 跳过backgroundColorIndex、pixelAspectRatio
  moveStreamByOffset(stream, 2);

  if (globalColorTableFlag) {
    const colorSize = 1 << (globalColorTableSize + 1);

    // 跳过globalColor
    moveStreamByOffset(stream, colorSize * 3);
  }

  const frames: FrameData[] = [];

  let currExtension: GraphicsControlExtension | undefined = undefined;
  // 循环解析数据本体，直到没有数据
  while (stream.offset + 1 < stream.length) {
    // 导入符，解析开始表示符，“!”、“,”、“;”
    const introducer = stream.readASCII(1);

    switch (introducer) {
      // “!”为扩展
      case '!':
        const extension = parseExtension(stream);
        if (extension) {
          currExtension = extension;
        }
        break;
      // “,”为图片
      case ',':
        skipImageData(stream);

        frames.push({
          width: 0,
          height: 0,
          top: 0,
          left: 0,
          delayTime: (currExtension?.delayTime || 1) * 10,
          disposalMethod: currExtension?.disposalMethod || 0,
          backgroundColor: [0, 0, 0, 0],
          imageData: new ImageData(1, 1),
        });

        currExtension = undefined;
        break;
      // “;”表示结束了
      case ';':
        break;
      default:
        console.error(`parse gif error: Unknown introducer: ${introducer}`);
        break;
    }
  }

  return {
    width,
    height,
    frames,
  };
}

/**
 * 读取流跳过图片内容
 * @param stream 读取流
 */
function skipImageData(stream: MuReadStream) {
  /**
   * 跳过left、top、width、height这4个Uint16
   */
  moveStreamByOffset(stream, 2 * 4);

  const packedFields = stream.readUint8();

  const localColorTableFlag = packedFields & (1 << 7) ? 1 : 0;

  const localColorTableSize = packedFields & 0b111;

  if (localColorTableFlag) {
    const colorSize = 1 << (localColorTableSize + 1);

    moveStreamByOffset(stream, colorSize * 3);
  }

  /**
   * 后面的内容都是在跳过解析图片内容
   */

  // 跳过lzwMinimumCodeSize
  moveStreamByOffset(stream, 1);

  let blockSize = stream.readUint8();

  while (blockSize > 0) {
    moveStreamByOffset(stream, blockSize);

    blockSize = stream.readUint8();
  }
}

/**
 * 让读取流按照偏差值步进，并且检查是否超出边界
 */
function moveStreamByOffset(stream: MuReadStream, offset: number) {
  stream.offset += offset;

  stream.checkBounds();
}
