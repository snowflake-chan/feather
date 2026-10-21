import { ModelType } from '@box/apis';

const LOCAL_LIBRARY_MESH_PATH = /__local_\d+\.vb$/;

export function modelTypeForNewModel(scope: 'local' | 'project') {
  return scope === 'local' ? ModelType.Private : ModelType.Project;
}

/**
 * Project contains every model asset recorded by extraProjectInfo. Local VOXA
 * preview aliases are runtime-only resources and must never appear as project
 * assets. Scene placement is deliberately not part of project membership.
 */
export function projectModelsForPanel<T>(models: T[]) {
  return models.filter((model) => {
    const meshPath = (model as { meshPath?: unknown }).meshPath;
    return (
      typeof meshPath === 'string' &&
      meshPath.startsWith('mesh/') &&
      !LOCAL_LIBRARY_MESH_PATH.test(meshPath)
    );
  });
}

/**
 * Local VOXA ids are part of the resource key, not part of the user-facing
 * model name. Boxes displays the asset name while keeping its unique id in
 * backend metadata; the local adapter follows the same boundary.
 */
export function getProjectModelDisplayName(name: string) {
  return name.replace(/__local_\d+$/, '');
}

/** Storage paths do not define ownership: legacy project entries can still
 * carry a __local id. The panel scope is the authoritative ownership seam. */
export function shouldUseProjectModelAdapter(model: {
  libraryScope?: 'local' | 'project';
}) {
  return model.libraryScope === 'project';
}
