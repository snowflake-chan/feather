export type PlayerAdminAuditCategory = 'authentication' | 'player' | 'administrator' | 'permission' | 'maintenance' | 'map' | 'script' | 'unknown';
export type PlayerAdminAuditSeverity = 'info' | 'sensitive' | 'destructive';
export type PlayerAdminAuditDescriptor = Readonly<{
    label: string;
    category: PlayerAdminAuditCategory;
    severity: PlayerAdminAuditSeverity;
}>;
export declare const PLAYER_ADMIN_AUDIT_ACTIONS: {
    readonly 'script.key.create': {
        readonly label: "创建地图授权";
        readonly category: "map";
        readonly severity: "sensitive";
    };
    readonly 'script.key.revoke': {
        readonly label: "撤销地图授权";
        readonly category: "map";
        readonly severity: "sensitive";
    };
    readonly 'script.authorization.update': {
        readonly label: "更新地图授权";
        readonly category: "map";
        readonly severity: "sensitive";
    };
    readonly 'script.binding.save': {
        readonly label: "绑定地图授权";
        readonly category: "map";
        readonly severity: "sensitive";
    };
    readonly 'script.binding.delete': {
        readonly label: "解除地图授权";
        readonly category: "map";
        readonly severity: "sensitive";
    };
    readonly 'script.map-ban.revoke': {
        readonly label: "解除地图处罚";
        readonly category: "map";
        readonly severity: "sensitive";
    };
    readonly 'script.banPlayer': {
        readonly label: "脚本封禁玩家";
        readonly category: "script";
        readonly severity: "sensitive";
    };
    readonly 'script.banCurrentIP': {
        readonly label: "脚本封禁 IP";
        readonly category: "script";
        readonly severity: "sensitive";
    };
    readonly 'script.banCurrentDevice': {
        readonly label: "脚本封禁设备";
        readonly category: "script";
        readonly severity: "sensitive";
    };
    readonly 'script.revokeBan': {
        readonly label: "脚本解除处罚";
        readonly category: "script";
        readonly severity: "sensitive";
    };
    readonly 'script.getPlayerStatus': {
        readonly label: "脚本查询玩家状态";
        readonly category: "script";
        readonly severity: "sensitive";
    };
    readonly 'script.listBans': {
        readonly label: "脚本查询处罚记录";
        readonly category: "script";
        readonly severity: "sensitive";
    };
    readonly 'script.getBan': {
        readonly label: "脚本查询处罚详情";
        readonly category: "script";
        readonly severity: "sensitive";
    };
    readonly 'login.success': {
        readonly label: "账号登录成功";
        readonly category: "authentication";
        readonly severity: "info";
    };
    readonly 'login.failed': {
        readonly label: "账号登录失败";
        readonly category: "authentication";
        readonly severity: "sensitive";
    };
    readonly 'admin.login.success': {
        readonly label: "管理账号登录成功";
        readonly category: "authentication";
        readonly severity: "sensitive";
    };
    readonly 'admin.login.failed': {
        readonly label: "管理账号登录失败";
        readonly category: "authentication";
        readonly severity: "sensitive";
    };
    readonly 'admin.account.create': {
        readonly label: "创建管理账号";
        readonly category: "administrator";
        readonly severity: "sensitive";
    };
    readonly 'admin.account.update': {
        readonly label: "修改管理账号";
        readonly category: "administrator";
        readonly severity: "sensitive";
    };
    readonly 'admin.account.delete': {
        readonly label: "删除管理账号";
        readonly category: "administrator";
        readonly severity: "destructive";
    };
    readonly 'admin.permission-group.create': {
        readonly label: "创建权限组";
        readonly category: "permission";
        readonly severity: "sensitive";
    };
    readonly 'admin.permission-group.update': {
        readonly label: "修改权限组";
        readonly category: "permission";
        readonly severity: "sensitive";
    };
    readonly 'admin.permission-group.delete': {
        readonly label: "删除权限组";
        readonly category: "permission";
        readonly severity: "destructive";
    };
    readonly 'player.create': {
        readonly label: "创建玩家账号";
        readonly category: "player";
        readonly severity: "sensitive";
    };
    readonly 'player.update': {
        readonly label: "修改玩家资料";
        readonly category: "player";
        readonly severity: "sensitive";
    };
    readonly 'player.box-id.update': {
        readonly label: "修改神岛 ID 绑定";
        readonly category: "player";
        readonly severity: "sensitive";
    };
    readonly 'player.delete': {
        readonly label: "删除玩家身份";
        readonly category: "player";
        readonly severity: "destructive";
    };
    readonly 'player.sessions.revoke': {
        readonly label: "强制玩家下线";
        readonly category: "player";
        readonly severity: "sensitive";
    };
    readonly 'player.session.revoke': {
        readonly label: "撤销单个设备会话";
        readonly category: "player";
        readonly severity: "sensitive";
    };
    readonly 'player.password.reset': {
        readonly label: "重置玩家密码";
        readonly category: "player";
        readonly severity: "sensitive";
    };
    readonly 'identity.ip.ban': {
        readonly label: "封禁 IP 地址";
        readonly category: "player";
        readonly severity: "sensitive";
    };
    readonly 'identity.ip.unban': {
        readonly label: "解除 IP 封禁";
        readonly category: "player";
        readonly severity: "sensitive";
    };
    readonly 'identity.device.ban': {
        readonly label: "封禁设备";
        readonly category: "player";
        readonly severity: "sensitive";
    };
    readonly 'identity.device.unban': {
        readonly label: "解除设备封禁";
        readonly category: "player";
        readonly severity: "sensitive";
    };
    readonly 'system.sessions.cleanup': {
        readonly label: "清理过期登录会话";
        readonly category: "maintenance";
        readonly severity: "info";
    };
};
export type PlayerAdminAuditAction = keyof typeof PLAYER_ADMIN_AUDIT_ACTIONS;
export declare function describePlayerAdminAuditAction(action: string): PlayerAdminAuditDescriptor;
