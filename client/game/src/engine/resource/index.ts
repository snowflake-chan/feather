import type { ContentResolver } from '@box/content-server/content-fetch';
import type { RetrieveImageFunction } from '@box/content-server/image';
import type { GLTFMetaData } from '@box/schema/mesh/model-schema';
import {
  ImageResourceSchema,
  ImageStatus,
  type ParsedGLTFResource,
  type ImageMetaData,
  type ImageResource,
  type Resources,
} from './schema';
import { getOSSResourceUrl } from './util';
import type { GetImageRes } from '../game-ui/nodes/image';
import { isSafeUrl } from '../utils/safe-url';
import { GLTFLoader } from '../mesh/gltf/loader';

type Spec = {
  resources: Resources;
  contentResolver: ContentResolver;
};

export class ResourceController {
  private resources: Resources;
  private contentResolver: ContentResolver;
  private gltfLoader: GLTFLoader | undefined;

  constructor(spec: Spec) {
    const { resources, contentResolver } = spec;

    this.resources = resources;
    this.contentResolver = contentResolver;
  }

  /**
   * 根据外部地址加载图片，并更新缓存
   */
  public fetchImageByURL(
    url: string,
    retrieveFunction?: RetrieveImageFunction,
  ): GetImageRes {
    let img = this.resources.images[url];
    if (!img) {
      if (!isSafeUrl(url)) {
        return ImageStatus.Error;
      }
      img = this.addNewCache(url);
    }

    if (img.element) {
      return img.element;
    }

    const request = this.contentResolver.fetchImage(url, retrieveFunction);

    if (request.error) {
      img.status = ImageStatus.Error;
      return ImageStatus.Error;
    }

    if (!request.image || !request.loaded) {
      img.status = ImageStatus.Loading;
      return ImageStatus.Loading;
    }

    img.width = request.image.width;
    img.height = request.image.height;
    img.element = request.image;
    return request.image;
  }

  /**
   * 查询图片，并更新缓存
   */
  public fetchImageByMetadataHash(
    metadataHash: string,
    retrieveFunction?: RetrieveImageFunction,
  ): GetImageRes {
    if (!metadataHash) {
      return ImageStatus.Error;
    }

    const img =
      this.resources.images[metadataHash] || this.addNewCache(metadataHash);
    if (img.element) {
      return img.element;
    }

    this.contentResolver
      .retrieveFromS3(metadataHash)
      .then((bufferArr) => {
        if (!bufferArr) {
          img.status = ImageStatus.Error;
          return;
        }

        const metadata: ImageMetaData = JSON.parse(
          Buffer.from(bufferArr).toString(),
        );

        this.fetchImageByMetadata(metadataHash, metadata, retrieveFunction);
      })
      .catch((err) => {
        console.error('Failed to fetch image', err);
        img.status = ImageStatus.Error;
      });

    return img.status;
  }

  public fetchImageByMetadata(
    metadataHash: string,
    metadata: ImageMetaData,
    retrieveFunction?: RetrieveImageFunction,
  ): GetImageRes {
    const img =
      this.resources.images[metadataHash] || this.addNewCache(metadataHash);
    if (img.element) {
      return img.element;
    }

    const request = this.contentResolver.fetchImage(
      getOSSResourceUrl(metadata.hash),
      retrieveFunction,
    );

    if (request.error) {
      img.status = ImageStatus.Error;
      return ImageStatus.Error;
    }

    if (!request.image || !request.loaded) {
      img.status = ImageStatus.Loading;
      return ImageStatus.Loading;
    }

    img.width = metadata.width;
    img.height = metadata.height;
    img.element = request.image;
    return request.image;
  }

  private addNewCache(metadataHash: string) {
    const imageResource = ImageResourceSchema.alloc();

    imageResource.hash = metadataHash;
    imageResource.width = 0;
    imageResource.height = 0;
    imageResource.element = null;

    this.addImageResource(metadataHash, imageResource);
    return imageResource;
  }

  public addImageResource(metadataHash: string, resource: ImageResource) {
    this.resources.images[metadataHash] = resource;
  }

