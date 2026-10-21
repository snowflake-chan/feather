import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CollapsePanel, Modal, Toast } from '@box/box-design';

import {
  IconBake,
  IconSearch,
  IconVisibility,
  IconVisibilityOff,
} from '@box/icons';

import { reduxDispatch, RootState } from 'src/redux/edit';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { setHierarchyPanel } from 'src/redux/edit/creator';

import { PANEL_IDS } from '../right-sidebar/content-panel';
import { HierarchyPanel, StaticShadowState } from '../../hierarchyPanel';
import { HierarchyPanelEnum } from 'src/views/edit/defs';

import style from './index.module.scss';
import { GameUIHierarchy } from '../../game-ui/hierarchy';
import { useEdit } from 'src/client/edit/edit-context';
import { ScreenList } from 'src/views/edit/components/game-ui/screen-list';
import { setGameUIScreenListVisible } from 'src/redux/edit/game-ui';
import { clientConfig } from 'src/config/client';
import { FeatureFlag } from '@box/env/constants';

type HierarchyCollapsePanelProps = {
  panelId: PANEL_IDS;
  height: string;
};

export function HierarchyCollapsePanel(props: HierarchyCollapsePanelProps) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const {
    hierarchyPanel,
    gameUIVisible,
    selectedSeedIds,
    selectedUIIds,
    gameUIScreenListVisible,
    selectScreenId,
  } = useSelector((state: RootState) => ({
    hierarchyPanel: state.creator.hierarchyPanel,
    gameUIVisible: state.gameUI.gameUIVisible,
    selectedSeedIds: state.seeds.selectedTreeNodes,
    selectedUIIds: state.gameUI.selectedIds,
    gameUIScreenListVisible: state.gameUI.screen.listVisible,
    selectScreenId: state.gameUI.screen.selectedScreenId,
  }));
  const editor = useEdit();

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isSettingStaticModel, setIsSettingStaticModel] =
    useState<boolean>(false);
  // 当前静态实体状态，只记录实体不记录实体组，因此currStaticShadow里面的状态只有true/false
  const [currStaticShadow, setCurrStaticShadow] = useState<{
    [key: string]: StaticShadowState;
  }>({});

  // 进入/退出编辑静态实体时，更新当前静态实体状态
  useEffect(() => {
    const { entitiesTree } = editor.state.replica.project;
    if (!isSettingStaticModel) {
      setCurrStaticShadow({});
      return;
    }

    setCurrStaticShadow(
      Object.keys(entitiesTree).reduce<{
        [key: string]: StaticShadowState;
      }>((prev, curr) => {
        if (entitiesTree[curr].value) {
          const state = entitiesTree[curr].value.staticShadow
            ? StaticShadowState.True
            : StaticShadowState.False;
          prev[curr] = state;
        }
        return prev;
      }, {}),
    );
  }, [editor, isSettingStaticModel]);

  const selectScreenIdRef = useRef<string | undefined>(selectScreenId);
  selectScreenIdRef.current = selectScreenId;

  useEffect(() => {
    if (selectedSeedIds.length) {
      dispatch(setHierarchyPanel(HierarchyPanelEnum.Model));
    }
  }, [dispatch, selectedSeedIds]);

  useEffect(() => {
    if (selectedUIIds.length) {
      dispatch(setHierarchyPanel(HierarchyPanelEnum.GameUI));
    }
  }, [dispatch, selectedUIIds]);
  useEffect(() => {
    setIsSearching(false);
    setSearchKey('');
  }, [selectScreenId]);

  // 有选中屏幕时，切换tab收起屏幕列表
  useEffect(() => {
    if (
      hierarchyPanel !== HierarchyPanelEnum.GameUI &&
      selectScreenIdRef.current
    ) {
      reduxDispatch(setGameUIScreenListVisible(false));
    }
  }, [hierarchyPanel]);

  const hierarchyTabList = useMemo(
    () =>
      [
        {
          title: intl.formatMessage({ id: 'model' }),
          key: HierarchyPanelEnum.Model,
          isActive: hierarchyPanel === HierarchyPanelEnum.Model,
        },
        {
          title: intl.formatMessage({ id: 'uiVolume' }),
          key: HierarchyPanelEnum.GameUI,
          isActive: hierarchyPanel === HierarchyPanelEnum.GameUI,
        },
      ].map(
        (tab) =>
          tab && (
            <div
              key={tab.key}
              className={style.title}
              onClick={() => {
                setIsSearching(false);
                setSearchKey(undefined);
                dispatch(setHierarchyPanel(tab.key));
              }}
            >
              {tab.title}
              {tab.isActive && <div className={style.activeUnderLine} />}
            </div>
          ),
      ),
    [hierarchyPanel, intl, dispatch],
  );

  const [searchKey, setSearchKey] = useState<string | undefined>('');

  const { gameUIEditor } = editor;

  const onConfirmStaticShadow = useCallback(() => {
    editor.seedController.setEntitiesStaticShadow(currStaticShadow);
    setIsSettingStaticModel(false);
    Toast.info({
      content: intl.formatMessage({
        id: 'setSuccess',
      }),
    });
  }, [currStaticShadow, editor.seedController, intl]);

  const onCancelStaticShadow = useCallback(() => {
    const hasChanged =
      editor.seedController.staticShadowHasChanged(currStaticShadow);
    if (hasChanged) {
      const destroy = Modal.show({
        title: intl.formatMessage({
          id: 'hierarchy.exitStaticShadowModel',
        }),
        content: intl.formatMessage({
          id: 'hierarchy.exitStaticShadowModelContent',
        }),
        confirmText: intl.formatMessage({
          id: 'hierarchy.exitStaticShadowModel',
        }),
        onConfirm: () => {
          setIsSettingStaticModel(false);
          destroy();
        },
        cancelText: intl.formatMessage({
          id: 'cancel',
        }),
        onCancel: () => {
          destroy();
        },
        type: 'warning',
        buttonSort: 'rtl',
      });
      return;
    }
    setIsSettingStaticModel(false);
  }, [currStaticShadow, editor, intl]);

  const panel = useMemo(() => {
    if (hierarchyPanel === HierarchyPanelEnum.Model) {
      return (
        <HierarchyPanel
          searchKey={searchKey}
          isSearching={isSearching}
          setSearchKey={setSearchKey}
          isSettingStaticModel={isSettingStaticModel}
          currStaticShadow={currStaticShadow}
          setCurrStaticShadow={setCurrStaticShadow}
          onConfirmStaticShadow={onConfirmStaticShadow}
          onCancelStaticShadow={onCancelStaticShadow}
        />
      );
    }

    if (gameUIScreenListVisible) {
      return <ScreenList />;
    }

    return (
      <GameUIHierarchy
        searchKey={searchKey}
        isSearching={isSearching}
        setSearchKey={setSearchKey}
      />
    );
  }, [
    currStaticShadow,
    gameUIScreenListVisible,
    hierarchyPanel,
    isSearching,
    isSettingStaticModel,
    onConfirmStaticShadow,
    onCancelStaticShadow,
    searchKey,
  ]);

  const gameUIVisibleButton = useMemo(() => {
    if (hierarchyPanel !== HierarchyPanelEnum.GameUI) {
      return;
    }

    return (
      <>
        <div
          className={style.search}
          onClick={() => {
            gameUIEditor.setGameUIVisible(!gameUIVisible);
          }}
        >
          {gameUIVisible ? <IconVisibility /> : <IconVisibilityOff />}
        </div>
        <div className={style.gap} />
      </>
    );
  }, [gameUIVisible, hierarchyPanel, gameUIEditor]);

  const setStaticModelButton = useMemo(() => {
    if (hierarchyPanel !== HierarchyPanelEnum.Model) {
      return;
    }
    return (
      <>
        <div
          className={`${style.search} ${
            isSettingStaticModel && style.searchActive
          }`}
          onClick={() => {
            if (isSettingStaticModel) {
              onCancelStaticShadow();
            } else {
              setIsSettingStaticModel(true);
            }
          }}
        >
          <IconBake />
        </div>
        <div className={style.gap} />
      </>
    );
  }, [hierarchyPanel, isSettingStaticModel, onCancelStaticShadow]);

  return (
    <CollapsePanel
      showDivider={false}
      header={intl.formatMessage({ id: 'hierarchy' })}
      id={props.panelId}
      style={{ height: '100%' }}
    >
      <div style={{ height: props.height }}>
        <div className={style.hierarchyTabBar}>
          <div className={style.hierarchyTabList}>{hierarchyTabList}</div>
          <div className={style.sideBar}>
            {gameUIVisibleButton}
            {setStaticModelButton}
            <div
              className={`${style.search} ${isSearching && style.searchActive}`}
              onClick={() => {
                // 未选中屏幕不能点击搜索按钮
                if (!selectScreenId) {
                  return;
                }
                setIsSearching(!isSearching);
                setSearchKey(undefined);
                reduxDispatch(setGameUIScreenListVisible(false));
              }}
            >
              <IconSearch />
            </div>
          </div>
        </div>
        <div className={style.content}>{panel}</div>
      </div>
    </CollapsePanel>
  );
}
