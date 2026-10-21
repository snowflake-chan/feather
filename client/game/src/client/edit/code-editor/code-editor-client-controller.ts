import { ContentResolver } from '@box/content-server/content-fetch';
import { MuClientProtocol } from '@box/mudb/client';
import { searchId } from '@box/mudb/rda/_id';
import { decodeUTF8 } from '@box/mudb/stream';
import {
  CursorSchema,
  CursorState,
  FileDictRDA,
  FileSchema,
  FileState,
} from '@box/schema/code-editor/code-editor-common-state';
import { CodeEditorProtocol } from '@box/schema/code-editor/code-editor-protocol';
import { allocIdsEx } from '@box/schema/code-editor/murda-id';
import {
  MuRDAText,
  MuRDATextStore,
  TextSelection,
} from '@box/schema/code-editor/murda-text';
import CLIENT_API_TYPES from '@box/script-api/dts/client-api-types.dts';
import SERVER_API_TYPES from '@box/script-api/dts/server-api-types.dts';
import LOCAL_API_DECLARATIONS from 'src/resource/api-declarations.dts';
import { EventBus } from '@box/utils/event';
import { clientConfig } from 'src/config/client';
import { reduxDispatch } from 'src/redux/edit';
import {
  setClientTabExpand,
  setServerTabExpand,
} from 'src/redux/edit/script-manager';
import { API_RES } from 'src/resource/api';
import { checkIndexFile } from 'src/views/edit/components/script-manager/utils';
import type { MuCodeEditorReplicaClient } from '../code-editor-replica/client';
import type { ClientStateType } from '../edit-schema';
import type { CodeEditorClientState } from './code-editor-client-state';
import { monacoController } from './monaco';

// codeEditor控制器
export class CodeEditorClientController {
  public static instance: CodeEditorClientController;
  private _state: ClientStateType;
  private _editorState: CodeEditorClientState;
  private _protocol: MuClientProtocol<typeof CodeEditorProtocol>;
  private _content: ContentResolver;
  public fileDictReplica: MuCodeEditorReplicaClient<typeof FileDictRDA>;
  private _textStore!: MuRDATextStore;
  private _mySelection!: TextSelection;
  private _cursorPosIdDict: { [key: string]: string } = {};
  private _fileModels: { [key: string]: any } = {};
  public monacoController = monacoController;
  // Keep the core engine declarations available synchronously. The complete
  // content-addressed declaration blob is still loaded below, but editor
  // hints must not disappear when that request is slow or unavailable.
  private serverDeclarations: string = LOCAL_API_DECLARATIONS;
  public onSelectFile = new EventBus<void>();
  public onShareAutoSave = new EventBus<void>();
  private _canUnlockSelectedFile = true;

  private _isLockedByCurrentMap(file: FileState) {
    return clientConfig.mapInfo.isLocalMapGroup
      ? file.lockedMapId === clientConfig.localMapRuntimeId
      : file.lockedMapTitle === clientConfig.mapInfo.name;
  }

