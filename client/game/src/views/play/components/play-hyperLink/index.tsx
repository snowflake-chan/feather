import React, { useCallback, useEffect, useState } from 'react';

import { useGame } from 'src/client/context';
import { HyperLink } from '../../../components/HyperLink';
import { usePlayer } from 'src/client/play/play-context';

export const PlayHyperLink = React.memo((props) => {
  const player = usePlayer();
  const game = useGame();
  const [hyperLinkInfo, setHyperLinkInfo] = useState(game.state.hyperLink);

  const hyperLinkListener = useCallback((data) => {
    setHyperLinkInfo({ ...data });
  }, []);

  useEffect(() => {
    player.listeners.hyperLink.sub(hyperLinkListener);
    return () => {
      player.listeners.hyperLink.unsub(hyperLinkListener);
    };
  }, [hyperLinkListener, player]);

  return (
    <HyperLink owner={0} href={game.href} hyperLink={hyperLinkInfo} isPlay />
  );
});

PlayHyperLink.displayName = 'PlayHyperLink';
