import type { ImportDiagnostic } from '../../server/import-diagnostics';

export type ProjectStatus = '草稿' | '已发布';
export type MapSizePreset = 'small' | 'medium' | 'large' | 'huge';
export type MapSizeChoice = MapSizePreset | 'custom';
export type WorkCenterView = 'maps' | 'models';
export type ImportMode = 'independent' | 'submap';
export type ProjectExportScope = 'map' | 'group';

export type CompatibilityReport = {
  level: 'compatible' | 'warning' | 'error';
  summary: { warnings: number; errors: number; missingBlobCount: number };
  errors?: Array<{ code?: string; message: string }>;
  warnings?: Array<{ code?: string; message: string }>;
};

export type LocalProject = {
  id: string;
  permanentMapId: string;
  publicId: string;
  name: string;
  author: string;
  description: string;
  cover?: string;
  loadingCover?: string;
  updatedAt: string;
  status: ProjectStatus;
  latestRelease?: string;
  latestReleaseNotes?: string;
  theme: 'sunset' | 'ocean' | 'forest' | 'violet';
  isEngineWorld?: boolean;
  compatibility?: CompatibilityReport;
  mapGroupId: string;
  mapRole: 'main' | 'submap';
  mainProjectId: string;
};

export type ExportProgress = {
  projectId: string;
  projectName: string;
  phase: 'packing' | 'downloading' | 'done' | 'error';
  percent: number;
  received: number;
  total: number;
  elapsedSeconds: number;
  filename?: string;
  message?: string;
};

export type ImportProgress = {
  filename: string;
  phase: 'uploading' | 'processing' | 'done' | 'error';
  percent: number;
  sent: number;
  total: number;
  elapsedSeconds: number;
  projectName?: string;
  message?: string;
  details?: ImportDiagnostic[];
};

export type PublishProgress = {
  projectName: string;
  version: string;
  phase: 'saving' | 'publishing' | 'packing' | 'downloading' | 'done' | 'error';
  percent: number;
  received: number;
  total: number;
  elapsedSeconds: number;
  filename?: string;
  message?: string;
};

export type ProjectSnapshot = {
  name: string;
  reason: string;
  signature: string;
  createdAt: string;
  size: number;
};

export type AssetDistributionConfiguration = {
  endpoint: string;
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  cdnBaseUrl: string;
  hasSecretAccessKey: boolean;
};

export type ProjectsPageProps = {
  voxaUrl: string;
  initialView: WorkCenterView;
  uiPreview: boolean;
  creator: {
    displayName: string;
    username: string;
    userId: string;
    boxId: string;
    avatarSkinId: string;
    creatorPermissions: string[];
  };
};
