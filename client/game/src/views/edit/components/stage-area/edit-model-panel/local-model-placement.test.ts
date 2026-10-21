import { describe, expect, it, jest } from '@jest/globals';
import {
  EntitySeedRDA,
  ProjectRDA,
} from '@box/schema/project/project-rda';
import {
  ROOT_ID,
  TreeNodeType,
} from '@box/schema/project/murda-tree';

import {
  createProjectModelSeedReplacement,
  LocalProjectModelImportCache,
  placeLocalModelImmediately,
  type PlacementMeshInfo,
} from './local-model-placement';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe('local model placement', () => {
  it('replaces the constant mesh id through one same-id tree action', () => {
    const project = ProjectRDA.stateSchema.clone(
      ProjectRDA.stateSchema.identity,
    );
    const seed = EntitySeedRDA.stateSchema.clone(
      EntitySeedRDA.stateSchema.identity,
    );
    seed.name = 'model';
    seed.mesh = 'mesh/model__local_12.vb';
    seed.meshId = 12;
    const node = {
      id: 'seed-1',
      type: TreeNodeType.leaf,
      name: 'model',
      parentId: ROOT_ID,
      childrenIds: [],
      value: seed,
    };
    project.entitiesTree[ROOT_ID].childrenIds.push(node.id);
    project.entitiesTree[node.id] = node;
    const store = ProjectRDA.createStore(project);
    const replacement = createProjectModelSeedReplacement(node, {
      modelId: 99,
      formatName: 'mesh/project-model.vb',
      defaultMotionId: 'idle',
    });
    expect(replacement).toBeDefined();

    const action = ProjectRDA.action(store).entitiesTree.add(replacement!);
    store.apply(ProjectRDA, action);
    const next = ProjectRDA.stateSchema.clone(ProjectRDA.stateSchema.identity);
    store.state(ProjectRDA, next);

    expect(next.entitiesTree['seed-1'].value).toMatchObject({
      meshId: 99,
      mesh: 'mesh/project-model.vb',
      defaultMotionId: 'idle',
    });
    expect(next.entitiesTree[ROOT_ID].childrenIds).toEqual(['seed-1']);
    expect(Object.keys(next.entitiesTree)).toHaveLength(2);

    ProjectRDA.actionSchema.free(action);
    ProjectRDA.stateSchema.free(next);
    store.free(ProjectRDA);
    ProjectRDA.stateSchema.free(project);
  });

  it('places the current-map entity before project-library synchronization finishes', async () => {
    const imported = deferred<PlacementMeshInfo>();
    const calls: string[] = [];
    const placement = placeLocalModelImmediately({
      seedId: 'seed-1',
      addSeed: () => calls.push('add'),
      resolveProjectMesh: () => imported.promise,
      updateSeed: () => calls.push('update'),
      removeSeed: () => calls.push('remove'),
    });

    expect(calls).toEqual(['add']);
    imported.resolve({
      modelId: 7,
      formatName: 'mesh/project-model.vb',
      defaultMotionId: '',
    });
    await placement;
    expect(calls).toEqual(['add', 'update']);
  });

  it('coalesces concurrent project copies without collapsing deliberate placements', async () => {
    const imported = deferred<PlacementMeshInfo>();
    const importer = jest.fn(() => imported.promise);
    const cache = new LocalProjectModelImportCache();
    const added: string[] = [];
    const updated: string[] = [];
    const place = (seedId: string) =>
      placeLocalModelImmediately({
        seedId,
        addSeed: () => added.push(seedId),
        resolveProjectMesh: () =>
          cache.resolve('12:QmSameModel', importer),
        updateSeed: (id) => updated.push(id),
        removeSeed: () => undefined,
      });

    const first = place('seed-1');
    const second = place('seed-2');
    expect(added).toEqual(['seed-1', 'seed-2']);
    expect(importer).toHaveBeenCalledTimes(1);

    imported.resolve({
      modelId: 99,
      formatName: 'mesh/project-model.vb',
      defaultMotionId: '',
    });
    await Promise.all([first, second]);
    expect(updated).toEqual(['seed-1', 'seed-2']);

    await cache.resolve('12:QmSameModel', importer);
    expect(importer).toHaveBeenCalledTimes(2);
  });
});
