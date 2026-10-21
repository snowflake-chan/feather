import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';

import { RootState } from 'src/redux/edit';
import { DraggableBar } from 'src/views/components/game/draggable-bar';
import { InputPauseConsumer } from 'src/views/components/input-lock';
import { touchable } from 'src/utils/mobile';
import { DebugPanel } from '../debugPanel';
import { MonacoEditor } from '../monaco';
import { ScriptHeader } from './script-header';

import style from './index.module.scss';

type Props = {
  visible: boolean;
};

const ScriptEditorView = (props: Props) => {
  const { visible } = props;

  const containerElm = useRef<HTMLElement | undefined>(undefined);
  const codeEditorHight = useRef(0);
  const [debugPanelHeight, setDebugPanelHeight] = useState(
    touchable ? 100 : 200,
  );

  const { isShowDebugLogPanel: showDebug } = useSelector(
    (state: RootState) => state.creator,
  );

  useEffect(() => {
    if (
      containerElm.current &&
      codeEditorHight.current !== containerElm.current.clientHeight
    ) {
      codeEditorHight.current = containerElm.current.clientHeight;
      document.dispatchEvent(new CustomEvent('monaco_layout'));
    }
  }, [containerElm.current?.clientHeight]);

  const handleDebugHeightChange = useCallback(
    (h: number) => {
      const height = debugPanelHeight - h;
      if (height < 72 || height > window.innerHeight - 216) {
        return;
      }
      setDebugPanelHeight(height);
    },
    [debugPanelHeight],
  );

  const editorHeight = useMemo(() => {
    if (showDebug) {
      return `calc(100% - ${debugPanelHeight}px - 64px)`;
    } else {
      return 'calc(100% - 64px)';
    }
  }, [debugPanelHeight, showDebug]);

  const className = useMemo(() => {
    const list = [style.debugPanel];
    if (!showDebug) {
      list.push(style.hide);
    }
    return list.join(' ');
  }, [showDebug]);

  return (
    <div className={style.scriptEditorWrapper}>
      {visible && <InputPauseConsumer />}
      <ScriptHeader />
      <div
        className={style.codeEditorContainer}
        style={{ height: editorHeight }}
        ref={(ref) => {
          if (ref) {
            containerElm.current = ref;
          }
        }}
      >
        <MonacoEditor />
      </div>
      <div className={className} style={{ height: debugPanelHeight }}>
        <DebugPanel />
        <DraggableBar
          type="top"
          alwaysShow={touchable}
          onDrag={handleDebugHeightChange}
        />
      </div>
    </div>
  );
};

export const ScriptEditor = React.memo(ScriptEditorView);
