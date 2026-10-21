import { useEffect, useRef } from 'react';
import { create } from '@box/sdk';

export default function Voxa() {
  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    const dom = ref.current;

    if (!dom) {
      return;
    }

    const parent = create({
      type: 'edit',
      url: 'https://xxx.dao3.fun:3000',
    });

    parent.init({
      dom,
    });

    return () => {
      parent.destroy();
    };
  }, []);

  return <div ref={ref} style={{ height: '100%' }} />;
}
