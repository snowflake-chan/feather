import React, { useCallback, useEffect } from 'react';
import { useEdit } from 'src/client/edit/edit-context';
import { handleOrientation } from 'src/utils/mobile';

interface Props {
  onStart: (spec?: { ready: () => void; close: () => void }) => void;
}

export const EditLandingPage = (props: Props) => {
  const { onStart } = props;
  const editor = useEdit();
  const clickStartBtn = useCallback(() => {
    handleOrientation('game', editor.logger);
    onStart({ ready: () => {}, close: () => {} });
  }, [editor, onStart]);

  useEffect(() => {
    clickStartBtn();
  }, [clickStartBtn]);

  return <></>;
};
