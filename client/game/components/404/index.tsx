import React from 'react';
import Image from 'next/legacy/image';
import img404 from '../../assets/404-cover.png';
import style from './index.module.css';

export function PageNotFound() {
  return (
    <main className={style.wrapper}>
      <div className={style.imgWrapper}>
        <Image
          src={img404}
          alt="漂浮方块组成的 404 图案"
          layout="responsive"
          priority
        />
      </div>

      <p>Oops, page not found!</p>
    </main>
  );
}
