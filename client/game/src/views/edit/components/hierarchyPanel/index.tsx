import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import {
  TooltipTrigger,
  TreeNodeType,
  TooltipTriggerOptions,
  DropTarget,
  DropType,
  Tree,
  TreeHandle,
  TreeNode,
  ItemId,
  Checkbox,
  Button,
} from '@box/box-design';
import { InputPauseFlags } from '@box/schema/input/input-schema';
import { InputPause, useInputPause } from 'src/views/components/input-lock';
import { IconDropUp, IconObject, IconGround, IconLock } from '@box/icons';

import {
  TreeNodeType as MuRDATreeNodeType,
  ROOT_ID,
} from '@box/schema/project/murda-tree';
import {
  EntitySeedRDA,
  TreeNodes as EntityTreeNodes,
  TreeNode as EntityTreeNode,
  EntitiesTreeRDA,
} from '@box/schema/project/project-rda';
import { Toast } from '@box/box-design';

import {
  setExpandedIds,
  setSelectedTreeNodes,
  setRenamingNodeId,
} from 'src/redux/edit/seeds';
import { RootState } from 'src/redux/edit';
import { useEdit } from 'src/client/edit/edit-context';
import { ArenaEditorUIContext } from '../../editor-ui-context';

import {
  parseTree,
  isValidName,
  parseSearchedData,
  getTopSelectedId,
  getBreadcrumbs,
} from '../tree/util';
import style from './index.module.scss';
import { Modal } from 'src/views/components/edit/modal';
import { setNavMode } from 'src/redux/edit/creator';
import { LeftNavModeEnum } from '../../defs';
import type { SerializedVec2 } from 'src/engine/interfaces';
import { ContextMenu, ContextmenuData } from '../context-menu';
import { seedsDataController } from '../stage-area/seedsData';
import { Search } from '../search';

type Props = {
  searchKey?: string;
  isSearching: boolean;
  setSearchKey: (key: string) => void;
  isSettingStaticModel: boolean;
  currStaticShadow: { [nodeId: string]: StaticShadowState };
  setCurrStaticShadow: (value: { [nodeId: string]: StaticShadowState }) => void;
  onConfirmStaticShadow: () => void;
  onCancelStaticShadow: () => void;
};

enum Pointer {
  None,
  Dragging,
  NotAllowed,
}

enum ContextMenuId {
  Rename = 'rename',
  Copy = 'copy',
  Remove = 'remove',
  ReleaseTreeNode = 'hierarchy.releaseTreeNode',
  AddTreeNode = 'hierarchy.addTreeNode',
  Lock = 'hierarchy.lock',
  Unlock = 'hierarchy.unlock',
}

export enum StaticShadowState {
  False = 0,
  True,
  Mix,
  None,
}

