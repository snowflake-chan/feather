import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getSettingLevels } from 'src/engine/settings/settings-controller';
import { setUIConfig } from 'src/redux/slices/UIConfig';
import { intlMessage } from 'src/utils/i18n';
import { Button } from '../edit/button';
import type { EngineClient } from 'src/client/client';
import style from './index.module.css';

export const LowFrameRateModal = (props: { client: EngineClient }) => {
  const dispatch = useDispatch();
  const [countdown, setCountdown] = useState(10);

  const _countdownTimer = useRef<number>(undefined);
  useEffect(() => {
    if (countdown > 0) {
      _countdownTimer.current = window.setTimeout(() => {
        _countdownTimer.current = undefined;
        setCountdown(countdown - 1);
      }, 1000);
    } else {
      setCountdown(0);
      onClose();
    }

    return () => {
      if (_countdownTimer) {
        window.clearTimeout(_countdownTimer.current);
        _countdownTimer.current = undefined;
      }
    };
  }, [countdown]);

  const onConfirm = () => {
    props.client.setGameSettings(getSettingLevels().game[0]);
    onClose();
  };

  const onClose = () => {
    dispatch(setUIConfig({ lowFrameRate: false }));

    if (_countdownTimer) {
      clearTimeout(_countdownTimer.current);
      _countdownTimer.current = undefined;
    }
  };

  return (
    <div className={style.modalContainer}>
      <div className={style.title}>{intlMessage('lowFrameRateModalTitle')}</div>
      <div className={style.content}>
        {intlMessage('lowFrameRateModalContent')}
      </div>
      <div className={style.operations}>
        <div className={style.cancelBtn}>
          <Button
            style={{
              fontFamily: 'Montserrat-Bold',
              fontSize: '12px',
              lineHeight: '18px',
              padding: '7px 16px',
              borderRadius: '100px',
              background: '#404040',
            }}
            value={`${intlMessage('ignore')} (${countdown})`}
            onClick={onClose}
          />
        </div>
        <div className={style.confirmBtn}>
          <Button
            style={{
              fontFamily: 'Montserrat-Bold',
              fontSize: '12px',
              lineHeight: '18px',
              padding: '7px 16px',
              borderRadius: '100px',
              background: '#fff',
              color: '#000',
            }}
            type={'primary'}
            value={intlMessage('downgrade')}
            onClick={onConfirm}
          />
        </div>
      </div>
    </div>
  );
};
