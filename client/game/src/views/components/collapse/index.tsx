import { IconListRight, IconRight } from '@box/icons';
import style from './index.module.css';
import React from 'react';

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export const Collapse: React.FC<Props> = (props) => {
  return (
    <>
      <div className={style.collapse} onClick={props.onToggle}>
        <IconRight width={16} height={16} fill={'#fff'} />
      </div>
      <div
        className={`${style.expend} ${props.collapsed ? '' : style.hide}`}
        onClick={props.onToggle}
      >
        <IconListRight width={16} height={16} fill={'#fff'} />
      </div>
    </>
  );
};
