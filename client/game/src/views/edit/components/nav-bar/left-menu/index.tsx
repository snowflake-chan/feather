import React, { useCallback, useContext, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import { PermissionAccessLevel } from '@box/schema/permissions/permission-rda';

import { ArenaEditorUIContext } from 'src/views/edit/editor-ui-context';
import { setCenterPanel, setNavMode } from 'src/redux/edit/creator';
import { RootState } from 'src/redux/edit';
import { clientConfig } from 'src/config/client';
import { messenger } from 'src/messenger';

import { NavItemType, NavMode } from './nav-mode';
import { DropDownMenu } from './dropdown-menu';
import { CenterPanelEnum, LeftNavModeEnum } from '../../../defs';
import { PlayerManager } from '../../player-manager';

import styles from './index.module.scss';

type LeftMenuProps = {
  isGuest: boolean;
};

export const LeftMenu = (props: LeftMenuProps) => {
  const { isGuest } = props;
  const { replica } = useContext(ArenaEditorUIContext);
  const intl = useIntl();
  const dispatch = useDispatch();
  // redux
  const isRunning = useSelector((state: RootState) => state.ui.isRunning);
  const { centerPanel, navMode } = useSelector(
    (state: RootState) => state.creator,
  );
  const accessLevel = useSelector(
    (state: RootState) => state.permission.accessLevel,
  );
  const permissionCreatePanel = useSelector(
    (state: RootState) =>
      state.permission.editScene || state.permission.editVoxels,
  );

  const permissions = useSelector((state: RootState) => state.permission);
  const isLocalEngine = clientConfig.isLocalGameServer;

  const handleSelectedEditMode = useCallback(
    (mode: LeftNavModeEnum) => {
      if (mode === navMode) {
        dispatch(setNavMode(LeftNavModeEnum.NoneMode));
        return;
      } else {
        dispatch(setNavMode(mode));
      }
    },
    [dispatch, navMode],
  );

  const handleOpenStore = useCallback(() => {
    if (isRunning) {
      messenger.messageTool.emitEvent('openStore', {
        mapId: clientConfig.mapInfo.contentId,
      });
    } else {
      messenger.messageTool.emitEvent('openStoreSettings', {
        mapId: clientConfig.mapInfo.contentId,
      });
    }
  }, [isRunning]);

  const handleOpenPlayer = useCallback(() => {
    dispatch(setCenterPanel(CenterPanelEnum.PlayerModule));
  }, [dispatch]);

  /**
   * 判断是否展示这些Mode: Create/Script/UI/Store/Player
   */
  const filteredNavItems = useMemo(() => {
    const navItems: NavItemType[] = [
      {
        id: LeftNavModeEnum.Create,
        title: intl.formatMessage({ id: 'create' }),
        hasSelectedStyle: true,
        isActive: navMode === LeftNavModeEnum.Create,
        handleClickItem: () => handleSelectedEditMode(LeftNavModeEnum.Create),
      },
      {
        id: LeftNavModeEnum.Model,
        title: intl.formatMessage({ id: 'model' }),
        hasSelectedStyle: true,
        isActive: navMode === LeftNavModeEnum.Model,
        handleClickItem: () => handleSelectedEditMode(LeftNavModeEnum.Model),
      },
      {
        id: LeftNavModeEnum.Script,
        title: intl.formatMessage({ id: 'script' }),
        hasSelectedStyle: true,
        isActive: navMode === LeftNavModeEnum.Script,
        handleClickItem: () => handleSelectedEditMode(LeftNavModeEnum.Script),
      },
      {
        id: LeftNavModeEnum.UI,
        title: intl.formatMessage({ id: 'uiVolume' }),
        hasSelectedStyle: true,
        isActive: navMode === LeftNavModeEnum.UI,
        handleClickItem: () => handleSelectedEditMode(LeftNavModeEnum.UI),
      },
      {
        id: CenterPanelEnum.StoreSettings,
        title: intl.formatMessage({ id: 'store' }),
        handleClickItem: () => handleOpenStore(),
      },
      {
        id: CenterPanelEnum.PlayerModule,
        title: intl.formatMessage({ id: 'gamePlayer' }),
        handleClickItem: () => handleOpenPlayer(),
      },
    ];
    return navItems.filter((item) => {
      // 非协作者，不展示导航栏左侧的Mode菜单
      if (isGuest) {
        return false;
      }
      switch (item.id) {
        case LeftNavModeEnum.Create:
          return permissionCreatePanel && !isRunning;

        case LeftNavModeEnum.Script:
          return (
            replica.localPermissions.editScripts ||
            accessLevel === PermissionAccessLevel.SCRIPT_VIEW_ONLY
          );

        case LeftNavModeEnum.UI:
          return !isRunning;

        case CenterPanelEnum.StoreSettings:
          if (isLocalEngine) {
            return false;
          }
          if (isRunning) {
            return clientConfig.PAID_ACCESS && permissions.mapPaidAccess;
          } else {
            if (clientConfig.mapInfo.combType === 2) {
              return (
                clientConfig.PAID_ACCESS &&
                permissions.mapPaidAccess &&
                permissions.subMapCommonPermissions.editMarket
              );
            }
            return (
              clientConfig.PAID_ACCESS &&
              permissions.mapPaidAccess &&
              permissions.editMarket
            );
          }
        case LeftNavModeEnum.Model: {
          return permissions.editModel && !isRunning;
        }

        case CenterPanelEnum.PlayerModule:
          return (isLocalEngine || permissions.editPlayer) && !isRunning;
      }
      return false;
    });
  }, [
    intl,
    navMode,
    handleSelectedEditMode,
    handleOpenStore,
    handleOpenPlayer,
    isGuest,
    isLocalEngine,
    isRunning,
    replica.localPermissions,
    accessLevel,
    permissions.editPlayer,
    permissions.editModel,
    permissions.mapPaidAccess,
    permissions.editMarket,
    permissions.subMapCommonPermissions.editMarket,
    permissionCreatePanel,
  ]);

  return (
    <div className={styles.leftMenu}>
      <DropDownMenu isGuest={isGuest} />
      <NavMode contentList={filteredNavItems} />
      {centerPanel === CenterPanelEnum.PlayerModule &&
        (isLocalEngine || permissions.editPlayer) && <PlayerManager />}
    </div>
  );
};
