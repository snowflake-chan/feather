import React, { useContext, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { SkinButton } from './skin-button';
import { GamepadSkinType } from 'src/redux/edit/gamepad-skin';
import { useEdit } from 'src/client/edit/edit-context';
import { ArenaEditorUIContext } from 'src/views/edit/editor-ui-context';

import style from './style.module.scss';

export const ActionSkin = (props: { isWalking: boolean }) => {
  const { isWalking } = props;
  const intl = useIntl();
  const editor = useEdit();
  const gamepad = editor.state.replica.project.gamepad;
  const [actionA, setActionA] = useState<string>(gamepad.buttons.actionA);
  const [actionB, setActionB] = useState<string>(gamepad.buttons.actionB);
  const [crouch, setCrouch] = useState<string>(gamepad.buttons.crouch);
  const [jump, setJump] = useState<string>(gamepad.buttons.jump);
  const [button, setButton] = useState<string>(gamepad.fly.button);
  const [flyingBackground, setFlyingBackground] = useState<string>(
    gamepad.fly.flyingBackground,
  );
  const [flyingController, setFlyingController] = useState<string>(
    gamepad.fly.flyingController,
  );

  const { replica } = useContext(ArenaEditorUIContext);
  useEffect(() => {
    setActionA(gamepad.buttons.actionA);
    setActionB(gamepad.buttons.actionB);
    setCrouch(gamepad.buttons.crouch);
    setJump(gamepad.buttons.jump);
    setButton(gamepad.fly.button);
    setFlyingBackground(gamepad.fly.flyingBackground);
    setFlyingController(gamepad.fly.flyingController);
    // 依赖replica，但实际从editor取
  }, [gamepad, replica]);

  return (
    <div className={style.actionWrapper}>
      {isWalking ? (
        <div className={`${style.actionBtnWrapper} ${style.flyWrapper}`}>
          <SkinButton
            type={GamepadSkinType.FlyBtn}
            skinName={button}
            tooltipPlacement="topRight"
            tooltipAlign={{ offset: [-48, 30] }}
            tooltipText={intl.formatMessage({
              id: 'actionBtnTooltip',
            })}
          >
            <div className={style.initAction}>
              <div className={`${style.actionIcon} ${style.flyIcon}`} />
            </div>
          </SkinButton>
        </div>
      ) : (
        <>
          <div
            className={`${style.actionBtnWrapper} ${style.flyBackgroundWrapper}`}
          >
            <SkinButton
              type={GamepadSkinType.FlyBg}
              skinName={flyingBackground}
              tooltipPlacement="topRight"
              tooltipAlign={{ offset: [-32, 30] }}
              tooltipText={intl.formatMessage({
                id: 'flyBackgroundTooltip',
              })}
            >
              <div className={style.initAction}>
                <div
                  className={`${style.actionIcon} ${style.flyBackgroundIcon} ${style.arrowUp}`}
                />
                <div
                  className={`${style.actionIcon} ${style.flyBackgroundIcon} ${style.arrowDown}`}
                />
              </div>
            </SkinButton>
          </div>
          <div className={`${style.actionBtnWrapper} ${style.flyWrapper}`}>
            <SkinButton
              type={GamepadSkinType.FlyCtrl}
              skinName={flyingController}
              tooltipPlacement="topRight"
              tooltipAlign={{ offset: [-48, 30] }}
              tooltipText={intl.formatMessage({
                id: 'actionBtnTooltip',
              })}
            >
              <div className={`${style.initAction} ${style.initFlyController}`}>
                <div
                  className={`${style.actionIcon} ${style.flyReversedIcon}`}
                />
              </div>
            </SkinButton>
          </div>
        </>
      )}
      {isWalking && (
        <div className={`${style.actionBtnWrapper} ${style.jumpWrapper}`}>
          <SkinButton
            type={GamepadSkinType.Jump}
            skinName={jump}
            tooltipPlacement="topRight"
            tooltipAlign={{ offset: [-64, 30] }}
            tooltipText={intl.formatMessage({
              id: 'jumpBtnTooltip',
            })}
          >
            <div className={`${style.initAction} ${style.initJump}`}>
              <div className={`${style.actionIcon} ${style.jumpIcon}`} />
            </div>
          </SkinButton>
        </div>
      )}
      {isWalking && (
        <div className={`${style.actionBtnWrapper} ${style.crouchWrapper}`}>
          <SkinButton
            type={GamepadSkinType.Crouch}
            skinName={crouch}
            tooltipPlacement="topRight"
            tooltipAlign={{ offset: [-48, 30] }}
            tooltipText={intl.formatMessage({
              id: 'actionBtnTooltip',
            })}
          >
            <div className={style.initAction}>
              <div className={`${style.actionIcon} ${style.crouchIcon}`} />
            </div>
          </SkinButton>
        </div>
      )}
      <div className={`${style.actionBtnWrapper} ${style.actionAWrapper}`}>
        <SkinButton
          type={GamepadSkinType.ActionA}
          skinName={actionA}
          tooltipPlacement="topRight"
          tooltipAlign={{ offset: [-48, 30] }}
          tooltipText={intl.formatMessage({
            id: 'actionBtnTooltip',
          })}
        >
          <div className={style.initAction}>
            <div className={`${style.actionIcon} ${style.actionAIcon}`} />
          </div>
        </SkinButton>
      </div>
      <div className={`${style.actionBtnWrapper} ${style.actionBWrapper}`}>
        <SkinButton
          type={GamepadSkinType.ActionB}
          skinName={actionB}
          tooltipPlacement="topRight"
          tooltipAlign={{ offset: [-48, 30] }}
          tooltipText={intl.formatMessage({
            id: 'actionBtnTooltip',
          })}
        >
          <div className={style.initAction}>
            <div className={`${style.actionIcon} ${style.actionBIcon}`} />
          </div>
        </SkinButton>
      </div>
    </div>
  );
};
