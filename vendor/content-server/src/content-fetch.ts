// Client side content resolve gateway

import { ContentServer, DEFAULT_OSS_CDN_PATH, OssCdnPath } from '.';
import { MuSchema } from '@box/mudb/schema';
import { MuReadStream } from '@box/mudb/stream';
import {
  ImageRequest,
  RetrieveImageFunction,
  getImageExtension,
  retrieveImage,
} from './image';
import { DataRequest, retrieveData } from './data';
import { LoadingController } from '@box/utils/loading/loading-controller';
import { TaskTypeEnum } from '@box/utils/loading/loading-schema';

type RequestHandler = [(data: Uint8Array | void) => void, (error: any) => void];

export function isAbsoluteContentURL(hashOrURL: string) {
  return /^(?:https?:\/\/|\/\/|\/)/i.test(hashOrURL);
}

export function resolveContentURL(
  hashOrURL: string,
  urlPrefix: string,
) {
  const isAbsoluteURL = isAbsoluteContentURL(hashOrURL);
  return isAbsoluteURL ? hashOrURL : `${urlPrefix}${hashOrURL}`;
}

const XHR_TIMEOUT = 5000;
const XHR_RETRY = 5;

class ContentRequest {
  public data?: Uint8Array;
  public done = false;
  public error: any = null;
  public pending: RequestHandler[] = [];

  public resolve(data: Uint8Array | undefined) {
    this.data = data;
    this.done = true;
    for (let i = 0; i < this.pending.length; ++i) {
      this.pending[i][0](data);
    }
    this.pending.length = 0;
  }

  public reject(error: any) {
    this.done = true;
    this.error = error || this.error || true;
    for (let i = 0; i < this.pending.length; ++i) {
      this.pending[i][1](error);
    }
    this.pending.length = 0;
  }
}

export type PrefetchCachesType = {
  xhr: { [hash: string]: DataRequest };
  images: { [hash: string]: ImageRequest };
};
export class ContentResolver {
  private _contentServer?: ContentServer;
  private _ossContentServer?: ContentServer;

  private _content: { [hash: string]: ContentRequest } = {};
  private _ossContent: { [hash: string]: ContentRequest } = {};
  private _images: { [hash: string]: ImageRequest } = {};
  private _cacheIPFS: boolean;

  private _urlPrefix: string;

  public cdnPath: string;
  public ossCdnURL: string;
  public avatarCdnURL?: string;

  public loadingController: LoadingController | null = null;

  constructor(spec: {
    cacheIPFS: boolean;
    cdnPath: string;
    ossCdnURL: string;
    avatarCdnURL?: string;
    contentServer?: ContentServer;
    ossContentServer?: ContentServer;
    loadingController?: LoadingController;
  }) {
    this.cdnPath = spec.cdnPath;
    this._urlPrefix = spec.cdnPath + '/block/';
    this._cacheIPFS = spec.cacheIPFS;

    this.ossCdnURL = spec.ossCdnURL;
    this.avatarCdnURL = spec.avatarCdnURL;

    if (spec.contentServer) {
      this._contentServer = spec.contentServer;
    }

    if (spec.ossContentServer) {
      this._ossContentServer = spec.ossContentServer;
    }

    if (spec.loadingController) {
      this.loadingController = spec.loadingController;
    }
  }

  public setPrefetchCaches(prefetchCache: Partial<PrefetchCachesType>) {
    const { xhr, images } = prefetchCache;

    if (typeof window !== 'undefined') {
      const prefetch: PrefetchCachesType['xhr'] = xhr;
      Object.keys(prefetch).forEach((hash) => {
        const xhr = prefetch[hash];
        if (xhr.loaded) {
          const request = new ContentRequest();
          this._content[hash] = request;
          request.done = true;
          request.data = xhr.data;
        } else {
          xhr.abort?.();
        }
      });
      prefetchCache.xhr = null;

      const prefetchImage: { [hash: string]: ImageRequest } = images;
      if (prefetchImage) {
        this._images = prefetchImage;
        Object.keys(this._images).forEach((hash) => {
          const req = this._images[hash];
          const image = req.image;
          if (image && 'complete' in image) {
            if (image.complete) {
              req.loaded = true;
            }
            image.onloadeddata = image.onload = function () {
              req.loaded = true;
            };

            return;
          }

          // 如果是ImageBitmap，只要image存在就是已加载完成
          if (image) {
            req.loaded = true;
          }
        });
      }
      prefetchCache.images = null;
    }
  }

