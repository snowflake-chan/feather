import {
  MuStruct,
  MuDictionary,
  MuUTF8,
  MuArray,
  MuVarint,
} from '@box/mudb/schema';
import {
  GameAssetType,
  GameAssetListEntry,
  GameResourceSystem,
  GameSkinValue,
  Gamepad,
} from '@box/schema/api/js/api';
import { HashSchema } from '@box/schema/content-server/index';
import { AssetTypeSchema, AssetType } from '@box/schema/project/project-rda';
import { MotionListSchema } from '@box/schema/project/hot-schema';
import { PlayerGamepadSchema } from '@box/schema/replica/game-private-replica';
import { Vec3Schema } from '@box/schema/utils/math-schema';

// Initialscript resource state
export const ScriptResourceEntrySchema = new MuStruct({
  hash: HashSchema,
  type: AssetTypeSchema,
});

export const ScriptResourceSchema = new MuStruct({
  modules: new MuDictionary(new MuUTF8(), Infinity),
  /**
   * 从project.asset解析的数据，针对游戏所有资源的
   * key是名字（路径），值是type和hash
   */
  resources: new MuDictionary(ScriptResourceEntrySchema, Infinity),
  /**
   * 专门针对模型的，元素是模型名字（路径），index是meshId
   */
  meshTable: new MuArray(new MuUTF8(), Infinity),
  /**
   * 专门针对模型的，元素是模型动作列表，key是hash值
   */
  meshMotions: new MuDictionary(MotionListSchema, Infinity),
  /**
   * 专门针对模型的，元素是物理刚体与模型锚点的偏移量
   */
  meshRigidBodyOffset: new MuDictionary(Vec3Schema, Infinity),
  /**
   * 专门针对模型的，元素是外观框中心与模型锚点的偏移量
   */
  meshRenderBoxOffset: new MuDictionary(Vec3Schema, Infinity),
  /**
   * 专门针对皮肤模型的，元素是皮肤模型名字（纯名字，没有路径），index是skinId
   */
  skinTable: new MuArray(new MuUTF8(), Infinity),
  /**
   * 默认地图皮肤ID
   */
  defaultSkinId: new MuVarint(0),
  /**
   * 虚拟按键默认皮肤path
   */
  defaultGamepadPath: PlayerGamepadSchema,
});

export class ScriptResource {
  public children: ScriptResource[] = [];

  constructor(
    public path: string,
    public hash: string,
    public type: GameAssetType,
  ) {}
}

export class ScriptMeshMotion {
  constructor(
    public id: string,
    public name: string,
    public duration: number,
  ) {}
}

export class ScriptModule {
  public children: ScriptModule[] = [];
  public exports: any = {};
  public loaded = false;
  public id: string;

  constructor(
    public filename: string,
    public parent: ScriptModule | null,
    public require: (id: string) => any,
  ) {
    this.id = filename;
  }
}

function gameResourceType(type: AssetType): GameAssetType {
  switch (type) {
    case AssetType.JS_SCRIPT:
    case AssetType.CLIENT_JS_SCRIPT:
      return GameAssetType.JS_SCRIPT;
    case AssetType.VOXEL_MODEL:
    // 目前来看不需要独立出来GLTF资源，先复用先了
    case AssetType.GLTF_MODEL:
      return GameAssetType.VOXEL_MESH;
    case AssetType.COLOR_LUT:
      return GameAssetType.COLOR_LUT;
    case AssetType.PARTICLE_TEXTURE:
      return GameAssetType.PARTICLE_TEXTURE;
    case AssetType.IMAGE:
      // 早先的图片实体使用的图片
      return GameAssetType.IMAGE;
    case AssetType.PICTURE:
      // 虚拟按键换肤API需要使用到图片资源
      return GameAssetType.PICTURE;
    case AssetType.AUDIO:
      return GameAssetType.SOUND;
  }
  throw new Error('invalid resource type');
}

export class ScriptResourceSync {
  public moduleSource: { [url: string]: string } = {};
  public moduleCache: { [url: string]: ScriptModule } = {};

  /**
   * 通过hash值查找ScriptResource
   * 模型资源的hash值允许重复，所以这里可能查不道到正确的对应路径
   * 如果需要查找模型资源请通过server分配的模型id查找
   */
  public hashToPath: { [hash: string]: ScriptResource } = {};
  /**
   * 通过pash查找ScriptResource
   * 所有的资源都可以在这里查到
   */
  public pathToHash: { [path: string]: ScriptResource } = {};

