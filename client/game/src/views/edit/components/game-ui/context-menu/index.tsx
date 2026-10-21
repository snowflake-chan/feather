import { memo, useContext, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import { ContextMenu, ContextmenuData } from '../../context-menu';
import { SerializedVec2 } from 'src/engine/interfaces';
import { reduxDispatch, RootState } from 'src/redux/edit';
import {
  setContextMenu,
  setGameUIScreenListVisible,
  setRenamingNodeId,
} from 'src/redux/edit/game-ui';
import { useEdit } from 'src/client/edit/edit-context';
import { getScreenNode } from 'src/client/edit/game-ui-editor/util';
import { ArenaEditorUIContext } from 'src/views/edit/editor-ui-context';

export enum ContextMenuId {
  Select = 'SELECT',
  AddElement = 'ADD_ELEMENT',
  AddChild = 'ADD_CHILD',
  AddBox = 'Add_BOX',
  AddText = 'ADD_TEXt',
  AddImage = 'Add_IMAGE',
  AddScrollBox = 'ADD_SCROLL_BOX',
  AddInput = 'ADD_INPUT',
  Delete = 'DELETE',
  CopyAndPaste = 'COPY_AND_PASTE',
  Rename = 'RENAME',
  HideElements = 'HIDE_ELEMENTS',
  ShowElements = 'SHOW_ELEMENTS',
}

function GameUIContextMenuView(props: { position: SerializedVec2 }) {
  const { position } = props;

  const intl = useIntl();
  const dispatch = useDispatch();

  const { selectedIds, pointerDownNodeId, insideCanvas, gameUIVisible } =
    useSelector((state: RootState) => {
      return {
        selectedIds: state.gameUI.selectedIds,
        pointerDownNodeId: state.gameUI.contextMenu?.pointerDownNodeId,
        insideCanvas: state.gameUI.contextMenu?.insideCanvas,
        gameUIVisible: state.gameUI.gameUIVisible,
      };
    });

  /**
   * 添加新元素/添加子元素的选项
   */
  const addElementsOptions = useMemo(() => {
    let id: string;
    let text: string;

    if (selectedIds.length === 0) {
      id = ContextMenuId.AddElement;
      text = intl.formatMessage({ id: 'gameUIContextMenuAddElement' });
    } else {
      id = ContextMenuId.AddChild;
      text = intl.formatMessage({ id: 'gameUIContextMenuAddChild' });
    }

    return {
      id,
      text,
      items: [
        {
          id: ContextMenuId.AddBox,
          text: intl.formatMessage({ id: 'gameUIContextMenuAddBox' }),
        },
        {
          id: ContextMenuId.AddText,
          text: intl.formatMessage({ id: 'gameUIContextMenuAddText' }),
        },
        {
          id: ContextMenuId.AddImage,
          text: intl.formatMessage({ id: 'gameUIContextMenuAddImage' }),
        },
        {
          id: ContextMenuId.AddScrollBox,
          text: intl.formatMessage({ id: 'gameUIContextMenuAddScrollBox' }),
        },
        {
          id: ContextMenuId.AddInput,
          text: intl.formatMessage({ id: 'gameUIContextMenuAddInput' }),
        },
      ],
    };
  }, [intl, selectedIds.length]);

  const contextMenuData = useMemo<ContextmenuData[]>(() => {
    const list: ContextmenuData[] = [];

    if (insideCanvas) {
      if (pointerDownNodeId) {
        if (!selectedIds.includes(pointerDownNodeId)) {
          list.push({
            id: ContextMenuId.Select,
            text: intl.formatMessage({ id: 'gameUIContextMenuSelect' }),
          });
        } else {
          list.push(addElementsOptions);
        }
      }

      if (gameUIVisible) {
        list.push({
          id: ContextMenuId.HideElements,
          text: intl.formatMessage({ id: 'gameUIContextMenuHideElements' }),
        });
      } else {
        list.push({
          id: ContextMenuId.ShowElements,
          text: intl.formatMessage({ id: 'gameUIContextMenuShowElements' }),
        });
      }

      return list;
    }

    list.push(addElementsOptions);

    if (selectedIds.length === 1) {
      list.push({
        id: ContextMenuId.Rename,
        text: intl.formatMessage({ id: 'gameUIContextMenuRename' }),
      });
    }

    if (selectedIds.length > 0) {
      list.push(
        {
          id: ContextMenuId.Delete,
          text: intl.formatMessage({ id: 'gameUIContextMenuDelete' }),
        },
        {
          id: ContextMenuId.CopyAndPaste,
          text: intl.formatMessage({ id: 'copyAndPaste' }),
        },
      );
    }

    return list;
  }, [
    selectedIds,
    intl,
    pointerDownNodeId,
    insideCanvas,
    gameUIVisible,
    addElementsOptions,
  ]);

  const { gameUIEditor } = useEdit();
  const { replica } = useContext(ArenaEditorUIContext);

  return (
    <ContextMenu
      position={position}
      onSelect={(id, e) => {
        e.stopPropagation();

        if (!gameUIEditor) {
          return;
        }

        const [firstId] = selectedIds;

        switch (id) {
          case ContextMenuId.Select:
            if (pointerDownNodeId) {
              // 选中其它屏幕的ui元素，会切换到对应屏幕
              const selectedScreen = getScreenNode(
                replica.project.uiTree,
                pointerDownNodeId,
              );
              if (selectedScreen) {
                gameUIEditor.selectScreen(selectedScreen.id);
              }
              gameUIEditor.setSelectedIds([pointerDownNodeId]);
              // 右键选中元素收起屏幕列表
              reduxDispatch(setGameUIScreenListVisible(false));
            }

            break;
          case ContextMenuId.AddChild:
          case ContextMenuId.AddElement:
            // 这两个有选项有子菜单，本身不响应，但不能关闭contextMenu
            return;
          case ContextMenuId.AddBox:
            gameUIEditor.addElementAndSelect('box', firstId);
            break;
          case ContextMenuId.AddText:
            gameUIEditor.addElementAndSelect('text', firstId);
            break;
          case ContextMenuId.AddImage:
            gameUIEditor.addElementAndSelect('image', firstId);
            break;
          case ContextMenuId.AddScrollBox:
            gameUIEditor.addElementAndSelect('scrollBox', firstId);
            break;
          case ContextMenuId.AddInput:
            gameUIEditor.addElementAndSelect('input', firstId);
            break;
          case ContextMenuId.Delete:
            gameUIEditor.uiTreeController.removeNodes(selectedIds);
            gameUIEditor.setSelectedIds([]);
            break;
          case ContextMenuId.CopyAndPaste:
            {
              const newIds =
                gameUIEditor.uiTreeController.copyNodes(selectedIds);
              gameUIEditor.setSelectedIds(newIds);
            }
            break;
          case ContextMenuId.Rename:
            dispatch(setRenamingNodeId(firstId));
            break;
          case ContextMenuId.HideElements:
            gameUIEditor.setGameUIVisible(false);
            break;
          case ContextMenuId.ShowElements:
            gameUIEditor.setGameUIVisible(true);
            break;
        }
        dispatch(setContextMenu(undefined));
      }}
      onMouseDownOutside={() => dispatch(setContextMenu(undefined))}
      data={contextMenuData}
    />
  );
}

export const GameUIContextMenu = memo(GameUIContextMenuView);
