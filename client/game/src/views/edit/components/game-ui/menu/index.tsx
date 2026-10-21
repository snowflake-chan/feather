import { ReactNode, memo, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import {
  IconCancel,
  IconFrame,
  IconImageLabel,
  IconInput,
  IconScrollBox,
  IconTextbox,
} from '@box/icons';
import { Button } from '@box/box-design';
import { UIElementType, UITree } from '@box/schema/project/ui-rda/defs';
import { setNavMode } from 'src/redux/edit/creator';
import { LeftNavModeEnum } from 'src/views/edit/defs';
import { RootState } from 'src/redux/edit';
import { useEdit } from 'src/client/edit/edit-context';
import { clientConfig } from 'src/config/client';
import styles from './style.module.scss';
import { ROOT_ID } from '@box/schema/project/murda-tree';

function GameUIMenuView() {
  const intl = useIntl();
  const { gameUIEditor, state } = useEdit();
  const { navMode, selectedIds } = useSelector((state: RootState) => ({
    navMode: state.creator.navMode,
    selectedIds: state.gameUI.selectedIds,
  }));

  // 找到在tree中最前面的id
  const getFirstId = useCallback((selectedIds: string[], uiTree: UITree) => {
    if (!selectedIds.length) {
      return;
    }
    function walk(rootId: string) {
      const node = uiTree[rootId];

      for (let i = 0; i < node.childrenIds.length; i++) {
        if (selectedIds.includes(node.childrenIds[i])) {
          return node.childrenIds[i];
        } else {
          const result = walk(node.childrenIds[i]);
          if (result) {
            return result;
          }
        }
      }
    }

    return walk(ROOT_ID);
  }, []);

  const { addBox, addText, addImage, addScrollBox, addInput } = useMemo(() => {
    const addElement = (type: UIElementType) => {
      if (!gameUIEditor) {
        return;
      }

      const firstId = getFirstId(selectedIds, state.replica.project.uiTree);

      if (firstId && state.replica.project.uiTree[firstId]) {
        gameUIEditor.addElementAndMove(type, {
          targetId: firstId,
          type: 'before',
        });
      } else {
        gameUIEditor.addElementAndSelect(type);
      }
    };

    return {
      addBox: () => addElement('box'),
      addText: () => addElement('text'),
      addInput: () => addElement('input'),
      addImage: () => addElement('image'),
      addScrollBox: () => addElement('scrollBox'),
    };
  }, [gameUIEditor, selectedIds, state.replica.project.uiTree]);

  const dispatch = useDispatch();

  const closeMenu = useCallback(() => {
    if (navMode === LeftNavModeEnum.UI) {
      dispatch(setNavMode(LeftNavModeEnum.NoneMode));
    }
  }, [dispatch, navMode]);

  return (
    <div className={styles.gameUIMenu}>
      <Item
        icon={<IconFrame />}
        name={intl.formatMessage({
          id: 'gameUIBox',
        })}
        onClick={addBox}
      />
      <Item
        icon={<IconScrollBox />}
        name={intl.formatMessage({
          id: 'gameUIScrollBox',
        })}
        onClick={addScrollBox}
      />
      <Item
        icon={<IconTextbox />}
        name={intl.formatMessage({
          id: 'gameUIText',
        })}
        onClick={addText}
      />
      <Item
        icon={<IconInput />}
        name={intl.formatMessage({
          id: 'gameUIInput',
        })}
        onClick={addInput}
      />
      <Item
        icon={<IconImageLabel />}
        name={intl.formatMessage({
          id: 'gameUIImage',
        })}
        onClick={addImage}
      />
      <div className={styles.gap} />
      <Button
        type="icon"
        icon={<IconCancel />}
        size="custom"
        onClick={closeMenu}
      />
    </div>
  );
}

function Item(props: { icon: ReactNode; name: string; onClick: () => void }) {
  const { icon, name, onClick } = props;
  return (
    <div className={styles.item} onClick={onClick}>
      {icon}
      <p className={styles.name}>{name}</p>
    </div>
  );
}

/**
 * 内容区GUI菜单
 */
export const GameUIMenu = memo(GameUIMenuView);
