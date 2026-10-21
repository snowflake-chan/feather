import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from './style.module.scss';
import { IconScreenUi, IconScreenUiSet } from '@box/icons';
import {
  DropTarget,
  ScreenItem,
} from 'src/views/edit/components/game-ui/screen-list/screen-item';
import { useDispatch, useSelector } from 'react-redux';
import {
  setGameUIScreenListVisible,
  setScreenListMenuInfo,
  setSelectedScreenId,
} from 'src/redux/edit/game-ui';
import { useEdit } from 'src/client/edit/edit-context';
import { ArenaEditorUIContext } from 'src/views/edit/editor-ui-context';
import { isUIScreen } from '@box/schema/project/ui-rda/util';
import { RootState } from 'src/redux/edit';
import { ScreenMenu } from 'src/views/edit/components/game-ui/screen-list/screen-menu';
import { ROOT_ID } from '@box/schema/project/murda-tree';
import { PointerAction, Toast, useMouseUpListener } from '@box/box-design';
import { useIntl } from 'react-intl';
import { RenameModal } from 'src/views/edit/components/game-ui/screen-list/screen-menu/rename-modal';
import { DefaultTag } from 'src/views/edit/components/game-ui/screen-list/default-tag';
import { MAX_SCREEN_COUNT } from 'src/engine/game-ui/nodes/defs';

function ScreenListView() {
  const dispatch = useDispatch();
  const intl = useIntl();

  const { gameUIEditor } = useEdit();

  const [dropTarget, setDropTarget] = useState<DropTarget>();
  const [pointerAction, setPointerAction] = useState<PointerAction>(
    PointerAction.Idle,
  );

  const {
    replica: {
      project: { uiTree, defaultScreenId },
    },
  } = useContext(ArenaEditorUIContext);

  const { selectedScreenId, renameModalInfo, menuInfo, screenListVisible } =
    useSelector((state: RootState) => ({
      selectedScreenId: state.gameUI.screen.selectedScreenId,
      renameModalInfo: state.gameUI.screen.renameModalInfo,
      menuInfo: state.gameUI.screen.menuInfo,
      selectedIds: state.gameUI.selectedIds,
      screenListVisible: state.gameUI.screen.listVisible,
    }));

  const foldUp = useCallback(() => {
    if (!selectedScreenId) {
      return;
    }
    dispatch(setGameUIScreenListVisible(false));
  }, [dispatch, selectedScreenId]);

  const draggingScreenId = useRef<string>(undefined);

  const addScreen = useCallback(() => {
    const currentScreenCount = uiTree[ROOT_ID].childrenIds.length;
    if (currentScreenCount >= MAX_SCREEN_COUNT) {
      Toast.warning({
        content: intl.formatMessage(
          { id: 'gameUIScreenMaxCount' },
          { count: MAX_SCREEN_COUNT },
        ),
      });
      return;
    }
    gameUIEditor.addScreenAndSelect();
  }, [gameUIEditor, intl, uiTree]);

  const onMouseUp = useCallback(() => {
    if (pointerAction !== PointerAction.Idle) {
      // 移动
      if (draggingScreenId.current && dropTarget) {
        gameUIEditor.uiTreeController.moveScreen(
          draggingScreenId.current,
          dropTarget?.id,
          dropTarget?.type,
        );
      }
      setPointerAction(PointerAction.Idle);
      setDropTarget(undefined);
    }
  }, [dropTarget, gameUIEditor.uiTreeController, pointerAction]);

  const addMouseUpListener = useMouseUpListener(onMouseUp);
  const onMouseDown = useCallback(
    (id: string) => {
      draggingScreenId.current = id;
      setPointerAction(PointerAction.DragStart);
      addMouseUpListener();
    },
    [addMouseUpListener],
  );

  const screenList = useMemo(() => {
    const screenIds = uiTree[ROOT_ID].childrenIds;
    return screenIds
      .filter((screenId) => {
        const node = uiTree[screenId];
        return node.value && isUIScreen(node.value);
      })
      .map((screenId) => (
        <ScreenItem
          onMouseUp={onMouseUp}
          info={uiTree[screenId]}
          key={uiTree[screenId].id}
          onMouseDown={onMouseDown}
          pointerAction={pointerAction}
          dropTarget={dropTarget}
          setDropTarget={(target) => setDropTarget(target)}
          setPointerAction={setPointerAction}
        />
      ));
  }, [dropTarget, onMouseDown, onMouseUp, pointerAction, uiTree]);

  useEffect(() => {
    const element = document.getElementById(`screen-item-${selectedScreenId}`);
    if (!element || !screenListVisible) {
      return;
    }
    if (element.scrollIntoViewIfNeeded) {
      element.scrollIntoViewIfNeeded();
    } else {
      element.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedScreenId, screenListVisible]);

  return (
    <>
      {renameModalInfo && <RenameModal />}
      {menuInfo && <ScreenMenu />}
      <div
        className={`${styles.screenList} ${
          pointerAction === PointerAction.Dragging ? styles.draggingCursor : ''
        }`}
        onContextMenu={(evt) => {
          evt.stopPropagation();
          evt.preventDefault();
          if (selectedScreenId) {
            dispatch(
              setScreenListMenuInfo({
                menuPos: [evt.clientX, evt.clientY],
                screenId: selectedScreenId,
              }),
            );
          }
        }}
        id={'screenList'}
      >
        <div className={styles.header}>
          <div
            className={`${styles.foldBtn} ${
              selectedScreenId ? styles.activable : ''
            }`}
            onClick={foldUp}
          >
            <IconScreenUiSet />
            {selectedScreenId ? (
              <span className={styles.foldText}>
                {intl.formatMessage({ id: 'gameUIScreenFold' })}
              </span>
            ) : undefined}
          </div>
          <div className={styles.nameContainer}>
            {selectedScreenId ? (
              <>
                <IconScreenUi className={styles.screenIcon} />
                <div className={styles.screenName}>
                  {uiTree[selectedScreenId]?.name || ''}
                </div>
              </>
            ) : (
              <></>
            )}
            {selectedScreenId === defaultScreenId && <DefaultTag />}
          </div>
        </div>
        <div className={styles.listContainer}>
          <div className={styles.createBtn} onClick={addScreen}>
            <span className={styles.newScreen}>
              {intl.formatMessage({ id: 'gameUIScreenNew' })}
            </span>
          </div>
          <div className={styles.list}>{screenList}</div>
        </div>
      </div>
    </>
  );
}

export const ScreenList = memo(ScreenListView);
