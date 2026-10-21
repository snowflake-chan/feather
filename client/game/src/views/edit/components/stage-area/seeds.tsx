import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { vec3, mat4, vec4, quat } from 'gl-matrix';
import * as uuid from 'uuid';

import { UI3DContainer, UI3DQuad, UI3DText } from '../ui-3d';
import { UI3DVoxelEventSchema } from 'src/engine/ui3d/ui3d-schema';

import { useEdit } from 'src/client/edit/edit-context';
import {
  compute2Dinformation,
  isRectOverlap,
} from 'src/client/edit/2d-visiual/coordinate';
import { computeSeedData } from 'src/client/edit/seed/seed-helper';
import { MouseButton } from '@box/schema/input/input-schema';
import { TransformHandler, TransformType } from '../transformHandler';

import { touchable } from 'src/utils/mobile';

import { SeedView } from '../ui-3d/seed';
import { BoundBox } from '../ui-3d/boundbox';
import { seedsDataController } from './seedsData';

import { DEFAULT_SCALE } from 'src/defs/modelScale';
import { RootState, store } from 'src/redux/edit';
import { setExpandedId, setSelectedTreeNodes } from 'src/redux/edit/seeds';
import { CreateTabEnum, MouseRectType, LeftNavModeEnum } from '../../defs';
import { ArenaEditorUIContext } from '../../editor-ui-context';
import { StageAreaContext } from './context';
import { Renderable } from 'src/engine/mesh/renderable-schema';
import { TreeNodeType } from '@box/schema/project/murda-tree';
import { computeEntitySeedRenderBox } from '../transformHandler/util';

export type LoadingSeed = {
  mesh: Renderable;
  model: mat4;
  position: vec3;
};

type SeedsProps = {
  transformType: TransformType;
  mouseRectInfo: MouseRectType;
  setMouseRectInfo: (mouseRect: MouseRectType) => void;
};

