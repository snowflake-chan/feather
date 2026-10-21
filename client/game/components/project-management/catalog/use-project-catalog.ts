import { useCallback, useEffect, useMemo, useState } from 'react';

import { apiClient } from '../../../src/apis/client';
import { previewProjects } from '../project-fixtures';
import type { LocalProject, ProjectStatus } from '../project-types';

type Options = {
  uiPreview: boolean;
  setNotice: (notice: string) => void;
};

export function useProjectCatalog({ uiPreview, setNotice }: Options) {
  const [projects, setProjects] = useState<LocalProject[]>(() =>
    uiPreview ? previewProjects : [],
  );
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'全部' | ProjectStatus>('全部');

  const refresh = useCallback(async () => {
    if (uiPreview) {
      setProjects(previewProjects);
      return;
    }
    const data = (await apiClient.getApiLocalProjects()) as { projects: LocalProject[] };
    setProjects(data.projects);
  }, [uiPreview]);

  useEffect(() => {
    refresh().catch((error) => setNotice(error.message));
  }, [refresh, setNotice]);

  const visibleProjects = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = projects.filter(
      (project) =>
        (status === '全部' || project.status === status) &&
        (!normalized ||
          project.name.toLowerCase().includes(normalized) ||
          project.description.toLowerCase().includes(normalized)),
    );
    const order = new Map(projects.map((project, index) => [project.id, index]));
    return filtered.sort((left, right) => {
      const leftGroup = left.mainProjectId || left.id;
      const rightGroup = right.mainProjectId || right.id;
      if (leftGroup !== rightGroup) {
        return (
          (order.get(leftGroup) ?? order.get(left.id) ?? 0) -
          (order.get(rightGroup) ?? order.get(right.id) ?? 0)
        );
      }
      if (left.mapRole !== right.mapRole) return left.mapRole === 'main' ? -1 : 1;
      return (order.get(left.id) ?? 0) - (order.get(right.id) ?? 0);
    });
  }, [projects, query, status]);

  const singleMapProjects = useMemo(
    () =>
      visibleProjects.filter(
        (project) =>
          project.mapRole === 'main' &&
          !projects.some(
            (candidate) => candidate.mapRole === 'submap' && candidate.mainProjectId === project.id,
          ),
      ),
    [projects, visibleProjects],
  );
  const multiMapGroups = useMemo(
    () =>
      projects
        .filter(
          (project) =>
            project.mapRole === 'main' &&
            projects.some(
              (candidate) =>
                candidate.mapRole === 'submap' && candidate.mainProjectId === project.id,
            ),
        )
        .map((main) => ({
          main,
          projects: visibleProjects.filter((project) => project.mainProjectId === main.id),
          submapCount: projects.filter(
            (project) => project.mapRole === 'submap' && project.mainProjectId === main.id,
          ).length,
        }))
        .filter((group) => group.projects.length > 0),
    [projects, visibleProjects],
  );
  const mainProjects = useMemo(
    () => projects.filter((project) => project.mapRole === 'main'),
    [projects],
  );

  const clearFilters = () => {
    setQuery('');
    setStatus('全部');
  };

  return {
    projects,
    query,
    status,
    visibleProjects,
    singleMapProjects,
    multiMapGroups,
    mainProjects,
    isFiltering: Boolean(query.trim()) || status !== '全部',
    refresh,
    setQuery,
    setStatus,
    clearFilters,
  };
}

export type ProjectCatalogController = ReturnType<typeof useProjectCatalog>;
