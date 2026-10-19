/** Stable paths consumed by the player administration application. */
export declare const playerAdminRoutes: {
    readonly activity: "/api/play-admin/activity";
    readonly admins: "/api/play-admin/admins";
    readonly admin: (id: string) => string;
    readonly containers: "/api/play-admin/containers";
    readonly container: (mapId: string) => string;
    readonly containerResourceGroups: "/api/play-admin/container-resource-groups";
    readonly containerResourceGroup: (id: string) => string;
    readonly identityBans: "/api/play-admin/identity-bans";
    readonly login: "/api/play-admin/login";
    readonly logout: "/api/play-admin/logout";
    readonly libraryImport: "/api/play-admin/library/import";
    readonly libraryImportPreview: "/api/play-admin/library/import?mode=preview";
    readonly libraryImportReview: (reviewId: string) => string;
    readonly libraryImportConfirm: (reviewId: string) => string;
    readonly libraryImportResource: (reviewId: string, resourceId: string) => string;
    readonly libraryWorlds: "/api/play-admin/library/worlds";
    readonly libraryWorld: (id: string) => string;
    readonly libraryWorldStatus: "/api/play-admin/library/world-status";
    readonly permissionGroups: "/api/play-admin/permission-groups";
    readonly permissionGroup: (id: string) => string;
    readonly player: (subjectId: string) => string;
    readonly players: "/api/play-admin/players";
    readonly playerBatch: "/api/play-admin/players/batch";
    readonly playerExport: "/api/play-admin/players/export";
    readonly playerOverview: "/api/play-admin/players/overview";
    readonly ownerSession: "/api/play-admin/owner-session";
    readonly selfPassword: "/api/play-admin/self-password";
    readonly verify: "/api/play-admin/verify";
};
//# sourceMappingURL=routes.d.ts.map