import { MuServerProtocol } from '@box/mudb/server';
import { CodeEditorServerState } from './code-editor-server-state';
import { CodeEditorProtocol } from '@box/schema/code-editor/code-editor-protocol';
import {
  FileState,
  CursorSchema,
  FileDictRDA,
} from '@box/schema/code-editor/code-editor-common-state';
import { EditServerState } from '../edit-server-schema';
import { v4 } from 'uuid';
import {
  ContentServer,
  OssCdnPath,
  OssStoreType,
  SCRIPT_OSS_CDN_PATH,
} from '@box/content-server';
import { MuCodeEditorReplicaServer } from './replica/server';
import { EditServer } from '../edit-server';
import { clearTimeout } from 'timers';
import { getConfigSync } from '../../../config/server';
import {
  ExtraProjectInfo,
  ExtraProjectInfoSchema,
} from '@box/schema/project/hot-schema';
import { AssetType } from '@box/schema/project/project-rda';
import { localSharedScriptLockOwnerId } from '../replica/local-shared-script-state';

const HEART_BEAT_DURATION = 30 * 1000;
const AUTO_SAVE_DURATION = 120 * 1000;

const pairs =
  Object.entries ||
  ((obj) => {
    const arr: any = [];
    for (const k in obj) {
      arr.push([k, obj[k]]);
    }
    return arr;
  });
export class CodeEditorServerController {
  private _state: EditServerState;
  private _editServer: EditServer;
  private _editorState: CodeEditorServerState;
  private _protocol: MuServerProtocol<typeof CodeEditorProtocol>;
  private _contentServer: ContentServer;
  // fileId: timer
  private _heartBeatTimer: Record<string, NodeJS.Timeout> = {};
  // fileId: timer
  private _autoSaveTimer: Record<string, NodeJS.Timeout> = {};

