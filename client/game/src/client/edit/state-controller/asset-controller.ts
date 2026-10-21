import { vec3 } from 'gl-matrix';
import { EditReplicaClient } from '../replica/replica-client';
import { EditActionLabel } from '../replica/replica-client-schema';
import { ClientProjectTransaction } from '../replica/transaction/client-project-transaction';
import {
  AssetType,
  AssetEntry,
  AssetEntryRDA,
  DeleteAssetsRDA,
} from '@box/schema/project/project-rda';
import { ClientStateType } from '../edit-schema';
import { CodeEditorClientController } from '../code-editor/code-editor-client-controller';
import { clientConfig, getConfig } from 'src/config/client';
import { GamepadController } from './gamepad-controller';
import { apis } from 'src/apis/local-api';
import { appendProjectAssetRecovery } from './project-asset-trash';
import { getModelPreviewURL } from 'src/utils/model-preview-url';

export enum assetConflict {
  none,
  namingDuplicate,
  hashRepeat,
  contentIdentical,
}

export class AssetController {
  public static instance: AssetController;
  private _tx: ClientProjectTransaction;
  private format = {
    [AssetType.JS_SCRIPT]: {
      prefix: '',
      formats: '.js',
    },
    [AssetType.CLIENT_JS_SCRIPT]: {
      prefix: '',
      formats: '.js',
    },
    [AssetType.AUDIO]: {
      prefix: 'audio/',
      formats: '.mp3',
    },
    [AssetType.IMAGE]: {
      prefix: 'image/',
      formats: '',
    },
    [AssetType.PICTURE]: {
      prefix: 'picture/',
      formats: '',
    },
    [AssetType.GLTF_MODEL]: {
      prefix: 'gltf/',
      formats: '',
    },
  };

  constructor(
    private _replica: EditReplicaClient,
    private _state: ClientStateType,
    private _gamepad: GamepadController,
  ) {
    AssetController.instance = this;
    this._tx = _replica.projectTransaction();
    this._gamepad = _gamepad;
  }

  public getAssetsList(assetType: AssetType) {
    const assetFileList: string[] = [];

    const assetEntries = this.getEntriesByAssetType(assetType);
    const assets = this._state.replica.project[assetEntries];

    for (const fileName in assets) {
      if (assets[fileName].type === assetType) {
        assetFileList.push(fileName);
      }
    }
    return assetFileList;
  }

  public formatName(name: string, type: AssetType) {
    if (name.indexOf('/') !== -1) {
      console.error('Model Name contains the invalid symbol: /');
      return null;
    }
    const { prefix, formats } = this.format[type];
    return prefix + name + formats;
  }

  public padZero(n: number) {
    return n >= 10 ? n.toString() : '0' + n;
  }

  public rawName(modelName: string) {
    const path = modelName.split('/');
    const tempArr = path[path.length - 1].split('.');
    tempArr.pop();
    return tempArr.join('.');
  }

  /**
   * 资源重名时，补位递增生成新名字的方法
   * @param name 资源名字
   * @param type 资源类型
   * @param stripExtension 是否要处理名字末尾的.ext部分，比如图片资源，文件格式是不定的，但生成新名字时只处理不带格式那部分
   */
  public genNewName(
    name: string,
    type: AssetType,
    stripExtension: boolean = false,
  ) {
    let i = 1;

    let rootName: string;
    let ext: string | undefined;
    let getName: () => string;
    let newName: string;

    if (stripExtension) {
      [rootName, ext] = name.split('.');

      ext = `.${ext}`;
      getName = () => `${newName}${ext}`;
    } else {
      rootName = name;

      getName = () => newName;
    }

    newName = rootName;

    while (this.checkIsAssetNameDuplicate(getName(), type)) {
      newName = `${rootName}-${i}`;
      i++;
    }

    return getName();
  }

  public checkIsAssetNameDuplicate(name: string, type: AssetType) {
    const _name = this.formatName(name, type);

    const assetEntries = this.getEntriesByAssetType(type);

    if (
      _name !== null &&
      this._state.replica.project[assetEntries][_name] !== undefined
    ) {
      return true;
    }
    return false;
  }

  /**
   * 检查资源是否冲突，判定优先级 hash > name
   */
  public checkAssetConflict = (spec: {
    name: string;
    hash: string;
    assetType: AssetType;
  }) => {
    const assetEntries = this.getEntriesByAssetType(spec.assetType);
    const assets = this._state.replica.project[assetEntries];

    const name = this.formatName(spec.name, spec.assetType);
    if (name === null) {
      return { conflict: assetConflict.none, data: null };
    }

    const meshList = this.getAssetsList(spec.assetType);
    let nameRepeat = false;
    for (let i = 0; i < meshList.length; i++) {
      if (spec.hash === assets[meshList[i]].hash) {
        return {
          conflict: assetConflict.hashRepeat,
          rawName: this.rawName(meshList[i]),
          data: meshList[i],
        };
      }
      if (name === meshList[i]) {
        nameRepeat = true;
      }
    }

    if (nameRepeat) {
      return { conflict: assetConflict.namingDuplicate, data: null };
    }

    return { conflict: assetConflict.none, data: null };
  };

