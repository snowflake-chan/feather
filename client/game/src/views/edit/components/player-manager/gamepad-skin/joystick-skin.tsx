import React, { useContext, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { GamepadSkinType } from 'src/redux/edit/gamepad-skin';
import { SkinButton } from './skin-button';
import { ArenaEditorUIContext } from 'src/views/edit/editor-ui-context';
import { useEdit } from 'src/client/edit/edit-context';

import style from './style.module.scss';

export const JoystickSkin = () => {
  const intl = useIntl();
  const editor = useEdit();
  const joystick = editor.state.replica.project.gamepad.joystick;
  const [background, setBackground] = useState<string>(joystick.background);
  const [controller, setController] = useState<string>(joystick.controller);

  const { replica } = useContext(ArenaEditorUIContext);
  useEffect(() => {
    setBackground(joystick.background);
    setController(joystick.controller);
    // 依赖replica，但实际从editor取
  }, [joystick, replica]);

  return (
    <div className={style.joystickWrapper}>
      <div className={style.backgroundWrapper}>
        <SkinButton
          type={GamepadSkinType.JoystickBg}
          skinName={background}
          tooltipText={intl.formatMessage({
            id: 'joystickBackgroundTooltip',
          })}
        >
          <div className={style.initBackground}>
            <div className={`${style.arrowUp} ${style.arrow}`} />
            <div className={`${style.arrowDown} ${style.arrow}`} />
            <div className={`${style.arrowLeft} ${style.arrow}`} />
            <div className={`${style.arrowRight} ${style.arrow}`} />
          </div>
        </SkinButton>
      </div>
      <div className={style.controllerWrapper}>
        <SkinButton
          type={GamepadSkinType.JoystickCtrl}
          skinName={controller}
          tooltipText={intl.formatMessage({
            id: 'joystickControllerTooltip',
          })}
        >
          <div className={style.initController} />
        </SkinButton>
      </div>
    </div>
  );
};
