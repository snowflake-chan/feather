import assert from 'assert';

const {
  CodeEditorServerController,
} = require('../src/edit/code-editor/code-editor-server-controller');

function createController(files: Record<string, Record<string, unknown>>) {
  const controller = Object.create(CodeEditorServerController.prototype);
  controller._state = {
    replica: { extraProjectInfo: { scriptAssets: {} } },
    logger: { log: () => undefined },
  };
  controller._editorState = { fileDict: files };
  controller.fileDictReplica = {
    action: () => ({
      remove: (fileId: string) => ({ type: 'remove', fileId }),
      set: (fileId: string, file: Record<string, unknown>) => ({
        type: 'set',
        fileId,
        file,
      }),
      update: (fileId: string) => {
        const update = (key: string) => (value: unknown) => ({
          type: 'update' as const, fileId, key, value,
        });
        return {
          name: update('name'), order: update('order'), isShare: update('isShare'),
          lockedMapTitle: update('lockedMapTitle'), lockedMapId: update('lockedMapId'),
        };
      },
    }),
    dispatch: (action: {
      type: 'remove' | 'set' | 'update';
      fileId: string;
      file?: Record<string, unknown>;
      key?: string;
      value?: unknown;
    }) => {
      if (action.type === 'remove') delete files[action.fileId];
      if (action.type === 'set' && action.file) files[action.fileId] = action.file;
      if (action.type === 'update' && action.key && files[action.fileId]) {
        files[action.fileId][action.key] = action.value;
      }
    },
  };
  controller._updateFileTextAndSize = (fileId: string, hash: string) => {
    files[fileId].text = `content:${hash}`;
  };
  return controller;
}

async function main() {
  const files: Record<string, Record<string, unknown>> = {
    migrated: {
      fileId: 'migrated',
      name: 'game.js',
      text: 'module.exports = {}',
      order: 1,
      isClient: false,
      isShare: false,
      lockedMapTitle: '',
      lockedMapId: 0,
      isUploading: false,
      size: 19,
    },
    shared: {
      fileId: 'shared',
      name: 'obsolete-shared.js',
      text: '',
      order: 2,
      isClient: false,
      isShare: true,
      lockedMapTitle: '',
      lockedMapId: 0,
      isUploading: false,
      size: 0,
    },
  };
  const controller = createController(files);

  await controller.resyncFiles({}, {});

  assert.ok(
    files.migrated,
    'a local migrated script must remain in the editor file tree when the shared-resource snapshot refreshes',
  );
  assert.equal(
    files.shared,
    undefined,
    'a removed shared script must still be removed during the same refresh',
  );

  files.shared = {
    fileId: 'shared', name: 'old-name.js', text: 'before', order: 2,
    isClient: false, isShare: true, lockedMapTitle: '', lockedMapId: 0,
    isUploading: false, size: 0,
  };
  await controller.resyncFiles({
    shared: {
      id: 'shared', name: 'renamed.js', hash: 'new-content', order: 3,
      isClient: false, isShare: true, lockedMapTitle: 'other-map', lockedMapId: 42,
    },
  }, {
    shared: {
      id: 'shared', name: 'old-name.js', hash: 'old-content', order: 2,
      isClient: false, isShare: true, lockedMapTitle: '', lockedMapId: 0,
    },
  });
  assert.equal(files.shared.name, 'renamed.js', 'shared renames must reach every open map');
  assert.equal(files.shared.text, 'content:new-content', 'shared content saves must reach every open map');
  assert.equal(files.shared.lockedMapId, 42, 'the other map lock must make this editor read-only');
  console.log('migrated script editor regression passed');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
