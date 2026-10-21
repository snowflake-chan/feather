import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from 'src/redux/edit';
import { ContentPanel } from './content-panel';
import style from './index.module.scss';

export function RightSidebar() {
  const hasPermission = useSelector(
    (state: RootState) => state.permission.editModel,
  );

  const isShowRightPanel = useSelector(
    (state: RootState) => state.creator.isShowRightPanel,
  );
  const className = useMemo(() => {
    const list = [style.rightPanelContainer];

    isShowRightPanel && list.push(style.expandContainer);

    return list.join(' ');
  }, [isShowRightPanel]);

  return hasPermission ? (
    <div className={className}>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ContentPanel />
      </div>
    </div>
  ) : null;
}
