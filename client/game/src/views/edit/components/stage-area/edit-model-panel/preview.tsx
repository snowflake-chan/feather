import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import * as uuid from 'uuid';
import { mat4, quat, vec3, vec4 } from 'gl-matrix';

import { Toast } from '@box/box-design';
import { EntitySeedRDA } from '@box/schema/project/project-rda';
import { MouseButton, MouseState } from '@box/schema/input/input-schema';
import { getMeshPath } from '@box/schema/project/hot-schema';
import { getProjectModelDisplayName } from './project-model-membership';
import { CopyEvent, ModelType, SourceType } from '@box/apis';
import { getModelMetaData } from '@box/voxa-project';

import { UI3DContainer } from 'src/views/edit/components/ui-3d';
import { UI3DVoxelEvent } from 'src/engine/ui3d/ui3d-schema';
import { RootState } from 'src/redux/edit';
import { MeshRenderable } from 'src/engine/mesh/renderable-schema';
import {
  getRenderableMesh,
  loadRenderableMesh,
} from 'src/engine/mesh/controller';
import { DEFAULT_SCALE } from 'src/defs/modelScale';
import { apis } from 'src/apis/local-api';
import { MouseLoading } from 'src/views/edit/components/basic/mouse-loading';
import { SeedView } from 'src/views/edit/components/ui-3d/seed';
import { setSelectedModel } from 'src/redux/edit/ui';
import { useEdit } from 'src/client/edit/edit-context';
import { ModelData } from '.';
import { clientConfig } from 'src/config/client';
import { StageAreaContext } from 'src/views/edit/components/stage-area/context';
import { EditActionLabel } from 'src/client/edit/replica/replica-client-schema';

import type { LoadingSeed } from '../seeds';
import {
  createProjectModelSeedReplacement,
  LocalProjectModelImportCache,
  placeLocalModelImmediately,
  type PlacementMeshInfo,
} from './local-model-placement';
import style from './index.module.scss';

type PreviewSeed = {
  model: mat4;
  mesh: MeshRenderable;
};

function getLocalMeshPath(modelName: string, modelId: number) {
  return getMeshPath(`${modelName}__local_${modelId}`);
}

enum CursorState {
  Crosshair,
  Unset,
}

type UI3DVoxelEventParam = {
  mouseButton: number;
  mouseState: number;
  worldPosition: vec3;
};

const mvBack = mat4.create();
const previewModel = mat4.create();