  // mesh hash binding info
  public meshIdToFile: string[] = [];
  public fileToMotions: { [file: string]: ScriptMeshMotion[] } = {};
  public fileToRigidBodyOffset: { [file: string]: [number, number, number] } =
    {};
  public fileToRenderBoxOffset: { [file: string]: [number, number, number] } =
    {};
  public fileToMeshId: { [file: string]: number } = {};

  // skin hash binding info
  public skinIdToName: GameSkinValue[] = [];
  public nameToSkinId: { [name: string]: number } = {};
  public defaultSkinName: GameSkinValue;

  // gamepad path binding info
  public defaultGamepadPath: Gamepad = {
    joystickBackground: '',
    joystickController: '',
    flyButton: '',
    flyingBackground: '',
    flyingController: '',
    jump: '',
    crouch: '',
    actionA: '',
    actionB: '',
  };

  public resources: GameResourceSystem;

  public normalizePath(path: string) {
    return this.parseAbsolutePath(path).join('/');
  }

  public ls = (_path?: string) => {
    const path = this.normalizePath('' + (_path || ''));
    const resource = this.pathToHash[path];
    if (!resource) {
      throw new Error('file not found');
    }
    return resource.children.map(
      (info) => new GameAssetListEntry(info.path, info.type),
    );
  };

  constructor(
    public evalFuncs: {
      expr: (expr: string) => any;
      module: (
        environment: { [id: string]: any },
        src: string,
        filename: string,
      ) => any;
    },
  ) {
    this.resources = new GameResourceSystem(this.ls);
  }

  public synchronizeResources(state: typeof ScriptResourceSchema.identity) {
    this.hashToPath = {};
    this.pathToHash = {};
    this.pathToHash[''] = new ScriptResource('', '', GameAssetType.DIRECTORY);
    Object.keys(state.resources).forEach((path) => {
      let parent: ScriptResource | null = null;
      const subPaths = path.split('/');
      for (let i = 0; i < subPaths.length; ++i) {
        const prefix = subPaths.slice(0, i).join('/');
        if (prefix in this.pathToHash) {
          parent = this.pathToHash[prefix];
          continue;
        }
        const child = (this.pathToHash[prefix] = new ScriptResource(
          prefix,
          '',
          GameAssetType.DIRECTORY,
        ));
        if (parent) {
          parent.children.push(child);
          parent = child;
        }
      }

      const info = state.resources[path];
      const resource = new ScriptResource(
        path,
        info.hash,
        gameResourceType(info.type),
      );
      if (parent) {
        parent.children.push(resource);
      }
      this.hashToPath[info.hash] = resource;
      this.pathToHash[path] = resource;
    });

    this.moduleCache = {};
    this.moduleSource = {};
    Object.keys(state.modules).forEach((mod) => {
      this.moduleSource[mod] = state.modules[mod];
    });

    // update mesh table
    this.fileToMeshId = {};
    this.fileToMotions = {};
    this.fileToRigidBodyOffset = {};
    this.fileToRenderBoxOffset = {};
    this.meshIdToFile.length = 0;
    state.meshTable.forEach((file, i) => {
      if (file) {
        this.fileToMeshId[file] = i;
        this.meshIdToFile.push(file);
        const scriptResource = this.pathToHash[file];
        if (!scriptResource) {
          return;
        }
        const motionList = state.meshMotions[scriptResource.hash];
        if (motionList) {
          this.fileToMotions[file] = motionList.map((motion) => {
            return new ScriptMeshMotion(
              motion.id,
              motion.name,
              motion.duration,
            );
          });
        }

        const rigidBodyOffset = state.meshRigidBodyOffset[scriptResource.hash];
        if (rigidBodyOffset) {
          this.fileToRigidBodyOffset[file] = [
            rigidBodyOffset[0],
            rigidBodyOffset[1],
            rigidBodyOffset[2],
          ];
        }
        const renderBoxOffset = state.meshRenderBoxOffset[scriptResource.hash];
        if (renderBoxOffset) {
          this.fileToRenderBoxOffset[file] = [
            renderBoxOffset[0],
            renderBoxOffset[1],
            renderBoxOffset[2],
          ];
        }
      } else {
        this.meshIdToFile.push('');
      }
    });

    this.nameToSkinId = {};
    this.skinIdToName.length = 0;
    this.defaultSkinName = undefined;
    state.skinTable.forEach((name, i) => {
      if (name) {
        this.nameToSkinId[name] = i;
        this.skinIdToName.push(name);
      } else {
        this.skinIdToName.push(undefined);
      }
    });
    this.defaultSkinName = this.getSkinFileName(state.defaultSkinId);

    Object.assign(
      this.defaultGamepadPath,
      PlayerGamepadSchema.toJSON(state.defaultGamepadPath),
    );
  }

