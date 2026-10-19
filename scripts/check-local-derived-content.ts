import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { FileSystemContentServer } from '@box/content-server/file-system-store-node';
import { BuildSystem } from '@box/build-system/build-system';
import { LocalDerivedContentServer } from '../src/content/local-derived-content';
import { LocalBuildCache } from '../src/utils/local-build-cache';

async function main() {
  const launcherSource = fs.readFileSync(
    path.resolve(__dirname, '../../../apps/local-engine/src/launcher.js'),
    'utf8',
  );
  assert.match(
    launcherSource,
    /STORAGE_PATH: world\.dataRoot/,
    'play-library runtimes must read the installed world in place',
  );
  assert.match(
    launcherSource,
    /BOX_DERIVED_STORAGE_PATH: derivedRuntimePath/,
    'play-library runtimes must receive a persistent derived cache',
  );
  assert.doesNotMatch(
    launcherSource,
    /fs\.cpSync\(world\.dataRoot/,
    'a cold play runtime must not copy the complete installed world',
  );
  assert.match(
    launcherSource,
    /BOX_CREATOR_EDIT_PREWARM_RUNTIMES/,
    'creator edit runtime prewarm must be configurable',
  );
  assert.doesNotMatch(
    launcherSource,
    /BOX_CREATOR_PLAY_PREWARM_RUNTIMES/,
    'creator preview runtime prewarm must stay removed',
  );
  assert.match(
    launcherSource,
    /BOX_PLAY_PREWARM_RUNTIMES/,
    'play runtime prewarm must be configurable',
  );
  assert.match(
    launcherSource,
    /for \(const world of worlds\.slice\(0, count\)\) \{\s*await playLibrary\.ensureRuntime\(world\.id\)/,
    'play must only prewarm the configured number of installed maps',
  );
  assert.doesNotMatch(
    launcherSource,
    /prewarmCount\([\s\S]{0,120}PREWARM_RUNTIMES[\s\S]{0,80}\n\s*1,\n/,
    'runtime prewarm must keep a multi-map default',
  );

  const composeSource = fs.readFileSync(
    path.resolve(__dirname, '../../../docker-compose.yml'),
    'utf8',
  );
  assert.match(
    composeSource,
    /BOX_CREATOR_EDIT_PREWARM_RUNTIMES: \$\{BOX_CREATOR_EDIT_PREWARM_RUNTIMES:-0\}/,
    'creator must use the lightweight edit prewarm default',
  );
  assert.doesNotMatch(
    composeSource,
    /BOX_CREATOR_PLAY_PREWARM_RUNTIMES/,
    'creator preview prewarm configuration must stay removed',
  );
  assert.match(
    composeSource,
    /BOX_PLAY_PREWARM_RUNTIMES: \$\{BOX_PLAY_PREWARM_RUNTIMES:-0\}/,
    'play must use the lightweight runtime prewarm default',
  );

  const envExampleSource = fs.readFileSync(
    path.resolve(__dirname, '../../../.env.docker.example'),
    'utf8',
  );
  assert.match(
    envExampleSource,
    /^BOX_CREATOR_EDIT_PREWARM_RUNTIMES=0$/m,
    'the example env must not override creator edit prewarm with an old default',
  );
  assert.doesNotMatch(
    envExampleSource,
    /^BOX_CREATOR_PLAY_PREWARM_RUNTIMES=/m,
    'the example env must not expose retired creator preview prewarm settings',
  );
  assert.match(
    envExampleSource,
    /^BOX_PLAY_PREWARM_RUNTIMES=0$/m,
    'the example env must not override play prewarm with an old default',
  );

  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'box-derived-content-'));
  const sourceRoot = path.join(root, 'world', 'blobs');
  const derivedRoot = path.join(root, 'cache', 'blobs');
  try {
    const source = new FileSystemContentServer(sourceRoot);
    await source.init();
    const sourceHash = await source.store(Buffer.from('published-world'));

    const first = new LocalDerivedContentServer({
      source: new FileSystemContentServer(sourceRoot),
      derived: new FileSystemContentServer(derivedRoot),
    });
    await first.init();
    assert.equal(
      Buffer.from((await first.retrieve(sourceHash))!).toString(),
      'published-world',
      'published blobs must remain readable through the derived layer',
    );

    const derivedHash = await first.store(Buffer.from('prebake-result'));
    assert.equal(
      fs.existsSync(path.join(sourceRoot, derivedHash)),
      false,
      'runtime-derived blobs must not mutate the published world',
    );
    assert.equal(
      fs.existsSync(path.join(derivedRoot, derivedHash)),
      true,
      'runtime-derived blobs must persist in the writable cache',
    );

    const restarted = new LocalDerivedContentServer({
      source: new FileSystemContentServer(sourceRoot),
      derived: new FileSystemContentServer(derivedRoot),
    });
    await restarted.init();
    assert.equal(
      Buffer.from((await restarted.retrieve(derivedHash))!).toString(),
      'prebake-result',
      'a restarted runtime must reuse the previous prebake blob',
    );

    let builds = 0;
    const cachePath = path.join(root, 'cache', 'build-cache.json');
    const firstCache = new LocalBuildCache(cachePath);
    assert.equal(
      await firstCache.store('prebakeMap', ['same-release'], async () => {
        builds += 1;
        return derivedHash;
      }),
      derivedHash,
    );
    const restartedCache = new LocalBuildCache(cachePath);
    assert.equal(
      await restartedCache.store('prebakeMap', ['same-release'], async () => {
        builds += 1;
        return 'unexpected-rebuild';
      }),
      derivedHash,
    );
    assert.equal(builds, 1, 'a restarted runtime must not repeat the same prebake');

    const sourceCachePath = path.join(root, 'world', 'build-cache.json');
    const sourceCache = new LocalBuildCache(sourceCachePath);
    await sourceCache.store('prebakeMap', ['editor-result'], async () => sourceHash);
    const playCache = new LocalBuildCache(
      path.join(root, 'cache', 'play-build-cache.json'),
      sourceCachePath,
    );
    assert.equal(
      await playCache.retrieve('prebakeMap', ['editor-result']),
      sourceHash,
      'creator play preview must reuse the editor prebake cache',
    );

    // A play-preview runtime and an edit runtime can share cache keys while
    // writing derived blobs to different stores. A cached task result that is
    // absent from the current content store must be rebuilt instead of being
    // returned forever and leaving the UI stuck at "starting runtime".
    const staleCache = new LocalBuildCache(path.join(root, 'stale', 'build-cache.json'));
    await staleCache.store('runtimeScopedTask', ['same-project'], async () =>
      'QmStaleResultOwnedByAnotherRuntime',
    );
    const currentContent = new FileSystemContentServer(
      path.join(root, 'current-runtime', 'blobs'),
    );
    await currentContent.init();
    const logger = {
      child() { return this; },
      info() {},
      warn() {},
      error() {},
    } as any;
    const buildSystem = new BuildSystem(
      staleCache,
      currentContent,
      currentContent,
      async () => [],
      logger,
    );
    let staleRebuilds = 0;
    await buildSystem.addTasks({
      runtimeScopedTask: async (bs: BuildSystem) => {
        staleRebuilds += 1;
        return bs.storeContent(Buffer.from('rebuilt-for-current-runtime'));
      },
    });
    const recoveredHash = await (buildSystem as any).build(
      'runtimeScopedTask',
      'same-project',
    );
    assert.equal(
      Buffer.from((await currentContent.retrieve(recoveredHash))!).toString(),
      'rebuilt-for-current-runtime',
      'an inaccessible cached build result must be rebuilt in the current store',
    );
    assert.equal(staleRebuilds, 1, 'the stale cache entry must not suppress rebuilding');
    process.stdout.write('Local derived content checks passed.\n');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
