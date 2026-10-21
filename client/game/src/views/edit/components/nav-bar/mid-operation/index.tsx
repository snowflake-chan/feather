import { useMemo, useContext, useEffect, useState, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconEditUndo,
  IconEditRedo,
  IconSize,
  IconRotate2,
  IconCopy,
  IconDelete,
  IconFolderAdd,
  IconFolderSub,
  IconLock,
  IconUnlock,
} from '@box/icons';
import { EntitySeedRDA } from '@box/schema/project/project-rda';
import { TreeNodeType, ROOT_ID } from '@box/schema/project/murda-tree';
import { Toast, TooltipTrigger } from '@box/box-design/build';

import { RootState } from 'src/redux/edit';
import { useEdit } from 'src/client/edit/edit-context';
import { setSelectedTreeNodes } from 'src/redux/edit/seeds';
import { TransformType } from '../../transformHandler';
import { ArenaEditorUIContext } from 'src/views/edit/editor-ui-context';
import { LeftNavModeEnum } from '../../../defs';
import styles from './index.module.scss';
import { calc_class_name } from 'src/utils/classname';

type MidOperationProps = {
  transformType: TransformType;
  toggleTransformType: (type: TransformType) => void;
};
export const MidOperation = (props: MidOperationProps) => {
  const { transformType, toggleTransformType } = props;
  const editor = useEdit();
  const intl = useIntl();
  const dispatch = useDispatch();
  const isRunning = useSelector((state: RootState) => state.ui.isRunning);
  const navMode = useSelector((state: RootState) => state.creator.navMode);
  const { selectedTreeNodes, hasLockedSeedSelected, allSelectedSeeds } =
    useSelector((state: RootState) => {
      return {
        selectedTreeNodes: state.seeds.selectedTreeNodes,
        hasLockedSeedSelected: state.seeds.hasLockedSeedSelected,
        allSelectedSeeds: state.seeds.allSelectedSeeds,
      };
    });
  const permissions = useSelector((state: RootState) => state.permission);

  const { replica } = useContext(ArenaEditorUIContext);
  const fileDictReplica = editor.codeEditorController.fileDictReplica;
  const [canUndoScript, setCanUndoScript] = useState(fileDictReplica.canUndo());
  const [canRedoScript, setCanRedoScript] = useState(fileDictReplica.canRedo());

  const _handleSelectOperation = useCallback(
    (selectTransformType: TransformType) => {
      if (hasLockedSeedSelected) {
        return;
      }
      const nextTransformType =
        transformType === selectTransformType
          ? TransformType.Normal
          : selectTransformType;
      toggleTransformType(nextTransformType);
    },
    [hasLockedSeedSelected, toggleTransformType, transformType],
  );

  const handleRemoveSelectedTreeNodes = useCallback(() => {
    if (hasLockedSeedSelected) {
      return;
    }
    editor.seedController.removeTreeNodes(selectedTreeNodes);
    dispatch(setSelectedTreeNodes([]));
    Toast.info({
      content: intl.formatMessage({ id: 'hierarchy.removeEntityNotice' }),
    });
  }, [
    dispatch,
    editor.seedController,
    hasLockedSeedSelected,
    intl,
    selectedTreeNodes,
  ]);

  const handleCopySelectedTreeNodes = useCallback(() => {
    const newTreeNodes = editor.seedController.copyTreeNodes(selectedTreeNodes);
    dispatch(setSelectedTreeNodes(newTreeNodes));
  }, [dispatch, editor.seedController, selectedTreeNodes]);

  const handleTreeNodeOperate = useCallback(() => {
    if (selectedTreeNodes.length !== 1) {
      const newTreeNodeId = editor.seedController.genNodeId();
      editor.seedController.addTreeNode({
        id: newTreeNodeId,
        name: editor.seedController.genNewName(
          intl.formatMessage({ id: 'hierarchy.groupPrefix' }),
        ),
        parentId: ROOT_ID,
        childrenIds: [...selectedTreeNodes],
        value: EntitySeedRDA.stateSchema.alloc(),
      });
      dispatch(setSelectedTreeNodes([newTreeNodeId]));

      Toast.info({
        content: intl.formatMessage({ id: 'hierarchy.addTreeNodeNotice' }),
      });
      return;
    }
    editor.seedController.releaseTreeNode(
      // 解组
      selectedTreeNodes[0],
    );
    dispatch(setSelectedTreeNodes([]));
  }, [dispatch, editor.seedController, intl, selectedTreeNodes]);

  const treeNodeOperate = useMemo(() => {
    // 选中单个叶子节点时,不展示任何组操作
    if (
      selectedTreeNodes.length === 1 &&
      replica.project.entitiesTree[selectedTreeNodes[0]]?.type ===
        TreeNodeType.leaf
    ) {
      return;
    }
    // 打组、解组
    return (
      <TooltipTrigger
        text={
          selectedTreeNodes.length !== 1
            ? intl.formatMessage({ id: 'hierarchy.addTreeNode' })
            : intl.formatMessage({ id: 'hierarchy.releaseTreeNode' })
        }
        placement="bottom"
        align={{ offset: [0, 4] }}
      >
        <div className={styles.operation} onClick={handleTreeNodeOperate}>
          {selectedTreeNodes.length !== 1 ? (
            <IconFolderAdd />
          ) : (
            <IconFolderSub />
          )}
        </div>
      </TooltipTrigger>
    );
  }, [
    handleTreeNodeOperate,
    intl,
    replica.project.entitiesTree,
    selectedTreeNodes,
  ]);

  /** 为实体上锁 / 解锁*/
  const editLockOperate = useMemo(() => {
    if (allSelectedSeeds.length === 0) {
      return;
    }
    return (
      <>
        <span className={styles.divider} />
        <TooltipTrigger
          text={
            hasLockedSeedSelected
              ? intl.formatMessage({ id: 'hierarchy.unlock' })
              : intl.formatMessage({ id: 'hierarchy.lock' })
          }
          placement="bottom"
          align={{ offset: [0, 4] }}
        >
          <div
            className={styles.operation}
            onClick={() => {
              editor.seedController.setEditLock(
                allSelectedSeeds,
                !hasLockedSeedSelected,
              );
            }}
          >
            {hasLockedSeedSelected ? <IconUnlock /> : <IconLock />}
          </div>
        </TooltipTrigger>
      </>
    );
  }, [editor.seedController, hasLockedSeedSelected, intl, allSelectedSeeds]);

  useEffect(() => {
    // 监听脚本编辑器变化
    editor.listeners.codeEditor.sub(() => {
      setCanUndoScript(fileDictReplica.canUndo());
      setCanRedoScript(fileDictReplica.canRedo());
    });
    return () => {
      editor.listeners.codeEditor.unsubAll();
    };
  }, []);

  return (
    <div className={styles.midOperation}>
      <div className={styles.navOperation}>
        {permissions.editModel &&
          navMode !== LeftNavModeEnum.Script &&
          selectedTreeNodes.length > 0 &&
          !isRunning && (
            <div
              className={calc_class_name(
                styles.operationContainer,
                styles.operationFloat,
              )}
            >
              {treeNodeOperate}
              <TooltipTrigger
                text={intl.formatMessage({ id: 'scale' })}
                placement="bottom"
                align={{ offset: [0, 4] }}
              >
                <div
                  className={
                    hasLockedSeedSelected
                      ? styles.operationDisabled
                      : transformType === TransformType.Scale
                        ? styles.operationActive
                        : styles.operation
                  }
                  onClick={() => _handleSelectOperation(TransformType.Scale)}
                >
                  <IconSize />
                </div>
              </TooltipTrigger>
              <TooltipTrigger
                text={intl.formatMessage({ id: 'rotate' })}
                placement="bottom"
                align={{ offset: [0, 4] }}
              >
                <div
                  className={
                    hasLockedSeedSelected
                      ? styles.operationDisabled
                      : transformType === TransformType.Rotate
                        ? styles.operationActive
                        : styles.operation
                  }
                  onClick={() => _handleSelectOperation(TransformType.Rotate)}
                >
                  <IconRotate2 />
                </div>
              </TooltipTrigger>
              <TooltipTrigger
                text={intl.formatMessage({ id: 'copyAndPaste' })}
                placement="bottom"
                align={{ offset: [0, 4] }}
              >
                <div
                  className={styles.operation}
                  onClick={() => handleCopySelectedTreeNodes()}
                >
                  <IconCopy />
                </div>
              </TooltipTrigger>
              <TooltipTrigger
                text={intl.formatMessage({ id: 'delete' })}
                placement="bottom"
                align={{ offset: [0, 4] }}
              >
                <div
                  className={
                    hasLockedSeedSelected
                      ? styles.operationDisabled
                      : styles.operation
                  }
                  onClick={() => handleRemoveSelectedTreeNodes()}
                >
                  <IconDelete />
                </div>
              </TooltipTrigger>
              {editLockOperate}
            </div>
          )}
        {navMode === LeftNavModeEnum.Script
          ? permissions.editScripts && (
              /**
               * 【针对脚本编辑的撤销重做】展示规则与运行状态无关，与编辑模式有关。仅在脚本模式下展示。
               */
              <div className={styles.operationContainer}>
                <TooltipTrigger
                  text={intl.formatMessage({ id: 'undo' })}
                  placement="bottom"
                  align={{ offset: [0, 4] }}
                >
                  <div
                    className={
                      canUndoScript
                        ? styles.operation
                        : styles.operationDisabled
                    }
                    onClick={() =>
                      canUndoScript && editor.codeEditorController.undo()
                    }
                  >
                    <IconEditUndo />
                  </div>
                </TooltipTrigger>
                <TooltipTrigger
                  text={intl.formatMessage({ id: 'redo' })}
                  placement="bottom"
                  align={{ offset: [0, 4] }}
                >
                  <div
                    className={
                      canRedoScript
                        ? styles.operation
                        : styles.operationDisabled
                    }
                    onClick={() =>
                      canRedoScript && editor.codeEditorController.redo()
                    }
                  >
                    <IconEditRedo />
                  </div>
                </TooltipTrigger>
              </div>
            )
          : !isRunning &&
            (permissions.editModel ||
              permissions.editVoxels ||
              permissions.editScene) && (
              /**
               * 【针对地图搭建的撤销重做】展示规则与运行状态、搭建权限有关。仅在具有搭建权限并且非运行状态下展示。
               */
              <div className={styles.operationContainer}>
                <TooltipTrigger
                  text={intl.formatMessage({ id: 'undo' })}
                  placement="bottom"
                  align={{ offset: [0, 4] }}
                >
                  <div
                    className={
                      replica.undoHistory.length > 0
                        ? styles.operation
                        : styles.operationDisabled
                    }
                    onClick={() =>
                      replica.undoHistory.length > 0 && editor.replica.undo()
                    }
                  >
                    <IconEditUndo />
                  </div>
                </TooltipTrigger>
                <TooltipTrigger
                  text={intl.formatMessage({ id: 'redo' })}
                  placement="bottom"
                  align={{ offset: [0, 4] }}
                >
                  <div
                    className={
                      replica.redoHistory.length > 0
                        ? styles.operation
                        : styles.operationDisabled
                    }
                    onClick={() =>
                      replica.redoHistory.length > 0 && editor.replica.redo()
                    }
                  >
                    <IconEditRedo />
                  </div>
                </TooltipTrigger>
              </div>
            )}
      </div>
    </div>
  );
};
