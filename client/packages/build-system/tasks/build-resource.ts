import { BuildSystem } from '../build-system';
import { Tasks } from '../type';
import { Hash } from '@box/content-server';
import { decodeUTF8, encodeUTF8 } from '@box/mudb/stream';
import { stableStringify } from '@box/mudb/util/stringify';

// Return type of resulting resource.
// 'hash' is the default value
//
//  hash    = pointer to data
//  json    = json dictionary
//  bin     = Uint8Array
//  text    = string
export type RetType = 'hash' | 'json' | 'bin' | 'text';

// Returns contents of a file
export type FileResource = {
  file: string;
  skipError?: boolean;
  ext?: string;
  ret?: RetType;
};

// Returns the contents of a directory
export type DirectoryResource = {
  dir: string;
  filter?: string;
  ret?: RetType;
  meta?: boolean;
};

// Runs a build command
export type FuncResource = {
  func: keyof Tasks;
  args: ResourceSpec[];
  ret?: RetType;
};

// Constructs a JSON object
export type TableResource = {
  table: { [prop: string]: ResourceSpec };
  ret?: RetType;
};

// json literal
export type JSONResource = {
  json: any;
  ret?: RetType;
};

// string literal
export type StringResource = {
  str: string;
  ret?: RetType;
};

export type ImportResource = {
  import: string;
  ret?: RetType;
};

export type ResourceSpec =
  | FileResource
  | DirectoryResource
  | FuncResource
  | TableResource
  | JSONResource
  | ImportResource
  | StringResource;

function isFileResource(spec: ResourceSpec): spec is FileResource {
  return 'file' in spec;
}

function isDirectoryResource(spec: ResourceSpec): spec is DirectoryResource {
  return 'dir' in spec;
}

function isFuncResource(spec: ResourceSpec): spec is FuncResource {
  return 'func' in spec;
}

function isTableResource(spec: ResourceSpec): spec is TableResource {
  return 'table' in spec;
}

function isJSONResource(spec: ResourceSpec): spec is JSONResource {
  return 'json' in spec;
}

function isImportResource(spec: ResourceSpec): spec is ImportResource {
  return 'import' in spec;
}

function isStringResource(spec: ResourceSpec): spec is StringResource {
  return 'str' in spec && typeof spec.str === 'string';
}

function removeMeta(dir: any) {
  Object.keys(dir).forEach((key) => {
    if (key === '.') {
      delete dir[key];
      return;
    }
    const val = dir[key];
    if (typeof val === 'object') {
      removeMeta(val);
    }
  });
}

