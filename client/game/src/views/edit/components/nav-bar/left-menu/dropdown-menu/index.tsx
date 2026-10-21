import { Toast } from '@box/box-design';
import type { MenuItemOptions } from '@box/box-design/build/menu';
import { ModalView } from '@box/box-design/build/modal';
import { FeatureFlag } from '@box/env/constants';
import {
  IconFolder,
  IconHome,
  IconLock,
  IconSetting,
  IconUpdate,
} from '@box/icons';
import { useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useEdit } from '~/client/edit/edit-context';
import { clientConfig } from '~/config/client';
import { messenger } from '~/messenger';
import { RootState } from '~/redux/edit';
import {
  setCenterPanel,
  setIsShowLeftAIPanel,
  setNavMode,
} from '~/redux/edit/creator';
import { notice } from '~/views/components/common/notice';
import { Modal } from '~/views/components/edit/modal';
import { CenterPanelEnum, LeftNavModeEnum } from '~/views/edit/defs';
import { FileSystem } from '../../../center-panel/file-system';
import { PrivacySetting } from '../../../map-privacy';
import { DropDown } from './dropdown';

const menuItemsId: { [key: string]: string } = {
  // 文件管理
  fileSystem: CenterPanelEnum.FileSystem,
  // 设置
  settings: CenterPanelEnum.Setting,
  // 发布
  publish: CenterPanelEnum.Publish,
  // 返回主页
  backToWebsite: CenterPanelEnum.None,
  // 地图隐私权限
  mapPrivacy: CenterPanelEnum.MapPrivacy,
  // AI 助手
  aiAssistant: 'aiAssistant',
};

type DropDownMenuProps = {
  isGuest: boolean;
};

