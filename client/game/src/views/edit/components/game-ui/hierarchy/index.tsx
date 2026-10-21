import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
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
} from '@box/box-design';
import {
  IconDropUp,
  IconInput,
  IconScreenUiSet,
  IconScrollBox,
} from '@box/icons';

import { InputPauseFlags } from '@box/schema/input/input-schema';
import { InputPause, useInputPause } from 'src/views/components/input-lock';

import { ArenaEditorUIContext } from '../../../editor-ui-context';
import { isUIElement, isUIScreen } from '@box/schema/project/ui-rda/util';
import {
  IconFrame,
  IconImageLabel,
  IconScreenUi,
  IconTextbox,
} from '@box/icons';
import {
  DEFAULT_SCREEN_ID,
  UITree,
  UITreeRDA,
} from '@box/schema/project/ui-rda/defs';
import styles from './style.module.scss';
import {
  isValidName,
  getBreadcrumbs,
  parseSearchedData,
  getTopSelectedId,
} from 'src/views/edit/components/tree/util';
import { RootState } from 'src/redux/edit';
import {
  setContextMenu,
  setExpandedId,
  setRenamingNodeId,
  setExpandedIds,
  setGameUIScreenListVisible,
} from 'src/redux/edit/game-ui';
import { useEdit } from 'src/client/edit/edit-context';
import { Search } from 'src/views/edit/components/search';
import { ROOT_ID } from '@box/schema/project/murda-tree';
import { DefaultTag } from 'src/views/edit/components/game-ui/screen-list/default-tag';

type Props = {
  searchKey?: string;
  isSearching: boolean;
  setSearchKey: (key: string) => void;
};

enum Pointer {
  None,
  Dragging,
  NotAllowed,
}

