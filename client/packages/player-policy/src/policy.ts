export const PLAYER_ADMIN_CAPABILITIES = [
    'players.view',
    'sessions.view',
    'account-bans.view',
    'players.manage',
    'players.ban',
    'sessions.manage',
    'identity-bans.view',
    'identity-bans.manage',
    'players.create',
    'players.export',
    'players.delete',
    'passwords.reset',
    'creator-access.view',
    'creator-access.manage',
    'creator-tokens.view',
    'creator-tokens.manage',
    'play-maps.view',
    'play-maps.manage',
    'containers.view',
    'containers.manage',
    'audit.view',
] as const;

export type PlayerAdminCapability = (typeof PLAYER_ADMIN_CAPABILITIES)[number];
export type PlayerAdminRequirement = PlayerAdminCapability | 'owner';
export type PlayerAdminRole = 'owner' | 'admin' | 'moderator';

export const PLAYER_ADMIN_GRANTABLE_CAPABILITIES = PLAYER_ADMIN_CAPABILITIES;

export const PLAYER_ADMIN_CAPABILITY_META:Record<
    PlayerAdminCapability,
    {
        label:string;
        description:string;
    }
> = {
    'players.view': { label: '查看玩家账号', description: '查看玩家目录、资料和概览' },
    'sessions.view': { label: '查看在线会话', description: '查看当前在线玩家及其会话信息' },
    'account-bans.view': { label: '查看账号封禁', description: '查看当前已封禁的玩家账号' },
    'players.manage': { label: '维护玩家资料', description: '修改昵称、标签、备注与神岛 ID' },
    'players.ban': { label: '管理账号封禁', description: '临时或永久封禁普通玩家账号并解除处罚' },
    'sessions.manage': { label: '管理在线会话', description: '撤销登录会话并让普通玩家立即下线' },
    'identity-bans.view': {
        label: '查看 IP 与设备封禁',
        description: '查看当前有效的 IP 和设备封禁记录',
    },
    'identity-bans.manage': { label: 'IP 与设备封禁', description: '封禁或解除登录 IP 和设备标识' },
    'players.create': {
        label: '新增普通玩家',
        description: '创建普通玩家账号，不能创建管理员或服主',
    },
    'players.export': { label: '导出玩家数据', description: '导出玩家目录 CSV' },
    'players.delete': { label: '删除玩家身份', description: '永久删除普通玩家身份及其登录会话' },
    'passwords.reset': { label: '重置玩家密码', description: '为普通玩家设置临时密码并撤销旧会话' },
    'creator-access.view': { label: '查看创作权限', description: '查看玩家是否拥有创作端访问权限' },
    'creator-access.manage': {
        label: '管理创作权限',
        description: '授予或调整玩家进入创作端的权限，不包含后台管理权限',
    },
    'creator-tokens.view': {
        label: '查看 Creator CLI Token',
        description: '查看已签发的 Creator CLI Token 信息',
    },
    'creator-tokens.manage': {
        label: '管理 Creator CLI Token',
        description: '为已获创作权限的玩家签发或撤销 CLI Token，不会提升其创作权限',
    },
    'play-maps.view': {
        label: '查看游玩地图',
        description: '查看已导入的游玩地图、状态和资源统计',
    },
    'play-maps.manage': { label: '管理游玩地图', description: '导入、设置、开放或删除游玩地图' },
    'containers.view': {
        label: '查看容器运行状态',
        description: '查看创作端和游玩端当前已启动的地图运行时',
    },
    'containers.manage': { label: '管理地图容器', description: '配置游玩地图容量或销毁异常运行时' },
    'audit.view': { label: '查看安全审计', description: '查看登录风险、关联线索和管理操作记录' },
};

export function normalizePlayerAdminCapabilities(value:unknown):PlayerAdminCapability[] {
    if (!Array.isArray(value)) {
        return [];
    }
    const allowed = new Set<string>(PLAYER_ADMIN_GRANTABLE_CAPABILITIES);
    return [
        ...new Set(value.map(String).filter((capability) => allowed.has(capability))),
    ] as PlayerAdminCapability[];
}

export function effectivePlayerAdminCapabilities(
    role:PlayerAdminRole,
    assigned:readonly string[] = [],
):PlayerAdminCapability[] {
    if (role === 'owner' || role === 'admin') {
        return [...PLAYER_ADMIN_CAPABILITIES];
    }
    if (role !== 'moderator') {
        return [];
    }
    const capabilities = normalizePlayerAdminCapabilities(assigned);
    // Existing permission groups stored only the write capability. A write
    // capability continues to imply its paired read capability after upgrade.
    if (capabilities.includes('identity-bans.manage')) {
        capabilities.push('identity-bans.view');
    }
    if (capabilities.includes('sessions.manage')) {
        capabilities.push('sessions.view');
    }
    if (capabilities.includes('players.ban')) {
        capabilities.push('account-bans.view');
    }
    if (capabilities.includes('creator-access.manage')) {
        capabilities.push('creator-access.view');
    }
    if (capabilities.includes('creator-tokens.manage')) {
        capabilities.push('creator-tokens.view');
    }
    if (capabilities.includes('play-maps.manage')) {
        capabilities.push('play-maps.view');
    }
    if (capabilities.includes('containers.manage')) {
        capabilities.push('containers.view');
    }
    return [...new Set(capabilities)];
}

export function roleHasPlayerAdminPermission(
    role:PlayerAdminRole,
    requirement:PlayerAdminRequirement,
    assigned:readonly string[] = [],
) {
    // Owner access is never role-grantable. The authorization seam must also
    // verify that the identity came from a server-owner key session.
    if (requirement === 'owner') {
        return false;
    }
    return effectivePlayerAdminCapabilities(role, assigned).includes(requirement);
}
