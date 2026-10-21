import {
  forwardRef,
  Ref,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import { Modal, ModalView, Toast } from '@box/box-design';
import {
  CopyEvent,
  ModelErrorCode,
  ModelType,
  REQUEST_TIMEOUT,
  SourceType,
} from '@box/apis';

import { RenameModal } from 'src/views/edit/components/rename-modal';
import { apis } from 'src/apis/local-api';
import { clientConfig, getConfig } from 'src/config/client';
import { EditType, setVoxaData } from 'src/redux/edit/creator';
import {
  ModelAction,
  type ModelData,
} from 'src/views/edit/components/stage-area/edit-model-panel/index';
import { useEdit } from 'src/client/edit/edit-context';
import { setSelectedModel } from 'src/redux/edit/ui';

import style from './index.module.scss';
import { RootState } from 'src/redux/edit';
import { projectModelSource } from './project-model-source';
import { shouldUseProjectModelAdapter } from './project-model-membership';

const LOCAL_LIBRARY_MODEL_PATH = /__local_\d+\.vb$/;

function usesEmbeddedProjectAdapter(model: ModelData) {
  return Boolean(
    clientConfig.isLocalGameServer &&
      model.meshPath &&
      (shouldUseProjectModelAdapter(model) ||
        !LOCAL_LIBRARY_MODEL_PATH.test(model.meshPath)),
  );
}

export type Actions = {
  [key in ModelAction]?: (model: ModelData) => void;
};

type Props = {
  scrollToTop?: () => void;
};

function ProjectModelActions(props: Props, ref: Ref<Actions>) {
  const { scrollToTop } = props;
  const editor = useEdit();
  const dispatch = useDispatch();
  const intl = useIntl();
  const selectedModel = useSelector((state: RootState) => {
    return state.ui.selectedModel;
  });
  const mapId = clientConfig.mapInfo.contentId;
  const [modelAlreadyDeleteModal, setModelAlreadyDeleteModal] =
    useState<boolean>(false);
  const [rename, setRename] = useState<
    | {
        model: ModelData;
        oldName: string;
        usesProjectAdapter: boolean;
      }
    | undefined
  >(undefined);
  const [renameErrorTip, setRenameErrorTip] = useState<string | undefined>();
  const editPendingRef = useRef(new Set<number>());

  const requestProjectModel = useCallback(
    async (body: Record<string, unknown>) => {
      const runtimeURL = getConfig().BACKEND_SERVER_URL.replace(/\/$/, '');
      const response = await fetch(`${runtimeURL}/api/project-models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => undefined);
        const error = new Error(
          result?.message ||
            intl.formatMessage({ id: 'projectModelOperationFailed' }),
        ) as Error & { code?: string };
        error.code = result?.code;
        throw error;
      }
      return await response.json();
    },
    [intl],
  );

  const handleEditModel = useCallback(
    async (model: ModelData) => {
      if (editPendingRef.current.has(model.id)) return;
      editPendingRef.current.add(model.id);
      try {
        if (usesEmbeddedProjectAdapter(model)) {
          const prepared = await requestProjectModel({
            action: 'prepareEdit',
            name: model.name,
            meshPath: model.meshPath,
          });
          dispatch(
            setVoxaData({
              isShow: true,
              modelId: Number(prepared.modelId),
              modelType: ModelType.Project,
              editType: EditType.Normal,
              projectModelName: model.name,
              projectModelPath: model.meshPath,
              saveToProject: true,
            }),
          );
          return;
        }
        // 打开voxa面板之前检测model是否存在
        const res = await apis.model.getModelDetailUsingGet(model.id, {
          timeout: REQUEST_TIMEOUT,
        });
        if (!res) {
          setModelAlreadyDeleteModal(true);
          return;
        }
        dispatch(
          setVoxaData({
            isShow: true,
            modelId: model.id,
            modelType: ModelType.Project,
            editType: EditType.Normal,
          }),
        );
      } catch (error) {
        if (usesEmbeddedProjectAdapter(model)) {
          Toast.error({
            content:
              (error as (Error & { code?: string }) | undefined)?.code ===
              'PROJECT_MODEL_SOURCE_MISSING'
                ? intl.formatMessage({ id: 'projectModelMissingEditableFile' })
                : error instanceof Error
                  ? error.message
                  : intl.formatMessage({ id: 'projectModelOpenFailed' }),
          });
          return;
        }
        setModelAlreadyDeleteModal(true);
      } finally {
        editPendingRef.current.delete(model.id);
      }
    },
    [dispatch, intl, requestProjectModel],
  );
  const handleRenameModel = useCallback(
    (model: ModelData) => {
      setRename({
        model,
        oldName: model.name,
        usesProjectAdapter: usesEmbeddedProjectAdapter(model),
      });
    },
    [],
  );
  const handleCopyModel = useCallback(
    async (model: ModelData) => {
      try {
        const res = await apis.model.copyProjectSharedModelUsingPost({
          mapId,
          originModelId: model.id,
          event: CopyEvent.ActiveCopy,
          sourceType: SourceType.Snapshot,
        });
        if (res) {
          editor.replica.updateExtraProject();
          Toast.success({ content: intl.formatMessage({ id: 'copySuccess' }) });
          scrollToTop && scrollToTop();
        }
      } catch (e) {
        switch (e.code) {
          case ModelErrorCode.ModelNotExisted:
            setModelAlreadyDeleteModal(true);
            break;
          default:
            Toast.error({
              content: intl.formatMessage({ id: 'copyFailed' }),
            });
            break;
        }
      }
    },
    [editor.replica, intl, mapId, scrollToTop],
  );

  const handleRemoveModel = useCallback(
    async (model: ModelData) => {
      const destroy = Modal.show({
        type: 'warning',
        width: 448,
        title: intl.formatMessage({ id: 'removeModel' }),
        content: intl.formatMessage({ id: 'removeProjectModelWarning' }),
        confirmText: intl.formatMessage({ id: 'remove' }),
        onConfirm: async () => {
          try {
            const usesProjectAdapter = usesEmbeddedProjectAdapter(model);
            const res = usesProjectAdapter
              ? await requestProjectModel({
                  action: 'delete',
                  name: model.name,
                  meshPath: model.meshPath,
                })
              : await apis.model.deleteProjectSharedModelUsingDelete(
                  {
                    mapId,
                    modelId: model.id,
                  },
                  {
                    timeout: REQUEST_TIMEOUT,
                  },
                );
            if (res) {
              Toast.success({
                content: intl.formatMessage({ id: 'deleteSuccess' }),
              });
              projectModelSource.notifyChanged(editor);
              if (selectedModel?.modelData.id === model.id) {
                dispatch(setSelectedModel(undefined));
              }
            }
          } catch (e) {
            switch (e.code) {
              case ModelErrorCode.ModelNotExisted:
                setModelAlreadyDeleteModal(true);
                break;
              default:
                Toast.error({
                  content: intl.formatMessage({ id: 'deleteFailed' }),
                });
                break;
            }
          }
          destroy();
        },

        cancelText: intl.formatMessage({ id: 'cancel' }),
        onCancel: () => {
          destroy();
        },
      });
    },
    [
      intl,
      mapId,
      editor,
      selectedModel,
      dispatch,
      requestProjectModel,
    ],
  );

  const onConfirmModal = useCallback(() => {
    projectModelSource.notifyChanged(editor);
    setModelAlreadyDeleteModal(false);
  }, [editor]);

  const handleCancelRename = useCallback(() => {
    setRename(undefined);
  }, []);

  const handleRename = useCallback(
    async (_modelId: number, newName: string) => {
      if (!rename) return false;
      if (rename.usesProjectAdapter) {
        return await requestProjectModel({
          action: 'rename',
          name: rename.oldName,
          meshPath: rename.model.meshPath,
          newName,
        });
      }
      return await apis.model.renameProjectSharedModelUsingPut(
        {
          mapId: clientConfig.mapInfo.contentId,
          modelId: rename.model.id,
          modelName: newName,
        },
        {
          timeout: REQUEST_TIMEOUT,
        },
      );
    },
    [rename, requestProjectModel],
  );

  const handleRenameSuccess = useCallback(() => {
    projectModelSource.notifyChanged(editor);
    setRename(undefined);
  }, [editor]);

  const handleRenameError = useCallback(
    (errorCode: number) => {
      switch (errorCode) {
        case ModelErrorCode.NameExisted:
          setRenameErrorTip(intl.formatMessage({ id: 'nameExit' }));
          break;
        case ModelErrorCode.ModelNotExisted:
          setModelAlreadyDeleteModal(true);
          setRename(undefined);
          break;
        default:
          Toast.error({
            content: intl.formatMessage({ id: 'renameFail' }),
          });
          break;
      }
    },
    [intl],
  );

  useImperativeHandle(ref, () => ({
    [ModelAction.Edit]: handleEditModel,
    [ModelAction.Rename]: handleRenameModel,
    [ModelAction.Copy]: handleCopyModel,
    [ModelAction.Remove]: handleRemoveModel,
  }));

  return (
    <>
      {rename && (
        <RenameModal
          id={rename.model.id}
          oldName={rename.oldName}
          onRename={handleRename}
          onSuccess={handleRenameSuccess}
          onError={handleRenameError}
          renameErrorTip={renameErrorTip}
          onFocus={() => setRenameErrorTip(undefined)}
          onCancel={handleCancelRename}
        />
      )}
      {modelAlreadyDeleteModal && (
        <ModalView
          rootClassName={style.modelAlreadyDeleteModal}
          type="default"
          width={332}
          title={intl.formatMessage({
            id: 'modelAlreadyDelete',
          })}
          confirmText={intl.formatMessage({
            id: 'iGotIt',
          })}
          onConfirm={onConfirmModal}
        />
      )}
    </>
  );
}

export default forwardRef<Actions, Props>(ProjectModelActions);
