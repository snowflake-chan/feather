import { useCallback, useEffect, useMemo, useState, type JSX } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { IconTerrain, IconModel, IconScene } from '@box/icons';

import { EditorUIEvent } from 'src/client/edit/schema';
import { RootState } from 'src/redux/edit';
import { setCreateTab, setIsTerrainPenActive } from 'src/redux/edit/creator';
import { setSelectedTreeNodes } from 'src/redux/edit/seeds';
import { CreateTabEnum } from 'src/views/edit/defs';

import { TerrainPanel } from '../../terrainPanel';
import { EnvironmentPanel } from '../../environmentPanel';
import style from './index.module.scss';
import { useEdit } from 'src/client/edit/edit-context';
import { Collapse } from 'src/views/components/collapse';

const EditorTabTitle = {
  [CreateTabEnum.Terrain]: 'terrain',
  [CreateTabEnum.Scene]: 'scene',
};

type CreateTabItemType = {
  icon: JSX.Element;
  title: string;
  key: CreateTabEnum;
  handleSetTab: (tab: CreateTabEnum) => void;
};

type CreatePanelProps = {
  handleShowMusicLibrary: (param: [EditorUIEvent, string[]]) => void;
};

export const CreatePanelContainer = (props: CreatePanelProps) => {
  const { handleShowMusicLibrary } = props;
  const intl = useIntl();
  const dispatch = useDispatch();
  const isRunning = useSelector((state: RootState) => state.ui.isRunning);
  const createTab = useSelector((state: RootState) => state.creator.createTab);
  const isShowDebugLogPanel = useSelector(
    (state: RootState) => state.creator.isShowDebugLogPanel,
  );
  const isTerrainPenActive = useSelector(
    (state: RootState) => state.creator.isTerrainPenActive,
  );
  const permissions = useSelector((state: RootState) => state.permission);
  const [collapsed, setCollapsed] = useState(false);

  const handleSetCreateTab = useCallback(
    (selectCreateTab: CreateTabEnum) => {
      dispatch(setCreateTab(selectCreateTab));
    },
    [dispatch],
  );

  const filteredCreateTabs: CreateTabItemType[] = useMemo(() => {
    const createTabs = [
      {
        icon: <IconTerrain />,
        title: intl.formatMessage({
          id: EditorTabTitle[CreateTabEnum.Terrain],
        }),
        key: CreateTabEnum.Terrain,
        handleSetTab: handleSetCreateTab,
      },
      {
        icon: <IconScene />,
        title: intl.formatMessage({
          id: EditorTabTitle[CreateTabEnum.Scene],
        }),
        key: CreateTabEnum.Scene,
        handleSetTab: handleSetCreateTab,
      },
    ];

    return createTabs.filter((tab) => {
      if (tab.key === CreateTabEnum.Terrain) {
        return permissions.editVoxels;
      }
      if (tab.key === CreateTabEnum.Scene) {
        return permissions.editScene;
      }
      return false;
    });
  }, [handleSetCreateTab, intl, permissions.editScene, permissions.editVoxels]);

  useEffect(() => {
    if (filteredCreateTabs.find((item) => item.key === createTab)) {
      return;
    }
    handleSetCreateTab(filteredCreateTabs[0].key);
  }, [createTab, filteredCreateTabs, handleSetCreateTab]);

  const editor = useEdit();

  const handleSetIsTerrainPenActive = useCallback(
    (isActive: boolean) => {
      if (isTerrainPenActive !== isActive) {
        dispatch(setIsTerrainPenActive(isActive));
      }
      if (isActive) {
        dispatch(setSelectedTreeNodes([]));
        editor.gameUIEditor.setSelectedIds([]);
      }
    },
    [dispatch, isTerrainPenActive, editor],
  );

  return (
    <div
      className={`${style.createPanelContainer} ${
        collapsed ? style.moveLeft : ''
      }`}
      style={{
        height: isShowDebugLogPanel
          ? 'calc(100% - 32px - 16px)'
          : 'calc(100% - 16px)',
      }}
    >
      <Collapse
        onToggle={() => setCollapsed(!collapsed)}
        collapsed={collapsed}
      />
      <div className={style.createPanel}>
        <div className={style.tabBarContainer}>
          {filteredCreateTabs.map((tab) => {
            return (
              <div
                className={`${style.tabItem} ${
                  createTab === tab.key && style.tabItemActive
                }`}
                key={tab.key}
                onClick={() => tab.handleSetTab(tab.key)}
              >
                {tab.icon}
                <div className={style.tabTitle}>{tab.title}</div>
              </div>
            );
          })}
        </div>
        {createTab === CreateTabEnum.Terrain && permissions.editVoxels && (
          <TerrainPanel
            isRunning={isRunning}
            handleSetIsTerrainPenActive={handleSetIsTerrainPenActive}
            isTerrainPenActive={isTerrainPenActive}
          />
        )}
        {createTab === CreateTabEnum.Scene && permissions.editScene && (
          <EnvironmentPanel
            isRunning={isRunning}
            showMusicLibrary={handleShowMusicLibrary}
          />
        )}
      </div>
    </div>
  );
};
