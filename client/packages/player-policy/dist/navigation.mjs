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

// src/navigation.ts
var PLAYER_ADMIN_VIEWS = [
  "overview",
  "players",
  "online-sessions",
  "account-bans",
  "identity-bans",
  "security",
  "admins",
  "permission-groups",
  "script-moderation",
  "play-maps",
  "container-play",
  "container-creator",
  "container-profiles",
  "container-resource-groups",
  "creator-access",
  "creator-tokens"
];
var PLAYER_ADMIN_VIEW_REQUIREMENTS = {
  "overview": "players.view",
  "players": "players.view",
  "online-sessions": "sessions.view",
  "account-bans": "account-bans.view",
  "identity-bans": "identity-bans.view",
  "security": "audit.view",
  "admins": "owner",
  "permission-groups": "owner",
  "script-moderation": "owner",
  "play-maps": "play-maps.view",
  "container-play": "containers.view",
  "container-creator": "containers.view",
  "container-profiles": "containers.view",
  "container-resource-groups": "containers.view",
  "creator-access": "creator-access.view",
  "creator-tokens": "creator-tokens.view"
};
function canOpenPlayerAdminView(actor, view) {
  if (!actor) {
    return false;
  }
  if (view === "script-moderation") {
    return actor.role === "owner";
  }
  if (actor.role === "owner" || actor.role === "admin") {
    return true;
  }
  const requirement = PLAYER_ADMIN_VIEW_REQUIREMENTS[view];
  return requirement !== "owner" && roleHasPlayerAdminPermission(actor.role, requirement, actor.permissions);
}
function allowedPlayerAdminViews(actor) {
  return PLAYER_ADMIN_VIEWS.filter((view) => canOpenPlayerAdminView(actor, view));
}
function playerAdminFallbackView(actor) {
  const available = allowedPlayerAdminViews(actor);
  return available.includes("players") ? "players" : available[0] || "players";
}
export {
  PLAYER_ADMIN_VIEWS,
  PLAYER_ADMIN_VIEW_REQUIREMENTS,
  allowedPlayerAdminViews,
  canOpenPlayerAdminView,
  playerAdminFallbackView
};
