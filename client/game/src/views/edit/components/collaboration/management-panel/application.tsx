import { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { Button, Toast } from '@box/box-design';
import { IconCancel, IconDone } from '@box/icons';
import { useEdit } from 'src/client/edit/edit-context';

import { UserInfoList } from '../index';
import { ListItem } from '../list/list-item';
import { BackHeader } from '../header/back-header';
import { ArenaEditorUIContext } from '../../../editor-ui-context';

import style from '../index.module.scss';
import { apis } from 'src/apis/local-api';
import { clientConfig } from 'src/config/client';
import { CollaborationApplyVO } from '@box/apis';

type ApplicationListProps = {
  getUsersInfoByIds: (userIds: string[]) => Promise<UserInfoList>;
  backToManage: () => void;
  showUserRoleModal: (userId: string) => void;
};

export const ApplicationPanel = (props: ApplicationListProps) => {
  const intl = useIntl();
  const editor = useEdit();
  const [users, setUsers] = useState<UserInfoList>([]);
  const { replica } = useContext(ArenaEditorUIContext);
  const [createraUsers, setCreateraUsers] = useState<CollaborationApplyVO[]>(
    [],
  );

  const num = useRef(0);

  const refreshApplicationList = useCallback(() => {
    // call createra api
    apis.collaboration
      .applyListUsingGet({
        mapId: clientConfig.mapInfo.contentId + '',
      })
      .then(setCreateraUsers);
  }, []);

  useEffect(() => {
    num.current = num.current + 1;
    refreshApplicationList();
    if (!replica.applications.length) {
      setUsers([]);
      return;
    }
    const currentNum = num.current;

    props.getUsersInfoByIds(replica.applications).then((data) => {
      if (currentNum === num.current) {
        setUsers(data);
      }
    });
  }, [replica.applications, refreshApplicationList]);

  const handleAccept = useCallback(
    (userId) => {
      props.showUserRoleModal(userId);
    },
    [props],
  );

  useEffect(() => {
    return () => {
      editor.replica.clearNewApplicants();
    };
  }, []);

  return (
    <div className={style.wrapper}>
      <BackHeader
        name={intl.formatMessage({ id: 'application' })}
        num={users.length}
        back={props.backToManage}
      />
      <div className={style.listContainer}>
        {users.map((info) => (
          <ListItem
            key={info.userId}
            {...info}
            hasDot={replica.newApplicants[info.userId]}
            operation={
              <>
                <Button
                  className={`${style.basicBtn} ${style.cancelBtn}`}
                  type={'icon'}
                  size={'custom'}
                  icon={
                    <IconCancel
                      className={`${style.icon} ${style.cancelIcon}`}
                    />
                  }
                  onClick={async (ev) => {
                    // call createra api
                    try {
                      await apis.collaboration.rejectApplyUsingPost({
                        mapId: clientConfig.mapInfo.contentId + '',
                        applyId: createraUsers.find(
                          (_) => _.userId === info.userId,
                        )!.applyId,
                      });
                    } catch (err) {
                      Toast.error({
                        content: intl.formatMessage({ id: 'unknownError' }),
                      });
                      return;
                    }

                    refreshApplicationList();
                    editor.permissionController.deniedApplication(info.userId);
                  }}
                />
                <Button
                  className={style.basicBtn}
                  type={'icon'}
                  size={'custom'}
                  icon={
                    <IconDone className={`${style.icon} ${style.doneIcon}`} />
                  }
                  onClick={() => handleAccept(info.userId)}
                />
              </>
            }
          />
        ))}
      </div>
    </div>
  );
};