  public removeImageResource(metadataHash: string) {
    const imageResource = this.resources.images[metadataHash];

    if (imageResource) {
      delete this.resources.images[metadataHash];

      ImageResourceSchema.free(imageResource);

      this.contentResolver.removeImageCache(
        getOSSResourceUrl(imageResource.hash),
      );
    }
  }

  /**
   * 按需加载字体
   * 会从两处检测缓存
   * - 检测state.resources.fontFaces字典缓存
   * - 检测document.fonts字体集合
   * @param fontFamily {string} 定义字体名字
   * @param src {string} 字体资源路径，需要用'url()'包裹
   * 详见：https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API#defining_a_font_face
   */
  public loadFontFace(
    fontFamily: string,
    src: string,
    descriptors: FontFaceDescriptors = {
      display: 'swap',
    },
  ) {
    const { fontFaces } = this.resources;

    if (fontFaces[fontFamily]) {
      return fontFaces[fontFamily];
    }

    let fontFaceSet: FontFaceSet;

    if (typeof document !== 'undefined') {
      fontFaceSet = document.fonts;
    } else if (typeof window.rustyFonts !== 'undefined') {
      fontFaceSet = window.rustyFonts;
    } else {
      return;
    }

    let targetFontFace: FontFace | null = null;

    for (const fontFace of fontFaceSet.values()) {
      if (fontFace.family === fontFamily) {
        targetFontFace = fontFace;

        break;
      }
    }

    if (targetFontFace) {
      fontFaces[fontFamily] = targetFontFace;

      return targetFontFace;
    }

    targetFontFace = new FontFace(fontFamily, src, descriptors);

    /**
     * - 关于加载
     *  - 创建FontFace实例不会触发加载，要调用fontFace.load()方法document.fonts.add()方法才会加载
     * - 关于使用
     *  - 仅仅创建FontFace实例，即使完成加载也无法使用，要调用document.fonts.add()添加进集合中才能生效
     */
    fontFaceSet.add(targetFontFace);

    return targetFontFace;
  }

  public addParsedGLTF(metadataHash: string, resource: ParsedGLTFResource) {
    this.resources.parsedGLTF[metadataHash] = resource;
  }

  public fetchParsedGLTFByMetadataHash(
    metadataHash: string,
  ): ParsedGLTFResource {
    let parsed = this.resources.parsedGLTF[metadataHash];

    if (!parsed) {
      parsed = this.addParsedGLTFNewCache(metadataHash);

      this.requestParsedGLF(metadataHash, parsed);
    }

    return parsed;
  }

  private async requestParsedGLF(
    metadataHash: string,
    resource: ParsedGLTFResource,
  ) {
    try {
      const metaDataBytes = await this.contentResolver.retrieveFromS3(
        metadataHash,
      );

      if (!metaDataBytes) {
        throw new Error('Failed to get metadata bytes of gltf');
      }

      const metaData: GLTFMetaData = JSON.parse(
        Buffer.from(metaDataBytes).toString(),
      );

      const bytes = await this.contentResolver.retrieveFromS3(metaData.hash);

      if (!bytes || !(bytes.buffer instanceof ArrayBuffer)) {
        throw new Error('Failed to get bytes of gltf');
      }

      if (!this.gltfLoader) {
        this.gltfLoader = new GLTFLoader();
      }

      const parsedGLTF = await this.gltfLoader.addLoadingGLB(bytes.buffer);

      if (!parsedGLTF) {
        throw new Error('Failed to load glb');
      }

      resource.mesh = parsedGLTF;

      // GLB文件过大，不适合缓存
      this.contentResolver['_ossContent'][metaData.hash] = undefined;
    } catch (err) {
      resource.status = ImageStatus.Error;
    }
  }

  private addParsedGLTFNewCache(metadataHash: string) {
    const parsedGLTFResource: ParsedGLTFResource = {
      status: ImageStatus.Loading,
      mesh: null,
    };

    this.addParsedGLTF(metadataHash, parsedGLTFResource);

    return parsedGLTFResource;
  }
}
