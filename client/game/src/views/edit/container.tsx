import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'src/redux/edit';
import { CloseType } from 'src/engine/game-client-schema';
import { EditLandingPage } from './components/landing';
import { EditConnecting } from './components/edit-connecting';
import { EditConnectError } from './components/edit-error';
import { EditorUIComponent } from './components/main-page';
import { messenger } from 'src/messenger';
import { LangType } from 'src/apis/createra';
import { registerWeChat } from '../hooks/wechat';
import { setUIState } from 'src/redux/edit/ui';
import { useEdit } from 'src/client/edit/edit-context';
import { InputPauseProvider } from 'src/views/components/input-lock';
import { resolveEditor } from 'src/client/edit/edit-client';
import { apis } from 'src/apis/local-api';
import { clientConfig } from 'src/config/client';
import { setPermission } from 'src/redux/edit/permission';
import { CreateraPermissionNameMap } from '@box/utils/createra-permissions';

export type EngineStatus = 'preConnect' | 'loading' | 'started' | 'stop';

type MainPageProps = {
  removeLoading: () => void;
  setLocale: (locale: LangType) => void;
};

export const MainPage = (props: MainPageProps) => {
  const dispatch = useDispatch();
  const [engineStatus, setEngineStatus] = useState<EngineStatus>();
  const [closeError, setCloseError] = useState<CloseType>(CloseType.Normal);
  const editor = useEdit();
  resolveEditor(editor);

  // 一次性初始化的内容
  useEffect(() => {
    messenger.messageTool.eventOn('setUIConfig', (payload) => {
      dispatch(setUIState(payload));
    });
    editor.preconnect();
    setEngineStatus('preConnect');
    if (!clientConfig.isLocalGameServer) {
      registerWeChat();
    }
  }, []);

  // 监听game chat的状态并发送给平台
  const chat = useSelector((state: RootState) => state.ui.chat);
  useEffect(() => {
    if (clientConfig.isLocalGameServer) {
      return;
    }
    messenger.emitEvent('uiStatusChange', {
      chat,
    });
  }, [chat]);

  // 子图额外去获取公共权限
  const applySubMapCommonPermission = async () => {
    if (clientConfig.isLocalGameServer) {
      return;
    }
    if (clientConfig.mapInfo.combType === 2) {
      try {
        const data = await apis.collaboration.memberPermissionUsingGet({
          mapId: clientConfig.mapInfo.contentId + '',
        });
        // 图主和管理员有全部权限
        const subMapCommonPermissions = {
          editMarket: false,
          editStatisticsData: false,
          editPublish: false,
        };

        if (data.admin || data.owner) {
          subMapCommonPermissions.editPublish = true;
          subMapCommonPermissions.editStatisticsData = true;
          subMapCommonPermissions.editMarket = true;
        } else {
          data.collaboration?.permissions.forEach((permission) => {
            const permissionName = CreateraPermissionNameMap[permission];
            if (Object.keys(subMapCommonPermissions).includes(permissionName)) {
              subMapCommonPermissions[permissionName] = true;
            }
          });
        }

        dispatch(
          setPermission({
            subMapCommonPermissions,
          }),
        );
      } catch (err) {
        console.log(err);
      }
    }
  };
  // 地图是否有商城权限
  const fetchMapPaidAccess = async () => {
    if (clientConfig.isLocalGameServer || !clientConfig.PAID_ACCESS) {
      return;
    }
    try {
      const data = await apis.creatorStore.checkStoreAccessUsingGet({
        mapId: clientConfig.mapInfo.contentId,
      });
      dispatch(setPermission({ mapPaidAccess: data }));
    } catch (err) {
      console.log(err);
    }
  };
  const engineStart = async (spec?: {
    ready: () => void;
    close: () => void;
  }) => {
    setEngineStatus('loading');
    await Promise.all([fetchMapPaidAccess(), applySubMapCommonPermission()]);
    props.removeLoading();
    editor.start({
      ready: () => {
        setEngineStatus('started');
        spec && spec.ready();
        messenger.messageTool.emitEvent('status', 'started');
      },
      close: (msg) => {
        setEngineStatus('stop');
        spec && spec.close();
        setCloseError(msg);
        messenger.messageTool.emitEvent('status', 'closed');
      },
    });
  };

  return engineStatus ? (
    <InputPauseProvider inputPauseChange={editor.game.input.pauseChange}>
      {engineStatus == 'preConnect' && (
        <EditLandingPage onStart={engineStart} />
      )}
      {engineStatus == 'loading' && <EditConnecting />}
      {engineStatus == 'stop' && <EditConnectError />}
      {engineStatus == 'started' && (
        <EditorUIComponent setLocale={props.setLocale} />
      )}
    </InputPauseProvider>
  ) : (
    <></>
  );
};
