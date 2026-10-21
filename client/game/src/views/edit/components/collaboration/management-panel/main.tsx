import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import { RootState } from 'src/redux/edit';

import { CollaboratorList } from './collaborator';
import { ShareLink } from './share-link';
import { MainHeader } from '../header/manage-header';
import {
  MenuItemType,
  UserInfoList,
  UserRolesList,
  InnerRoles,
} from '../index';
import { PanelType } from './index';

import style from '../index.module.scss';

type MainManagePanelProps = {
  getUsersInfoByIds: (userIds: string[]) => Promise<UserInfoList>;
  userRolesList: UserRolesList;
  setCurrentPanel: (item: PanelType) => void;
  showRoleManageModal: () => void;
  showUserRoleModal: (userId: string) => void;
};

export const MainManagePanel = (props: MainManagePanelProps) => {
  const intl = useIntl();
  const { owner, collaborators } = useSelector(
    (state: RootState) => state.permission,
  );

  const [selectedRole, setSelectedRole] = useState<MenuItemType>({
    id: InnerRoles.allCollaborator,
    text: intl.formatMessage({ id: InnerRoles.allCollaborator }),
  });

  const [userInfos, setUserInfos] = useState<UserInfoList>([]);

  // 用户ID列表
  const userIdList = useMemo(() => {
    const userIdSet = new Set<string>();
    switch (selectedRole.id) {
      case InnerRoles.allCollaborator: {
        // 这里这样处理是因为必须要有顺序，只有collaborators才是有顺序的
        userIdSet.add(owner);
        collaborators.map((id) => {
          if (!userIdSet.has(id) && props.userRolesList[id].length > 0) {
            userIdSet.add(id);
          }
        });
        break;
      }
      case InnerRoles.owner: {
        userIdSet.add(owner);
        break;
      }
      // 自定义角色
      default: {
        for (const id in props.userRolesList) {
          if (props.userRolesList[id].indexOf(selectedRole.id) >= 0) {
            userIdSet.add(id);
          }
        }
        break;
      }
    }
    return [...userIdSet];
  }, [props.userRolesList, owner, collaborators, selectedRole.id]);

  // 用户信息列表
  useEffect(() => {
    props.getUsersInfoByIds(userIdList).then((data) => {
      setUserInfos && setUserInfos(data);
    });
  }, [userIdList]);

  return (
    <div className={style.wrapper}>
      <MainHeader
        title={`${selectedRole.text} (${userInfos.length})`}
        isOwner={true}
        setCurrentPanel={props.setCurrentPanel}
        setSelectedRole={setSelectedRole}
        showRoleManageModal={props.showRoleManageModal}
      />
      <CollaboratorList
        isAllList={selectedRole.id === InnerRoles.allCollaborator}
        userInfoList={userInfos}
        userRolesList={props.userRolesList}
        showUserRoleModal={props.showUserRoleModal}
      />
      <ShareLink />
    </div>
  );
};
