import { useRef, useState } from 'react';
import { icosahedron } from './icosahedron';
import { triangle } from './triangle';
import { sprites } from './sprites';
import style from './style.module.css';
import { Button, Input, ModalView } from '@box/box-design';
import { createMesh, loadGLMesh } from './model';
import { cube } from './cube';

export default function RewgpuView() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [renderModel, setRenderModel] = useState(false);
  const [hash, setHash] = useState('');

  return (
    <div className={style.canvasContainer}>
      {!renderModel && (
        <ModalView
          style={{
            width: 600,
          }}
          content={
            <div>
              <Input
                value={hash}
                valueType={'string'}
                type={'primary'}
                size={'large'}
                onBlur={setHash}
              />
              <Button
                size={'large'}
                onClick={() => {
                  loadGLMesh(hash).then((res) => {
                    if (res && canvas.current) {
                      canvas.current.width = window.innerWidth;
                      canvas.current.height = window.innerHeight;
                      // createMesh(canvas.current, res);
                      cube(canvas.current);
                      setRenderModel(true);
                    }
                    return;
                  });
                }}
              >
                加载这个hash值
              </Button>
            </div>
          }
        />
      )}
      <canvas
        ref={canvas}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'yellowgreen',
        }}
      />
    </div>
  );
}
