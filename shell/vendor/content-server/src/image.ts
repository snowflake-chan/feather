export function getImageExtension(filename: string): string {
  const found = filename.match(/.(jpg|jpeg|png|gif|svg|ico)$/g);
  if (!found) {
    return '';
  }
  return found[0];
}

export function isBase64(b64: string) {
  const mimeRegex = '(data:\\w+\\/[a-zA-Z\\+\\-\\.]+;base64,)';
  const valueRegex =
    '(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+/]{3}=)?';
  const regex = mimeRegex + valueRegex;
  return new RegExp('^' + regex + '$', 'gi').test(b64);
}

export function getB64Type(b64: string) {
  return b64.substring(b64.indexOf('/') + 1, b64.indexOf(';base64'));
}

/**
 * 通过fetch的方式创建ImageBitmap
 * 当没有Image接口时使用（rusty_box）
 */
export async function fetchImageBitmap(
  input: RequestInfo,
  init?: RequestInit,
): Promise<ImageBitmap> {
  if (typeof fetch === 'undefined') {
    return Promise.reject('Fetch is not supported.');
  }

  const response = await fetch(input, init);

  const blob = await response.blob();

  return createImageBitmap(blob);
}

export interface ImageRequest {
  image: HTMLImageElement | ImageBitmap | null;
  loaded: boolean;
  error: boolean;
}

export type RetrieveImageFunction = (
  out: ImageRequest,
  url: string,
) => Promise<ImageRequest>;

let retrieve: RetrieveImageFunction | undefined;

/**
 * 请求图片，请求方式会进行兼容性判定
 * - 如果Image存在，直接用Image请求
 * - 否则检测fetch方法是否存在，存在用fetch请求
 * - 都不支持，直接标记error为true
 */
export async function retrieveImage(
  out: ImageRequest,
  url: string,
): Promise<ImageRequest> {
  if ((out.image && out.loaded) || out.error) {
    return out;
  }

  if (!retrieve) {
    /**
     * rusty_box环境中也会实现Image对象（但该Image对象只能用于2D Canvas绘制），因此额外判定document是否存在
     */
    if (typeof Image !== 'undefined' && typeof document !== 'undefined') {
      retrieve = retrieveWithImage;
    } else if (typeof fetch !== 'undefined') {
      retrieve = retrieveWithFetch;
    } else {
      // 没有可用的请求方式，直接标记error为true
      out.error = true;

      return out;
    }
  }

  await retrieve(out, url);

  return out;
}

export function retrieveWithImage(
  out: ImageRequest,
  url: string,
): Promise<ImageRequest> {
  const image = new Image();

  image.crossOrigin = 'anonymous';

  out.image = image;

  return new Promise((resolve) => {
    image.onload = () => {
      out.loaded = true;

      resolve(out);
    };

    image.onerror = () => {
      out.error = true;

      resolve(out);
    };

    image.src = url;
  });
}

async function retrieveWithFetch(
  out: ImageRequest,
  url: string,
): Promise<ImageRequest> {
  try {
    const image = await fetchImageBitmap(url);

    out.image = image;
    out.loaded = true;
  } catch (err) {
    out.error = true;
  }

  return out;
}
