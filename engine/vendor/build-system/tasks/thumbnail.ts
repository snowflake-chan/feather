import { codecs, DEFAULT_CODEC } from '../squoosh/codecs';
import { decodeImage, preprocessImage, encodeImage } from '../squoosh/squoosh';
import { BuildSystem } from '../type';
import ImageData from '../squoosh/image_data';
import { BUILD_HEAVY_LOCK } from './heavy_mutex';

export async function img(bs: BuildSystem, queryStr: string) {
  // `${originHash}_100_100_${fit}.${format}`;
  const [base, format] = queryStr.split('.');
  let codec: string;
  switch (format.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
    case 'mozjpeg':
      codec = 'mozjpeg';
      break;
    case 'webp':
      codec = 'webp';
      break;
    case 'avif':
      codec = 'avif';
      break;
    case 'jxl':
      codec = 'jxl';
      break;
    case 'wp2':
    case 'webp2':
      codec = 'wp2';
      break;
    case 'png':
    case 'oxipng':
      codec = 'oxipng';
      break;
    default:
      throw new Error('unknow format');
  }
  const [hash, width, height, fit = 'fill'] = base.split('_');
  if (!hash || !width || !height) {
    throw new Error('param error');
  }
  return await squooshThumbnail(
    bs,
    hash,
    Math.floor(+width),
    Math.floor(+height),
    codec,
    fit,
  );
}

// Example squoosh thumbnail
export async function squooshThumbnail(
  bs: BuildSystem,
  hash: string,
  width: number,
  height: number,
  codec: string,
  fit: string,
) {
  await BUILD_HEAVY_LOCK.p();
  const t = Date.now();
  try {
    // handle default output codecs
    let c: any = codec;
    if (!(c in codecs)) {
      c = DEFAULT_CODEC[codec.toLowerCase()];
    }
    if (!c) {
      throw new Error('Invalid image codec: ' + c);
    }

    const image = await decodeImage({
      content: bs.contentServer,
      hash,
    });
    if (!image) {
      throw new Error(`Error decoding image: ${hash}`);
    }

    const hlOption = {
      width: +width || 0,
      height: +height || 0,
    };

    let baseLine: 'w' | 'h' = 'w';
    switch (fit) {
      case 'contain': {
        baseLine = image.width / width > image.height / height ? 'w' : 'h';
        Object.assign(hlOption, {
          width:
            baseLine === 'w'
              ? width
              : Math.floor((height * image.width) / image.height),
          height:
            baseLine === 'h'
              ? height
              : Math.floor((width / image.width) * image.height),
          fitMethod: 'contain',
        });
        break;
      }
      case 'cover': {
        baseLine = image.width / width > image.height / height ? 'h' : 'w';
        Object.assign(hlOption, {
          width:
            baseLine === 'w'
              ? width
              : Math.floor((height * image.width) / image.height),
          height:
            baseLine === 'h'
              ? height
              : Math.floor((width / image.width) * image.height),
          fitMethod: 'contain',
        });
        break;
      }
      case 'fill':
      default:
    }

    const resized = await preprocessImage({
      content: bs.contentServer,
      data: image.data,
      width: image.width,
      height: image.height,
      preprocessor: 'resize',
      options: hlOption,
    });
    if (!resized) {
      throw new Error(
        `Error resizing image: ${hash} from ${image.width}x${image.height} to ${width}x${height}`,
      );
    }

    if (fit === 'cover') {
      const croppedImage = new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height,
      );
      if (baseLine === 'w') {
        for (let i = 0; i < croppedImage.data.length; i++) {
          croppedImage.data[i] =
            resized.data[
              i +
                Math.floor((resized.height - croppedImage.height) / 2) *
                  croppedImage.width *
                  4
            ];
        }
      } else {
        for (let h = 0; h < croppedImage.height * 4; h++) {
          for (let w = 0; w < croppedImage.width * 4; w++) {
            croppedImage.data[w + h * croppedImage.width * 4] =
              resized.data[
                w +
                  h * resized.width * 4 +
                  Math.floor((resized.width - croppedImage.width) / 2) * 4
              ];
          }
        }
      }
      return await encodeImage({
        content: bs.contentServer,
        data: croppedImage.data,
        width: croppedImage.width,
        height: croppedImage.height,
        codec: <any>c,
      });
    } else {
      return await encodeImage({
        content: bs.contentServer,
        data: resized.data,
        width: resized.width,
        height: resized.height,
        codec: <any>c,
      });
    }
  } finally {
    bs.logger.info(
      `squoosh ${hash} ${width}x${height} ${codec} elapsed time = ${
        Date.now() - t
      }ms`,
    );
    BUILD_HEAVY_LOCK.v();
  }
}