// 实体的数据计算
export const Seeds3DContainer: React.FC<SeedsProps> = (props: SeedsProps) => {
  const editor = useEdit();
  const dispatch = useDispatch();
  const { replica } = useContext(ArenaEditorUIContext);
  const { selectedTreeNodes, hasLockedSeedSelected, allSelectedSeeds } =
    useSelector((state: RootState) => {
      return {
        selectedTreeNodes: state.seeds.selectedTreeNodes,
        hasLockedSeedSelected: state.seeds.hasLockedSeedSelected,
        allSelectedSeeds: state.seeds.allSelectedSeeds,
      };
    });
  const isSelectModel = useSelector(
    (state: RootState) => !!state.ui.selectedModel,
  );
  const isTerrainPenActive = useSelector(
    (state: RootState) => state.creator.isTerrainPenActive,
  );
  const permissions = useSelector((state: RootState) => state.permission);
  const isShowDebugLogPanel = useSelector(
    (state: RootState) => state.creator.isShowDebugLogPanel,
  );
  const createTab = useSelector((state: RootState) => state.creator.createTab);
  const navMode = useSelector((state: RootState) => state.creator.navMode);

  const hasPermission = useMemo(() => {
    const isCreatingModel = navMode === LeftNavModeEnum.Model && isSelectModel;
    const isCreatingTerrain =
      navMode === LeftNavModeEnum.Create &&
      createTab === CreateTabEnum.Terrain &&
      isTerrainPenActive;
    return (
      permissions.editProject &&
      permissions.editModel &&
      !isCreatingModel &&
      !isCreatingTerrain
    );
  }, [
    createTab,
    isSelectModel,
    isTerrainPenActive,
    navMode,
    permissions.editModel,
    permissions.editProject,
  ]);
  const entitiesTree = replica.project.entitiesTree;
  const {
    hitRes,
    hoverSeedIds,
    hoverSeedId,
    startLoadingAnimation,
    cancelLoadingAnimation,
    loadingAlpha,
  } = seedsDataController;
  // TODO: 增加entities的变化监听
  const { preparedSeeds, unVisitedSeeds } = seedsDataController.getSeedData(
    replica.project.entitiesTree,
  );

  const { loadingSeeds } = useContext(StageAreaContext);

  const setSelectedTreeNodesState = useCallback(
    (nodes: string[]) => {
      if (!hasPermission) {
        return;
      }
      dispatch(setSelectedTreeNodes(nodes));
    },
    [hasPermission, dispatch],
  );

  const _getSelectedTreeNodesBySeedId = useCallback(
    (id: string) => {
      if (allSelectedSeeds.indexOf(id) > -1) {
        return;
      }

      if (selectedTreeNodes.length > 1) {
        return [id];
      }

      const breadcrumbs = selectedTreeNodes.length
        ? editor.seedController.getBreadcrumbs(selectedTreeNodes[0])
        : undefined;
      const treeNodeId = editor.seedController.getRootTreeNodeId(
        id,
        breadcrumbs,
      );
      return [treeNodeId || id];
    },
    [allSelectedSeeds, selectedTreeNodes, editor.seedController],
  );

  const _onMouseUpSeedView = useCallback(
    (id: string) => {
      if (entitiesTree[id]?.value?.editLock) {
        return false;
      }
      const selectedTreeNodes = _getSelectedTreeNodesBySeedId(id);
      if (selectedTreeNodes) {
        seedsDataController.setHoverSeedIds([]);
        setSelectedTreeNodesState(selectedTreeNodes);
      }
      return false;
    },
    [_getSelectedTreeNodesBySeedId, entitiesTree, setSelectedTreeNodesState],
  );

  useEffect(() => {
    loadingSeeds.length ? startLoadingAnimation() : cancelLoadingAnimation();
    return cancelLoadingAnimation;
  }, [loadingSeeds, startLoadingAnimation, cancelLoadingAnimation]);

  /**
   * 双击hover中的节点时，穿透选中下一层级的元素
   */
  const onDoubleClick = useCallback(() => {
    if (!seedsDataController.hoverSeedId) {
      return;
    }

    const parentId = editor.seedController.getRootTreeNodeId(
      seedsDataController.hoverSeedId,
      store.getState().seeds.selectedTreeNodes,
    );
    if (!parentId) {
      return;
    }
    store.dispatch(setSelectedTreeNodes([parentId]));
    // 如果选中的是组元素，自动展开
    if (
      editor.state.replica.project.entitiesTree[parentId]?.type ===
      TreeNodeType.node
    ) {
      store.dispatch(setExpandedId({ id: parentId, isExpanded: true }));
    }
  }, [editor]);

  useEffect(() => {
    editor.game.input.unlockedDoubleClick.sub(onDoubleClick);
    return () => {
      editor.game.input.unlockedDoubleClick.unsub(onDoubleClick);
    };
  }, [editor, onDoubleClick]);

  const renderLoadingSeeds = useMemo(() => {
    if (!loadingSeeds.length) {
      return;
    }
    return loadingSeeds.map((seed) => {
      const id = uuid.v4();
      return (
        <SeedView
          key={id}
          seedId={id}
          lightmapId={-900201375}
          color={vec4.fromValues(1, 1, 1, loadingAlpha)}
          model={seed.model}
          glRef={seed.mesh}
          position={seed.position}
          orientation={quat.create()}
          scale={vec3.fromValues(DEFAULT_SCALE, DEFAULT_SCALE, DEFAULT_SCALE)}
          bounds={vec3.fromValues(1, 1, 1)}
          metalness={0}
          shininess={0}
          emissive={0}
        />
      );
    });
  }, [loadingAlpha, loadingSeeds]);

  const _renderVoxelCursor = () => {
    const { offsetX, offsetY, offsetZ, cursorTextPos, cursorPos } =
      seedsDataController.getVoxelCursorInfo();

    return (
      <div>
        <UI3DQuad
          position={cursorPos}
          color={vec3.fromValues(1, 0.7568627450980392, 0.027450980392156862)}
          normal={hitRes.hitNormal}
          opacity={0.7}
          radius={0.5}
          offset={vec3.fromValues(offsetX, offsetY, offsetZ)}
          screenSizeFixed={false}
        ></UI3DQuad>
        <UI3DText
          position={cursorTextPos}
          text={`<${cursorPos[0]}, ${cursorPos[1]}, ${cursorPos[2]}>`}
        ></UI3DText>
      </div>
    );
  };
  const { show, left, top, width, height } = props.mouseRectInfo;

  return (
    <UI3DContainer
      ui3D={editor.game.state.ui3D}
      onVoxel={(data) => {
        seedsDataController.setHitRes(
          UI3DVoxelEventSchema.assign(hitRes, data),
        );
        return false;
      }}
      onClick={() => {
        if (hoverSeedId === '') {
          setSelectedTreeNodesState([]);
        }
        return false;
      }}
      onDragStart={(ev) => {
        if (ev.mouseButton !== MouseButton.left || touchable) {
          return false;
        }
        props.setMouseRectInfo({
          show: true,
          width: 0,
          height: 0,
          left: ev.screenPosition[0],
          top: ev.screenPosition[1],
        });
        return false;
      }}
      onDrag={(ev) => {
        if (!props.mouseRectInfo.show) {
          return false;
        }
        props.setMouseRectInfo({
          show,
          left,
          top,
          width: ev.screenPosition[0] - left,
          height: ev.screenPosition[1] - top,
        });
        return false;
      }}
      onDragEnd={() => {
        if (!show) {
          return false;
        }
        const entitiesTree = replica.project.entitiesTree;
        const selectedTreeNodes: string[] = [];
        const mouseTop = height > 0 ? top : top + height;
        const mouseLeft = width > 0 ? left : left + width;
        const mouseRight = mouseLeft + Math.abs(width);
        const mouseBottom = mouseTop + Math.abs(height);
        const mouseRect = {
          top: mouseTop,
          left: mouseLeft,
          right: mouseRight,
          bottom: mouseBottom,
        };
        Object.keys(entitiesTree).forEach((id) => {
          const treeNode = entitiesTree[id];
          if (!treeNode || !treeNode.value || treeNode.value.editLock) {
            return;
          }
          const bounds2d = compute2Dinformation(
            treeNode.value,
            editor.game.state,
          );
          const isOverlap = isRectOverlap(mouseRect, {
            top: bounds2d.top,
            left: bounds2d.left,
            right: bounds2d.left + bounds2d.width,
            bottom: bounds2d.top + bounds2d.height,
          });
          if (isOverlap) {
            const treeNodeId = editor.seedController.getRootTreeNodeId(id);
            const newItem: string = treeNodeId || id;
            const index = selectedTreeNodes.indexOf(newItem);
            index < 0 && selectedTreeNodes.push(newItem);
          }
        });
        props.setMouseRectInfo({
          show: false,
          width: 0,
          height: 0,
          left: 0,
          top: 0,
        });
        setSelectedTreeNodesState(selectedTreeNodes);
        return false;
      }}
    >
      {preparedSeeds.map((id: string, _key: number) => {
        const entity = entitiesTree[id]?.value;
        if (!entity) {
          return '';
        }
        const fileName = entity.mesh;
        const asset = seedsDataController.getAssetByMesh(fileName);
        if (!asset) {
          return '';
        }
        const hash = asset.hash;

        if (hash === '') {
          const { position, dimension } = computeEntitySeedRenderBox(
            editor.game.state,
            entity,
          );
          return (
            <BoundBox
              key={_key}
              position={position}
              dimension={dimension}
              line={true}
              screenSizeFixed={false}
              color={vec3.fromValues(
                0.7647058823529411,
                0.9215686274509803,
                0.21568627450980393,
              )}
              opacity={0.1}
            />
          );
        }
        const rst = computeSeedData(
          editor.state,
          editor.game.state,
          id,
          hash,
          asset.type,
        );

        if (rst === null) {
          return '';
        }
        return (
          <SeedView
            key={_key}
            seedId={id}
            lightmapId={rst.lightmapId}
            color={rst.color}
            model={rst.model}
            glRef={rst.glRef}
            position={entity.position}
            orientation={entity.orientation}
            scale={entity.scale}
            bounds={entity.bounds}
            metalness={entity.metalness}
            shininess={entity.shininess}
            emissive={entity.emissive}
            defaultMotionId={entity.defaultMotionId}
            staticShadow={entity.staticShadow}
            onMouseUp={() => _onMouseUpSeedView(id)}
            onMouseIn={() => {
              if (!hasPermission || entity.editLock) {
                return;
              }
              seedsDataController.setHoverSeedId(id);
              const selectedTreeNodes = _getSelectedTreeNodesBySeedId(id);
              if (selectedTreeNodes) {
                seedsDataController.setHoverSeedIds([]);
                seedsDataController.parseTreeNodesSeeds(
                  selectedTreeNodes,
                  seedsDataController.hoverSeedIds,
                );
              }
            }}
            onMouseOut={() => {
              if (!hasPermission || entity.editLock) {
                return;
              }
              if (seedsDataController.hoverSeedId === id) {
                seedsDataController.setHoverSeedId('');
                seedsDataController.setHoverSeedIds([]);
              }
            }}
          />
        );
      })}
      {unVisitedSeeds.map((id: string, _key: number) => {
        const entity = entitiesTree[id]?.value;

        if (!entity) {
          return;
        }

        const { position, dimension } = computeEntitySeedRenderBox(
          editor.game.state,
          entity,
        );

        return (
          <BoundBox
            key={_key}
            position={position}
            dimension={dimension}
            line={true}
            screenSizeFixed={false}
            color={vec3.fromValues(1, 0.7568627450980392, 0.027450980392156862)}
            opacity={0.1}
            onMouseUp={() => _onMouseUpSeedView(id)}
          />
        );
      })}
      {hoverSeedIds.map((id, _key) => {
        const entity = entitiesTree[id]?.value;

        if (!entity) {
          return;
        }

        const { dimension, position } = computeEntitySeedRenderBox(
          editor.game.state,
          entity,
        );

        return (
          <BoundBox
            key={_key}
            position={position}
            dimension={dimension}
            line={true}
            screenSizeFixed={false}
            opacity={0}
            lineColor={vec3.fromValues(1, 1, 1)}
          />
        );
      })}
      {!!allSelectedSeeds.length && (
        <TransformHandler
          seedIds={allSelectedSeeds}
          editReplica={editor.replica}
          transformType={props.transformType}
        />
      )}
      {isShowDebugLogPanel ? _renderVoxelCursor() : ''}
      {renderLoadingSeeds}
    </UI3DContainer>
  );
};
