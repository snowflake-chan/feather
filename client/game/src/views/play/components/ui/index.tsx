import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { GamePlaySettings } from '../play-settings';
import { PlayHyperLink } from '../play-hyperLink';
import { RootState } from 'src/redux/play';
import { messenger } from 'src/messenger';
import { usePlayer } from 'src/client/play/play-context';
import { LowFrameRateModal } from 'src/views/components/low-frame-rate-modal';
import { setUIConfig } from 'src/redux/slices/UIConfig';

import style from './index.module.css';
import { LangType } from 'src/apis/createra';
import { hideAdmin, showAdmin, useAdmin } from 'src/entry/admin-ui';
import { clientConfig } from 'src/config/client';
import { LocalGameHud } from '../local-game-hud';

export enum DotType {
  MENU = 'menu',
  SHARE_LINK = 'shareLink',
  EDIT_AVATAR = 'editAvatar',
}

type PlayUIProps = {
  setLocale: (locale: LangType) => void;
};
export const PlayUIComponent = React.memo((props: PlayUIProps) => {
  const player = usePlayer();
  const dispatch = useDispatch();
  const uiConfig = useSelector((state: RootState) => state.UIConfig);
  const isLocalEngine = clientConfig.isLocalGameServer;

  const isPortrait = window.innerHeight > window.innerWidth;

  const setSettingsStatus = useCallback(() => {
    dispatch(setUIConfig({ settings: false }));
  }, [dispatch]);

  // 监听game setting 的状态并发送给平台
  useEffect(() => {
    messenger.messageTool.emitEvent('uiStatusChange', {
      settings: uiConfig.settings,
    });
  }, [uiConfig.settings]);

  useEffect(() => {
    messenger.messageTool.emitEvent('loaded');
  }, []);

  // 处理管理员面板的展示
  useEffect(() => {
    if (isLocalEngine) {
      hideAdmin();
      return;
    }

    player.isAdmin && showAdmin();
    return () => {
      hideAdmin();
    };
  }, [isLocalEngine, player.isAdmin]);

  useAdmin(isLocalEngine ? undefined : player.admin);

  let body = <></>;
  if (uiConfig.settings) {
    // if settings menu is active show the settings modal
    body = (
      <div style={{ pointerEvents: 'auto' }}>
        <GamePlaySettings
          onClose={setSettingsStatus}
          isPortrait={isPortrait}
        />
      </div>
    );
  } else {
    body = (
      <div style={{ pointerEvents: 'auto' }}>
        <PlayHyperLink />
        <LocalGameHud />
        {uiConfig.lowFrameRate && <LowFrameRateModal client={player} />}
      </div>
    );
  }

  return (
    <div
      className={style.playUIContainer}
      onContextMenu={(ev) => {
        ev.stopPropagation();
        ev.preventDefault();
      }}
    >
      {body}
    </div>
  );
});
PlayUIComponent.displayName = 'PlayUIComponent';
