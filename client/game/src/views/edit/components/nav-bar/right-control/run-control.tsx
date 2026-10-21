import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import { IconPlay, IconLoading, IconStop } from '@box/icons';
import { TooltipTrigger } from '@box/box-design';

import { RootState } from 'src/redux/edit';
import { useEdit } from 'src/client/edit/edit-context';
import Tooltip from 'src/views/components/common/tooltip';
import { ArenaEditorUIContext } from 'src/views/edit/editor-ui-context';

import styles from './index.module.scss';

export const RunControl = React.memo(() => {
  const intl = useIntl();
  const editor = useEdit();
  const { replica } = useContext(ArenaEditorUIContext);
  const isRunning = useSelector((state: RootState) => state.ui.isRunning);
  const [isRunPending, setIsRunPending] = useState<boolean>(false);
  const [isShowRunTooltip, setIsShowRunTooltip] = useState<boolean>(
    isRunning ? true : false,
  );
  const RunningStatus = {
    Normal: 'Normal',
    Running: 'Running',
  };

  useEffect(() => {
    if (isRunPending) {
      /**
       * 只有在运行状态改变的时候才执行
       * 当pending时，改为非pending，并展示tooltips
       */
      setIsRunPending(false);
      setIsShowRunTooltip(true);
    }
  }, [isRunning]);

  const clickRunBtn = useCallback(() => {
    if (isRunPending) {
      return;
    }
    setIsShowRunTooltip(false);
    setIsRunPending(true);
    if (isRunning) {
      editor.replica.stopProject();
    } else {
      editor.replica.startProject();
    }
  }, [editor.replica, isRunPending, isRunning]);

  return !!replica.localPermissions.playButton ? (
    <div className={styles.navControl}>
      <Tooltip
        tooltipClass={isShowRunTooltip ? styles.tooltip : ''}
        visible={isShowRunTooltip}
        key={isRunning ? RunningStatus.Running : RunningStatus.Normal}
        content={
          <div onClick={() => setIsShowRunTooltip(false)}>
            {intl.formatMessage({
              id: isRunning ? 'playingHints' : 'stopHints',
            })}
          </div>
        }
        dismiss={3000}
      >
        <div className={styles.navItem} onClick={() => clickRunBtn()}>
          <TooltipTrigger
            text={
              isRunning
                ? intl.formatMessage({ id: 'stopRunning' })
                : intl.formatMessage({ id: 'run' })
            }
            placement="bottom"
            align={{ offset: [0, 4] }}
          >
            <div
              className={`${styles.runBtn} ${styles.navItemContent} ${
                isRunning && styles.navItemActive
              } ${isRunPending && styles.iconLoading}`}
            >
              {isRunPending ? (
                <IconLoading />
              ) : isRunning ? (
                <IconStop />
              ) : (
                <IconPlay />
              )}
            </div>
          </TooltipTrigger>
        </div>
      </Tooltip>
    </div>
  ) : null;
});
