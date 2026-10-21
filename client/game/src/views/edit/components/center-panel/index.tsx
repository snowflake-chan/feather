import React, { ReactElement } from 'react';
import style from './index.module.scss';

export const CenterPanelWarp = (props: {
  children: ReactElement<any> | number | string;
}) => {
  return <div className={`${style.centerModalWarp}`}>{props.children}</div>;
};
