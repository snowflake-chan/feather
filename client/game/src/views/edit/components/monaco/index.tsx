import React, { useEffect, useContext, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Editor, { Monaco, OnMount } from '@monaco-editor/react';
import { PermissionAccessLevel } from '@box/schema/permissions/permission-rda';
import { StyleMonaco } from './style';

import { RootState } from 'src/redux/edit';

import style from './index.module.scss';
import { useIntl } from 'react-intl';
import { LangType } from 'src/apis/createra';
import { useEdit } from 'src/client/edit/edit-context';
import { ArenaEditorUIContext } from '../../editor-ui-context';
import { CodeEditorStateContext } from '../script-container/hooks';
import { clientConfig } from 'src/config/client';

type Props = {};

export const MonacoEditor = React.memo((props: Props) => {
  const editor = useEdit();
  const { replica } = useContext(ArenaEditorUIContext);
  const { codeEditorState } = useContext(CodeEditorStateContext);
  const intl = useIntl();
  const userName = useSelector((state: RootState) => state.user.displayName);
  const { monacoController } = editor.codeEditorController;

  const readOnly = useMemo(() => {
    const { name: currMapTitle, combType, isLocalMapGroup } = clientConfig.mapInfo;
    const permissionReadOnly =
      replica.permissions.accessLevel ===
        PermissionAccessLevel.SCRIPT_VIEW_ONLY &&
      !replica.localPermissions.editScripts;
    if (!combType) {
      return permissionReadOnly;
    } else {
      const file = codeEditorState.fileDict[codeEditorState.selectedFileId];
      const shareScriptReadOnly =
        file &&
        (file.isUploading ||
          (file.isShare &&
            file.lockedMapTitle &&
            (isLocalMapGroup
              ? file.lockedMapId !== clientConfig.localMapRuntimeId
              : file.lockedMapTitle !== currMapTitle)));
      return permissionReadOnly || !!shareScriptReadOnly;
    }
  }, [codeEditorState, replica]);

  const handleEditorDidMount: OnMount = (monacoEditor, monaco) => {
    editor.codeEditorController.monacoReady(monacoEditor, monaco);
  };

  const setEditorTheme = (monaco: Monaco) => {
    monaco.editor.defineTheme('customTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
        'focusBorder': '#1e1e1e',
      },
    });
  };

  useEffect(() => {
    monacoController.setMonacoLocale(intl.locale as LangType);
  }, [intl.locale]);

  useEffect(() => {
    document.addEventListener('monaco_layout', monacoController.onResize);
    editor.codeEditorController.syncCursorName(userName);
    return () => {
      document.removeEventListener('monaco_layout', monacoController.onResize);
    };
  }, []);

  const blurOnShareAutoSave = useCallback(() => {
    // Local map groups keep their map-level edit lock until the editor truly
    // leaves the script. The legacy cloud behavior blurs after auto-save,
    // which would otherwise immediately release that lock.
    if (clientConfig.mapInfo.isLocalMapGroup) return;
    if (
      monacoController.monacoEditor.hasTextFocus() &&
      document.activeElement instanceof HTMLElement
    ) {
      document.activeElement.blur();
    }
  }, [monacoController.monacoEditor]);

  useEffect(() => {
    const onShareAutoSave = editor.codeEditorController.onShareAutoSave;
    onShareAutoSave.sub(blurOnShareAutoSave);
    return () => {
      onShareAutoSave.unsub(blurOnShareAutoSave);
    };
  }, [blurOnShareAutoSave, editor.codeEditorController.onShareAutoSave]);

  return (
    <div className={style.container}>
      <StyleMonaco readOnly={readOnly} />
      <Editor
        defaultLanguage="javascript"
        language="javascript"
        theme="customTheme"
        options={{
          fontSize: 16,
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          automaticLayout: true,
          renderLineHighlight: 'all',
          scrollBeyondLastLine: false,
          readOnly: readOnly,
        }}
        beforeMount={setEditorTheme}
        onMount={handleEditorDidMount}
      />
    </div>
  );
});
