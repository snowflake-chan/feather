import React from 'react';
import { calc_class_name } from 'src/utils/classname';
import style from './index.module.css';

export const Icon = React.memo(
  (props: {
    icon: string;
    className?: string;
    style?: React.CSSProperties;
    onClick?: (
      ev: React.MouseEvent<HTMLAnchorElement | HTMLDivElement, MouseEvent>,
    ) => void;
    size?: number;
  }) => {
    const cln = calc_class_name(
      style.iconContainer,
      props.className,
      props.onClick && style.clickable,
      'icon',
    );
    const icon = (
      <svg
        className={style.icon}
        style={{
          fontSize: props.size ? props.size + 'px' : undefined,
          ...(props.style || {}),
        }}
      >
        <use xlinkHref={`#icon-${props.icon}`}></use>
      </svg>
    );

    return (
      <div className={cln} onClick={props.onClick}>
        {icon}
      </div>
    );
  },
);
