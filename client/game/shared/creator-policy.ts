/** Creator authorization is owned by Player Service, never by CLI clients. */
export const CREATOR_CAPABILITIES = [
  'projects.view', 'projects.create', 'projects.edit', 'projects.delete',
  'projects.import', 'projects.export', 'models.manage',
] as const;
export type CreatorCapability = typeof CREATOR_CAPABILITIES[number];

export const CREATOR_CAPABILITY_META: Readonly<Record<CreatorCapability, Readonly<{ label: string; description: string }>>> = Object.freeze({
  'projects.view': { label: '查看地图', description: '进入创作端并查看地图列表' },
  'projects.create': { label: '新建地图', description: '创建主地图和副地图' },
  'projects.edit': { label: '编辑地图', description: '修改地图资料、内容和运行配置' },
  'projects.delete': { label: '删除地图', description: '删除地图或地图组，不可恢复' },
  'projects.import': { label: '导入工程', description: '导入创作工程和副地图' },
  'projects.export': { label: '导出工程', description: '导出创作工程或游玩包' },
  'models.manage': { label: '管理模型', description: '导入、修改和导出 VOXA 模型工程' },
});
export const FULL_CREATOR_CAPABILITIES = [...CREATOR_CAPABILITIES] as CreatorCapability[];

export function normalizeCreatorCapabilities(value: unknown): CreatorCapability[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set<string>(CREATOR_CAPABILITIES);
  return [...new Set(value.map(String).filter((permission) => allowed.has(permission)))] as CreatorCapability[];
}

export function hasCreatorCapability(permissions: readonly string[], capability: CreatorCapability) {
  return capability === 'projects.view' || normalizeCreatorCapabilities(permissions).includes(capability);
}