  public parseAbsolutePath(path: string) {
    const parts: string[] = path.split('/');
    const result: string[] = [];
    for (let i = 0; i < parts.length; ++i) {
      const p = parts[i];
      if (p === '' || p === '.') {
        continue;
      } else if (p === '..') {
        result.pop();
      } else {
        result.push(p);
      }
    }
    return result;
  }

  public loadModule(_filename: string, parent: ScriptModule | null) {
    const parts = this.parseAbsolutePath(_filename);
    const filename = parts.join('/');
    if (!(filename in this.moduleSource)) {
      throw new Error(`error loading module: ${filename}, module not found`);
    }

    const prefix = parts.slice(0, parts.length - 1);
    const dirname = prefix.join('/');

    const resolve = (_path?: string) => {
      const path = '' + (_path || '');
      let finalPath: string[];
      if (path.length > 0) {
        switch (path.charAt(0)) {
          case '.':
            finalPath = prefix.slice();
            break;
          case '/':
            finalPath = [];
            break;
          default:
            finalPath = ['node_modules'];
            break;
        }
      } else {
        finalPath = parts.slice();
      }
      path.split('/').forEach((dir) => {
        if (dir === '.') {
          return;
        } else if (dir === '..') {
          finalPath.pop();
        } else if (dir === '') {
          finalPath.length = 0;
        } else {
          finalPath.push(dir);
        }
      });
      let relativePath = finalPath.join('/');
      const asset = this.pathToHash[relativePath];
      if (asset && asset.type === GameAssetType.DIRECTORY) {
        relativePath += '/index.js';
      }
      return relativePath;
    };

    const self = this;

    const moduleInfo = (this.moduleCache[filename] = new ScriptModule(
      filename,
      parent,
      require,
    ));

    if (parent) {
      parent.children.push(moduleInfo);
    }

    function require(_path?: string) {
      const path = resolve(_path);
      if (path in self.moduleCache) {
        return self.moduleCache[path].exports;
      }
      return self.loadModule(path, moduleInfo);
    }

    Object.assign(require, {
      resolve,
    });

    const resources = new GameResourceSystem(this.ls);

    const moduleEnvironment = {
      __dirname: dirname,
      __filename: filename,
      require,
      resources,
      module: moduleInfo,
      exports: moduleInfo.exports,
    };

    this.evalFuncs.module(
      moduleEnvironment,
      this.moduleSource[filename],
      filename,
    );
    moduleInfo.loaded = true;
    return moduleInfo.exports;
  }

  public resolveHash(hash: string) {
    const asset = this.hashToPath[hash];
    if (!asset) {
      return '';
    }
    return asset.path;
  }

  public resolveAsset(fileName: string, type: GameAssetType) {
    const asset = this.pathToHash[this.normalizePath('' + (fileName || ''))];
    if (!asset || asset.type !== type) {
      return '';
    }
    return asset.hash;
  }

  public getMeshId(filename: string) {
    return this.fileToMeshId[filename] || 0;
  }

  public getMeshFileName(id: number) {
    return this.meshIdToFile[id] || '';
  }

  public getMeshMotionList(filename: string) {
    return this.fileToMotions[filename] || [];
  }

  public getRigidBodyOffset(filename: string) {
    return this.fileToRigidBodyOffset[filename] || [0, 0, 0];
  }

  public getRenderBoxOffset(filename: string) {
    return this.fileToRenderBoxOffset[filename] || [0, 0, 0];
  }

  public getSkinId(skinName: unknown) {
    if (skinName === undefined || skinName === null) {
      return 0;
    }

    if (typeof skinName !== 'string') {
      throw new Error(
        `error read param ${JSON.stringify(
          skinName,
        )}, skin name must be string/undefined/null`,
      );
    }

    const skinId = this.nameToSkinId[skinName];
    if (!skinId) {
      throw new Error(`cannot find skin name ${skinName} in resources`);
    }
    return skinId;
  }

  public getSkinFileName(id: number) {
    return this.skinIdToName[id] || undefined;
  }
}
