import React, { ReactNode } from 'react';
import { CenterPanelEnum, RightNavCtrlEnum } from '~/views/edit/defs';
import { CreateControl } from './create-control';
import styles from './index.module.scss';
import { NavControl } from './nav-control';
import { RunControl } from './run-control';
import { SceneControl } from './scene-control';

type RightControlProps = {
  isGuest: boolean;
};

export type NavCtrlItemType = {
  id: RightNavCtrlEnum | CenterPanelEnum;
  icon: ReactNode;
  tooltip: string;
  isActive: boolean;
  handleClickItem: () => void;
};

export const RightControl = React.memo((props: RightControlProps) => {
  const { isGuest } = props;

  return (
    <div className={`${styles.rightControl}`}>
      {!isGuest && <CreateControl />}
      <NavControl isGuest={isGuest} />
      {!isGuest && <SceneControl />}
      {!isGuest && <RunControl />}
    </div>
  );
});

RightControl.displayName = 'RightControl';
