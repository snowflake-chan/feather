// src/policy.ts
var PLAYER_ADMIN_CAPABILITIES = [
  "players.view",
  "sessions.view",
  "account-bans.view",
  "players.manage",
  "players.ban",
  "sessions.manage",
  "identity-bans.view",
  "identity-bans.manage",
  "players.create",
  "players.export",
  "players.delete",
  "passwords.reset",
  "creator-access.view",
  "creator-access.manage",
  "creator-tokens.view",
  "creator-tokens.manage",
  "play-maps.view",
  "play-maps.manage",
  "containers.view",
  "containers.manage",
  "audit.view"
];
var PLAYER_ADMIN_GRANTABLE_CAPABILITIES = PLAYER_ADMIN_CAPABILITIES;
var PLAYER_ADMIN_CAPABILITY_META = {
  "players.view": { label: "\u67E5\u770B\u73A9\u5BB6\u8D26\u53F7", description: "\u67E5\u770B\u73A9\u5BB6\u76EE\u5F55\u3001\u8D44\u6599\u548C\u6982\u89C8" },
  "sessions.view": { label: "\u67E5\u770B\u5728\u7EBF\u4F1A\u8BDD", description: "\u67E5\u770B\u5F53\u524D\u5728\u7EBF\u73A9\u5BB6\u53CA\u5176\u4F1A\u8BDD\u4FE1\u606F" },
  "account-bans.view": { label: "\u67E5\u770B\u8D26\u53F7\u5C01\u7981", description: "\u67E5\u770B\u5F53\u524D\u5DF2\u5C01\u7981\u7684\u73A9\u5BB6\u8D26\u53F7" },
  "players.manage": { label: "\u7EF4\u62A4\u73A9\u5BB6\u8D44\u6599", description: "\u4FEE\u6539\u6635\u79F0\u3001\u6807\u7B7E\u3001\u5907\u6CE8\u4E0E\u795E\u5C9B ID" },
  "players.ban": { label: "\u7BA1\u7406\u8D26\u53F7\u5C01\u7981", description: "\u4E34\u65F6\u6216\u6C38\u4E45\u5C01\u7981\u666E\u901A\u73A9\u5BB6\u8D26\u53F7\u5E76\u89E3\u9664\u5904\u7F5A" },
  "sessions.manage": { label: "\u7BA1\u7406\u5728\u7EBF\u4F1A\u8BDD", description: "\u64A4\u9500\u767B\u5F55\u4F1A\u8BDD\u5E76\u8BA9\u666E\u901A\u73A9\u5BB6\u7ACB\u5373\u4E0B\u7EBF" },
  "identity-bans.view": {
    label: "\u67E5\u770B IP \u4E0E\u8BBE\u5907\u5C01\u7981",
    description: "\u67E5\u770B\u5F53\u524D\u6709\u6548\u7684 IP \u548C\u8BBE\u5907\u5C01\u7981\u8BB0\u5F55"
  },
  "identity-bans.manage": { label: "IP \u4E0E\u8BBE\u5907\u5C01\u7981", description: "\u5C01\u7981\u6216\u89E3\u9664\u767B\u5F55 IP \u548C\u8BBE\u5907\u6807\u8BC6" },
  "players.create": {
    label: "\u65B0\u589E\u666E\u901A\u73A9\u5BB6",
    description: "\u521B\u5EFA\u666E\u901A\u73A9\u5BB6\u8D26\u53F7\uFF0C\u4E0D\u80FD\u521B\u5EFA\u7BA1\u7406\u5458\u6216\u670D\u4E3B"
  },
  "players.export": { label: "\u5BFC\u51FA\u73A9\u5BB6\u6570\u636E", description: "\u5BFC\u51FA\u73A9\u5BB6\u76EE\u5F55 CSV" },
  "players.delete": { label: "\u5220\u9664\u73A9\u5BB6\u8EAB\u4EFD", description: "\u6C38\u4E45\u5220\u9664\u666E\u901A\u73A9\u5BB6\u8EAB\u4EFD\u53CA\u5176\u767B\u5F55\u4F1A\u8BDD" },
  "passwords.reset": { label: "\u91CD\u7F6E\u73A9\u5BB6\u5BC6\u7801", description: "\u4E3A\u666E\u901A\u73A9\u5BB6\u8BBE\u7F6E\u4E34\u65F6\u5BC6\u7801\u5E76\u64A4\u9500\u65E7\u4F1A\u8BDD" },
  "creator-access.view": { label: "\u67E5\u770B\u521B\u4F5C\u6743\u9650", description: "\u67E5\u770B\u73A9\u5BB6\u662F\u5426\u62E5\u6709\u521B\u4F5C\u7AEF\u8BBF\u95EE\u6743\u9650" },
  "creator-access.manage": {
    label: "\u7BA1\u7406\u521B\u4F5C\u6743\u9650",
    description: "\u6388\u4E88\u6216\u8C03\u6574\u73A9\u5BB6\u8FDB\u5165\u521B\u4F5C\u7AEF\u7684\u6743\u9650\uFF0C\u4E0D\u5305\u542B\u540E\u53F0\u7BA1\u7406\u6743\u9650"
  },
  "creator-tokens.view": {
    label: "\u67E5\u770B Creator CLI Token",
    description: "\u67E5\u770B\u5DF2\u7B7E\u53D1\u7684 Creator CLI Token \u4FE1\u606F"
  },
  "creator-tokens.manage": {
    label: "\u7BA1\u7406 Creator CLI Token",
    description: "\u4E3A\u5DF2\u83B7\u521B\u4F5C\u6743\u9650\u7684\u73A9\u5BB6\u7B7E\u53D1\u6216\u64A4\u9500 CLI Token\uFF0C\u4E0D\u4F1A\u63D0\u5347\u5176\u521B\u4F5C\u6743\u9650"
  },
  "play-maps.view": {
    label: "\u67E5\u770B\u6E38\u73A9\u5730\u56FE",
    description: "\u67E5\u770B\u5DF2\u5BFC\u5165\u7684\u6E38\u73A9\u5730\u56FE\u3001\u72B6\u6001\u548C\u8D44\u6E90\u7EDF\u8BA1"
  },
  "play-maps.manage": { label: "\u7BA1\u7406\u6E38\u73A9\u5730\u56FE", description: "\u5BFC\u5165\u3001\u8BBE\u7F6E\u3001\u5F00\u653E\u6216\u5220\u9664\u6E38\u73A9\u5730\u56FE" },
  "containers.view": {
    label: "\u67E5\u770B\u5BB9\u5668\u8FD0\u884C\u72B6\u6001",
    description: "\u67E5\u770B\u521B\u4F5C\u7AEF\u548C\u6E38\u73A9\u7AEF\u5F53\u524D\u5DF2\u542F\u52A8\u7684\u5730\u56FE\u8FD0\u884C\u65F6"
  },
  "containers.manage": { label: "\u7BA1\u7406\u5730\u56FE\u5BB9\u5668", description: "\u914D\u7F6E\u6E38\u73A9\u5730\u56FE\u5BB9\u91CF\u6216\u9500\u6BC1\u5F02\u5E38\u8FD0\u884C\u65F6" },
  "audit.view": { label: "\u67E5\u770B\u5B89\u5168\u5BA1\u8BA1", description: "\u67E5\u770B\u767B\u5F55\u98CE\u9669\u3001\u5173\u8054\u7EBF\u7D22\u548C\u7BA1\u7406\u64CD\u4F5C\u8BB0\u5F55" }
};
function normalizePlayerAdminCapabilities(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const allowed = new Set(PLAYER_ADMIN_GRANTABLE_CAPABILITIES);
  return [
    ...new Set(value.map(String).filter((capability) => allowed.has(capability)))
  ];
}
function effectivePlayerAdminCapabilities(role, assigned = []) {
  if (role === "owner" || role === "admin") {
    return [...PLAYER_ADMIN_CAPABILITIES];
  }
  if (role !== "moderator") {
    return [];
  }
  const capabilities = normalizePlayerAdminCapabilities(assigned);
  if (capabilities.includes("identity-bans.manage")) {
    capabilities.push("identity-bans.view");
  }
  if (capabilities.includes("sessions.manage")) {
    capabilities.push("sessions.view");
  }
  if (capabilities.includes("players.ban")) {
    capabilities.push("account-bans.view");
  }
  if (capabilities.includes("creator-access.manage")) {
    capabilities.push("creator-access.view");
  }
  if (capabilities.includes("creator-tokens.manage")) {
    capabilities.push("creator-tokens.view");
  }
  if (capabilities.includes("play-maps.manage")) {
    capabilities.push("play-maps.view");
  }
  if (capabilities.includes("containers.manage")) {
    capabilities.push("containers.view");
  }
  return [...new Set(capabilities)];
}
function roleHasPlayerAdminPermission(role, requirement, assigned = []) {
  if (requirement === "owner") {
    return false;
  }
  return effectivePlayerAdminCapabilities(role, assigned).includes(requirement);
}

