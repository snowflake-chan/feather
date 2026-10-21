import { useState } from 'react';

import { apiClient } from '../../../src/apis/client';
import type { LocalProject, ProjectSnapshot } from '../project-types';

type Options = {
  refreshProjects: () => Promise<void>;
  setNotice: (notice: string) => void;
  closeProjectMenu: () => void;
};

export function useProjectRecovery(options: Options) {
  const [project, setProject] = useState<LocalProject | null>(null);
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const open = async (target: LocalProject) => {
    options.closeProjectMenu();
    setProject(target);
    setSnapshots([]);
    setSelectedSnapshot('');
    setError('');
    setLoading(true);
    try {
      const data = (await apiClient.getApiLocalProjectsIdSnapshots({
        params: { path: { id: target.id } },
      })) as { snapshots?: ProjectSnapshot[] };
      const next = Array.isArray(data.snapshots) ? data.snapshots : [];
      setSnapshots(next);
      setSelectedSnapshot(next[0]?.name || '');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '读取恢复记录失败');
    } finally {
      setLoading(false);
    }
  };

  const restore = async () => {
    if (!project || !selectedSnapshot || loading) return;
    setLoading(true);
    setError('');
    try {
      await apiClient.postApiLocalProjectsIdSnapshots({
        params: { path: { id: project.id } },
        body: { snapshot: selectedSnapshot },
      });
      options.setNotice(`已恢复 ${project.name} 的历史版本；重新打开编辑器后生效`);
      setProject(null);
      await options.refreshProjects();
    } catch (restoreError) {
      setError(restoreError instanceof Error ? restoreError.message : '恢复历史版本失败');
    } finally {
      setLoading(false);
    }
  };

  return { project, snapshots, selectedSnapshot, loading, error, open, restore, close: () => setProject(null), select: setSelectedSnapshot };
}