export async function buildResource(
  bs: BuildSystem,
  dirHash: Hash,
  resourceHash: Hash,
) {
  const [files, resource] = await Promise.all([
    bs.retrieveJSON(dirHash),
    bs.retrieveJSON(resourceHash),
  ]);

  const EMPTY_HASH = await bs.storeContent(new Uint8Array(0));

  async function processFile(spec: FileResource) {
    const parts = spec.file.split('/');
    let dir = files;
    for (let i = 0; i < parts.length; ++i) {
      if (parts[i].length > 0) {
        if (!(parts[i] in dir)) {
          if (spec.skipError) {
            dir = '';
            break;
          } else {
            throw new Error('missing file ' + spec.file);
          }
        }
        dir = dir[parts[i]];
      }
    }
    if (spec.skipError) {
      dir = dir || EMPTY_HASH;
    }
    if (!dir || typeof dir !== 'string') {
      throw new Error('invalid file name: ' + spec.file);
    }
    if (spec.ret === 'json') {
      return await bs.retrieveJSON(dir);
    } else if (spec.ret === 'bin') {
      return await bs.retrieveContent(dir);
    } else if (spec.ret === 'text') {
      return decodeUTF8(await bs.retrieveContent(dir));
    }
    if (spec.ext) {
      return dir + '.' + spec.ext;
    }
    return dir;
  }

  async function processDirectory(spec: DirectoryResource) {
    const parts = spec.dir.split('/');
    let dir = files;
    for (let i = 0; i < parts.length; ++i) {
      if (parts[i].length > 0) {
        if (!(parts[i] in dir)) {
          throw new Error('missing directory ' + spec.dir);
        }
        dir = dir[parts[i]];
      }
    }
    if (!dir || typeof dir === 'string') {
      throw new Error('invalid directory name: ' + spec.dir);
    }
    if (spec.filter) {
      const keys = Object.keys(dir);
      const result = {};
      const regexp = new RegExp(spec.filter);
      for (let i = 0; i < keys.length; ++i) {
        if (keys[i].match(regexp)) {
          result[keys[i]] = dir[keys[i]];
        }
      }
      dir = result;
    }
    if (!spec.meta) {
      removeMeta(dir);
    }
    if (spec.ret === 'json') {
      return dir;
    } else if (spec.ret === 'bin') {
      return encodeUTF8(stableStringify(dir) || '');
    } else if (spec.ret === 'text') {
      return stableStringify(dir) || '';
    }
    return await bs.storeJSON(dir);
  }

  async function processFunc(spec: FuncResource) {
    const args: any[] = await Promise.all(spec.args.map(processResource));
    args.unshift(spec.func);

    const hash = await (<any>bs.build).apply(bs, args);
    if (spec.ret === 'json') {
      return await bs.retrieveJSON(hash);
    } else if (spec.ret === 'bin') {
      return await bs.retrieveContent(hash);
    } else if (spec.ret === 'text') {
      return decodeUTF8(await bs.retrieveContent(hash));
    }
    return hash;
  }

  async function processTable(spec: TableResource) {
    const ids = Object.keys(spec.table).sort();
    const ret: { [id: string]: any } = {};
    await Promise.all(
      ids.map(async (id) => {
        ret[id] = await processResource(spec.table[id]);
      }),
    );
    if (spec.ret === 'json') {
      return ret;
    } else if (spec.ret === 'bin') {
      return encodeUTF8(stableStringify(ret) || '');
    } else if (spec.ret === 'text') {
      return stableStringify(ret) || '';
    }
    return await bs.storeJSON(ret);
  }

  async function processJSON(spec: JSONResource) {
    const json = spec.json;
    if (spec.ret === 'json') {
      return json;
    } else if (spec.ret === 'bin') {
      return encodeUTF8(stableStringify(json) || '');
    } else if (spec.ret === 'text') {
      return stableStringify(json) || '';
    }
    return await bs.storeJSON(json);
  }

  async function processString(spec: StringResource) {
    const str = spec.str;
    if (spec.ret === 'json') {
      return JSON.stringify(str);
    } else if (spec.ret === 'bin') {
      return encodeUTF8(str);
    } else if (spec.ret === 'text') {
      return str;
    }
    return await bs.storeContent(encodeUTF8(str));
  }

  async function processImport(spec: ImportResource) {
    const res = await processFile({
      file: spec.import,
    });
    const hash = await (<any>(
      new BuildSystem(
        bs.cache,
        bs.contentServer,
        bs.ossContentServer,
        bs.nextUidListUsingGet,
        bs.logger.child({ caller: spec.import }),
        bs.debug,
      )
    )).build('buildResource', dirHash, res);
    if (spec.ret === 'json') {
      return await bs.retrieveJSON(hash);
    } else if (spec.ret === 'bin') {
      return await bs.retrieveContent(hash);
    } else if (spec.ret === 'text') {
      return decodeUTF8(await bs.retrieveContent(hash));
    }
    return hash;
  }

  async function processResource(spec: ResourceSpec) {
    try {
      if (isFileResource(spec)) {
        return await processFile(spec);
      } else if (isDirectoryResource(spec)) {
        return await processDirectory(spec);
      } else if (isFuncResource(spec)) {
        return await processFunc(spec);
      } else if (isTableResource(spec)) {
        return await processTable(spec);
      } else if (isJSONResource(spec)) {
        return await processJSON(spec);
      } else if (isImportResource(spec)) {
        return await processImport(spec);
      } else if (isStringResource(spec)) {
        return await processString(spec);
      } else {
        throw new Error('unrecognized resource: ' + JSON.stringify(spec));
      }
    } catch (e) {
      bs.logger.error(`error processing resource: ${JSON.stringify(spec)}`);
      bs.logger.error(e);
      throw e;
    }
  }

  const buildResult = await processResource(resource);
  if (resource.ret === 'bin') {
    return await bs.storeContent(buildResult);
  } else if (resource.ret === 'text') {
    return await bs.storeContent(encodeUTF8(buildResult));
  } else if (resource.ret === 'json') {
    return await bs.storeJSON(buildResult);
  } else {
    return buildResult;
  }
}