export function GameUIHierarchyView(props: Props) {
  const { searchKey, isSearching, setSearchKey } = props;

  const { gameUIEditor } = useEdit();
  const dispatch = useDispatch();
  const intl = useIntl();
  const { replica } = useContext(ArenaEditorUIContext);
  const scrollToId = useRef<string | undefined>(undefined);
  const { inputPauseChange } = useInputPause();
  const [isInputPause, setIsInputPause] = useState<boolean>(false);
  const [searchExpandedIds, setSearchedExpandedIds] = useState<string[]>([]);
  const setSearchedExpandedId = useCallback(
    (id: string) => {
      if (searchExpandedIds.includes(id)) {
        return;
      }
      setSearchedExpandedIds([...searchExpandedIds, id]);
    },
    [searchExpandedIds],
  );

  const { selectedIds, expandedIds, renamingNodeId, selectedScreenId } =
    useSelector((state: RootState) => ({
      selectedIds: state.gameUI.selectedIds,
      expandedIds: state.gameUI.expandedIds,
      renamingNodeId: state.gameUI.renamingNodeId,
      selectedScreenId: state.gameUI.screen.selectedScreenId,
    }));

  const currExpanded = searchKey ? searchExpandedIds : expandedIds;
  const setCurrExpandedIds = useCallback(
    (ids: string[]) => {
      return searchKey
        ? setSearchedExpandedIds(ids)
        : dispatch(setExpandedIds(ids));
    },
    [dispatch, searchKey],
  );

  const setCurrExpandedId = useCallback(
    (id: string) => {
      return searchKey
        ? setSearchedExpandedId(id)
        : dispatch(setExpandedId({ id, isExpanded: true }));
    },
    [dispatch, searchKey, setSearchedExpandedId],
  );

  const setSelectedIds = useCallback(
    (ids: string[]) => {
      gameUIEditor.setSelectedIds(ids);
    },
    [gameUIEditor],
  );

  const expandList = useCallback(() => {
    dispatch(setGameUIScreenListVisible(true));
  }, [dispatch]);

  const treeRef = useRef<TreeHandle>(null);

  const getTreeNodeList = useCallback((uiTree: UITree, nodeIds: string[]) => {
    const tree: TreeNode[] = [];

    nodeIds.forEach((nodeId) => {
      const node = uiTree[nodeId];
      if (!node?.value) {
        return;
      }

      let icon: ReactNode;
      let isRoot: boolean;

      if (node && node.value && isUIElement(node.value)) {
        isRoot = false;
        switch (node.value.data.type) {
          case 'box':
            icon = <IconFrame />;
            break;
          case 'image':
            icon = <IconImageLabel />;
            break;
          case 'text':
            icon = <IconTextbox />;
            break;
          case 'input':
            icon = <IconInput />;
            break;
          case 'scrollBox':
            icon = <IconScrollBox />;
            break;
        }
      } else {
        isRoot = true;
        icon = <IconScreenUi />;
      }

      const struct: TreeNode = {
        id: node.id,
        name: node.name,
        type: isRoot ? TreeNodeType.Root : TreeNodeType.Attachable,
        icon,
        disableExpand: isRoot,
      };

      struct.children = getTreeNodeList(uiTree, node.childrenIds);

      tree.push(struct);
    });

    return tree;
  }, []);

  // 获取当前屏幕的节点
  const selectedScreenUITree = useMemo(() => {
    const uiTree = replica.project.uiTree;
    const result: UITree = {};
    result[ROOT_ID] = uiTree[ROOT_ID];

    if (!selectedScreenId || !isSearching) {
      return result;
    }

    const getNode = (id, out: UITree) => {
      out[id] = uiTree[id];

      uiTree[id]?.childrenIds.forEach((id) => {
        getNode(id, out);
      });
    };
    getNode(selectedScreenId, result);
    return result;
  }, [isSearching, replica.project.uiTree, selectedScreenId]);

  const treeData = useMemo(() => {
    if (!selectedScreenId || !replica.project.uiTree[selectedScreenId]) {
      return [];
    }

    if (searchKey) {
      const searched = UITreeRDA.stateSchema.clone(
        UITreeRDA.stateSchema.identity,
      );

      parseSearchedData(searched, UITreeRDA, selectedScreenUITree, searchKey);
      const treeData = getTreeNodeList(
        searched,
        // 如果一个都没有搜到，则searched里连屏幕也没有，所以此时渲染空数组
        searched[selectedScreenId]?.childrenIds || [],
      );
      setSearchedExpandedIds(Object.keys(searched));
      UITreeRDA.stateSchema.free(searched);
      return treeData;
    }

    setSearchedExpandedIds([]);
    return getTreeNodeList(
      replica.project.uiTree,
      replica.project.uiTree[selectedScreenId].childrenIds,
    );
  }, [
    getTreeNodeList,
    replica.project.uiTree,
    searchKey,
    selectedScreenId,
    selectedScreenUITree,
  ]);

  const [pointer, setPointer] = useState(Pointer.None);
  const [className, setClassName] = useState(styles.container);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useEffect(() => {
    let pointerStyle = '';
    switch (pointer) {
      case Pointer.Dragging:
        pointerStyle = styles.draggingCursor;
        break;
      case Pointer.NotAllowed:
        pointerStyle = styles.notAllowedCursor;
        break;
    }
    const classNames = [styles.container, pointerStyle];
    if (isSearching) {
      classNames.push(styles.isSearching);
    }
    setClassName(classNames.join(' '));
    setTooltipVisible(pointer === Pointer.NotAllowed);
  }, [isSearching, pointer]);

  const onDragStart = useCallback(() => {
    setPointer(Pointer.Dragging);
  }, []);

  const onDragOver = useCallback(
    (target?: DropTarget) => {
      if (!target) {
        return;
      }
      let realTarget = replica.project.uiTree[target.dropId];
      for (let i = 0; i > target.levelOffset; i--) {
        if (!realTarget) {
          return;
        }

        const parentId = replica.project.uiTree[realTarget.id]?.parentId;
        if (!parentId) {
          break;
        }
        realTarget = replica.project.uiTree[parentId];
      }

      // 纠正拖拽到屏幕上方时候的dropType为box，不允许拖拽到屏幕上方
      if (realTarget.id === DEFAULT_SCREEN_ID && target.type === 'top') {
        target.type = 'box';
        return target;
      }

      const breadcrumbs = getBreadcrumbs(replica.project.uiTree, realTarget.id);

      setPointer(
        selectedIds.find((id) => breadcrumbs.includes(id))
          ? Pointer.NotAllowed
          : Pointer.Dragging,
      );
      return target;
    },
    [replica.project.uiTree, selectedIds],
  );
  const onDragEnd = useCallback(
    (targetId?: string, dropType?: DropType) => {
      setPointer(Pointer.None);

      if (!targetId || !dropType) {
        return;
      }

      return gameUIEditor.uiTreeController.moveElements(
        selectedIds,
        targetId,
        dropType,
      );
    },
    [gameUIEditor, selectedIds],
  );
  const onRename = useCallback(
    (id: string, newName: string) => {
      const trimmed = newName.trim();

      trimmed && gameUIEditor?.uiTreeController.renameNode(id, trimmed);
      dispatch(setRenamingNodeId(undefined));
    },
    [gameUIEditor, dispatch],
  );

  // 外部选中时，需要滚动到选中的地方
  useEffect(() => {
    scrollToId.current = getTopSelectedId(replica.project.uiTree, selectedIds);
  }, [replica.project.uiTree, selectedIds]);

  // 外部选中时，需要被动展开所有节点
  useEffect(() => {
    if (!scrollToId.current) {
      return;
    }
    selectedIds.forEach((id) => {
      getBreadcrumbs(replica.project.uiTree, id).forEach(setCurrExpandedId);
    });
  }, [replica.project.uiTree, selectedIds, setCurrExpandedId]);

  // 被动展开or外部选中时，滚动到scrollToId
  useEffect(() => {
    if (!scrollToId.current || !treeRef.current) {
      return;
    }
    treeRef.current.scrollTo(scrollToId.current, { block: 'nearest' });
  }, [selectedIds, currExpanded]);

  const onEditingNode = useCallback((id?: string) => {
    setIsInputPause(!!id);
  }, []);

  const tooltipOptions: TooltipTriggerOptions = {
    text: intl.formatMessage({ id: 'hierarchy.UINotAllowed' }),
    popupVisible: tooltipVisible,
    moveWithCursor: [0, 0],
    placement: 'bottomLeft',
  };

  const name = useMemo(() => {
    if (!selectedScreenId) {
      return '';
    }
    const screen = replica.project.uiTree[selectedScreenId];
    if (screen) {
      return screen.name;
    }
    return '';
  }, [replica.project.uiTree, selectedScreenId]);

  return (
    <TooltipTrigger {...tooltipOptions}>
      <div
        className={className}
        onContextMenu={(e) => {
          dispatch(
            setContextMenu({
              position: [e.clientX, e.clientY],
              insideCanvas: false,
            }),
          );
        }}
      >
        <div className={styles.header}>
          <TooltipTrigger
            text={intl.formatMessage({ id: 'gameUIScreenVisibleTooltip' })}
            placement="bottomLeft"
          >
            <div className={styles.expandBtn} onClick={expandList}>
              <IconScreenUiSet />
            </div>
          </TooltipTrigger>
          <div className={styles.divider}></div>
          <div className={styles.nameContainer}>
            <IconScreenUi className={styles.screenIcon} />
            <div className={styles.screenName}>{name}</div>
            {selectedScreenId === replica.project.defaultScreenId && (
              <DefaultTag />
            )}
          </div>
        </div>

        {isSearching && (
          <div className={styles.head}>
            <Search
              onSearch={setSearchKey}
              initialValue={searchKey}
              clearBtn={true}
              size="small"
            />
          </div>
        )}
        {isInputPause && (
          <InputPause flags={InputPauseFlags.ALL} change={inputPauseChange} />
        )}
        {treeData.length ? (
          <Tree
            ref={treeRef}
            treeData={treeData}
            expandIcon={<IconDropUp />}
            expandedIds={currExpanded}
            onExpand={(ids) => {
              setCurrExpandedIds(ids);
              scrollToId.current = undefined;
            }}
            selectedIds={selectedIds}
            onSelect={(ids) => {
              dispatch(setContextMenu(undefined));
              setSelectedIds(ids);
              scrollToId.current = undefined;
            }}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            editingNodeId={renamingNodeId}
            onRename={onRename}
            onEditingNode={onEditingNode}
            renameValidator={isValidName}
            highlightLetter={searchKey}
          />
        ) : searchKey ? (
          <div className={styles.searchEmptyTip}>
            {intl.formatMessage({ id: 'hierarchy.noResult' })}
          </div>
        ) : undefined}
      </div>
    </TooltipTrigger>
  );
}

export const GameUIHierarchy = memo(GameUIHierarchyView);
