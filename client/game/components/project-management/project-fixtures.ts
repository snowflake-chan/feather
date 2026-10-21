import type { LocalProject, MapSizePreset } from './project-types';

export const previewProjects: LocalProject[] = [
  { id: 'preview-creator-arena', permanentMapId: '10000000000000000001', publicId: 'preview-creator-arena', name: '竞技场：破晓行动', author: '测试创作者', description: '一张用于检查地图卡片、菜单与发布状态的示例地图。', cover: '/map-templates/arena-template.png', updatedAt: '2026-08-27T05:30:00.000Z', status: '已发布', latestRelease: 'v1.2.0', theme: 'sunset', mapGroupId: 'preview-creator-arena', mapRole: 'main', mainProjectId: 'preview-creator-arena' },
  { id: 'preview-creator-race', permanentMapId: '10000000000000000002', publicId: 'preview-creator-race', name: '极速赛道', author: '测试创作者', description: '用于检查草稿状态、搜索与地图操作入口。', cover: '/map-templates/raceway-template.png', updatedAt: '2026-08-26T03:15:00.000Z', status: '草稿', theme: 'ocean', mapGroupId: 'preview-creator-race', mapRole: 'main', mainProjectId: 'preview-creator-race' },
  { id: 'preview-creator-arena-lobby', permanentMapId: '10000000000000000003', publicId: 'preview-creator-arena-lobby', name: '准备大厅', author: '测试创作者', description: '进入对局前的匹配与队伍准备区域。', cover: '/map-templates/blank-template.png', updatedAt: '2026-08-27T05:20:00.000Z', status: '已发布', latestRelease: 'v1.2.0', theme: 'violet', mapGroupId: 'preview-creator-arena', mapRole: 'submap', mainProjectId: 'preview-creator-arena' },
  { id: 'preview-creator-arena-training', permanentMapId: '10000000000000000004', publicId: 'preview-creator-arena-training', name: '训练场', author: '测试创作者', description: '用于测试武器、移动和战斗规则。', cover: '/map-templates/arena-template.png', updatedAt: '2026-08-27T05:10:00.000Z', status: '草稿', theme: 'forest', mapGroupId: 'preview-creator-arena', mapRole: 'submap', mainProjectId: 'preview-creator-arena' },
  { id: 'preview-creator-arena-results', permanentMapId: '10000000000000000005', publicId: 'preview-creator-arena-results', name: '结算大厅', author: '测试创作者', description: '展示对局结果与玩家奖励。', cover: '/map-templates/raceway-template.png', updatedAt: '2026-08-27T05:00:00.000Z', status: '草稿', theme: 'ocean', mapGroupId: 'preview-creator-arena', mapRole: 'submap', mainProjectId: 'preview-creator-arena' },
];

export const snapshotReasonLabels: Record<string, string> = {
  automatic: '自动保存', launch: '打开工程', export: '导出工程', publish: '发布作品', manual: '手动快照', 'before-restore': '恢复前备份',
};

export const mapSizeOptions: Array<{ id: MapSizePreset; label: string; dimensions: string }> = [
  { id: 'small', label: '小', dimensions: '32×32×32' },
  { id: 'medium', label: '中', dimensions: '64×128×64' },
  { id: 'large', label: '大', dimensions: '128×128×128' },
  { id: 'huge', label: '超大', dimensions: '256×64×256' },
];

export const defaultMapCover = () => '/map-templates/blank-template.png';

export function readProjectImage(file: File, label: string, expectedRatio: number): Promise<string> {
  if (file.size > 3 * 1024 * 1024) return Promise.reject(new Error(`${label}不能超过 3MB`));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`${label}读取失败`));
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const image = new Image();
      image.onerror = () => reject(new Error(`${label}不是有效图片`));
      image.onload = () => {
        const actualRatio = image.naturalWidth / image.naturalHeight;
        if (!Number.isFinite(actualRatio) || Math.abs(actualRatio / expectedRatio - 1) > 0.02) {
          reject(new Error(`${label}比例必须为 ${expectedRatio === 1 ? '1:1' : '16:9'}`));
        } else resolve(dataUrl);
      };
      image.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
