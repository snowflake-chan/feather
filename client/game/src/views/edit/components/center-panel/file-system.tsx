import { useContext } from 'react';
import { CenterPanelWarp } from '.';
import { useEdit } from 'src/client/edit/edit-context';
import { RootState } from 'src/redux/edit';
import { useDispatch, useSelector } from 'react-redux';
import { setCenterPanel, setNavMode } from 'src/redux/edit/creator';
import { FileSystemPanel } from '../fileSystemPanel';
import { PermissionAccessLevel } from '@box/schema/permissions/permission-rda';
import { LeftNavModeEnum, CenterPanelEnum } from '../../defs';
import { ArenaEditorUIContext } from '../../editor-ui-context';

/**
 * 居中弹窗 - 文件管理
 */
export const FileSystem = () => {
  // editor context
  const editor = useEdit();
  const { replica } = useContext(ArenaEditorUIContext);
  // redux
  const dispatch = useDispatch();
  const navMode = useSelector((state: RootState) => state.creator.navMode);
  const isRunning = useSelector((state: RootState) => state.ui.isRunning);
  const userId = useSelector((state: RootState) => state.user.id);

  const handleOpenEditor = () => {
    const permissions = replica.localPermissions;
    const accessLevel = replica.permissions.accessLevel;
    if (
      !permissions.editScripts &&
      accessLevel !== PermissionAccessLevel.SCRIPT_VIEW_ONLY
    ) {
      return;
    }
    dispatch(setCenterPanel(CenterPanelEnum.None));
    if (navMode !== LeftNavModeEnum.Script) {
      dispatch(setNavMode(LeftNavModeEnum.Script));
      editor.rpc.toggleHackingVisual(true);
    }
  };

  return (
    <CenterPanelWarp>
      <FileSystemPanel
        userId={userId}
        running={isRunning}
        handleOpenEditor={handleOpenEditor}
        closeModal={() => dispatch(setCenterPanel(CenterPanelEnum.None))}
      />
    </CenterPanelWarp>
  );
};