  public fileDictReplica: MuCodeEditorReplicaServer<typeof FileDictRDA>;
  private _savingFileIds = new Set<string>();
  constructor(
    editServer: EditServer,
    protocol: MuServerProtocol<typeof CodeEditorProtocol>,
    contentServer: ContentServer,
    fileDictReplica: MuCodeEditorReplicaServer<typeof FileDictRDA>,
  ) {
    this._editServer = editServer;
    this._state = editServer.state;
    this._editorState = this._state.codeEditor;
    this._protocol = protocol;
    this._contentServer = contentServer;
    this.fileDictReplica = fileDictReplica;

    fileDictReplica.configure({
      change: (_state, sessionId) => {
        if (sessionId) {
          const fileId = this._editorState.selectedFiles[sessionId];
          if (fileId) {
            this._updateAutoSaveTimer(fileId);
          }
        }

        this.fileDictReplica.state(this._editorState.fileDict);
      },
    });
    this.fileDictReplica.state(this._editorState.fileDict);

    protocol.configure({
      connect: (client) => {
        const cursor = this._addCursor(client.sessionId);
        client.message.getSession(client.sessionId);
        client.message.syncCursorDict(this._editorState.cursorDict);
        this._protocol.broadcast.syncCursor(cursor);
      },
      disconnect: (client) => {
        this._removeCursor(client.sessionId);
        // 断连检查选中状态
        const selectedFileId = this._editorState.selectedFiles[client.sessionId];
        delete this._editorState.selectedFiles[client.sessionId];
        this._updateFilesState();
        if (selectedFileId) this._saveFileIfNoSessionSelected(selectedFileId);
      },
      message: {
        copyFile: (client, fileId) => {
          if (
            !this._editServer.replica.getSessionPermissions(client.sessionId)
              .editScripts
          ) {
            return;
          }
          const source = this._getFileByFileId(fileId);
          if (!source) return;
          let suffix = 1;
          let name = source.name.replace(/\.js$/, '') + `_copy_${suffix}.js`;
          const names = new Set(this._fileList().map((file) => file.name));
          while (names.has(name)) {
            name = source.name.replace(/\.js$/, '') + `_copy_${++suffix}.js`;
          }
          const copy = this._addFile(name, '', source.text, source.isClient);
          if (copy) client.message.addFileSuccess(copy.fileId);
        },
        // game没用到
        renameFile: (client, { name, fileId }) => {
          if (
            !this._editServer.replica.getSessionPermissions(client.sessionId)
              .editScripts
          ) {
            return;
          }
          const fileList = this._fileList();
          for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            if (file.name === name) {
              return;
            }
          }
          this.fileDictReplica.dispatch(
            this.fileDictReplica.action().update(fileId).name(name),
          );
        },
        // TODO: 本次版本默认没有客户端代码添加删除恢复的功能
        recoverFile: (client, info) => {
          if (
            !this._editServer.replica.getSessionPermissions(client.sessionId)
              .editScripts
          ) {
            return;
          }
          this._retrieve(info.hash)
            .then((buffer) => {
              if (buffer) {
                const addedFile = this._addFile(
                  info.name,
                  '',
                  Buffer.from(buffer).toString(),
                  info.isClient,
                );
                if (addedFile) {
                  client.message.addFileSuccess(addedFile.fileId);
                }
              }
            })
            .catch();
        },
        addFile: (client, isClient) => {
          if (
            !this._editServer.replica.getSessionPermissions(client.sessionId)
              .editScripts
          ) {
            return;
          }
          let i = 1;
          const fileNames = Object.values(this._editorState.fileDict).reduce(
            (a, e) => {
              a[e.name] = true;
              return a;
            },
            {},
          );
          let addedFile: FileState | undefined;
          while (true) {
            const name = `script_${i++}.js`;
            if (!(name in fileNames)) {
              addedFile = this._addFile(name, '', '', isClient);
              break;
            }
          }
          if (addedFile) {
            client.message.addFileSuccess(addedFile.fileId);
          }
        },
        addFileForce: (client, info) => {
          // 文件存在则更新
          if (this._editorState.fileDict[info.fileId]) {
            this._updateFileTextAndSize(info.fileId, info.hash);
            return;
          }

          // 不存在则新建
          this._addFile(info.name, info.fileId, '', info.isClient);
          this._updateFileTextAndSize(info.fileId, info.hash);
        },
        selectFile: (client, fileId) => {
          if (
            !this._editServer.replica.getSessionPermissions(client.sessionId)
              .editScripts
          ) {
            return;
          }

          const previousFileId = this._editorState.selectedFiles[client.sessionId];
          this._editorState.selectedFiles[client.sessionId] = fileId;
          this._recordFileSelected(fileId).catch(() => {});
          this._updateFilesState();
          if (previousFileId && previousFileId !== fileId) {
            this._saveFileIfNoSessionSelected(previousFileId);
          }
        },

        // client所有脚本失焦时调用
        blurFile: (client) => {
          if (
            !this._editServer.replica.getSessionPermissions(client.sessionId)
              .editScripts
          ) {
            return;
          }
          const selectedFileId = this._editorState.selectedFiles[client.sessionId];
          delete this._editorState.selectedFiles[client.sessionId];
          this._updateFilesState();
          if (selectedFileId) this._saveFileIfNoSessionSelected(selectedFileId);
        },

        removeFile: (client, fileId) => {
          if (
            !this._editServer.replica.getSessionPermissions(client.sessionId)
              .editScripts
          ) {
            return;
          }
          this._removeFile(fileId);
        },
        syncCursorName: (client, name) => {
          if (
            !this._editServer.replica.getSessionPermissions(client.sessionId)
              .editScripts
          ) {
            return;
          }
          const cursor = this._editorState.cursorDict[client.sessionId];
          if (cursor) {
            cursor.name = name;
            this._protocol.broadcast.syncCursorName(cursor);
          }
        },
        syncCursor: (client, cursor) => {
          if (
            !this._editServer.replica.getSessionPermissions(client.sessionId)
              .editScripts
          ) {
            return;
          }
          Object.assign(this._editorState.cursorDict[client.sessionId], cursor);
          this._protocol.broadcast.syncCursor(cursor);
        },
      },
    });
  }

  public initSocketMsg = () => {};

  private _updateFileTextAndSize(fileId: string, hash) {
    this._retrieve(hash)
      .then((buffer) => {
        if (buffer) {
          const originFile = this._getFileByFileId(fileId);
          const file = {
            ...originFile,
            text: buffer.toString(),
            size: buffer.length,
          };
          this.fileDictReplica.dispatch(
            this.fileDictReplica.action().set(fileId, file),
          );
        }
      })
      .catch();
  }

  private _getFileByFileId(fileId: string) {
    return this._editorState.fileDict[fileId];
  }

  private _clearAutoSaveTimer(fileId: string) {
    const timer = this._autoSaveTimer[fileId];
    if (timer) {
      clearTimeout(timer);
      delete this._autoSaveTimer[fileId];
    }
  }

  // 保存共享文件
  private async _saveFile(fileId: string) {
    // Selection, blur and disconnect can arrive together. They all request a
    // save for the same shared script; one in-flight write is sufficient and
    // prevents stale snapshots racing each other.
    if (this._savingFileIds.has(fileId)) return;
    const file = this._getFileByFileId(fileId);
    if (!file?.isShare) return;
    this._savingFileIds.add(fileId);
    const { text, name } = file;
    try {
      // Boxes persists a shared script independently from a whole-project
      // save. Keep the local runtime's authoritative group snapshot in sync
      // the same way so another map can observe the edit immediately.
      const hash = await this._contentServer.store(Buffer.from(text));
      await this._editServer.replica.updateLocalSharedScript({
        action: 'save',
        fileId,
        hash,
      });
      this._state.logger.info(`script: save shared file success, name is ${name}`);
    } catch (error) {
      this._state.logger.error(
        `save shared script failed, filename is ${name}: ${String(error)}`,
      );
      throw error;
    } finally {
      this._savingFileIds.delete(fileId);
      // Auto-save must not hand the script to another map while this map is
      // still editing it. Switching away, blur and disconnect remove the
      // selection first, then arrive here and release the lock.
      if (!Object.values(this._editorState.selectedFiles).includes(fileId)) {
        this._unLockFile(fileId);
      }
      this._clearAutoSaveTimer(fileId);
    }
  }

  // 当一个共享文件地图内所有人都没有焦点时保存文件
  private _updateFilesState() {
    const lockedFileIds = this._getLockedByCurrentFileIds();
    const selectedFileIds = Object.values(this._editorState.selectedFiles);
    lockedFileIds.forEach((lockedFileId) => {
      const file = this._getFileByFileId(lockedFileId);
      if (file?.isShare && !selectedFileIds.includes(lockedFileId)) {
        this._saveFile(lockedFileId);
      }
    });
  }

  /** Release a map-level lock only after its last local editor leaves it. */
  private _saveFileIfNoSessionSelected(fileId: string) {
    if (!Object.values(this._editorState.selectedFiles).includes(fileId)) {
      this._saveFile(fileId).catch(() => {});
    }
  }

  private _isFileLockedByCurrentMap(fileId: string) {
    const serverConfig = getConfigSync();
    const file = this._state.replica.extraProjectInfo.scriptAssets[fileId];
    if (!file) {
      return false;
    }
    const ownerId = serverConfig.method === 'local'
      ? localSharedScriptLockOwnerId(serverConfig.containerName || '')
      : serverConfig.contentId;
    return file.lockedMapId === ownerId;
  }

  private _updateAutoSaveTimer(fileId: string) {
    this._clearAutoSaveTimer(fileId);
    this._autoSaveTimer[fileId] = setTimeout(async () => {
      await this._saveFile(fileId);
      this._protocol.broadcast.onShareAutoSave(fileId);
    }, AUTO_SAVE_DURATION);
  }

  // 共享文件选择时，加锁，设置定时器；120s没有变化，则保存
  private async _recordFileSelected(fileId: string) {
    const file = this._getFileByFileId(fileId);
    // A remote shared-resource refresh can remove a file between the client
    // click and this protocol message. Ignore that stale selection instead of
    // throwing from the socket handler and disconnecting the editor.
    if (!file?.isShare) {
      return;
    }

    if (this._isFileLockedByCurrentMap(fileId)) {
      this._updateAutoSaveTimer(fileId);
    } else if (!file.lockedMapTitle) {
      const locked = await this._lockFile(fileId);
      if (locked) this._updateAutoSaveTimer(fileId);
    }
  }

  private _hasFiles() {
    return this._fileList().length > 0;
  }

  private _fileList() {
    return Object.values(this._editorState.fileDict);
  }

  private _addFile(
    name,
    id = '',
    text = '',
    isClient = false,
    isShare = false,
    lockedMapTitle = '',
    order?: number,
    size?: number,
    lockedMapId = 0,
  ) {
    const dict = this._editorState.fileDict;
    for (const fileId in dict) {
      if (name === dict[fileId].name) {
        return;
      }
    }

    const fileList = Object.values(this._editorState.fileDict);
    const highest_order = ['index.js', 'clientIndex.js'].includes(name)
      ? -1
      : fileList.reduce((a, e) => Math.max(a, e.order), 0);

    const file: FileState = {
      fileId: id || v4(),
      text: text,
      name: name,
      order: order !== undefined ? order : highest_order + 1,
      isClient,
      isShare,
      lockedMapTitle,
      lockedMapId,
      isUploading: false,
      size: size || 0,
    };
    this.fileDictReplica.dispatch(
      this.fileDictReplica.action().set(file.fileId, file),
    );
    return file;
  }

  private _removeFile(fileId) {
    this.fileDictReplica.dispatch(this.fileDictReplica.action().remove(fileId));
  }

  private _addCursor(sessionId) {
    if (!this._editorState.fileDict['-1']) {
      this._addFile('index.js', '-1');
    }
    if (!this._editorState.fileDict['-2']) {
      this._addFile('clientIndex.js', '-2', '', true);
    }

    const cursor = CursorSchema.alloc();
    cursor.sessionId = sessionId;
    cursor.fileId = this._fileList()[0].fileId;
    cursor.startPosId = '';
    cursor.endPosId = '';
    cursor.name = '';

    this._editorState.cursorDict[cursor.sessionId] = cursor;
    return cursor;
  }

  private async _lockFile(fileId: string) {
    const config = getConfigSync();
    if (config?.method !== 'local') return false;
    const result = await this._editServer.replica.updateLocalSharedScript({
      action: 'lock',
      fileId,
      ownerId: localSharedScriptLockOwnerId(config.containerName || ''),
      ownerTitle: config.containerName || '本地地图',
    });
    return result.lockedMapId === localSharedScriptLockOwnerId(config.containerName || '');
  }

  private _clearHeartBeatTimer(fileId: string) {
    const timer = this._heartBeatTimer[fileId];
    if (timer) {
      delete this._heartBeatTimer[fileId];
      clearTimeout(timer);
    }
  }

  private _expireTimer() {
    const extraAssets = this._state.replica.extraProjectInfo.scriptAssets;

    Object.keys(this._heartBeatTimer).forEach((heartBeatFileId) => {
      // 文件已经删除 || 共享 -> 非共享
      if (
        !extraAssets[heartBeatFileId] ||
        !extraAssets[heartBeatFileId].isShare
      ) {
        this._clearAutoSaveTimer(heartBeatFileId);
        this._clearHeartBeatTimer(heartBeatFileId);
      }
    });
  }

  private _getLockedByCurrentFileIds() {
    // Local map groups use contentId=0 for every member. An unlocked shared
    // file also carries lockedMapId=0, so treating that as a held lock made a
    // click on one script save every shared script and could race unshare.
    if (getConfigSync()?.method === 'local') {
      const ownerId = localSharedScriptLockOwnerId(
        getConfigSync()?.containerName || '',
      );
      return Object.values(this._state.replica.extraProjectInfo.scriptAssets)
        .filter((script) => script.lockedMapId === ownerId)
        .map((script) => script.id);
    }
    const extraAssets = this._state.replica.extraProjectInfo.scriptAssets;
    const scripts = Object.values(extraAssets);
    const { contentId } = getConfigSync();
    return scripts
      .filter((script) => script.lockedMapId === contentId)
      .map((script) => script.id);
  }

  private async _unLockFile(fileId: string) {
    this._clearHeartBeatTimer(fileId);
    const config = getConfigSync();
    if (config?.method !== 'local') return;
    await this._editServer.replica.updateLocalSharedScript({
      action: 'unlock',
      fileId,
      ownerId: localSharedScriptLockOwnerId(config.containerName || ''),
    }).catch(() => {});
  }

  private _removeCursor(sessionId) {
    CursorSchema.free(this._editorState.cursorDict[sessionId]);
    delete this._editorState.cursorDict[sessionId];
    this._protocol.broadcast.removeCursor(sessionId);
  }

  private _clearFiles() {
    for (const fileId in this._editorState.fileDict) {
      this._removeFile(fileId);
      delete this._editorState.fileDict[fileId];
    }
  }

  /**
   * 根据socket的数据跟更新fileDict
   * 1，更新name，isShare，lockedMapTitle, order, 如果hash变化，则更新内容
   * 2, 原来没有的文件调用_addFile新增，已经不存在的文件调用_removeFile删除
   */
  public async resyncFiles(
    extraAssets: ExtraProjectInfo['scriptAssets'],
    preExtraScriptAssets: ExtraProjectInfo['scriptAssets'],
  ) {
    const currentFiles = Object.values(this._editorState.fileDict);

    // 根据后端的数据更新文件name，共享状态，被锁定地图title
    await Promise.all(pairs(extraAssets).map(
      async ([
        id,
        { hash, isClient, isShare, lockedMapTitle, lockedMapId, name, order },
      ]) => {
        // 存在则更新字段
        if (this._editorState.fileDict[id]) {
          this.fileDictReplica.dispatch(
            this.fileDictReplica.action().update(id).name(name),
          );
          this.fileDictReplica.dispatch(
            this.fileDictReplica.action().update(id).order(order),
          );
          this.fileDictReplica.dispatch(
            this.fileDictReplica.action().update(id).isShare(isShare),
          );
          this.fileDictReplica.dispatch(
            this.fileDictReplica
              .action()
              .update(id)
              .lockedMapTitle(lockedMapTitle),
          );
          this.fileDictReplica.dispatch(
            this.fileDictReplica.action().update(id).lockedMapId(lockedMapId),
          );
          // hash变化则更新内容，共享文件被其它图编辑了
          if (hash && preExtraScriptAssets[id]?.hash !== hash) {
            this._updateFileTextAndSize(id, hash);
            this._state.logger.log(`file ${name} change hash: ${hash}`);
          }
        } else {
          // 不存在，则新增
          // 新增可能出现的场景：
          // 新增文件，此时没有hash
          // 复制文件, 如果是本地文件，则由于socket顺序问题，可能也没有hash，共享文件有hash
          // 还原文件，由于socket顺序问题，可能也没有hash
          let text = '';

          if (hash) {
            const buffer = await this._retrieve(hash);
            if (buffer) {
              text = buffer.toString();
            }
          }
          this._addFile(
            name,
            id,
            text,
            isClient,
            isShare,
            lockedMapTitle,
            order,
            undefined,
            lockedMapId,
          );
        }
      },
    ));
    // 删除后端已经没有了的文件: 1，文件被删除了；2，共享文件被其它图取消贡献了
    currentFiles.map((file) => {
      // In a local Map Group, ordinary scripts are owned by the map's project
      // data (`project.scriptAssets` when serialized), not by the shared
      // resource snapshot. A VOXA/shared-library refresh therefore has no
      // matching entry for them. Removing every file absent from extraAssets
      // made imported cloud maps appear to contain only their entry scripts
      // even though the remaining scripts were still present and runnable.
      //
      // Keep ordinary local scripts here; only shared scripts are reconciled
      // against the authoritative shared-resource snapshot. Treat an
      // unavailable config as local as well so initialization can never
      // destructively drop scripts while configuration is still loading.
      if (getConfigSync()?.method !== 'web' && !file.isShare) {
        return;
      }
      if (
        !extraAssets[file.fileId] &&
        !['index.js', 'clientIndex.js'].includes(file.name)
      ) {
        this._state.logger.log(`file ${file.name} has removed`);
        this._removeFile(file.fileId);
      }
    });
  }

  private async _retrieve(hash: string) {
    let buffer: Uint8Array | undefined;
    if (!hash) return;
    if (hash.startsWith('Qm')) {
      buffer = await this._contentServer.retrieve(hash);

      if (!buffer) {
        buffer = await this._state.buildSystem.retrieveContentFromS3(hash, {
          ossCdnPath: SCRIPT_OSS_CDN_PATH,
        });
      }
    } else {
      buffer = await this._state.buildSystem.retrieveContentFromS3(hash, {
        ossCdnPath: SCRIPT_OSS_CDN_PATH,
      });
    }

    return buffer;
  }

  private async _addIndexScripts() {
    const assets = this._state.replica.project.assets;
    if (assets['index.js']) {
      const buffer = await this._retrieve(assets['index.js'].hash);
      if (buffer) {
        this._state.logger.log('script: add index.js');
        this._addFile('index.js', '-1', Buffer.from(buffer).toString(), false);
      }
    }
    if (assets['clientIndex.js']) {
      const buffer = await this._retrieve(assets['clientIndex.js'].hash);
      if (buffer) {
        this._state.logger.log('script: add clientIndex.js');
        this._addFile(
          'clientIndex.js',
          '-2',
          Buffer.from(buffer).toString(),
          true,
        );
      }
    }
  }

  public async initScripts() {
    const assets = this._state.replica.project.assets;
    const extraAssets = this._state.replica.extraProjectInfo.scriptAssets;
    if (getConfigSync().groupId) {
      this._state.logger.log(
        `init scripts in extend map with ${
          Object.keys(extraAssets).length
        } file`,
      );
      // extra 里没有index和clientIndex
      await this._addIndexScripts();
      // extra里有数据则以extra数据为准

      await Promise.all(
        pairs(extraAssets).map(
          async ([
            id,
            { hash, isClient, isShare, lockedMapTitle, lockedMapId, name, order },
          ]) => {
            // 本地文件hash从本地拿
            if (!isShare && assets[name]) {
              hash = assets[name].hash;
            }

            let text = '';
            const buffer = await this._retrieve(hash);
            if (buffer) {
              text = Buffer.from(buffer).toString();
            }

            this._addFile(
              name,
              id,
              text,
              isClient,
              isShare,
              lockedMapTitle,
              order,
              buffer?.length,
              lockedMapId,
            );
          },
        ),
      );
    } else {
      this._state.logger.log(`init scripts in normal map`);
      const sharedNames = new Set(
        Object.values(extraAssets)
          .filter((file) => file.isShare)
          .map((file) => file.name),
      );
      await Promise.all(
        pairs(assets).map(async ([name, info]) => {
          if (
            info.type === AssetType.JS_SCRIPT ||
            info.type === AssetType.CLIENT_JS_SCRIPT
          ) {
            if (sharedNames.has(name)) return;
            const buffer = await this._retrieve(info.hash);
            if (buffer) {
              this._addFile(
                name,
                '',
                Buffer.from(buffer).toString(),
                info.type === AssetType.CLIENT_JS_SCRIPT,
                false,
                '',
                undefined,
                buffer.length,
              );
            }
          }
        }),
      );
      await Promise.all(
        pairs(extraAssets)
          .filter(([, file]) => file.isShare)
          .map(async ([id, file]) => {
            const buffer = await this._retrieve(file.hash);
            if (!buffer) return;
            this._addFile(
              file.name,
              id,
              Buffer.from(buffer).toString(),
              file.isClient,
              true,
              '',
              file.order,
              buffer.length,
            );
          }),
      );
    }
  }

  public async saveScripts() {
    return Promise.all(
      this._fileList().map(async (file) => {
        const { name, text, isClient, isShare, fileId } = file;
        const data = Buffer.from(text);
        const hash = await this._state.buildSystem.storeContentToS3(data, {
          ossStoreType: OssStoreType.Script,
        });
        if (!hash) {
          throw new Error('error savign script');
        }
        return {
          name,
          hash,
          size: data.length,
          isClient,
          isShare,
          fileId,
        };
      }),
    );
  }
}
