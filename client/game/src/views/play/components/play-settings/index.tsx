import React, { useState } from 'react';
import { X } from 'lucide-react';
import { GraphSetting } from './graphSettings';
import { ControlSettings } from './controlSettings/index';
import { Settings } from 'src/engine/settings/settings-schema';
import { VolumeController } from './volumeController';
import { usePlayer } from 'src/client/play/play-context';
import { intlMessage } from 'src/utils/i18n';
import style from './index.module.css';

const fallbackStyles = {
  panel: {
    display: 'flex',
    width: 'min(420px, calc(100vw - 22px))',
    height: '100vh',
    flexDirection: 'column' as const,
    background: 'rgba(4, 27, 29, 0.94)',
    boxShadow: '-16px 0 40px rgba(0, 0, 0, 0.32)',
    backdropFilter: 'blur(14px)',
    position: 'fixed' as const,
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '22px 22px 16px',
  },
  close: {
    display: 'grid',
    width: 30,
    height: 30,
    flex: '0 0 auto',
    placeItems: 'center',
    cursor: 'pointer',
    padding: 0,
    border: 0,
    borderRadius: 7,
    color: 'rgba(255, 255, 255, 0.62)',
    background: 'transparent',
  },
  content: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '8px 22px 24px',
    marginRight: 2,
  },
};

export enum SettingType {
  Main,
  Graph,
  Sound,
  Control,
  Comment,
}
type Props = {
  isPortrait: boolean;
  onClose: () => void;
};

export const GamePlaySettings = React.memo((props: Props) => {
  const player = usePlayer();
  const [settingType, setSettingType] = useState(SettingType.Graph);
  const [settings, setSettingData] = useState(player.state.settings);

  const setSettings = (data: Partial<Settings>) => {
    setSettingData({ ...settings, ...data });
    player.setGameSettings(data);
  };

  const navList = [
    {
      type: SettingType.Graph,
      intl: intlMessage('graphics'),
    },
    {
      type: SettingType.Sound,
      intl: intlMessage('sound'),
    },
    {
      type: SettingType.Control,
      intl: intlMessage('control'),
    },
  ];
  const getContent = () => {
    switch (settingType) {
      case SettingType.Control:
        return (
          <ControlSettings settings={settings} setGameSettings={setSettings} />
        );
      case SettingType.Sound:
        return (
          <VolumeController settings={settings} setGameSettings={setSettings} />
        );

      default:
        return (
          <GraphSetting settings={settings} setGameSettings={setSettings} />
        );
    }
  };
  return (
    <div className={style.panel_wrapper} style={fallbackStyles.panel}>
      <div className={style.nav_wrapper} style={fallbackStyles.nav}>
        <div className={style.titleRow}>
          <div>
            <strong>{intlMessage('settings')}</strong>
            <small>{intlMessage('localHud.settingsDescription')}</small>
          </div>
          <button
            className={style.close_btn}
            style={fallbackStyles.close}
            type="button"
            aria-label={intlMessage('localHud.closeSettings')}
            onClick={props.onClose}
          >
            <X />
          </button>
        </div>
        <div className={style.nav_bar}>
          {navList.map((item) => (
            <button
              type="button"
              key={item.type}
              className={`${style.nav_item} ${
                settingType === item.type && style.nav_active
              }`}
              onClick={() => setSettingType(item.type)}
            >
              {item.intl}
            </button>
          ))}
        </div>
      </div>
      <div className={style.content_wrapper} style={fallbackStyles.content}>{getContent()}</div>
    </div>
  );
});

GamePlaySettings.displayName = 'GamePlaySettings';
