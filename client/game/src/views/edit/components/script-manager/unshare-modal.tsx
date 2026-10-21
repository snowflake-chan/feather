import { useCallback, useContext, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { ModalView, Toast } from '@box/box-design';
import { ShareScriptErrorCode } from '@box/apis';

import { RootState } from 'src/redux/edit';
import { setUnshareScriptId } from 'src/redux/edit/script-manager';
import { CodeEditorStateContext } from '../script-container/hooks';
import { apis } from 'src/apis/local-api';
import { clientConfig } from 'src/config/client';
import { useEdit } from 'src/client/edit/edit-context';
import { AssetType } from '@box/schema/project/project-rda';
import style from './index.module.scss';

export const UnshareModal = () => {
  const intl = useIntl();
  const editor = useEdit();
  const dispatch = useDispatch();
  const { codeEditorState } = useContext(CodeEditorStateContext);
  const [unshareLoading, setUnshareLoading] = useState<boolean>(false);
  const { unshareScriptId } = useSelector(
    (state: RootState) => state.scriptManager,
  );

  const file = useMemo(() => {
    if (!unshareScriptId) {
      return;
    }
    return codeEditorState.fileDict[unshareScriptId];
  }, [codeEditorState.fileDict, unshareScriptId]);

  const onConfirm = useCallback(() => {
    if (!file) {
      return;
    }
    setUnshareLoading(true);
    apis.createra
      .unshareScriptUsingPost({
        id: file.fileId,
        mapId: clientConfig.mapInfo.contentId,
      })
      .then((hash) => {
        // 加入到project.assets中
        editor.assetController.addScriptToProject(
          {
            hash,
            name: file.name,
            size: file.size,
            type: file.isClient
              ? AssetType.CLIENT_JS_SCRIPT
              : AssetType.JS_SCRIPT,
          },
          0,
        );
        Toast.success({
          content: intl.formatMessage({ id: 'unshareScriptSuccess' }),
        });
        editor.replica.saveProject();
      })
      .catch((err) => {
        switch (err.code) {
          case ShareScriptErrorCode.ScriptNotExist:
            Toast.info({
              content: intl.formatMessage({
                id: 'fileAlreadyDelete',
              }),
            });
            break;
          case ShareScriptErrorCode.ScriptLockedByAnotherMap:
            Toast.info({
              content: `${intl.formatMessage({
                id: 'unshareScriptFail',
              })},${intl.formatMessage(
                { id: 'fileLockedBy$$OtherMap' },
                { mapTitle: file.lockedMapTitle },
              )}`,
            });
            break;
          case ShareScriptErrorCode.ScriptGetLockFailed:
          case ShareScriptErrorCode.NotCombMap:
          default:
            Toast.info({
              content: intl.formatMessage({
                id: 'unshareScriptFail',
              }),
            });
            break;
        }
      })
      .finally(() => {
        setUnshareLoading(false);
        dispatch(setUnshareScriptId(undefined));
      });
  }, [dispatch, editor.assetController, file, intl]);

  const onCancel = useCallback(() => {
    dispatch(setUnshareScriptId(undefined));
  }, [dispatch]);

  return (
    <ModalView
      width={332}
      type="warning"
      buttonSort="rtl"
      title={intl.formatMessage({ id: 'unshareScript' })}
      confirmText={intl.formatMessage({ id: 'unshareScript' })}
      cancelText={intl.formatMessage({ id: 'cancel' })}
      content={
        <p className={style.breakWord}>
          {intl.formatMessage(
            { id: 'unshareScript$$Content' },
            { fileName: file?.name || '' },
          )}
        </p>
      }
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmLoading={unshareLoading}
    />
  );
};