export default function Preview() {
  const [previewSeed, setPreviewSeed] = useState<PreviewSeed>();

  const selectedModel = useSelector(
    (state: RootState) => state.ui.selectedModel,
  );

  const { addLoadingSeed, removeLoadingSeed } = useContext(StageAreaContext);

  const targetModel = useMemo(() => {
    return selectedModel ? { ...selectedModel?.modelData } : undefined;
  }, [selectedModel]);

  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const isRunning = useSelector((state: RootState) => state.ui.isRunning);
  const prevHitRes = useRef<UI3DVoxelEventParam>({
    mouseButton: 0,
    mouseState: 0,
    worldPosition: [0, 0, 0],
  });

  const intl = useIntl();
  const dispatch = useDispatch();
  const editor = useEdit();
  const localModelImports = useRef(new LocalProjectModelImportCache());

  const setElementCursor = useCallback(
    (state: CursorState) => {
      const element = editor.game.state.dom.element;
      if (!element) {
        return;
      }
      element.classList.remove(`${style.crosshair}`);
      switch (state) {
        case CursorState.Crosshair:
          element.classList.add(`${style.crosshair}`);
          return;
        case CursorState.Unset:
        default:
          return;
      }
    },
    [editor],
  );

  const onTargetModelChange = useCallback(async () => {
    if (targetModel) {
      editor.gameUIEditor.setSelectedIds([]);
      setIsLoadingPreview(true);
      const glMesh = await loadRenderableMesh(
        editor.game.state,
        targetModel.modelFileHash,
      );
      setIsLoadingPreview(false);
      if (glMesh) {
        setElementCursor(CursorState.Crosshair);
      } else {
        Toast.error({
          content: intl.formatMessage({
            id: 'gameObject.unablePlaceModel',
          }),
          description: targetModel.name,
        });
        setElementCursor(CursorState.Unset);
      }
    } else {
      setPreviewSeed(undefined);
      setElementCursor(CursorState.Unset);
    }
  }, [editor, targetModel, setElementCursor, intl]);

  useEffect(() => {
    onTargetModelChange();
    return () => {
      setPreviewSeed(undefined);
      setElementCursor(CursorState.Unset);
    };
  }, [onTargetModelChange, setElementCursor]);

  const allocSeedFromModel = useCallback(
    (hitRes: UI3DVoxelEvent, modelHash: string) => {
      const mesh = getRenderableMesh(editor.game.state, modelHash);
      if (!mesh) {
        return;
      }
      const newSeed = EntitySeedRDA.stateSchema.alloc();
      newSeed.bounds[0] = mesh.hix - mesh.lox;
      newSeed.bounds[1] = mesh.hiy - mesh.loy;
      newSeed.bounds[2] = mesh.hiz - mesh.loz;
      vec3.set(newSeed.scale, DEFAULT_SCALE, DEFAULT_SCALE, DEFAULT_SCALE);

      /**
       * - 未放置时，模型的“左下角”和“指针与地块的触点”对齐
       * - 放置时，需要保持“视觉位置”一致，因此position受外观框尺寸和偏移量影响
       */
      vec3.scale(newSeed.position, newSeed.bounds, -0.5);
      vec3.add(newSeed.position, newSeed.position, mesh.renderBoxOffset);
      vec3.scale(newSeed.position, newSeed.position, DEFAULT_SCALE);
      vec3.sub(newSeed.position, hitRes.worldPosition, newSeed.position);

      vec4.set(newSeed.tint, 255, 255, 255, 255);
      quat.identity(newSeed.orientation);
      newSeed.editLock = false;
      return newSeed;
    },
    [editor.game.state],
  );

  const getMetaData = useCallback(
    async (modelFileHash: string) => {
      const modelBytes = await editor.game.state.content.retrieveFromS3(
        modelFileHash,
      );
      if (!modelBytes) {
        throw new Error(`error when retrieve hash ${modelFileHash} from S3`);
      }
      const metaData = getModelMetaData(modelFileHash, modelBytes);
      if (!metaData) {
        throw new Error('get model meta data error');
      }
      return metaData;
    },
    [editor.game.state],
  );

  const handleCopyAsProjectModel = useCallback(
    async (
      originModelId: number,
      sourceType: SourceType,
    ): Promise<{ model: ModelData; defaultMotionId: string }> => {
      const model: ModelData = {
        id: 0,
        name: '',
        modelPreviewUrl: '',
        modelFileHash: '',
        bounds: [0, 0, 0],
        animated: false,
        type: ModelType.Private,
        updateAt: '',
      };
      let defaultMotionId = '';
      try {
        const res = await apis.model.copyProjectSharedModelUsingPost({
          event: CopyEvent.PassiveCopy,
          mapId: clientConfig.mapInfo.contentId,
          originModelId,
          sourceType,
        });
        const metaData = await getMetaData(res.modelFileHash);
        model.id = res.modelId;
        /**
         * 重名和hash重复都由后端判断
         * 重名后端返回修改后的modelName
         * hash重复后端返回重复的模型的modelName
         */
        model.name = res.modelName;
        model.modelPreviewUrl = res.modelPreviewUrl;
        model.modelFileHash = res.modelFileHash;
        model.bounds[0] = metaData.bounds[0];
        model.bounds[1] = metaData.bounds[1];
        model.bounds[2] = metaData.bounds[2];

        model.type = ModelType.Project;
        model.animated = res.animated;

        if (metaData.motionList && metaData.motionList.length) {
          defaultMotionId = metaData.motionList[0].id;
        }
      } catch (e) {
        editor.logger.error(`error copying model: ${JSON.stringify(e)}`);
      }
      return {
        model,
        defaultMotionId,
      };
    },
    [getMetaData, editor.logger],
  );

  const getSeedMeshInfo = useCallback(
    async (model: ModelData) => {
      const formatName = model.meshPath || (clientConfig.isLocalGameServer
        ? getLocalMeshPath(model.name, model.id)
        : getMeshPath(model.name));
      const metaData = await getMetaData(model.modelFileHash);
      if (!formatName) {
        return;
      }
      const defaultMotionId =
        metaData.motionList && metaData.motionList.length
          ? metaData.motionList[0].id
          : '';
      return {
        modelId: model.id,
        formatName,
        defaultMotionId,
      };
    },
    [getMetaData],
  );

  /**
   * 更新“预览模型”，“模型的左下角”与“指针和地块交互点”对齐
   */
  const checkPreviewSeed = useCallback(
    (modelFileHash: string, hitRes: UI3DVoxelEvent) => {
      const gameState = editor.game.state;
      const mesh = getRenderableMesh(gameState, modelFileHash);
      if (!mesh) {
        return;
      }

      mat4.identity(mvBack);
      mat4.translate(mvBack, mvBack, hitRes.worldPosition);

      mat4.fromRotationTranslationScale(
        previewModel,
        quat.create(),
        [0, 0, 0],
        [DEFAULT_SCALE, DEFAULT_SCALE, DEFAULT_SCALE],
      );
      mat4.mul(previewModel, mvBack, previewModel);

      setPreviewSeed({
        mesh,
        model: previewModel,
      });
    },
    [editor.game.state],
  );

  // 在鼠标点击事件结束时调用, 也就是将 选择放置 的模型添加到 项目 的 assets 列表中
  const handleAddToProjectList = useCallback(
    async (model: ModelData) => {
      // 项目模型已添加到assets中，直接返回已有数据
      if (model.type === ModelType.Project) {
        return await getSeedMeshInfo(model);
      }

      const { model: res, defaultMotionId } = await handleCopyAsProjectModel(
        model.id,
        model.type === ModelType.Public
          ? SourceType.Release
          : SourceType.Snapshot,
      );

      if (!res.id) {
        return;
      }

      // The copy API returns a project-owned model. Keep its mesh path
      // independent from the VOXA local-library alias used for the immediate
      // preview/placement; the server stores this asset at mesh/<name>.vb.
      const newFormatName = getMeshPath(res.name);

      return {
        modelId: res.id,
        formatName: newFormatName,
        defaultMotionId,
      };
    },
    [getSeedMeshInfo, handleCopyAsProjectModel],
  );

  const updatePlacedSeedMesh = useCallback(
    (seedId: string, mesh: PlacementMeshInfo) => {
      const node = editor.seedController.getTreeNode(seedId);
      if (!node) return;
      const replacement = createProjectModelSeedReplacement(node, mesh);
      if (!replacement) return;
      // meshId is an RDA constant in Boxes. Replace the existing node with
      // the same id in one action so the constant is initialized correctly
      // without creating a second scene entity.
      editor.replica
        .projectTransaction()
        .push((action) => action.entitiesTree.add(replacement))
        .commit(EditActionLabel.PROJECT, false);
    },
    [editor],
  );

  const mouseUpListener = async (hitRes: UI3DVoxelEvent) => {
    if (!targetModel || !targetModel.modelFileHash || !previewSeed) {
      return;
    }
    const newSeed = allocSeedFromModel(hitRes, targetModel.modelFileHash);
    if (!newSeed) {
      return;
    }
    newSeed.name = editor.seedController.genNewName(
      getProjectModelDisplayName(targetModel.name),
    );
    const newSeedId = editor.seedController.genNodeId();

    if (clientConfig.isLocalGameServer) {
      const provisionalMesh: PlacementMeshInfo = {
        modelId: targetModel.id,
        formatName:
          targetModel.meshPath ||
          (targetModel.libraryScope === 'local'
            ? getLocalMeshPath(targetModel.name, targetModel.id)
            : getMeshPath(targetModel.name)),
        defaultMotionId: '',
      };
      newSeed.mesh = provisionalMesh.formatName;
      newSeed.meshId = provisionalMesh.modelId;

      const resolveProjectMesh = async () => {
        const resolve = async () => {
          const mesh = await handleAddToProjectList(targetModel);
          if (!mesh) throw new Error('project model import failed');
          return mesh;
        };
        if (targetModel.type === ModelType.Project) return await resolve();
        return await localModelImports.current.resolve(
          `${targetModel.id}:${targetModel.modelFileHash}`,
          resolve,
        );
      };

      void placeLocalModelImmediately({
        seedId: newSeedId,
        addSeed: () => editor.seedController.addSeed(newSeedId, newSeed),
        resolveProjectMesh,
        updateSeed: updatePlacedSeedMesh,
        removeSeed: (seedId) => {
          if (editor.seedController.getTreeNode(seedId)) {
            editor.seedController.removeTreeNodes([seedId]);
          }
        },
      })
        .then(() => editor.replica.updateExtraProject())
        .catch((error) => {
          editor.logger.error(`error placing local model: ${String(error)}`);
          Toast.error({
            content: intl.formatMessage({
              id: 'gameObject.modelPlaceFailed',
            }),
          });
        });
      return;
    }

    const { mesh, model } = previewSeed;
    const loadingSeed: LoadingSeed = {
      mesh,
      model: mat4.clone(model),
      position: vec3.clone(hitRes.worldPosition),
    };
    addLoadingSeed(loadingSeed);
    try {
      const newMeshInfo = await handleAddToProjectList(targetModel);
      removeLoadingSeed(loadingSeed);
      if (!newMeshInfo) {
        Toast.error({
          content: intl.formatMessage({
            id: 'gameObject.modelPlaceFailed',
          }),
        });
        return;
      }

      newSeed.mesh = newMeshInfo.formatName;
      newSeed.defaultMotionId = newMeshInfo.defaultMotionId;
      newSeed.meshId = newMeshInfo.modelId;
      editor.seedController.addSeed(newSeedId, newSeed);

      // 刷新项目模型列表
      editor.replica.updateExtraProject();
    } catch (err) {
      console.error(err);
      Toast.error({
        content: intl.formatMessage({
          id: 'gameObject.modelPlaceFailed',
        }),
      });
      removeLoadingSeed(loadingSeed);
    }
  };

  const renderPreviewSeed = useMemo(() => {
    if (isLoadingPreview) {
      return (
        <MouseLoading
          defaultX={selectedModel?.mousePosition.x}
          defaultY={selectedModel?.mousePosition.y}
        />
      );
    }
    if (previewSeed) {
      return (
        <SeedView
          seedId={uuid.v4()}
          lightmapId={-900201375}
          color={vec4.fromValues(1, 1, 1, 0.5)}
          model={previewSeed.model}
          glRef={previewSeed.mesh}
          position={prevHitRes.current.worldPosition}
          orientation={quat.create()}
          scale={vec3.fromValues(DEFAULT_SCALE, DEFAULT_SCALE, DEFAULT_SCALE)}
          bounds={vec3.fromValues(1, 1, 1)}
          metalness={0}
          shininess={0}
          emissive={0}
        />
      );
    }
    return;
  }, [isLoadingPreview, previewSeed, selectedModel]);

  if (isRunning) {
    return <></>;
  }
  return (
    <UI3DContainer
      ui3D={editor.game.state.ui3D}
      onVoxel={(hitRes) => {
        if (
          hitRes.mouseState === MouseState.release &&
          prevHitRes.current.mouseState === MouseState.press
        ) {
          switch (hitRes.mouseButton) {
            // 左键点击
            case MouseButton.left:
              mouseUpListener(hitRes);
              break;
            // 右键点击
            case MouseButton.right:
              dispatch(setSelectedModel(undefined));
              break;
          }
        }

        const shouldUpdatePreview =
          targetModel?.modelFileHash !== previewSeed?.mesh.hash ||
          !vec3.equals(prevHitRes.current.worldPosition, hitRes.worldPosition);

        if (
          hitRes.mouseState === MouseState.release &&
          targetModel?.modelFileHash &&
          shouldUpdatePreview
        ) {
          checkPreviewSeed(targetModel?.modelFileHash, hitRes);
        }

        prevHitRes.current.mouseState = hitRes.mouseState;
        prevHitRes.current.worldPosition = hitRes.worldPosition;
        prevHitRes.current.mouseButton = hitRes.mouseButton;
        return false;
      }}
    >
      {renderPreviewSeed}
    </UI3DContainer>
  );
}
