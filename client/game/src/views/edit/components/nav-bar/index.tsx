import React from 'react';
import styles from './index.module.scss';
import { LeftMenu } from './left-menu';
import { RightControl } from './right-control';
import { MidOperation } from './mid-operation';
import { TransformType } from '../transformHandler';

type TopBarProps = {
  isGuest: boolean;
  currentTransformType: TransformType;
  toggleTransformType: (transformType: TransformType) => void;
};

/**
 * Arena Edit Mode 顶部导航栏
 */
export const NavBar = React.memo((props: TopBarProps) => {
  const { isGuest, currentTransformType, toggleTransformType } = props;

  return (
    <div className={styles.navBar}>
      <LeftMenu isGuest={isGuest} />
      {!isGuest && (
        <MidOperation
          transformType={currentTransformType}
          toggleTransformType={toggleTransformType}
        />
      )}
      <RightControl isGuest={isGuest} />
    </div>
  );
});
