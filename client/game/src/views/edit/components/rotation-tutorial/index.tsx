import React, { useEffect, useState } from 'react';
import { editor } from 'src/client/edit/edit-client';
import style from './index.module.css';
import { useIntl } from 'react-intl';

export const RotationTurorial = () => {
  const intl = useIntl();
  const [type, setType] = useState(editor.state.rotationTutorial);
  useEffect(() => {
    editor.listeners.rotationTutorial.sub((data) => {
      setType(data);
    });
    return () => editor.listeners.rotationTutorial.unsubAll();
  }, []);
  return !!type ? (
    <div className={style.container}>
      <span>
        {type === 'left'
          ? intl.formatMessage({ id: 'CLICK' })
          : intl.formatMessage({ id: 'press' })}
      </span>
      <div
        className={type === 'left' ? style.mouseIconLeft : style.mouseIcon}
      ></div>
      <span>
        {type === 'left'
          ? intl.formatMessage({ id: 'leftButton' })
          : intl.formatMessage({ id: 'rightButton' })}
      </span>
      <span>{intl.formatMessage({ id: 'adjustDirection' })}</span>
    </div>
  ) : (
    <></>
  );
};
