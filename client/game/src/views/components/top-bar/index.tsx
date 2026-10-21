import React, { useState } from 'react';
import * as qrcode from 'qrcode-generator';
import {
  loadSettings,
  getSettingLevels,
  LOCAL_STORAGE_KEY,
} from 'src/engine/settings/settings-controller';
import { Settings } from 'src/engine/settings/settings-schema';
import { Icon } from '../basic/icon';
import { Logo } from '../common/logo';
import { Modal } from '../common/modal';
import { notice } from '../common/notice';
import { useDidUpdateEffect } from 'src/utils/react-hooks/common';
import { isMobile, touchable } from 'src/utils/mobile';
import { intlMessage } from 'src/utils/i18n';
import { Layout } from './layout';
import style from './index.module.css';
import { isCreatera } from 'src/utils/appEdition';

interface Props {
  gameName: string;
  gameDesc: string;
  websiteURL: string;
  isPlay: boolean;
  setSettings: (settings: Partial<Settings>) => void;
  hideRightIcon?: boolean;
}

const _getVolume = () => {
  const settings = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!settings) {
    const { masterMute: mute } = loadSettings();
    return mute;
  }
  const { masterMute } = JSON.parse(settings);
  return masterMute;
};

const settingLevels = getSettingLevels();

const getInitialLevel = () => {
  const localSettings = localStorage.getItem('BOX3');
  if (!localSettings) {
    return isMobile() ? 0 : 1;
  }
  const settings = JSON.parse(localSettings);
  for (let i = 0; i < settingLevels.game.length; i++) {
    let equal = true;
    for (const prop in settingLevels.game[i]) {
      if (settingLevels.game[i][prop] !== settings[prop]) {
        equal = false;
      }
    }
    if (equal) {
      return i;
    }
  }
  return -1;
};
/**
 * @deprecated
 */
export function TopBar(props: Props) {
  const [masterMute, setMasterMute] = useState(_getVolume());
  const [graphicModalShow, setGraphicModalShow] = useState(false);
  const [shareModalShow, setShareModalShow] = useState(false);
  const [selectedGraphic, setSelectedGrpahic] = useState(getInitialLevel());
  const [qrCodeSrc, setQrCodeSrc] = useState('');
  const [hasShare, setHasShare] = useState(false);

  useDidUpdateEffect(() => {
    if (shareModalShow && props.isPlay) {
      const typeNumber = 0;
      const errorCorrectionLevel = 'L';

      const qr = qrcode.default(typeNumber, errorCorrectionLevel);
      qr.addData(location.href);
      qr.make();
      setQrCodeSrc(qr.createDataURL());
      if ((window.navigator as any).share) {
        setHasShare(true);
      }
    }
  }, [shareModalShow]);

  useDidUpdateEffect(() => {
    props.setSettings({ masterMute });
  }, [masterMute]);

  useDidUpdateEffect(() => {
    props.setSettings(settingLevels.game[selectedGraphic]);
    setGraphicModalShow(false);
  }, [selectedGraphic]);

  const graphicsQualities = [
    { key: 0, text: intlMessage('graphicsSettingLow') },
    { key: 1, text: intlMessage('graphicsSettingMedium') },
    { key: 2, text: intlMessage('graphicsSettingHigh') },
  ];

  const handleShareClick = () => {
    if (hasShare) {
      (window.navigator as any)
        .share({
          title: props.gameName,
          url: window.location.href,
        })
        .catch(() => {
          notice.error(intlMessage('shareFail'));
        });
    }
  };
  let logoSize = isMobile() ? 30 : 40;
  return (
    <>
      {isCreatera() ? (
        <Layout
          left={
            <Logo
              white
              size={logoSize}
              width={isMobile() ? '130px' : '164px'}
            />
          }
          right={
            !props.hideRightIcon ? (
              <>
                <div
                  className={style.iconWrapper}
                  onClick={() => setMasterMute((prev) => !prev)}
                >
                  <Icon
                    icon={masterMute ? 'voiceOff' : 'voiceOn'}
                    size={isMobile() ? 16 : 24}
                  />
                </div>
              </>
            ) : (
              <></>
            )
          }
        />
      ) : (
        <Layout
          left={<div></div>}
          right={
            <>
              <div
                className={style.iconWrapper}
                onClick={() => setMasterMute((prev) => !prev)}
              >
                <Icon
                  icon={masterMute ? 'voiceOff' : 'voiceOn'}
                  size={isMobile() ? 16 : 24}
                />
              </div>
            </>
          }
        />
      )}
      {graphicModalShow && (
        <Modal onClose={() => setGraphicModalShow(false)}>
          <div className={style.modalGraphicWrapper}>
            <div className={style.modalTitleWrapper}>
              <div>{intlMessage('chooseGraphic')}</div>
              <Icon
                icon="close"
                size={24}
                onClick={() => setGraphicModalShow(false)}
              />
            </div>
            <div className={style.modalGraphicContentWrapper}>
              {graphicsQualities.map((graphic, key) => {
                let optionClass = style.Setting_option;
                if (selectedGraphic === key) {
                  optionClass += ` ${style.Setting_option__selected}`;
                }
                return (
                  <div
                    key={graphic.key}
                    className={optionClass}
                    onClick={() =>
                      touchable ? false : setSelectedGrpahic(graphic.key)
                    }
                    onTouchStart={() =>
                      touchable ? setSelectedGrpahic(graphic.key) : false
                    }
                  >
                    <span>{graphic.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
      {props.isPlay && shareModalShow && (
        <Modal onClose={() => setShareModalShow(false)}>
          <div className={style.modalWrapper}>
            <div className={style.modalTitleWrapper}>
              <div>{intlMessage('shareMap')}</div>
              <Icon
                icon="close"
                size={24}
                onClick={() => setShareModalShow(false)}
              />
            </div>
            <div className={style.qrCodeText}>{intlMessage('scanQRCode')}</div>
            <div className={style.modalContentWrapper}>
              <div className={style.shareWrapper}>
                <div className={style.qrCodeImg}>
                  <img src={qrCodeSrc} alt="" />
                </div>
              </div>
              <div className={style.infoWrapper}>
                <div className={style.shareMapName}>
                  {intlMessage('game')}: {props.gameName}
                </div>
                <div className={style.shareMapDesc}>
                  {intlMessage('description')}: {props.gameDesc}
                </div>
              </div>
            </div>
            {hasShare && (
              <div className={style.shareButton} onClick={handleShareClick}>
                {intlMessage('share')}
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
