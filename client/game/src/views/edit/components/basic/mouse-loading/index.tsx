import { useCallback, useEffect, useRef, useState } from 'react';
import { throttle } from 'src/utils/debounce-throttle';
import style from './index.module.css';

const HALF_WIDTH = 20;
const HALF_HEIGHT = 20;

export function MouseLoading(props: { defaultY?: number; defaultX?: number }) {
  const { defaultY, defaultX } = props;
  const isUnmount = useRef(false);
  const [top, setTop] = useState(
    defaultY === undefined ? 0 : defaultY - HALF_HEIGHT,
  );
  const [left, setLeft] = useState(
    defaultX === undefined ? 0 : defaultX - HALF_WIDTH,
  );

  const handler = useCallback((e: MouseEvent) => {
    if (isUnmount.current) {
      return;
    }
    setTop(e.clientY - HALF_HEIGHT);
    setLeft(e.clientX - HALF_WIDTH);
  }, []);

  useEffect(() => {
    const throttleHandler = throttle(handler, 16);
    window.addEventListener('mousemove', throttleHandler);
    return () => {
      isUnmount.current = true;
      window.removeEventListener('mousemove', throttleHandler);
    };
  }, [handler]);

  return (
    <div className={style.mouseLoadingPanel}>
      <div
        className={style.loading}
        style={{
          top,
          left,
        }}
      >
        <div className={style.loadingIcon} />
      </div>
    </div>
  );
}
