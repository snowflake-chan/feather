import { useCallback, useContext, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import { InputPauseFlags } from '@box/schema/input/input-schema';
import { Input, ModalView, Toast } from '@box/box-design';
import { AssetType } from '@box/schema/project/project-rda';
import {
  ScriptType,
  ShareScriptErrorCode,
} from '@box/apis';

import { InputPause, useInputPause } from 'src/views/components/input-lock';
import { RootState } from 'src/redux/edit';
import { setRenameOptions } from 'src/redux/edit/script-manager';
import { transformName, isInvalidFileName } from './utils';
import { useEdit } from 'src/client/edit/edit-context';
import { CodeEditorStateContext } from '../script-container/hooks';
import { clientConfig } from 'src/config/client';
import { usesCloudMapGroupAPIs } from 'configs/client';
import { apis } from 'src/apis/local-api';

import style from './index.module.scss';

export const ScriptRenameModal = () => {
  const intl = useIntl();
  const editor = useEdit();
  const dispatch = useDispatch();
  const { inputPauseChange } = useInputPause();
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const { codeEditorState } = useContext(CodeEditorStateContext);
  const { contentId, isLocalMapGroup } = clientConfig.mapInfo;
  const usesCloudGroupAPI = usesCloudMapGroupAPIs(clientConfig.mapInfo);

  const renameOptions = useSelector(
    (state: RootState) => state.scriptManager.renameOptions,
  );
  const [nameExited, setNameExited] = useState<boolean>(
    !!(renameOptions?.recoverInfo || renameOptions?.shareInfo),
  );
  const [shareLoading, setShareLoading] = useState<boolean>(false);

  const renameFile = useMemo(() => {
    if (!renameOptions) {
      return;
    }
    if (renameOptions.renameInfo) {
      return codeEditorState.fileDict[renameOptions.renameInfo.fileId];
    }
    if (renameOptions.shareInfo) {
      return codeEditorState.fileDict[renameOptions.shareInfo.fileId];
    }
    return;
  }, [renameOptions, codeEditorState.fileDict]);

  const rawOldName = useMemo(() => {
    if (!renameOptions) {
      return;
    }

    if (renameFile) {
      // 普通重命名，共享重命名
      return transformName(renameFile.name, false);
    } else if (renameOptions.recoverInfo) {
      // 恢复文件-重命名
      return transformName(renameOptions.recoverInfo.key, false);
    }
    return;
  }, [renameFile, renameOptions]);

  const [newName, setNewName] = useState<string>(rawOldName || '');
  const newNameWithExt = useMemo(
    () => editor.assetController.formatName(newName, AssetType.JS_SCRIPT) || '',
    [editor.assetController, newName],
  );

  const closeRenameModal = useCallback(() => {
    dispatch(setRenameOptions(undefined));
  }, [dispatch]);

  const renameInProject = useCallback(
    (oldName, newName) => {
      editor.assetController.updateScriptNameInProject(oldName, newName);
      Toast.success({
        content: intl.formatMessage({ id: 'renameSuccess' }),
      });
      closeRenameModal();
    },
    [closeRenameModal, editor.assetController, intl],
  );

  // 重命名的预检
  const preCheck = useCallback(() => {
    // 名称为空
    if (newName.trim() === '') {
      Toast.info({
        content: intl.formatMessage({ id: 'fileNameEmptyWarn' }),
      });
      return false;
    }
    // 非法字符
    if (isInvalidFileName(newName)) {
      Toast.warning({
        content:
          intl.formatMessage({ id: 'containInvalidSymbol' }) +
          ` <>:"/\\|?*"${'`'}`,
      });
      return false;
    }
    // 后端接口没存这两个index文件，所以需要前端拦截下
    if (
      newName !== rawOldName &&
      editor.assetController.checkIsAssetNameDuplicate(
        newName,
        AssetType.JS_SCRIPT,
      )
    ) {
      Toast.error({
        content: intl.formatMessage({ id: 'fileExists' }),
      });
      setNameExited(true);
      return false;
    }
    return true;
  }, [editor.assetController, intl, newName, rawOldName]);

  /**
   * 非扩展地图 - 普通重命名
   */
  const onRenameInNormalMap = useCallback(() => {
    // 文件被取消共享/删除时
    if (!renameFile) {
      Toast.warning({
        content: intl.formatMessage({ id: 'fileAlreadyDelete' }),
      });
      closeRenameModal();
      return;
    }
    if (!preCheck()) {
      return;
    }
    // 重命名（含重名检测）
    const result = editor.codeEditorController.renameFile(
      renameFile.fileId,
      newNameWithExt,
    );
    if (result) {
      renameInProject(renameFile.name, newName);
    } else {
      Toast.info({ content: intl.formatMessage({ id: 'fileExists' }) });
      setNameExited(true);
      return;
    }
  }, [
    renameFile,
    preCheck,
    editor.codeEditorController,
    newNameWithExt,
    intl,
    closeRenameModal,
    renameInProject,
    newName,
  ]);

  /**
   * 扩展地图 - 普通重命名
   */
  const onRenameInExtraMap = useCallback(() => {
    // 文件被取消共享/删除时
    if (!renameFile) {
      Toast.warning({
        content: intl.formatMessage({ id: 'fileAlreadyDelete' }),
      });
      closeRenameModal();
      return;
    }
    if (!preCheck()) {
      return;
    }
    // 默认的重命名操作
    apis.createra
      .renameScriptUsingPost({
        id: renameFile.fileId,
        mapId: contentId,
        newName: newNameWithExt,
      })
      .then(() => {
        renameInProject(renameFile.name, newName);
      })
      .catch((err) => {
        switch (err.code) {
          case ShareScriptErrorCode.ScriptNameRepeat:
            // 脚本名称重复
            Toast.info({
              content: intl.formatMessage({ id: 'fileExists' }),
            });
            setNameExited(true);
            break;
          case ShareScriptErrorCode.ScriptNotExist:
            Toast.info({
              content: intl.formatMessage({ id: 'fileAlreadyDelete' }),
            });
            closeRenameModal();
            break;
          case ShareScriptErrorCode.ScriptLockedByAnotherMap:
            const lockedMapTitle =
              renameFile.lockedMapTitle.length > 10
                ? renameFile.lockedMapTitle.slice(0, 9).concat('...')
                : renameFile.lockedMapTitle;
            const tips = `${intl.formatMessage({
              id: 'fileLockedByOtherMapPrefix',
            })}${lockedMapTitle}${intl.formatMessage({
              id: 'fileLockedByOtherMapSuffix',
            })}`;
            Toast.info({ content: tips });
            break;
          case ShareScriptErrorCode.ScriptGlobalLockFailed:
          default:
            Toast.info({
              content: intl.formatMessage({ id: 'renameFail' }),
            });
            break;
        }
      });
  }, [
    closeRenameModal,
    contentId,
    intl,
    newName,
    newNameWithExt,
    preCheck,
    renameFile,
    renameInProject,
  ]);

  const onRenameInLocalMapGroup = useCallback(async () => {
    if (!renameFile || !preCheck()) return;
    try {
      await (apis.createra as any).updateLocalSharedScript(
        'rename',
        renameFile.fileId,
        newNameWithExt,
      );
      Toast.success({ content: intl.formatMessage({ id: 'renameSuccess' }) });
      closeRenameModal();
    } catch {
      Toast.info({ content: intl.formatMessage({ id: 'renameFail' }) });
    }
  }, [closeRenameModal, intl, newNameWithExt, preCheck, renameFile]);

  /**
   * 普通重命名
   */
  const onConfirmRename = useCallback(async () => {
    // 无修改
    if (newName === rawOldName) {
      closeRenameModal();
      return;
    }
    if (isLocalMapGroup && renameFile?.isShare) {
      onRenameInLocalMapGroup();
    } else if (!usesCloudGroupAPI) {
      onRenameInNormalMap();
    } else {
      onRenameInExtraMap();
    }
  }, [
    newName,
    rawOldName,
    closeRenameModal,
    onRenameInNormalMap,
    onRenameInExtraMap,
    onRenameInLocalMapGroup,
    isLocalMapGroup,
    renameFile?.isShare,
    usesCloudGroupAPI,
  ]);

  /**
   * 非扩展地图 - 恢复文件重命名（回收站）
   */
  const onRecoverInNormalMap = useCallback(() => {
    if (!renameOptions || !renameOptions.recoverInfo) {
      return;
    }
    if (!preCheck()) {
      return;
    }
    const { key, value } = renameOptions.recoverInfo;
    // 1. 资源存在性检测：如果资源不存在后续操作都无意义
    if (editor.assetController.getAssetIndexInTrashBin(key, value) === -1) {
      Toast.info({
        content: intl.formatMessage({
          id: 'scriptRecoverFail',
        }),
      });
      return;
    }
    // 2. 重名检测：范围是本图所有脚本
    if (
      newNameWithExt &&
      !editor.codeEditorController.getFileByName(newNameWithExt)
    ) {
      // 3. 将资源从 deleteAssets 转移到 projectAssets
      if (
        editor.assetController.recoverAssetFromTrashBin(
          key,
          value,
          newNameWithExt,
        )
      ) {
        // 4. 将恢复的脚本文件更新到 fileDictReplica（同步给本图其他客户端）
        editor.codeEditorController.recoverFile(
          newNameWithExt,
          value.hash,
          value.type === AssetType.CLIENT_JS_SCRIPT,
        );
        // 5. toast成功
        Toast.success({
          content: intl.formatMessage(
            { id: 'assets$$HasRecovered' },
            { filename: newNameWithExt },
          ),
        });
        closeRenameModal();
      } else {
        // 6. toast失败（资源不存在）
        Toast.info({
          content: intl.formatMessage({
            id: 'scriptRecoverFail',
          }),
        });
      }
    } else {
      // 7. 名称重复
      Toast.info({
        content: intl.formatMessage({
          id: 'scriptRecoverFail',
        }),
      });
      setNameExited(true);
      return;
    }
  }, [
    closeRenameModal,
    editor.assetController,
    editor.codeEditorController,
    intl,
    newNameWithExt,
    preCheck,
    renameOptions,
  ]);

  /**
   * 扩展地图 - 恢复文件重命名（回收站）
   */
  const onRecoverInExtraMap = useCallback(() => {
    if (!renameOptions || !renameOptions.recoverInfo) {
      return;
    }
    if (!preCheck()) {
      return;
    }
    const { key, value } = renameOptions.recoverInfo;
    const { type } = value;
    apis.createra
      .createScriptUsingPost({
        mapId: contentId,
        name: newNameWithExt,
        type:
          type === AssetType.JS_SCRIPT ? ScriptType.Server : ScriptType.Client,
      })
      .then((res) => {
        // 2. 将资源从 deleteAssets 转移到 projectAssets
        if (
          editor.assetController.recoverAssetFromTrashBin(
            key,
            value,
            newNameWithExt,
          )
        ) {
          editor.codeEditorController.addFileForce({
            fileId: res.id,
            name: res.name,
            hash: value.hash || '',
            isClient: res.type === ScriptType.Client,
          });
          // 3 toast成功
          Toast.success({
            content: intl.formatMessage(
              { id: 'assets$$HasRecovered' },
              { filename: newNameWithExt },
            ),
          });
          closeRenameModal();
        } else {
          // 4. toast失败（资源不存在）
          Toast.info({
            content: intl.formatMessage({
              id: 'scriptRecoverFail',
            }),
          });
        }
      })
      .catch((err) => {
        switch (err.code) {
          case ShareScriptErrorCode.ScriptNameRepeat:
            // 5. 名称重复
            Toast.info({
              content: intl.formatMessage({
                id: 'scriptRecoverFail',
              }),
            });
            setNameExited(true);
            break;
          case ShareScriptErrorCode.NotCombMap:
          case ShareScriptErrorCode.ScriptGlobalLockFailed:
          default:
            // 6. toast失败（其他情况）
            Toast.info({
              content: intl.formatMessage({
                id: 'scriptRecoverFail',
              }),
            });
            break;
        }
      });
  }, [
    closeRenameModal,
    contentId,
    editor.assetController,
    editor.codeEditorController,
    intl,
    newNameWithExt,
    preCheck,
    renameOptions,
  ]);

  /**
   * 恢复文件重命名（回收站）
   */
  const onConfirmRecover = useCallback(() => {
    if (!usesCloudGroupAPI) {
      onRecoverInNormalMap();
    } else {
      onRecoverInExtraMap();
    }
  }, [onRecoverInExtraMap, onRecoverInNormalMap, usesCloudGroupAPI]);

  const onConfirmShare = useCallback(async () => {
    if (!renameFile) {
      Toast.info({
        content: `${intl.formatMessage({
          id: 'fileAlreadyDelete',
        })}, ${intl.formatMessage({ id: 'shareScriptFail' })}`,
      });
      closeRenameModal();
      return;
    }

    // 同步isUploading
    const fileDictReplica = editor.codeEditorController.fileDictReplica;
    fileDictReplica.dispatch(
      [fileDictReplica.action().update(renameFile.fileId).isUploading(true)],
      false,
    );
    setShareLoading(true);

    if (!preCheck()) {
      // 同步isUploading
      fileDictReplica.dispatch(
        [fileDictReplica.action().update(renameFile.fileId).isUploading(false)],
        false,
      );
      setShareLoading(false);
      return;
    }

    // 检查名称是否可用（全图组范围内）
    let nameCheckRes: boolean = false;
    try {
      nameCheckRes = await apis.createra.checkNameScriptUsingGet({
        id: renameFile.fileId,
        mapId: contentId,
        newName: newNameWithExt,
        share: true,
      });
    } catch (err) {
      Toast.info({
        content: `${intl.formatMessage({
          id: 'fileAlreadyDelete',
        })}, ${intl.formatMessage({ id: 'shareScriptFail' })}`,
      });
      closeRenameModal();
      return;
    }

    if (!nameCheckRes) {
      // 脚本名称重复
      Toast.info({
        content: `${intl.formatMessage({
          id: 'fileExists',
        })}, ${intl.formatMessage({ id: 'shareScriptFail' })}`,
      });
      setNameExited(true);
      // 同步isUploading
      fileDictReplica.dispatch(
        [fileDictReplica.action().update(renameFile.fileId).isUploading(false)],
        false,
      );
      setShareLoading(false);
      return;
    }

    // 重命名
    apis.createra
      .renameScriptUsingPost({
        id: renameFile.fileId,
        mapId: contentId,
        newName: newNameWithExt,
      })
      .then(() => {
        editor.assetController.updateScriptNameInProject(
          renameFile.name,
          newName,
        );
        Toast.success({
          content: intl.formatMessage({ id: 'renameSuccess' }),
        });
      })
      .catch((err) => {
        switch (err.code) {
          case ShareScriptErrorCode.ScriptNameRepeat:
            // 脚本名称重复
            Toast.info({
              content: `${intl.formatMessage({
                id: 'fileExists',
              })}, ${intl.formatMessage({ id: 'shareScriptFail' })}`,
            });
            setNameExited(true);
            break;
          case ShareScriptErrorCode.ScriptNotExist:
            Toast.info({
              content: `${intl.formatMessage({
                id: 'fileAlreadyDelete',
              })}, ${intl.formatMessage({ id: 'shareScriptFail' })}`,
            });
            closeRenameModal();
            break;
          case ShareScriptErrorCode.ScriptLockedByAnotherMap:
            Toast.info({
              content: intl.formatMessage({ id: 'hasBeenShared' }),
            });
            break;
          case ShareScriptErrorCode.ScriptGlobalLockFailed:
          default:
            Toast.info({
              content: intl.formatMessage({ id: 'renameFail' }),
            });
            break;
        }
        // 同步isUploading
        fileDictReplica.dispatch(
          [
            fileDictReplica
              .action()
              .update(renameFile.fileId)
              .isUploading(false),
          ],
          false,
        );
        setShareLoading(false);
        return;
      });

    // 上传oss
    const fileBlob = new Blob([renameFile.text], { type: 'text/plain' });
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
      fileDictReplica.dispatch(
        [fileDictReplica.action().update(renameFile.fileId).isUploading(false)],
        false,
      );
      setShareLoading(false);
      return;
    }

    // 开启共享
    apis.createra
      .shareScriptUsingPost({
        hash,
        id: renameFile.fileId,
        mapId: contentId,
      })
      .then(() => {
        Toast.success({
          content: intl.formatMessage({ id: 'shareScriptSuccess' }),
        });
        // 从project.assets中移除
        editor.assetController.removeScriptFromProjectOnly(renameFile.name);
        fileDictReplica.dispatch(
          [
            fileDictReplica
              .action()
              .update(renameFile.fileId)
              .isUploading(false),
          ],
          false,
        );
        setShareLoading(false);
        dispatch(setRenameOptions(undefined));
      })
      .catch((errCode) => {
        switch (errCode.code) {
          case ShareScriptErrorCode.ScriptNotExist:
            Toast.info({
              content: `${intl.formatMessage({
                id: 'fileAlreadyDelete',
              })}, ${intl.formatMessage({ id: 'shareScriptFail' })}`,
            });
            closeRenameModal();
            break;
          case ShareScriptErrorCode.ScriptNameRepeat:
            Toast.info({
              content: `${intl.formatMessage({
                id: 'fileExists',
              })}, ${intl.formatMessage({ id: 'shareScriptFail' })}`,
            });
            setNameExited(true);
            break;
          case ShareScriptErrorCode.NotCombMap:
          case ShareScriptErrorCode.ScriptGlobalLockFailed:
          default:
            Toast.info({
              content: intl.formatMessage({ id: 'shareScriptFail' }),
            });
            break;
        }
        fileDictReplica.dispatch(
          [
            fileDictReplica
              .action()
              .update(renameFile.fileId)
              .isUploading(false),
          ],
          false,
        );
        setShareLoading(false);
      });
  }, [
    closeRenameModal,
    contentId,
    dispatch,
    editor.assetController,
    editor.codeEditorController.fileDictReplica,
    intl,
    newName,
    newNameWithExt,
    preCheck,
    renameFile,
  ]);

  const onConfirm = useCallback(() => {
    if (!renameOptions) {
      return;
    }
    if (renameOptions.recoverInfo) {
      onConfirmRecover();
    } else if (renameOptions.renameInfo) {
      onConfirmRename();
    } else {
      onConfirmShare();
    }
  }, [onConfirmRecover, onConfirmRename, onConfirmShare, renameOptions]);

  const renameTitle = useMemo(() => {
    if (!renameOptions) {
      return;
    }
    if (renameOptions.renameInfo) {
      return intl.formatMessage({ id: 'rename' });
    } else {
      return intl.formatMessage({ id: 'scriptNameExitedTitle' });
    }
  }, [intl, renameOptions]);

  const bottomTips = useMemo(() => {
    let tips = '';
    if (renameOptions?.renameInfo?.isShare || renameOptions?.shareInfo) {
      tips = intl.formatMessage({ id: 'renameShareFileTips' });
    } else {
      tips = intl.formatMessage({ id: 'renameLocalFileTips' });
    }
    return (
      <div className={style.bottomTips}>
        *
        <p className={`${nameExited && style.warn}`}>
          {nameExited
            ? intl.formatMessage({ id: 'renameBottomWarn' })
            : intl.formatMessage({ id: 'renameBottomTips' })}
        </p>
        {tips}
      </div>
    );
  }, [
    renameOptions?.renameInfo?.isShare,
    renameOptions?.shareInfo,
    nameExited,
    intl,
  ]);

  return (
    <>
      {isFocused && (
        <InputPause flags={InputPauseFlags.ALL} change={inputPauseChange} />
      )}
      {
        <ModalView
          width={448}
          type="default"
          buttonSort="rtl"
          title={renameTitle}
          confirmText={intl.formatMessage({ id: 'confirm' })}
          confirmLoading={shareLoading}
          cancelText={intl.formatMessage({ id: 'cancel' })}
          content={
            <div className={style.renameModal}>
              <Input
                size="middle"
                type="primary"
                valueType="string"
                value={newName}
                onChange={(value: string) => {
                  setNewName(value);
                  setNameExited(false);
                }}
                error={nameExited}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={intl.formatMessage({ id: 'rename' })}
              />
              {bottomTips}
            </div>
          }
          onConfirm={onConfirm}
          onCancel={closeRenameModal}
        />
      }
    </>
  );
};
