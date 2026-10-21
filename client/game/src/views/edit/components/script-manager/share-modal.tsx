import { useCallback, useContext, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { ModalView, Toast } from '@box/box-design';
import { ShareScriptErrorCode } from '@box/apis';

import { RootState } from 'src/redux/edit';
import {
  setRenameOptions,
  setShareScriptId,
} from 'src/redux/edit/script-manager';
import { useEdit } from 'src/client/edit/edit-context';
import { CodeEditorStateContext } from '../script-container/hooks';
import { apis } from 'src/apis/local-api';
import { clientConfig } from 'src/config/client';
import style from './index.module.scss';

export const ShareModal = () => {
  const intl = useIntl();
  const editor = useEdit();
  const dispatch = useDispatch();
  const { codeEditorState } = useContext(CodeEditorStateContext);
  const [shareLoading, setShareLoading] = useState<boolean>(false);
  const { shareScriptId } = useSelector(
    (state: RootState) => state.scriptManager,
  );
  const { contentId } = clientConfig.mapInfo;

  const file = useMemo(() => {
    if (!shareScriptId) {
      return;
    }
    return codeEditorState.fileDict[shareScriptId];
  }, [codeEditorState.fileDict, shareScriptId]);

  const onConfirm = useCallback(async () => {
    if (!file) {
      Toast.info({
        content: `${intl.formatMessage({
          id: 'fileAlreadyDelete',
        })}, ${intl.formatMessage({ id: 'shareScriptFail' })}`,
      });
      return;
    }
    // 同步isUploading
    setShareLoading(true);
    const fileDictReplica = editor.codeEditorController.fileDictReplica;
    fileDictReplica.dispatch(
      [fileDictReplica.action().update(file.fileId).isUploading(true)],
      false,
    );
    // 上传oss
    const fileBlob = new Blob([file.text], { type: 'text/plain' });
    let hash;
    try {
      hash = await apis.upload.fileUploadPost({
        file: fileBlob,
        type: 'script',
      });
    } catch {
      Toast.info({
        content: intl.formatMessage({ id: 'shareScriptFail' }),
      });
      // 同步isUploading
      const fileDictReplica = editor.codeEditorController.fileDictReplica;
      fileDictReplica.dispatch(
        [fileDictReplica.action().update(file.fileId).isUploading(false)],
        false,
      );
      setShareLoading(false);
      dispatch(setShareScriptId(undefined));
      return;
    }
    apis.createra
      .shareScriptUsingPost({
        hash,
        id: file.fileId,
        mapId: contentId,
      })
      .then(() => {
        Toast.success({
          content: intl.formatMessage({ id: 'shareScriptSuccess' }),
        });
        // 从project.assets中移除
        editor.assetController.removeScriptFromProjectOnly(file.name);
      })
      .catch((errCode) => {
        switch (errCode.code) {
          case ShareScriptErrorCode.ScriptNotExist:
            Toast.info({
              content: `${intl.formatMessage({
                id: 'fileAlreadyDelete',
              })}, ${intl.formatMessage({ id: 'shareScriptFail' })}`,
            });
            break;
          case ShareScriptErrorCode.ScriptNameRepeat:
            Toast.info({
              content: `${intl.formatMessage({
                id: 'fileExists',
              })}, ${intl.formatMessage({ id: 'shareScriptFail' })}`,
            });
            dispatch(
              setRenameOptions({
                shareInfo: {
                  fileId: file.fileId,
                },
              }),
            );
            break;
          case ShareScriptErrorCode.NotCombMap:
          case ShareScriptErrorCode.ScriptGlobalLockFailed:
          default:
            Toast.info({
              content: intl.formatMessage({ id: 'shareScriptFail' }),
            });
            break;
        }
      })
      .finally(() => {
        // 同步isUploading
        const fileDictReplica = editor.codeEditorController.fileDictReplica;
        fileDictReplica.dispatch(
          [fileDictReplica.action().update(file.fileId).isUploading(false)],
          false,
        );
        setShareLoading(false);
        dispatch(setShareScriptId(undefined));
      });
  }, [
    contentId,
    dispatch,
    editor.assetController,
    editor.codeEditorController.fileDictReplica,
    file,
    intl,
  ]);

  const onCancel = useCallback(() => {
    dispatch(setShareScriptId(undefined));
  }, [dispatch]);

  return (
    <ModalView
      width={332}
      type="default"
      buttonSort="rtl"
      title={intl.formatMessage({ id: 'shareScript' })}
      confirmText={intl.formatMessage({ id: 'shareScriptConfirmText' })}
      cancelText={intl.formatMessage({ id: 'cancel' })}
      content={
        <p className={style.breakWord}>
          {intl.formatMessage(
            { id: 'shareScript$$Content' },
            { fileName: file?.name || '' },
          )}
        </p>
      }
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmLoading={shareLoading}
    />
  );
};
