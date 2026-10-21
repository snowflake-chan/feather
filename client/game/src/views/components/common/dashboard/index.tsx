import React from 'react';
import { calc_class_name } from 'src/utils/classname';
import style from './index.module.css';

export const Dashboard = React.memo(
  (props: {
    percent: number;
    width: string;
    className?: string;
    color?: string;
  }) => {
    const cssProperties = {};
    cssProperties['--color'] = props.color || 'white';
    cssProperties['width'] = props.width;
    cssProperties['--width'] = props.width;

    const list = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    return (
      <div
        className={calc_class_name(style.container, props.className)}
        style={cssProperties}
      >
        <div className={style.meter}>
          {list.map((_, i) => {
            return (
              <span
                key={i}
                className={(i + 1) * 10 <= props.percent ? '' : style.empty}
              ></span>
            );
          })}
        </div>
        <div className={style.number}>{props.percent}</div>
      </div>
    );
  },
);
