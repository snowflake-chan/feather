import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { RootState } from 'src/redux/edit';
import { useEdit } from 'src/client/edit/edit-context';

import { UserInfoList } from '../index';
import { MenuList } from '../list/menu-list';
import { BackHeader } from '../header/back-header';
import style from '../index.module.scss';

type BlockedPanelProps = {
  getUsersInfoByIds: (userIds: string[]) => Promise<UserInfoList>;
  backToManage: () => void;
  showUserRoleModal: (userId: string) => void;
};

enum OperationIdType {
  unbanUser = 'unbanUser',
}
export const BlockedPanel = (props: BlockedPanelProps) => {
  const intl = useIntl();
  const editor = useEdit();
  const banned = useSelector((state: RootState) => state.permission.banned);

  const [users, setUsers] = useState<UserInfoList>([]);
  const num = useRef(0);

  // blocked用户ID列表
  useEffect(() => {
    num.current = num.current + 1;
    const bannedIdList = Object.keys(banned);
    if (!bannedIdList.length) {
      setUsers([]);
      return;
    }
    const currentNum = num.current;
    props.getUsersInfoByIds(bannedIdList).then((data) => {
      if (currentNum === num.current) {
        setUsers(data);
      }
    });
  }, [banned]);

  const menuList = useMemo(() => {
    return [OperationIdType.unbanUser].map((item) => ({
      id: item,
      text: intl.formatMessage({ id: item }),
    }));
  }, [intl]);

  const onMenuItemSelected = useCallback(
    (id: OperationIdType, selectedUserId: string) => {
      props.showUserRoleModal(selectedUserId);
    },
    [props],
  );
  return (
    <div className={style.wrapper}>
      <BackHeader
        name={intl.formatMessage({ id: 'banned' })}
        num={users.length}
        back={() => {
          props.backToManage();
        }}
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