  private _createRequest(
    hashOrURL: string,
    urlPrefix: string,
    content: { [hash: string]: ContentRequest },
    contentServer?: ContentServer,
  ) {
    const existing = content[hashOrURL];
    if (existing) {
      return existing;
    }

    if (this.loadingController) {
      this.loadingController.startTask(hashOrURL, TaskTypeEnum.Get);
    }

    const request = new ContentRequest();
    content[hashOrURL] = request;
    if (contentServer) {
      contentServer
        .retrieve(hashOrURL)
        .then((data) => {
          if (this.loadingController) {
            this.loadingController.endTask(hashOrURL, TaskTypeEnum.Downloaded);
          }
          request.resolve(data);
          if (!this._cacheIPFS) {
            delete content[hashOrURL];
          }
        })
        .catch((e) => {
          request.reject(e);
        });
      return request;
    } else {
      const url = resolveContentURL(hashOrURL, urlPrefix);

      const data: DataRequest = {
        data: null,
        loaded: false,
        error: false,
      };

      retrieveData(data, url, XHR_RETRY, XHR_TIMEOUT)
        .then(() => {
          if (!this._cacheIPFS) {
            delete content[hashOrURL];
          }

          if (this.loadingController) {
            this.loadingController.endTask(hashOrURL, TaskTypeEnum.Downloaded);
          }

          request.resolve(data.data);
        })
        .catch((err) => {
          request.reject(err);
        });

      return request;
    }
  }

  public retrieve(hash: string): Promise<Uint8Array | void> {
    const request = this._createRequest(
      hash,
      this._urlPrefix,
      this._content,
      this._contentServer,
    );
    return new Promise((resolve, reject) => {
      if (request.done) {
        if (request.error) {
          reject(request.error);
        } else {
          resolve(request.data);
        }
      } else {
        request.pending.push([resolve, reject]);
      }
    });
  }

  public retrieveFromS3(
    hashOrURL: string,
    options?: { ossCdnPath?: OssCdnPath },
  ): Promise<Uint8Array | void> {
    const cdnPath: OssCdnPath = options?.ossCdnPath || DEFAULT_OSS_CDN_PATH;
    const ossCdnURL =
      cdnPath === '/avatar/m/' && this.avatarCdnURL
        ? this.avatarCdnURL
        : this.ossCdnURL;
    const request = this._createRequest(
      hashOrURL,
      `${ossCdnURL}${cdnPath}`,
      this._ossContent,
      this._ossContentServer,
    );
    return new Promise((resolve, reject) => {
      if (request.done) {
        if (request.error) {
          reject(request.error);
        } else {
          resolve(request.data);
        }
      } else {
        request.pending.push([resolve, reject]);
      }
    });
  }

  public async fetchSchema<T>(
    schema: MuSchema<T>,
    hash: string,
  ): Promise<T | void> {
    const data = await this.retrieve(hash);
    if (!data) {
      return;
    }
    return schema.patch(schema.identity, new MuReadStream(data));
  }

