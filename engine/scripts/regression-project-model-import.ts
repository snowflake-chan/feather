import assert from 'assert';

import {
  AsyncSingleFlight,
  findReusableProjectModel,
  projectModelNameFromPath,
} from '../src/project/project-model-import';

async function main() {
  const meshAssets = {
    'mesh/local__local_7.vb': {
      modelId: 7,
      hash: 'QmSame',
      modelPreviewHash: '',
      animated: false,
    },
    'mesh/project-copy.vb': {
      modelId: 99,
      hash: 'QmSame',
      modelPreviewHash: 'QmPreview',
      animated: true,
    },
  };
  const reusable = findReusableProjectModel(meshAssets, 'QmSame');
  assert.ok(reusable);
  assert.equal(reusable[0], 'mesh/project-copy.vb');
  assert.equal(projectModelNameFromPath(reusable[0]), 'project-copy');

  let executions = 0;
  let finish!: (value: number) => void;
  const deferred = new Promise<number>((resolve) => {
    finish = resolve;
  });
  const singleFlight = new AsyncSingleFlight<number, number>();
  const operation = () => {
    executions += 1;
    return deferred;
  };
  const first = singleFlight.run(7, operation);
  const second = singleFlight.run(7, operation);
  assert.strictEqual(first, second);
  assert.equal(executions, 1);
  finish(99);
  assert.deepEqual(await Promise.all([first, second]), [99, 99]);

  console.log('project model import deduplication regression passed');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