  constructor(
    state: ClientStateType,
    protocol: MuClientProtocol<typeof CodeEditorProtocol>,
    content: ContentResolver,
    fileDictReplica: MuCodeEditorReplicaClient<typeof FileDictRDA>,
  ) {
    CodeEditorClientController.instance = this;
    this._state = state;
    this._editorState = state.codeEditor;
    this._protocol = protocol;
    this._content = content;
    // (window as any).editorState = this._editorState;
    // (window as any).edController = this;
    this._textStore = MuRDAText.createStore('');
    this._mySelection = new TextSelection(this._textStore, 0, 0);
    this.fileDictReplica = fileDictReplica;
    fileDictReplica.configure({
      change: (_state, isLocalChange) => {
        // 同步代码数据
        this.fileDictReplica.state(this._editorState.fileDict);
        if (this.monacoController.isReady) {
          this.monacoController.setText(this.getSelectedFile().text);
          const focus = this.monacoController.monacoEditor.hasTextFocus();
          this.monacoController.recoverCursor({
            idx: this.getCursorIndex(),
            focus,
            revealPosition: isLocalChange,
          });
          this.monacoController.updateCollaboratorCursors(
            this.collaboratorCursorList(),
          );
        }
      },
      checkIsHoldingLock: () => {
        if (!clientConfig.mapInfo.combType) {
          return true;
        }
        const file =
          this._editorState.fileDict[this._editorState.selectedFileId];
        if (
          !file ||
          (file.isShare && !this._isLockedByCurrentMap(file))
        ) {
          return false;
        }
        return true;
      },
    });
    this.fileDictReplica.state(this._editorState.fileDict);
    // 加载声明文件
    this.fetchDeclarations();

    protocol.configure({
      message: {
        removeFile: (fileId) => {
          this._removeFile(fileId);
        },
        getSession: (sessionId) => {
          this._editorState.sessionId = sessionId;
        },
        syncCursor: (cursor) => {
          this._syncCursor(this._editorState.cursorDict, cursor);
          this.monacoController.isReady &&
            this.monacoController.updateCollaboratorCursors(
              this.collaboratorCursorList(),
            );
        },
        syncCursorName: (cursor) => {
          this._syncCursor(this._editorState.cursorDict, cursor);
        },
        syncFile: (file) => {
          this._syncFile(this._editorState.fileDict, file);
        },
        syncCursorDict: (tmp_cursor_dict) => {
          const dict = this._editorState.cursorDict;
          for (const sessionId in tmp_cursor_dict) {
            const tmp_cursor = tmp_cursor_dict[sessionId];
            this._syncCursor(dict, tmp_cursor);
          }
        },
        removeCursor: (id) => {
          CursorSchema.free(this._editorState.cursorDict[id]);
          delete this._editorState.cursorDict[id];
        },
        addFileSuccess: (fileId) => {
          this.selectFile(fileId);
        },
        onShareAutoSave: (fileId) => {
          if (fileId === this._editorState.selectedFileId) {
            this.onShareAutoSave.notify();
          }
        },
      },
    });
  }

  private fetchDeclarations() {
    this._content
      .retrieve(API_RES)
      .then((content) => {
        if (content) {
          this.serverDeclarations = decodeUTF8(content);
          this.applySelectedFileDeclarations();
        }
      })
      .catch();
  }

  /**
   * Keep Monaco's global declarations aligned with the selected script type.
   * The legacy server declarations load asynchronously, so this is called both
   * when Monaco becomes ready and when that download finishes.
   */
  private applySelectedFileDeclarations() {
    if (!this.monacoController.isReady) {
      return;
    }

    const file = this._editorState.fileDict[this._editorState.selectedFileId];
    if (!file) {
      return;
    }

    if (file.isClient) {
      this.monacoController.setLibs([
        {
          content: CLIENT_API_TYPES,
          filePath: 'client-api.d.ts',
        },
      ]);
      return;
    }

    const declarations = [
      {
        content: SERVER_API_TYPES,
        filePath: 'server-api.d.ts',
      },
    ];
    if (this.serverDeclarations) {
      declarations.unshift({
        content: this.serverDeclarations,
        filePath: 'api.d.ts',
      });
    }
    this.monacoController.setLibs(declarations);
  }

  public monacoReady(monacoEditor, monaco) {
    const { monacoController } = this;
    this.monacoController.ready({
      monacoEditor,
      monaco,
      undo: this.undo,
      redo: this.redo,
      contentChange: this.editText,
      selectionChange: this.setSelectionRange,
    });
    this.applySelectedFileDeclarations();
    monacoController.setText(this.getSelectedFile().text);
    monacoController.recoverCursor({ idx: this.getCursorIndex() });
  }

  // 文件恢复-fileSystem用的
  public recoverFile(name, hash, isClient) {
    this._protocol.server.message.recoverFile({ name, hash, isClient });
  }
  // 添加文件
  public addFile(isClient: boolean) {
    this._protocol.server.message.addFile(isClient);
  }

  public addFileForce(info: {
    fileId: string;
    name: string;
    hash: string;
    isClient: boolean;
  }) {
    this._protocol.server.message.addFileForce(info);
  }