export const DropDownMenu = (props: DropDownMenuProps) => {
  const { isGuest } = props;
  const intl = useIntl();
  const editor = useEdit();
  const dispatch = useDispatch();
  const isLocalEngine = clientConfig.isLocalGameServer;
  const isRunning = useSelector((state: RootState) => state.ui.isRunning);
  const { editFile, localOwner, editPublish } = useSelector(
    (state: RootState) => state.permission,
  );
  const centerPanel = useSelector(
    (state: RootState) => state.creator.centerPanel,
  );
  const isShowLeftAIPanel = useSelector(
    (state: RootState) => state.creator.isShowLeftAiPanel,
  );
  const [scriptErrorLocation, setScriptErrorLocation] = useState<any[]>([]);
  const [isShowMapPrivacy, setIsShowMapPrivacy] = useState<boolean>(false);
  const [showScriptSaveErrorModal, setShowScriptSaveErrorModal] =
    useState<boolean>(false);

  const handleScriptSaveErrorModal = useCallback(
    async (exec) => {
      const err = await editor.codeEditorController.detectSyntaxError();
      if (err) {
        setScriptErrorLocation(err);
        setShowScriptSaveErrorModal(true);
      } else {
        await exec();
      }
    },
    [editor.codeEditorController],
  );

  const handlePublish = useCallback(async () => {
    handleScriptSaveErrorModal(async () => {
      const pending = notice.pending(intl.formatMessage({ id: 'saving' }));
      try {
        await editor.publish.saveGame('').then(() => {});
        notice.closeNotice(pending);
        Toast.success({ content: intl.formatMessage({ id: 'saveSuccess' }) });
        dispatch(setNavMode(LeftNavModeEnum.NoneMode));
        if (!isLocalEngine) {
          messenger.messageTool.emitEvent('publish', {
            contentId: clientConfig.mapInfo.contentId,
          });
        }
        // TODO:
        // if (touchable) {
        //   _handleToggleChat(false);
        // }
      } catch (e) {
        notice.closeNotice(pending);
        Toast.error({ content: intl.formatMessage({ id: 'submitFail' }) });
        editor.logger.error(e.toString());
      }
    });
  }, [
    dispatch,
    editor.logger,
    editor.publish,
    handleScriptSaveErrorModal,
    intl,
    isLocalEngine,
  ]);

  const filteredMenuItems = useMemo(() => {
    const menuItems: MenuItemOptions[] = [
      {
        id: menuItemsId.fileSystem,
        text: intl.formatMessage({ id: 'fileSystem' }),
        icon: <IconFolder />,
      },
      {
        id: menuItemsId.publish,
        text: intl.formatMessage({ id: 'publish' }),
        icon: <IconUpdate />,
      },
      {
        id: menuItemsId.mapPrivacy,
        text: intl.formatMessage({ id: 'privacy' }),
        icon: <IconLock />,
      },
      {
        id: menuItemsId.settings,
        text: intl.formatMessage({ id: 'settings' }),
        icon: <IconSetting />,
      },
      {
        id: menuItemsId.aiAssistant,
        text: 'AI', // TODO i18n
        icon: <span>✨</span>,
      },
      {
        id: menuItemsId.backToWebsite,
        text: intl.formatMessage({ id: 'backToWebsite' }),
        icon: <IconHome />,
      },
    ];
    return menuItems.filter((item) => {
      // 本地引擎通过作品中心导出游玩包，不提供云端“发布”流程。
      if (item.id === menuItemsId.publish && isLocalEngine) {
        return false;
      }
      // 非协作者，仅展示设置和返回主页
      if (
        isGuest &&
        item.id !== menuItemsId.settings &&
        item.id !== menuItemsId.backToWebsite
      ) {
        return false;
      }
      // 只有普通地图的项目拥有者和拥有发布权限者可以发布
      if (item.id === menuItemsId.publish) {
        return (
          (localOwner || editPublish) &&
          (isLocalEngine || clientConfig.mapInfo.combType === 0)
        );
      }
      // 只有普通地图/扩展主副地图 的项目拥有者 有地图隐私管理权限
      if (item.id === menuItemsId.mapPrivacy) {
        if (isLocalEngine || !localOwner) {
          return false;
        }
      }
      // 运行态下，不展示文件管理
      if (item.id === menuItemsId.fileSystem) {
        return !isRunning && editFile;
      }
      // 仅图主显示 AI 助手
      if (item.id === menuItemsId.aiAssistant) {
        return (
          !isLocalEngine &&
          localOwner &&
          clientConfig.FEATURE_FLAGS?.includes(FeatureFlag.Ai)
        );
      }
      if (item.id === menuItemsId.backToWebsite) {
        return !isLocalEngine;
      }
      return true;
    });
  }, [
    intl,
    isGuest,
    localOwner,
    editPublish,
    isRunning,
    editFile,
    isLocalEngine,
  ]);

  const handleSelectDropdownItem = useCallback(
    (data: { id: CenterPanelEnum }) => {
      if (CenterPanelEnum[data.id] === CenterPanelEnum.Publish) {
        handlePublish();
      } else if (CenterPanelEnum[data.id] === CenterPanelEnum.None) {
        if (!isLocalEngine) {
          messenger.jumpTo({ url: clientConfig.HOME_URL });
        }
      } else if (CenterPanelEnum[data.id] === CenterPanelEnum.MapPrivacy) {
        if (!isLocalEngine) {
          setIsShowMapPrivacy(true);
        }
      } else if (data.id === menuItemsId.aiAssistant) {
        // 切换 AI 面板显示/隐藏
        if (!isLocalEngine) {
          dispatch(setIsShowLeftAIPanel(!isShowLeftAIPanel));
        }
      } else {
        dispatch(setCenterPanel(CenterPanelEnum[data.id]));
      }
    },
    [dispatch, handlePublish, isLocalEngine, isShowLeftAIPanel],
  );

  return (
    <>
      <DropDown items={filteredMenuItems} onSelect={handleSelectDropdownItem} />
      {/* 脚本保存错误对话框 */}
      {
        <Modal
          title={intl.formatMessage({ id: 'scriptErrorFound' })}
          visible={showScriptSaveErrorModal}
          confirm={intl.formatMessage({ id: 'viewError' })}
          cancel={intl.formatMessage({ id: 'ignore' })}
          disableBackgroundClick={true}
          handleConfirm={() => {
            setShowScriptSaveErrorModal(false);
            dispatch(setNavMode(LeftNavModeEnum.Script));
            dispatch(setCenterPanel(CenterPanelEnum.None));
            editor.codeEditorController.gotoFileWithIdx(
              scriptErrorLocation[0],
              scriptErrorLocation[1],
            );
          }}
          handleCancel={() => {
            setShowScriptSaveErrorModal(false);
          }}
          width={368}
        >
          <div style={{ color: '#fff', padding: '8px 0 8px 0' }}>
            <span>{intl.formatMessage({ id: 'saveSuccess' })}.</span>
            <span>{intl.formatMessage({ id: 'scriptErrorFound' })}</span>
          </div>
        </Modal>
      }
      {/* 引擎侧居中弹窗：文件管理、设置 */}
      {centerPanel === CenterPanelEnum.FileSystem && <FileSystem />}
      {!isLocalEngine && isShowMapPrivacy && (
        <ModalView
          title={intl.formatMessage({ id: 'privacy' })}
          onClose={() => setIsShowMapPrivacy(false)}
          content={<PrivacySetting />}
          width={400}
        />
      )}
    </>
  );
};
