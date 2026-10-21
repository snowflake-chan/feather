import type { LocalProject } from './project-types';
import { apiClient } from '../../src/apis/client';

/**
 * Open the editor immediately while runtime allocation starts in parallel.
 * The runtime endpoint deduplicates repeated requests, so the editor owns the
 * visible connecting state instead of showing an extra launcher page.
 */
export function openProjectEditor(project: LocalProject) {
  void apiClient
    .postApiLocalProjectsIdRuntime({
      params: { path: { id: project.id } },
      body: { mode: 'edit' },
    })
    .catch(() => undefined);
  window.open(`/e/${encodeURIComponent(project.id)}`, '_blank', 'noopener');
}
