import React, { useEffect, useState } from 'react';
import { HyperLink } from '../../../components/HyperLink';
import { editor } from 'src/client/edit/edit-client';

export const EditHyperLink = React.memo(() => {
  const [hyperLinkInfo, setHyperLinkInfo] = useState({} as any);
  useEffect(() => {
    editor.listeners.hyperLink.sub((data) => {
      setHyperLinkInfo(data);
    });
    return () => {
      editor.listeners.hyperLink.unsubAll();
    };
  }, []);
  return (
    <HyperLink
      owner={0}
      href={editor.game.href}
      hyperLink={hyperLinkInfo}
      isPlay
    />
  );
});

EditHyperLink.displayName = 'EditHyperLink';
