import {
  IREWGPUTexture,
  TextureDescriptor,
  REWGPUType,
  TextureData,
  CubeDescriptor,
  IREWGPUCube,
  CubeData,
} from './interface';

type TextureDataObjName =
  | 'HTMLCanvasElement'
  | 'OffscreenCanvas'
  | 'ImageBitmap'
  | 'ImageData'
  | 'HTMLImageElement'
  | 'HTMLVideoElement'
  | 'VideoFrame';
function objectName(str: TextureDataObjName) {
  return '[object ' + str + ']';
}

function classString(x: TextureData): string {
  return Object.prototype.toString.call(x);
}

const CANVAS_CLASS = objectName('HTMLCanvasElement');
const OFFSCREEN_CANVAS_CLASS = objectName('OffscreenCanvas');
const BITMAP_CLASS = objectName('ImageBitmap');
const IMAGE_DATA_CLASS = objectName('ImageData');
const IMAGE_CLASS = objectName('HTMLImageElement');
const VIDEO_CLASS = objectName('HTMLVideoElement');
const VIDEO_FRAME_CLASS = objectName('VideoFrame');

function isCanvasElement(object: TextureData): object is HTMLCanvasElement {
  return classString(object) === CANVAS_CLASS;
}

function isOffscreenCanvas(object: TextureData): object is OffscreenCanvas {
  return classString(object) === OFFSCREEN_CANVAS_CLASS;
}

function isImageBitmap(object: TextureData): object is ImageBitmap {
  return classString(object) === BITMAP_CLASS;
}

function isImageData(object: TextureData): object is ImageData {
  return classString(object) === IMAGE_DATA_CLASS;
}

function isHTMLImageElement(object: TextureData): object is HTMLImageElement {
  return classString(object) === IMAGE_CLASS;
}

function isHTMLVideoElement(object: TextureData): object is HTMLVideoElement {
  return classString(object) === VIDEO_CLASS;
}

function isVideoFrame(object: TextureData): object is VideoFrame {
  return classString(object) === VIDEO_FRAME_CLASS;
}

function setTextureData(
  device: GPUDevice,
  texture: GPUTexture,
  data: TextureData,
  origin?: GPUOrigin3D,
  mipLevel?: GPUIntegerCoordinate,
  size?: GPUExtent3DStrict,
  dataLayout?: GPUImageDataLayout,
) {
  if (
    isCanvasElement(data) ||
    isOffscreenCanvas(data) ||
    isImageBitmap(data) ||
    isImageData(data)
  ) {
    device.queue.copyExternalImageToTexture(
      { source: data },
      { texture, origin, mipLevel },
      { width: data.width, height: data.height },
    );
  } else if (isHTMLImageElement(data)) {
    device.queue.copyExternalImageToTexture(
      { source: data },
      { texture, origin, mipLevel },
      { width: data.naturalWidth, height: data.naturalHeight },
    );
  } else if (isHTMLVideoElement(data)) {
    device.queue.copyExternalImageToTexture(
      { source: data },
      { texture, origin, mipLevel },
      { width: data.videoWidth, height: data.videoHeight },
    );
  } else if (isVideoFrame(data)) {
    device.queue.copyExternalImageToTexture(
      { source: data },
      { texture, origin, mipLevel },
      { width: data.codedWidth, height: data.codedHeight },
    );
  } else {
    device.queue.writeTexture(
      { texture, origin, mipLevel },
      data,
      dataLayout ? dataLayout : {},
      size ? size : { width: texture.width, height: texture.height },
    );
  }
}

export class TextureManager {
  constructor(private device: GPUDevice) {}
  private textureCount = 0;
  private textureSet: Map<number, REWGPUTexture> = new Map<
    number,
    REWGPUTexture
  >();

  private cubeCount = 0;
  private cubeSet: Map<number, REWGPUCube> = new Map<number, REWGPUCube>();

  public create(descriptor: TextureDescriptor) {
    const { label, data, usage, size, format, dataLayout, mipLevelCount } =
      descriptor;
    const texture = this.device.createTexture({
      label,
      size,
      format,
      mipLevelCount,
      usage: usage | GPUTextureUsage.COPY_DST,
    });
    const reTexture = new REWGPUTexture(
      this.device,
      this.textureSet,
      this.textureCount++,
      texture,
    );
    this.textureSet.set(reTexture.id, reTexture);

    if (data) {
      reTexture.update(data, { size, dataLayout });
    }

    return reTexture;
  }

  public createCube(descriptor: CubeDescriptor) {
    const { label, data, usage, size, format, dataLayout } = descriptor;
    const texture = this.device.createTexture({
      label,
      size: [size, size, 6],
      format,
      usage: usage | GPUTextureUsage.COPY_DST,
    });
    const reCube = new REWGPUCube(
      this.device,
      this.cubeSet,
      this.cubeCount++,
      texture,
    );
    this.cubeSet.set(reCube.id, reCube);

    if (data) {
      reCube.update(data, { size: [size, size], dataLayout });
    }

    return reCube;
  }

  public destroy() {
    for (const [_, reTexture] of this.textureSet) {
      reTexture.destroy();
    }

    this.textureSet.clear();
    this.textureCount = 0;

    for (const [_, reCube] of this.cubeSet) {
      reCube.destroy();
    }

    this.cubeSet.clear();
    this.cubeCount = 0;
  }
}

class REWGPUTexture implements IREWGPUTexture {
  public readonly type = REWGPUType.Texture;
  constructor(
    private device: GPUDevice,
    private cache: Map<number, REWGPUTexture>,
    public id: number,
    public texture?: GPUTexture,
  ) {}

  public update(
    data: TextureData,
    options?: {
      size?: GPUExtent3DStrict;
      dataLayout?: GPUImageDataLayout;
      origin?: GPUOrigin3D;
      mipLevel?: GPUIntegerCoordinate;
    },
  ) {
    if (!this.texture) {
      return;
    }
    setTextureData(
      this.device,
      this.texture,
      data,
      options?.origin,
      options?.mipLevel,
      options?.size,
      options?.dataLayout,
    );
  }

  public destroy() {
    this.texture?.destroy();
    this.texture = undefined;
    this.cache.delete(this.id);
  }
}

class REWGPUCube implements IREWGPUCube {
  public readonly type = REWGPUType.Cube;
  constructor(
    private device: GPUDevice,
    private cache: Map<number, REWGPUCube>,
    public id: number,
    public texture?: GPUTexture,
  ) {}

  public update(
    data: CubeData,
    options?: {
      size?: GPUExtent3DStrict;
      dataLayout?: GPUImageDataLayout;
      mipLevel?: GPUIntegerCoordinate;
    },
  ) {
    if (!this.texture) {
      return;
    }
    for (let i = 0; i < data.length; i++) {
      setTextureData(
        this.device,
        this.texture,
        data[i],
        [0, 0, i],
        options?.mipLevel,
        options?.size,
        options?.dataLayout,
      );
    }
  }

  public destroy() {
    this.texture?.destroy();
    this.texture = undefined;
    this.cache.delete(this.id);
  }
}
