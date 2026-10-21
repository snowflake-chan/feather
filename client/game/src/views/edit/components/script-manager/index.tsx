import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import { PermissionAccessLevel } from '@box/schema/permissions/permission-rda';
import { IconRight } from '@box/icons';

import { ScriptTab } from './script-tab';
import { ScriptItem } from './script-item';
import { ScriptMenu } from './script-menu';
import { useEdit } from 'src/client/edit/edit-context';

import {
  setScriptMenuInfo,
  setServerTabExpand,
  setClientTabExpand,
} from 'src/redux/edit/script-manager';
import { ArenaEditorUIContext } from '../../editor-ui-context';
import { RootState } from 'src/redux/edit';
import { CodeEditorStateContext } from '../script-container/hooks';

import style from './index.module.scss';
import { LeftNavModeEnum } from 'src/views/edit/defs';
import { clientConfig } from 'src/config/client';
import { usesCloudMapGroupAPIs } from 'configs/client';
import { apis } from 'src/apis/local-api';
import { Toast } from '@box/box-design';
import { ScriptType } from '@box/apis';
import { ShareModal } from './share-modal';
import { UnshareModal } from './unshare-modal';
import { ensureFileInFileList } from 'src/views/edit/components/script-manager/utils';

export const ScriptManager = React.memo(() => {
  const intl = useIntl();
  const editor = useEdit();
  const dispatch = useDispatch();
  const {
    serverTabExpand,
    clientTabExpand,
    scriptMenuInfo,
    shareScriptId,
    unshareScriptId,
  } = useSelector((state: RootState) => state.scriptManager);
  const { contentId: currMapId } = clientConfig.mapInfo;
  const usesCloudGroupAPI = usesCloudMapGroupAPIs(clientConfig.mapInfo);
  const navMode = useSelector((state: RootState) => state.creator.navMode);
  const { codeEditorState } = useContext(CodeEditorStateContext);
  const { replica } = useContext(ArenaEditorUIContext);
  const readOnly =
    replica.permissions.accessLevel ===
      PermissionAccessLevel.SCRIPT_VIEW_ONLY &&
    !replica.localPermissions.editScripts;

  // 脚本管理器 展开/收起
  const [managerExpand, setManagerExpand] = useState(true);
  const toggleExpand = useCallback(() => {
    setManagerExpand(!managerExpand);
  }, [managerExpand]);
  const className = useMemo(() => {
    const list = [style.managerWrapper];

    if (!managerExpand) {
      list.push(style.hide);
    }

    return list.join(' ');
  }, [managerExpand]);

  // server/client脚本列表 展开/收起
  const onToggleServerTab = useCallback(
    (expand) => {
      dispatch(setServerTabExpand(expand));
    },
    [dispatch],
  );
  const onToggleClientTab = useCallback(
    (expand) => {
      dispatch(setClientTabExpand(expand));
    },
    [dispatch],
  );

  // 新建server/client脚本
  const addFile = useCallback(
    (isClient: boolean) => {
      if (!usesCloudGroupAPI) {
        // 非扩展地图
        editor.codeEditorController.addFile(isClient);
      } else {
        // 扩展地图走后端
        apis.createra
          .createScriptUsingPost({
            mapId: currMapId,
            type: isClient ? ScriptType.Client : ScriptType.Server,
          })
          .then((res) => {
            ensureFileInFileList(res.id).then((fileExist) => {
              if (fileExist) {
                editor.codeEditorController.selectFile(res.id);
              }
            });
          })
          .catch((err) => {
            // 极小概率的情况"新建失败"
            Toast.error({
              content: intl.formatMessage({ id: 'createScriptFail' }),
            });
            console.error(`add script file error: ${err}`);
          });
      }
    },
    [currMapId, editor.codeEditorController, intl, usesCloudGroupAPI],
  );
  const addServerFile = useCallback(() => addFile(false), [addFile]);
  const addClientFile = useCallback(() => addFile(true), [addFile]);

  // 选中文件 及 选前预处理
  const onBeforeSelect = useCallback(
    (fileId) => {
      editor.codeEditorController.onBeforeSelect(fileId);
    },
    [editor.codeEditorController],
  );

  const onSelect = useCallback(
    (fileId) => {
      editor.codeEditorController.selectFile(fileId);
    },
    [editor.codeEditorController],
  );

  /**
   * 将文件滚动至视口可见
   */
  const scrollCurrentItemIntoView = useCallback(() => {
    const element = document.getElementById(
      `script-item-${codeEditorState.selectedFileId}`,
    );
    if (!element) {
      return;
    }
    if (element.scrollIntoViewIfNeeded) {
      element.scrollIntoViewIfNeeded();
    } else {
      element.scrollIntoView({ block: 'nearest' });
    }
  }, [codeEditorState.selectedFileId]);

  useEffect(() => {
    const onSelectFile = editor.codeEditorController.onSelectFile;
    onSelectFile.sub(scrollCurrentItemIntoView);
    return () => {
      onSelectFile.unsub(scrollCurrentItemIntoView);
    };
  }, [editor.codeEditorController.onSelectFile, scrollCurrentItemIntoView]);

  useEffect(() => {
    if (
      navMode === LeftNavModeEnum.Script ||
      serverTabExpand ||
      clientTabExpand
    ) {
      scrollCurrentItemIntoView();
    }
  }, [navMode, scrollCurrentItemIntoView, serverTabExpand, clientTabExpand]);

  /**
   * 获取的脚本文件列表
   * @isClient true 客户端
   * @isClient false 服务端
   * */
  const getFileList = useCallback(
    (isClient: boolean) => {
      const list = Object.values(codeEditorState.fileDict).filter(
        (item) => item.isClient === isClient,
      );
      const className = [style.fileList];
      if (isClient) {
        !clientTabExpand && className.push(style.hide);
      } else {
        !serverTabExpand && className.push(style.hide);
      }

      return (
        <div className={className.join(' ')}>
          {list
            .sort((a, b) => a.order - b.order)
            .map((file) => {
              return (
                <ScriptItem
                  key={file.fileId}
                  fileInfo={file}
                  onSelect={onSelect}
                  onBeforeSelect={onBeforeSelect}
                  readOnly={readOnly}
                />
              );
            })}
        </div>
      );
    },
    [
      codeEditorState,
      onSelect,
      onBeforeSelect,
      readOnly,
      serverTabExpand,
      clientTabExpand,
    ],
  );
  const clientList = useMemo(() => getFileList(true), [getFileList]);
  const serverList = useMemo(() => getFileList(false), [getFileList]);

  /**
   * 右键空白区域时触发
   */
  const onContextMenu = useCallback(
    (evt: React.MouseEvent) => {
      if (codeEditorState.fileDict[codeEditorState.selectedFileId].isClient) {
        return;
      }
      dispatch(
        setScriptMenuInfo({
          menuPos: [evt.clientX, evt.clientY],
          menuScriptId: codeEditorState.selectedFileId,
        }),
      );
    },
    [codeEditorState, dispatch],
  );

  return (
    <>
      {shareScriptId ? <ShareModal /> : null}
      {unshareScriptId ? <UnshareModal /> : null}
      <div className={className}>
        {!readOnly && scriptMenuInfo ? <ScriptMenu /> : null}
        <div className={style.expandBtn} onPointerUp={toggleExpand}>
          <IconRight />
        </div>
        <div className={style.scrollWrapper} onContextMenu={onContextMenu}>
          <div className={style.scrollList}>
            <ScriptTab
              title={intl.formatMessage({ id: 'serverScript' })}
              onAdd={addServerFile}
              onToggle={onToggleServerTab}
              readOnly={readOnly}
            />
            {serverList}
            <ScriptTab
              title={intl.formatMessage({ id: 'clientScript' })}
              onToggle={onToggleClientTab}
              onAdd={addClientFile}
              readOnly={readOnly}
            />
            {clientList}
          </div>
        </div>
      </div>
    </>
  );
});