export function HierarchyPanel(props: Props) {
  const {
    searchKey,
    isSearching,
    setSearchKey,
    isSettingStaticModel,
    currStaticShadow,
    setCurrStaticShadow,
    onCancelStaticShadow,
    onConfirmStaticShadow,
  } = props;
  const intl = useIntl();
  const editor = useEdit();
  const dispatch = useDispatch();
  const {
    selectedTreeNodes,
    gameUIActive,
    expandedIds,
    renamingNodeId,
    hasLockedSeedSelected,
    allSelectedSeeds,
  } = useSelector((state: RootState) => {
    return {
      selectedTreeNodes: state.seeds.selectedTreeNodes,
      expandedIds: state.seeds.expandedIds,
      gameUIActive: state.gameUI.selectedIds.length > 0,
      renamingNodeId: state.seeds.renamingNodeId,
      hasLockedSeedSelected: state.seeds.hasLockedSeedSelected,
      allSelectedSeeds: state.seeds.allSelectedSeeds,
    };
  });
  const { replica } = useContext(ArenaEditorUIContext);
  const [modalData, setModalData] = useState<{
    visible: boolean;
    removeTreeNodes: string[];
    seedLength: number;
  }>({ visible: false, removeTreeNodes: [], seedLength: 0 });
  const { gameUIEditor } = useEdit();
  const { inputPauseChange } = useInputPause();
  const [isInputPause, setIsInputPause] = useState<boolean>(false);
  const [searchExpandedIds, setSearchedExpandedIds] = useState<string[]>([]);
  const currExpanded = searchKey ? searchExpandedIds : expandedIds;
  const setCurrExpandedIds = useCallback(
    (ids: string[]) => {
      return searchKey
        ? setSearchedExpandedIds(ids)
        : dispatch(setExpandedIds(ids));
    },
    [dispatch, searchKey],
  );

  const treeRef = useRef<TreeHandle>(null);

  // 全选按钮状态
  const [staticShadowSelectAllState, setStaticShadowSelectAllState] =
    useState<StaticShadowState>(StaticShadowState.False);

  // 当前静态实体/实体状态发生变化时，更新全选状态
  useEffect(() => {
    if (!isSettingStaticModel) {
      return;
    }

    let selectAll = StaticShadowState.None;
    const { entitiesTree } = replica.project;
    for (const id in entitiesTree) {
      const node = entitiesTree[id];
      // 实体组状态不记录
      if (!node.value) {
        continue;
      }
      const state = currStaticShadow[id] || StaticShadowState.False;
      switch (selectAll) {
        case StaticShadowState.None:
          selectAll = state;
          break;
        case StaticShadowState.False:
        case StaticShadowState.True:
          if (state !== selectAll) {
            setStaticShadowSelectAllState(StaticShadowState.Mix);
            return;
          }
      }
    }

    setStaticShadowSelectAllState(selectAll);
  }, [currStaticShadow, isSettingStaticModel, replica]);

  // 当前replica新增实体数据时，需要新增currStaticShadow的数据
  useEffect(() => {
    if (!isSettingStaticModel) {
      return;
    }

    let needUpdateCurrStaticShadow = false;

    const { entitiesTree } = replica.project;
    for (const id in entitiesTree) {
      const node = entitiesTree[id];
      if (!node.value) {
        continue;
      }

      // currStaticShadow新增数据
      if (currStaticShadow[id] === undefined) {
        needUpdateCurrStaticShadow = true;
        currStaticShadow[id] = StaticShadowState.False;
      }
    }

    if (needUpdateCurrStaticShadow) {
      setCurrStaticShadow({ ...currStaticShadow });
    }
  }, [currStaticShadow, isSettingStaticModel, replica, setCurrStaticShadow]);

  const parseGroupStaticShadowState = useCallback(
    (entitiesTree: EntityTreeNodes, nodeId: string) => {
      const node = entitiesTree[nodeId];
      if (node.value) {
        return currStaticShadow[nodeId] || StaticShadowState.False;
      }
      const childrenIds = node.childrenIds.slice();
      let state: StaticShadowState = StaticShadowState.None;

      while (childrenIds.length) {
        const id = childrenIds.shift();
        if (!id) {
          break;
        }

        const child = entitiesTree[id];
        if (!child) {
          continue;
        }

        if (!child.value) {
          childrenIds.push(...child.childrenIds);
          continue;
        }

        const currState = currStaticShadow[child.id] || StaticShadowState.False;
        if (state === StaticShadowState.None) {
          state = currState;
          continue;
        }

        if (state !== currState) {
          return StaticShadowState.Mix;
        }
      }

      return state;
    },
    [currStaticShadow],
  );

  const getNodePrefixValue = useCallback(
    (
      entitiesTree: EntityTreeNodes,
      nodeId: string,
      parentStaticShadowState?: StaticShadowState,
    ) => {
      if (!isSettingStaticModel) {
        return;
      }
      const node = entitiesTree[nodeId];
      if (!node) {
        return StaticShadowState.None;
      }

      if (node.value) {
        return currStaticShadow[node.id] || StaticShadowState.False;
      }

      if (parentStaticShadowState === StaticShadowState.None) {
        return parentStaticShadowState;
      }

      if (
        parentStaticShadowState === StaticShadowState.False ||
        parentStaticShadowState === StaticShadowState.True
      ) {
        return seedsDataController.checkNodeHasSeed(node.id)
          ? parentStaticShadowState
          : StaticShadowState.None;
      }

      return parseGroupStaticShadowState(entitiesTree, nodeId);
    },
    [currStaticShadow, isSettingStaticModel, parseGroupStaticShadowState],
  );

  const multiChangeStaticShadow = useCallback(
    (nodeId: string, value: boolean, mixed: boolean) => {
      const childrenIds = seedsDataController.parseTreeNodesSeeds([nodeId], []);
      const setState =
        mixed || !value ? StaticShadowState.False : StaticShadowState.True;
      childrenIds.forEach((id) => {
        currStaticShadow[id] = setState;
      });
      setCurrStaticShadow({ ...currStaticShadow });
    },
    [currStaticShadow, setCurrStaticShadow],
  );

  const getPrefixIcon = useCallback(
    (node: EntityTreeNode, prefixVale?: StaticShadowState) => {
      // prefix为undefined时，意味着isSettingStaticModel为false，没有在编辑静态实体的状态
      // icon直接返回undefined
      if (prefixVale === undefined) {
        return;
      }
      switch (prefixVale) {
        case StaticShadowState.None:
          return <span style={{ width: 22 }} />;
        default:
          return (
            <Checkbox
              size={'small'}
              value={!!prefixVale}
              mixed={prefixVale === StaticShadowState.Mix}
              onChange={(value, mixed) => {
                if (!node.value) {
                  multiChangeStaticShadow(node.id, value, mixed);
                  return;
                }
                currStaticShadow[node.id] = value
                  ? StaticShadowState.True
                  : StaticShadowState.False;
                setCurrStaticShadow({ ...currStaticShadow });
              }}
            />
          );
      }
    },
    [currStaticShadow, multiChangeStaticShadow, setCurrStaticShadow],
  );

  const getTreeNodeList = useCallback(
    (
      entitiesTree: EntityTreeNodes,
      nodeIds: string[],
      isParentLocked?: boolean,
      parentStaticShadowState?: StaticShadowState,
    ) => {
      const tree: TreeNode[] = [];

      nodeIds.forEach((nodeId) => {
        const node = entitiesTree[nodeId];
        if (!node) {
          return;
        }

        let suffixIcon = node.value?.editLock ? <IconLock /> : undefined;
        let isCurrGroupLocked = false;
        if (node.type === MuRDATreeNodeType.node) {
          if (isParentLocked) {
            isCurrGroupLocked = seedsDataController.checkNodeHasSeed(node.id);
          } else {
            isCurrGroupLocked = seedsDataController.parseNodeLockState(node.id);
          }
          suffixIcon = isCurrGroupLocked ? <IconLock /> : undefined;
        }

        const prefixVale = getNodePrefixValue(
          entitiesTree,
          nodeId,
          parentStaticShadowState,
        );

        const struct: TreeNode = {
          id: node.id,
          name: node.name,
          type: TreeNodeType.Basic,
          icon:
            node.type === MuRDATreeNodeType.leaf ? (
              <IconObject />
            ) : (
              <IconGround />
            ),
          suffixIcon,
          prefixIcon: getPrefixIcon(node, prefixVale),
        };

        if (node.type !== MuRDATreeNodeType.leaf) {
          struct.children = getTreeNodeList(
            entitiesTree,
            node.childrenIds,
            isCurrGroupLocked,
            prefixVale,
          );
        }

        tree.push(struct);
      });

      return tree;
    },
    [getNodePrefixValue, getPrefixIcon],
  );

  const treeData = useMemo(() => {
    if (searchKey) {
      const searched = EntitiesTreeRDA.stateSchema.clone(
        EntitiesTreeRDA.stateSchema.identity,
      );
      parseSearchedData(
        searched,
        EntitiesTreeRDA,
        replica.project.entitiesTree,
        searchKey,
      );
      const treeData = getTreeNodeList(searched, searched[ROOT_ID].childrenIds);
      setSearchedExpandedIds(Object.keys(searched));
      EntitiesTreeRDA.stateSchema.free(searched);
      return treeData;
    }

    setSearchedExpandedIds([]);
    return getTreeNodeList(
      replica.project.entitiesTree,
      replica.project.entitiesTree[ROOT_ID].childrenIds,
    );
  }, [getTreeNodeList, replica.project.entitiesTree, searchKey]);

  const [pointer, setPointer] = useState(Pointer.None);
  const [className, setClassName] = useState(style.list);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useEffect(() => {
    let pointerStyle = '';
    switch (pointer) {
      case Pointer.Dragging:
        pointerStyle = style.draggingCursor;
        break;
      case Pointer.NotAllowed:
        pointerStyle = style.notAllowedCursor;
        break;
    }
    setClassName([style.list, pointerStyle].join(' '));
    setTooltipVisible(pointer === Pointer.NotAllowed);
  }, [pointer]);

  const onDragStart = useCallback(() => {
    setPointer(Pointer.Dragging);
  }, []);

  const onDragOver = useCallback(
    (target?: DropTarget) => {
      if (!target) {
        return;
      }
      let realTarget = replica.project.entitiesTree[target.dropId];
      for (let i = 0; i > target.levelOffset; i--) {
        if (!realTarget) {
          return;
        }

        const parentId = replica.project.entitiesTree[realTarget.id]?.parentId;
        if (!parentId) {
          break;
        }
        realTarget = replica.project.entitiesTree[parentId];
      }
      const breadcrumbs = getBreadcrumbs(
        replica.project.entitiesTree,
        realTarget.id,
      );

      setPointer(
        selectedTreeNodes.find((id) => breadcrumbs.includes(id))
          ? Pointer.NotAllowed
          : Pointer.Dragging,
      );
      return target;
    },
    [replica.project.entitiesTree, selectedTreeNodes],
  );

  const onDragEnd = useCallback(
    (targetId?: string, dropType?: DropType) => {
      setPointer(Pointer.None);

      if (!targetId || !dropType) {
        return;
      }

      editor.seedController.moveTreeNodes(
        selectedTreeNodes,
        targetId,
        dropType,
      );
    },
    [editor, selectedTreeNodes],
  );

  const onRename = useCallback(
    (id: string, newName: string) => {
      if (newName !== '') {
        editor.seedController.setName(id, newName);
      }

      dispatch(setRenamingNodeId(undefined));
    },
    [dispatch, editor.seedController],
  );

  useEffect(() => {
    if (!treeRef.current) {
      return;
    }
    const id = getTopSelectedId(
      replica.project.entitiesTree,
      selectedTreeNodes,
    );
    if (!id) {
      return;
    }
    treeRef.current.scrollTo(id, { block: 'nearest' });
  }, [replica.project.entitiesTree, selectedTreeNodes]);

  const setSelectedTreeNodesState = useCallback(
    (nodes: string[]) => {
      if (gameUIActive) {
        gameUIEditor?.setSelectedIds([]);
      }

      dispatch(setSelectedTreeNodes(nodes));
      // TODO: 点击右侧模型列表时,同时取消地形画笔的激活状态
    },
    [dispatch, gameUIActive, gameUIEditor],
  );

  const onEditingNode = useCallback((id?: string) => {
    setIsInputPause(!!id);
  }, []);

  const tree = useMemo(() => {
    if (!treeData.length) {
      return;
    }
    return (
      <Tree
        ref={treeRef}
        treeData={treeData}
        expandIcon={<IconDropUp />}
        expandedIds={currExpanded}
        onExpand={setCurrExpandedIds}
        selectedIds={selectedTreeNodes}
        onSelect={(ids) => {
          setContextMenuPos(undefined);
          setSelectedTreeNodesState(ids);
        }}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        editingNodeId={renamingNodeId}
        onEditingNode={onEditingNode}
        onRename={onRename}
        renameValidator={isValidName}
        highlightLetter={searchKey}
      />
    );
  }, [
    treeData,
    currExpanded,
    setCurrExpandedIds,
    selectedTreeNodes,
    onDragStart,
    onDragOver,
    onDragEnd,
    renamingNodeId,
    onEditingNode,
    onRename,
    searchKey,
    setSelectedTreeNodesState,
  ]);

  const nodeInfo = useMemo(() => {
    return replica.project.entitiesTree[selectedTreeNodes[0]];
  }, [replica.project.entitiesTree, selectedTreeNodes]);

  const onRemove = useCallback(() => {
    if (!nodeInfo) {
      return;
    }
    const ids: string[] = [];

    parseTree(ids, replica.project.entitiesTree, nodeInfo);

    setModalData({
      visible: true,
      removeTreeNodes: [nodeInfo.id],
      seedLength: ids.length,
    });
  }, [nodeInfo, replica.project.entitiesTree]);

  const onRemoveAll = useCallback(() => {
    setModalData({
      visible: true,
      removeTreeNodes: selectedTreeNodes,
      seedLength: allSelectedSeeds.length,
    });
  }, [selectedTreeNodes, allSelectedSeeds.length]);

  const onCopy = useCallback(() => {
    if (!nodeInfo) {
      return;
    }
    const newTreeNodes = editor.seedController.copyTreeNodes([nodeInfo.id]);
    setSelectedTreeNodesState(newTreeNodes);
  }, [nodeInfo, editor.seedController, setSelectedTreeNodesState]);

  const onReleaseTreeNode = useCallback(() => {
    if (!nodeInfo || !editor) {
      return;
    }
    editor.seedController.releaseTreeNode(nodeInfo.id); // TODO: 批量解组
  }, [editor, nodeInfo]);

  const onAddTreeNode = useCallback(() => {
    const newTreeNodeId = editor.seedController.genNodeId();
    editor.seedController.addTreeNode({
      id: newTreeNodeId,
      name: editor.seedController.genNewName(
        intl.formatMessage({ id: 'hierarchy.groupPrefix' }),
      ),
      parentId: ROOT_ID,
      childrenIds: selectedTreeNodes,
      value: EntitySeedRDA.stateSchema.alloc(),
    });

    setSelectedTreeNodesState([newTreeNodeId]);

    Toast.info({
      content: intl.formatMessage({
        id: 'hierarchy.addTreeNodeNotice',
      }),
    });
  }, [
    intl,
    editor.seedController,
    selectedTreeNodes,
    setSelectedTreeNodesState,
  ]);

  const [contextMenuPos, setContextMenuPos] = useState<
    SerializedVec2 | undefined
  >();

  const onContextMenu = useCallback(
    (evt: React.MouseEvent) => {
      if (!selectedTreeNodes.length) {
        return;
      }
      setContextMenuPos([evt.clientX, evt.clientY]);
    },
    [selectedTreeNodes.length],
  );

  const contextMenu = useMemo(() => {
    if (!contextMenuPos) {
      return;
    }
    const multipleChoice = selectedTreeNodes.length > 1;

    const list: (ContextmenuData | false)[] = [
      // 编组 - 仅多选
      multipleChoice && {
        id: ContextMenuId.AddTreeNode,
        text: intl.formatMessage({ id: ContextMenuId.AddTreeNode }),
      },
      // 解除编组  - 仅单选模型组
      nodeInfo?.type !== MuRDATreeNodeType.leaf &&
        !multipleChoice && {
          id: ContextMenuId.ReleaseTreeNode,
          text: intl.formatMessage({ id: ContextMenuId.ReleaseTreeNode }),
        },
      // 重命名 - 仅单选
      !multipleChoice && {
        id: ContextMenuId.Rename,
        text: intl.formatMessage({ id: ContextMenuId.Rename }),
      },
      // 复制 - 仅单选
      !multipleChoice && {
        id: ContextMenuId.Copy,
        text: intl.formatMessage({ id: ContextMenuId.Copy }),
      },
      // 上锁 - 单选且未锁定 || 多选且全部未锁定
      !hasLockedSeedSelected &&
        allSelectedSeeds.length !== 0 && {
          id: ContextMenuId.Lock,
          text: intl.formatMessage({ id: ContextMenuId.Lock }),
        },
      // 解锁 - 单选且已经锁定 || 多选且存在已经锁定
      hasLockedSeedSelected && {
        id: ContextMenuId.Unlock,
        text: intl.formatMessage({ id: ContextMenuId.Unlock }),
      },
      // 移除
      {
        id: ContextMenuId.Remove,
        text: intl.formatMessage({ id: ContextMenuId.Remove }),
        disabled: hasLockedSeedSelected,
      },
    ];

    const data: ContextmenuData[] = list.filter(
      (item): item is ContextmenuData => !!item,
    );
    const onSelect = (id: ItemId) => {
      if (!editor) {
        return;
      }
      switch (id) {
        case ContextMenuId.Rename:
          dispatch(setRenamingNodeId(selectedTreeNodes[0]));
          break;
        case ContextMenuId.Copy:
          onCopy(); // TODO 批量复制
          break;
        case ContextMenuId.Remove:
          if (multipleChoice) {
            // 批量删除
            onRemoveAll();
          } else {
            onRemove(); // 单个删除
          }
          break;
        case ContextMenuId.ReleaseTreeNode:
          onReleaseTreeNode(); // TODO: 批量解组
          break;
        case ContextMenuId.AddTreeNode:
          onAddTreeNode();
          break;
        case ContextMenuId.Lock:
          editor.seedController.setEditLock(allSelectedSeeds, true);
          break;
        case ContextMenuId.Unlock:
          editor.seedController.setEditLock(allSelectedSeeds, false);
          break;
      }

      setContextMenuPos(undefined);
    };
    return (
      <ContextMenu
        position={contextMenuPos}
        data={data}
        onSelect={onSelect}
        onMouseDownOutside={() => setContextMenuPos(undefined)}
      />
    );
  }, [
    allSelectedSeeds,
    contextMenuPos,
    dispatch,
    editor,
    hasLockedSeedSelected,
    intl,
    nodeInfo?.type,
    onAddTreeNode,
    onCopy,
    onReleaseTreeNode,
    onRemove,
    onRemoveAll,
    selectedTreeNodes,
  ]);

  function getModalText() {
    if (modalData.seedLength <= 1) {
      const nodeId = modalData.removeTreeNodes[0];
      if (!nodeId) {
        return;
      }
      const entity = editor.seedController.getTreeNode(nodeId);
      if (!entity) {
        return;
      }

      return (
        <span>
          {intl.formatMessage({ id: 'hierarchy.removeEntityContent' })}
          <span style={{ fontWeight: 700 }}>{entity.name}</span>?
        </span>
      );
    }
    return (
      <span>
        {intl.formatMessage({ id: 'hierarchy.removeEntityContent' })}
        <span style={{ fontWeight: 700 }}>{modalData.seedLength}</span>
        {intl.formatMessage({ id: 'hierarchy.multiEntities' })}?
      </span>
    );
  }

  const tooltipOptions: TooltipTriggerOptions = useMemo(
    () => ({
      text: intl.formatMessage({ id: 'hierarchy.modelNotAllowed' }),
      popupVisible: tooltipVisible,
      moveWithCursor: [0, 0],
      placement: 'bottomLeft',
    }),
    [intl, tooltipVisible],
  );

  const headers = useMemo(() => {
    const headers: ReactNode[] = [];

    if (isSearching) {
      headers.push(
        <div className={style.head} key={'search'}>
          <Search
            onSearch={setSearchKey}
            initialValue={searchKey}
            clearBtn={true}
            size="small"
          />
        </div>,
      );
    }

    if (isSettingStaticModel) {
      headers.push(
        <div className={style.head} key={'staticShadow'}>
          {intl.formatMessage({ id: 'hierarchy.staticShadowContent' })}
        </div>,
      );
    }

    return headers;
  }, [intl, isSearching, isSettingStaticModel, searchKey, setSearchKey]);

  const footer = useMemo(() => {
    if (!isSettingStaticModel) {
      return;
    }
    return (
      <div className={style.footer}>
        <div className={style.leftFooter}>
          <Checkbox
            size={'small'}
            value={!!staticShadowSelectAllState}
            mixed={staticShadowSelectAllState === StaticShadowState.Mix}
            onChange={(value, mixed) => {
              multiChangeStaticShadow(ROOT_ID, value, mixed);
            }}
          />
          <div className={style.leftFooterContent}>
            {intl.formatMessage({ id: 'hierarchy.selectAll' })}
          </div>
        </div>
        <div className={style.rightFooter}>
          <Button
            size={'small'}
            type={'secondary'}
            onClick={onCancelStaticShadow}
          >
            {intl.formatMessage({ id: 'cancel' })}
          </Button>
          <Button size={'small'} onClick={onConfirmStaticShadow}>
            {intl.formatMessage({ id: 'confirm' })}
          </Button>
        </div>
      </div>
    );
  }, [
    intl,
    isSettingStaticModel,
    multiChangeStaticShadow,
    onCancelStaticShadow,
    onConfirmStaticShadow,
    staticShadowSelectAllState,
  ]);

  const _renderOverview = () => {
    return (
      <div
        className={style.container}
        style={{
          height: `calc(100% - ${headers.length * 36}px - ${
            footer ? 40 : 0
          }px)`,
        }}
      >
        {isInputPause && (
          <InputPause flags={InputPauseFlags.ALL} change={inputPauseChange} />
        )}
        {
          <TooltipTrigger {...tooltipOptions}>
            <div className={className} onContextMenu={onContextMenu}>
              {tree || (
                <div className={style.searchEmptyTip}>
                  {intl.formatMessage({ id: 'hierarchy.noResult' })}
                </div>
              )}
              <Modal
                visible={modalData.visible}
                width={400}
                title={intl.formatMessage({ id: 'hierarchy.removeEntity' })}
                cancel={intl.formatMessage({ id: 'cancel' })}
                confirm={intl.formatMessage({ id: 'remove' })}
                operationDivider={true}
                dangerToConfirm={true}
                handleConfirm={() => {
                  modalData.removeTreeNodes.forEach((nodeId) => {
                    const selectedIndex = selectedTreeNodes.indexOf(nodeId);
                    if (selectedIndex > -1) {
                      setSelectedTreeNodesState(
                        selectedTreeNodes.slice(selectedIndex, 1),
                      );
                    }
                  });
                  editor.seedController.removeTreeNodes(
                    modalData.removeTreeNodes,
                  );
                  setModalData({
                    visible: false,
                    removeTreeNodes: [],
                    seedLength: 0,
                  });
                  Toast.info({
                    content: intl.formatMessage({
                      id: 'hierarchy.removeEntityNotice',
                    }),
                  });
                }}
                handleCancel={() => {
                  setModalData({
                    visible: false,
                    removeTreeNodes: [],
                    seedLength: 0,
                  });
                }}
              >
                <div className={style.modalContent}>{getModalText()}</div>
              </Modal>
            </div>
          </TooltipTrigger>
        }
      </div>
    );
  };

  const toggleGameObjectPanel = useCallback(() => {
    dispatch(setNavMode(LeftNavModeEnum.Model));
  }, [dispatch]);

  const _renderTip = () => {
    return (
      <div className={style.tipContainer}>
        <span>{intl.formatMessage({ id: 'hierarchy.noEntity' })}</span>
        <div className={style.tipButton} onClick={toggleGameObjectPanel}>
          {intl.formatMessage({ id: 'hierarchy.addEntity' })}
        </div>
      </div>
    );
  };

  return (
    <>
      {headers}
      {replica.project.entitiesTree[ROOT_ID].childrenIds.length
        ? _renderOverview()
        : _renderTip()}
      {footer}
      {contextMenu}
    </>
  );
}
