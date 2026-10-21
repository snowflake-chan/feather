import React, { useCallback, useContext, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { ItemId } from '@box/box-design';

import { ContextMenu, ContextmenuData } from '../context-menu';
import { useEdit } from 'src/client/edit/edit-context';
import { RootState } from 'src/redux/edit';
import {
  setRemoveId,
  setRenameOptions,
  setScriptMenuInfo,
  setShareScriptId,
  setUnshareScriptId,
} from 'src/redux/edit/script-manager';
import { checkIndexFile } from './utils';
import { CodeEditorStateContext } from '../script-container/hooks';
import { useCopyScript } from './hooks';
import { clientConfig } from 'src/config/client';
import { usesCloudMapGroupAPIs } from 'configs/client';

enum ContextMenuId {
  Copy,
  Rename,
  Share,
  Unshare,
  Remove,
}

export const ScriptMenu = React.memo(() => {
  const intl = useIntl();
  const editor = useEdit();
  const dispatch = useDispatch();
  const { scriptMenuInfo } = useSelector(
    (state: RootState) => state.scriptManager,
  );
  const { contentId, name: currMapTitle, isLocalMapGroup } = clientConfig.mapInfo;
  const usesCloudGroupAPI = usesCloudMapGroupAPIs(clientConfig.mapInfo);
  const supportsScriptSharing = usesCloudGroupAPI || Boolean(isLocalMapGroup);
  const { codeEditorState } = useContext(CodeEditorStateContext);

  const file = useMemo(() => {
    if (!scriptMenuInfo) {
      return;
    }
    return codeEditorState.fileDict[scriptMenuInfo.menuScriptId];
  }, [codeEditorState.fileDict, scriptMenuInfo]);

  const closeMenu = useCallback(() => {
    dispatch(setScriptMenuInfo(undefined));
  }, [dispatch]);

  // 菜单项
  const list: (ContextmenuData | false)[] = useMemo(() => {
    if (!file) {
      return [];
    }
    const { name, isShare, isUploading, lockedMapTitle } = file;
    const isIndex = checkIndexFile(name);
    const isLockedByOther = Boolean(
      lockedMapTitle &&
        (isLocalMapGroup
          ? file.lockedMapId !== clientConfig.localMapRuntimeId
          : lockedMapTitle !== currMapTitle),
    );

    return [
      // 复制
      {
        id: ContextMenuId.Copy,
        text: intl.formatMessage({ id: 'copy' }),
      },
      // 重命名
      !isIndex && {
        id: ContextMenuId.Rename,
        text: intl.formatMessage({ id: 'rename' }),
        disabled: isLockedByOther || isUploading,
      },
      // 开启共享
      !isIndex &&
        !isShare &&
        supportsScriptSharing && {
          id: ContextMenuId.Share,
          text: intl.formatMessage({ id: 'shareScript' }),
          disabled: isUploading,
        },
      // 取消共享
      !isIndex &&
        isShare &&
        supportsScriptSharing && {
          id: ContextMenuId.Unshare,
          text: intl.formatMessage({ id: 'unshareScript' }),
          disabled: isLockedByOther,
        },
      // 删除
      !isIndex && {
        id: ContextMenuId.Remove,
        text: intl.formatMessage({ id: 'remove' }),
        disabled: isLockedByOther || isUploading,
      },
    ];
  }, [currMapTitle, file, intl, isLocalMapGroup, supportsScriptSharing]);
  const data: ContextmenuData[] = list.filter(
    (item): item is ContextmenuData => !!item,
  );

  const onCopy = useCopyScript({ file: file, intl: intl });

  const onSelect = useCallback(
    (id: ItemId) => {
      if (!editor || !file) {
        return;
      }
      switch (id) {
        case ContextMenuId.Copy:
          onCopy();
          break;
        case ContextMenuId.Rename:
          dispatch(
            setRenameOptions({
              renameInfo: { fileId: file.fileId, isShare: file.isShare },
            }),
          );
          break;
        case ContextMenuId.Share:
          dispatch(setShareScriptId(file.fileId));
          break;
        case ContextMenuId.Unshare:
          dispatch(setUnshareScriptId(file.fileId));
          break;

        case ContextMenuId.Remove:
          dispatch(setRemoveId(file.fileId));
          break;
      }
      closeMenu();
    },
    [editor, file, closeMenu, onCopy, dispatch],
  );

  return (
    <ContextMenu
      position={scriptMenuInfo?.menuPos}
      data={data}
      onSelect={onSelect}
      onMouseDownOutside={closeMenu}
    />
  );
});
