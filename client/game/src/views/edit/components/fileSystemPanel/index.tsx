import React, { createRef, type JSX } from 'react';
import { Image } from '../../../components/image';
import { Toast } from '@box/box-design';
import {
  ScriptType,
  ShareScriptErrorCode,
} from '@box/apis';
import { Modal as BoxModal } from '@box/box-design';

import { preloadSoundSample } from 'src/engine/sound/client-sound-controller';
import { hashURL } from 'src/utils/hash-url';
import {
  AmbientSoundEnum,
  AssetEntries,
  AssetEntry,
  AssetEntryRDA,
  AssetType,
  DeleteAssetsRDA,
  EntitySoundEnum,
  PlayerSoundEnum,
} from '@box/schema/project/project-rda';
import {
  AudioPreviewPlayer,
  AudioUploadPreviewTool,
} from '../uploadPreviewTool';
import { sliceAudioBuffer } from './sliceAudioBuffer';
import { audioBufferToWav } from './audioBufferToWave';
import { encrypt } from './text-cipher';

import { Search } from '../search';
import { ClickPopup } from '../../../components/basic/click-popup';
import { notice } from '../../../components/common/notice';
import { Modal } from '../../../components/edit/modal';

import { calc_class_name } from 'src/utils/classname';
import { copyToClipboard } from 'src/utils/copy2clipboard';
import { isMobile, isTablet } from 'src/utils/mobile';
import { editor } from 'src/client/edit/edit-client';
import { SoundType } from 'src/client/edit/state-controller/environment-controller';
import { SoundSchema } from 'src/client/edit/edit-schema';

import imgCreateraGameCoverUniversal from 'src/assets/default_game_cover_universal.png';
import styles from './index.module.scss';
import { apis } from 'src/apis/local-api';
import { injectIntl, IntlShape } from 'react-intl';
import {
  AUDIO_EXTS,
  IMAGE_EXTS_WITHOUT_DOT,
  IMAGE_MIMES,
  isOSSAsset,
} from './defs';
import type { ImageResource } from 'src/engine/resource/schema';
import { VoxaDataType, setVoxaData } from 'src/redux/edit/creator';
import { reduxDispatch, RootState } from 'src/redux/edit';
import { connect } from 'react-redux';
import ProjectModelActions, {
  Actions,
} from 'src/views/edit/components/stage-area/edit-model-panel/project-model-actions';
import { ModelAction } from 'src/views/edit/components/stage-area/edit-model-panel';
import type { ModelData } from 'src/views/edit/components/stage-area/edit-model-panel';
import { getProjectModelDisplayName } from 'src/views/edit/components/stage-area/edit-model-panel/project-model-membership';
import { ModelType } from '@box/apis';
import { convertTimeStrToTimestamp } from 'src/utils/date';
import { clientConfig, getConfig } from 'src/config/client';
import { setRemoveId, setRenameOptions } from 'src/redux/edit/script-manager';
import { CodeEditorStateContext } from '../script-container/hooks';
import { useCopyScript } from '../script-manager/hooks';
import { ScriptIcon } from '../script-manager/script-icon';
import { checkIndexFile, isInvalidFileName } from '../script-manager/utils';
import { assetConflict } from 'src/client/edit/state-controller/asset-controller';

const imgGameCover = imgCreateraGameCoverUniversal;
interface Props {
  intl: IntlShape;
  userId: number;
  running: boolean;
  closeModal: () => void;
  handleOpenEditor: () => void;
  setVoxaData: (props: VoxaDataType) => void;
}

interface State {
  selectedTab: TabList;
  searchValue: string;
  selectedContent: TabContent;
  isOpenDetail: boolean;
  openModal: ModalType;
  sort: [TableHead, SortWay];
  uploadingFiles: string[];
  updateCounter: number;
  addResourceBtnActive: boolean; // 上传按钮菜单的展开状态
  showDragOverMask: boolean;
  sampleCache: (typeof SoundSchema.identity)['sampleCache'];
}

enum Type {
  Normal,
  Phone,
}

enum TabList {
  Script = AssetType.JS_SCRIPT,
  Model = AssetType.VOXEL_MODEL,
  Filter = AssetType.COLOR_LUT,
  Texture = AssetType.PARTICLE_TEXTURE,
  Image = AssetType.IMAGE,
  Audio = AssetType.AUDIO,
  Picture = AssetType.PICTURE,
  All = 9,
  Recycle = 10,
}

// The file manager represents the map's project files. Models imported only
// into the local VOXA library use generated `__local_<id>.vb` paths and belong
// to the model library panel, not this project asset list.
const LOCAL_LIBRARY_MODEL_PATH = /__local_\d+\.vb$/;

enum TableHead {
  Name,
  // LastModified,
  Size,
  None,
}

enum SortWay {
  ASC,
  DESC,
}

enum AssetsI18nMap {
  serverScript = AssetType.JS_SCRIPT,
  model = AssetType.VOXEL_MODEL,
  lut = AssetType.COLOR_LUT,
  texture = AssetType.PARTICLE_TEXTURE,
  audio = AssetType.AUDIO,
  clientScript = AssetType.CLIENT_JS_SCRIPT,
  picture = AssetType.PICTURE,
}

enum DetailInfo {
  Normal,
  Copy,
  Image,
}

enum ModalType {
  Remove,
  PermanentlyRemoveAll,
  PermanentlyRemoveOne,
  UploadAudio,
  UploadWarning,
  None,
}

interface Tab {
  mark: TabList;
  icon: string;
  type: Type;
  title: string;
  count?: number;
}

interface TabContent {
  key: string;
  value: AssetEntry;
}

interface Pair {
  title: string;
  content: string;
  type: DetailInfo;
}

