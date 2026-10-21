import { useCallback, useContext, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import { ShareScriptErrorCode } from '@box/apis';
import { ModalView, Toast } from '@box/box-design';
import { FileState } from '@box/schema/code-editor/code-editor-common-state';
import { AssetType } from '@box/schema/project/project-rda';
import { apis } from 'src/apis/local-api';
import { useEdit } from 'src/client/edit/edit-context';
import { clientConfig } from 'src/config/client';
import { usesCloudMapGroupAPIs } from 'configs/client';
import { RootState } from 'src/redux/edit';
import { setRemoveId } from 'src/redux/edit/script-manager';
import { CodeEditorStateContext } from '../script-container/hooks';

export const ScriptRemoveModal = () => {
  const intl = useIntl();
  const editor = useEdit();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);

  const { codeEditorState } = useContext(CodeEditorStateContext);
  const { contentId, name: currMapTitle, isLocalMapGroup } = clientConfig.mapInfo;
  const usesCloudGroupAPI = usesCloudMapGroupAPIs(clientConfig.mapInfo);

  const removeId = useSelector(
    (state: RootState) => state.scriptManager.removeId,
  );
  const originalFile = useMemo(() => {
    if (!removeId) {
      return;
    }
    return codeEditorState.fileDict[removeId];
  }, [removeId, codeEditorState.fileDict]);

  const closeRemoveModal = useCallback(() => {
    setLoading(false);
    dispatch(setRemoveId(undefined));
  }, [dispatch]);

  // 普通地图的删除
  const removeNormalScript = useCallback(
    (originalFile: FileState) => {
      editor.codeEditorController.removeFile(originalFile);
      editor.assetController.removeScriptFromProject(originalFile.name);
      Toast.success({
        content: intl.formatMessage({ id: 'removeScriptSuccess' }),
      });
    },
    [editor.assetController, editor.codeEditorController, intl],
  );

  // 扩展地图的删除
  const removeExtensionScript = useCallback(
    (file: FileState) => {
      const extraFile =
        editor.state.replica.extraProjectInfo.scriptAssets[file.fileId];
      apis.createra
        .deleteScriptUsingDelete({
          mapId: contentId,
          id: file.fileId,
        })
        .then(() => {
          // 共享文件删除，加入deleteAssets
          if (file.isShare) {
            editor.assetController.pushScriptToDeleteAssets(
              {
                hash: extraFile.hash,
                name: file.name,
                size: file.size,
                type: file.isClient
                  ? AssetType.CLIENT_JS_SCRIPT
                  : AssetType.JS_SCRIPT,
              },
              0,
            );
          } else {
            // 本地文件删除，同时删除project.assets
            editor.assetController.removeScriptFromProject(file.name);
          }
          Toast.success({
            content: intl.formatMessage({ id: 'removeScriptSuccess' }),
          });
        })
        .catch((err) => {
          switch (err.code) {
            case ShareScriptErrorCode.ScriptLockedByAnotherMap:
              const lockedMapTitle =
                file.lockedMapTitle.length > 10
                  ? file.lockedMapTitle.slice(0, 9).concat('...')
                  : file.lockedMapTitle;
              const tips = `${intl.formatMessage({
                id: 'deleteFailed',
              })}, ${intl.formatMessage(
                {
                  id: 'fileLockedBy$$OtherMap',
                },
                { mapTitle: lockedMapTitle },
              )}`;
              Toast.info({ content: tips });
              break;
            case ShareScriptErrorCode.ScriptGetLockFailed:
            default:
              Toast.info({
                content: intl.formatMessage({ id: 'deleteFailed' }),
              });
              break;
          }
        });
    },
    [
      contentId,
      editor.assetController,
      editor.state.replica.extraProjectInfo.scriptAssets,
      intl,
    ],
  );

  const removeLocalSharedScript = useCallback(async (file: FileState) => {
    try {
      await (apis.createra as any).updateLocalSharedScript('delete', file.fileId);
      Toast.success({ content: intl.formatMessage({ id: 'removeScriptSuccess' }) });
    } catch {
      Toast.info({ content: intl.formatMessage({ id: 'deleteFailed' }) });
    }
  }, [intl]);

  const onRemove = useCallback(
    (originalFile: FileState) => {
      if (isLocalMapGroup && originalFile.isShare) {
        removeLocalSharedScript(originalFile);
      } else if (!usesCloudGroupAPI) {
        // 非扩展地图
        removeNormalScript(originalFile);
      } else {
        // 扩展地图
        removeExtensionScript(originalFile);
      }
    },
    [isLocalMapGroup, removeExtensionScript, removeLocalSharedScript, removeNormalScript, usesCloudGroupAPI],
  );

  const onConfirm = useCallback(() => {
    setLoading(true);
    if (!originalFile) {
      Toast.info({
        content: intl.formatMessage({ id: 'fileAlreadyDelete' }),
      });
      closeRemoveModal();
      return;
    }
    onRemove(originalFile);
    closeRemoveModal();
  }, [closeRemoveModal, intl, onRemove, originalFile]);

  const title = useMemo(() => {
    if (originalFile?.isShare) {
      return intl.formatMessage({ id: 'removeShareScript' });
    }
    return intl.formatMessage({ id: 'removeScript' });
  }, [intl, originalFile?.isShare]);

  const content = useMemo(() => {
    if (originalFile?.isShare) {
      return intl.formatMessage({ id: 'removeShareScriptTips' });
    }
    return intl.formatMessage({ id: 'removeScriptTips' });
  }, [intl, originalFile?.isShare]);

  return (
    <ModalView
      width={332}
      type="warning"
      buttonSort="rtl"
      title={title}
      confirmText={intl.formatMessage({ id: 'remove' })}
      cancelText={intl.formatMessage({ id: 'cancel' })}
      content={content}
      onConfirm={onConfirm}
      onCancel={closeRemoveModal}
      confirmLoading={loading}
    />
  );
};
