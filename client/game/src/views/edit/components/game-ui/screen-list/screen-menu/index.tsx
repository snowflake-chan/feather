import React, { useCallback, useContext, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import { useEdit } from 'src/client/edit/edit-context';
import { RootState } from 'src/redux/edit';
import {
  setScreenListMenuInfo,
  setScreenRenameModalInfo,
  setSelectedScreenId,
} from 'src/redux/edit/game-ui';
import {
  ContextMenu,
  ContextmenuData,
} from 'src/views/edit/components/context-menu';
import { ItemId, Modal, Toast } from '@box/box-design';
import { ROOT_ID } from '@box/schema/project/murda-tree';
import { ArenaEditorUIContext } from 'src/views/edit/editor-ui-context';
import { MAX_SCREEN_COUNT } from 'src/engine/game-ui/nodes/defs';
import styles from './style.module.scss';

enum ContextMenuId {
  Copy,
  Rename,
  MoveToTop,
  MoveToBottom,
  Remove,
  SetDefault,
  Unselect,
}

export const ScreenMenu = React.memo(() => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { menuInfo, selectedScreenId } = useSelector(
    (state: RootState) => state.gameUI.screen,
  );
  const {
    replica: {
      project: { uiTree, defaultScreenId },
    },
  } = useContext(ArenaEditorUIContext);

  const { gameUIEditor } = useEdit();

  const screen = useMemo(() => {
    if (!menuInfo) {
      return;
    }
    return uiTree[menuInfo.screenId];
  }, [uiTree, menuInfo]);

  const closeMenu = useCallback(() => {
    dispatch(setScreenListMenuInfo(undefined));
  }, [dispatch]);

  // 菜单项
  const list: (ContextmenuData | false)[] = useMemo(() => {
    if (!screen) {
      return [];
    }

    const isOnlyOneScreen = uiTree[ROOT_ID].childrenIds.length === 1;

    return [
      // 设为默认
      defaultScreenId !== menuInfo?.screenId && {
        id: ContextMenuId.SetDefault,
        text: intl.formatMessage({ id: 'gameUIScreenSetDefault' }),
      },
      // 复制
      {
        id: ContextMenuId.Copy,
        text: intl.formatMessage({ id: 'copy' }),
      },
      // 重命名
      {
        id: ContextMenuId.Rename,
        text: intl.formatMessage({ id: 'rename' }),
      },

      {
        id: ContextMenuId.MoveToTop,
        text: intl.formatMessage({ id: 'gameUIScreenToTop' }),
      },
      {
        id: ContextMenuId.MoveToBottom,
        text: intl.formatMessage({ id: 'gameUIScreenToBottom' }),
      },
      selectedScreenId === menuInfo?.screenId && {
        id: ContextMenuId.Unselect,
        text: intl.formatMessage({ id: 'gameUIScreenUnSelect' }),
      },
      // 删除
      {
        id: ContextMenuId.Remove,
        text: intl.formatMessage({ id: 'remove' }),
        disabled: isOnlyOneScreen,
      },
    ];
  }, [
    screen,
    uiTree,
    defaultScreenId,
    menuInfo?.screenId,
    intl,
    selectedScreenId,
  ]);

  const data: ContextmenuData[] = list.filter(
    (item): item is ContextmenuData => !!item,
  );

  const onSelect = useCallback(
    (id: ItemId) => {
      if (!screen) {
        return;
      }
      const firstScreen = uiTree[ROOT_ID].childrenIds[0];
      const lastIndex = uiTree[ROOT_ID].childrenIds.length - 1;
      const lastScreen = uiTree[ROOT_ID].childrenIds[lastIndex];
      const currentScreenCount = uiTree[ROOT_ID].childrenIds.length;
      switch (id) {
        case ContextMenuId.Rename:
          dispatch(setScreenRenameModalInfo({ id: screen.id }));
          break;
        case ContextMenuId.Copy:
          if (currentScreenCount >= MAX_SCREEN_COUNT) {
            Toast.warning({
              content: intl.formatMessage(
                { id: 'gameUIScreenMaxCount' },
                { count: MAX_SCREEN_COUNT },
              ),
            });
            return;
          }
          const [newId] = gameUIEditor.uiTreeController.copyNodes([screen.id]);
          gameUIEditor.selectScreen(newId);
          break;
        case ContextMenuId.MoveToTop:
          // 放到第一个之前
          gameUIEditor.uiTreeController.moveScreen(
            screen.id,
            firstScreen,
            'before',
          );
          break;

        case ContextMenuId.MoveToBottom:
          // 放到最后一个之后
          gameUIEditor.uiTreeController.moveScreen(
            screen.id,
            lastScreen,
            'after',
          );
          break;
        case ContextMenuId.Remove:
          if (!screen.childrenIds.length) {
            gameUIEditor.uiTreeController.removeScreen(screen.id);
            if (screen.id === selectedScreenId) {
              dispatch(setSelectedScreenId(undefined));
            }
            return;
          }
          // 二次确认
          const destroy = Modal.show({
            type: 'warning',
            title: intl.formatMessage({
              id: 'gameUIScreenRemoveTips',
            }),
            width: 332,
            rootClassName: styles.modalTitle,
            buttonSort: 'rtl',
            confirmText: intl.formatMessage({ id: 'removeConfirm' }),
            cancelText: intl.formatMessage({ id: 'cancel' }),
            onCancel: () => destroy(),
            onConfirm: () => {
              gameUIEditor.uiTreeController.removeScreen(screen.id);
              if (screen.id === selectedScreenId) {
                dispatch(setSelectedScreenId(undefined));
              }
              destroy();
            },
          });

          break;
        case ContextMenuId.Unselect:
          gameUIEditor.selectScreen(undefined);
          break;
        case ContextMenuId.SetDefault:
          gameUIEditor.setDefaultScreen(screen.id);
          break;
      }
      closeMenu();
    },
    [screen, uiTree, closeMenu, dispatch, gameUIEditor, selectedScreenId, intl],
  );

  return (
    <ContextMenu
      position={menuInfo?.menuPos}
      data={data}
      onSelect={onSelect}
      onMouseDownOutside={closeMenu}
    />
  );
});
