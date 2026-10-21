import { loader } from '@monaco-editor/react';
import { type editor } from 'monaco-editor';
import { type Monaco } from '@monaco-editor/react';
import { type CursorState } from '@box/schema/code-editor/code-editor-common-state';

import { supportJsSql } from './js-sql-syntax';
import { LangType, monacoLocaleMap } from 'src/apis/createra';
import { CodeEditorClientController } from './code-editor-client-controller';

export class MonacoEditorController {
  public monacoEditor: editor.IStandaloneCodeEditor = undefined as any;
  public monaco: Monaco = undefined as any;
  public model;
  public decorations: string[] = [];
  public pauseSendChange = false;
  public isReady = false;

  private _cursorDueTime = {};
  private _viewOnly;
  private _sqlEnabled = false;

  constructor() {
    // 配置monaco需要加载的js
    loader.config({
      paths: { vs: '/_next/static/vs' },
    });
  }
  public setMonacoLocale = (locale: LangType) => {
    loader.config({
      'vs/nls': {
        availableLanguages: {
          '*': monacoLocaleMap[locale], // 此配置的值只能使用MONACO_LANGUAGE中定义好的的取值，否则不生效
        },
      },
    });
  };

  public ready(spec: {
    monacoEditor: editor.IStandaloneCodeEditor;
    monaco: Monaco;
    redo: () => void;
    undo: () => void;
    contentChange: (
      edits: { rangeOffset: number; rangeLength: number; text: string }[],
    ) => void;
    selectionChange: (startIdx: number, endIdx: number) => void;
  }) {
    const { monacoEditor, monaco, redo, undo, contentChange, selectionChange } =
      spec;
    this.monacoEditor = monacoEditor;
    this.monaco = monaco;
    this.isReady = true;
    this.model = monacoEditor.getModel();

    // 增加监听
    this.monacoEditor.addCommand(
      monaco.KeyCode.KeyZ | monaco.KeyMod.CtrlCmd,
      undo,
    );
    this.monacoEditor.addCommand(
      monaco.KeyCode.KeyZ | monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift,
      redo,
    );
    // 内容发生变化的时候触发
    this.monacoEditor.onDidChangeModelContent((e) => {
      if (this.pauseSendChange) {
        return;
      }

      contentChange(e.changes);
    });

    this.monacoEditor.onDidChangeCursorSelection((e) => {
      if (this.pauseSendChange || this._viewOnly) {
        return;
      }
      const selection = e.selection;
      const startIdx = this.posToIdx(selection.getStartPosition());
      const endIdx = this.posToIdx(selection.getEndPosition());
      selectionChange(startIdx, endIdx);
    });

    this.monacoEditor.onDidFocusEditorText(() => {
      CodeEditorClientController.instance.onDidFocusEditorText();
    });

    this.monacoEditor.onDidBlurEditorText(() => {
      CodeEditorClientController.instance.onDidBlurEditorText();
    });

    // Project-wide live diagnostics are intentionally disabled. Imported maps
    // can contain many scripts, and keeping the JavaScript worker validating
    // them while the editor is open competes with the renderer and runtime.
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestionDiagnostics: true,
    });

    // compiler options
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      allowJs: true,
      checkJs: false,
      noEmit: true,
      lib: ['es2015'],
    });

    if (!this._sqlEnabled) {
      setTimeout(() => {
        supportJsSql(monaco); // override default JS highlighter
      }, 300);
      this._sqlEnabled = true;
    }
  }

  public setLibs = (libs: { content: string; filePath?: string }[]) => {
    if (!this.monaco) {
      return;
    }
    this.monaco.languages.typescript.javascriptDefaults.setExtraLibs(libs);
  };

  // 设置工作区的文本
  public setText = (text) => {
    if (this.monacoEditor.getValue() === text) {
      return;
    }
    this.pauseSendChange = true;
    this.monacoEditor.setValue(text);
    this.pauseSendChange = false;
  };

  /** 恢复光标位置 - 仅用于发生数据同步时 */
  public recoverCursor = (params: {
    idx;
    focus?: boolean;
    revealPosition?: boolean;
  }) => {
    const { idx, focus = true, revealPosition = false } = params;
    this.pauseSendChange = true;
    const pos = this.model.getPositionAt(idx);
    const selection = this.monacoEditor.getSelection();
    /**
     * 如果当前方法是因 当前用户的本地编辑而调起的，则需要滚动视口到光标所在处（如插入/删除/undo/redo/rename file等)
     * 否则不需要滚动视口(如：初始化、切换文件、将其他协作者的修改同步到本地)
     */
    revealPosition &&
      this.monacoEditor.revealPositionInCenterIfOutsideViewport(pos);
    /**
     * 当光标没有选中文案的时候，才需要重新setPosition
     * 例如连续查找替换时，光标已选中了文案，则此时光标位置不应被重置，否则会取消选中本该选中的文案
     */
    if (
      selection &&
      selection.startColumn === selection.endColumn &&
      selection.startLineNumber === selection.endLineNumber
    ) {
      this.monacoEditor.setPosition(pos);
    }
    focus && this.monacoEditor.focus();
    this.pauseSendChange = false;
  };
  // 滚动到代码位置
  public gotoLine(line: number, column: number) {
    const pos = new this.monaco.Position(line, column);
    this.monacoEditor.setPosition(pos);
    this.monacoEditor.revealPositionInCenter(pos);
    this.monacoEditor.focus();
  }

  public posToIdx = (pos) => {
    return this.model.getOffsetAt(pos);
  };

  public _idxToPos = (idx) => {
    return this.model.getPositionAt(idx);
  };

  public onResize = () => {
    this.monacoEditor && this.monacoEditor.layout();
  };

  // 更新并高亮合作者的光标位置，800ms后消失
  public updateCollaboratorCursors(cursorList, activeCursor?: CursorState) {
    if (activeCursor) {
      this._cursorDueTime[activeCursor.sessionId] = Date.now() + 800;
    }

    const now = Date.now();
    const due = this._cursorDueTime;
    const decoOption = cursorList.map((cur: any) => {
      const startPos = this.model.getPositionAt(cur.startIdx);
      const endPos = this.model.getPositionAt(cur.endIdx);
      const dueTime = due[cur.sessionId];
      const id = cur.id % 8;
      return {
        range: new this.monaco.Range(
          startPos.lineNumber,
          startPos.column,
          endPos.lineNumber,
          endPos.column,
        ),
        options: {
          afterContentClassName: `
                        liveCursor
                        user${id}
                        ${endPos.lineNumber === 1 ? 'firstline' : ''}
                        ${dueTime >= now ? 'show' : 'hide'}
                    `,
          inlineClassName: `userBg${id}`,
        },
      };
    });
    this.decorations =
      this.monacoEditor &&
      this.monacoEditor.deltaDecorations(this.decorations, decoOption);
  }

  // 代码报错
  public async workerGetErrors() {
    const _worker =
      await this.monaco.languages.typescript.getJavaScriptWorker();
    const worker: any = await _worker();
    const fileNames = await worker.getScriptFileNames();
    const errors: { id: string; info: any }[] = [];

    for (const fname of fileNames) {
      const errorList = await worker.getSyntacticDiagnostics(fname);
      const id = fname.substring(17);
      if (errorList.length && fname.indexOf('inmemory://model/') === 0) {
        const error = { id, info: errorList[0] };
        errors.push(error);
      }
    }
    return errors;
  }

  public getSelectionValue() {
    const monacoModel = this.monacoEditor.getModel();
    if (monacoModel === null) {
      return;
    }

    const selection = this.monacoEditor.getSelection();
    if (!selection) {
      return;
    }

    return monacoModel.getValueInRange(selection);
  }

  public insertCodeToSelection(code: string) {
    const selection = this.monacoEditor.getSelection();
    if (selection === null) {
      return;
    }
    this.monacoEditor.executeEdits('ai-insert', [
      {
        range: selection,
        text: code,
        forceMoveMarkers: true,
      },
    ]);
  }

  public addActions(actions: editor.IActionDescriptor) {
    return this.monacoEditor.addAction(actions);
  }
}

export const monacoController = new MonacoEditorController();
