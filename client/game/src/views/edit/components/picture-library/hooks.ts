import { useCallback } from 'react';
import { IntlShape } from 'react-intl';
import { Dispatch } from '@reduxjs/toolkit';

import { Modal, Toast } from '@box/box-design';

import {
  IMAGE_EXTS_WITHOUT_DOT,
  IMAGE_MIMES,
  MAX_PICTURE_FILE_SIZE,
} from '../fileSystemPanel/defs';
import { setCenterPanel } from 'src/redux/edit/creator';
import { CenterPanelEnum } from '../../defs';
import { ImageResource } from 'src/engine/resource/schema';
import { AssetController } from 'src/client/edit/state-controller/asset-controller';
import { EditContentStorage } from 'src/client/edit/content';
import { isInvalidFileName } from '../script-manager/utils';
import { AssetType } from '@box/schema/project/project-rda';
import { assetConflict } from 'src/client/edit/state-controller/asset-controller';

type UploadPictureSpec = {
  onConfirm?: () => void;
  onSuccess?: (imageName: string) => void;
};

export function useUploadPicture(options: {
  intl: IntlShape;
  editContentStorage: EditContentStorage;
  assetController: AssetController;
  dispatch: Dispatch;
}) {
  const { intl, editContentStorage, dispatch, assetController } = options;
  return useCallback(
    (spec: UploadPictureSpec) => {
      const { onConfirm, onSuccess } = spec;
      const input = createUploadInputElement(async (file) => {
        const { type, size, name } = file;
        if (
          !type.includes('image/') ||
          !IMAGE_EXTS_WITHOUT_DOT.find((ext) => type.includes(ext))
        ) {
          Toast.error({
            content: intl.formatMessage({ id: 'uploadFormatError' }),
          });
          return;
        }

        if (isInvalidFileName(name)) {
          Toast.error({
            content: intl.formatMessage({ id: 'uploadInvalidTip' }),
          });
          return;
        }

        if (size > MAX_PICTURE_FILE_SIZE) {
          const destroy = Modal.show({
            title: intl.formatMessage({
              id: 'uploadPictureSizeErrorTitle',
            }),
            content: intl.formatMessage({
              id: 'uploadPictureSizeErrorContent',
            }),
            confirmText: intl.formatMessage({
              id: 'uploadPictureReselect',
            }),
            cancelText: intl.formatMessage({
              id: 'cancel',
            }),
            onConfirm: () => {
              dispatch(setCenterPanel(CenterPanelEnum.FileSystem));

              destroy();
              onConfirm?.();
            },
            onCancel: () => {
              destroy();
            },
          });

          return;
        }

        Toast.loading({
          content: intl.formatMessage({
            id: 'uploading',
          }),
          duration: 0,
        });

        let width: number;
        let height: number;

        // 读取一下文件，获取尺寸信息
        try {
          const img = document.createElement('img');
          const blob = new Blob([file]);
          const url = URL.createObjectURL(blob);

          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;

            img.src = url;
          });

          width = img.width;
          height = img.height;
        } catch (err) {
          console.error('Failed to load img', err);

          Toast.destroyAll();

          // 加载不出来，也视作格式错误
          Toast.error({
            content: intl.formatMessage({ id: 'uploadFailed' }),
          });
          return;
        }

        let metadata: ImageResource;
        let hash: string;

        try {
          const result = await editContentStorage.storeImage({
            file,
            width,
            height,
          });

          metadata = result.imageResource;
          hash = result.hash;
        } catch (err) {
          console.error('Failed to upload img', err);
          Toast.destroyAll();
          Toast.error({
            content: intl.formatMessage({ id: 'uploadFailed' }),
          });

          return;
        }

        // 检查冲突
        const result = assetController.checkAssetConflict({
          name: file.name,
          hash,
          assetType: AssetType.PICTURE,
        });
        let fileName = file.name;
        let success = false;

        if (result.conflict !== assetConflict.hashRepeat) {
          if (result.conflict === assetConflict.namingDuplicate) {
            fileName = assetController.genNewName(
              fileName,
              AssetType.PICTURE,
              true,
            );
          }

          success = await assetController.addPictureToProject({
            name: fileName,
            hash,
            // 当前没有另外生成预览图，直接用图片本体做预览
            previewImage: metadata.hash,
            size: file.size,
          });
        } else {
          // hash相同时，名称可能不同, 应使用已存在hash的图片名称(已格式化过)
          success = true;
        }

        Toast.destroyAll();
        const formatName = assetController.formatName(
          fileName,
          AssetType.PICTURE,
        );
        if (success && formatName) {
          onSuccess?.(formatName);
          Toast.success({
            content: intl.formatMessage({ id: 'uploadSuccess' }),
          });
        } else {
          Toast.error({
            content: intl.formatMessage({ id: 'uploadFailed' }),
          });
        }
      });
      input.click();
    },
    [assetController, dispatch, editContentStorage, intl],
  );
}

let inputCache: HTMLInputElement | undefined;
/**
 * 把创建的input缓存起来。
 * - 避免在组件中执行方法结束后，input被销毁，导致change事件没触发。
 * - 也不能放到document.body上再在change中remove，因为change不一定会被触发（用户点取消关闭弹窗）。
 */
export function createUploadInputElement(onChange: (file: File) => void) {
  if (!inputCache) {
    inputCache = document.createElement('input');
    document.body.appendChild(inputCache);

    inputCache.style.display = 'none';
    inputCache.type = 'file';
    inputCache.accept = IMAGE_MIMES.join(',');
    inputCache.multiple = false;

    inputCache.addEventListener('change', async () => {
      if (!inputCache || !inputCache.files) {
        return;
      }

      const [file] = inputCache.files;

      if (!file) {
        return;
      }

      onChange(file);

      // 在这里清理掉，避免重新选择相同的文件时，不会再次触发'change'。
      document.body.removeChild(inputCache);
      inputCache = undefined;
    });
    inputCache.addEventListener('cancel', async () => {
      if (inputCache) {
        document.body.removeChild(inputCache);
        inputCache = undefined;
      }
    });
  }

  return inputCache;
}
