import { FeatureFlag } from '@box/env/constants';
import { PermissionAccessLevel } from '@box/schema/permissions/permission-rda';
import { ROOT_ID } from '@box/schema/project/murda-tree';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideAdmin, showAdmin, useAdmin } from 'src/entry/admin-ui';
import { LangType } from '~/apis/createra';
import { useEdit } from '~/client/edit/edit-context';
import type { ClientStateType } from '~/client/edit/edit-schema';
import { AiPanel } from '~/components/ai-panel';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '~/components/ui/resizable';
import { clientConfig } from '~/config/client';
import { RootState } from '~/redux/edit';
import { setSeedState } from '~/redux/edit/seeds';
import { ArenaEditorUIContext } from '../../editor-ui-context';
import { Settings } from '../center-panel/settings';
import { UITreeContext, useUITreeContextValue } from '../game-ui/hooks';
import { NavBar } from '../nav-bar';
import {
  CodeEditorStateContext,
  useCodeEditorStateContextValue,
} from '../script-container/hooks';
import { ScriptRemoveModal } from '../script-manager/remove-modal';
import { ScriptRenameModal } from '../script-manager/rename-modal';
import { StageArea } from '../stage-area';
import { seedsDataController } from '../stage-area/seedsData';
import { TransformType } from '../transformHandler';
import { VoxaPanel } from '../voxaPanel';
import style from './index.module.scss';

export interface EditorUIProps {
  setLocale: (locale: LangType) => void;
}

export const EditorUIComponent = React.memo((props: EditorUIProps) => {
  // editor context
  const editor = useEdit();
  const dispatch = useDispatch();
  const permissions = useSelector((state: RootState) => state.permission);
  const { voxaData, isShowLeftAiPanel } = useSelector(
    (state: RootState) => state.creator,
  );
  const { renameOptions, removeId } = useSelector(
    (state: RootState) => state.scriptManager,
  );
  const { selectedScreenId } = useSelector(
    (state: RootState) => state.gameUI.screen,
  );
  const selectedTreeNodes = useSelector(
    (state: RootState) => state.seeds.selectedTreeNodes,
  );
  const isLocalEngine = clientConfig.isLocalGameServer;

  const isAiEnabled = clientConfig.FEATURE_FLAGS?.includes(FeatureFlag.Ai);
  const showAiPanel = isShowLeftAiPanel && isAiEnabled;

  // state
  const [replicaRef, setReplicaRef] = useState<{
    replica: ClientStateType['replica'];
  }>({ replica: editor.state.replica });
  const [transformType, setTransformType] = useState<TransformType>(
    TransformType.Normal,
  );

  // permissions和isGuest相关的判定
  const isGuest = useMemo(() => {
    const isScriptViewOnlyMode =
      permissions.accessLevel === PermissionAccessLevel.SCRIPT_VIEW_ONLY;
    return (
      !permissions.localOwner &&
      permissions.localGroups.length === 0 &&
      !isScriptViewOnlyMode
    );
  }, [
    permissions.localOwner,
    permissions.localGroups,
    permissions.accessLevel,
  ]);

  // 当前选中的屏幕被其它人删除，则取消这个屏幕的选中
  // 当前defaultScreenId被其它人删除，则第一个屏幕为默认屏幕
  const selectedScreenIdRef = useRef(selectedScreenId);
  selectedScreenIdRef.current = selectedScreenId;
  const handleScreenEffect = useCallback(
    (replica) => {
      const { uiTree, defaultScreenId } = replica.project;
      if (selectedScreenIdRef.current && !uiTree[selectedScreenIdRef.current]) {
        editor.gameUIEditor.selectScreen(undefined);
      }
      if (defaultScreenId && !uiTree[defaultScreenId]) {
        const firstScreenId = uiTree[ROOT_ID].childrenIds[0];
        if (uiTree[firstScreenId]) {
          editor.gameUIEditor.setDefaultScreen(uiTree[firstScreenId].id);
        }
      }
    },
    [editor.gameUIEditor],
  );

  // 监听replica变化
  useEffect(() => {
    editor.listeners.replica.sub((replica) => {
      setReplicaRef({ replica });
      handleScreenEffect(replica);
    });
    return () => {
      editor.listeners.replica.unsubAll();
    };
  }, [editor.listeners.replica, handleScreenEffect]);

  useEffect(() => {
    if (isLocalEngine) {
      hideAdmin();
      return;
    }

    editor.state.isAdmin && showAdmin();
    return () => {
      hideAdmin();
    };
  }, [editor, isLocalEngine]);

  useEffect(() => {
    const allSelectedSeeds = seedsDataController.parseTreeNodesSeeds(
      selectedTreeNodes,
      [],
    );
    const hasLockedSeedSelected =
      allSelectedSeeds.find(
        (seedId) =>
          replicaRef.replica.project.entitiesTree[seedId]?.value?.editLock,
      ) !== undefined;

    dispatch(setSeedState({ hasLockedSeedSelected, allSelectedSeeds }));
    // 依赖replica. 以便在实体的锁状态发生改变的时候更新redux
  }, [dispatch, selectedTreeNodes, replicaRef.replica.project.entitiesTree]);

  useAdmin(isLocalEngine ? undefined : editor.admin);

  const uiTreeContextValue = useUITreeContextValue();
  const codeEditorState = useCodeEditorStateContextValue();

  return (
    <ArenaEditorUIContext.Provider value={replicaRef}>
      <UITreeContext.Provider value={uiTreeContextValue}>
        <CodeEditorStateContext.Provider value={codeEditorState}>
          <div
            id="arena-editor"
            className={style.arenaEditor}
            onContextMenu={(ev) => {
              ev.stopPropagation();
              ev.preventDefault();
            }}
          >
            <NavBar
              isGuest={isGuest}
              currentTransformType={transformType}
              toggleTransformType={setTransformType}
            />
            <ResizablePanelGroup
              direction="horizontal"
              className="w-full h-full"
            >
              <ResizablePanel
                defaultSize={25}
                className={!showAiPanel ? 'hidden' : ''}
              >
                {showAiPanel && <AiPanel />}
              </ResizablePanel>
              <ResizableHandle
                withHandle
                className={!showAiPanel ? 'hidden' : ''}
              />
              <ResizablePanel defaultSize={75}>
                <StageArea transformType={transformType} isGuest={isGuest} />
              </ResizablePanel>
            </ResizablePanelGroup>
            <Settings setLocale={props.setLocale} />
            {voxaData.isShow && <VoxaPanel />}
            {renameOptions && <ScriptRenameModal />}
            {removeId && <ScriptRemoveModal />}
          </div>
        </CodeEditorStateContext.Provider>
      </UITreeContext.Provider>
    </ArenaEditorUIContext.Provider>
  );
});

EditorUIComponent.displayName = 'EditorUIComponent';
