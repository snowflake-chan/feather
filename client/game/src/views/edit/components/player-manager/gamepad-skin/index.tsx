import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Tabs, TabPanel, Toast, ModalView } from '@box/box-design/build';

import { JoystickSkin } from './joystick-skin';
import { ActionSkin } from './action-skin';
import { PictureLibrary } from '../../picture-library';
import { useEdit } from 'src/client/edit/edit-context';
import {
  GamepadSkinType,
  setPictureLibraryVisible,
  setResetModalVisible,
} from 'src/redux/edit/gamepad-skin';
import { RootState } from 'src/redux/edit';
import { editor } from 'src/client/edit/edit-client';
import { canvasToBlob } from 'src/utils/capture';

import style from './style.module.scss';
import { useUploadPicture } from 'src/views/edit/components/picture-library/hooks';

enum GamepadStatus {
  /**
   * 步行状态
   */
  Walking,
  /**
   * 飞行状态
   */
  flying,
}

export const GamepadSkin = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { assetController, editContentStorage, game } = useEdit();
  const [screenShot, setScreenShot] = useState('');
  const [gamepadState, setGamepadState] = useState<GamepadStatus>(
    GamepadStatus.Walking,
  );
  const { currEditType, pictureLibraryVisible, resetModalVisible } =
    useSelector((state: RootState) => state.gamePadSkin);

  const getScreenShot = useCallback(async () => {
    let url = '';
    try {
      // 获取 canvas
      const canvas = game.state.dom.canvas;
      if (!canvas) {
        return url;
      }
      // 获取 blob 对象
      const blob = await canvasToBlob(canvas, { type: 'png' });
      if (!blob) {
        return url;
      }
      // 获取 url
      url = URL.createObjectURL(blob);
      setScreenShot(url);
    } catch (err) {
      console.error('Failed to load screen shot', err);
    }
    return url;
  }, [game.state.dom.canvas]);

  useEffect(() => {
    let url = '';
    getScreenShot().then((res) => (url = res));
    return () => {
      // 组件卸载时，释放URL对象
      if (url) {
        URL.revokeObjectURL(url);
        setScreenShot('');
      }
    };
  }, [getScreenShot]);

  const onConfirm = useCallback(
    (selectedKey) => {
      setSkinByType(currEditType, selectedKey);
    },
    [currEditType],
  );

  const onUploadPictureClick = useUploadPicture({
    intl,
    editContentStorage,
    assetController,
    dispatch,
  });

  const pictureLibrary = useMemo(() => {
    if (!pictureLibraryVisible) {
      return;
    }

    return (
      <PictureLibrary
        onUploadClick={onUploadPictureClick}
        onClose={() => dispatch(setPictureLibraryVisible(false))}
        onConfirm={onConfirm}
      />
    );
  }, [dispatch, onConfirm, onUploadPictureClick, pictureLibraryVisible]);

  return (
    <>
      <div className={style.wrapper}>
        <div
          style={{ backgroundImage: `url(${screenShot})` }}
          className={style.container}
        >
          <Tabs
            className={style.tabList}
            defaultActiveId={gamepadState}
            activeId={gamepadState}
            onTabClick={(id) => {
              setGamepadState(Number(id));
            }}
          >
            <TabPanel
              key={GamepadStatus.Walking}
              id={GamepadStatus.Walking}
              type={'text'}
              tab={intl.formatMessage({ id: 'playerGamepadWalkingStatus' })}
            />
            <div className={style.divider} />
            <TabPanel
              key={GamepadStatus.flying}
              id={GamepadStatus.flying}
              type={'text'}
              tab={intl.formatMessage({ id: 'playerGamepadFlyingStatus' })}
            />
          </Tabs>
          <div className={style.gamepad}>
            <JoystickSkin />
            <ActionSkin isWalking={gamepadState === GamepadStatus.Walking} />
          </div>
        </div>
        {resetModalVisible && (
          <ModalView
            rootClassName={style.restoreModal}
            buttonSort="rtl"
            width={332}
            title={intl.formatMessage({ id: 'resetConfirmTips' })}
            confirmText={intl.formatMessage({ id: 'resetConfirm' })}
            cancelText={intl.formatMessage({
              id: 'gameUIPropImageRemoveCancel',
            })}
            onConfirm={() => {
              setSkinByType(currEditType, '');
              Toast.success({
                content: intl.formatMessage({
                  id: 'resetSuccess',
                }),
              });
              dispatch(setResetModalVisible(false));
            }}
            onCancel={() => {
              dispatch(setResetModalVisible(false));
            }}
          />
        )}
      </div>
      {pictureLibrary}
    </>
  );
};

export const setSkinByType = (type: GamepadSkinType, imageName: string) => {
  switch (type) {
    case GamepadSkinType.JoystickBg:
      editor.gamepadController.setJoystickBg(imageName);
      break;
    case GamepadSkinType.JoystickCtrl:
      editor.gamepadController.setJoystickCtrl(imageName);
      break;
    case GamepadSkinType.FlyBtn:
      editor.gamepadController.setFlyBtn(imageName);
      break;
    case GamepadSkinType.FlyBg:
      editor.gamepadController.setFlyBg(imageName);
      break;
    case GamepadSkinType.FlyCtrl:
      editor.gamepadController.setFlyCtrl(imageName);
      break;
    case GamepadSkinType.Jump:
      editor.gamepadController.setJump(imageName);
      break;
    case GamepadSkinType.Crouch:
      editor.gamepadController.setCrouch(imageName);
      break;
    case GamepadSkinType.ActionA:
      editor.gamepadController.setActionA(imageName);
      break;
    case GamepadSkinType.ActionB:
      editor.gamepadController.setActionB(imageName);
      break;
  }
};
