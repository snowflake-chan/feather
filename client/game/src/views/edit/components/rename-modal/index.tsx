import { useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { InputPauseFlags } from '@box/schema/input/input-schema';
import { Input, ModalView, Toast } from '@box/box-design';

import { InputPause, useInputPause } from 'src/views/components/input-lock';

import style from './index.module.scss';

export const RenameModal = (props: {
  id: number;
  oldName: string;
  renameErrorTip?: string;
  onRename: (modelId: number, newName: string) => Promise<boolean>;
  onSuccess: () => void;
  onCancel: () => void;
  onError: (errorCode: number) => void;
  onFocus: () => void;
}) => {
  const {
    id,
    oldName,
    onRename,
    onSuccess,
    onCancel,
    onError,
    renameErrorTip,
    onFocus,
  } = props;
  const intl = useIntl();
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>(oldName);
  const { inputPauseChange } = useInputPause();

  const errorTip = useMemo(() => {
    return (
      (renameErrorTip && (
        <span className={style.errorMessage}>{renameErrorTip}</span>
      )) ||
      undefined
    );
  }, [renameErrorTip]);

  const rename = useCallback(async () => {
    if (newName === oldName) {
      Toast.info({
        content: intl.formatMessage({ id: 'nameNoModified' }),
      });
      return;
    }
    try {
      Toast.loading({
        content: intl.formatMessage({ id: 'renaming' }),
      });
      const res = await onRename(id, newName);
      Toast.destroyAll();
      if (res) {
        Toast.success({
          content: intl.formatMessage({ id: 'renameSuccess' }),
        });
        return onSuccess();
      }
    } catch (e) {
      Toast.destroyAll();
      onError(e.code);
      return;
    }
  }, [newName, oldName, intl, id, onRename, onSuccess, onError]);

  return (
    <>
      {isFocused && (
        <InputPause flags={InputPauseFlags.ALL} change={inputPauseChange} />
      )}
      {
        <ModalView
          type="default"
          width={448}
          title={intl.formatMessage({ id: 'rename' })}
          content={
            <div style={{ height: 70, paddingTop: 26 }}>
              <Input
                type="primary"
                valueType="string"
                size="middle"
                value={newName}
                onChange={setNewName}
                error={renameErrorTip !== undefined}
                onFocus={() => {
                  onFocus();
                  setIsFocused(true);
                }}
                onBlur={() => setIsFocused(false)}
              />
              {errorTip}
            </div>
          }
          confirmText={intl.formatMessage({ id: 'save' })}
          onConfirm={rename}
          cancelText={intl.formatMessage({ id: 'cancel' })}
          onCancel={onCancel}
        />
      }
    </>
  );
};
