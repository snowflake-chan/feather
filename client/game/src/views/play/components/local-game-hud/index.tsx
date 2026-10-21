import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  DoorOpen,
  Expand,
  Info,
  Menu,
  Minimize,
  Settings,
  UserRoundCog,
} from 'lucide-react';

import { usePlayer } from 'src/client/play/play-context';
import { clientConfig } from 'src/config/client';
import { resolvePublicUrl } from 'src/utils/public-url';
import {
  PlayerProfileDialog,
  type PlayerProfileChanges,
} from 'components/player-account/player-account';
import { exitPointerLock } from 'src/engine/utils/pointer-lock';
import { RootState } from 'src/redux/play';
import { setUIConfig } from 'src/redux/slices/UIConfig';
import { intlMessage } from 'src/utils/i18n';
import { InputPauseConsumer } from 'src/views/components/input-lock';

import style from './index.module.css';

type Panel = 'menu' | 'avatar' | 'about' | 'exit' | null;

type Profile = {
  displayName: string;
  username: string;
  userId: string;
  boxId: string;
  avatarSkinId: string;
};

export function LocalGameHud() {
  const player = usePlayer();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [panel, setPanel] = useState<Panel>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    displayName: user.displayName || '',
    username: '',
    userId: '',
    boxId: '',
    avatarSkinId: 'explorer',
  });
  const engineVersion = `${(clientConfig.localRuntimeInfo?.productVersion || '0.2.0').replace(/^v/, '')}-local`;
  const buildCommit = clientConfig.localRuntimeInfo?.buildCommit;
  const buildVersion = buildCommit && buildCommit !== 'unknown'
    ? `${engineVersion} · ${buildCommit.slice(0, 7)}`
    : engineVersion;

  const toggleMenu = () => {
    exitPointerLock();
    setPanel((current) => (current === 'menu' ? null : 'menu'));
  };

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', sync);
    sync();
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  useEffect(() => {
    if (panel !== 'avatar') return;
    fetch('/api/play-library', { credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) throw new Error(intlMessage('localHud.profileLoadFailed'));
        const data = await response.json();
        setProfile({
          displayName: data.player?.displayName || user.displayName || '',
          username: data.player?.username || '',
          userId: data.player?.userId || '',
          boxId: data.player?.boxId || '',
          avatarSkinId: data.player?.avatarSkinId || 'explorer',
        });
      })
      .catch((error) => console.warn('Unable to load player profile', error));
  }, [panel, user.displayName]);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (error) {
      console.warn('Fullscreen is unavailable', error);
    }
    setPanel(null);
  };

  const openSettings = () => {
    setPanel(null);
    dispatch(setUIConfig({ settings: true }));
  };

  const saveProfile = async (changes: PlayerProfileChanges) => {
    const response = await fetch('/api/play-profile', {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || intlMessage('localHud.profileSaveFailed'));
    const nextProfile = {
      ...profile,
      displayName: data.player?.displayName || changes.displayName,
      avatarSkinId: data.player?.avatarSkinId || changes.avatarSkinId,
    };
    setProfile(nextProfile);
    player.selectBuiltInAvatarSkin(nextProfile.avatarSkinId);
  };

  return (
    <div className={style.hud}>
      {panel && <button className={style.dismissLayer} aria-label={intlMessage('localHud.closeMenu')} onClick={() => setPanel(null)} />}

      <nav className={style.nav} aria-label={intlMessage('localHud.quickActions')}>
        <button
          type="button"
          className={`${style.circleButton} ${panel === 'menu' ? style.circleButtonActive : ''}`}
          title={intlMessage('localHud.menu')}
          aria-label={intlMessage('localHud.menu')}
          aria-pressed={panel === 'menu'}
          onClick={toggleMenu}
        >
          <Menu />
        </button>
      </nav>

      {panel === 'menu' && (
        <InputPauseConsumer>
          <section className={`${style.popover} ${style.menuPanel}`} aria-label={intlMessage('localHud.gameMenu')}>
            <button type="button" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize /> : <Expand />}
              <span>{isFullscreen ? intlMessage('localHud.exitFullscreen') : intlMessage('localHud.enterFullscreen')}</span>
            </button>
            <button type="button" onClick={() => setPanel('avatar')}>
              <UserRoundCog />
              <span>{intlMessage('localHud.editProfile')}</span>
            </button>
            <button type="button" onClick={openSettings}>
              <Settings />
              <span>{intlMessage('settings')}</span>
            </button>
            <button type="button" onClick={() => setPanel('about')}>
              <Info />
              <span>{intlMessage('localHud.about')}</span>
            </button>
            <button type="button" onClick={() => setPanel('exit')}>
              <DoorOpen />
              <span>{intlMessage('localHud.exitMap')}</span>
            </button>
          </section>
        </InputPauseConsumer>
      )}

      {panel === 'exit' && (
        <InputPauseConsumer>
          <div className={style.modalLayer} role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPanel(null);
          }}>
            <section className={`${style.modal} ${style.confirmModal}`} role="dialog" aria-modal="true" aria-labelledby="exit-title">
              <strong id="exit-title">{intlMessage('localHud.exitTitle')}</strong>
              <p>{intlMessage('localHud.exitDescription')}</p>
              <footer>
                <button className={style.secondaryButton} onClick={() => setPanel(null)}>{intlMessage('localHud.continuePlaying')}</button>
                <button className={style.dangerButton} onClick={() => window.location.assign(resolvePublicUrl('/'))}>{intlMessage('localHud.exitMap')}</button>
              </footer>
            </section>
          </div>
        </InputPauseConsumer>
      )}

      {panel === 'about' && (
        <InputPauseConsumer>
          <div
            className={style.modalLayer}
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setPanel(null);
            }}
          >
            <section
              className={`${style.modal} ${style.aboutModal}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="about-title"
            >
              <header>
                <strong id="about-title">{intlMessage('localHud.aboutTitle')}</strong>
              </header>
              <div className={style.aboutBody}>
                <dl className={style.aboutFacts}>
                  <div className={style.aboutBuild}>
                    <dt>{intlMessage('localHud.buildVersion')}</dt>
                    <dd>{buildVersion}</dd>
                  </div>
                  <div className={style.aboutFact}>
                    <dt>{intlMessage('aboutEngineDeveloper')}</dt>
                    <dd>{intlMessage('aboutEngineDeveloperValue')}</dd>
                  </div>
                  <div className={style.aboutFact}>
                    <dt>{intlMessage('aboutCopyright')}</dt>
                    <dd>{intlMessage('aboutCopyrightValue')}</dd>
                  </div>
                </dl>
                <section className={style.aboutNotice} aria-labelledby="about-notice-title">
                  <strong id="about-notice-title">{intlMessage('aboutDeclaration')}</strong>
                  <p>{intlMessage('aboutLocalDeploymentDeclaration')}</p>
                </section>
              </div>
              <footer>
                <button className={style.secondaryButton} onClick={() => setPanel(null)}>
                  {intlMessage('localHud.closeAbout')}
                </button>
              </footer>
            </section>
          </div>
        </InputPauseConsumer>
      )}

      {panel === 'avatar' && (
        <InputPauseConsumer>
          <PlayerProfileDialog identity={profile} onSave={saveProfile} onClose={() => setPanel(null)} />
        </InputPauseConsumer>
      )}
    </div>
  );
}
