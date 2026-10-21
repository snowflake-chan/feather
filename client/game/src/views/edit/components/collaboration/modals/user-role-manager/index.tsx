import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ModalView } from '@box/box-design/build/modal';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import { RootState } from 'src/redux/edit';
import { RadioBtn } from 'src/views/components/basic/radioBtn';
import { hashURL } from 'src/utils/hash-url';
import { useEdit } from 'src/client/edit/edit-context';
import { InnerRoles, UserInfoList, userInfoType } from '../..';
import { PanelType } from '../../management-panel';
import { EditCheckbox } from '../../../edit-checkbox';
import style from './index.module.scss';
import { throttle } from 'src/utils/debounce-throttle';
import { apis } from 'src/apis/local-api';
import { clientConfig } from 'src/config/client';
import { getRoleId } from 'src/views/edit/components/collaboration/transform';
import { Toast } from '@box/box-design';

type UserRoleManagerProps = {
  currentPanel: PanelType;
  userId: string;
  getUsersInfoByIds: (userIds: string[]) => Promise<UserInfoList>;
  onClose: () => void;
};

export const UserRoleManager = (props: UserRoleManagerProps) => {
  const { currentPanel, userId, getUsersInfoByIds, onClose } = props;
  const intl = useIntl();
  const editor = useEdit();
  const [userInfo, setUserInfo] = useState<userInfoType>();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const { groups, collaborators } = useSelector(
    (state: RootState) => state.permission,
  );

  const [windowHeight, setWindowHeight] = useState(0);
  // 屏幕高度小于560 + 24 + 24
  const isShortScreen = windowHeight <= 608;

  useEffect(() => {
    const onResize = throttle(() => {
      if (typeof window !== 'undefined') {
        setWindowHeight(window.innerHeight);
      }
    }, 100);
    onResize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    // 初始化用户信息 初始化用户已拥有的职位
    getUsersInfoByIds([userId]).then((info) => {
      setUserInfo && setUserInfo(info[0]);
      setSelectedRoles && setSelectedRoles(info[0].roles ? info[0].roles : []);
    });
  }, [getUsersInfoByIds, userId]);

  // 选择/反选 职位 的回调
  const handleClickRole = (role: string, select: boolean) => {
    const newRolesList = [...selectedRoles];
    if (select) {
      newRolesList.push(role);
    } else {
      newRolesList.splice(newRolesList.indexOf(role), 1);
    }
    setSelectedRoles(newRolesList);
  };

  // 弹窗确认的回调
  const handleConfirm = useCallback(async () => {
    if (userInfo === undefined) {
      return;
    }
    // 1.设置职位
    // call createra api
    try {
      await apis.collaboration.updateMemberUsingPut({
        mapId: clientConfig.mapInfo.contentId + '',
        userId: userId,
        roleIds: selectedRoles.map((role) => getRoleId(role)),
      });
    } catch (err) {
      Toast.error({
        content: intl.formatMessage({ id: 'unknownError' }),
      });
      return;
    }

    editor.permissionController.setUserPermission(
      userInfo.userId,
      userInfo.roles || [],
      selectedRoles,
    );

    switch (currentPanel) {
      case PanelType.blocked: {
        if (selectedRoles.length > 0) {
          // 如果 变为 协作者 - 要加入协作者列表
          editor.permissionController.addCollaborator(userInfo.userId, '');
        }
        // 取消拉黑
        // call createra api
        try {
          await apis.collaboration.unbanUsingPost({
            mapId: clientConfig.mapInfo.contentId + '',
            userId: userId,
          });
        } catch (err) {
          Toast.error({
            content: intl.formatMessage({ id: 'unknownError' }),
          });
          return;
        }

        editor.permissionController.unbanUser(userInfo.userId);
        break;
      }
      case PanelType.application: {
        // 同意申请 - 删除申请信息
        editor.permissionController.acceptApplication(
          userInfo.userId,
          userInfo.roles || [],
          selectedRoles,
        );
        break;
      }
      default: {
        if (selectedRoles.length === 0) {
          // 协作者 变为 游客 - 从协作者列表中删除用户
          const index = collaborators.indexOf(userInfo.userId);
          editor.permissionController.spliceCollaborators(index, 1);
        } else if (collaborators.indexOf(userInfo.userId) === -1) {
          // 游客 变为 协作者 - 将该用户加入到协作者列表中
          editor.permissionController.addCollaborator(userInfo.userId, '');
        }
        break;
      }
    }
    onClose();
  }, [
    collaborators,
    currentPanel,
    editor.permissionController,
    intl,
    onClose,
    selectedRoles,
    userId,
    userInfo,
  ]);

  return (
    <ModalView
      style={{
        maxHeight: 560,
      }}
      rootStyle={{
        paddingTop: 24,
        paddingBottom: 24,
      }}
      width={400}
      title={
        currentPanel === PanelType.manage
          ? intl.formatMessage({ id: 'changeRole' })
          : intl.formatMessage({ id: 'selectRole' })
      }
      confirmText={intl.formatMessage({ id: 'save' })}
      onConfirm={handleConfirm}
      cancelText={intl.formatMessage({ id: 'cancel' })}
      onCancel={onClose}
      content={
        <div className={style.container}>
          <div className={style.userInfo}>
            <div
              className={style.avatar}
              style={
                userInfo?.avatarHash
                  ? { backgroundImage: `url(${hashURL(userInfo.avatarHash)})` }
                  : {}
              }
            ></div>
            <div className={style.name}>{userInfo?.name}</div>
          </div>
          <div
            className={style.roleList}
            style={{
              maxHeight: isShortScreen ? windowHeight - 256 : 350,
              minHeight: isShortScreen
                ? Math.max(windowHeight - 460, 190)
                : 190,
            }}
          >
            {Object.keys(groups)
              .filter((item) => item !== InnerRoles.guest)
              .map((role) => {
                return (
                  <div className={style.role} key={role}>
                    <div className={style.roleRadio}>
                      <EditCheckbox
                        checked={selectedRoles.some((r) => r === role)}
                        onChange={(select) => handleClickRole(role, select)}
                      />
                    </div>
                    <div className={style.roleName}>
                      {role === InnerRoles.admin ||
                      role === InnerRoles.contributor
                        ? intl.formatMessage({ id: role })
                        : role}
                    </div>
                  </div>
                );
              })}
            {(currentPanel === PanelType.manage ||
              currentPanel === PanelType.blocked) && (
              <div className={style.guest}>
                <div className={style.roleRadio}>
                  <RadioBtn
                    checked={
                      // 对于非游客用户，当用户信息还没加载出来的时候，不默认勾选游客选项
                      // 除了非游客用户，就是游客、申请人、黑名单。
                      // 为游客/申请人分配职位时，不提供游客选项；为黑名单非配职位时，默认勾选游客选项；
                      currentPanel === PanelType.manage && !userInfo
                        ? false
                        : selectedRoles.length === 0
                    }
                    onChange={() => setSelectedRoles([])}
                    // 游客选项 - 可以主动点击选游客，选中游客就会取消掉原有的职位选项
                    // 游客选项 - 不可主动点击取消，只能通过选择职位来取消游客的选中态
                  />
                </div>
                <div className={style.roleName}>
                  {intl.formatMessage({ id: 'guest' })}
                </div>
              </div>
            )}
          </div>
        </div>
      }
    />
  );
};
