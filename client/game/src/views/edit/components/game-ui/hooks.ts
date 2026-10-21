import { createContext, useEffect, useState } from 'react';
import { UITree } from '@box/schema/project/ui-rda/defs';
import { useEdit } from 'src/client/edit/edit-context';

export type UITreeRef = { uiTree: UITree };
export const UITreeContext = createContext<UITreeRef>({
  uiTree: {},
});

export function useUITreeContextValue() {
  const { gameUIEditor, state } = useEdit();
  const [uiTreeRef, setUITreeState] = useState<UITreeRef>({
    uiTree: {},
  });

  useEffect(() => {
    const onChange = () => {
      setUITreeState({ uiTree: state.replica.project.uiTree });
    };

    gameUIEditor.onChange.sub(onChange);

    onChange();

    return () => {
      gameUIEditor.onChange.unsub(onChange);
    };
  }, [gameUIEditor, state]);

  return uiTreeRef;
}
