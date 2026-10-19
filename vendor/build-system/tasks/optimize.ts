// asset optimization/minification stuff goes in here
import { BuildSystem } from '../build-system';
import { Hash } from '@box/content-server';
import { BUILD_HEAVY_LOCK } from './heavy_mutex';
import { squooshOxipng } from '../squoosh/codecs';
import { decodeImage, encodeImage } from '../squoosh/squoosh';

export async function optimizePNG(bs: BuildSystem, hash: Hash) {
  if (bs.debug) {
    return hash;
  }

  await BUILD_HEAVY_LOCK.p();
  const t = Date.now();
  try {
    return await squooshOxipng(bs.contentServer, hash, 3);
  } catch (e) {
    bs.logger.error(`error calling optimize png with hash: ${hash}`);
    bs.logger.error(e);
    return hash;
  } finally {
    bs.logger.info(`reencode png ${hash} elapsed time = ${Date.now() - t} ms`);
    BUILD_HEAVY_LOCK.v();
  }
}

type Directory = { [dir: string]: Directory | string | Directory[] };

export async function optimizeDir(bs_: BuildSystem, hash: Hash) {
  const assets = await bs_.retrieveJSON(hash);
  if (typeof assets !== 'object') {
    throw new Error('invalid directory');
  }

  const errors: string[] = [];
  async function optimizeRec(dir: Directory, prefix: string) {
    if (Array.isArray(dir)) {
      return Promise.all(dir.map((x, i) => optimizeRec(x, `${prefix}[${i}]`)));
    } else if (typeof dir === 'string') {
      const x = await optimizeRec({ default: dir }, prefix);
      return x.default;
    }
    const result: any = {};
    await Promise.all(
      Object.keys(dir).map(async (file) => {
        if (file === '.') {
          return;
        }
        const entry = dir[file];
        const K = prefix ? `${prefix}/${file}` : file;
        if (typeof entry === 'string' && entry) {
          const ext = file.slice(file.lastIndexOf('.') + 1).toLowerCase();
          const bs = new BuildSystem(
            bs_.cache,
            bs_.contentServer,
            bs_.ossContentServer,
            bs_.nextUidListUsingGet,
            bs_.logger.child({ caller: `"${K}"` }),
            bs_.debug,
          );
          try {
            if (ext === 'png' || ext === 'lut' || ext === 'part') {
              return (result[file] = await bs.build('optimizePNG', entry));
            } else {
              return (result[file] = entry);
            }
          } catch (e) {
            bs_.logger.error(e);
            errors.push(`${file} :: ${e.message}`);
          }
        } else if (Array.isArray(entry)) {
          return (result[file] = await Promise.all(
            entry.map((x) => {
              if (typeof x === 'object') {
                return optimizeRec(x, K);
              } else {
                return Promise.resolve(x);
              }
            }),
          ));
        } else if (typeof entry === 'object') {
          return (result[file] = await optimizeRec(entry, K));
        }
        return (result[file] = entry);
      }),
    );
    return result;
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n\n'));
  }

  return await bs_.storeJSON(await optimizeRec(assets, ''));
}

export async function optimizeJPG(bs: BuildSystem, hash: Hash) {
  if (bs.debug) {
    return hash;
  }

  await BUILD_HEAVY_LOCK.p();
  bs.logger.info(`building jpg ${hash}`);
  const t = Date.now();
  try {
    const image = await decodeImage({
      content: bs.contentServer,
      hash,
    });
    if (!image) {
      throw new Error(`Error decoding image: ${hash}`);
    }
    bs.logger.info(`image dimensions ${image.width}x${image.height}`);
    return await encodeImage({
      content: bs.contentServer,
      data: image.data,
      width: image.width,
      height: image.height,
      codec: 'mozjpeg',
    });
  } catch (e) {
    bs.logger.error(`error calling optimize png with hash: ${hash}`);
    bs.logger.error(e);
    return hash;
  } finally {
    bs.logger.info(`optimize jpg elapsed time ${Date.now() - t}`);
    BUILD_HEAVY_LOCK.v();
  }
}
