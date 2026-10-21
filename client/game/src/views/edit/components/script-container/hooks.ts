import React, { useEffect, useState } from 'react';
import { useEdit } from 'src/client/edit/edit-context';
import {
  ClientStateSchema,
  ClientStateType,
} from 'src/client/edit/edit-schema';

export type CodeEditorStateContextType = {
  codeEditorState: ClientStateType['codeEditor'];
};
export const CodeEditorStateContext =
  React.createContext<CodeEditorStateContextType>({
    codeEditorState: ClientStateSchema['codeEditor'],
  });

export function useCodeEditorStateContextValue() {
  const editor = useEdit();
  /**
   * 订阅reactEvent，依赖于codeEditor更新组件内的codeEditorState
   * 1. cursorDic(光标列表-每个在线玩家都有一个光标)
   * 2. fileDic(文件列表)
   * 3. selectedFileId（当前选中的文件ID）
   */
  const [codeEditorState, setCodeEditorState] = useState<
    ClientStateType['codeEditor']
  >(editor.state.codeEditor);

  // 订阅reactEvent，依赖于codeEditor更新组件内的codeEditorState
  useEffect(() => {
    const setEditState = (state: ClientStateType['codeEditor']) => {
      setCodeEditorState(state);
    };
    editor.listeners.codeEditor.sub(setEditState);
    return () => {
      editor.listeners.codeEditor.unsub(setEditState);
    };
  }, [editor.listeners.codeEditor]);

  return { codeEditorState };
}
