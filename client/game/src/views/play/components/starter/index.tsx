import React, { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { handleOrientation, isMobile } from 'src/utils/mobile';
import { CloseType } from 'src/engine/game-client-schema';
import { usePlayer } from 'src/client/play/play-context';
import { RootState } from 'src/redux/play';
import type { EngineStatus } from '../../container';

type CreateraStartEntryProps = {
  setEngineStatus: React.Dispatch<React.SetStateAction<EngineStatus>>;
  setCloseError: React.Dispatch<React.SetStateAction<CloseType>>;
};

export const StarterPage = React.memo((props: CreateraStartEntryProps) => {
  const player = usePlayer();
  const userInfo = useSelector((state: RootState) => state.user);
  const isLoggedIn = userInfo.id > 0;

  const startEngine = useCallback(
    (ready?: () => void, close?: () => void) => {
      props.setEngineStatus('loading');

      player.start({
        ready: () => {
          ready && ready();
          props.setEngineStatus('started');
        },
        frame: () => {},
        close: (error: CloseType) => {
          props.setCloseError(error);
          props.setEngineStatus('stop');
          close && close();
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoggedIn],
  );

  useEffect(() => {
    startEngine(
      () => {
        isMobile() && handleOrientation('game', player.logger);
      },
      () => {},
    );
  }, [isLoggedIn]);

  return <></>;
});
