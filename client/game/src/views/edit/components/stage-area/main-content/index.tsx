import React, {
  useMemo,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { useSelector } from 'react-redux';
import { debounce } from 'src/utils/debounce-throttle';
import { useEdit } from 'src/client/edit/edit-context';
import { EditorUIEvent } from 'src/client/edit/schema';
import { ScriptContainer } from '../../script-container';
import { RootState } from 'src/redux/edit';
import { LoadingSeed, Seeds3DContainer } from '../seeds';
import { touchable } from 'src/utils/mobile';

import { DebugPanel } from '../../debugPanel';
import { TransformType } from '../../transformHandler';
import { RotationTurorial } from '../../rotation-tutorial';
import { EditHyperLink } from '../../edit-hyperLink';
import { CreatePanelContainer } from '../create-panel';
import { EditModelPanelContainer } from '../edit-model-panel';
import { EditorMobileExclusiveUI } from '../../edit-mobile-ui';
import { LeftNavModeEnum, MouseRectType } from 'src/views/edit/defs';
import { GameUIMenu } from '../../game-ui/menu';
import { GameUIContextMenu } from '../../game-ui/context-menu';

import style from './index.module.scss';

type MainContentProps = {
  transformType: TransformType;
  isGuest: boolean;
  handleShowMusicLibrary: (param: [EditorUIEvent, string[]]) => void;
};
export function MainContent(props: MainContentProps) {
  const { isGuest, transformType, handleShowMusicLibrary } = props;

  const editor = useEdit();
  const canvasesRef = useRef<HTMLDivElement>(null);
  const navMode = useSelector((state: RootState) => state.creator.navMode);
  const isShowDebugLogPanel = useSelector(
    (state: RootState) => state.creator.isShowDebugLogPanel,
  );
  const editorUiShowStatus = useSelector(
    (state: RootState) => state.ui.editorUiShowStatus,
  );
  const permissionDebugger = useSelector(
    (state: RootState) => state.permission.debugger,
  );
  const permissionCreatePanel = useSelector(
    (state: RootState) =>
      state.permission.editScene || state.permission.editVoxels,
  );
  const permissionEditModel = useSelector(
    (state: RootState) => state.permission.editModel,
  );

  const gameUI = useSelector((state: RootState) => state.gameUI);

  const [mouseRect, setMouseRect] = useState<MouseRectType>({
    show: false,
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  });
  const { height, width, top, left } = mouseRect;
  // 防抖
  const resizeObserver = useMemo(
    () =>
      new ResizeObserver(
        debounce(() => {
          editor.game.resize();
        }, 50),
      ),
    [editor.game],
  );
  useEffect(() => {
    if (canvasesRef.current) {
      editor.game.appendCanvasDom(canvasesRef.current);
      resizeObserver.observe(canvasesRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, [editor.game, resizeObserver]);

  // FIXME: 直接修改editor state
  useEffect(() => {
    editor.debugging = isShowDebugLogPanel;
  }, [editor, isShowDebugLogPanel]);

  const isRunning = useSelector((state: RootState) => state.ui.isRunning);

  // The bug icon in the top bar toggles this panel. Script mode renders the
  // same panel within ScriptContainer, while scene mode needs this floating
  // instance; otherwise the button changes state with no visible result.
  const floatDebugPanel = useMemo(() => {
    if (
      navMode !== LeftNavModeEnum.Script &&
      permissionDebugger &&
      isShowDebugLogPanel
    ) {
      return <DebugPanel float />;
    }
    return undefined;
  }, [isShowDebugLogPanel, navMode, permissionDebugger]);

  const gameUIMenu = useMemo(() => {
    if (navMode !== LeftNavModeEnum.UI || isRunning) {
      return;
    }

    return <GameUIMenu />;
  }, [navMode, isRunning]);

  return (
    <div className={style.mainContent}>
      <div
        ref={canvasesRef}
        className={style.canvasContainer}
        style={{ width: '100%', height: '100%' }}
      ></div>
      {!isRunning && (
        <Seeds3DContainer
          transformType={transformType}
          mouseRectInfo={mouseRect}
          setMouseRectInfo={setMouseRect}
        />
      )}
      {!isRunning &&
        !isGuest &&
        navMode === LeftNavModeEnum.Create &&
        permissionCreatePanel && (
          <CreatePanelContainer
            handleShowMusicLibrary={handleShowMusicLibrary}
          />
        )}
      {!isRunning &&
        !isGuest &&
        navMode === LeftNavModeEnum.Model &&
        permissionEditModel && <EditModelPanelContainer />}
      {touchable && navMode !== LeftNavModeEnum.Script && (
        <EditorMobileExclusiveUI guest={isGuest} />
      )}
      <div
        style={{
          width: '100%',
          visibility:
            !editorUiShowStatus || editor.game.state.hideUI
              ? 'hidden'
              : 'visible',
        }}
      >
        <ScriptContainer />
        {floatDebugPanel}
      </div>
      <RotationTurorial />
      {mouseRect.show && (
        <div
          style={{
            position: 'absolute',
            backgroundColor: 'rgba(255, 153, 0, 0.3)',
            border: '1px solid #FF9900',
            height: `${Math.abs(height)}px`,
            width: `${Math.abs(width)}px`,
            top: `${height > 0 ? top : top + height}px`,
            left: `${width > 0 ? left : left + width}px`,
          }}
        />
      )}
      {/* 传送门对话框、底部对话框 */}
      {navMode !== LeftNavModeEnum.Script && <EditHyperLink />}
      {gameUIMenu}
      {gameUI.contextMenu && (
        <GameUIContextMenu position={gameUI.contextMenu.position} />
      )}
    </div>
  );
}