  // 文件重命名
  public renameFile(fileId, name) {
    const fileList = this.getFileList();
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.name === name) {
        return false;
      }
    }
    this.fileDictReplica.dispatch(
      [this.fileDictReplica.action().update(fileId).name(name)],
      false,
    );
    return true;
  }

  /**
   * 删除当前选中的文件时，会选中 index.js 文件
   * @param fileId
   */
  public removeFile(file: FileState) {
    this.fileDictReplica.dispatch(
      [this.fileDictReplica.action().remove(file.fileId)],
      false,
    );

    if (this._editorState.selectedFileId === file.fileId) {
      this._editorState.selectedFileId = this.getFileIdByName('index.js')!;
    }
  }

  // 选中文件
  public selectFile(fileId) {
    const file = this._editorState.fileDict[fileId];
    if (file) {
      this.onSelectFile.notify();
      if (file.isClient) {
        reduxDispatch(setClientTabExpand(true));
      } else {
        reduxDispatch(setServerTabExpand(true));
      }
      this.fileDictReplica.selectFileHistory(fileId);
      this._editorState.selectedFileId = fileId;

      this._textStore =
        this.fileDictReplica.store.keyIndex[
          this._editorState.selectedFileId
        ].value.stores.text;
      this._mySelection.begin.setStore(this._textStore);
      this._mySelection.end.setStore(this._textStore);

      const cursor = this._editorState.cursorDict[this._editorState.sessionId];
      cursor.fileId = fileId;
      this._protocol.server.message.syncCursor(cursor);
      if (clientConfig.mapInfo.isLocalMapGroup && file.isShare) {
        this._protocol.server.message.selectFile(fileId);
      }

      this.applySelectedFileDeclarations();
      if (this.monacoController.isReady) {
        this.monacoController.setText(this.getSelectedFile().text);
        this.monacoController.recoverCursor({ idx: this.getCursorIndex() });
      }
    }
  }
  // 暴露给debugPanel，跳转到错误位置
  public gotoFileWithPos(fileName: string, line: number, column: number): void {
    if (this.monacoController.isReady) {
      this.selectFile(this.getFileIdByName(fileName));
      this.monacoController.gotoLine(line, column);
    }
  }
  // 暴露给发布，跳转到错误位置
  public gotoFileWithIdx(fileName: string, idx: number): void {
    if (this.monacoController.isReady) {
      // 必须先切换到对应文件（更新model），再调用getPositionAt，才能获取到对应文件的正确光标位置
      this.selectFile(this.getFileIdByName(fileName));
      const position = this.monacoController._idxToPos(idx);
      this.monacoController.gotoLine(position.lineNumber, position.column);
    }
  }

  // 初始化光标名称
  public syncCursorName(name) {
    if (!this._state.replica.localPermissions.editScripts) {
      return;
    }
    this._editorState.cursorDict[this._editorState.sessionId].name = name;
    this._protocol.server.message.syncCursorName(name);
  }

  // 通过文件名获取文件信息
  public getFileByName(name) {
    const dict = this._editorState.fileDict;
    for (const id in dict) {
      const file = dict[id];
      if (file.name === name) {
        return file;
      }
    }
    return null;
  }

  // 通过文件名获取文件ID，用作改名
  public getFileIdByName(filename: string) {
    const fileList = this.getFileList();
    let fileId;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.name === filename) {
        fileId = file.fileId;
      }
    }
    return fileId;
  }

  public async detectSyntaxError() {
    this.prepareModelForAllFiles();

    const modelDict = Object.values(this._fileModels).reduce((a, e) => {
      a[e.id] = true;
      return a;
    }, {});

    const errorList =
      this.monacoController.isReady &&
      (await this.monacoController.workerGetErrors());
    if (errorList) {
      for (const item of errorList) {
        if (modelDict['$model' + item.id]) {
          return this.findErrorFile(
            item.id,
            item.info.start + item.info.length,
          );
        }
      }
    }

    return null;
  }

  public undo = () => {
    if (!this.fileDictReplica.canUndo()) {
      return;
    }
    const undoAction = this.fileDictReplica.undo();
    if (!undoAction) return;
    this.updateCursorWithAction(undoAction);
  };
  public redo = () => {
    if (!this.fileDictReplica.canRedo()) {
      return;
    }
    const redoAction = this.fileDictReplica.redo();
    if (!redoAction) return;
    this.updateCursorWithAction(redoAction);
  };

  private updateCursorWithAction(
    undoRedoAction: (typeof FileDictRDA)['actionSchema']['identity'][],
  ) {
    const action =
      undoRedoAction[undoRedoAction.length - 1].data['action'].data;
    if (action.type === 'noop') {
      return;
    }
    const data = action.data;
    let newId;
    // 1. 从action中拿到id
    if (this.startsWith(action.type, 'insertCharacter')) {
      const index = searchId(this._textStore.ids, data.id);
      newId = this._textStore.ids[index + 1];
    } else if (this.startsWith(action.type, 'insertString')) {
      const ids =
        action.type === 'insertStringOnTombstoneWithIds'
          ? action.data.ids
          : allocIdsEx(data, data.string.length);
      const index = searchId(this._textStore.ids, ids[ids.length - 1]);
      newId = this._textStore.ids[index + 1];
    } else if (this.startsWith(action.type, 'remove')) {
      newId = data[data.length - 1];
    }
    // 2. 更新当前光标位置
    const newPos = this._mySelection.end.getIndex(newId);
    this.setSelectionRange(newPos, newPos);
  }

  private startsWith(str: string, substr: string) {
    return str.substring(0, substr.length) === substr;
  }

  private collaboratorCursorList = () => {
    return Object.values(this._editorState.cursorDict).filter((c: any, i) => {
      // return true;
      c.id = i;
      c.startIdx = this.calcIndex(c.startPosId);
      c.endIdx = this.calcIndex(c.endPosId);
      return (
        c.name &&
        c.fileId === this._editorState.selectedFileId &&
        c.sessionId !== this._editorState.sessionId
      );
    });
  };

  // 获取当前选中文件的cursor的光标位置
  private getCursorIndex = () => {
    const cursorPosId =
      this._cursorPosIdDict[this._editorState.selectedFileId] || '';
    return this._mySelection.end.getIndex(cursorPosId);
  };

  // Monaco的onDidChangeModelContent回调中调用
  private editText = (
    edits: { rangeOffset: number; rangeLength: number; text: string }[],
  ) => {
    this.onDidFocusEditorText();
    for (let i = 0; i < edits.length; i++) {
      const change = edits[i];
      if (change.rangeLength !== 0) {
        this._deleteText(change.rangeOffset, change.rangeLength);
      }
      if (change.text !== '') {
        this._insertText(change.rangeOffset, change.text);
      }
    }
  };
  // Monaco的onDidChangeCursorSelection回调中调用，记录文件的光标位置(指的是选中区域的开始位置和结束位置)
  private setSelectionRange = (startIdx, endIdx) => {
    this._mySelection.setRange(startIdx, endIdx);
    const startPosId = this._mySelection.begin.id;
    const endPosId = this._mySelection.end.id;
    this._cursorPosIdDict[this._editorState.selectedFileId] = endPosId;
    this.updateCursor(startPosId, endPosId);
  };

  // 获取当前选中文件信息
  private getSelectedFile() {
    return this._editorState.fileDict[this.getSelectedFileId()];
  }

  // 获取当前选中文件id
  private getSelectedFileId() {
    if (!this._editorState.fileDict[this._editorState.selectedFileId]) {
      const indexFile = this.getFileByName('index.js') || this.getFileList()[0];
      this.selectFile(indexFile.fileId);
    }
    return this._editorState.selectedFileId;
  }

  // rpc方法回调
  private _syncCursor(dict, tmp_cursor: CursorState) {
    const cursor = dict[tmp_cursor.sessionId];
    if (cursor) {
      CursorSchema.assign(cursor, tmp_cursor);
    } else {
      dict[tmp_cursor.sessionId] = CursorSchema.clone(tmp_cursor);
    }
  }
  // rpc方法回调
  private _syncFile(dict, temp_file) {
    const file = dict[temp_file.fileId];
    if (file) {
      FileSchema.assign(file, temp_file);
    } else {
      dict[temp_file.fileId] = FileSchema.clone(temp_file);
    }
  }
  // rpc方法回调
  private _removeFile(fileId) {
    this.fileDictReplica.dispatch(
      [this.fileDictReplica.action().remove(fileId)],
      false,
    );
    this.fileDictReplica.removeFileHistory(fileId);
  }

  private _insertText = (idx: number, str: string) => {
    this.fileDictReplica.dispatch([
      this.fileDictReplica
        .action()
        .update(this._editorState.selectedFileId)
        .text(
          this.fileDictReplica.store.keyIndex[this._editorState.selectedFileId]
            .value.stores.text,
        )
        .insert(idx, str),
    ]);
  };

  private _deleteText = (idx: number, count: number) => {
    this.fileDictReplica.dispatch([
      this.fileDictReplica
        .action()
        .update(this._editorState.selectedFileId)
        .text(
          this.fileDictReplica.store.keyIndex[this._editorState.selectedFileId]
            .value.stores.text,
        )
        .remove(idx, count),
    ]);
  };

  private calcIndex = (cursorPosId) => {
    return this._mySelection.end.getIndex(cursorPosId);
  };

  private updateCursor(startPosId, endPosId) {
    const cursor = this._editorState.cursorDict[this._editorState.sessionId];
    if (this.getSelectedFile().text !== '' && cursor.endPosId !== endPosId) {
      this.fileDictReplica.shouldGroupCharacter();
    }
    cursor.startPosId = startPosId;
    cursor.endPosId = endPosId;
    this._protocol.server.message.syncCursor(cursor);
  }

  private cursorIdx() {
    const cursor = this._editorState.cursorDict[this._editorState.sessionId];
    return [cursor.startPosId, cursor.endPosId];
  }

  private hasFiles() {
    return this.getFileList().length > 0;
  }

  private getFileList() {
    return Object.values(this._editorState.fileDict);
  }

  public isFileExist(fileId: string) {
    return !!this._editorState.fileDict[fileId];
  }

  private prepareModelForAllFiles() {
    const dict = this._editorState.fileDict;
    for (const fileId in dict) {
      const file = dict[fileId];
      const model = this._fileModels[fileId];
      if (model) {
        if (model.getValue() !== file.text) {
          model.setValue(file.text);
        }
      } else {
        this._fileModels[fileId] =
          this.monacoController.isReady &&
          this.monacoController.monaco.editor.createModel(
            file.text,
            'javascript',
          );
      }
    }
    const models = this._fileModels;
    for (const fileId in models) {
      if (!(fileId in dict)) {
        models[fileId].dispose();
        delete models[fileId];
      }
    }
  }

  private findErrorFile(model_id, idx) {
    const models = this._fileModels;
    for (const fileId in models) {
      const model = models[fileId];
      if (model.id === '$model' + model_id) {
        const file = this._editorState.fileDict[fileId];
        if (file) {
          const file_name = file.name;
          return [file_name, idx];
        }
      }
    }
    return null;
  }
  /**
   * 选中文件前，判断目标文件是否为当前已选中且锁定的文件
   * 如果是，本次的选中操作所触发的blur事件不允许执行解锁
   */
  public onBeforeSelect(fileId) {
    const file = this._editorState.fileDict[fileId];
    if (
      clientConfig.mapInfo.combType &&
      file &&
      file.isShare &&
      this._isLockedByCurrentMap(file) &&
      this._editorState.selectedFileId === fileId
    ) {
      this._canUnlockSelectedFile = false;
    }
  }

  /**
   * 编辑器聚焦 - 满足条件时加编辑锁
   */
  public onDidFocusEditorText() {
    if (!clientConfig.mapInfo.combType) {
      return;
    }
    const fileId = this._editorState.selectedFileId;
    const file = this._editorState.fileDict[fileId];
    if (
      !fileId ||
      !file ||
      checkIndexFile(file.name) ||
      !file.isShare ||
      this._isLockedByCurrentMap(file)
    ) {
      return;
    }
    if (!file.lockedMapTitle) {
      this._protocol.server.message.selectFile(fileId);
    }
  }

  /**
   * 编辑器失焦 - 满足条件时解除编辑锁
   */
  public onDidBlurEditorText() {
    if (!clientConfig.mapInfo.combType) {
      return;
    }
    const fileId = this._editorState.selectedFileId;
    const file = this._editorState.fileDict[fileId];
    if (!fileId || !file || checkIndexFile(file.name) || !file.isShare) {
      return;
    }
    // 判断是否持有锁、判断本次blur是否允许执行unlock
    if (
      file.lockedMapTitle &&
      this._isLockedByCurrentMap(file) &&
      this._canUnlockSelectedFile
    ) {
      this._protocol.server.message.blurFile();
    }
    // 恢复_canUnlockSelectedFile 以便允许其他操作触发的blur解锁文件
    this._canUnlockSelectedFile = true;
  }
}
