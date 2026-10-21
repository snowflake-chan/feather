import React, { useState, useEffect } from 'react';
import { calc_class_name } from 'src/utils/classname';
import style from './index.module.css';

export const Loading = React.memo(
  (props: { className?: string; timeout?: number }) => {
    const [showLoadingAnim, setLoadingAnim] = useState(
      props.timeout ? false : true,
    );

    useEffect(() => {
      const timeoutId = setTimeout(() => {
        setLoadingAnim(true);
      }, props.timeout);
      return () => window.clearTimeout(timeoutId);
    }, []);

    if (!showLoadingAnim) {
      return null;
    }

    return (
      <div className={calc_class_name(style.loadingContainer, props.className)}>
        <div className={style.cube}>
          <div className={style.face + ' ' + style.front}></div>
          <div className={style.face + ' ' + style.back}></div>
          <div className={style.face + ' ' + style.right}></div>
          <div className={style.face + ' ' + style.left}></div>
          <div className={style.face + ' ' + style.top}></div>
          <div className={style.face + ' ' + style.bottom}></div>
        </div>
      </div>
    );
  },
);
