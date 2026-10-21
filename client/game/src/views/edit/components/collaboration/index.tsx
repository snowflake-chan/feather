import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from 'src/redux/edit';

import { CollaboratorInfoPanel } from './collaborator';
import style from './index.module.scss';
import { ManageMentPanel } from './management-panel';
import { RoleManage } from './modals/role-manage';

export type UserRolesList = { [userId: string]: string[] };
export type userInfoType = {
  userId: string;
  name?: string;
  avatarHash?: string;
  roles?: string[];
};
export type UserInfoList = userInfoType[];

export enum InnerRoles {
  owner = 'owner',
  allCollaborator = 'allCollaborator',
  guest = 'guest',
  admin = 'admin',
  contributor = 'contributor',
  banned = 'banned',
  application = 'application',
}
export type MenuItemType = {
  text: string;
  id: string;
};

export const CollaborationPanel = (props: {
  closeCollaboration: () => void;
}) => {
  const { closeCollaboration } = props;
  const { groups, owner, users, localOwner } = useSelector(
    (state: RootState) => state.permission,
  );

  const [isShowRoleManageModal, setIsShowRoleManageModal] = useState(false);

  // 获取所有用户ID对应的roles
  const userRolesList = useMemo((): UserRolesList => {
    const list: UserRolesList = {};

    const groupNames = Object.keys(groups);
    const userIds = Object.keys(users);
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      list[userId] = [];
      if (userId === owner) {
        list[userId].push(InnerRoles.owner);
      }
      for (let j = 0; j < groupNames.length; j++) {
        const members = groups[groupNames[j]].members;
        if (groupNames[j] !== 'guest' && members[userId]) {
          list[userId].push(groupNames[j]);
        }
      }
    }
    return list;
  }, [groups, users, owner]);

  // 本地工程不依赖平台用户服务；协作者以工程内保存的 ID 显示。
  const getUsersInfoByIds = useCallback(
    async (userIds: string[]) => {
      if (!userIds.length) {
        return [];
      }
      return userIds.map((userId) => ({
        userId,
        name: userId,
        roles: userRolesList[userId],
      }));
    },
    [userRolesList],
  );

  return (
    <div>
      <div
        className={style.closeWrapper}
        onClick={(ev) => {
          ev.stopPropagation();
          closeCollaboration();
        }}
        onMouseDown={(ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          closeCollaboration();
        }}
      />
      {isShowRoleManageModal && (
        <RoleManage close={() => setIsShowRoleManageModal(false)} />
      )}
      {localOwner ? (
        <ManageMentPanel
          getUsersInfoByIds={getUsersInfoByIds}
          userRolesList={userRolesList}
          showRoleManageModal={() => setIsShowRoleManageModal(true)}
        />
      ) : (
        <CollaboratorInfoPanel
          getUsersInfoByIds={getUsersInfoByIds}
          userRolesList={userRolesList}
        />
      )}
    </div>
  );
};
