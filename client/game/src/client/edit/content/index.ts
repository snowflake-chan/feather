import type { GLTFMetaData } from '@box/schema/mesh/model-schema';
import { apis } from 'src/apis/local-api';
import {
  type ImageResource,
  type ImageMetaData,
  ImageResourceSchema,
  ImageStatus,
} from 'src/engine/resource/schema';
import type { ResourceController } from 'src/engine/resource';
import { getOSSResourceUrl } from 'src/engine/resource/util';
import { GLTFLoader } from 'src/engine/mesh/gltf/loader';

/**
 * 基于OSS的客户端资源存储工具
 */
export class EditContentStorage {
  private resourceController: ResourceController;

  private gltfLoader: GLTFLoader | undefined;

  constructor(spec: { resourceController: ResourceController }) {
    const { resourceController } = spec;

    this.resourceController = resourceController;
  }

  /**
   * 上传图片，返回图片的metadata信息
   * - 存储图片到oss
   * - 生成图片的metadata信息
   */
  public async storeImage(spec: {
    file: File;
    width: number;
    height: number;
  }): Promise<{
    imageResource: ImageResource;
    hash: string;
  }> {
    const { file, width, height } = spec;

    const imgBlob = new Blob([file], {
      type: file.type,
    });

    const hash = await apis.upload.fileUploadPost({ file: imgBlob });

    // 生成metadata
    const metadata: ImageMetaData = {
      hash,
      width,
      height,
    };

    const metadataBlob = new Blob([JSON.stringify(metadata)], {
      type: 'application/json',
    });

    const metadataHash = await apis.upload.fileUploadPost({
      file: metadataBlob,
    });

    const img = new Image();

    img.src = getOSSResourceUrl(hash);

    return new Promise((resolve, reject) => {
      img.onload = () => {
        const imageResource = ImageResourceSchema.alloc();

        imageResource.element = img;
        imageResource.hash = hash;
        imageResource.width = width;
        imageResource.height = height;

        this.resourceController.addImageResource(metadataHash, imageResource);

        resolve({ imageResource, hash: metadataHash });
      };

      img.onerror = reject;
    });
  }

  /**
   * 上传文件至oss，返回hash值
   * 通过此接口上传的文件存储在oss，路径为 /engine/m/
   */
  public async store(file: Blob): Promise<string> {
    return await apis.upload.fileUploadPost({ file });
  }

  /**
   * 上传GLB，返回GLB的metadata信息
   * - 存储GLB到oss
   * - 生成GLB的metadata信息
   */
  public storeGLB = async (glb: ArrayBuffer) => {
    if (!this.gltfLoader) {
      this.gltfLoader = new GLTFLoader();
    }

    // 先解析一遍，用来获取bounds数据，同时确认这个GLB可以正常解析
    const parsed = await this.gltfLoader.addLoadingGLB(glb);

    if (!parsed) {
      throw new Error('Failed to parse GLB file');
    }

    const { lox, loy, loz, hix, hiy, hiz } = parsed;

    const hash = await this.store(new Blob([glb]));

    const metaData: GLTFMetaData = {
      bounds: [hix - lox, hiy - loy, hiz - loz],
      hash,
    };

    const metaDataHash = await this.store(new Blob([JSON.stringify(metaData)]));

    this.resourceController.addParsedGLTF(metaDataHash, {
      status: ImageStatus.Loading,
      mesh: parsed,
    });

    return { metaDataHash, bounds: metaData.bounds };
  };
}