  /**
   * 请求图片资源并缓存
   * @param hashOrURL 资源哈希值或者地址
   * @param retrieveFunction 指定请求图片的方式，默认是按照运行环境判断
   */
  public fetchImage(
    hashOrURL: string,
    retrieveFunction: RetrieveImageFunction = retrieveImage,
  ): ImageRequest {
    const isURL = isAbsoluteContentURL(hashOrURL);
    const taggedKey = isURL
      ? hashOrURL
      : hashOrURL.indexOf('.') < 0
      ? hashOrURL + '.png'
      : hashOrURL;
    const src = isURL
      ? resolveContentURL(hashOrURL, this._urlPrefix)
      : `${this._urlPrefix}${taggedKey}`;
    if (taggedKey in this._images) {
      return this._images[taggedKey];
    }
    if (typeof window === 'undefined') {
      return {
        image: null,
        loaded: false,
        error: true,
      };
    }
    if (this.loadingController) {
      this.loadingController.startTask(hashOrURL, TaskTypeEnum.Image);
    }

    const result: ImageRequest = {
      image: null,
      loaded: false,
      error: false,
    };

    this._images[taggedKey] = result;

    retrieveFunction(result, src).then((res) => {
      if (res.loaded && this.loadingController) {
        this.loadingController.endTask(hashOrURL, TaskTypeEnum.Image);
      }
    });

    return this._images[taggedKey];
  }

  public removeImageCache(hashOrURL: string) {
    const isURL = isAbsoluteContentURL(hashOrURL);
    const taggedKey = isURL
      ? hashOrURL
      : hashOrURL.indexOf('.') < 0
      ? hashOrURL + '.png'
      : hashOrURL;

    if (this._images[taggedKey]) {
      delete this._images[taggedKey];
    }
  }

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // WTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTF
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  //
  // FIXME: why does the contentFetch API have upload capabilities?!?!?
  //  the whole point of contentFetch is to only download stuff, not upload.
  //  this is a major security problem. people can just put whatever images they want on
  //  our server and we'll host them forever with no way to take it down.
  //  all user uploads should go into a content queue for review.
  //  currently this exposes a major back door in our infrastructure.
  //
  // -Mik
  //
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // WTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTFWTF
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  /**
   * FIXME: DELETE THIS
   * @param raw ArrayBuffer
   * @param extension image type, eg: '.png','.jpg', ...etc
   * @return hash.extension
   */
  public storeImageBuffer = async (raw: ArrayBuffer, extension: string) => {
    let hash = '';
    if (this._contentServer) {
      hash = await this._contentServer.store(new Uint8Array(raw));
    } else {
      hash = await this.store(new Uint8Array(raw));
    }
    return hash + '.' + extension;
  };

  public storeProjectDataDirectly = async (prjectDataJSON: string) => {
    let hash = '';
    if (this._contentServer) {
      hash = await this._contentServer.store(
        new TextEncoder().encode(prjectDataJSON),
      );
    } else {
      hash = await this.store(new TextEncoder().encode(prjectDataJSON));
    }
    return hash;
  };

  /**
   * FIXME: DELETE THIS
   * @param file File
   * @return hash.extension
   */
  public storeImageFile = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const ex = getImageExtension(file.name);
        if (ex) {
          if (this._contentServer) {
            this._contentServer
              .store(new Uint8Array((event.target as any).result))
              .then((hash) => {
                resolve(hash + ex);
              })
              .catch(reject);
          } else {
            this.store(new Uint8Array((event.target as any).result))
              .then((hash) => {
                resolve(hash + ex);
              })
              .catch(reject);
          }
        } else {
          reject(
            new Error(
              `Error in storeImageFile: the file ${file.name} is not an image type`,
            ),
          );
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  /**
   * FIXME: DELETE THIS
   * @param raw
   */
  public store(raw: Uint8Array) {
    if (this._contentServer) {
      return this._contentServer.store(raw);
    }
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onerror = reject;
      xhr.onabort = reject;
      xhr.ontimeout = reject;
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              const info = JSON.parse(xhr.responseText);
              resolve(info.Key);
            } catch (e) {
              resolve(xhr.responseText);
            }
          } else {
            reject(
              new Error(`failed to store image. reason: ${xhr.statusText}`),
            );
          }
        }
      };
      xhr.open('POST', this._urlPrefix, true);
      xhr.send(raw);
    });
  }

  public destroy() {
    Object.values(this._images).forEach((_) => {
      if (_.image instanceof ImageBitmap) {
        _.image.close();
      }
      _.image = null;
    });
  }
}
