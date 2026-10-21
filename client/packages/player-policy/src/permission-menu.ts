import type { PlayerAdminCapability } from './policy';

export type PlayerAdminPermissionMenuSection = {
    key:string;
    title:string;
    capabilities:readonly PlayerAdminCapability[];
};

export type PlayerAdminPermissionMenuCategory = {
    key:string;
    title:string;
    sections:readonly PlayerAdminPermissionMenuSection[];
};

/**
 * Permission-group presentation mirrors the player-admin navigation. Keep every
 * grantable capability here so the UI never presents an orphaned API permission.
 */
export const PLAYER_ADMIN_PERMISSION_MENU:readonly PlayerAdminPermissionMenuCategory[] = [
    {
        key: 'players',
        title: '玩家管理',
        sections: [
            {
                key: 'player-accounts',
                title: '玩家账号',
                capabilities: [
                    'players.view',
                    'players.export',
                    'players.manage',
                    'players.create',
                    'passwords.reset',
                    'players.delete',
                ],
            },
            {
                key: 'online-sessions',
                title: '在线会话',
                capabilities: ['sessions.view', 'sessions.manage'],
            },
        ],
    },
    {
        key: 'security',
        title: '安全管理',
        sections: [
            {
                key: 'account-bans',
                title: '账号封禁',
                capabilities: ['account-bans.view', 'players.ban'],
            },
            {
                key: 'identity-bans',
                title: 'IP / 设备封禁',
                capabilities: ['identity-bans.view', 'identity-bans.manage'],
            },
            { key: 'security-records', title: '安全记录', capabilities: ['audit.view'] },
        ],
    },
    {
        key: 'creator',
        title: '创作管理',
        sections: [
            {
                key: 'creator-access',
                title: '创作权限',
                capabilities: ['creator-access.view', 'creator-access.manage'],
            },
            {
                key: 'creator-tokens',
                title: 'CLI 令牌',
                capabilities: ['creator-tokens.view', 'creator-tokens.manage'],
            },
        ],
    },
    {
        key: 'play',
        title: '游玩管理',
        sections: [
            {
                key: 'play-maps',
                title: '游玩地图',
                capabilities: ['play-maps.view', 'play-maps.manage'],
            },
        ],
    },
    {
        key: 'containers',
        title: '容器管理',
        sections: [
            { key: 'runtimes', title: '游玩端 / 创作端', capabilities: ['containers.view'] },
            { key: 'profiles', title: '容器配置', capabilities: ['containers.manage'] },
        ],
    },
];
