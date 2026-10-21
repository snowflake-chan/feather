import React, { useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import { IconChat, IconBug, IconPersonGround } from '@box/icons';
import { TooltipTrigger, Trigger } from '@box/box-design';

import { setIsShowDebugLogPanel } from 'src/redux/edit/creator';
import { RootState } from 'src/redux/edit';
import { setChat } from 'src/redux/edit/ui';
import { CollaborationPanel } from '../../collaboration';
import { ArenaEditorUIContext } from 'src/views/edit/editor-ui-context';

import styles from './index.module.scss';
import { refreshNameIDMap } from 'src/views/edit/components/collaboration/transform';
import { clientConfig } from 'src/config/client';

type NavControlProps = {
  isGuest: boolean;
};

export const NavControl = React.memo((props: NavControlProps) => {
  const { isGuest } = props;
  const intl = useIntl();
  const dispatch = useDispatch();
  const isChatOpen = useSelector((state: RootState) => state.ui.chat);
  const permissionDebug = useSelector(
    (state: RootState) => state.permission.debugger,
  );
  const isShowDebugLogPanel = useSelector(
    (state: RootState) => state.creator.isShowDebugLogPanel,
  );
  const [isCollaborationOpen, setCollaborationOpen] = useState(false);
  const { replica } = useContext(ArenaEditorUIContext);
  const isLocalEngine = clientConfig.isLocalGameServer;

  useEffect(() => {
    if (!isLocalEngine && isCollaborationOpen) {
      refreshNameIDMap(clientConfig.mapInfo.contentId);
    }
  }, [isCollaborationOpen, isLocalEngine]);

  useEffect(() => {
    if (isGuest || isLocalEngine) {
      setCollaborationOpen(false);
    }
  }, [isGuest, isLocalEngine]);

  return (
    <div className={styles.navControl}>
      {!isLocalEngine && !isGuest && (
        <Trigger
          placement={'bottomRight'}
          align={{ offset: [4, 4] }}
          popupVisible={isCollaborationOpen}
          popup={
            <CollaborationPanel
              closeCollaboration={() => {
                setCollaborationOpen(false);
              }}
            />
          }
        >
          <div
            className={styles.navItem}
            onClick={() => {
              setCollaborationOpen(!isCollaborationOpen);
            }}
          >
            <TooltipTrigger
              text={intl.formatMessage({ id: 'collaboration' })}
              placement="bottom"
              align={{ offset: [0, 4] }}
            >
              <div
                className={`${styles.navItemContent} ${
                  isCollaborationOpen && styles.navItemActive
                }`}
              >
                <IconPersonGround />
                {Object.keys(replica.newApplicants).length > 0 && (
                  <i className={styles.redTips}></i>
                )}
              </div>
            </TooltipTrigger>
          </div>
        </Trigger>
      )}
      {!isLocalEngine && (
        <div
          className={styles.navItem}
          onClick={() => dispatch(setChat(!isChatOpen))}
        >
          <TooltipTrigger
            text={intl.formatMessage({ id: 'chat' })}
            placement="bottom"
            align={{ offset: [0, 4] }}
          >
            <div
              className={`${styles.navItemContent} ${
                isChatOpen && styles.navItemActive
              }`}
            >
              <IconChat />
            </div>
          </TooltipTrigger>
        </div>
      )}
      {permissionDebug && (
        <div
          className={styles.navItem}
          onClick={() => dispatch(setIsShowDebugLogPanel(!isShowDebugLogPanel))}
        >
          <TooltipTrigger
            text={intl.formatMessage({ id: 'debugger' })}
            placement="bottom"
            align={{ offset: [0, 4] }}
          >
            <div
              className={`${styles.navItemContent} ${
                isShowDebugLogPanel && styles.navItemActive
              }`}
            >
              <IconBug />
            </div>
          </TooltipTrigger>
        </div>
      )}
    </div>
  );
});