// src/audit.ts
var PLAYER_ADMIN_AUDIT_ACTIONS = {
  "script.key.create": { label: "\u521B\u5EFA\u5730\u56FE\u6388\u6743", category: "map", severity: "sensitive" },
  "script.key.revoke": { label: "\u64A4\u9500\u5730\u56FE\u6388\u6743", category: "map", severity: "sensitive" },
  "script.authorization.update": {
    label: "\u66F4\u65B0\u5730\u56FE\u6388\u6743",
    category: "map",
    severity: "sensitive"
  },
  "script.binding.save": { label: "\u7ED1\u5B9A\u5730\u56FE\u6388\u6743", category: "map", severity: "sensitive" },
  "script.binding.delete": { label: "\u89E3\u9664\u5730\u56FE\u6388\u6743", category: "map", severity: "sensitive" },
  "script.map-ban.revoke": { label: "\u89E3\u9664\u5730\u56FE\u5904\u7F5A", category: "map", severity: "sensitive" },
  "script.banPlayer": { label: "\u811A\u672C\u5C01\u7981\u73A9\u5BB6", category: "script", severity: "sensitive" },
  "script.banCurrentIP": { label: "\u811A\u672C\u5C01\u7981 IP", category: "script", severity: "sensitive" },
  "script.banCurrentDevice": { label: "\u811A\u672C\u5C01\u7981\u8BBE\u5907", category: "script", severity: "sensitive" },
  "script.revokeBan": { label: "\u811A\u672C\u89E3\u9664\u5904\u7F5A", category: "script", severity: "sensitive" },
  "script.getPlayerStatus": {
    label: "\u811A\u672C\u67E5\u8BE2\u73A9\u5BB6\u72B6\u6001",
    category: "script",
    severity: "sensitive"
  },
  "script.listBans": { label: "\u811A\u672C\u67E5\u8BE2\u5904\u7F5A\u8BB0\u5F55", category: "script", severity: "sensitive" },
  "script.getBan": { label: "\u811A\u672C\u67E5\u8BE2\u5904\u7F5A\u8BE6\u60C5", category: "script", severity: "sensitive" },
  "login.success": { label: "\u8D26\u53F7\u767B\u5F55\u6210\u529F", category: "authentication", severity: "info" },
  "login.failed": { label: "\u8D26\u53F7\u767B\u5F55\u5931\u8D25", category: "authentication", severity: "sensitive" },
  "admin.login.success": {
    label: "\u7BA1\u7406\u8D26\u53F7\u767B\u5F55\u6210\u529F",
    category: "authentication",
    severity: "sensitive"
  },
  "admin.login.failed": {
    label: "\u7BA1\u7406\u8D26\u53F7\u767B\u5F55\u5931\u8D25",
    category: "authentication",
    severity: "sensitive"
  },
  "admin.account.create": {
    label: "\u521B\u5EFA\u7BA1\u7406\u8D26\u53F7",
    category: "administrator",
    severity: "sensitive"
  },
  "admin.account.update": {
    label: "\u4FEE\u6539\u7BA1\u7406\u8D26\u53F7",
    category: "administrator",
    severity: "sensitive"
  },
  "admin.account.delete": {
    label: "\u5220\u9664\u7BA1\u7406\u8D26\u53F7",
    category: "administrator",
    severity: "destructive"
  },
  "admin.permission-group.create": {
    label: "\u521B\u5EFA\u6743\u9650\u7EC4",
    category: "permission",
    severity: "sensitive"
  },
  "admin.permission-group.update": {
    label: "\u4FEE\u6539\u6743\u9650\u7EC4",
    category: "permission",
    severity: "sensitive"
  },
  "admin.permission-group.delete": {
    label: "\u5220\u9664\u6743\u9650\u7EC4",
    category: "permission",
    severity: "destructive"
  },
  "player.create": { label: "\u521B\u5EFA\u73A9\u5BB6\u8D26\u53F7", category: "player", severity: "sensitive" },
  "player.update": { label: "\u4FEE\u6539\u73A9\u5BB6\u8D44\u6599", category: "player", severity: "sensitive" },
  "player.box-id.update": {
    label: "\u4FEE\u6539\u795E\u5C9B ID \u7ED1\u5B9A",
    category: "player",
    severity: "sensitive"
  },
  "player.delete": { label: "\u5220\u9664\u73A9\u5BB6\u8EAB\u4EFD", category: "player", severity: "destructive" },
  "player.sessions.revoke": { label: "\u5F3A\u5236\u73A9\u5BB6\u4E0B\u7EBF", category: "player", severity: "sensitive" },
  "player.session.revoke": {
    label: "\u64A4\u9500\u5355\u4E2A\u8BBE\u5907\u4F1A\u8BDD",
    category: "player",
    severity: "sensitive"
  },
  "player.password.reset": { label: "\u91CD\u7F6E\u73A9\u5BB6\u5BC6\u7801", category: "player", severity: "sensitive" },
  "identity.ip.ban": { label: "\u5C01\u7981 IP \u5730\u5740", category: "player", severity: "sensitive" },
  "identity.ip.unban": { label: "\u89E3\u9664 IP \u5C01\u7981", category: "player", severity: "sensitive" },
  "identity.device.ban": { label: "\u5C01\u7981\u8BBE\u5907", category: "player", severity: "sensitive" },
  "identity.device.unban": { label: "\u89E3\u9664\u8BBE\u5907\u5C01\u7981", category: "player", severity: "sensitive" },
  "system.sessions.cleanup": {
    label: "\u6E05\u7406\u8FC7\u671F\u767B\u5F55\u4F1A\u8BDD",
    category: "maintenance",
    severity: "info"
  }
};
var unknownDescriptor = (action) => ({
  label: action || "\u672A\u77E5\u64CD\u4F5C",
  category: "unknown",
  severity: "info"
});
function describePlayerAdminAuditAction(action) {
  if (!Object.prototype.hasOwnProperty.call(PLAYER_ADMIN_AUDIT_ACTIONS, action)) {
    return unknownDescriptor(action);
  }
  return PLAYER_ADMIN_AUDIT_ACTIONS[action];
}
export {
  PLAYER_ADMIN_AUDIT_ACTIONS,
  PLAYER_ADMIN_CAPABILITIES,
  PLAYER_ADMIN_CAPABILITY_META,
  PLAYER_ADMIN_GRANTABLE_CAPABILITIES,
  describePlayerAdminAuditAction,
  effectivePlayerAdminCapabilities,
  normalizePlayerAdminCapabilities,
  roleHasPlayerAdminPermission
};
