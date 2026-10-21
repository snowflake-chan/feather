import React, { useState } from 'react';
import { Settings } from 'src/engine/settings/settings-schema';
import { Range } from '../../basic/inputSlider';
import { throttle } from 'src/utils/debounce-throttle';
import { Icon } from 'src/views/components/basic/icon';

import { intlMessage } from 'src/utils/i18n';

import styles from './index.module.css';

type Props = {
  settings: Settings;
  setGameSettings: (settings: Partial<Settings>) => void;
};

// TODO 修改此逻辑初始值获取不用通过props传递
export function VolumeController(props: Props) {
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
      title: intlMessage('masterVolume'),
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
      title: intlMessage('effectVolume'),
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
      title: intlMessage('uiVolume'),
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
      title: intlMessage('backgroundVolume'),
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
        return (
          <div className={styles.wrapper} key={item.title}>
            <div className={styles.title}>
              {title}: {isMute ? intlMessage('warnMuted') : value}
            </div>
            <div className={styles.rangeWrapper}>
              <Range
                value={Math.floor(value)}
                onValueChange={(value: number) => {
                  throttle(() => onVolumeChange(+value), 50);
                }}
                step={1}
                min={0}
                max={100}
                disabled={isMute || masterMute}
                dragEndCb={(value: number) => {
                  onVolumeChange(+value);
                }}
              />
              <div
                className={styles.mute}
                onClick={() => onMuteChange(!isMute)}
              >
                <Icon icon={isMute ? 'voiceOff' : 'voiceOn'}></Icon>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
