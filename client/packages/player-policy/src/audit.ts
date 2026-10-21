export type PlayerAdminAuditCategory =
    | 'authentication'
    | 'player'
    | 'administrator'
    | 'permission'
    | 'maintenance'
    | 'map'
    | 'script'
    | 'unknown';

export type PlayerAdminAuditSeverity = 'info' | 'sensitive' | 'destructive';

export type PlayerAdminAuditDescriptor = Readonly<{
    label:string;
    category:PlayerAdminAuditCategory;
    severity:PlayerAdminAuditSeverity;
}>;

export const PLAYER_ADMIN_AUDIT_ACTIONS = {
    'script.key.create': { label: '创建地图授权', category: 'map', severity: 'sensitive' },
    'script.key.revoke': { label: '撤销地图授权', category: 'map', severity: 'sensitive' },
    'script.authorization.update': {
        label: '更新地图授权',
        category: 'map',
        severity: 'sensitive',
    },
    'script.binding.save': { label: '绑定地图授权', category: 'map', severity: 'sensitive' },
    'script.binding.delete': { label: '解除地图授权', category: 'map', severity: 'sensitive' },
    'script.map-ban.revoke': { label: '解除地图处罚', category: 'map', severity: 'sensitive' },
    'script.banPlayer': { label: '脚本封禁玩家', category: 'script', severity: 'sensitive' },
    'script.banCurrentIP': { label: '脚本封禁 IP', category: 'script', severity: 'sensitive' },
    'script.banCurrentDevice': { label: '脚本封禁设备', category: 'script', severity: 'sensitive' },
    'script.revokeBan': { label: '脚本解除处罚', category: 'script', severity: 'sensitive' },
    'script.getPlayerStatus': {
        label: '脚本查询玩家状态',
        category: 'script',
        severity: 'sensitive',
    },
    'script.listBans': { label: '脚本查询处罚记录', category: 'script', severity: 'sensitive' },
    'script.getBan': { label: '脚本查询处罚详情', category: 'script', severity: 'sensitive' },

    'login.success': { label: '账号登录成功', category: 'authentication', severity: 'info' },
    'login.failed': { label: '账号登录失败', category: 'authentication', severity: 'sensitive' },
    'admin.login.success': {
        label: '管理账号登录成功',
        category: 'authentication',
        severity: 'sensitive',
    },
    'admin.login.failed': {
        label: '管理账号登录失败',
        category: 'authentication',
        severity: 'sensitive',
    },
    'admin.account.create': {
        label: '创建管理账号',
        category: 'administrator',
        severity: 'sensitive',
    },
    'admin.account.update': {
        label: '修改管理账号',
        category: 'administrator',
        severity: 'sensitive',
    },
    'admin.account.delete': {
        label: '删除管理账号',
        category: 'administrator',
        severity: 'destructive',
    },
    'admin.permission-group.create': {
        label: '创建权限组',
        category: 'permission',
        severity: 'sensitive',
    },
    'admin.permission-group.update': {
        label: '修改权限组',
        category: 'permission',
        severity: 'sensitive',
    },
    'admin.permission-group.delete': {
        label: '删除权限组',
        category: 'permission',
        severity: 'destructive',
    },
    'player.create': { label: '创建玩家账号', category: 'player', severity: 'sensitive' },
    'player.update': { label: '修改玩家资料', category: 'player', severity: 'sensitive' },
    'player.box-id.update': {
        label: '修改神岛 ID 绑定',
        category: 'player',
        severity: 'sensitive',
    },
    'player.delete': { label: '删除玩家身份', category: 'player', severity: 'destructive' },
    'player.sessions.revoke': { label: '强制玩家下线', category: 'player', severity: 'sensitive' },
    'player.session.revoke': {
        label: '撤销单个设备会话',
        category: 'player',
        severity: 'sensitive',
    },
    'player.password.reset': { label: '重置玩家密码', category: 'player', severity: 'sensitive' },
    'identity.ip.ban': { label: '封禁 IP 地址', category: 'player', severity: 'sensitive' },
    'identity.ip.unban': { label: '解除 IP 封禁', category: 'player', severity: 'sensitive' },
    'identity.device.ban': { label: '封禁设备', category: 'player', severity: 'sensitive' },
    'identity.device.unban': { label: '解除设备封禁', category: 'player', severity: 'sensitive' },
    'system.sessions.cleanup': {
        label: '清理过期登录会话',
        category: 'maintenance',
        severity: 'info',
    },
} as const satisfies Readonly<Record<string, PlayerAdminAuditDescriptor>>;

export type PlayerAdminAuditAction = keyof typeof PLAYER_ADMIN_AUDIT_ACTIONS;

const unknownDescriptor = (action:string):PlayerAdminAuditDescriptor => ({
    label: action || '未知操作',
    category: 'unknown',
    severity: 'info',
});

export function describePlayerAdminAuditAction(action:string):PlayerAdminAuditDescriptor {
    if (!Object.prototype.hasOwnProperty.call(PLAYER_ADMIN_AUDIT_ACTIONS, action)) {
        return unknownDescriptor(action);
    }
    return PLAYER_ADMIN_AUDIT_ACTIONS[action as PlayerAdminAuditAction];
}
