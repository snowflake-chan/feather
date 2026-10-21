import React, { useEffect, useRef } from 'react';
import { create, EventsType } from '@box/sdk';
import style from '../styles/index.module.scss';
interface OnEvents extends EventsType {
  custom: any;
  a: string;
  b: {};
}

interface emitEvents extends EventsType {
  hh: any;
  bb: string;
}

export default () => {
  const iframeRef = useRef();
  let player;
  const b = (value) => {
    console.log('jumpTo2', value);
  };
  useEffect(() => {
    (async () => {
      const playParent = (player = create<OnEvents, emitEvents>({
        type: 'play',
        url: 'https://xxx.createra.fun:3000/e/xxxx',
      }));

      playParent.eventOn('loaded', () => {
        console.log('loaded');
      });
      const isInit = await playParent.init({
        dom: iframeRef.current,
        eventsOn: (key, value) => {
          console.log('player events:', key, value);
        },
      });
      console.log('isInit', isInit);
      playParent.eventOn('jumpTo', (value) => {
        console.log('jumpTo1:', value);
      });
      playParent.eventOn('jumpTo', b);
      playParent.eventOn('status', (value) => {
        console.log('status', value);
      });
      playParent.eventOn('custom', () => {});
      await playParent.emitEvent('bb', '');
    })();
  }, []);
  return (
    <div ref={iframeRef} style={{ height: '100%', position: 'relative' }}>
      <div
        className={style.startBtn}
        onClick={() => player.eventOff('jumpTo', b)}
      >
        destroy
      </div>
    </div>
  );
};
