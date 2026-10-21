"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/navigation.ts
var navigation_exports = {};
__export(navigation_exports, {
  PLAYER_ADMIN_VIEWS: () => PLAYER_ADMIN_VIEWS,
  PLAYER_ADMIN_VIEW_REQUIREMENTS: () => PLAYER_ADMIN_VIEW_REQUIREMENTS,
  allowedPlayerAdminViews: () => allowedPlayerAdminViews,
  canOpenPlayerAdminView: () => canOpenPlayerAdminView,
  playerAdminFallbackView: () => playerAdminFallbackView
});
module.exports = __toCommonJS(navigation_exports);

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