export function fileSystemProjectModel(
  key: string,
  value: AssetEntry,
): ModelData {
  const storedName = key.replace(/^mesh\//, '').replace(/\.vb$/, '');
  return {
    id: Number(value.contentId || 0),
    name: getProjectModelDisplayName(storedName),
    modelPreviewUrl: value.previewImage,
    modelFileHash: value.hash,
    bounds: [value.bounds[0], value.bounds[1], value.bounds[2]],
    animated: value.animated,
    type: ModelType.Project,
    updateAt: '',
    meshPath: key,
    libraryScope: 'project',
  };
}

class FileSystemContainer extends React.Component<Props, State> {
  static contextType = CodeEditorStateContext;
  declare context: React.ContextType<typeof CodeEditorStateContext>;
  private uploadInputRef!: HTMLInputElement;

  private _preUploadBuffer: ArrayBuffer | null = null;
  private _prePreviewAudioBuffer: AudioBuffer | null = null;
  private _prePreviewAudioStartPos: number = 0;
  private _prePreviewAudioEndPos: number = Infinity;
  private _prepareUploadFileName: string = '';
  private _pendingId: string | null = null;
  private _prePreviewAudioQuality = 22050;

  private _gamePlayMode: boolean;

  private TAB_ITEM: Tab[] = [
    {
      mark: TabList.Model,
      icon: styles.modelIcon,
      type: Type.Normal,
      title: this.props.intl.formatMessage({ id: 'model' }),
    },
    {
      mark: TabList.Picture,
      icon: styles.pictureIcon,
      type: Type.Normal,
      title: this.props.intl.formatMessage({ id: 'picture' }),
    },
    {
      mark: TabList.Texture,
      icon: styles.textureIcon,
      type: Type.Normal,
      title: this.props.intl.formatMessage({ id: 'texture' }),
    },
    {
      mark: TabList.Filter,
      icon: styles.filterIcon,
      type: Type.Normal,
      title: this.props.intl.formatMessage({ id: 'lut' }),
    },
    {
      mark: TabList.Script,
      icon: styles.codeIcon,
      type: Type.Normal,
      title: this.props.intl.formatMessage({ id: 'script' }),
    },
    {
      mark: TabList.Audio,
      icon: styles.audioIcon,
      type: Type.Normal,
      title: this.props.intl.formatMessage({ id: 'audio' }),
    },
    {
      mark: TabList.Recycle,
      icon: styles.recycleIcon,
      type: Type.Normal,
      title: this.props.intl.formatMessage({ id: 'recycle' }),
    },
  ];

  private _waitReplicaUpdate = false;

  private _usedInAmbient = false;
  private _usedInPlayer = false;
  private _usedInEntities = false;

  public uploadingAssets: string[] = []; // 正在上传的资源的名称

  private projectModelActionsRef = createRef<Actions>();

  private requestProjectModel = async (body: Record<string, unknown>) => {
    const runtimeURL = getConfig().BACKEND_SERVER_URL.replace(/\/$/, '');
    const response = await fetch(`${runtimeURL}/api/project-models`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => undefined);
      throw new Error(result?.message || '项目模型操作失败');
    }
    return await response.json();
  };

  private restoreProjectModel = async (key: string) => {
    await this.requestProjectModel({ action: 'restore', meshPath: key });
    editor.replica.updateExtraProject();
  };

  private purgeProjectModel = async (key: string) => {
    await this.requestProjectModel({ action: 'purge', meshPath: key });
  };

  public constructor(props) {
    super(props);
    this.state = {
      selectedTab: TabList.Model,
      selectedContent: { key: '', value: AssetEntryRDA.stateSchema.identity },
      isOpenDetail: false,
      openModal: ModalType.None,
      searchValue: '',
      // sort: [TableHead.LastModified, SortWay.DESC],
      sort: [TableHead.Name, SortWay.DESC],
      uploadingFiles: [],
      updateCounter: 0,
      addResourceBtnActive: false,
      showDragOverMask: false,
      sampleCache: editor.game.state.sound.sampleCache,
    };

    this._gamePlayMode = this.props.running;
  }

  private handleProjectChange = () => {
    if (this._waitReplicaUpdate) {
      this.setState({ updateCounter: this.state.updateCounter + 1 });
      this._waitReplicaUpdate = false;
    }
  };

  private handleExtraProjectChange = () => {
    this.setState({ updateCounter: this.state.updateCounter + 1 });
  };

  private setSampleCache = (sound: typeof SoundSchema.identity) => {
    this.setState({ sampleCache: sound.sampleCache });
  };

  public componentDidMount() {
    editor.replica.onProjectChange.sub(this.handleProjectChange);
    editor.replica.onExtraProjectChange.sub(this.handleExtraProjectChange);
    editor.listeners.sound.sub(this.setSampleCache);
    editor.replica.updateExtraProject();
  }

  public componentWillUnmount() {
    editor.replica.onProjectChange.unsub(this.handleProjectChange);
    editor.replica.onExtraProjectChange.unsub(this.handleExtraProjectChange);
    editor.listeners.sound.unsub(this.setSampleCache);
  }

  public shouldComponentUpdate(nextProps: Props, nextState: State) {
    if (nextProps.running !== this._gamePlayMode) {
      return true;
    }
    if (
      nextState.updateCounter !== this.state.updateCounter ||
      nextState.selectedTab !== this.state.selectedTab ||
      nextState.selectedContent.key !== this.state.selectedContent.key ||
      nextState.selectedContent.value !== this.state.selectedContent.value ||
      nextState.isOpenDetail !== this.state.isOpenDetail ||
      nextState.openModal !== this.state.openModal ||
      nextState.searchValue !== this.state.searchValue ||
      nextState.sort !== this.state.sort ||
      nextState.addResourceBtnActive !== this.state.addResourceBtnActive ||
      nextState.showDragOverMask !== this.state.showDragOverMask
    ) {
      return true;
    }
    if (nextState.uploadingFiles.length !== this.state.uploadingFiles.length) {
      return true;
    } else {
      for (let i = 0; i < nextState.uploadingFiles.length; i++) {
        if (nextState.uploadingFiles[i] !== this.state.uploadingFiles[i]) {
          return true;
        }
      }
    }
    return false;
  }

  public componentDidUpdate(): void {
    const {
      selectedContent: { key, value },
      isOpenDetail,
    } = this.state;
    if (!key || !isOpenDetail) {
      return;
    }
    const { meshAssets, scriptAssets } = editor.state.replica.extraProjectInfo;
    const { assets, audioAssets, pictureAssets } = editor.state.replica.project;

    if (this.state.selectedTab === TabList.Recycle) {
      if (editor.assetController.getAssetIndexInTrashBin(key, value) < 0) {
        this.setState({
          isOpenDetail: false,
          selectedContent: {
            key: '',
            value: AssetEntryRDA.stateSchema.identity,
          },
        });
      }
      return;
    }
    let assetExits = true;
    switch (value.type) {
      case AssetType.AUDIO: {
        assetExits = !!audioAssets[key];
        break;
      }
      case AssetType.PICTURE: {
        assetExits = !!pictureAssets[key];
        break;
      }
      case AssetType.VOXEL_MODEL: {
        assetExits = !!meshAssets[key];
        break;
      }
      case AssetType.JS_SCRIPT:
      case AssetType.CLIENT_JS_SCRIPT: {
        assetExits = !!scriptAssets[key];
        break;
      }
      default: {
        assetExits = !!assets[key];
      }
    }
    if (!assetExits) {
      this.setState({
        isOpenDetail: false,
        selectedContent: {
          key: '',
          value: AssetEntryRDA.stateSchema.identity,
        },
      });
    }
  }

  private searchRef = React.createRef<React.ElementRef<typeof Search>>();

  private phoneSortOption = [
    {
      name: 'lettersOrder',
      sort: [TableHead.Name, SortWay.DESC],
    },
    {
      name: 'lettersReverseOrder',
      sort: [TableHead.Name, SortWay.ASC],
    },
    // {
    //   name: 'lastModified',
    //   sort: [TableHead.LastModified, SortWay.DESC],
    // },
    {
      name: 'bigToSmall',
      sort: [TableHead.Size, SortWay.DESC],
    },
    {
      name: 'smallToBig',
      sort: [TableHead.Size, SortWay.ASC],
    },
  ];

  private tableData = [
    {
      type: TableHead.Name,
      title: this.props.intl.formatMessage({ id: '_name' }),
      // width: '60%',
      width: '76%',
      render: (item: TabContent, width: string) => {
        const { key, value } = item;
        let { previewImage, type, hash } = value;

        // 模型和图片属于OSS数据，单独处理
        if (isOSSAsset(type)) {
          previewImage =
            editor.assetController.getModelPreviewUrl(previewImage);
          hash = encrypt(hash);
        }

        const path = key.split('/');
        const storedFileName = path[path.length - 1];
        const name =
          type === AssetType.VOXEL_MODEL
            ? `${getProjectModelDisplayName(
                storedFileName.replace(/\.vb$/, ''),
              )}.vb`
            : storedFileName;
        return (
          <div
            key={TableHead.Name + key}
            className={styles.contentItemName}
            style={{ width }}
            onClick={() => this.onTabContentItemClick(item)}
          >
            {type === AssetType.JS_SCRIPT ||
            type === AssetType.CLIENT_JS_SCRIPT ? (
              <div className={styles.codeIconWrapper}>
                <div className={styles.codeIcon}>
                  {this._renderScriptIcon(key)}
                </div>
              </div>
            ) : type === AssetType.AUDIO ? (
              previewImage !== undefined && previewImage !== '' ? (
                <img
                  className={styles.tabContentItemImage}
                  src={hashURL(previewImage)}
                />
              ) : (
                <div className={styles.audioIconWrapper}>
                  <div className={styles.audioIcon}></div>
                </div>
              )
            ) : (
              <div className={styles.tabContentItemImage}>
                <Image
                  width={48}
                  height={48}
                  layout="fixed"
                  src={hashURL(previewImage) || imgGameCover}
                />
              </div>
            )}
            <div className={styles.tabContentItemInfo}>
              <div className={styles.tabContentName}>
                {value.animated && <div className={styles.animatedIconSmall} />}
                {name}
              </div>
              <div className={styles.tabContentItemHash}>{String(hash)}</div>
            </div>
          </div>
        );
      },
    },
    // {
    //   type: TableHead.LastModified,
    //   title: this.props.intl.formatMessage({ id: 'lastModified' }),
    //   width: '27%',
    //   render: (item, width) => {
    //     // const {key, value} = item;
    //     // const {lastModified} = value;
    //     // return (
    //     //   <div
    //     //     key={TableHead.LastModified + key}
    //     //     className={styles.contentItemLastModified}
    //     //     style={{width}}
    //     //     onClick={() => this.onTabContentItemClick(item)}
    //     //   >
    //     //     {formatDate(lastModified, language)}
    //     //   </div>
    //     // );
    //   },
    // },
    {
      type: TableHead.Size,
      title: this.props.intl.formatMessage({ id: 'fileSize' }),
      width: '15%',
      render: (item, width) => {
        const { key, value } = item;
        const { size } = value;
        return (
          <div
            key={TableHead.Size + key}
            className={styles.contentItemSize}
            style={{ width }}
            onClick={() => this.onTabContentItemClick(item)}
          >
            {this.transformSizeUnit(size)}
          </div>
        );
      },
    },
    {
      type: TableHead.None,
      title: '',
      width: '8%',
      render: (item, width) => {
        const { key } = item;
        return (
          <div
            key={TableHead.None + key}
            className={styles.contentItemOperationWrapper}
            style={{ width }}
          >
            <div className={styles.contentItemOperation}>
              {this._renderOption(item)}
            </div>
          </div>
        );
      },
    },
  ];

  private isOnlyMobile = () => {
    return isMobile() && !isTablet();
  };

  private checkIfAssetBeenUsed(waitingDeleteAsset: string) {
    const project = editor.state.replica.project;
    const ambientKeys = Object.keys(project.ambientSound);
    for (let i = 0; i < ambientKeys.length; i++) {
      if (project.ambientSound[ambientKeys[i]].sample === waitingDeleteAsset) {
        this._usedInAmbient = true;
        break;
      }
    }

    let playerKeys = Object.keys(project.player.sounds);
    for (let i = 0; i < playerKeys.length; i++) {
      if (project.player.sounds[playerKeys[i]].sample === waitingDeleteAsset) {
        this._usedInPlayer = true;
        break;
      }
    }

    playerKeys = Object.keys(project.player.playerSounds);
    for (let i = 0; i < playerKeys.length; i++) {
      if (
        project.player.playerSounds[playerKeys[i]].sample === waitingDeleteAsset
      ) {
        this._usedInPlayer = true;
        break;
      }
    }

    const entitiesTree = project.entitiesTree;
    const treeKeys = Object.keys(entitiesTree);
    for (let i = 0; i < treeKeys.length; i++) {
      const seed = entitiesTree[treeKeys[i]]?.value;
      if (!seed) {
        continue;
      }
      if (
        seed.sound.chat.sample === waitingDeleteAsset ||
        seed.sound.die.sample === waitingDeleteAsset ||
        seed.sound.hurt.sample === waitingDeleteAsset ||
        seed.sound.interact.sample === waitingDeleteAsset
      ) {
        this._usedInEntities = true;
        break;
      }
    }
  }

  private sideEffectOfRemoveAudio(waitingDeleteAsset: string) {
    const project = editor.state.replica.project;
    if (this._usedInAmbient) {
      const ambientKeys = Object.keys(project.ambientSound);
      for (let i = 0; i < ambientKeys.length; i++) {
        if (
          project.ambientSound[ambientKeys[i]].sample === waitingDeleteAsset
        ) {
          editor.envController.setSoundSample(
            ambientKeys[i] as AmbientSoundEnum,
            '',
            SoundType.World,
          );
        }
      }
    }
    if (this._usedInPlayer) {
      let playerKeys = Object.keys(project.player.sounds);
      for (let i = 0; i < playerKeys.length; i++) {
        if (
          project.player.sounds[playerKeys[i]].sample === waitingDeleteAsset
        ) {
          editor.envController.setSoundSample(
            playerKeys[i] as EntitySoundEnum,
            '',
            SoundType.Entity,
          );
        }
      }
      playerKeys = Object.keys(project.player.playerSounds);
      for (let i = 0; i < playerKeys.length; i++) {
        if (
          project.player.playerSounds[playerKeys[i]].sample ===
          waitingDeleteAsset
        ) {
          editor.envController.setSoundSample(
            playerKeys[i] as PlayerSoundEnum,
            '',
            SoundType.Player,
          );
        }
      }
    }
    if (this._usedInEntities) {
      const entitiesTree = project.entitiesTree;
      const treeKeys = Object.keys(entitiesTree);
      for (let i = 0; i < treeKeys.length; i++) {
        const seed = entitiesTree[treeKeys[i]]?.value;
        if (!seed) {
          continue;
        }
        if (seed.sound.chat.sample === waitingDeleteAsset) {
          editor.seedController.setSoundChat(treeKeys[i], '');
        }
        if (seed.sound.die.sample === waitingDeleteAsset) {
          editor.seedController.setSoundDie(treeKeys[i], '');
        }
        if (seed.sound.hurt.sample === waitingDeleteAsset) {
          editor.seedController.setSoundHurt(treeKeys[i], '');
        }
        if (seed.sound.interact.sample === waitingDeleteAsset) {
          editor.seedController.setSoundInteract(treeKeys[i], '');
        }
      }
    }
  }

  private handleScriptRecycle(item: { key: string; value: AssetEntry }) {
    const { key, value } = item;
    const { type } = value;
    const filename = this.transformName(key, true);
    // 1. 资源存在性检测：如果资源不存在后续操作都无意义
    if (editor.assetController.getAssetIndexInTrashBin(key, value) === -1) {
      Toast.info({
        content: this.props.intl.formatMessage({
          id: 'scriptRecoverFail',
        }),
      });
      return;
    }
    // 1.非扩展地图
    if (!clientConfig.mapInfo.combType || clientConfig.mapInfo.isLocalMapGroup) {
      // 2. 重名检测：范围是本图所有脚本
      if (!editor.codeEditorController.getFileByName(filename)) {
        // 3. 将资源从 deleteAssets 转移到 projectAssets
        if (editor.assetController.recoverAssetFromTrashBin(key, value)) {
          // 4. 将恢复的脚本文件更新到 fileDictReplica（同步给本图其他客户端）
          editor.codeEditorController.recoverFile(
            filename,
            value.hash,
            value.type === AssetType.CLIENT_JS_SCRIPT,
          );
          // 5. toast成功
          Toast.success({
            content: this.props.intl.formatMessage(
              { id: 'assets$$HasRecovered' },
              { filename },
            ),
          });
          return;
        }
        // 6. toast失败（资源不存在）
        Toast.info({
          content: this.props.intl.formatMessage({
            id: 'scriptRecoverFail',
          }),
        });
        return;
      }
      // 7. 名称重复，打开恢复文件的重命名弹窗
      Toast.info({
        content: this.props.intl.formatMessage({
          id: 'scriptRecoverFail',
        }),
      });
      reduxDispatch(
        setRenameOptions({
          recoverInfo: { key, value: AssetEntryRDA.stateSchema.toJSON(value) },
        }),
      );
      return;
    }
    // 1.扩展地图
    apis.createra
      .createScriptUsingPost({
        mapId: clientConfig.mapInfo.contentId,
        name: filename,
        type:
          type === AssetType.JS_SCRIPT ? ScriptType.Server : ScriptType.Client,
      })
      .then((res) => {
        // 2. 将资源从 deleteAssets 转移到 projectAssets
        if (editor.assetController.recoverAssetFromTrashBin(key, value)) {
          editor.codeEditorController.addFileForce({
            fileId: res.id,
            name: res.name,
            hash: value.hash || '',
            isClient: res.type === ScriptType.Client,
          });
          // 3 toast成功
          Toast.success({
            content: this.props.intl.formatMessage(
              { id: 'assets$$HasRecovered' },
              { filename },
            ),
          });
          return;
        }
        // 4. toast失败（资源不存在）
        Toast.info({
          content: this.props.intl.formatMessage({
            id: 'scriptRecoverFail',
          }),
        });
      })
      .catch((err) => {
        switch (err.code) {
          case ShareScriptErrorCode.ScriptNameRepeat:
            // 5. 名称重复，打开重命名弹窗
            Toast.info({
              content: this.props.intl.formatMessage({
                id: 'scriptRecoverFail',
              }),
            });
            reduxDispatch(setRenameOptions({ recoverInfo: item }));
            break;
          case ShareScriptErrorCode.NotCombMap:
          case ShareScriptErrorCode.ScriptGlobalLockFailed:
          default:
            // 6. toast失败（其他情况）
            Toast.info({
              content: this.props.intl.formatMessage({
                id: 'scriptRecoverFail',
              }),
            });
            break;
        }
      });
  }

  private _renderOption = (item: { key: string; value: AssetEntry }) => {
    const { selectedTab } = this.state;
    const { key, value } = item;
    const name = this.transformName(key, true);
    const { type } = value;
    let popup;
    const hasOperation =
      type === AssetType.CLIENT_JS_SCRIPT ||
      type === AssetType.JS_SCRIPT ||
      type === AssetType.AUDIO ||
      type === AssetType.VOXEL_MODEL ||
      type === AssetType.PICTURE;
    const isRecycle = selectedTab === TabList.Recycle;
    if (!hasOperation) {
      return null;
    }
    if (isRecycle) {
      popup = (
        <div className={styles.popupContainer}>
          <div
            className={styles.popupSelection}
            onClick={async () => {
              const filename = this.transformName(key, true);
              if (type === AssetType.VOXEL_MODEL) {
                try {
                  await this.restoreProjectModel(key);
                  this._waitReplicaUpdate = true;
                  Toast.success({
                    content: this.props.intl.formatMessage(
                      { id: 'assets$$HasRecovered' },
                      { filename },
                    ),
                  });
                } catch (error) {
                  Toast.error({
                    content:
                      error instanceof Error
                        ? error.message
                        : this.props.intl.formatMessage({ id: 'scriptRecoverFail' }),
                  });
                }
              } else if (
                type === AssetType.JS_SCRIPT ||
                type === AssetType.CLIENT_JS_SCRIPT
              ) {
                this.handleScriptRecycle(item);
              } else if (
                editor.assetController.recoverAssetFromTrashBin(key, value)
              ) {
                this._waitReplicaUpdate = true;
                Toast.success({
                  content: this.props.intl.formatMessage(
                    { id: 'assets$$HasRecovered' },
                    { filename },
                  ),
                });
              } else {
                Toast.error({
                  content: this.props.intl.formatMessage({
                    id: 'scriptRecoverFail',
                  }),
                });
              }
              this.setState({
                isOpenDetail: false,
              });
            }}
          >
            {this.props.intl.formatMessage({ id: 'recover' })}
          </div>
          <div
            className={styles.popupSelection}
            onClick={() => {
              this.handleModalChange(ModalType.PermanentlyRemoveOne);
            }}
          >
            {this.props.intl.formatMessage({ id: 'remove' })}
          </div>
        </div>
      );
    } else {
      if (type === AssetType.JS_SCRIPT || type === AssetType.CLIENT_JS_SCRIPT) {
        if (!editor.state.replica.localPermissions.editScripts) {
          return null;
        }
        const file = editor.codeEditorController.getFileByName(name);
        popup = (
          <div className={styles.popupContainer}>
            <div
              className={styles.popupSelection}
              onClick={() => {
                if (!file) {
                  this._waitReplicaUpdate = true;
                  return;
                }
                this.props.handleOpenEditor();
                editor.codeEditorController.selectFile(file.fileId);
              }}
            >
              {this.props.intl.formatMessage({ id: 'edit' })}
            </div>
            <div
              className={styles.popupSelection}
              onClick={useCopyScript({
                file: file ? file : undefined,
                intl: this.props.intl,
              })}
            >
              {this.props.intl.formatMessage({ id: 'copy' })}
            </div>
            {!['index.js', 'clientIndex.js'].includes(name) && (
              <>
                <div
                  className={styles.popupSelection}
                  onClick={() => {
                    if (!file) {
                      Toast.info({
                        content: this.props.intl.formatMessage({
                          id: 'cannotFindFile',
                        }),
                      });
                      return;
                    }
                    this.setState({
                      isOpenDetail: false,
                    });
                    reduxDispatch(
                      setRenameOptions({
                        renameInfo: {
                          fileId: file.fileId,
                          isShare: file.isShare,
                        },
                      }),
                    );
                  }}
                >
                  {this.props.intl.formatMessage({ id: 'rename' })}
                </div>
                <div
                  className={styles.popupSelection}
                  onClick={() => {
                    if (!file) {
                      Toast.info({
                        content: this.props.intl.formatMessage({
                          id: 'fileAlreadyDelete',
                        }),
                      });
                      return;
                    }
                    this.setState({
                      isOpenDetail: false,
                    });
                    reduxDispatch(setRemoveId(file.fileId));
                  }}
                >
                  {this.props.intl.formatMessage({ id: 'remove' })}
                </div>
              </>
            )}
          </div>
        );
      } else if (type === AssetType.VOXEL_MODEL) {
        if (!editor.state.replica.localPermissions.editModel) {
          return null;
        }
        const projectModel = fileSystemProjectModel(item.key, item.value);
        popup = (
          <div className={styles.popupContainer}>
            <div
              className={styles.popupSelection}
              onClick={() => {
                this.projectModelActionsRef.current?.[ModelAction.Edit]?.(
                  projectModel,
                );
              }}
            >
              {this.props.intl.formatMessage({ id: 'edit' })}
            </div>
            <div
              className={styles.popupSelection}
              onClick={async () => {
                this.projectModelActionsRef.current?.[ModelAction.Copy]?.(
                  projectModel,
                );
              }}
            >
              {this.props.intl.formatMessage({ id: 'copy' })}
            </div>
            <div
              className={styles.popupSelection}
              onClick={() => {
                this.projectModelActionsRef.current?.[ModelAction.Rename]?.(
                  projectModel,
                );
              }}
            >
              {this.props.intl.formatMessage({ id: 'rename' })}
            </div>
            <div
              className={styles.popupSelection}
              onClick={() => {
                this.projectModelActionsRef.current?.[ModelAction.Remove]?.(
                  projectModel,
                );
              }}
            >
              {this.props.intl.formatMessage({ id: 'remove' })}
            </div>
          </div>
        );
      } else if (type === AssetType.AUDIO) {
        popup = (
          <div className={styles.popupContainer}>
            <div
              className={styles.popupSelection}
              onClick={() => {
                this.checkIfAssetBeenUsed(item.key);
                const destroy = BoxModal.show({
                  type: 'warning',
                  title: this.props.intl.formatMessage({
                    id: 'removeAudio',
                  }),
                  width: 448,
                  buttonSort: 'rtl',
                  content: (
                    <>
                      <p className={styles.tip}>
                        {this.props.intl.formatMessage({
                          id: 'removeTipConfirm',
                        })}
                      </p>
                      <p className={styles.tip}>
                        {this.props.intl.formatMessage(
                          { id: 'removeTip' },
                          { fileName: name },
                        )}
                      </p>
                    </>
                  ),
                  confirmText: this.props.intl.formatMessage({
                    id: 'removeConfirm',
                  }),
                  onConfirm: () => {
                    const result =
                      editor.assetController.removeAudioFromProject(item.key);
                    if (result) {
                      this.sideEffectOfRemoveAudio(item.key);
                      Toast.success({
                        content: this.props.intl.formatMessage({
                          id: 'deleteSuccess',
                        }),
                      });
                      this.setState({ isOpenDetail: false });
                    }
                    this._waitReplicaUpdate = true;
                    this._usedInAmbient = false;
                    this._usedInPlayer = false;
                    this._usedInEntities = false;
                    destroy();
                  },
                  cancelText: this.props.intl.formatMessage({ id: 'cancel' }),
                  onCancel: () => {
                    this._usedInAmbient = false;
                    this._usedInPlayer = false;
                    this._usedInEntities = false;
                    destroy();
                  },
                });
              }}
            >
              {this.props.intl.formatMessage({ id: 'remove' })}
            </div>
          </div>
        );
      } else if (type === AssetType.PICTURE) {
        popup = (
          <div className={styles.popupContainer}>
            <div
              className={styles.popupSelection}
              onClick={() => {
                const path = key.split('/');
                const name = path[path.length - 1];
                const destroy = BoxModal.show({
                  type: 'warning',
                  title: this.props.intl.formatMessage({
                    id: 'removePicture',
                  }),
                  width: 448,
                  buttonSort: 'rtl',
                  content: (
                    <>
                      <p className={styles.tip}>
                        {this.props.intl.formatMessage({
                          id: 'removeTipConfirm',
                        })}
                      </p>
                      <p className={styles.tip}>
                        {this.props.intl.formatMessage(
                          { id: 'removeTip' },
                          { fileName: name },
                        )}
                      </p>
                    </>
                  ),
                  confirmText: this.props.intl.formatMessage({
                    id: 'gameUIPropImageRemove',
                  }),
                  onConfirm: async () => {
                    const result =
                      editor.assetController.removePictureFromProject(item.key);
                    if (result) {
                      Toast.success({
                        content: this.props.intl.formatMessage({
                          id: 'deleteSuccess',
                        }),
                      });
                      // 如果删除了虚拟按键正在使用的图片资源，需要将虚拟按键重置为默认皮肤
                      editor.gamepadController.resetGamepadAssets(key);
                      destroy();
                      this.setState({ isOpenDetail: false });
                    }
                  },
                  cancelText: this.props.intl.formatMessage({ id: 'cancel' }),
                  onCancel: () => {
                    destroy();
                  },
                });
              }}
            >
              {this.props.intl.formatMessage({ id: 'remove' })}
            </div>
          </div>
        );
      }
    }
    return (
      <>
        {
          <ClickPopup popup={popup}>
            <div
              className={styles.tagOperation}
              onClick={() => {
                this.setState({
                  selectedContent: item,
                });
              }}
            ></div>
          </ClickPopup>
        }
      </>
    );
  };

  private handleDeleteAll = async () => {
    const { deleteAssets } = editor.state.replica.project;
    if (!deleteAssets.length) {
      return;
    }

    let newDeleteAssets: typeof DeleteAssetsRDA.stateSchema.identity = [];

    for (const item of deleteAssets) {
      if (item.value.type === AssetType.VOXEL_MODEL) {
        try {
          await this.purgeProjectModel(item.key);
        } catch (error) {
          console.error(error);
          newDeleteAssets.push(item);
        }
      } else if (item.value.type === AssetType.PICTURE) {
        editor.game.resourceController?.removeImageResource(item.value.hash);
      }
    }

    // 如果新的数组和原有数组长度相同，说明没有任何变化，不执行后续流程
    if (deleteAssets.length !== newDeleteAssets.length) {
      editor.assetController.setTrashBin(newDeleteAssets);

      this._waitReplicaUpdate = true;

      Toast.success({
        content: this.props.intl.formatMessage({ id: 'assetsHasErasedAll' }),
      });
    }
  };

  private _renderTabFoot = (selectedTab: TabList) => {
    const disabledBtn = editor.state.replica.project.deleteAssets.length === 0;
    switch (selectedTab) {
      case TabList.All: {
        return <div></div>;
      }
      case TabList.Recycle: {
        return (
          <div className={calc_class_name(styles.recycleFoot)}>
            <button
              className={
                disabledBtn
                  ? styles.recycleButtonDisabled
                  : styles.recycleButton
              }
              onClick={() => {
                if (disabledBtn) {
                  return;
                }
                this.handleModalChange(ModalType.PermanentlyRemoveAll);
              }}
            >
              {this.props.intl.formatMessage({ id: 'deleteAll' })}
            </button>
          </div>
        );
      }
      default: {
        return <></>;
      }
    }
  };

  private _handleSortChange = (type: TableHead) => {
    if (type === TableHead.None) {
      return;
    }
    const { sort } = this.state;
    const [prevSort, prevSortWay] = sort;
    let sortWay;
    if (type === prevSort) {
      sortWay = prevSortWay === SortWay.ASC ? SortWay.DESC : SortWay.ASC;
    } else {
      sortWay = SortWay.DESC;
    }
    this.setState({
      sort: [type, sortWay],
    });
  };

  private _renderTabTableHead = () => {
    const { sort, selectedTab } = this.state;
    const [sorted, way] = sort;
    const sortIcon = way === SortWay.ASC ? styles.ascIcon : styles.descIcon;
    return (
      <>
        {this.tableData.map((item, index) => {
          const { type, title, width } = item;
          const isBlank = type === TableHead.None;
          return (
            <div
              className={calc_class_name(
                !isBlank ? styles.tableHeadItem : '',
                type === TableHead.Name ? styles.tableHeadFirstItem : '',
              )}
              style={{ width }}
              key={type + index}
              onClick={() => {
                // 模型使用extraProject里的数据，不可改变排序字段
                if (selectedTab === TabList.Model) {
                  return;
                }
                this._handleSortChange(type);
              }}
            >
              {!isBlank && (
                <>
                  <div className={styles.tableHeadItemContent}>{title}</div>
                  {sorted === type && selectedTab !== TabList.Model && (
                    <div className={sortIcon}></div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </>
    );
  };

  private transformName = (key: string, keepExtension: boolean) => {
    const path = key.split('/');
    if (keepExtension) {
      return path[path.length - 1];
    } else {
      const tempArr = path[path.length - 1].split('.');
      tempArr.pop();
      return tempArr.join('.');
    }
  };

  private transformSizeUnit = (size: number, remain: boolean = false) => {
    let res = '';
    if (size < 0.1 * 1024) {
      const calc = size.toFixed(2);
      if (calc === '0.00' && !remain) {
        res = '--';
      } else {
        res = `${calc}B`;
      }
    } else if (size < 0.1 * 1024 * 1024) {
      res = `${(size / 1024).toFixed(2)}KB`;
    } else if (size < 0.1 * 1024 * 1024 * 1024) {
      res = `${(size / 1024 / 1024).toFixed(2)}MB`;
    }
    return res;
  };

  private onTabContentItemClick = (item: TabContent) => {
    if (
      item.value.type === AssetType.AUDIO &&
      editor.game.state.sound.supported === false
    ) {
      Toast.warning({ content: 'WebAudio not support in your Browser' });
      return;
    }
    this.setState({
      selectedContent: item,
      isOpenDetail: true,
    });
  };

  private copyData = (copy) => {
    copyToClipboard(copy);
    Toast.success({
      content: this.props.intl.formatMessage({ id: 'copySuccess' }),
    });
  };

  private fetchAudio = (hash: string, callback: (AudioBuffer) => void) => {
    preloadSoundSample(editor.game.state, hash)
      .then(() => {
        if (this.state.sampleCache[hash] && this.state.sampleCache.buffer) {
          callback(this.state.sampleCache[hash].buffer);
        } else {
          throw Error('preloadSoundSample got empty buffer');
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  private _renderDetailInfo = (assetItem: AssetEntry, item: Pair) => {
    const { title, content, type } = item;
    let safeHash = '';
    // for voxel model file, we need to hide the actual hash
    if (title === 'Hash' && isOSSAsset(assetItem.type)) {
      safeHash = encrypt(content);
    }
    switch (type) {
      case DetailInfo.Normal: {
        return (
          <div key={title + content} className={styles.contentDetailInfo}>
            <div className={styles.contentDetailInfoTitle}>{title}</div>
            <div className={styles.contentDetailInfoContent}>
              {safeHash || content}
            </div>
          </div>
        );
      }
      case DetailInfo.Copy: {
        return (
          <div
            key={title + content}
            className={styles.contentDetailCopyInfo}
            onClick={() => {
              if (safeHash) {
                this.copyData(safeHash);
              } else {
                this.copyData(content);
              }
            }}
          >
            <div className={styles.contentDetailInfoTitle}>{title}</div>
            <div className={styles.contentDetailInfoContent}>
              {safeHash || content}
            </div>
          </div>
        );
      }
      case DetailInfo.Image: {
        if (assetItem.type === AssetType.AUDIO) {
          let param: string | AudioBuffer = assetItem.hash;
          if (
            this.state.sampleCache[assetItem.hash] &&
            this.state.sampleCache[assetItem.hash].buffer
          ) {
            param = this.state.sampleCache[assetItem.hash]
              .buffer as AudioBuffer;
          }
          return (
            <div
              style={{
                border: '1px solid var(--color-white-30)',
                padding: '47px 0px 10px 0px',
              }}
              key={title + content}
            >
              <AudioPreviewPlayer
                audioContext={editor.game.state.sound.context as AudioContext}
                waveformHeight={150}
                fetchAudio={this.fetchAudio}
                data={param}
                key={assetItem.hash}
              ></AudioPreviewPlayer>
            </div>
          );
        } else {
          return content ? (
            <div
              key={title + content}
              className={styles.contentDetailImgContainer}
            >
              <img className={styles.contentDetailImg} src={content} />
              {assetItem.animated && <div className={styles.animatedIcon} />}
            </div>
          ) : (
            <Image key={title + content} src={imgGameCover} />
          );
        }
      }
      default: {
        return null;
      }
    }
  };

  private _renderContentDetail = (item: TabContent) => {
    const { key, value } = item;
    const { type, previewImage, size, hash } = value;
    const path = key.split('/');
    const name = path[path.length - 1];
    const icon = this.isOnlyMobile() ? styles.backIcon : styles.closeIcon;
    const pairs: Pair[] = [
      {
        title: '',
        content: isOSSAsset(type)
          ? editor.assetController.getModelPreviewUrl(previewImage)
          : hashURL(previewImage),
        type: DetailInfo.Image,
      },
      {
        title: this.props.intl.formatMessage({ id: '_name' }),
        content: name,
        type: DetailInfo.Normal,
      },
      {
        title: this.props.intl.formatMessage({ id: 'category' }),
        content: this.props.intl.formatMessage({ id: AssetsI18nMap[type] }),
        type: DetailInfo.Normal,
      },
      {
        title: this.props.intl.formatMessage({ id: 'path' }),
        content: String(key),
        type: DetailInfo.Copy,
      },
      {
        title: 'Hash',
        content: String(hash),
        type: DetailInfo.Copy,
      },
      // {
      //   title: this.props.intl.formatMessage({ id: 'lastModified' }),
      //   content: new Date(0),
      //   type: DetailInfo.Normal,
      // },
      // {
      //   title: this.props.intl.formatMessage({ id: 'createdAt' }),
      //   content: new Date(0),
      //   type: DetailInfo.Normal,
      // },
      {
        title: this.props.intl.formatMessage({ id: 'fileSize' }),
        content: this.transformSizeUnit(size),
        type: DetailInfo.Normal,
      },
    ];
    return (
      <div className={styles.contentDetail}>
        <div className={styles.contentDetailBar}>
          <div className={styles.contentDetailTitle}>
            <div
              className={icon}
              onClick={() => {
                this.setState({
                  isOpenDetail: false,
                  selectedContent: {
                    key: '',
                    value: AssetEntryRDA.stateSchema.identity,
                  },
                });
              }}
            ></div>
            <div className={styles.contentDetailText}>
              {this.props.intl.formatMessage({ id: 'fileDetail' })}
            </div>
          </div>
          {this._renderOption(item)}
        </div>
        <div className={styles.contentDetailInfoWrapper}>
          {pairs.map((pair) => {
            return this._renderDetailInfo(value, pair);
          })}
        </div>
      </div>
    );
  };

  private _renderPhoneTableContent = (item: TabContent) => {
    const { key, value } = item;
    const name = this.transformName(key, true);
    const { previewImage, type } = value;
    let safeHash = '';
    if (type === AssetType.VOXEL_MODEL) {
      safeHash = encrypt(value.hash);
    }
    return (
      <>
        <div
          className={styles.phoneContentItem}
          onClick={() => this.onTabContentItemClick(item)}
        >
          {type === AssetType.JS_SCRIPT || AssetType.CLIENT_JS_SCRIPT ? (
            <div className={styles.codeIconWrapper}>
              <div className={styles.codeIcon}>
                {this._renderScriptIcon(key)}
              </div>
            </div>
          ) : type === AssetType.AUDIO ? (
            previewImage !== undefined && previewImage !== '' ? (
              <img
                className={styles.tabContentItemImage}
                src={hashURL(previewImage)}
              />
            ) : (
              <div className={styles.audioIconWrapper}>
                <div className={styles.audioIcon}></div>
              </div>
            )
          ) : (
            <div className={styles.tabContentItemImage}>
              <Image
                width={48}
                height={48}
                layout="fixed"
                src={hashURL(previewImage) || imgGameCover}
              />
            </div>
          )}
          <div className={styles.phoneTabContentItemWrapper}>
            <div className={styles.tabContentItemInfo}>
              <div>{name}</div>
              <div className={styles.tabContentItemHash}>
                {isOSSAsset(type) ? safeHash : value.hash}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.phoneContentItemOperationWrapper}>
          <div className={styles.contentItemOperation}>
            {this._renderOption(item)}
          </div>
        </div>
      </>
    );
  };

  // TODO: 仅在TabList.All时展示，目前暂时关闭了“全部”列表，因此这个已经无用，未来可以删除
  private _renderUploadingItem = () => {
    const list: JSX.Element[] = [];
    for (let i = 0; i < this.state.uploadingFiles.length; i++) {
      list.push(
        <div key={-(i + 1)} className={styles.contentItem}>
          <div className={styles.contentItemWrapper}>
            <div
              className={styles.contentItemName}
              style={{
                width: '100%',
                marginRight: '4px',
              }}
            >
              <div className={styles.audioIconWrapper}>
                <div className={styles.uploading}></div>
              </div>
              <div className={styles.tabContentItemInfo}>
                <div>{this.state.uploadingFiles[i]}</div>
                <div className={styles.tabContentItemHash}>
                  {this.props.intl.formatMessage({
                    id: 'UploadingAndTranscoding',
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>,
      );
    }
    return list;
  };

  private _renderTabContentItem = (item: TabContent, index: number) => {
    const { selectedContent } = this.state;
    const isSelected = selectedContent.key === item.key;
    return (
      <div key={index} className={styles.contentItem}>
        {this.isOnlyMobile() ? (
          <div className={styles.phoneContentItemWrapper}>
            {this._renderPhoneTableContent(item)}
          </div>
        ) : (
          <div
            className={calc_class_name(
              styles.contentItemWrapper,
              isSelected ? styles.contentItemSelected : '',
            )}
          >
            {this.tableData.map((head) => {
              const { width, render } = head;
              return render(item, width);
            })}
          </div>
        )}
      </div>
    );
  };

  private processData = (
    data: TabContent[],
    selectedTab?: TabList,
    disableSearch?: boolean,
  ) => {
    const { sort, searchValue } = this.state;
    const [sortBy, sortWay] = sort;
    let arr = data;
    if (selectedTab) {
      arr = arr.filter((tabContent) => {
        const assetType = AssetType[tabContent.value.type];
        if (selectedTab === TabList.Script) {
          if (AssetType[assetType] === AssetType.CLIENT_JS_SCRIPT) {
            return true;
          }
          return AssetType[assetType] === selectedTab;
        }
        return AssetType[assetType] === selectedTab;
      });
    }

    const processData = [...arr].sort((first, second) => {
      // 模型根据extraProject里的updateAt排序
      if (selectedTab === TabList.Model) {
        const meshAssets = editor.state.replica.extraProjectInfo.meshAssets;

        return (
          convertTimeStrToTimestamp(meshAssets[second.key].updatedAt) -
          convertTimeStrToTimestamp(meshAssets[first.key].updatedAt)
        );
      }
      switch (sortBy) {
        case TableHead.Name: {
          const firstName = this.transformName(first.key, true);
          const secondName = this.transformName(second.key, true);
          return sortWay === SortWay.ASC
            ? secondName.localeCompare(firstName)
            : firstName.localeCompare(secondName);
        }
        // case TableHead.LastModified: {
        //   const firstTime = first.value.lastModified;
        //   const secondTime = second.value.lastModified;
        //   return sortWay === SortWay.ASC ?
        //     firstTime >= secondTime ? 1 : -1 :
        //     secondTime >= firstTime ? 1 : -1;
        // }
        case TableHead.Size: {
          const firstSize = first.value.size;
          const secondSize = second.value.size;
          return sortWay === SortWay.ASC
            ? firstSize - secondSize
            : secondSize - firstSize;
        }
        default: {
          return first.key.localeCompare(second.key) ? 1 : -1;
        }
      }
    });
    if (searchValue && !disableSearch) {
      return processData.filter((item) => {
        const { key, value } = item;
        const { hash } = value;
        const name = this.transformName(key, true);
        if (
          name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1 ||
          hash.indexOf(searchValue) > -1
        ) {
          return true;
        }
        return false;
      });
    }
    return processData;
  };

  private _renderTabContent = (tab: TabList) => {
    const height = tab === TabList.Recycle ? 72 : 0;
    const { assets, audioAssets, deleteAssets, pictureAssets } =
      editor.state.replica.project;
    const { meshAssets, scriptAssets } = editor.state.replica.extraProjectInfo;
    const { codeEditorState } = this.context;
    const data: TabContent[] = Object.keys(assets).map((key) => {
      return {
        key,
        value: assets[key],
      };
    });
    const tabContent = {};
    this.TAB_ITEM.forEach(({ mark: tabItem }) => {
      let processData;
      if (tabItem === TabList.All) {
        processData = this.processData(data);
        tabContent[tabItem] = () => {
          return (
            <div>
              {this._renderUploadingItem()}
              {processData &&
                processData.map((item, index) => {
                  return this._renderTabContentItem(item, index);
                })}
            </div>
          );
        };
        return;
      } else if (tabItem === TabList.Recycle) {
        processData = this.processData(deleteAssets);
      } else if (tabItem === TabList.Model) {
        processData = this.processData(
          Object.entries(meshAssets)
            .filter(([key]) => !LOCAL_LIBRARY_MODEL_PATH.test(key))
            .map(([key, meshAsset]) => ({
            key,
            value: {
              previewImage: meshAsset.modelPreviewHash,
              type: AssetType.VOXEL_MODEL,
              hash: meshAsset.hash,
              size: editor.game.state.modelCache.modelSize[meshAsset.hash],
              contentId: meshAsset.modelId,
              ownerId: 0,
              bounds: [0, 0, 0],
              animated: meshAsset.animated,
            },
            })),
          tabItem,
        );
      } else if (tabItem === TabList.Picture) {
        processData = this.processData(
          Object.entries(pictureAssets).map(([key, pictureAsset]) => ({
            key: key,
            value: {
              previewImage: pictureAsset.previewImage,
              type: pictureAsset.type,
              hash: pictureAsset.hash,
              size: pictureAsset.size,
              contentId: Number(pictureAsset.id),
              ownerId: 0,
              bounds: [0, 0, 0],
              animated: false,
            },
          })),
          tabItem,
        );
      } else if (tabItem === TabList.Audio) {
        processData = this.processData(
          Object.entries(audioAssets).map(([key, audioAsset]) => ({
            key,
            value: {
              previewImage: audioAsset.previewImage,
              type: audioAsset.type,
              hash: audioAsset.hash,
              size: audioAsset.size,
              contentId: Number(audioAsset.id),
              ownerId: 0,
              bounds: [0, 0, 0],
              animated: false,
            },
          })),
          tabItem,
        );
      } else if (tabItem === TabList.Script && clientConfig.mapInfo.combType) {
        const scriptList: TabContent[] = Object.entries(
          codeEditorState.fileDict,
        )
          .filter(([fileId, script]) => {
            return script.isShare
              ? !!scriptAssets[fileId]?.hash
              : !!assets[script.name]?.hash;
          })
          .map(([fileId, script]) => {
            return {
              key: script.name,
              value: {
                type: script.isClient
                  ? AssetType.CLIENT_JS_SCRIPT
                  : AssetType.JS_SCRIPT,
                hash: script.isShare
                  ? scriptAssets[fileId].hash // 共享脚本hash：从 extraProject 读取
                  : assets[script.name].hash, // 非共享脚本hash：从 project.assets 读取
                size: script.isShare
                  ? script.size // 共享脚本size：从 codeEditorState 读取
                  : assets[script.name].size, // 非共享脚本size：从 project.assets 读取
                contentId: Number(fileId),
                ownerId: 0,
                bounds: [0, 0, 0],
                animated: false,
                previewImage: '',
              },
            };
          });
        processData = this.processData(scriptList, tabItem);
      } else {
        processData = this.processData(data, tabItem);
      }
      tabContent[tabItem] = () => {
        return (
          <>
            {processData &&
              processData.map((item, index) => {
                return this._renderTabContentItem(item, index);
              })}
          </>
        );
      };
    });
    return (
      <div
        className={styles.tableContent}
        style={{ height: `calc(100% - 93px - ${height}px)` }}
      >
        {tabContent[tab]()}
      </div>
    );
  };

  private _handleTabChange = (tab: TabList) => {
    this.setState({
      selectedTab: tab,
      isOpenDetail: false,
      selectedContent: { key: '', value: AssetEntryRDA.stateSchema.identity },
    });
  };

  private _renderTab = (tab: Tab) => {
    const { icon, type, title, count, mark } = tab;
    const { selectedTab } = this.state;
    switch (type) {
      case Type.Normal: {
        return (
          <div
            className={calc_class_name(
              styles.tabItem,
              selectedTab === mark && styles.selectedTab,
            )}
            key={mark}
            onClick={() => this._handleTabChange(mark)}
          >
            <div className={styles.tabContentTitleWrapper}>
              <div className={icon}>
                {mark === TabList.Script && this._renderScriptIcon()}
              </div>
              <div className={styles.tabContentTitle}>{title}</div>
            </div>
            <div className={styles.tabContentCount}>{count}</div>
          </div>
        );
      }
      case Type.Phone: {
        return (
          <div
            className={calc_class_name(
              styles.phoneTabItem,
              selectedTab === mark && styles.selectedTab,
            )}
            key={mark}
            onClick={() => this._handleTabChange(mark)}
          >
            <div className={styles.phoneTabContentTitleWrapper}>
              <div className={icon}></div>
              <div className={styles.phoneTabContentTitle}>{title}</div>
            </div>
          </div>
        );
      }
    }
  };

  // 主资源管理窗口
  private _renderFileSystemTabs = () => {
    const { assets, audioAssets, deleteAssets, pictureAssets } =
      editor.state.replica.project;
    const { meshAssets } = editor.state.replica.extraProjectInfo;
    const { codeEditorState } = this.context;

    /**
     * 记录“全部”数据数量，已经没用了，因为“全部”不会显示了
     * 但是又不能把后面的case TabList.ALL删掉，否则资源数组顺序会错
     */
    let assetLength = 0;

    const data: TabContent[] = [];

    const countAssets = (
      assetEntries: AssetEntries,
      filter: (asset: AssetEntry) => boolean = () => true,
    ) => {
      for (const key in assetEntries) {
        const asset = assetEntries[key];

        if (!filter(asset)) {
          continue;
        }

        data.push({
          key,
          value: assetEntries[key],
        });

        assetLength++;
      }
    };

    /**
     * TODO 当前线上版本没有把音频从assets中移除，因此在assets里读取数据可能包含音频
     * 之后随共享数据migration流程调整，再把assets中的音频移除
     */
    countAssets(assets, ({ type }) => type !== AssetType.AUDIO);

    const tabs: Tab[] = [];

    this.TAB_ITEM.forEach((tabItem) => {
      switch (tabItem.mark) {
        case TabList.All:
          tabs.push({
            ...tabItem,
            count: assetLength,
          });

          break;
        case TabList.Recycle: {
          const deleteAssetLength = Object.keys(deleteAssets).length;

          tabs.push({
            ...tabItem,
            count: deleteAssetLength,
          });

          break;
        }
        case TabList.Model: {
          const modelListLength = Object.keys(meshAssets).length;
          tabs.push({
            ...tabItem,
            count: modelListLength,
          });

          break;
        }
        case TabList.Picture: {
          const pictureListLength = Object.keys(pictureAssets).length;
          tabs.push({
            ...tabItem,
            count: pictureListLength,
          });

          break;
        }
        case TabList.Audio: {
          const audioListLength = Object.keys(audioAssets).length;
          tabs.push({
            ...tabItem,
            count: audioListLength,
          });
          break;
        }
        case TabList.Script: {
          if (clientConfig.mapInfo.combType) {
            const scriptListLength = Object.keys(
              codeEditorState.fileDict,
            ).length;
            tabs.push({
              ...tabItem,
              count: scriptListLength,
            });
          } else {
            tabs.push({
              ...tabItem,
              count: this.processData(data, TabList.Script, true).length,
            });
          }

          break;
        }
        default: {
          tabs.push({
            ...tabItem,
            count: this.processData(data, tabItem.mark, true).length,
          });

          break;
        }
      }

      return;
    });

    return (
      <div className={styles.fileSystemTab}>
        <div className={styles.fileSystemTabTitle}>
          {this.props.intl.formatMessage({ id: 'fileSystemTitle' })}
        </div>
        <div className={styles.fileSystemTabContent}>
          {tabs.map((tab, index) => {
            return (
              <React.Fragment key={tab.mark}>
                {!this.isOnlyMobile() && index === tabs.length - 1 && (
                  <div className={styles.tabLine}></div>
                )}
                {this._renderTab(tab)}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  private handleSearch = (search: string) => {
    this.setState({
      searchValue: search,
      isOpenDetail: false,
      selectedContent: { key: '', value: AssetEntryRDA.stateSchema.identity },
    });
  };

  /**
   * 处理图片文件上传的流程
   *
   */
  private async uploadPicture(file: File) {
    const { type, size, name } = file;
    const { intl } = this.props;

    if (this.uploadingAssets.length >= 1) {
      Toast.error({ content: intl.formatMessage({ id: 'isUploading' }) });
      return;
    }

    if (
      !type.includes('image/') ||
      !IMAGE_EXTS_WITHOUT_DOT.find((ext) => type.includes(ext))
    ) {
      Toast.error({ content: intl.formatMessage({ id: 'uploadFormatError' }) });
      return;
    }
    if (isInvalidFileName(name)) {
      Toast.error({
        content: intl.formatMessage({ id: 'uploadInvalidTip' }),
      });
      return;
    }

    let width: number;
    let height: number;

    // 读取一下文件，获取尺寸信息
    try {
      const img = document.createElement('img');
      const blob = new Blob([file]);
      const url = URL.createObjectURL(blob);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;

        img.src = url;
      });

      width = img.width;
      height = img.height;
    } catch (err) {
      console.error('Failed to load img', err);

      // 加载不出来，也视作格式错误
      Toast.error({ content: intl.formatMessage({ id: 'uploadFormatError' }) });
      return;
    }

    this.uploadingAssets.push(file.name);
    this.setState({
      uploadingFiles: [...this.uploadingAssets],
      addResourceBtnActive: false,
    });

    Toast.loading({
      content: intl.formatMessage({
        id: 'uploading',
      }),
      duration: 0,
    });

    let metadata: ImageResource;
    let hash: string;
    try {
      const result = await editor.editContentStorage.storeImage({
        file,
        width,
        height,
      });

      metadata = result.imageResource;
      hash = result.hash;
    } catch (err) {
      console.error(err);

      Toast.destroyAll();
      Toast.error({ content: intl.formatMessage({ id: 'uploadFailed' }) });

      this.uploadingAssets.splice(0);
      this.setState({
        uploadingFiles: [...this.uploadingAssets],
      });
      return;
    }

    // 检查冲突
    const result = editor.assetController.checkAssetConflict({
      name: file.name,
      hash,
      assetType: AssetType.PICTURE,
    });
    let success = false;

    if (result.conflict !== assetConflict.hashRepeat) {
      let name = file.name;
      if (result.conflict === assetConflict.namingDuplicate) {
        name = editor.assetController.genNewName(name, AssetType.PICTURE, true);
      }
      success = await editor.assetController.addPictureToProject({
        name,
        hash,
        // 当前没有另外生成预览图，直接用图片本体做预览
        previewImage: metadata.hash,
        size,
      });
      if (success && clientConfig.mapInfo.isLocalMapGroup) {
        await editor.replica.saveProject();
      }

      // 更新标记，这样在监听到project变化时，才会触发刷新
      this._waitReplicaUpdate = true;
    } else {
      // hash相同时，名称可能不同, 应使用已存在hash的图片名称(已格式化过)
      success = true;
    }

    this.uploadingAssets.splice(0);
    this.setState({
      uploadingFiles: [...this.uploadingAssets],
    });

    Toast.destroyAll();
    if (success) {
      Toast.success({ content: intl.formatMessage({ id: 'uploadSuccess' }) });
    } else {
      Toast.error({ content: intl.formatMessage({ id: 'uploadFailed' }) });
    }
  }

  private _uploadFileClick(file: File): Promise<ArrayBuffer | undefined> {
    if (this.state.uploadingFiles.length >= 1) {
      Toast.error({
        content: this.props.intl.formatMessage({ id: 'isUploading' }),
      });
      this.uploadInputRef.value = '';
      return Promise.resolve(void 0);
    }
    if (!file || file.type.indexOf('audio/') < 0) {
      this.setState({ openModal: ModalType.UploadWarning });
      this.uploadInputRef.value = '';
      return Promise.resolve(void 0);
    }
    const ext = file.name.split('.').pop() || '';
    if (['mp3', 'ogg', 'm4a', 'wav', 'opus'].indexOf(ext) === -1) {
      this.setState({ openModal: ModalType.UploadWarning });
      this.uploadInputRef.value = '';
      return Promise.resolve(void 0);
    }
    if (file.size / 1000000 > 10) {
      this.setState({ openModal: ModalType.UploadWarning });
      Toast.error({
        content: this.props.intl.formatMessage({
          id: 'audioFileSizeLimit',
        }),
      });
      this.uploadInputRef.value = '';
      return Promise.resolve(void 0);
    }
    this._prepareUploadFileName = file.name;
    const promise = new Promise(
      (resolve: (value: ArrayBuffer) => void, reject) => {
        if ((file as any).arrayBuffer !== undefined) {
          (file as any).arrayBuffer().then((resultBuffer: ArrayBuffer) => {
            resolve(resultBuffer);
          });
        } else {
          const fileReader = new FileReader();
          fileReader.onload = () => {
            const resultBuffer = fileReader.result as ArrayBuffer;
            if (resultBuffer && resultBuffer.byteLength !== undefined) {
              resolve(resultBuffer);
            } else {
              reject('fileReader result is not arrayBuffer');
            }
          };
          fileReader.readAsArrayBuffer(file);
        }
        this.uploadInputRef.value = '';
      },
    );
    return promise;
  }

  private _handlePreUpload = (buffer: ArrayBuffer | undefined) => {
    if (buffer && editor.game.state.sound.context) {
      this._pendingId = notice.pending(
        this.props.intl.formatMessage({ id: 'Processing' }),
      );
      const tempBuffer = buffer.slice(0);
      this._preUploadBuffer = buffer;
      const context = editor.game.state.sound.context as AudioContext;
      if ((window as any).webkitAudioContext !== undefined) {
        (context as any).decodeAudioData(
          tempBuffer,
          (audiobuffer: AudioBuffer) => {
            this._prePreviewAudioBuffer = audiobuffer;
            this._prePreviewAudioStartPos = 0;
            this._prePreviewAudioEndPos = audiobuffer.duration;
            this.setState({ openModal: ModalType.UploadAudio });
            if (this._pendingId !== null) {
              notice.closeNotice(this._pendingId);
            }
          },
          (err) => {
            console.error(err);
            if (this._pendingId !== null) {
              notice.closeNotice(this._pendingId);
            }
            Toast.error({
              content: this.props.intl.formatMessage({
                id: 'AudioPreUploadError',
              }),
            });
          },
        );
      } else {
        context
          .decodeAudioData(tempBuffer, (audiobuffer: AudioBuffer) => {
            this._prePreviewAudioBuffer = audiobuffer;
            this._prePreviewAudioStartPos = 0;
            this._prePreviewAudioEndPos = audiobuffer.duration;
            this.setState({ openModal: ModalType.UploadAudio });
            if (this._pendingId !== null) {
              notice.closeNotice(this._pendingId);
            }
          })
          .catch((err) => {
            console.error(err);
            if (this._pendingId !== null) {
              notice.closeNotice(this._pendingId);
            }
            Toast.error({
              content: this.props.intl.formatMessage({
                id: 'AudioPreUploadError',
              }),
            });
          });
      }
    } else {
      if (!editor.game.state.sound.context) {
        Toast.warning({
          content: this.props.intl.formatMessage({ id: 'WebAudioNotSupport' }),
        });
      }
    }
  };

  private _onUploadInputChange = async (type: 'audio' | 'picture') => {
    if (this.uploadInputRef.files && this.uploadInputRef.files.length) {
      const file = this.uploadInputRef.files[0];

      if (type === 'picture') {
        await this.uploadPicture(file);

        this.uploadInputRef.value = '';
        this.uploadInputRef.capture = '';
      } else {
        this._uploadFileClick(file)
          .then(this._handlePreUpload)
          .catch((e) => console.error(e));
      }
    }
  };

  private _renderFileSystemContent = () => {
    const { selectedTab, selectedContent, isOpenDetail } = this.state;

    return (
      <div className={styles.fileSystemContent}>
        <div className={styles.contentBar}>
          <div className={styles.search}>
            <Search
              onSearch={(value) => this.handleSearch(value)}
              clearBtn
              size="small"
            />
          </div>
          <div
            className={styles.closeIcon}
            onClick={this.props.closeModal}
          ></div>
        </div>
        <div className={styles.tableHead}>{this._renderTabTableHead()}</div>
        {this._renderTabContent(selectedTab)}
        {this._renderTabFoot(selectedTab)}
        {isOpenDetail && (
          <div
            className={calc_class_name(
              this.isOnlyMobile()
                ? styles.phoneContentDetailWrapper
                : styles.contentDetailWrapper,
            )}
          >
            {this._renderContentDetail(selectedContent)}
          </div>
        )}
        {this._renderUploadResourceTool()}
      </div>
    );
  };

  private _renderUploadResourceTool = () => {
    let active = false;
    let dismiss = false;
    if (this.state.addResourceBtnActive) {
      active = true;
    }
    if (this.state.isOpenDetail || this.state.selectedTab === TabList.Recycle) {
      active = false;
      dismiss = true;
    }
    return (
      <div
        className={[
          styles.addResources,
          active ? styles.active : '',
          this.state.uploadingFiles.length >= 1 ? styles.disable : '',
          dismiss ? styles.dismiss : '',
        ].join(' ')}
      >
        <input
          type="file"
          style={{ width: 0, position: 'absolute' }}
          ref={(input) => {
            this.uploadInputRef = input as HTMLInputElement;
          }}
        />
        <div className={styles.addResourcesBg}>
          <div className={styles.uploadButtons}>
            <div
              className={styles.uploadButton}
              onClick={() => {
                this.uploadInputRef.accept = AUDIO_EXTS.join(',');
                this.uploadInputRef.onchange = () =>
                  this._onUploadInputChange('audio');
                this.uploadInputRef.click();
              }}
            >
              {this.props.intl.formatMessage({ id: 'UploadAudio' })}
            </div>
            <div
              className={styles.uploadButton}
              onClick={() => {
                this.uploadInputRef.accept = IMAGE_MIMES.join(',');
                this.uploadInputRef.capture = 'camera';
                this.uploadInputRef.onchange = () =>
                  this._onUploadInputChange('picture');
                this.uploadInputRef.click();
              }}
            >
              {this.props.intl.formatMessage({ id: 'uploadPicture' })}
            </div>
          </div>
          <div
            className={[styles.addResourcesBtn].join(' ')}
            onClick={() => {
              this.setState({
                addResourceBtnActive: !this.state.addResourceBtnActive,
              });
            }}
          >
            <div className={styles.addResourcesIcon}></div>
          </div>
        </div>
      </div>
    );
  };

  private _renderPhoneFileSystemTabs = () => {
    return (
      <div className={styles.phoneFileSystemTab}>
        <div className={styles.phoneFileSystemTabContent}>
          {this.TAB_ITEM.map((tab) => {
            return this._renderTab(tab);
          })}
        </div>
        <div className={styles.phoneFileSystemTabFoot}>
          <div
            className={styles.closeIcon}
            onClick={this.props.closeModal}
          ></div>
        </div>
      </div>
    );
  };

  private _handlePhoneSortChange = (sort) => {
    this.setState({
      sort,
    });
  };

  private _renderPhoneFileSystemContent = () => {
    const { selectedTab, sort } = this.state;
    const nowSelectedOption = this.phoneSortOption.filter((item) => {
      return item.sort[0] === sort[0] && item.sort[1] === sort[1];
    });

    return (
      <div className={styles.phoneFileSystemContent}>
        <div className={styles.phoneSearch}>
          <Search
            ref={this.searchRef}
            clearBtn
            onSearch={(value) => this.handleSearch(value)}
            size="small"
          />
        </div>
        <div className={styles.phoneSort}>
          <ClickPopup
            popup={
              <div className={styles.popupContainer}>
                {this.phoneSortOption.map((item) => {
                  return (
                    <div
                      key={item.name}
                      className={styles.popupSelection}
                      onClick={() => this._handlePhoneSortChange(item.sort)}
                    >
                      {this.props.intl.formatMessage({ id: item.name })}
                    </div>
                  );
                })}
              </div>
            }
          >
            <div className={styles.phoneSortWay}>
              <div>
                {this.props.intl.formatMessage({
                  id: nowSelectedOption[0].name,
                })}
              </div>
              <div className={styles.downIcon}></div>
            </div>
          </ClickPopup>
        </div>
        {this._renderTabContent(selectedTab)}
        {this._renderTabFoot(selectedTab)}
        {this._renderUploadResourceTool()}
      </div>
    );
  };

  private handleModalChange = (type: ModalType) => {
    this.setState({
      openModal: type,
    });
  };

  private _prepareUploadAudio = () => {
    if (this._prePreviewAudioBuffer) {
      const audioBuffer = sliceAudioBuffer(
        editor.game.state.sound.context as AudioContext,
        this._prePreviewAudioBuffer,
        this._prePreviewAudioStartPos,
        this._prePreviewAudioEndPos,
      );
      this._preUploadBuffer = audioBufferToWav(audioBuffer);
      return true;
    }
    return false;
  };

  private _renderScriptIcon(fileName?: string) {
    let fileId;
    if (
      this.state.selectedTab === TabList.Recycle ||
      !fileName ||
      !(fileId = editor.codeEditorController.getFileIdByName(fileName)) ||
      !this.context.codeEditorState.fileDict[fileId]
    ) {
      return (
        <ScriptIcon
          isIndex={false}
          isShare={false}
          lockedMapTitle={''}
          isUploading={false}
        />
      );
    }
    const file = this.context.codeEditorState.fileDict[fileId];
    const isIndex = checkIndexFile(fileName);

    return (
      <ScriptIcon
        isIndex={isIndex}
        isShare={file.isShare}
        lockedMapTitle={file.lockedMapTitle}
        isUploading={file.isUploading}
      />
    );
  }

  public render() {
    const { openModal, selectedContent, isOpenDetail } = this.state;

    this._gamePlayMode = this.props.running;

    return (
      <div className={this.props.running ? styles.hidden : styles.show}>
        {this.isOnlyMobile() ? (
          <>
            <div
              onTouchStart={() => this.searchRef.current?.handleBlur()}
              className={calc_class_name(
                styles.phonefileSystemContainer,
                openModal !== ModalType.None || isOpenDetail
                  ? styles.hidden
                  : '',
              )}
            >
              {this._renderPhoneFileSystemTabs()}
              {this._renderPhoneFileSystemContent()}
            </div>
            {openModal === ModalType.None && isOpenDetail && (
              <div className={styles.phoneContentDetailWrapper}>
                {this._renderContentDetail(selectedContent)}
              </div>
            )}
          </>
        ) : (
          <div
            className={calc_class_name(styles.fileSystemContainer)}
            onDragOver={(ev) => {
              ev.stopPropagation();
              ev.preventDefault();
              if (this.state.showDragOverMask) {
                return;
              }
              this.setState({
                showDragOverMask: true,
              });
            }}
            onDragLeave={(ev) => {
              ev.stopPropagation();
              ev.preventDefault();
              this.setState({
                showDragOverMask: false,
              });
            }}
            onDrop={(ev) => {
              ev.stopPropagation();
              ev.preventDefault();
              this.setState({
                showDragOverMask: false,
              });
              if (ev.dataTransfer.files && ev.dataTransfer.files[0]) {
                const [file] = ev.dataTransfer.files;

                if (file.type.includes('audio/')) {
                  this._uploadFileClick(file)
                    .then(this._handlePreUpload)
                    .catch((e) => console.error(e));
                } else if (file.type.includes('image/')) {
                  this.uploadPicture(file);
                } else {
                  Toast.error({
                    content: this.props.intl.formatMessage({
                      id: 'uploadFormatError',
                    }),
                  });
                }
              }
            }}
          >
            {this._renderFileSystemTabs()}
            {this._renderFileSystemContent()}
            {this.state.showDragOverMask ? (
              this.state.uploadingFiles.length >= 1 ? (
                <div className={styles.dragOverMask}>
                  <div className={styles.inner}>
                    <div className={[styles.dragOverIconWrap].join(' ')}>
                      <div
                        className={[styles.dragOverIcon, styles.warning].join(
                          ' ',
                        )}
                      ></div>
                      <div className={[styles.dragOverText].join(' ')}>
                        {this.props.intl.formatMessage({
                          id: 'DropUploadWarning',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.dragOverMask}>
                  <div className={styles.inner}>
                    <div className={[styles.dragOverIconWrap].join(' ')}>
                      <div className={styles.dragOverIcon}></div>
                      <div className={[styles.dragOverText].join(' ')}>
                        {this.props.intl.formatMessage({
                          id: 'DropUploadHint',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : null}
          </div>
        )}
        {openModal === ModalType.PermanentlyRemoveAll ? (
          <Modal
            width={400}
            title={this.props.intl.formatMessage({ id: 'permanentlyRemove' })}
            visible={true}
            cancel={this.props.intl.formatMessage({ id: 'cancel' })}
            confirm={this.props.intl.formatMessage({ id: 'remove' })}
            dangerToConfirm
            handleCancel={() => this.handleModalChange(ModalType.None)}
            handleConfirm={() => {
              this.handleDeleteAll();
              this.handleModalChange(ModalType.None);
            }}
          >
            <div className={styles.textColor}>
              {this.props.intl.formatMessage({ id: 'permanentlyRemoveTip' })}
            </div>
          </Modal>
        ) : null}
        {openModal === ModalType.PermanentlyRemoveOne ? (
          <Modal
            width={400}
            title={this.props.intl.formatMessage({ id: 'permanentlyRemove' })}
            visible={true}
            cancel={this.props.intl.formatMessage({ id: 'cancel' })}
            confirm={this.props.intl.formatMessage({ id: 'remove' })}
            dangerToConfirm
            handleCancel={() => this.handleModalChange(ModalType.None)}
            handleConfirm={async () => {
              const { key, value } = this.state.selectedContent;

              let toErase = true;

              if (value.type === AssetType.VOXEL_MODEL) {
                try {
                  await this.purgeProjectModel(key);
                  toErase = false;
                  this._waitReplicaUpdate = true;
                  Toast.success({
                    content: this.props.intl.formatMessage(
                      { id: 'assets$$HasErased' },
                      { filename: this.transformName(key, true) },
                    ),
                  });
                } catch (err) {
                  console.error(err);
                  toErase = false;
                  Toast.error({
                    content:
                      err instanceof Error
                        ? err.message
                        : this.props.intl.formatMessage({ id: 'deleteFailed' }),
                  });
                }
              }

              if (toErase) {
                if (editor.assetController.eraseFromTrashBin(key, value)) {
                  Toast.success({
                    content: this.props.intl.formatMessage(
                      { id: 'assets$$HasErased' },
                      {
                        filename: this.transformName(key, true),
                      },
                    ),
                  });

                  this._waitReplicaUpdate = true;

                  // 如果是图片的话，顺便清理缓存
                  if (value.type === AssetType.PICTURE) {
                    editor.game.resourceController?.removeImageResource(
                      value.hash,
                    );
                  }
                }
              }

              this.setState({
                isOpenDetail: false,
              });

              this.handleModalChange(ModalType.None);
            }}
          >
            <div className={styles.textColor}>
              {this.props.intl.formatMessage({ id: 'permanentlyRemoveTip' })}
            </div>
          </Modal>
        ) : null}
        {openModal === ModalType.UploadAudio ? (
          <Modal
            width={400}
            title={this.props.intl.formatMessage({ id: 'uploadAudio' })}
            contentNoOverlay={true}
            disableBackgroundClick
            visible={openModal === ModalType.UploadAudio}
            cancel={this.props.intl.formatMessage({ id: 'cancel' })}
            confirm={this.props.intl.formatMessage({ id: 'confirm' })}
            handleCancel={() => {
              this.handleModalChange(ModalType.None);
            }}
            handleConfirm={() => {
              if (
                this._prePreviewAudioStartPos > 0.001 ||
                Math.abs(
                  this._prePreviewAudioEndPos -
                    Number(
                      (this._prePreviewAudioBuffer as AudioBuffer).duration,
                    ),
                ) > 0.001
              ) {
                this._prepareUploadAudio();
              }
              if (this._preUploadBuffer) {
                this.uploadingAssets.push(this._prepareUploadFileName);
                this.setState({
                  uploadingFiles: [...this.uploadingAssets],
                  openModal: ModalType.None,
                  addResourceBtnActive: false,
                });
                editor.rpc.uploadAudio(
                  this._preUploadBuffer as ArrayBuffer,
                  Math.min(
                    this._prePreviewAudioQuality,
                    (this._prePreviewAudioBuffer as AudioBuffer).sampleRate,
                  ),
                  (hash: string) => {
                    editor.game.state.content
                      .retrieve(hash)
                      .then(async (data: Uint8Array | void) => {
                        if (data) {
                          const res =
                            editor.assetController.checkIsAudioInAssets({
                              name: this._prepareUploadFileName,
                              audioHash: hash,
                            });

                          let toContinue = true;

                          if (res.conflict === assetConflict.contentIdentical) {
                            toContinue = false;

                            Toast.info({
                              content: this.props.intl.formatMessage({
                                id: 'identicalAssetsExist',
                              }),
                            });
                          } else if (
                            res.conflict === assetConflict.hashRepeat
                          ) {
                            toContinue = false;

                            Toast.info({
                              content: `${this.props.intl.formatMessage({
                                id: 'assetsWithSameContent_1',
                              })}${res.data}${this.props.intl.formatMessage({
                                id: 'assetsWithSameContent_2',
                              })}`,
                            });
                          }

                          if (!toContinue) {
                            this._waitReplicaUpdate = true;

                            for (
                              let i = 0;
                              i < this.uploadingAssets.length;
                              i++
                            ) {
                              if (
                                this.uploadingAssets[i] ===
                                this._prepareUploadFileName
                              ) {
                                this.uploadingAssets.splice(i, 1);
                                break;
                              }
                            }
                            this.setState({
                              uploadingFiles: [...this.uploadingAssets],
                            });
                            return;
                          }

                          // 音频文件，上传成功自动命名
                          let newAssetName = editor.assetController.rawName(
                            this._prepareUploadFileName,
                          );
                          let _i = 2;
                          while (
                            editor.assetController.checkIsAssetNameDuplicate(
                              newAssetName,
                              AssetType.AUDIO,
                            )
                          ) {
                            newAssetName =
                              editor.assetController.rawName(
                                this._prepareUploadFileName,
                              ) +
                              '_' +
                              _i;
                            _i++;
                          }
                          const added = await editor.assetController.addAudioToProject({
                            name: newAssetName,
                            hash: hash,
                            size: data.length,
                          });
                          if (added && clientConfig.mapInfo.isLocalMapGroup) {
                            await editor.replica.saveProject();
                          }
                          this._waitReplicaUpdate = true;
                          for (
                            let i = 0;
                            i < this.uploadingAssets.length;
                            i++
                          ) {
                            if (
                              this.uploadingAssets[i] ===
                              this._prepareUploadFileName
                            ) {
                              this.uploadingAssets.splice(i, 1);
                              break;
                            }
                          }
                          this.setState({
                            uploadingFiles: [...this.uploadingAssets],
                          });
                          Toast.success({
                            content: this.props.intl.formatMessage({
                              id: 'uploadSuccess',
                            }),
                          });
                        }
                      })
                      .catch((err) => {
                        console.error(err);
                      });
                  },
                  (err) => {
                    console.error(err);
                    Toast.error({
                      content: this.props.intl.formatMessage(
                        { id: 'assets$$UploadedFailed' },
                        {
                          filename: this._prepareUploadFileName,
                        },
                      ),
                    });
                    for (let i = 0; i < this.uploadingAssets.length; i++) {
                      if (
                        this.uploadingAssets[i] === this._prepareUploadFileName
                      ) {
                        this.uploadingAssets.splice(i, 1);
                        break;
                      }
                    }
                    this.setState({
                      uploadingFiles: [...this.uploadingAssets],
                    });
                  },
                );
              }
            }}
          >
            <AudioUploadPreviewTool
              audioContext={editor.game.state.sound.context as AudioContext}
              buffer={this._prePreviewAudioBuffer as AudioBuffer}
              onChange={(startPos: number, endPos: number, quality: number) => {
                this._prePreviewAudioStartPos = startPos;
                this._prePreviewAudioEndPos = endPos;
                this._prePreviewAudioQuality = quality;
              }}
              waveformHeight={125}
            />
          </Modal>
        ) : (
          ''
        )}
        {openModal === ModalType.UploadWarning ? (
          <Modal
            width={400}
            title={this.props.intl.formatMessage({ id: 'uploadAudio' })}
            visible={openModal === ModalType.UploadWarning}
            cancel={this.props.intl.formatMessage({ id: 'cancel' })}
            confirm={this.props.intl.formatMessage({ id: 'confirm' })}
            disableBackgroundClick
            handleCancel={() => {
              this.handleModalChange(ModalType.None);
            }}
            handleConfirm={() => {
              this.handleModalChange(ModalType.None);
              this.uploadInputRef.click();
            }}
          >
            <div className={styles.textColor}>
              {this.props.intl.formatMessage({ id: 'availableFormat' })}: .mp3,
              .ogg, m4a, .wav, .opus
            </div>
            <div className={styles.textColor}>
              {this.props.intl.formatMessage({ id: 'uploadFileSizeLimit' })}10MB
            </div>
          </Modal>
        ) : (
          ''
        )}
        <ProjectModelActions ref={this.projectModelActionsRef} />
      </div>
    );
  }
}

export const FileSystemPanel = connect((state: RootState) => ({}), {
  setVoxaData,
})(injectIntl(FileSystemContainer));
