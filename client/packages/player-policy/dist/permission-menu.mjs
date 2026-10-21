// src/permission-menu.ts
var PLAYER_ADMIN_PERMISSION_MENU = [
  {
    key: "players",
    title: "\u73A9\u5BB6\u7BA1\u7406",
    sections: [
      {
        key: "player-accounts",
        title: "\u73A9\u5BB6\u8D26\u53F7",
        capabilities: [
          "players.view",
          "players.export",
          "players.manage",
          "players.create",
          "passwords.reset",
          "players.delete"
        ]
      },
      {
        key: "online-sessions",
        title: "\u5728\u7EBF\u4F1A\u8BDD",
        capabilities: ["sessions.view", "sessions.manage"]
      }
    ]
  },
  {
    key: "security",
    title: "\u5B89\u5168\u7BA1\u7406",
    sections: [
      {
        key: "account-bans",
        title: "\u8D26\u53F7\u5C01\u7981",
        capabilities: ["account-bans.view", "players.ban"]
      },
      {
        key: "identity-bans",
        title: "IP / \u8BBE\u5907\u5C01\u7981",
        capabilities: ["identity-bans.view", "identity-bans.manage"]
      },
      { key: "security-records", title: "\u5B89\u5168\u8BB0\u5F55", capabilities: ["audit.view"] }
    ]
  },
  {
    key: "creator",
    title: "\u521B\u4F5C\u7BA1\u7406",
    sections: [
      {
        key: "creator-access",
        title: "\u521B\u4F5C\u6743\u9650",
        capabilities: ["creator-access.view", "creator-access.manage"]
      },
      {
        key: "creator-tokens",
        title: "CLI \u4EE4\u724C",
        capabilities: ["creator-tokens.view", "creator-tokens.manage"]
      }
    ]
  },
  {
    key: "play",
    title: "\u6E38\u73A9\u7BA1\u7406",
    sections: [
      {
        key: "play-maps",
        title: "\u6E38\u73A9\u5730\u56FE",
        capabilities: ["play-maps.view", "play-maps.manage"]
      }
    ]
  },
  {
    key: "containers",
    title: "\u5BB9\u5668\u7BA1\u7406",
    sections: [
      { key: "runtimes", title: "\u6E38\u73A9\u7AEF / \u521B\u4F5C\u7AEF", capabilities: ["containers.view"] },
      { key: "profiles", title: "\u5BB9\u5668\u914D\u7F6E", capabilities: ["containers.manage"] }
    ]
  }
];
export {
  PLAYER_ADMIN_PERMISSION_MENU
};
