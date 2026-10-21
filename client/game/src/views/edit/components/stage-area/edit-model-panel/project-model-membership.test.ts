import { describe, expect, it } from '@jest/globals';
import { ModelType } from '@box/apis';

import {
  getProjectModelDisplayName,
  modelTypeForNewModel,
  projectModelsForPanel,
  shouldUseProjectModelAdapter,
} from './project-model-membership';

describe('project model membership', () => {
  it('hides the local storage id from the user-facing model name', () => {
    expect(getProjectModelDisplayName('村上春树出现__local_17')).toBe(
      '村上春树出现',
    );
    expect(getProjectModelDisplayName('ordinary-model')).toBe('ordinary-model');
  });

  it('keeps project ownership independent from a legacy local storage path', () => {
    expect(shouldUseProjectModelAdapter({ libraryScope: 'project' })).toBe(true);
    expect(shouldUseProjectModelAdapter({ libraryScope: 'local' })).toBe(false);
  });

  it('creates a model from the Local tab in the local VOXA library', () => {
    expect(modelTypeForNewModel('local')).toBe(ModelType.Private);
    expect(modelTypeForNewModel('project')).toBe(ModelType.Project);
  });
  it('lists every project model whether or not a map has placed it', () => {
    expect(
      projectModelsForPanel(
        [
          { id: 1, meshPath: 'mesh/已放置.vb' },
          { id: 2, meshPath: 'mesh/未放置.vb' },
        ],
      ),
    ).toEqual([
      { id: 1, meshPath: 'mesh/已放置.vb' },
      { id: 2, meshPath: 'mesh/未放置.vb' },
    ]);
  });

  it('never exposes a local-library mesh alias in Project', () => {
    expect(
      projectModelsForPanel(
        [
          { id: 1, meshPath: 'mesh/New-model.vb' },
          { id: 22, meshPath: 'mesh/New-model__local_22.vb' },
        ],
      ),
    ).toEqual([{ id: 1, meshPath: 'mesh/New-model.vb' }]);
  });

  it('does not treat a missing project asset path as a project model', () => {
    expect(projectModelsForPanel([{ id: 1 }])).toEqual([]);
  });

  it('keeps separately named project files even when their content hashes match', () => {
    const hash = 'QmEditedModel';
    const result = projectModelsForPanel([
      { id: 1, modelFileHash: hash, meshPath: 'mesh/模型.vb' },
      { id: 2, modelFileHash: hash, meshPath: 'mesh/模型副本.vb' },
    ]);
    expect(result).toHaveLength(2);
  });
});
