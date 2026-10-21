import { useCallback, useContext, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import { InputPauseFlags } from '@box/schema/input/input-schema';
import { Input, ModalView, Toast } from '@box/box-design';

import { InputPause, useInputPause } from 'src/views/components/input-lock';

import { useEdit } from 'src/client/edit/edit-context';
import { RootState } from 'src/redux/edit';
import { setScreenRenameModalInfo } from 'src/redux/edit/game-ui';
import { ArenaEditorUIContext } from 'src/views/edit/editor-ui-context';

const regex = /[^a-zA-Z0-9_\u4e00-\u9fa5\s-]/g;

export const RenameModal = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { inputPauseChange } = useInputPause();
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const { screenId } = useSelector((state: RootState) => ({
    screenId: state.gameUI.screen.renameModalInfo?.id,
  }));

  const {
    replica: {
      project: { uiTree },
    },
  } = useContext(ArenaEditorUIContext);

  const [newName, setNewName] = useState<string>(
    screenId && uiTree[screenId] ? uiTree[screenId].name : '',
  );

  const { gameUIEditor } = useEdit();

  const onConfirm = useCallback(() => {
    if (!screenId) {
      return;
    }
    if (newName === uiTree[screenId]?.name) {
      dispatch(setScreenRenameModalInfo(undefined));
      return;
    }
    if (newName.trim() === '') {
      Toast.error({
        content: intl.formatMessage({ id: 'gameUIScreenNameEmpty' }),
      });
      return;
    }

    const invalidChars = newName.match(regex);
    if (invalidChars?.length) {
      Toast.error({
        content: intl.formatMessage(
          {
            id: 'gameUIScreenNameInvalid',
          },
          { chars: invalidChars.join('') },
        ),
      });
      return;
    }
    // 屏幕已被删除
    if (!uiTree[screenId]) {
      dispatch(setScreenRenameModalInfo(undefined));
      return;
    }
    gameUIEditor.uiTreeController.renameNode(screenId, newName);
    dispatch(setScreenRenameModalInfo(undefined));
    Toast.success({ content: intl.formatMessage({ id: 'renameSuccess' }) });
  }, [
    dispatch,
    gameUIEditor.uiTreeController,
    intl,
    newName,
    screenId,
    uiTree,
  ]);

  return (
    <>
      {isFocused && (
        <InputPause flags={InputPauseFlags.ALL} change={inputPauseChange} />
      )}
      {
        <ModalView
          width={448}
          type="default"
          buttonSort="rtl"
          title={intl.formatMessage({ id: 'rename' })}
          confirmText={intl.formatMessage({ id: 'confirm' })}
          cancelText={intl.formatMessage({ id: 'cancel' })}
          content={
            <Input
              size="middle"
              type="primary"
              valueType="string"
              value={newName}
              onChange={(value: string) => {
                setNewName(value);
              }}
              error={false}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={intl.formatMessage({ id: 'rename' })}
            />
          }
          onConfirm={onConfirm}
          onCancel={() => {
            dispatch(setScreenRenameModalInfo(undefined));
          }}
        />
      }
    </>
  );
};
