import { useMemo, useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import { RootState } from 'src/redux/edit';
import { useEdit } from 'src/client/edit/edit-context';

import { MenuItemType, InnerRoles, UserInfoList, UserRolesList } from './index';

import style from './index.module.scss';
import { MenuList } from './list/menu-list';
import { MainHeader } from './header/manage-header';
import { apis } from 'src/apis/local-api';
import { clientConfig } from 'src/config/client';

type CollaboratorInfoProps = {
  getUsersInfoByIds: (userIds: string[]) => Promise<UserInfoList>;
  userRolesList: UserRolesList;
};

// 协作者查看面板 - 后续产品考虑会移到别处做社交和协作状态展示
export const CollaboratorInfoPanel = (props: CollaboratorInfoProps) => {
  const intl = useIntl();
  const editor = useEdit();
  const userId = useSelector((state: RootState) => state.user.id.toString());
  const { owner, collaborators } = useSelector(
    (state: RootState) => state.permission,
  );

  const [selectedRole, setSelectedRole] = useState<MenuItemType>({
    id: InnerRoles.allCollaborator,
    text: intl.formatMessage({ id: InnerRoles.allCollaborator }),
  });

  const [userList, setUserList] = useState<UserInfoList>([]);

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
      setUserList && setUserList(data);
    });
  }, [userIdList]);

  const items = useMemo(() => {
    return userList.map((item) => {
      item['isHideOperation'] = userId !== item.userId;
      return item;
    });
  }, [userList, userId]);
  return (
    <div className={style.wrapper}>
      <MainHeader
        title={`${selectedRole.text} (${userList.length})`}
        isOwner={false}
        setSelectedRole={setSelectedRole}
      />
      <MenuList
        items={items}
        menuList={[
          {
            id: 'endCollaboration',
            text: intl.formatMessage({ id: 'endCollaboration' }),
          },
        ]}
        onMenuItemSelected={async (id, selectedUserId) => {
          await apis.collaboration.terminateUsingPost({
            mapId: clientConfig.mapInfo.contentId + '',
          });
          editor.permissionController.cancelCollaborator(selectedUserId);
        }}
      />
    </div>
  );
};
