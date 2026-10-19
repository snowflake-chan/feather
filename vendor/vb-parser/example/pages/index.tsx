import type { NextPage } from 'next';
import Head from 'next/head';
import { DragEventHandler, useCallback, useState } from 'react';
import styles from '../styles/index.module.css';
import { parseVbFile } from '@box/vb-parser';

const Home: NextPage = () => {
  const [modelText, setModelText] = useState('');
  const [projectText, setProjectText] = useState('');

  console.log('Welcome to example of vb-parser');

  const onDrop: DragEventHandler = useCallback(async (evt) => {
    evt.preventDefault();
    const [file] = evt.dataTransfer.files;

    if (!file) {
      return;
    }

    const { name } = file;

    if (!/\.v(d|b)$/.test(name)) {
      console.error('Not .vd/.vb file');
      return;
    }

    const text = await file.text();

    const json = JSON.parse(text);

    console.log('json', json);

    const { model, project } = parseVbFile(json);

    console.log('voxaModel', model);
    console.log('voxaProject', project);

    setModelText(JSON.stringify(model));
    setProjectText(JSON.stringify(project));
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>VB Parser Example</title>
      </Head>

      <div
        className={styles.dropArea}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={onDrop}
      >
        Drop .vd/.vb here
      </div>
      <div>
        <textarea
          value={modelText}
          onChange={(e) => {
            setModelText(e.target.value);
          }}
        />
        <button
          onClick={() => {
            navigator.clipboard.writeText(modelText);
          }}
        >
          Copy model text
        </button>
      </div>
      <div>
        <textarea
          value={projectText}
          onChange={(e) => {
            setProjectText(e.target.value);
          }}
        />
        <button
          onClick={() => {
            navigator.clipboard.writeText(projectText);
          }}
        >
          Copy project text
        </button>
      </div>
    </div>
  );
};

export default Home;
