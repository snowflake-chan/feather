import { useCallback, useState, useMemo } from 'react';
import { ApplicationPanel } from './application';
import { GuestPanel } from './guest';
import { BlockedPanel } from './blocked';
import { MainManagePanel } from './main';
import { UserInfoList, UserRolesList } from '../index';
import { UserRoleManager } from '../modals/user-role-manager';

type ManageMentPanelProps = {
  getUsersInfoByIds: (userIds: string[]) => Promise<UserInfoList>;
  userRolesList: UserRolesList;
  showRoleManageModal: () => void;
};

export enum PanelType {
  manage = 'manage',
  guest = 'guest',
  application = 'application',
  blocked = 'blocked',
}

export const ManageMentPanel = (props: ManageMentPanelProps) => {
  const [currentPanel, setCurrentPanel] = useState<PanelType>(PanelType.manage);
  const [isShowUserRoleModal, setIsShowUserRoleModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState('');

  const backToManage = useCallback(() => {
    setCurrentPanel(PanelType.manage);
  }, []);

  const showUserRoleModal = useCallback((userId: string) => {
    setIsShowUserRoleModal(true);
    setEditingUserId(userId);
  }, []);

  const currentPanelView = useMemo(() => {
    switch (currentPanel) {
      case PanelType.guest: {
        return (
          <GuestPanel
            getUsersInfoByIds={props.getUsersInfoByIds}
            userRolesList={props.userRolesList}
            backToManage={backToManage}
            showUserRoleModal={showUserRoleModal}
          />
        );
      }
      case PanelType.blocked: {
        return (
          <BlockedPanel
            getUsersInfoByIds={props.getUsersInfoByIds}
            backToManage={backToManage}
            showUserRoleModal={showUserRoleModal}
          />
        );
      }
      case PanelType.application: {
        return (
          <ApplicationPanel
            getUsersInfoByIds={props.getUsersInfoByIds}
            backToManage={backToManage}
            showUserRoleModal={showUserRoleModal}
          />
        );
      }
      default:
        return (
          <MainManagePanel
            showRoleManageModal={props.showRoleManageModal}
            getUsersInfoByIds={props.getUsersInfoByIds}
            userRolesList={props.userRolesList}
            setCurrentPanel={setCurrentPanel}
            showUserRoleModal={showUserRoleModal}
          />
        );
    }
  }, [
    backToManage,
    currentPanel,
    props.getUsersInfoByIds,
    props.showRoleManageModal,
    props.userRolesList,
    showUserRoleModal,
  ]);

  return (
    <>
      {currentPanelView}
      {isShowUserRoleModal && editingUserId && (
        <UserRoleManager
          currentPanel={currentPanel}
          getUsersInfoByIds={props.getUsersInfoByIds}
          userId={editingUserId}
          onClose={() => {
            setIsShowUserRoleModal(false);
            setEditingUserId('');
          }}
        />
      )}
    </>
  );
};
