import { IntlShape } from 'react-intl';
import { Toast } from '@box/box-design/';
import { ShareScriptErrorCode } from '@box/apis';
import { FileState } from '@box/schema/code-editor/code-editor-common-state';
import { AssetType } from '@box/schema/project/project-rda';

import { editor } from 'src/client/edit/edit-client';
import { ensureFileInFileList, transformName } from './utils';
import { clientConfig } from 'src/config/client';
import { usesCloudMapGroupAPIs } from 'configs/client';
import { apis } from 'src/apis/local-api';

export function useCopyScript(options: { file?: FileState; intl: IntlShape }) {
  const { file, intl } = options;
  const { contentId } = clientConfig.mapInfo;
  const usesCloudGroupAPI = usesCloudMapGroupAPIs(clientConfig.mapInfo);

  const uploadScriptToOSS = async (file: FileState) => {
    const fileDictReplica = editor.codeEditorController.fileDictReplica;
    fileDictReplica.dispatch(
      [fileDictReplica.action().update(file.fileId).isUploading(true)],
      false,
    );
    const fileBlob = new Blob([file.text], { type: 'text/plain' });
    try {
      const hash = await apis.upload.fileUploadPost({
        file: fileBlob,
        type: 'script',
      });
      return {
        hash,
        size: fileBlob.size,
      };
    } finally {
      // 同步isUploading
      fileDictReplica.dispatch(
        [fileDictReplica.action().update(file.fileId).isUploading(false)],
        false,
      );
    }
  };

  // 普通地图复制
  const copyNormalScript = async (file: FileState) => {
    try {
      // 先保存
      const { hash, size } = await uploadScriptToOSS(file);
      // 文件存在则更新hash，不存在则新建
      editor.assetController.ensureScriptInProject({
        size,
        hash,
        name: file.name,
        type: file.isClient ? AssetType.CLIENT_JS_SCRIPT : AssetType.JS_SCRIPT,
      });
      requestAnimationFrame(() => {
        // copy
        const res = editor.assetController.duplicateScriptByName(
          transformName(file.name, false),
          file.isClient,
        );
        if (res) {
          Toast.success({
            content: intl.formatMessage({ id: 'copySuccess' }),
          });
        } else {
          Toast.info({
            content: intl.formatMessage({ id: 'copyFailed' }),
          });
        }
      });
    } catch (e) {
      Toast.info({
        content: intl.formatMessage({ id: 'copyFailed' }),
      });
    }
  };

  // 扩展地图复制
  const copyExternalScript = async (file: FileState) => {
    // 先保存
    const { hash, size } = await uploadScriptToOSS(file);
    // 本地文件保存
    // 共享文件已经有hash，复制的是最近一次提交的hash(点击复制时，会失焦，所以保存一次)
    if (!file.isShare) {
      // 文件存在则更新hash，不存在则新建
      editor.assetController.ensureScriptInProject({
        size,
        hash,
        name: file.name,
        type: file.isClient ? AssetType.CLIENT_JS_SCRIPT : AssetType.JS_SCRIPT,
      });
    }
    // 扩展地图走后端
    apis.createra
      .createScriptUsingPost({
        id: file.fileId,
        mapId: contentId,
      })
      .then((res) => {
        // 共享文件无需处理
        if (!res.share) {
          // 本地文件，复制后的文件加入assets中
          const originFile = editor.state.replica.project.assets[file.name];
          if (originFile) {
            editor.assetController.addScriptToProject(
              {
                name: res.name,
                hash: originFile.hash,
                type: file.isClient
                  ? AssetType.CLIENT_JS_SCRIPT
                  : AssetType.JS_SCRIPT,
                size: file.size,
              },
              0,
            );
          }

          editor.codeEditorController.addFileForce({
            fileId: res.id,
            name: res.name,
            hash: originFile?.hash || '',
            isClient: file.isClient,
          });
        }
        ensureFileInFileList(res.id).then(() => {
          editor.codeEditorController.selectFile(res.id);
          Toast.success({
            content: intl.formatMessage({ id: 'copySuccess' }),
          });
        });
      })
      .catch((err) => {
        switch (err.code) {
          case ShareScriptErrorCode.ScriptNotExist:
            Toast.info({
              content: intl.formatMessage({ id: 'fileAlreadyDelete' }),
            });
            break;
          case ShareScriptErrorCode.ScriptNameRepeat:
            Toast.info({
              content: intl.formatMessage({ id: 'fileExists' }),
            });
            break;
          case ShareScriptErrorCode.NotCombMap:
          case ShareScriptErrorCode.ScriptGlobalLockFailed:
          default:
            // 极小概率的情况"复制失败"
            Toast.info({
              content: intl.formatMessage({ id: 'copyFailed' }),
            });
            break;
        }
      });
  };

  return async () => {
    if (!file) {
      Toast.info({
        content: intl.formatMessage({ id: 'copyFailed' }),
      });
      return;
    }
    // 本地文件
    if (!usesCloudGroupAPI) {
      await copyNormalScript(file);
    } else {
      await copyExternalScript(file);
    }
  };
}
