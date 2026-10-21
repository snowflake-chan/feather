import React, { useCallback, useContext } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useEdit } from 'src/client/edit/edit-context';
import { RootState } from 'src/redux/edit';
import { Toast } from '@box/box-design';
import { IconSend, IconHourglass } from '@box/icons';
import styles from './index.module.scss';
import { ArenaEditorUIContext } from 'src/views/edit/editor-ui-context';
import { apis } from 'src/apis/local-api';
import { clientConfig } from 'src/config/client';

export const GuestControl = React.memo(() => {
  const intl = useIntl();
  const editor = useEdit();
  const { replica } = useContext(ArenaEditorUIContext);
  const userId = useSelector((state: RootState) => state.user.id);
  const _isLogin = useCallback(() => {
    return Boolean(userId);
  }, [userId]);

  const hasApplied = replica.applications.indexOf(userId.toString()) >= 0;

  const isInviteLink =
    !!editor.game.state.inviteLinkGroup &&
    editor.game.state.inviteLinkGroup !== 'guest';

  const _handleApplyForEditing = useCallback(async () => {
    // call createra api
    try {
      await apis.collaboration.applyUsingPost({
        mapId: clientConfig.mapInfo.contentId + '',
      });
    } catch (err) {
      Toast.error({
        content: intl.formatMessage({ id: 'unknownError' }),
      });
      return;
    }

    editor.permissionController.ApplyForEditing();
    Toast.success({ content: intl.formatMessage({ id: 'applySent' }) });
  }, [editor.permissionController, intl]);

  // 游客模式下展现的按钮标题
  const guestModeTitle = useCallback(() => {
    let title;
    if (_isLogin()) {
      if (!isInviteLink) {
        if (hasApplied) {
          title = intl.formatMessage({ id: 'alreadyApplied' });
        } else {
          title = intl.formatMessage({ id: 'applyForEditing' });
        }
      } else {
        if (!editor.game.state.joinAsCollaborator) {
          title = intl.formatMessage({ id: 'joinCreation' });
        } else {
          if (hasApplied) {
            title = intl.formatMessage({ id: 'alreadyApplied' });
          } else {
            title = intl.formatMessage({ id: 'applyForEditing' });
          }
        }
      }
    } else {
      title = intl.formatMessage({ id: 'login_register' });
    }
    return title;
  }, [
    _isLogin,
    editor.game.state.joinAsCollaborator,
    hasApplied,
    intl,
    isInviteLink,
  ]);

  // 游客执行的回调
  const handleGuestMode = useCallback(() => {
    if (_isLogin()) {
      if (isInviteLink) {
        if (!editor.game.state.joinAsCollaborator) {
          editor.game.state.joinAsCollaborator = true;
          editor.permissionController.addCollaborator(
            userId.toString(),
            editor.game.state.inviteLinkGroup,
          );
        } else {
          if (replica.permissions.groups['guest'].members[userId]) {
            if (!hasApplied) {
              _handleApplyForEditing();
            }
          }
        }
      } else {
        if (!hasApplied) {
          _handleApplyForEditing();
        }
      }
    }
  }, [
    _handleApplyForEditing,
    _isLogin,
    editor.game.state,
    editor.permissionController,
    hasApplied,
    isInviteLink,
    replica.permissions.groups,
    userId,
  ]);
  return (
    <div className={styles.navControl}>
      <div className={styles.navItem} onClick={() => handleGuestMode()}>
        <div
          className={`${styles.navItemContent} ${
            hasApplied && styles.navItemDisable
          }`}
        >
          {hasApplied ? <IconHourglass /> : <IconSend />}
          <span className={`${styles.title}`}>{guestModeTitle()}</span>
        </div>
      </div>
      <div className={styles.divider} />
    </div>
  );
});
