import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { setUIConfig } from 'src/redux/slices/UIConfig';
import { registerWeChat } from '../hooks/wechat';
import { CloseType } from 'src/engine/game-client-schema';
import { InputPauseProvider } from 'src/views/components/input-lock';
import { StarterPage } from './components/starter';
import { PlayUIComponent } from './components/ui';
import { PlayConnectError } from './components/play-error';
import { usePlayer } from 'src/client/play/play-context';
import { messenger } from 'src/messenger';
import { LoadingStage } from 'src/defs/loading-stage';
import { LangType } from 'src/apis/createra';
import { clientConfig } from 'src/config/client';
import { resolvePublicUrl } from 'src/utils/public-url';
import type { GameClient } from 'src/engine/game-client';
import { GameContext } from 'src/client/context';

export type EngineStatus = 'preConnect' | 'loading' | 'started' | 'stop';

type MainPageProps = {
  setLoadingStage: (stage: LoadingStage) => void;
  setLocale: (locale: LangType) => void;
};
/**
 * PlayClient 对应的主页面
 * @param props
 * @returns
 */
export const MainPage = (props: MainPageProps) => {
  const player = usePlayer();
  const dispatch = useDispatch();

  const [gameClient, setGameClient] = useState<GameClient>();
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('loading');
  const [closeError, setCloseError] = useState<CloseType>(CloseType.Normal);

  useEffect(() => {
    // 在非开发环境中，不在ifrmae中打开则跳转到官网
    if (
      !clientConfig.isLocalGameServer &&
      process.env.NEXT_PUBLIC_EXPORT_MODE !== 'true' &&
      process.env.NODE_ENV !== 'development' &&
      !messenger.messageTool.isInIframe() &&
      !messenger.messageTool.isInIosWebview()
    ) {
      window.location.assign(resolvePublicUrl(clientConfig.WEBSITE_URL));
      return;
    }

    // iframe监听
    const onUIConfig = (payload: Parameters<typeof setUIConfig>[0]) => {
      dispatch(setUIConfig(payload));
    };
    messenger.messageTool.eventOn('setUIConfig', onUIConfig);

    // iframe状态通知
    messenger.emitEvent('status', 'ready');

    // 页面监听 GameClient 实例发生变更
    const onGameChange = (gameClient: GameClient) => {
      if (!gameClient) return;

      // 监听 GameClient Close 事件，展示连接断开的页面
      gameClient.onClose.sub((closeType) => {
        setEngineStatus('stop');
        if (closeType) {
          setCloseError(closeType);
        }
      });

      setGameClient(gameClient);
    };
    player.onGameChange.sub(onGameChange);

    // 初始化 GameClient
    player.preconnect();

    setEngineStatus('preConnect');

    // 注册微信相关配置
    if (!clientConfig.isLocalGameServer) {
      registerWeChat();
    }
    return () => {
      messenger.messageTool.eventOff('setUIConfig', onUIConfig);
      player.onGameChange.unsub(onGameChange);
    };
  }, []);

  // 控制loading状态
  useEffect(() => {
    if (engineStatus === 'started') {
      setTimeout(() => {
        messenger.messageTool.emitEvent('status', 'started');
      }, 300);
    } else if (engineStatus === 'stop') {
      props.setLoadingStage(LoadingStage.close);
    }
  }, [engineStatus]);

  return engineStatus !== 'loading' && gameClient ? (
    <GameContext.Provider value={gameClient}>
      <InputPauseProvider inputPauseChange={gameClient.input.pauseChange}>
        {engineStatus == 'preConnect' && (
          <StarterPage
            setEngineStatus={setEngineStatus}
            setCloseError={setCloseError}
          />
        )}
        {engineStatus == 'stop' && <PlayConnectError errorType={closeError} />}
        {engineStatus == 'started' && (
          <PlayUIComponent setLocale={props.setLocale} />
        )}
      </InputPauseProvider>
    </GameContext.Provider>
  ) : (
    <></>
  );
};
