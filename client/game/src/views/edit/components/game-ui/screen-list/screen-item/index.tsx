import React, { useCallback, useContext, useMemo, useState } from 'react';
import {
  IconMore,
  IconScreenUi,
  IconVisibility,
  IconVisibilityOff,
} from '@box/icons';
import { Button, PointerAction } from '@box/box-design';

import styles from './style.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/redux/edit';
import {
  setGameUIScreenListVisible,
  setScreenListMenuInfo,
} from 'src/redux/edit/game-ui';
import { UITreeNode } from '@box/schema/project/ui-rda/defs';
import { useEdit } from 'src/client/edit/edit-context';
import { ArenaEditorUIContext } from 'src/views/edit/editor-ui-context';
import { useIntl } from 'react-intl';
import { isMobile } from 'src/utils/mobile';
import { DefaultTag } from 'src/views/edit/components/game-ui/screen-list/default-tag';

export type DropTarget = {
  id: string;
  type: 'before' | 'after';
};

type Props = {
  info: UITreeNode;
  onMouseDown: (id: string) => void;
  onMouseUp: () => void;
  setDropTarget: (target: DropTarget) => void;
  dropTarget?: DropTarget;
  pointerAction: PointerAction;
  setPointerAction: (action: PointerAction) => void;
};
export const ScreenItem = (props: Props) => {
  const {
    info,
    onMouseDown: propsOnMouseDown,
    onMouseUp: propsOnMouseUp,
    setDropTarget,
    pointerAction,
    setPointerAction,
    dropTarget,
  } = props;

  const intl = useIntl();

  const { selectedScreenId, menuInfo, screenVisible } = useSelector(
    (state: RootState) => ({
      selectedScreenId: state.gameUI.screen.selectedScreenId,
      menuInfo: state.gameUI.screen.menuInfo,
      screenVisible: !state.gameUI.screen.hiddenScreenIds.includes(info.id),
    }),
  );
  const dispatch = useDispatch();

  const { gameUIEditor } = useEdit();
  const [moreBtnActive, setMoreBtnActive] = useState(false);

  const {
    replica: {
      project: { defaultScreenId },
    },
  } = useContext(ArenaEditorUIContext);

  const onClick = useCallback(
    (evt) => {
      evt.preventDefault();
      dispatch(setGameUIScreenListVisible(false));
      gameUIEditor.selectScreen(info.id);
    },
    [dispatch, gameUIEditor, info.id],
  );

  const onContextMenu = useCallback(
    (evt: React.MouseEvent) => {
      evt.stopPropagation();
      evt.preventDefault();

      gameUIEditor.selectScreen(info.id);
      dispatch(
        setScreenListMenuInfo({
          menuPos: [evt.clientX, evt.clientY],
          screenId: info.id,
        }),
      );

      // 经右键唤起菜单时：more按钮失活
      setMoreBtnActive(false);
    },
    [dispatch, gameUIEditor, info.id],
  );

  const currMenuShow = useMemo(() => {
    return menuInfo && info.id === menuInfo.screenId;
  }, [menuInfo, info]);

  const onClickMoreBtn = useCallback(
    (evt: React.MouseEvent) => {
      evt.stopPropagation();
      // 仅 more按钮 可通过单击唤起菜单
      dispatch(
        setScreenListMenuInfo({
          menuPos: [evt.clientX, evt.clientY],
          screenId: info.id,
        }),
      );
      // 经more按钮唤起菜单时：激活more按钮
      setMoreBtnActive(true);
    },
    [dispatch, info],
  );

  const className = useMemo(() => {
    const list = [styles.item];

    if (selectedScreenId === info.id) {
      list.push(styles.selected);
    }

    if (currMenuShow) {
      list.push(styles.hoverStyle);
    }

    if (dropTarget?.id === info.id) {
      list.push(styles.overing);
      if (dropTarget.type === 'before') {
        list.push(styles.overingBefore);
      } else {
        list.push(styles.overingAfter);
      }
    }
    return list.join(' ');
  }, [selectedScreenId, info.id, currMenuShow, dropTarget]);

  const processDropTarget = useCallback(
    (ev: React.MouseEvent | React.DragEvent) => {
      const { top, bottom } = ev.currentTarget.getBoundingClientRect();
      if (ev.clientY < top || ev.clientY > bottom) {
        return;
      }

      const type = ev.clientY < (top + bottom) / 2 ? 'before' : 'after';

      setDropTarget({
        id: info.id,
        type,
      });
    },
    [info.id, setDropTarget],
  );

  const onMouseMove = useCallback(
    (ev: React.MouseEvent | React.DragEvent) => {
      ev.preventDefault();
      if (pointerAction !== PointerAction.Idle) {
        processDropTarget(ev);
        setPointerAction(PointerAction.Dragging);
      }
    },
    [pointerAction, processDropTarget, setPointerAction],
  );

  const onMouseDown = useCallback(() => {
    propsOnMouseDown(info.id);
  }, [info.id, propsOnMouseDown]);

  const onDragStart = useCallback(
    (ev: React.DragEvent) => {
      // 这里调用ev.dataTransfer.setData所传递数据内容并不重要
      // 调用这个方法只是为了让移动端可以触发 drag 的一系列事件
      // 如果不传递数据的话，IOS端没有办法触发drag
      // ev.dataTransfer.setData('text/plain', '_');
      ev.dataTransfer.setData(
        '_',
        `
          Here, the content of the data passed to 'ev.dataTransfer.setData' is not important.
          Calling this method is simply to enable a series of drag events to be triggered on mobile devices.
          If no data is passed, drag events cannot be triggered on iOS devices.
        `,
      );
      ev.dataTransfer.dropEffect = 'none';
      ev.button === 0 && propsOnMouseDown(info.id);
    },
    [info.id, propsOnMouseDown],
  );

  const mobile = useMemo(() => {
    return isMobile();
  }, []);

  return (
    <div
      className={className}
      onContextMenu={onContextMenu}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
      draggable={mobile}
      onDragStart={mobile ? onDragStart : undefined}
      onDragOver={mobile ? onMouseMove : undefined}
      onDragEnd={mobile ? propsOnMouseUp : undefined}
      id={`screen-item-${info.id}`}
    >
      <div className={styles.head}>
        <IconScreenUi className={styles.screenIcon} />
        <p>{info.name}</p>
        <div className={styles.defaultTagContainer}>
          {defaultScreenId === info.id && <DefaultTag />}
        </div>
        <Button
          type={'icon'}
          size={'custom'}
          icon={screenVisible ? <IconVisibility /> : <IconVisibilityOff />}
          className={styles.eyeBtn}
          onClick={(evt) => {
            evt.stopPropagation();
            gameUIEditor.toggleGameUIScreenVisible(info.id);
          }}
          onContextMenu={(evt) => {
            evt.preventDefault();
            evt.stopPropagation();
          }}
        />
        <Button
          type={'icon'}
          size={'custom'}
          icon={<IconMore />}
          className={styles.moreBtn}
          activated={currMenuShow && moreBtnActive}
          onPointerDown={(evt) => evt.stopPropagation()}
          onClick={onClickMoreBtn}
          onContextMenu={(evt) => {
            evt.preventDefault();
            evt.stopPropagation();
          }}
        />
      </div>
    </div>
  );
};
