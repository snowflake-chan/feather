import React, { useState, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Settings } from 'src/engine/settings/settings-schema';

import { DetailPanel } from '../detailPanel';
import { VolumeController } from '../volumeController';
import { GraphSetting } from 'src/views/components/edit/settingPanel/graphicSetting';
import { KeyBinding } from 'src/views/components/edit/settingPanel/keybind';
import { RadioBtn } from 'src/views/components/basic/radioBtn';
import { NumberProperty } from 'src/views/components/edit/property';
import { isMobile, isTablet } from 'src/utils/mobile';
import { RootState } from 'src/redux/edit';
import { LangType, setUserLanguage } from 'src/apis/createra';
import { setCookies } from 'src/utils/cookie';
import style from './index.module.scss';
import { createExpires } from 'src/utils/date';
import { useEdit } from 'src/client/edit/edit-context';
import { clientConfig } from 'src/config/client';

type Props = {
  closeModal: () => void;
  setLocale: (locale: LangType) => void;
};

export const SettingPanel = (props: Props) => {
  const editor = useEdit();
  const userId = useSelector((state: RootState) => state.user.id);
  const intl = useIntl();
  const [settings, setSettingData] = useState(editor.game.state.settings);

  const setSettings = useCallback(
    (data: Partial<Settings>) => {
      setSettingData({ ...settings, ...data });
      editor.setGameSettings(data);
    },
    [editor, settings],
  );

  const setGraph = useCallback(
    (data: Partial<Settings>) => {
      setSettings(data);
    },
    [setSettings],
  );

  const changeLanguage = useCallback(
    async (lang: LangType) => {
      if (userId) {
        // 已登陆用户:后端-修改用户语言环境
        await setUserLanguage(lang);
      } else {
        // 游客:本地-修改cookie
        setCookies('locale', lang, { expires: createExpires(1) });
      }
      props.setLocale(lang);
      setSettings({ language: lang });
    },
    [props, setSettings, userId],
  );

  const _renderGraph = useCallback(() => {
    return <GraphSetting settings={settings} setGameSettings={setGraph} />;
  }, [setGraph, settings]);

  const _renderControl = useCallback(() => {
    return (
      <div className={style.container}>
        <NumberProperty
          name={intl.formatMessage({ id: 'cameraSensitivity' })}
          value={settings.cameraSensitivity}
          onChange={(e) => {
            const cameraSensitivity = +e;
            if (isNaN(cameraSensitivity)) {
              return;
            }
            setSettings({
              cameraSensitivity,
            });
          }}
          slider={[0.01, 3]}
        />
        {!isMobile() ? (
          <KeyBinding inputController={editor.game.input} />
        ) : null}
      </div>
    );
  }, [editor.game.input, intl, setSettings, settings.cameraSensitivity]);
  const _renderVolumeControl = useCallback(() => {
    return (
      <VolumeController settings={settings} setGameSettings={setSettings} />
    );
  }, [setSettings, settings]);
  const _renderLanguage = useCallback(() => {
    return (
      <div>
        <div className={style.radioContainer}>
          <RadioBtn
            checked={intl.locale === 'zh'}
            onChange={() => changeLanguage('zh')}
            text={'简体中文'}
          />
        </div>
        <div className={style.radioContainer}>
          <RadioBtn
            checked={intl.locale === 'en'}
            onChange={() => changeLanguage('en')}
            text={'English'}
          />
        </div>
      </div>
    );
  }, [changeLanguage, intl.locale]);

  const _renderAbout = useCallback(() => {
    const item = (title: string, content: React.ReactNode) => (
      <div className={style.item}>
        <div className={style.title}>{title}</div>
        <div className={style.content}>{content}</div>
      </div>
    );

    return (
      <div className={style.aboutContainer}>
        <div className={style.sectionTitle}>
          {intl.formatMessage({ id: 'aboutProjectSection' })}
        </div>
        <div className={style.itemWrapper}>
          {item(
            intl.formatMessage({ id: 'aboutProjectName' }),
            clientConfig.mapInfo?.name || clientConfig.name || '-',
          )}
          {item(
            intl.formatMessage({ id: 'aboutProjectId' }),
            clientConfig.mapInfo?.permanentMapId || '-',
          )}
        </div>

        <div className={style.sectionTitle}>{intl.formatMessage({ id: 'aboutEngineSection' })}</div>
        <div className={`${style.itemWrapper} ${style.lastItemWrapper}`}>
          {item(
            intl.formatMessage({ id: 'aboutEngineVersion' }),
            `${(clientConfig.localRuntimeInfo?.productVersion || '0.2.0').replace(/^v/, '')}-local`,
          )}
          {item(
            intl.formatMessage({ id: 'aboutEngineDeveloper' }),
            intl.formatMessage({ id: 'aboutEngineDeveloperValue' }),
          )}
        </div>
      </div>
    );
  }, [intl]);

  return (
    <DetailPanel
      className={style.settingPanel}
      onClose={props.closeModal}
      contentWrapperStyle={{ overflowY: 'scroll' }}
      contentList={[
        {
          title: intl.formatMessage({ id: 'graphics' }),
          content: _renderGraph,
          tab: <div className={style.graphIcon}></div>,
          contentContainerStyle: { width: '448px' },
        },
        {
          title: intl.formatMessage({ id: 'control' }),
          content: _renderControl,
          tab: <div className={style.controlIcon}></div>,
          borderRadius: !isMobile() ? true : undefined,
          contentContainerStyle: { width: '448px' },
        },
        {
          title: intl.formatMessage({ id: 'sound' }),
          content: _renderVolumeControl,
          tab: <div className={style.volumeIcon}></div>,
          contentContainerStyle: { width: '448px' },
        },
        {
          title: intl.formatMessage({ id: 'language' }),
          content: _renderLanguage,
          tab: <div className={style.languageIcon}></div>,
          contentContainerStyle: { width: '448px' },
        },
        {
          title: intl.formatMessage({ id: 'about' }),
          content: () => _renderAbout(),
          tab: <div className={style.aboutIcon}></div>,
          contentContainerStyle: { width: '448px' },
        },
      ]}
    />
  );
};
