import React, { ReactElement, useState } from 'react';
import dynamic from 'next/dynamic';
import style from '../styles/index.module.scss';

// 浏览器执行的代码
const DynamicPlay = dynamic(() => import('../components/play'), { ssr: false });
const DynamicVoxa = dynamic(() => import('../components/voxa'), { ssr: false });

export default function Home(): ReactElement {
  const [type, setType] = useState('');
  const components = [
    {
      type: 'play',
      comp: <DynamicPlay key={'play'} />,
    },
    {
      type: 'voxa',
      comp: <DynamicVoxa key={'voxa'} />,
    },
  ];

  return (
    <div className={style.home}>
      <div className={style.buttons}>
        {components.map((item) => {
          return (
            <div
              key={item.type}
              className={style.button}
              onClick={() => setType(item.type)}
            >
              {item.type}
            </div>
          );
        })}
      </div>
      <div className={style.iframeWrap}>
        {components.map((item) => {
          return item.type === type && item.comp;
        })}
      </div>
    </div>
  );
}
