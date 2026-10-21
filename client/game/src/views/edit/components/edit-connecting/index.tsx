import React from 'react';
import { ConnectingContainer } from '../../../components/connecting';
import { useEdit } from 'src/client/edit/edit-context';

export const EditConnecting = React.memo(() => {
  const editor = useEdit();
  return (
    <ConnectingContainer
      isPlay={false}
      setSettings={editor.setGameSettings}
      getProgress={editor.progress}
      loadingEvent={editor.game.loading.events}
    />
  );
});

EditConnecting.displayName = 'EditConnecting';
