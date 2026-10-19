import { decodeUTF8 } from '@box/mudb/stream';
import { BuildSystem } from '../build-system';

export async function concat(bs: BuildSystem, ...hashes: string[]) {
  const blocks = await Promise.all(
    hashes.map((hash) => bs.retrieveContent(hash)),
  );
  return await bs.storeContent(Buffer.concat(blocks));
}

export async function concatValues(bs: BuildSystem, hash: string) {
  const json: { [id: string]: string } = await bs.retrieveJSON(hash);
  const blocks = await Promise.all(
    Object.values(json).map((h) => bs.retrieveContent(h)),
  );
  return await bs.storeContent(Buffer.concat(blocks));
}

export async function recursivelyConcatValues(bs: BuildSystem, hash: string) {
  const promises: Promise<Uint8Array>[] = [];
  const stack: any[] = [await bs.retrieveJSON(hash)];
  while (stack.length > 0) {
    const json = stack.pop();
    Object.values(json).forEach((value) => {
      if (typeof value === 'string') {
        promises.push(bs.retrieveContent(value));
      } else {
        stack.push(value);
      }
    });
  }
  const blocks = await Promise.all(promises);
  return await bs.storeContent(Buffer.concat(blocks));
}

export async function removeExtensions(bs: BuildSystem, hash: string) {
  function rec(dir: object) {
    const result: object = {};
    Object.keys(dir).forEach((key) => {
      const val = dir[key];
      if (typeof val === 'object') {
        result[key] = rec(val);
      } else {
        result[key.replace(/\.[^.]*$/, '')] = val;
      }
    });
    return result;
  }
  return await bs.storeJSON(rec(await bs.retrieveJSON(hash)));
}

export async function swapExtensions(bs: BuildSystem, hash: string) {
  function rec(dir: object) {
    const result: object = {};
    Object.keys(dir).forEach((key) => {
      if (key === '.') {
        return;
      }
      const val = dir[key];
      if (typeof val === 'object') {
        result[key] = rec(val);
      } else if (typeof val === 'string') {
        const ext = key.match(/\.[^.]*$/);
        result[key.replace(/\.[^.]*$/, '')] = val + (ext ? ext[0] : '');
      }
    });
    return result;
  }
  const x = rec(await bs.retrieveJSON(hash));
  return await bs.storeJSON(x);
}

export async function copyExtensions(bs: BuildSystem, hash: string) {
  function rec(dir: object) {
    const result: object = {};
    Object.keys(dir).forEach((key) => {
      const val = dir[key];
      if (typeof val === 'object') {
        result[key] = rec(val);
      } else {
        const ext = key.match(/\.[^.]*$/);
        result[key] = val + (ext ? ext[0] : '');
      }
    });
    return result;
  }
  return await bs.storeJSON(rec(await bs.retrieveJSON(hash)));
}

export async function mergeJSON(bs: BuildSystem, ...hashes: string[]) {
  const blocks = await Promise.all(hashes.map((hash) => bs.retrieveJSON(hash)));
  return await bs.storeJSON(Object.assign({}, ...blocks));
}

export async function mergeDir(bs: BuildSystem, ...hashes: string[]) {
  const dirs = await Promise.all(hashes.map((hash) => bs.retrieveJSON(hash)));
  function mergeRec(obj: any, dir: any) {
    const files = Object.keys(dir);
    for (let j = 0; j < files.length; ++j) {
      const k = files[j];
      if (k === '.') {
        continue;
      }
      if (typeof dir[k] === 'object') {
        obj[k] = mergeRec(obj[k] || {}, dir[k]);
      } else {
        obj[k] = dir[k];
      }
    }
    return obj;
  }
  const result: any = {};
  for (let i = 0; i < dirs.length; ++i) {
    mergeRec(result, dirs[i]);
  }
  return await bs.storeJSON(result);
}

export async function stripMeta(bs: BuildSystem, hash: string) {
  function stripRec(obj: any) {
    const result: any = {};
    Object.keys(obj).forEach((x) => {
      const y = obj[x];
      if (y === '.') {
        return;
      }
      if (typeof y === 'object') {
        result[x] = stripRec(y);
      } else {
        result[x] = y;
      }
    });
    return result;
  }
  return await bs.storeJSON(stripRec(await bs.retrieveJSON(hash)));
}

export async function calcSize(bs: BuildSystem, hash: string) {
  const bytes = await bs.retrieveContent(hash);
  return '' + bytes.length;
}

export async function addMeta(bs: BuildSystem, hash: string) {
  async function metaRec(obj: any) {
    const meta: any[] = [];
    await Promise.all(
      Object.keys(obj).map(async (name) => {
        if (name === '.') {
          return;
        }
        const f = obj[name];
        if (typeof f === 'string') {
          meta.push({
            name,
            dir: false,
            size: await bs.build('calcSize', hash),
          });
        } else {
          meta.push({
            name,
            dir: true,
            size: 0,
          });
          await metaRec(f);
        }
      }),
    );
    obj['.'] = meta;
    return obj;
  }
  return await bs.storeJSON(await metaRec(await bs.retrieveJSON(hash)));
}

export async function flatten(bs: BuildSystem, hash: string) {
  const result: any = {};
  function flattenRec(obj: any) {
    Object.keys(obj).forEach((key) => {
      if (key === '.') {
        return;
      }
      const val = obj[key];
      if (typeof val === 'string') {
        result[key] = val;
      } else if (typeof val === 'object') {
        flattenRec(val);
      }
    });
  }
  flattenRec(await bs.retrieveJSON(hash));
  return await bs.storeJSON(result);
}

export async function replacePattern(
  bs: BuildSystem,
  hash: string,
  pattern: string,
  replace: string,
) {
  const dir = await bs.retrieveJSON(hash);
  const result: any = {};
  Object.keys(dir).forEach((x) => {
    result[x.replace(pattern, replace)] = dir[x];
  });
  return bs.storeJSON(result);
}

export async function mapJSON(
  bs: BuildSystem,
  task: string,
  hash: string,
  ret?: string,
): Promise<string> {
  if (!(task in (<any>bs).tasks)) {
    throw new Error('Invalid task name: ' + task);
  }
  if (!hash) {
    return await bs.storeJSON({});
  }
  async function mapRec(field: any, prefix: string): Promise<any> {
    if (typeof field === 'string') {
      const h = await new BuildSystem(
        bs.cache,
        bs.contentServer,
        bs.ossContentServer,
        bs.nextUidListUsingGet,
        bs.logger.child({ caller: `"${prefix}"` }),
        bs.debug,
      ).build(<any>task, field);
      if (ret === 'json') {
        return await bs.retrieveJSON(h);
      } else if (ret === 'text') {
        return decodeUTF8(await bs.retrieveContent(h));
      } else if (ret === 'bin') {
        return await bs.retrieveContent(h);
      }
      return h;
    } else if (typeof field === 'object') {
      if (Array.isArray(field)) {
        return await Promise.all(
          field.map((x, i) => mapRec(x, prefix + `[${i}]`)),
        );
      } else {
        const result: any = {};
        await Promise.all(
          Object.keys(field).map(async (k) => {
            result[k] = await mapRec(field[k], prefix ? prefix + '.' + k : k);
          }),
        );
        return result;
      }
    }
    return field;
  }
  const json = (await bs.retrieveJSON(hash)) || {};
  const mapped = await mapRec(json, '');
  return await bs.storeJSON(mapped);
}