  public checkIsAudioInAssets(audio: { name: string; audioHash: string }) {
    const { audioAssets } = this._state.replica.project;
    const audioList = Object.keys(audioAssets);
    const [name] = audio.name.split('.');
    const audioName = this.formatName(name, AssetType.AUDIO);
    for (let i = 0; i < audioList.length; i++) {
      const hash = audioAssets[audioList[i]].hash;
      if (audio.audioHash === hash) {
        if (audioName === audioList[i]) {
          return { conflict: assetConflict.contentIdentical, data: null };
        } else {
          return {
            conflict: assetConflict.hashRepeat,
            data: this.rawName(audioList[i]),
          };
        }
      }
    }
    return { conflict: assetConflict.none, data: null };
  }

  public updateAudioNameInProject = (audioName: string, newName: string) => {
    if (this._state.replica.project.assets[audioName]) {
      const newAudioName = this.formatName(newName, AssetType.AUDIO);
      if (newAudioName) {
        this._tx
          .push((action) => action.audioAssets.move(audioName, newAudioName))
          .commit();
        return newAudioName;
      }
    }
    return false;
  };

  public removeAudioFromProject = (audioName: string) => {
    const item = this._state.replica.project.audioAssets[audioName];
    if (item) {
      this._tx
        .push((action) => action.audioAssets.remove(audioName))
        .push((action) =>
          action.deleteAssets.push({
            key: audioName,
            value: {
              ownerId: 0,
              contentId: Number(item.id),
              hash: item.hash,
              previewImage: item.previewImage,
              type: AssetType.AUDIO,
              size: item.size,
              bounds: vec3.create(),
              animated: false,
            },
          }),
        )
        .commit(EditActionLabel.PROJECT, false);
      return true;
    }
    return false;
  };

  public updateScriptNameInProject = (scriptName: string, newName: string) => {
    if (this._state.replica.project.assets[scriptName]) {
      // 生成文件名字
      const newScriptName = this.formatName(newName, AssetType.JS_SCRIPT);
      if (newScriptName) {
        this._tx
          .push((action) => action.assets.move(scriptName, newScriptName))
          .commit();
        return newScriptName;
      }
    }
    return false;
  };

  public removeScriptFromProject = (scriptName: string) => {
    if (['index.js', 'clientIndex.js'].includes(scriptName)) {
      return false;
    }
    const item = this._state.replica.project.assets[scriptName];
    if (item) {
      this._tx
        .push((action) => action.assets.remove(scriptName))
        .push((action) =>
          action.deleteAssets.push({ key: scriptName, value: item }),
        )
        .commit(EditActionLabel.PROJECT, false);
      return true;
    }
    return false;
  };

  public pushScriptToDeleteAssets = (
    script: {
      name: string;
      hash: string;
      size: number;
      type: AssetType.CLIENT_JS_SCRIPT | AssetType.JS_SCRIPT;
    },
    scriptId: number,
  ) => {
    this._tx
      .push((action) =>
        action.deleteAssets.push({
          key: script.name,
          value: {
            ownerId: 0,
            contentId: scriptId,
            hash: script.hash,
            previewImage: '',
            type: script.type,
            size: script.size,
            bounds: vec3.create(),
            animated: false,
          },
        }),
      )
      .commit(EditActionLabel.PROJECT, false);
    return true;
  };

  /**
   * 只在assets里删除，不放入deleteAssets
   * @param scriptName
   */
  public removeScriptFromProjectOnly = (scriptName: string) => {
    if (['index.js', 'clientIndex.js'].includes(scriptName)) {
      return false;
    }
    const item = this._state.replica.project.assets[scriptName];
    if (item) {
      this._tx
        .push((action) => action.assets.remove(scriptName))
        .commit(EditActionLabel.PROJECT, false);
    }
    return true;
  };

  public addImageToProject = (
    img: {
      name: string;
      hash: string;
    },
    imgId: number,
  ) => {
    if (img.name.trim() === '') {
      return false;
    }
    const name = this.formatName(img.name, AssetType.IMAGE);
    if (!name) {
      return false;
    }
    this._tx
      .push((action) =>
        action.assets.set(name, {
          ownerId: 0,
          contentId: imgId,
          hash: img.hash,
          previewImage: '',
          type: AssetType.IMAGE,
          size: 0,
          bounds: vec3.create(),
          animated: false,
        }),
      )
      .commit(EditActionLabel.PROJECT, false);
    return true;
  };

