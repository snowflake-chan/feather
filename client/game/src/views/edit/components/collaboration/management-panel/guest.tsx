import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import { useEdit } from 'src/client/edit/edit-context';
import { RootState } from 'src/redux/edit';

import { UserInfoList, UserRolesList } from '../index';
import { BackHeader } from '../header/back-header';
import { MenuList } from '../list/menu-list';

import style from '../index.module.scss';
import { apis } from 'src/apis/local-api';
import { clientConfig } from 'src/config/client';
import { Toast } from '@box/box-design';

type GuestPanelProps = {
  getUsersInfoByIds: (userIds: string[]) => Promise<UserInfoList>;
  userRolesList: UserRolesList;
  backToManage: () => void;
  showUserRoleModal: (userId: string) => void;
};

enum OperationIdType {
  selectRole = 'selectRole',
  banUser = 'banUser',
}
export const GuestPanel = (props: GuestPanelProps) => {
  const intl = useIntl();
  const editor = useEdit();
  const userId = useSelector((state: RootState) => state.user.id).toString();
  const banned = useSelector((state: RootState) => state.permission.banned);
  const [users, setUsers] = useState<UserInfoList>([]);
  const num = useRef(0);

  // 游客id列表
  const guestList = useMemo(() => {
    const guests: string[] = [];
    for (const id in props.userRolesList) {
      if (props.userRolesList[id].length === 0 && !banned[id]) {
        guests.push(id);
      }
    }
    return guests;
  }, [props.userRolesList, banned]);

  useEffect(() => {
    num.current = num.current + 1;
    if (!guestList.length) {
      setUsers([]);
      return;
    }
    const currentNum = num.current;
    props.getUsersInfoByIds(guestList).then((data) => {
      if (currentNum === num.current) {
        setUsers(data);
      }
    });
  }, [guestList]);

  const menuList = useMemo(() => {
    return [OperationIdType.selectRole, OperationIdType.banUser].map(
      (item) => ({
        id: item,
        text: intl.formatMessage({ id: item }),
      }),
    );
  }, [intl]);

  const onMenuItemSelected = useCallback(
    async (id: OperationIdType, selectedUserId: string) => {
      switch (id) {
        case OperationIdType.banUser: {
          try {
            await apis.collaboration.banUsingPost({
              mapId: clientConfig.mapInfo.contentId + '',
              userId: selectedUserId,
            });
          } catch (err) {
            Toast.error({
              content: intl.formatMessage({ id: 'unknownError' }),
            });
            return;
          }
          editor.permissionController.banUser(selectedUserId, userId, '', [
            'guest',
          ]);
          break;
        }
        case OperationIdType.selectRole:
          props.showUserRoleModal(selectedUserId);
          break;
      }
    },
    [editor.permissionController, userId, props, intl],
  );
  return (
    <div className={style.wrapper}>
      <BackHeader
        name={intl.formatMessage({ id: 'guest' })}
        num={users.length}
        back={props.backToManage}
      />
      <MenuList
        items={users}
        menuList={menuList}
        onMenuItemSelected={(id, userId) =>
          onMenuItemSelected(id as OperationIdType, userId)
        }
      />
    </div>
  );
};
