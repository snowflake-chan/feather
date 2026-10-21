import React, { useState } from 'react';
import { Settings } from 'src/engine/settings/settings-schema';
import { NumberProperty } from '../../../components/edit/property';
import { calc_class_name } from 'src/utils/classname';

import styles from './index.module.css';
import { useIntl } from 'react-intl';

type Props = {
  settings: Settings;
  setGameSettings: (settings: Partial<Settings>) => void;
};

export function VolumeController(props: Props) {
  const intl = useIntl();
  const { settings } = props;
  const {
    masterMute: masterMuteFromStorage,
    masterVolume: masterVolumeFromStorage,
    musicMute: musicMuteFromStorage,
    musicVolume: musicVolumeFromStorage,
    effectsMute: effectsMuteFromStorage,
    effectsVolume: effectsVolumeFromStorage,
    uiMute: uiMuteFromStorage,
    uiVolume: uiVolumeFromStorage,
  } = settings;
  const [masterMute, setMasterMute] = useState(masterMuteFromStorage);
  const [masterVolume, setMasterVolume] = useState(
    masterVolumeFromStorage * 100,
  );
  const [musicMute, setMusicMute] = useState(musicMuteFromStorage);
  const [musicVolume, setMusicVolume] = useState(musicVolumeFromStorage * 100);
  const [effectsMute, setEffectsMute] = useState(effectsMuteFromStorage);
  const [effectsVolume, setEffectsVolume] = useState(
    effectsVolumeFromStorage * 100,
  );
  const [uiMute, setUiMute] = useState(uiMuteFromStorage);
  const [uiVolume, setUiVolume] = useState(uiVolumeFromStorage * 100);

  const volumeArray = [
    {
      title: intl.formatMessage({ id: 'masterVolume' }),
      isMute: masterMute,
      value: masterVolume,
      onMuteChange: (v) => {
        setMasterMute(v);
        props.setGameSettings({ masterMute: v });
      },
      onVolumeChange: (v) => {
        setMasterVolume(v);
        props.setGameSettings({ masterVolume: v / 100 });
      },
    },
    {
      title: intl.formatMessage({ id: 'effectVolume' }),
      isMute: effectsMute,
      value: effectsVolume,
      onMuteChange: (v) => {
        setEffectsMute(v);
        props.setGameSettings({ effectsMute: v });
      },
      onVolumeChange: (v) => {
        setEffectsVolume(v);
        props.setGameSettings({ effectsVolume: v / 100 });
      },
    },
    {
      title: intl.formatMessage({ id: 'uiVolume' }),
      isMute: uiMute,
      value: uiVolume,
      onMuteChange: (v) => {
        setUiMute(v);
        props.setGameSettings({ uiMute: v });
      },
      onVolumeChange: (v) => {
        setUiVolume(v);
        props.setGameSettings({ uiVolume: v / 100 });
      },
    },
    {
      title: intl.formatMessage({ id: 'backgroundVolume' }),
      isMute: musicMute,
      value: musicVolume,
      onMuteChange: (v) => {
        setMusicMute(v);
        props.setGameSettings({ musicMute: v });
      },
      onVolumeChange: (v) => {
        setMusicVolume(v);
        props.setGameSettings({ musicVolume: v / 100 });
      },
    },
  ];

  return (
    <div>
      {volumeArray.map((item, index) => {
        const { title, isMute, value, onMuteChange, onVolumeChange } = item;
        const isMaster = title === intl.formatMessage({ id: 'masterVolume' });
        const disableVolume = !isMaster && masterMute;
        return (
          <React.Fragment key={index}>
            <NumberProperty
              disabled={isMute || masterMute}
              disabledStyle={
                disableVolume ? styles.disableWrapper : styles.enableWrapper
              }
              name={title}
              value={value}
              slider={[0, 100]}
              onChange={(v) => onVolumeChange(+v)}
              icon={calc_class_name(
                isMute ? styles.iconMute : styles.iconVolume,
                disableVolume ? styles.disableCursor : null,
              )}
              iconStyle={calc_class_name(
                styles.normalIcon,
                disableVolume ? styles.disable : styles.enable,
              )}
              onIconClick={() => onMuteChange(!isMute)}
            />
            {index === 0 && <div className={styles.line} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