  public addAudioToProject = async (audio: {
    name: string;
    hash: string;
    size: number;
    imageHash?: string;
  }) => {
    if (audio.name.trim() === '') {
      return false;
    }
    const name = this.formatName(audio.name, AssetType.AUDIO);
    if (!name) {
      return false;
    }

    try {
      const ids = await apis.createra.nextGameUidListUsingGet({ num: 1 });
      if (!ids[0]) {
        return false;
      }
      this._tx
        .push((action) =>
          action.audioAssets.set(name, {
            hash: audio.hash,
            previewImage: audio.imageHash || '',
            type: AssetType.AUDIO,
            size: audio.size,
            updateAt: new Date().getTime(),
            id: ids[0],
          }),
        )
        .commit(EditActionLabel.PROJECT, false);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  /**
   * 文件存在则更新hash,size，不存在则新建
   * @param script
   */
  public ensureScriptInProject = (script: {
    name: string;
    hash: string;
    size: number;
    type: AssetType.CLIENT_JS_SCRIPT | AssetType.JS_SCRIPT;
  }) => {
    const asset = this._state.replica.project.assets[script.name];
    if (asset) {
      this._tx
        .push((action) => action.assets.update(script.name).hash(script.hash))
        .push((action) => action.assets.update(script.name).size(script.size))
        .commit(EditActionLabel.PROJECT, false);
      return true;
    } else {
      return this.addScriptToProject(script, 0);
    }
  };

  public addScriptToProject = (
    script: {
      name: string;
      hash: string;
      size: number;
      type: AssetType.CLIENT_JS_SCRIPT | AssetType.JS_SCRIPT;
    },
    scriptId: number,
  ) => {
    if (script.name.trim() === '') {
      return false;
    }
    if (script.name !== null) {
      this._tx
        .push((action) =>
          action.assets.set(script.name, {
            ownerId: 0,
            contentId: scriptId,
            hash: script.hash,
            previewImage: '',
            type: script.type,
            size: script.size,
            bounds: vec3.create(),
            animated: false,
          }),
        )
        .commit(EditActionLabel.PROJECT, false);
      return true;
    } else {
      return false;
    }
  };

  /**
   * 增加图片（Picture）资源
   * @param picture 图片资源
   */
  public addPictureToProject = async (picture: {
    name: string;
    hash: string;
    previewImage: string;
    size: number;
  }) => {
    const { name, hash, previewImage, size } = picture;
    if (name.trim() === '') {
      return false;
    }

    const formatName = this.formatName(picture.name, AssetType.PICTURE);

    if (!formatName) {
      return false;
    }

    try {
      const ids = await apis.createra.nextGameUidListUsingGet({ num: 1 });
      if (!ids[0]) {
        return false;
      }
      this._tx
        .push((action) =>
          action.pictureAssets.set(formatName, {
            hash: hash,
            previewImage: previewImage,
            type: AssetType.PICTURE,
            size: size,
            updateAt: new Date().getTime(),
            id: ids[0],
          }),
        )
        .commit(EditActionLabel.PROJECT, false);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  public removePictureFromProject = (formatName: string) => {
    const item = this._state.replica.project.pictureAssets[formatName];
    if (item) {
      this._tx
        .push((action) => action.pictureAssets.remove(formatName))
        .push((action) =>
          action.deleteAssets.push({
            key: formatName,
            value: {
              ownerId: 0,
              contentId: Number(item.id),
              hash: item.hash,
              previewImage: item.previewImage,
              type: AssetType.PICTURE,
              size: item.size,
              bounds: vec3.create(),
              animated: false,
            },
          }),
        )
        .commit(EditActionLabel.PROJECT, false);
      return true;
    }
    return false;
  };

  /**
   * 根据assets名称 在deleteAssets中检查目标资源是否存在 并返回其下标
   * 如果存在下标 > -1，否则下标为-1
   */
  public getAssetIndexInTrashBin = (
    meshName: string,
    meshAsset: AssetEntry,
  ) => {
    let index = -1;
    for (let i = 0; i < this._state.replica.project.deleteAssets.length; i++) {
      if (this._state.replica.project.deleteAssets[i].key === meshName) {
        const item = this._state.replica.project.deleteAssets[i].value;
        if (
          item.type === meshAsset.type &&
          item.hash === meshAsset.hash &&
          item.contentId === meshAsset.contentId &&
          item.size === meshAsset.size &&
          item.ownerId === meshAsset.ownerId &&
          item.previewImage === meshAsset.previewImage
        ) {
          index = i;
          break;
        }
      }
    }
    return index;
  };

  /**
   * 根据资源类型，获取对应的资源集合的key
   * - 音频存储在audioAssets
   * - 图片存储在pictureAssets
   * - 其他资源存储在assets
   */
  private getEntriesByAssetType(assetType: AssetType) {
    switch (assetType) {
      case AssetType.AUDIO:
        return 'audioAssets';
      case AssetType.PICTURE:
        return 'pictureAssets';
      default:
        return 'assets';
    }
  }

  /**
   * 根据assets名称 在deleteAssets中恢复资源
   * @return true 资源恢复成功
   * @return false 找不到资源
   * @newName 如果传入，会在恢复同时重命名为该新名称
   */
  public recoverAssetFromTrashBin = (
    meshName: string,
    meshAsset: AssetEntry,
    newName?: string,
  ) => {
    const index = this.getAssetIndexInTrashBin(meshName, meshAsset);

    if (index > -1) {
      const restoredName = newName ? newName : meshName;
      const transaction = appendProjectAssetRecovery(
        this._tx,
        index,
        restoredName,
        meshAsset,
      );
      transaction.commit(EditActionLabel.PROJECT, false);
      return true;
    }
    return false;
  };

  public setTrashBin = (
    newDeleteAssets: typeof DeleteAssetsRDA.stateSchema.identity,
  ) => {
    this._tx
      .push((action) => action.deleteAssets.reset(newDeleteAssets))
      .commit(EditActionLabel.PROJECT, false);
  };

  public eraseFromTrashBin = (assetName: string, asset: AssetEntry) => {
    const { deleteAssets } = this._state.replica.project;

    const idx = deleteAssets.findIndex(
      (deleteAsset) =>
        assetName === deleteAsset.key &&
        AssetEntryRDA.stateSchema.equal(asset, deleteAsset.value),
    );

    if (idx < 0) {
      return false;
    }

    this._tx
      .push((action) => action.deleteAssets.splice(idx, 1))
      .commit(EditActionLabel.PROJECT, false);

    return true;
  };

  public duplicateScriptByName = (name: string, isClient: boolean) => {
    const asset = this._state.replica.project.assets[name + '.js'];
    if (asset) {
      return this.copyAsset(name, asset, isClient);
    } else {
      return false;
    }
  };

  public copyAsset = (
    assetName: string,
    assetEntry: AssetEntry,
    isClient: boolean,
  ) => {
    const { type, hash } = assetEntry;
    const fileNames = Object.keys(this._state.replica.project.assets);
    let i = 1;
    while (true) {
      const newName = this.formatName(`${assetName}-${i++}`, type);
      if (!newName) {
        return false;
      }
      if (fileNames.indexOf(newName) === -1) {
        this._tx
          .push((action) =>
            action.assets.set(newName, {
              ...assetEntry,
              ownerId: 0,
            }),
          )
          .commit(EditActionLabel.PROJECT, false);
        if (
          type === AssetType.JS_SCRIPT ||
          type === AssetType.CLIENT_JS_SCRIPT
        ) {
          CodeEditorClientController.instance.recoverFile(
            newName,
            hash,
            isClient,
          );
        }
        return true;
      }
    }
  };

  public getModelPreviewUrl = (previewFileHash: string) => {
    const runtimeConfig = getConfig();
    const ossCDNURL = runtimeConfig.OSS_CDN_URL || clientConfig.OSS_CDN_URL || '';
    return getModelPreviewURL({
      previewHash: previewFileHash,
      isLocalGameServer: Boolean(clientConfig.isLocalGameServer),
      runtimeURL: runtimeConfig.BACKEND_SERVER_URL,
      ossCDNURL,
    });
  };

  public getModelNameFromMeshAssetsKey = (key: string) => {
    if (!key) {
      return key;
    }
    const path = key.split('/');
    const modelNameWithExt = path[path.length - 1];
    return modelNameWithExt.split('.')[0];
  };

  public addGLBToProject = (
    glb: {
      name: string;
      hash: string;
      bounds: vec3;
    },
    contentId: number,
  ) => {
    if (glb.name.trim() === '') {
      return false;
    }
    const name = this.formatName(glb.name, AssetType.GLTF_MODEL);
    if (!name) {
      return false;
    }
    this._tx
      .push((action) =>
        action.assets.set(name, {
          ownerId: 0,
          contentId: contentId,
          hash: glb.hash,
          previewImage: '',
          type: AssetType.GLTF_MODEL,
          size: 0,
          bounds: glb.bounds,
          animated: false,
        }),
      )
      .commit(EditActionLabel.PROJECT, false);
    return true;
  };

  public removeGLBFromProject(name: string) {
    const item = this._state.replica.project.assets[name];
    if (item) {
      this._tx
        .push((action) => action.assets.remove(name))
        .commit(EditActionLabel.PROJECT);
      return true;
    }
    return false;
  }
}
