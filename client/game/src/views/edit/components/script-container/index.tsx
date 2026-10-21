import { useEffect, useContext, useMemo } from 'react';
import { PermissionAccessLevel } from '@box/schema/permissions/permission-rda';

import { useEdit } from 'src/client/edit/edit-context';
import { ScriptEditor } from '../script-editor';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/redux/edit';
import { LeftNavModeEnum } from 'src/views/edit/defs';
import { ArenaEditorUIContext } from 'src/views/edit/editor-ui-context';
import { CodeEditorStateContext } from './hooks';
import { ScriptManager } from '../script-manager';
import {
  setClientTabExpand,
  setServerTabExpand,
} from 'src/redux/edit/script-manager';

import style from './index.module.scss';

export const ScriptContainer = () => {
  const editor = useEdit();
  const { replica } = useContext(ArenaEditorUIContext);
  const navMode = useSelector((state: RootState) => state.creator.navMode);
  const accessLevel = useSelector(
    (state: RootState) => state.permission.accessLevel,
  );
  const scriptEditorVisible = useMemo(() => {
    if (
      !replica.localPermissions.editScripts &&
      accessLevel !== PermissionAccessLevel.SCRIPT_VIEW_ONLY
    ) {
      return false;
    } else {
      return navMode === LeftNavModeEnum.Script;
    }
  }, [replica.localPermissions, accessLevel, navMode]);

  useEffect(() => {
    editor.rpc.toggleHackingVisual(scriptEditorVisible);
  }, [editor.rpc, scriptEditorVisible]);

  useEffect(() => {
    if (navMode === LeftNavModeEnum.Script) {
      editor.codeEditorController.monacoController.monacoEditor?.focus();
    }
  }, [editor.codeEditorController.monacoController.monacoEditor, navMode]);

  return (
    <div
      className={`${style.scriptContainer} ${
        scriptEditorVisible && style.showScript
      }`}
    >
      <ScriptManager />
      <ScriptEditor visible={scriptEditorVisible} />
    </div>
  );
};
