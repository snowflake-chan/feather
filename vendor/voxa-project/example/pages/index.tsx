import type { NextPage } from 'next';
import {
  migrateModel,
  migrateProject,
  modelSchemaToBytes,
  projectSchemaToBytes,
} from '@box/voxa-project';
import { parseVbFile } from '@box/vb-parser';
import Head from 'next/head';
import { DragEventHandler, useCallback } from 'react';
import styles from '../styles/index.module.css';

const Home: NextPage = () => {
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

    const projectBytes = new Uint8Array(Buffer.from(JSON.stringify(project)));
    const modelBytes = new Uint8Array(Buffer.from(JSON.stringify(model)));

    const projectFile = new Blob([projectBytes]);
    const meshFile = new Blob([modelBytes]);

    const a = document.createElement('a');

    a.href = window.URL.createObjectURL(projectFile);
    a.download = 'projectJSON.voxa';
    a.click();

    a.href = window.URL.createObjectURL(meshFile);
    a.download = 'modelJSON.voxa';
    a.click();

    const projectV5Schema = migrateProject(projectBytes);
    const modelV5Schema = await migrateModel(modelBytes);
    console.log('projectV5Schema', projectV5Schema);
    console.log('modelV5Schema', modelV5Schema);
    if (!projectV5Schema || !modelV5Schema) {
      return;
    }
    const projectV5File = new Blob([projectSchemaToBytes(projectV5Schema)]);
    const modelV5File = new Blob([modelSchemaToBytes(modelV5Schema)]);

    a.href = window.URL.createObjectURL(projectV5File);
    a.download = 'projectV5Bytes.voxa';
    a.click();

    a.href = window.URL.createObjectURL(modelV5File);
    a.download = 'modelV5Bytes.voxa';
    a.click();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Voxa Project Example</title>
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
    </div>
  );
};

export default Home;
