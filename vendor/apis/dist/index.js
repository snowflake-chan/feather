'use strict';

var createClient = require('openapi-fetch');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var createClient__default = /*#__PURE__*/_interopDefault(createClient);

/** Stable wire values used by Local Engine Creator, VOXA and game runtime. */ exports.UserInfoPermissions = void 0;
(function(UserInfoPermissions) {
    UserInfoPermissions[UserInfoPermissions["Admin"] = 65536] = "Admin";
})(exports.UserInfoPermissions || (exports.UserInfoPermissions = {}));
exports.AvatarBodyPart = void 0;
(function(AvatarBodyPart) {
    AvatarBodyPart[AvatarBodyPart["head"] = 1] = "head";
    AvatarBodyPart[AvatarBodyPart["hips"] = 2] = "hips";
    AvatarBodyPart[AvatarBodyPart["leftFoot"] = 3] = "leftFoot";
    AvatarBodyPart[AvatarBodyPart["leftHand"] = 4] = "leftHand";
    AvatarBodyPart[AvatarBodyPart["leftLowerArm"] = 5] = "leftLowerArm";
    AvatarBodyPart[AvatarBodyPart["leftLowerLeg"] = 6] = "leftLowerLeg";
    AvatarBodyPart[AvatarBodyPart["leftShoulder"] = 7] = "leftShoulder";
    AvatarBodyPart[AvatarBodyPart["leftUpperArm"] = 8] = "leftUpperArm";
    AvatarBodyPart[AvatarBodyPart["leftUpperLeg"] = 9] = "leftUpperLeg";
    AvatarBodyPart[AvatarBodyPart["neck"] = 10] = "neck";
    AvatarBodyPart[AvatarBodyPart["rightFoot"] = 11] = "rightFoot";
    AvatarBodyPart[AvatarBodyPart["rightHand"] = 12] = "rightHand";
    AvatarBodyPart[AvatarBodyPart["rightLowerArm"] = 13] = "rightLowerArm";
    AvatarBodyPart[AvatarBodyPart["rightLowerLeg"] = 14] = "rightLowerLeg";
    AvatarBodyPart[AvatarBodyPart["rightShoulder"] = 15] = "rightShoulder";
    AvatarBodyPart[AvatarBodyPart["rightUpperArm"] = 16] = "rightUpperArm";
    AvatarBodyPart[AvatarBodyPart["rightUpperLeg"] = 17] = "rightUpperLeg";
    AvatarBodyPart[AvatarBodyPart["torso"] = 18] = "torso";
})(exports.AvatarBodyPart || (exports.AvatarBodyPart = {}));
exports.ModelType = void 0;
(function(ModelType) {
    ModelType[ModelType["Private"] = 0] = "Private";
    ModelType[ModelType["Public"] = 1] = "Public";
    ModelType[ModelType["Project"] = 2] = "Project";
    ModelType[ModelType["ExtensionLib"] = 3] = "ExtensionLib";
})(exports.ModelType || (exports.ModelType = {}));
exports.CreativeMode = void 0;
(function(CreativeMode) {
    CreativeMode[CreativeMode["Model"] = 1] = "Model";
    CreativeMode[CreativeMode["Skin"] = 2] = "Skin";
})(exports.CreativeMode || (exports.CreativeMode = {}));
exports.SortOrder = void 0;
(function(SortOrder) {
    SortOrder[SortOrder["CreateTimeDesc"] = 0] = "CreateTimeDesc";
    SortOrder[SortOrder["NameAsc"] = 1] = "NameAsc";
    SortOrder[SortOrder["ModifyTimeDesc"] = 2] = "ModifyTimeDesc";
})(exports.SortOrder || (exports.SortOrder = {}));
exports.SourceType = void 0;
(function(SourceType) {
    SourceType[SourceType["Snapshot"] = 0] = "Snapshot";
    SourceType[SourceType["Release"] = 1] = "Release";
})(exports.SourceType || (exports.SourceType = {}));
exports.CopyEvent = void 0;
(function(CopyEvent) {
    CopyEvent[CopyEvent["ActiveCopy"] = 0] = "ActiveCopy";
    CopyEvent[CopyEvent["PassiveCopy"] = 1] = "PassiveCopy";
})(exports.CopyEvent || (exports.CopyEvent = {}));
exports.ModelErrorCode = void 0;
(function(ModelErrorCode) {
    ModelErrorCode[ModelErrorCode["NameExisted"] = 10020013] = "NameExisted";
    ModelErrorCode[ModelErrorCode["ModelNotExisted"] = 10020011] = "ModelNotExisted";
})(exports.ModelErrorCode || (exports.ModelErrorCode = {}));
exports.ShareScriptErrorCode = void 0;
(function(ShareScriptErrorCode) {
    ShareScriptErrorCode[ShareScriptErrorCode["ScriptNotExist"] = 21010001] = "ScriptNotExist";
    ShareScriptErrorCode[ShareScriptErrorCode["ScriptGetLockFailed"] = 21010002] = "ScriptGetLockFailed";
    ShareScriptErrorCode[ShareScriptErrorCode["ScriptLockedByAnotherMap"] = 21010003] = "ScriptLockedByAnotherMap";
    ShareScriptErrorCode[ShareScriptErrorCode["NotCombMap"] = 21010005] = "NotCombMap";
    ShareScriptErrorCode[ShareScriptErrorCode["ScriptNameRepeat"] = 21010007] = "ScriptNameRepeat";
    ShareScriptErrorCode[ShareScriptErrorCode["ScriptGlobalLockFailed"] = 21010008] = "ScriptGlobalLockFailed";
})(exports.ShareScriptErrorCode || (exports.ShareScriptErrorCode = {}));
exports.ScriptType = void 0;
(function(ScriptType) {
    ScriptType[ScriptType["Server"] = 0] = "Server";
    ScriptType[ScriptType["Client"] = 1] = "Client";
})(exports.ScriptType || (exports.ScriptType = {}));
exports.ContentType = void 0;
(function(ContentType) {
    ContentType["Json"] = "application/json";
    ContentType["FormData"] = "multipart/form-data";
    ContentType["UrlEncoded"] = "application/x-www-form-urlencoded";
})(exports.ContentType || (exports.ContentType = {}));
const REQUEST_TIMEOUT = 10 * 1000;

/**
 * Editor capabilities understood by the local Creator and VOXA clients.
 *
 * These stable wire values are kept outside the removed cloud-platform
 * clients because local permission checks still exchange them at runtime.
 */ exports.Permissions = void 0;
(function(Permissions) {
    Permissions["UserEnginePlay"] = "user:engine:play";
    Permissions["UserEngineManage"] = "user:engine:manage";
    Permissions["UserEngineEditor"] = "user:engine:editor";
    Permissions["UserEngineEditorGenerate"] = "user:engine:editor:generate";
    Permissions["UserVoxelManage"] = "user:voxel:manage";
    Permissions["UserVoxelEditor"] = "user:voxel:editor";
    Permissions["UserVoxelEditorMultiObj"] = "user:voxel:editor:multi_object";
    Permissions["UserVoxelEditorMultiObjAnimation"] = "user:voxel:editor:multi_object:animation";
    Permissions["ResourceEnginePlay"] = "resource:engine:play";
})(exports.Permissions || (exports.Permissions = {}));

const escaped = (value)=>encodeURIComponent(value);
/** Stable paths consumed by the player administration application. */ const playerAdminRoutes = {
    activity: '/api/play-admin/activity',
    admins: '/api/play-admin/admins',
    admin: (id)=>`/api/play-admin/admins/${escaped(id)}`,
    containers: '/api/play-admin/containers',
    container: (mapId)=>`/api/play-admin/containers/${escaped(mapId)}`,
    containerResourceGroups: '/api/play-admin/container-resource-groups',
    containerResourceGroup: (id)=>`/api/play-admin/container-resource-groups/${escaped(id)}`,
    identityBans: '/api/play-admin/identity-bans',
    login: '/api/play-admin/login',
    logout: '/api/play-admin/logout',
    libraryImport: '/api/play-admin/library/import',
    libraryImportPreview: '/api/play-admin/library/import?mode=preview',
    libraryImportReview: (reviewId)=>`/api/play-admin/library/import?reviewId=${escaped(reviewId)}`,
    libraryImportConfirm: (reviewId)=>`/api/play-admin/library/import?mode=confirm&reviewId=${escaped(reviewId)}`,
    libraryImportResource: (reviewId, resourceId)=>`/api/play-admin/library/import?mode=resource&reviewId=${escaped(reviewId)}&resourceId=${escaped(resourceId)}`,
    libraryWorlds: '/api/play-admin/library/worlds',
    libraryWorld: (id)=>`/api/play-admin/library/worlds/${escaped(id)}`,
    libraryWorldStatus: '/api/play-admin/library/world-status',
    permissionGroups: '/api/play-admin/permission-groups',
    permissionGroup: (id)=>`/api/play-admin/permission-groups/${escaped(id)}`,
    player: (subjectId)=>`/api/play-admin/players/${escaped(subjectId)}`,
    players: '/api/play-admin/players',
    playerBatch: '/api/play-admin/players/batch',
    playerExport: '/api/play-admin/players/export',
    playerOverview: '/api/play-admin/players/overview',
    ownerSession: '/api/play-admin/owner-session',
    selfPassword: '/api/play-admin/self-password',
    verify: '/api/play-admin/verify'
};

const apiOperations = {
    "deleteApiCreatorModelsId": {
        "path": "/api/creator-models/{id}",
        "method": "DELETE"
    },
    "deleteApiCreatorV1ProjectsProjectIdSceneSession": {
        "path": "/api/creator/v1/projects/{projectId}/scene/session",
        "method": "DELETE"
    },
    "deleteApiCreatorV1ProjectsProjectIdStorageScopeSpace": {
        "path": "/api/creator/v1/projects/{projectId}/storage/{scope}/{space}",
        "method": "DELETE"
    },
    "deleteApiLocalModelsId": {
        "path": "/api/local/models/{id}",
        "method": "DELETE"
    },
    "deleteApiLocalProjectsId": {
        "path": "/api/local-projects/{id}",
        "method": "DELETE"
    },
    "deleteApiPlayAdminAdminsId": {
        "path": "/api/play-admin/admins/{id}",
        "method": "DELETE"
    },
    "deleteApiPlayAdminContainerResourceGroupsId": {
        "path": "/api/play-admin/container-resource-groups/{id}",
        "method": "DELETE"
    },
    "deleteApiPlayAdminContainersPermanentMapId": {
        "path": "/api/play-admin/containers/{permanentMapId}",
        "method": "DELETE"
    },
    "deleteApiPlayAdminImport": {
        "path": "/api/play-admin/import",
        "method": "DELETE"
    },
    "deleteApiPlayAdminLibraryImport": {
        "path": "/api/play-admin/library/import",
        "method": "DELETE"
    },
    "deleteApiPlayAdminLibrarySection": {
        "path": "/api/play-admin/library/{section}",
        "method": "DELETE"
    },
    "deleteApiPlayAdminLibrarySectionId": {
        "path": "/api/play-admin/library/{section}/{id}",
        "method": "DELETE"
    },
    "deleteApiPlayAdminPermissionGroupsId": {
        "path": "/api/play-admin/permission-groups/{id}",
        "method": "DELETE"
    },
    "deleteApiPlayAdminPlayersSubjectId": {
        "path": "/api/play-admin/players/{subjectId}",
        "method": "DELETE"
    },
    "deleteApiPlayAdminWorldsId": {
        "path": "/api/play-admin/worlds/{id}",
        "method": "DELETE"
    },
    "deleteApiPlayPresence": {
        "path": "/api/play-presence",
        "method": "DELETE"
    },
    "deleteApiRuntimeContainerId": {
        "path": "/api/runtime/{container_id}",
        "method": "DELETE"
    },
    "getApiAuthSession": {
        "path": "/api/auth/session",
        "method": "GET"
    },
    "getApiBackupsArchiveDownload": {
        "path": "/api/backups/{archive}/download",
        "method": "GET"
    },
    "getApiConfigSlug": {
        "path": "/api/config/{slug}",
        "method": "GET"
    },
    "getApiCreatorModels": {
        "path": "/api/creator-models",
        "method": "GET"
    },
    "getApiCreatorModelsBlobsHash": {
        "path": "/api/creator-models/blobs/{hash}",
        "method": "GET"
    },
    "getApiCreatorModelsIdExport": {
        "path": "/api/creator-models/{id}/export",
        "method": "GET"
    },
    "getApiCreatorPermissions": {
        "path": "/api/creator-permissions",
        "method": "GET"
    },
    "getApiCreatorV1Health": {
        "path": "/api/creator/v1/health",
        "method": "GET"
    },
    "getApiCreatorV1Projects": {
        "path": "/api/creator/v1/projects",
        "method": "GET"
    },
    "getApiCreatorV1ProjectsProjectIdResources": {
        "path": "/api/creator/v1/projects/{projectId}/resources",
        "method": "GET"
    },
    "getApiCreatorV1ProjectsProjectIdRuntime": {
        "path": "/api/creator/v1/projects/{projectId}/runtime",
        "method": "GET"
    },
    "getApiCreatorV1ProjectsProjectIdRuntimeEvents": {
        "path": "/api/creator/v1/projects/{projectId}/runtime/events",
        "method": "GET"
    },
    "getApiCreatorV1ProjectsProjectIdSceneAction": {
        "path": "/api/creator/v1/projects/{projectId}/scene/action",
        "method": "GET"
    },
    "getApiCreatorV1ProjectsProjectIdSceneCapture": {
        "path": "/api/creator/v1/projects/{projectId}/scene/capture",
        "method": "GET"
    },
    "getApiCreatorV1ProjectsProjectIdSceneSession": {
        "path": "/api/creator/v1/projects/{projectId}/scene/session",
        "method": "GET"
    },
    "getApiCreatorV1ProjectsProjectIdScripts": {
        "path": "/api/creator/v1/projects/{projectId}/scripts",
        "method": "GET"
    },
    "getApiCreatorV1ProjectsProjectIdScriptsSideEntry": {
        "path": "/api/creator/v1/projects/{projectId}/scripts/{side}/{entry}",
        "method": "GET"
    },
    "getApiCreatorV1ProjectsProjectIdStorageScopeSpace": {
        "path": "/api/creator/v1/projects/{projectId}/storage/{scope}/{space}",
        "method": "GET"
    },
    "getApiDiagnosticsArchiveDownload": {
        "path": "/api/diagnostics/{archive}/download",
        "method": "GET"
    },
    "getApiGetMapInfo": {
        "path": "/api/getMapInfo",
        "method": "GET"
    },
    "getApiHealth": {
        "path": "/api/health",
        "method": "GET"
    },
    "getApiHealthCheck": {
        "path": "/api/health-check",
        "method": "GET"
    },
    "getApiLocalBlobsHash": {
        "path": "/api/local/blobs/{hash}",
        "method": "GET"
    },
    "getApiLocalDefaultSkin": {
        "path": "/api/local/default-skin",
        "method": "GET"
    },
    "getApiLocalModels": {
        "path": "/api/local/models",
        "method": "GET"
    },
    "getApiLocalModelsId": {
        "path": "/api/local/models/{id}",
        "method": "GET"
    },
    "getApiLocalModelsIdExport": {
        "path": "/api/local/models/{id}/export",
        "method": "GET"
    },
    "getApiLocalModelsIdSnapshots": {
        "path": "/api/local/models/{id}/snapshots",
        "method": "GET"
    },
    "getApiLocalProjects": {
        "path": "/api/local-projects",
        "method": "GET"
    },
    "getApiLocalProjectsAssetDistribution": {
        "path": "/api/local-projects/asset-distribution",
        "method": "GET"
    },
    "getApiLocalProjectsIdExport": {
        "path": "/api/local-projects/{id}/export",
        "method": "GET"
    },
    "getApiLocalProjectsIdMaps": {
        "path": "/api/local-projects/{id}/maps",
        "method": "GET"
    },
    "getApiLocalProjectsIdRuntime": {
        "path": "/api/local-projects/{id}/runtime",
        "method": "GET"
    },
    "getApiLocalProjectsIdSnapshots": {
        "path": "/api/local-projects/{id}/snapshots",
        "method": "GET"
    },
    "getApiOperationsId": {
        "path": "/api/operations/{id}",
        "method": "GET"
    },
    "getApiPlayAdminActivity": {
        "path": "/api/play-admin/activity",
        "method": "GET"
    },
    "getApiPlayAdminAdmins": {
        "path": "/api/play-admin/admins",
        "method": "GET"
    },
    "getApiPlayAdminContainerResourceGroups": {
        "path": "/api/play-admin/container-resource-groups",
        "method": "GET"
    },
    "getApiPlayAdminContainers": {
        "path": "/api/play-admin/containers",
        "method": "GET"
    },
    "getApiPlayAdminIdentityBans": {
        "path": "/api/play-admin/identity-bans",
        "method": "GET"
    },
    "getApiPlayAdminImport": {
        "path": "/api/play-admin/import",
        "method": "GET"
    },
    "getApiPlayAdminImportResource": {
        "path": "/api/play-admin/import-resource",
        "method": "GET"
    },
    "getApiPlayAdminLibraryImport": {
        "path": "/api/play-admin/library/import",
        "method": "GET"
    },
    "getApiPlayAdminLibrarySection": {
        "path": "/api/play-admin/library/{section}",
        "method": "GET"
    },
    "getApiPlayAdminLibrarySectionId": {
        "path": "/api/play-admin/library/{section}/{id}",
        "method": "GET"
    },
    "getApiPlayAdminPermissionGroups": {
        "path": "/api/play-admin/permission-groups",
        "method": "GET"
    },
    "getApiPlayAdminPlayers": {
        "path": "/api/play-admin/players",
        "method": "GET"
    },
    "getApiPlayAdminPlayersExport": {
        "path": "/api/play-admin/players/export",
        "method": "GET"
    },
    "getApiPlayAdminPlayersOverview": {
        "path": "/api/play-admin/players/overview",
        "method": "GET"
    },
    "getApiPlayAdminPlayersSubjectId": {
        "path": "/api/play-admin/players/{subjectId}",
        "method": "GET"
    },
    "getApiPlayAdminScriptModeration": {
        "path": "/api/play-admin/script-moderation",
        "method": "GET"
    },
    "getApiPlayAdminStatus": {
        "path": "/api/play-admin/status",
        "method": "GET"
    },
    "getApiPlayAdminVerify": {
        "path": "/api/play-admin/verify",
        "method": "GET"
    },
    "getApiPlayAdminWorlds": {
        "path": "/api/play-admin/worlds",
        "method": "GET"
    },
    "getApiPlayAdminWorldsStatus": {
        "path": "/api/play-admin/worlds/status",
        "method": "GET"
    },
    "getApiPlayerAuthLoginRequired": {
        "path": "/api/player-auth/login-required",
        "method": "GET"
    },
    "getApiPlayerAuthSession": {
        "path": "/api/player-auth/session",
        "method": "GET"
    },
    "getApiPlayerInternalMapLibrary": {
        "path": "/api/player-internal/map-library",
        "method": "GET"
    },
    "getApiPlayerInternalRevocations": {
        "path": "/api/player-internal/revocations",
        "method": "GET"
    },
    "getApiPlayerLauncherBootstrap": {
        "path": "/api/player-launcher/bootstrap",
        "method": "GET"
    },
    "getApiPlayerLauncherMaps": {
        "path": "/api/player-launcher/maps",
        "method": "GET"
    },
    "getApiPlayerLauncherMapsMapIdDescriptor": {
        "path": "/api/player-launcher/maps/{mapId}/descriptor",
        "method": "GET"
    },
    "getApiPlayerLauncherMapsMapIdDownloadPlan": {
        "path": "/api/player-launcher/maps/{mapId}/download-plan",
        "method": "GET"
    },
    "getApiPlayerLoginCallback": {
        "path": "/api/player-login/callback",
        "method": "GET"
    },
    "getApiPlayerLoginStart": {
        "path": "/api/player-login/start",
        "method": "GET"
    },
    "getApiPlayLibrary": {
        "path": "/api/play-library",
        "method": "GET"
    },
    "getApiPlayPresence": {
        "path": "/api/play-presence",
        "method": "GET"
    },
    "getApiPlayResourceCacheWorld": {
        "path": "/api/play-resource-cache/{world}",
        "method": "GET"
    },
    "getApiPlayWorlds": {
        "path": "/api/play-worlds",
        "method": "GET"
    },
    "getApiProjectModels": {
        "path": "/api/project-models",
        "method": "GET"
    },
    "getApiProjectSkinPreviews": {
        "path": "/api/project-skin-previews",
        "method": "GET"
    },
    "getApiProjectSkins": {
        "path": "/api/project-skins",
        "method": "GET"
    },
    "getApiRuntimeContainerIdStats": {
        "path": "/api/runtime/{container_id}/stats",
        "method": "GET"
    },
    "getApiServerInfo": {
        "path": "/api/server-info",
        "method": "GET"
    },
    "getApiSession": {
        "path": "/api/session",
        "method": "GET"
    },
    "getApiSystemBackups": {
        "path": "/api/system/backups",
        "method": "GET"
    },
    "getApiSystemBackupsProjectIdName": {
        "path": "/api/system/backups/{projectId}/{name}",
        "method": "GET"
    },
    "getApiSystemStatus": {
        "path": "/api/system/status",
        "method": "GET"
    },
    "getBlockHash": {
        "path": "/block/{hash}",
        "method": "GET"
    },
    "getInternalCreatorPreviewRuntime": {
        "path": "/internal/creator-preview-runtime",
        "method": "GET"
    },
    "getInternalCreatorPreviewRuntimeEvents": {
        "path": "/internal/creator-preview-runtime/events",
        "method": "GET"
    },
    "getLocalRuntimeStatus": {
        "path": "/__local_runtime/status",
        "method": "GET"
    },
    "patchApiAuthProfile": {
        "path": "/api/auth/profile",
        "method": "PATCH"
    },
    "patchApiCreatorProfile": {
        "path": "/api/creator-profile",
        "method": "PATCH"
    },
    "patchApiLocalProjectsAssetDistribution": {
        "path": "/api/local-projects/asset-distribution",
        "method": "PATCH"
    },
    "patchApiLocalProjectsId": {
        "path": "/api/local-projects/{id}",
        "method": "PATCH"
    },
    "patchApiPlayAdminAdminsId": {
        "path": "/api/play-admin/admins/{id}",
        "method": "PATCH"
    },
    "patchApiPlayAdminContainerResourceGroupsId": {
        "path": "/api/play-admin/container-resource-groups/{id}",
        "method": "PATCH"
    },
    "patchApiPlayAdminLibrarySection": {
        "path": "/api/play-admin/library/{section}",
        "method": "PATCH"
    },
    "patchApiPlayAdminLibrarySectionId": {
        "path": "/api/play-admin/library/{section}/{id}",
        "method": "PATCH"
    },
    "patchApiPlayAdminPermissionGroupsId": {
        "path": "/api/play-admin/permission-groups/{id}",
        "method": "PATCH"
    },
    "patchApiPlayAdminPlayersSubjectId": {
        "path": "/api/play-admin/players/{subjectId}",
        "method": "PATCH"
    },
    "patchApiPlayAdminWorldsId": {
        "path": "/api/play-admin/worlds/{id}",
        "method": "PATCH"
    },
    "patchApiPlayerAuthProfile": {
        "path": "/api/player-auth/profile",
        "method": "PATCH"
    },
    "patchApiPlayerInternalMapLibrary": {
        "path": "/api/player-internal/map-library",
        "method": "PATCH"
    },
    "patchApiPlayerInternalProfile": {
        "path": "/api/player-internal/profile",
        "method": "PATCH"
    },
    "patchApiPlayLibrary": {
        "path": "/api/play-library",
        "method": "PATCH"
    },
    "patchApiPlayProfile": {
        "path": "/api/play-profile",
        "method": "PATCH"
    },
    "postApiAuthLogin": {
        "path": "/api/auth/login",
        "method": "POST"
    },
    "postApiAuthLogout": {
        "path": "/api/auth/logout",
        "method": "POST"
    },
    "postApiAuthPassword": {
        "path": "/api/auth/password",
        "method": "POST"
    },
    "postApiAuthRegister": {
        "path": "/api/auth/register",
        "method": "POST"
    },
    "postApiBackupsUpload": {
        "path": "/api/backups/upload",
        "method": "POST"
    },
    "postApiCommandsName": {
        "path": "/api/commands/{name}",
        "method": "POST"
    },
    "postApiCreateSession": {
        "path": "/api/createSession",
        "method": "POST"
    },
    "postApiCreatorLogout": {
        "path": "/api/creator-logout",
        "method": "POST"
    },
    "postApiCreatorModelsImport": {
        "path": "/api/creator-models/import",
        "method": "POST"
    },
    "postApiCreatorV1ProjectsProjectIdRuntime": {
        "path": "/api/creator/v1/projects/{projectId}/runtime",
        "method": "POST"
    },
    "postApiCreatorV1ProjectsProjectIdSceneActionsRequestId": {
        "path": "/api/creator/v1/projects/{projectId}/scene/actions/{requestId}",
        "method": "POST"
    },
    "postApiCreatorV1ProjectsProjectIdSceneSession": {
        "path": "/api/creator/v1/projects/{projectId}/scene/session",
        "method": "POST"
    },
    "postApiLocalBlob": {
        "path": "/api/local/blob",
        "method": "POST"
    },
    "postApiLocalModels": {
        "path": "/api/local/models",
        "method": "POST"
    },
    "postApiLocalModelsImport": {
        "path": "/api/local/models/import",
        "method": "POST"
    },
    "postApiLocalProjects": {
        "path": "/api/local-projects",
        "method": "POST"
    },
    "postApiLocalProjectsIdMaps": {
        "path": "/api/local-projects/{id}/maps",
        "method": "POST"
    },
    "postApiLocalProjectsIdPackage": {
        "path": "/api/local-projects/{id}/package",
        "method": "POST"
    },
    "postApiLocalProjectsIdPublish": {
        "path": "/api/local-projects/{id}/publish",
        "method": "POST"
    },
    "postApiLocalProjectsIdRuntime": {
        "path": "/api/local-projects/{id}/runtime",
        "method": "POST"
    },
    "postApiLocalProjectsIdSnapshots": {
        "path": "/api/local-projects/{id}/snapshots",
        "method": "POST"
    },
    "postApiLocalProjectsImport": {
        "path": "/api/local-projects/import",
        "method": "POST"
    },
    "postApiPlayAdminAdmins": {
        "path": "/api/play-admin/admins",
        "method": "POST"
    },
    "postApiPlayAdminContainerResourceGroups": {
        "path": "/api/play-admin/container-resource-groups",
        "method": "POST"
    },
    "postApiPlayAdminContainers": {
        "path": "/api/play-admin/containers",
        "method": "POST"
    },
    "postApiPlayAdminIdentityBans": {
        "path": "/api/play-admin/identity-bans",
        "method": "POST"
    },
    "postApiPlayAdminImport": {
        "path": "/api/play-admin/import",
        "method": "POST"
    },
    "postApiPlayAdminLibraryImport": {
        "path": "/api/play-admin/library/import",
        "method": "POST"
    },
    "postApiPlayAdminLibrarySection": {
        "path": "/api/play-admin/library/{section}",
        "method": "POST"
    },
    "postApiPlayAdminLibrarySectionId": {
        "path": "/api/play-admin/library/{section}/{id}",
        "method": "POST"
    },
    "postApiPlayAdminLogin": {
        "path": "/api/play-admin/login",
        "method": "POST"
    },
    "postApiPlayAdminLogout": {
        "path": "/api/play-admin/logout",
        "method": "POST"
    },
    "postApiPlayAdminMaintenance": {
        "path": "/api/play-admin/maintenance",
        "method": "POST"
    },
    "postApiPlayAdminOwnerSession": {
        "path": "/api/play-admin/owner-session",
        "method": "POST"
    },
    "postApiPlayAdminPermissionGroups": {
        "path": "/api/play-admin/permission-groups",
        "method": "POST"
    },
    "postApiPlayAdminPlayers": {
        "path": "/api/play-admin/players",
        "method": "POST"
    },
    "postApiPlayAdminPlayersBatch": {
        "path": "/api/play-admin/players/batch",
        "method": "POST"
    },
    "postApiPlayAdminPlayersSubjectId": {
        "path": "/api/play-admin/players/{subjectId}",
        "method": "POST"
    },
    "postApiPlayAdminScriptModeration": {
        "path": "/api/play-admin/script-moderation",
        "method": "POST"
    },
    "postApiPlayAdminSelfPassword": {
        "path": "/api/play-admin/self-password",
        "method": "POST"
    },
    "postApiPlayAdminVerify": {
        "path": "/api/play-admin/verify",
        "method": "POST"
    },
    "postApiPlayerAuthLogin": {
        "path": "/api/player-auth/login",
        "method": "POST"
    },
    "postApiPlayerAuthLogout": {
        "path": "/api/player-auth/logout",
        "method": "POST"
    },
    "postApiPlayerAuthPassword": {
        "path": "/api/player-auth/password",
        "method": "POST"
    },
    "postApiPlayerAuthRegister": {
        "path": "/api/player-auth/register",
        "method": "POST"
    },
    "postApiPlayerAuthTransfer": {
        "path": "/api/player-auth/transfer",
        "method": "POST"
    },
    "postApiPlayerInternalLoginTransfer": {
        "path": "/api/player-internal/login-transfer",
        "method": "POST"
    },
    "postApiPlayerInternalLogout": {
        "path": "/api/player-internal/logout",
        "method": "POST"
    },
    "postApiPlayerInternalMapAdmission": {
        "path": "/api/player-internal/map-admission",
        "method": "POST"
    },
    "postApiPlayerInternalRuntimeIdentity": {
        "path": "/api/player-internal/runtime-identity",
        "method": "POST"
    },
    "postApiPlayerInternalScriptMetadata": {
        "path": "/api/player-internal/script-metadata",
        "method": "POST"
    },
    "postApiPlayerInternalScriptModeration": {
        "path": "/api/player-internal/script-moderation",
        "method": "POST"
    },
    "postApiPlayLogout": {
        "path": "/api/play-logout",
        "method": "POST"
    },
    "postApiPlayPresence": {
        "path": "/api/play-presence",
        "method": "POST"
    },
    "postApiProjectModels": {
        "path": "/api/project-models",
        "method": "POST"
    },
    "postApiProjectScripts": {
        "path": "/api/project-scripts",
        "method": "POST"
    },
    "postApiProjectSkins": {
        "path": "/api/project-skins",
        "method": "POST"
    },
    "postApiRealtimeSession": {
        "path": "/api/realtime/session",
        "method": "POST"
    },
    "postApiRuntimeEnsure": {
        "path": "/api/runtime/ensure",
        "method": "POST"
    },
    "postApiSystemBackups": {
        "path": "/api/system/backups",
        "method": "POST"
    },
    "postBlock": {
        "path": "/block",
        "method": "POST"
    },
    "postBlockHash": {
        "path": "/block/{hash}",
        "method": "POST"
    },
    "postCreateSession": {
        "path": "/createSession",
        "method": "POST"
    },
    "postInternalSaveLocalProject": {
        "path": "/internal/save-local-project",
        "method": "POST"
    },
    "postLocalRuntimeDestroy": {
        "path": "/__local_runtime/destroy",
        "method": "POST"
    },
    "postLocalRuntimeStart": {
        "path": "/__local_runtime/start",
        "method": "POST"
    },
    "postRoomRoomIdLocalRuntimeDestroy": {
        "path": "/__room/{roomId}/__local_runtime/destroy",
        "method": "POST"
    },
    "putApiCreatorModelsId": {
        "path": "/api/creator-models/{id}",
        "method": "PUT"
    },
    "putApiCreatorV1ProjectsProjectIdScriptsSideEntry": {
        "path": "/api/creator/v1/projects/{projectId}/scripts/{side}/{entry}",
        "method": "PUT"
    },
    "putApiCreatorV1ProjectsProjectIdStorageScopeSpace": {
        "path": "/api/creator/v1/projects/{projectId}/storage/{scope}/{space}",
        "method": "PUT"
    },
    "putApiLocalDefaultSkin": {
        "path": "/api/local/default-skin",
        "method": "PUT"
    },
    "putApiLocalModelsId": {
        "path": "/api/local/models/{id}",
        "method": "PUT"
    }
};
class ApiClientError extends Error {
    constructor(message, response, details){
        super(message);
        this.response = response;
        this.details = details;
        this.name = 'ApiClientError';
    }
}
class ApiClient {
    async unwrap(pending) {
        const result = await pending;
        if (result.error !== undefined || !result.response.ok) {
            const details = result.error;
            const message = typeof details === 'string' && details.trim() ? details : details && typeof details === 'object' && 'message' in details && typeof details.message === 'string' ? details.message : details && typeof details === 'object' && 'msg' in details && typeof details.msg === 'string' ? details.msg : this.defaultErrorMessage;
            throw new ApiClientError(message, result.response, details);
        }
        return result.data;
    }
    deleteApiCreatorModelsIdRaw(...init) {
        return this.paths["/api/creator-models/{id}"].DELETE(...init);
    }
    deleteApiCreatorModelsId(...init) {
        return this.unwrap(this.deleteApiCreatorModelsIdRaw(...init));
    }
    deleteApiCreatorV1ProjectsProjectIdSceneSessionRaw(...init) {
        return this.paths["/api/creator/v1/projects/{projectId}/scene/session"].DELETE(...init);
    }
    deleteApiCreatorV1ProjectsProjectIdSceneSession(...init) {
        return this.unwrap(this.deleteApiCreatorV1ProjectsProjectIdSceneSessionRaw(...init));
    }
    deleteApiCreatorV1ProjectsProjectIdStorageScopeSpaceRaw(...init) {
        return this.paths["/api/creator/v1/projects/{projectId}/storage/{scope}/{space}"].DELETE(...init);
    }
    deleteApiCreatorV1ProjectsProjectIdStorageScopeSpace(...init) {
        return this.unwrap(this.deleteApiCreatorV1ProjectsProjectIdStorageScopeSpaceRaw(...init));
    }
    deleteApiLocalModelsIdRaw(...init) {
        return this.paths["/api/local/models/{id}"].DELETE(...init);
    }
    deleteApiLocalModelsId(...init) {
        return this.unwrap(this.deleteApiLocalModelsIdRaw(...init));
    }
    deleteApiLocalProjectsIdRaw(...init) {
        return this.paths["/api/local-projects/{id}"].DELETE(...init);
    }
    deleteApiLocalProjectsId(...init) {
        return this.unwrap(this.deleteApiLocalProjectsIdRaw(...init));
    }
    deleteApiPlayAdminAdminsIdRaw(...init) {
        return this.paths["/api/play-admin/admins/{id}"].DELETE(...init);
    }
    deleteApiPlayAdminAdminsId(...init) {
        return this.unwrap(this.deleteApiPlayAdminAdminsIdRaw(...init));
    }
    deleteApiPlayAdminContainerResourceGroupsIdRaw(...init) {
        return this.paths["/api/play-admin/container-resource-groups/{id}"].DELETE(...init);
    }
    deleteApiPlayAdminContainerResourceGroupsId(...init) {
        return this.unwrap(this.deleteApiPlayAdminContainerResourceGroupsIdRaw(...init));
    }
    deleteApiPlayAdminContainersPermanentMapIdRaw(...init) {
        return this.paths["/api/play-admin/containers/{permanentMapId}"].DELETE(...init);
    }
    deleteApiPlayAdminContainersPermanentMapId(...init) {
        return this.unwrap(this.deleteApiPlayAdminContainersPermanentMapIdRaw(...init));
    }
    deleteApiPlayAdminImportRaw(...init) {
        return this.paths["/api/play-admin/import"].DELETE(...init);
    }
    deleteApiPlayAdminImport(...init) {
        return this.unwrap(this.deleteApiPlayAdminImportRaw(...init));
    }
    deleteApiPlayAdminLibraryImportRaw(...init) {
        return this.paths["/api/play-admin/library/import"].DELETE(...init);
    }
    deleteApiPlayAdminLibraryImport(...init) {
        return this.unwrap(this.deleteApiPlayAdminLibraryImportRaw(...init));
    }
    deleteApiPlayAdminLibrarySectionRaw(...init) {
        return this.paths["/api/play-admin/library/{section}"].DELETE(...init);
    }
    deleteApiPlayAdminLibrarySection(...init) {
        return this.unwrap(this.deleteApiPlayAdminLibrarySectionRaw(...init));
    }
    deleteApiPlayAdminLibrarySectionIdRaw(...init) {
        return this.paths["/api/play-admin/library/{section}/{id}"].DELETE(...init);
    }
    deleteApiPlayAdminLibrarySectionId(...init) {
        return this.unwrap(this.deleteApiPlayAdminLibrarySectionIdRaw(...init));
    }
    deleteApiPlayAdminPermissionGroupsIdRaw(...init) {
        return this.paths["/api/play-admin/permission-groups/{id}"].DELETE(...init);
    }
    deleteApiPlayAdminPermissionGroupsId(...init) {
        return this.unwrap(this.deleteApiPlayAdminPermissionGroupsIdRaw(...init));
    }
    deleteApiPlayAdminPlayersSubjectIdRaw(...init) {
        return this.paths["/api/play-admin/players/{subjectId}"].DELETE(...init);
    }
    deleteApiPlayAdminPlayersSubjectId(...init) {
        return this.unwrap(this.deleteApiPlayAdminPlayersSubjectIdRaw(...init));
    }
    deleteApiPlayAdminWorldsIdRaw(...init) {
        return this.paths["/api/play-admin/worlds/{id}"].DELETE(...init);
    }
    deleteApiPlayAdminWorldsId(...init) {
        return this.unwrap(this.deleteApiPlayAdminWorldsIdRaw(...init));
    }
    deleteApiPlayPresenceRaw(...init) {
        return this.paths["/api/play-presence"].DELETE(...init);
    }
    deleteApiPlayPresence(...init) {
        return this.unwrap(this.deleteApiPlayPresenceRaw(...init));
    }
    deleteApiRuntimeContainerIdRaw(...init) {
        return this.paths["/api/runtime/{container_id}"].DELETE(...init);
    }
    deleteApiRuntimeContainerId(...init) {
        return this.unwrap(this.deleteApiRuntimeContainerIdRaw(...init));
    }
    getApiAuthSessionRaw(...init) {
        return this.paths["/api/auth/session"].GET(...init);
    }
    getApiAuthSession(...init) {
        return this.unwrap(this.getApiAuthSessionRaw(...init));
    }
    getApiBackupsArchiveDownloadRaw(...init) {
        return this.paths["/api/backups/{archive}/download"].GET(...init);
    }
    getApiBackupsArchiveDownload(...init) {
        return this.unwrap(this.getApiBackupsArchiveDownloadRaw(...init));
    }
    getApiConfigSlugRaw(...init) {
        return this.paths["/api/config/{slug}"].GET(...init);
    }
    getApiConfigSlug(...init) {
        return this.unwrap(this.getApiConfigSlugRaw(...init));
    }
    getApiCreatorModelsRaw(...init) {
        return this.paths["/api/creator-models"].GET(...init);
    }
    getApiCreatorModels(...init) {
        return this.unwrap(this.getApiCreatorModelsRaw(...init));
    }
    getApiCreatorModelsBlobsHashRaw(...init) {
        return this.paths["/api/creator-models/blobs/{hash}"].GET(...init);
    }
    getApiCreatorModelsBlobsHash(...init) {
        return this.unwrap(this.getApiCreatorModelsBlobsHashRaw(...init));
    }
    getApiCreatorModelsIdExportRaw(...init) {
        return this.paths["/api/creator-models/{id}/export"].GET(...init);
    }
    getApiCreatorModelsIdExport(...init) {
        return this.unwrap(this.getApiCreatorModelsIdExportRaw(...init));
    }
    getApiCreatorPermissionsRaw(...init) {
        return this.paths["/api/creator-permissions"].GET(...init);
    }
    getApiCreatorPermissions(...init) {
        return this.unwrap(this.getApiCreatorPermissionsRaw(...init));
    }
    getApiCreatorV1HealthRaw(...init) {
        return this.paths["/api/creator/v1/health"].GET(...init);
    }
    getApiCreatorV1Health(...init) {
        return this.unwrap(this.getApiCreatorV1HealthRaw(...init));
    }
    getApiCreatorV1ProjectsRaw(...init) {
        return this.paths["/api/creator/v1/projects"].GET(...init);
    }
    getApiCreatorV1Projects(...init) {
        return this.unwrap(this.getApiCreatorV1ProjectsRaw(...init));
    }
    getApiCreatorV1ProjectsProjectIdResourcesRaw(...init) {
        return this.paths["/api/creator/v1/projects/{projectId}/resources"].GET(...init);
    }
    getApiCreatorV1ProjectsProjectIdResources(...init) {
        return this.unwrap(this.getApiCreatorV1ProjectsProjectIdResourcesRaw(...init));
    }
    getApiCreatorV1ProjectsProjectIdRuntimeRaw(...init) {
        return this.paths["/api/creator/v1/projects/{projectId}/runtime"].GET(...init);
    }
    getApiCreatorV1ProjectsProjectIdRuntime(...init) {
        return this.unwrap(this.getApiCreatorV1ProjectsProjectIdRuntimeRaw(...init));
    }
    getApiCreatorV1ProjectsProjectIdRuntimeEventsRaw(...init) {
        return this.paths["/api/creator/v1/projects/{projectId}/runtime/events"].GET(...init);
    }
    getApiCreatorV1ProjectsProjectIdRuntimeEvents(...init) {
        return this.unwrap(this.getApiCreatorV1ProjectsProjectIdRuntimeEventsRaw(...init));
    }
    getApiCreatorV1ProjectsProjectIdSceneActionRaw(...init) {
        return this.paths["/api/creator/v1/projects/{projectId}/scene/action"].GET(...init);
    }
    getApiCreatorV1ProjectsProjectIdSceneAction(...init) {
        return this.unwrap(this.getApiCreatorV1ProjectsProjectIdSceneActionRaw(...init));
    }
    getApiCreatorV1ProjectsProjectIdSceneCaptureRaw(...init) {
        return this.paths["/api/creator/v1/projects/{projectId}/scene/capture"].GET(...init);
    }
    getApiCreatorV1ProjectsProjectIdSceneCapture(...init) {
        return this.unwrap(this.getApiCreatorV1ProjectsProjectIdSceneCaptureRaw(...init));
    }
    getApiCreatorV1ProjectsProjectIdSceneSessionRaw(...init) {
        return this.paths["/api/creator/v1/projects/{projectId}/scene/session"].GET(...init);
    }
    getApiCreatorV1ProjectsProjectIdSceneSession(...init) {
        return this.unwrap(this.getApiCreatorV1ProjectsProjectIdSceneSessionRaw(...init));
    }
    getApiCreatorV1ProjectsProjectIdScriptsRaw(...init) {
        return this.paths["/api/creator/v1/projects/{projectId}/scripts"].GET(...init);
    }
    getApiCreatorV1ProjectsProjectIdScripts(...init) {
        return this.unwrap(this.getApiCreatorV1ProjectsProjectIdScriptsRaw(...init));
    }
    getApiCreatorV1ProjectsProjectIdScriptsSideEntryRaw(...init) {
        return this.paths["/api/creator/v1/projects/{projectId}/scripts/{side}/{entry}"].GET(...init);
    }
    getApiCreatorV1ProjectsProjectIdScriptsSideEntry(...init) {
        return this.unwrap(this.getApiCreatorV1ProjectsProjectIdScriptsSideEntryRaw(...init));
    }
    getApiCreatorV1ProjectsProjectIdStorageScopeSpaceRaw(...init) {
        return this.paths["/api/creator/v1/projects/{projectId}/storage/{scope}/{space}"].GET(...init);
    }
    getApiCreatorV1ProjectsProjectIdStorageScopeSpace(...init) {
        return this.unwrap(this.getApiCreatorV1ProjectsProjectIdStorageScopeSpaceRaw(...init));
    }
    getApiDiagnosticsArchiveDownloadRaw(...init) {
        return this.paths["/api/diagnostics/{archive}/download"].GET(...init);
    }
    getApiDiagnosticsArchiveDownload(...init) {
        return this.unwrap(this.getApiDiagnosticsArchiveDownloadRaw(...init));
    }
    getApiGetMapInfoRaw(...init) {
        return this.paths["/api/getMapInfo"].GET(...init);
    }
    getApiGetMapInfo(...init) {
        return this.unwrap(this.getApiGetMapInfoRaw(...init));
    }
    getApiHealthRaw(...init) {
        return this.paths["/api/health"].GET(...init);
    }
    getApiHealth(...init) {
        return this.unwrap(this.getApiHealthRaw(...init));
    }
    getApiHealthCheckRaw(...init) {
        return this.paths["/api/health-check"].GET(...init);
    }
    getApiHealthCheck(...init) {
        return this.unwrap(this.getApiHealthCheckRaw(...init));
    }
    getApiLocalBlobsHashRaw(...init) {
        return this.paths["/api/local/blobs/{hash}"].GET(...init);
    }
    getApiLocalBlobsHash(...init) {
        return this.unwrap(this.getApiLocalBlobsHashRaw(...init));
    }
    getApiLocalDefaultSkinRaw(...init) {
        return this.paths["/api/local/default-skin"].GET(...init);
    }
    getApiLocalDefaultSkin(...init) {
        return this.unwrap(this.getApiLocalDefaultSkinRaw(...init));
    }
    getApiLocalModelsRaw(...init) {
        return this.paths["/api/local/models"].GET(...init);
    }
    getApiLocalModels(...init) {
        return this.unwrap(this.getApiLocalModelsRaw(...init));
    }
    getApiLocalModelsIdRaw(...init) {
        return this.paths["/api/local/models/{id}"].GET(...init);
    }
    getApiLocalModelsId(...init) {
        return this.unwrap(this.getApiLocalModelsIdRaw(...init));
    }
    getApiLocalModelsIdExportRaw(...init) {
        return this.paths["/api/local/models/{id}/export"].GET(...init);
    }
    getApiLocalModelsIdExport(...init) {
        return this.unwrap(this.getApiLocalModelsIdExportRaw(...init));
    }
    getApiLocalModelsIdSnapshotsRaw(...init) {
        return this.paths["/api/local/models/{id}/snapshots"].GET(...init);
    }
    getApiLocalModelsIdSnapshots(...init) {
        return this.unwrap(this.getApiLocalModelsIdSnapshotsRaw(...init));
    }
    getApiLocalProjectsRaw(...init) {
        return this.paths["/api/local-projects"].GET(...init);
    }
    getApiLocalProjects(...init) {
        return this.unwrap(this.getApiLocalProjectsRaw(...init));
    }
    getApiLocalProjectsAssetDistributionRaw(...init) {
        return this.paths["/api/local-projects/asset-distribution"].GET(...init);
    }
    getApiLocalProjectsAssetDistribution(...init) {
        return this.unwrap(this.getApiLocalProjectsAssetDistributionRaw(...init));
    }
    getApiLocalProjectsIdExportRaw(...init) {
        return this.paths["/api/local-projects/{id}/export"].GET(...init);
    }
    getApiLocalProjectsIdExport(...init) {
        return this.unwrap(this.getApiLocalProjectsIdExportRaw(...init));
    }
    getApiLocalProjectsIdMapsRaw(...init) {
        return this.paths["/api/local-projects/{id}/maps"].GET(...init);
    }
    getApiLocalProjectsIdMaps(...init) {
        return this.unwrap(this.getApiLocalProjectsIdMapsRaw(...init));
    }
    getApiLocalProjectsIdRuntimeRaw(...init) {
        return this.paths["/api/local-projects/{id}/runtime"].GET(...init);
    }
    getApiLocalProjectsIdRuntime(...init) {
        return this.unwrap(this.getApiLocalProjectsIdRuntimeRaw(...init));
    }
    getApiLocalProjectsIdSnapshotsRaw(...init) {
        return this.paths["/api/local-projects/{id}/snapshots"].GET(...init);
    }
    getApiLocalProjectsIdSnapshots(...init) {
        return this.unwrap(this.getApiLocalProjectsIdSnapshotsRaw(...init));
    }
    getApiOperationsIdRaw(...init) {
        return this.paths["/api/operations/{id}"].GET(...init);
    }
    getApiOperationsId(...init) {
        return this.unwrap(this.getApiOperationsIdRaw(...init));
    }
    getApiPlayAdminActivityRaw(...init) {
        return this.paths["/api/play-admin/activity"].GET(...init);
    }
    getApiPlayAdminActivity(...init) {
        return this.unwrap(this.getApiPlayAdminActivityRaw(...init));
    }
    getApiPlayAdminAdminsRaw(...init) {
        return this.paths["/api/play-admin/admins"].GET(...init);
    }
    getApiPlayAdminAdmins(...init) {
        return this.unwrap(this.getApiPlayAdminAdminsRaw(...init));
    }
    getApiPlayAdminContainerResourceGroupsRaw(...init) {
        return this.paths["/api/play-admin/container-resource-groups"].GET(...init);
    }
    getApiPlayAdminContainerResourceGroups(...init) {
        return this.unwrap(this.getApiPlayAdminContainerResourceGroupsRaw(...init));
    }
    getApiPlayAdminContainersRaw(...init) {
        return this.paths["/api/play-admin/containers"].GET(...init);
    }
    getApiPlayAdminContainers(...init) {
        return this.unwrap(this.getApiPlayAdminContainersRaw(...init));
    }
    getApiPlayAdminIdentityBansRaw(...init) {
        return this.paths["/api/play-admin/identity-bans"].GET(...init);
    }
    getApiPlayAdminIdentityBans(...init) {
        return this.unwrap(this.getApiPlayAdminIdentityBansRaw(...init));
    }
    getApiPlayAdminImportRaw(...init) {
        return this.paths["/api/play-admin/import"].GET(...init);
    }
    getApiPlayAdminImport(...init) {
        return this.unwrap(this.getApiPlayAdminImportRaw(...init));
    }
    getApiPlayAdminImportResourceRaw(...init) {
        return this.paths["/api/play-admin/import-resource"].GET(...init);
    }
    getApiPlayAdminImportResource(...init) {
        return this.unwrap(this.getApiPlayAdminImportResourceRaw(...init));
    }
    getApiPlayAdminLibraryImportRaw(...init) {
        // Preserve parseAs when callers download text or binary resources.
        return this.paths["/api/play-admin/library/import"].GET(...init);
    }
    getApiPlayAdminLibraryImport(...init) {
        return this.unwrap(this.getApiPlayAdminLibraryImportRaw(...init));
    }
    getApiPlayAdminLibrarySectionRaw(...init) {
        return this.paths["/api/play-admin/library/{section}"].GET(...init);
    }
    getApiPlayAdminLibrarySection(...init) {
        return this.unwrap(this.getApiPlayAdminLibrarySectionRaw(...init));
    }
    getApiPlayAdminLibrarySectionIdRaw(...init) {
        return this.paths["/api/play-admin/library/{section}/{id}"].GET(...init);
    }
    getApiPlayAdminLibrarySectionId(...init) {
        return this.unwrap(this.getApiPlayAdminLibrarySectionIdRaw(...init));
    }
    getApiPlayAdminPermissionGroupsRaw(...init) {
        return this.paths["/api/play-admin/permission-groups"].GET(...init);
    }
    getApiPlayAdminPermissionGroups(...init) {
        return this.unwrap(this.getApiPlayAdminPermissionGroupsRaw(...init));
    }
    getApiPlayAdminPlayersRaw(...init) {
        return this.paths["/api/play-admin/players"].GET(...init);
    }
    getApiPlayAdminPlayers(...init) {
        return this.unwrap(this.getApiPlayAdminPlayersRaw(...init));
    }
    getApiPlayAdminPlayersExportRaw(...init) {
        // Preserve parseAs when callers download text or binary resources.
        return this.paths["/api/play-admin/players/export"].GET(...init);
    }
    getApiPlayAdminPlayersExport(...init) {
        return this.unwrap(this.getApiPlayAdminPlayersExportRaw(...init));
    }
    getApiPlayAdminPlayersOverviewRaw(...init) {
        return this.paths["/api/play-admin/players/overview"].GET(...init);
    }
    getApiPlayAdminPlayersOverview(...init) {
        return this.unwrap(this.getApiPlayAdminPlayersOverviewRaw(...init));
    }
    getApiPlayAdminPlayersSubjectIdRaw(...init) {
        return this.paths["/api/play-admin/players/{subjectId}"].GET(...init);
    }
    getApiPlayAdminPlayersSubjectId(...init) {
        return this.unwrap(this.getApiPlayAdminPlayersSubjectIdRaw(...init));
    }
    getApiPlayAdminScriptModerationRaw(...init) {
        return this.paths["/api/play-admin/script-moderation"].GET(...init);
    }
    getApiPlayAdminScriptModeration(...init) {
        return this.unwrap(this.getApiPlayAdminScriptModerationRaw(...init));
    }
    getApiPlayAdminStatusRaw(...init) {
        return this.paths["/api/play-admin/status"].GET(...init);
    }
    getApiPlayAdminStatus(...init) {
        return this.unwrap(this.getApiPlayAdminStatusRaw(...init));
    }
    getApiPlayAdminVerifyRaw(...init) {
        return this.paths["/api/play-admin/verify"].GET(...init);
    }
    getApiPlayAdminVerify(...init) {
        return this.unwrap(this.getApiPlayAdminVerifyRaw(...init));
    }
    getApiPlayAdminWorldsRaw(...init) {
        return this.paths["/api/play-admin/worlds"].GET(...init);
    }
    getApiPlayAdminWorlds(...init) {
        return this.unwrap(this.getApiPlayAdminWorldsRaw(...init));
    }
    getApiPlayAdminWorldsStatusRaw(...init) {
        return this.paths["/api/play-admin/worlds/status"].GET(...init);
    }
    getApiPlayAdminWorldsStatus(...init) {
        return this.unwrap(this.getApiPlayAdminWorldsStatusRaw(...init));
    }
    getApiPlayerAuthLoginRequiredRaw(...init) {
        return this.paths["/api/player-auth/login-required"].GET(...init);
    }
    getApiPlayerAuthLoginRequired(...init) {
        return this.unwrap(this.getApiPlayerAuthLoginRequiredRaw(...init));
    }
    getApiPlayerAuthSessionRaw(...init) {
        return this.paths["/api/player-auth/session"].GET(...init);
    }
    getApiPlayerAuthSession(...init) {
        return this.unwrap(this.getApiPlayerAuthSessionRaw(...init));
    }
    getApiPlayerInternalMapLibraryRaw(...init) {
        return this.paths["/api/player-internal/map-library"].GET(...init);
    }
    getApiPlayerInternalMapLibrary(...init) {
        return this.unwrap(this.getApiPlayerInternalMapLibraryRaw(...init));
    }
    getApiPlayerInternalRevocationsRaw(...init) {
        return this.paths["/api/player-internal/revocations"].GET(...init);
    }
    getApiPlayerInternalRevocations(...init) {
        return this.unwrap(this.getApiPlayerInternalRevocationsRaw(...init));
    }
    getApiPlayerLauncherBootstrapRaw(...init) {
        return this.paths["/api/player-launcher/bootstrap"].GET(...init);
    }
    getApiPlayerLauncherBootstrap(...init) {
        return this.unwrap(this.getApiPlayerLauncherBootstrapRaw(...init));
    }
    getApiPlayerLauncherMapsRaw(...init) {
        return this.paths["/api/player-launcher/maps"].GET(...init);
    }
    getApiPlayerLauncherMaps(...init) {
        return this.unwrap(this.getApiPlayerLauncherMapsRaw(...init));
    }
    getApiPlayerLauncherMapsMapIdDescriptorRaw(...init) {
        return this.paths["/api/player-launcher/maps/{mapId}/descriptor"].GET(...init);
    }
    getApiPlayerLauncherMapsMapIdDescriptor(...init) {
        return this.unwrap(this.getApiPlayerLauncherMapsMapIdDescriptorRaw(...init));
    }
    getApiPlayerLauncherMapsMapIdDownloadPlanRaw(...init) {
        return this.paths["/api/player-launcher/maps/{mapId}/download-plan"].GET(...init);
    }
    getApiPlayerLauncherMapsMapIdDownloadPlan(...init) {
        return this.unwrap(this.getApiPlayerLauncherMapsMapIdDownloadPlanRaw(...init));
    }
    getApiPlayerLoginCallbackRaw(...init) {
        return this.paths["/api/player-login/callback"].GET(...init);
    }
    getApiPlayerLoginCallback(...init) {
        return this.unwrap(this.getApiPlayerLoginCallbackRaw(...init));
    }
    getApiPlayerLoginStartRaw(...init) {
        return this.paths["/api/player-login/start"].GET(...init);
    }
    getApiPlayerLoginStart(...init) {
        return this.unwrap(this.getApiPlayerLoginStartRaw(...init));
    }
    getApiPlayLibraryRaw(...init) {
        return this.paths["/api/play-library"].GET(...init);
    }
    getApiPlayLibrary(...init) {
        return this.unwrap(this.getApiPlayLibraryRaw(...init));
    }
    getApiPlayPresenceRaw(...init) {
        return this.paths["/api/play-presence"].GET(...init);
    }
    getApiPlayPresence(...init) {
        return this.unwrap(this.getApiPlayPresenceRaw(...init));
    }
    getApiPlayResourceCacheWorldRaw(...init) {
        return this.paths["/api/play-resource-cache/{world}"].GET(...init);
    }
    getApiPlayResourceCacheWorld(...init) {
        return this.unwrap(this.getApiPlayResourceCacheWorldRaw(...init));
    }
    getApiPlayWorldsRaw(...init) {
        return this.paths["/api/play-worlds"].GET(...init);
    }
    getApiPlayWorlds(...init) {
        return this.unwrap(this.getApiPlayWorldsRaw(...init));
    }
    getApiProjectModelsRaw(...init) {
        return this.paths["/api/project-models"].GET(...init);
    }
    getApiProjectModels(...init) {
        return this.unwrap(this.getApiProjectModelsRaw(...init));
    }
    getApiProjectSkinPreviewsRaw(...init) {
        return this.paths["/api/project-skin-previews"].GET(...init);
    }
    getApiProjectSkinPreviews(...init) {
        return this.unwrap(this.getApiProjectSkinPreviewsRaw(...init));
    }
    getApiProjectSkinsRaw(...init) {
        return this.paths["/api/project-skins"].GET(...init);
    }
    getApiProjectSkins(...init) {
        return this.unwrap(this.getApiProjectSkinsRaw(...init));
    }
    getApiRuntimeContainerIdStatsRaw(...init) {
        return this.paths["/api/runtime/{container_id}/stats"].GET(...init);
    }
    getApiRuntimeContainerIdStats(...init) {
        return this.unwrap(this.getApiRuntimeContainerIdStatsRaw(...init));
    }
    getApiServerInfoRaw(...init) {
        return this.paths["/api/server-info"].GET(...init);
    }
    getApiServerInfo(...init) {
        return this.unwrap(this.getApiServerInfoRaw(...init));
    }
    getApiSessionRaw(...init) {
        return this.paths["/api/session"].GET(...init);
    }
    getApiSession(...init) {
        return this.unwrap(this.getApiSessionRaw(...init));
    }
    getApiSystemBackupsRaw(...init) {
        return this.paths["/api/system/backups"].GET(...init);
    }
    getApiSystemBackups(...init) {
        return this.unwrap(this.getApiSystemBackupsRaw(...init));
    }
    getApiSystemBackupsProjectIdNameRaw(...init) {
        return this.paths["/api/system/backups/{projectId}/{name}"].GET(...init);
    }
    getApiSystemBackupsProjectIdName(...init) {
        return this.unwrap(this.getApiSystemBackupsProjectIdNameRaw(...init));
    }
    getApiSystemStatusRaw(...init) {
        return this.paths["/api/system/status"].GET(...init);
    }
    getApiSystemStatus(...init) {
        return this.unwrap(this.getApiSystemStatusRaw(...init));
    }
    getBlockHashRaw(...init) {
        return this.paths["/block/{hash}"].GET(...init);
    }
    getBlockHash(...init) {
        return this.unwrap(this.getBlockHashRaw(...init));
    }
    getInternalCreatorPreviewRuntimeRaw(...init) {
        return this.paths["/internal/creator-preview-runtime"].GET(...init);
    }
    getInternalCreatorPreviewRuntime(...init) {
        return this.unwrap(this.getInternalCreatorPreviewRuntimeRaw(...init));
    }
    getInternalCreatorPreviewRuntimeEventsRaw(...init) {
        return this.paths["/internal/creator-preview-runtime/events"].GET(...init);
    }
    getInternalCreatorPreviewRuntimeEvents(...init) {
        return this.unwrap(this.getInternalCreatorPreviewRuntimeEventsRaw(...init));
    }
    getLocalRuntimeStatusRaw(...init) {
        return this.paths["/__local_runtime/status"].GET(...init);
    }
    getLocalRuntimeStatus(...init) {
        return this.unwrap(this.getLocalRuntimeStatusRaw(...init));
    }
    patchApiAuthProfileRaw(...init) {
        return this.paths["/api/auth/profile"].PATCH(...init);
    }
    patchApiAuthProfile(...init) {
        return this.unwrap(this.patchApiAuthProfileRaw(...init));
    }
    patchApiCreatorProfileRaw(...init) {
        return this.paths["/api/creator-profile"].PATCH(...init);
    }
    patchApiCreatorProfile(...init) {
        return this.unwrap(this.patchApiCreatorProfileRaw(...init));
    }
    patchApiLocalProjectsAssetDistributionRaw(...init) {
        return this.paths["/api/local-projects/asset-distribution"].PATCH(...init);
    }
    patchApiLocalProjectsAssetDistribution(...init) {
        return this.unwrap(this.patchApiLocalProjectsAssetDistributionRaw(...init));
    }
    patchApiLocalProjectsIdRaw(...init) {
        return this.paths["/api/local-projects/{id}"].PATCH(...init);
    }
    patchApiLocalProjectsId(...init) {
        return this.unwrap(this.patchApiLocalProjectsIdRaw(...init));
    }
    patchApiPlayAdminAdminsIdRaw(...init) {
        return this.paths["/api/play-admin/admins/{id}"].PATCH(...init);
    }
    patchApiPlayAdminAdminsId(...init) {
        return this.unwrap(this.patchApiPlayAdminAdminsIdRaw(...init));
    }
    patchApiPlayAdminContainerResourceGroupsIdRaw(...init) {
        return this.paths["/api/play-admin/container-resource-groups/{id}"].PATCH(...init);
    }
    patchApiPlayAdminContainerResourceGroupsId(...init) {
        return this.unwrap(this.patchApiPlayAdminContainerResourceGroupsIdRaw(...init));
    }
    patchApiPlayAdminLibrarySectionRaw(...init) {
        return this.paths["/api/play-admin/library/{section}"].PATCH(...init);
    }
    patchApiPlayAdminLibrarySection(...init) {
        return this.unwrap(this.patchApiPlayAdminLibrarySectionRaw(...init));
    }
    patchApiPlayAdminLibrarySectionIdRaw(...init) {
        return this.paths["/api/play-admin/library/{section}/{id}"].PATCH(...init);
    }
    patchApiPlayAdminLibrarySectionId(...init) {
        return this.unwrap(this.patchApiPlayAdminLibrarySectionIdRaw(...init));
    }
    patchApiPlayAdminPermissionGroupsIdRaw(...init) {
        return this.paths["/api/play-admin/permission-groups/{id}"].PATCH(...init);
    }
    patchApiPlayAdminPermissionGroupsId(...init) {
        return this.unwrap(this.patchApiPlayAdminPermissionGroupsIdRaw(...init));
    }
    patchApiPlayAdminPlayersSubjectIdRaw(...init) {
        return this.paths["/api/play-admin/players/{subjectId}"].PATCH(...init);
    }
    patchApiPlayAdminPlayersSubjectId(...init) {
        return this.unwrap(this.patchApiPlayAdminPlayersSubjectIdRaw(...init));
    }
    patchApiPlayAdminWorldsIdRaw(...init) {
        return this.paths["/api/play-admin/worlds/{id}"].PATCH(...init);
    }
    patchApiPlayAdminWorldsId(...init) {
        return this.unwrap(this.patchApiPlayAdminWorldsIdRaw(...init));
    }
    patchApiPlayerAuthProfileRaw(...init) {
        return this.paths["/api/player-auth/profile"].PATCH(...init);
    }
    patchApiPlayerAuthProfile(...init) {
        return this.unwrap(this.patchApiPlayerAuthProfileRaw(...init));
    }
    patchApiPlayerInternalMapLibraryRaw(...init) {
        return this.paths["/api/player-internal/map-library"].PATCH(...init);
    }
    patchApiPlayerInternalMapLibrary(...init) {
        return this.unwrap(this.patchApiPlayerInternalMapLibraryRaw(...init));
    }
    patchApiPlayerInternalProfileRaw(...init) {
        return this.paths["/api/player-internal/profile"].PATCH(...init);
    }
    patchApiPlayerInternalProfile(...init) {
        return this.unwrap(this.patchApiPlayerInternalProfileRaw(...init));
    }
    patchApiPlayLibraryRaw(...init) {
        return this.paths["/api/play-library"].PATCH(...init);
    }
    patchApiPlayLibrary(...init) {
        return this.unwrap(this.patchApiPlayLibraryRaw(...init));
    }
    patchApiPlayProfileRaw(...init) {
        return this.paths["/api/play-profile"].PATCH(...init);
    }
    patchApiPlayProfile(...init) {
        return this.unwrap(this.patchApiPlayProfileRaw(...init));
    }
    postApiAuthLoginRaw(...init) {
        return this.paths["/api/auth/login"].POST(...init);
    }
    postApiAuthLogin(...init) {
        return this.unwrap(this.postApiAuthLoginRaw(...init));
    }
    postApiAuthLogoutRaw(...init) {
        return this.paths["/api/auth/logout"].POST(...init);
    }
    postApiAuthLogout(...init) {
        return this.unwrap(this.postApiAuthLogoutRaw(...init));
    }
    postApiAuthPasswordRaw(...init) {
        return this.paths["/api/auth/password"].POST(...init);
    }
    postApiAuthPassword(...init) {
        return this.unwrap(this.postApiAuthPasswordRaw(...init));
    }
    postApiAuthRegisterRaw(...init) {
        return this.paths["/api/auth/register"].POST(...init);
    }
    postApiAuthRegister(...init) {
        return this.unwrap(this.postApiAuthRegisterRaw(...init));
    }
    postApiBackupsUploadRaw(...init) {
        return this.paths["/api/backups/upload"].POST(...init);
    }
    postApiBackupsUpload(...init) {
        return this.unwrap(this.postApiBackupsUploadRaw(...init));
    }
    postApiCommandsNameRaw(...init) {
        return this.paths["/api/commands/{name}"].POST(...init);
    }
    postApiCommandsName(...init) {
        return this.unwrap(this.postApiCommandsNameRaw(...init));
    }
    postApiCreateSessionRaw(...init) {
        return this.paths["/api/createSession"].POST(...init);
    }
    postApiCreateSession(...init) {
        return this.unwrap(this.postApiCreateSessionRaw(...init));
    }
    postApiCreatorLogoutRaw(...init) {
        return this.paths["/api/creator-logout"].POST(...init);
    }
    postApiCreatorLogout(...init) {
        return this.unwrap(this.postApiCreatorLogoutRaw(...init));
    }
    postApiCreatorModelsImportRaw(...init) {
        return this.paths["/api/creator-models/import"].POST(...init);
    }
    postApiCreatorModelsImport(...init) {
        return this.unwrap(this.postApiCreatorModelsImportRaw(...init));
    }
    postApiCreatorV1ProjectsProjectIdRuntimeRaw(...init) {
        return this.paths["/api/creator/v1/projects/{projectId}/runtime"].POST(...init);
    }
    postApiCreatorV1ProjectsProjectIdRuntime(...init) {
        return this.unwrap(this.postApiCreatorV1ProjectsProjectIdRuntimeRaw(...init));
    }
    postApiCreatorV1ProjectsProjectIdSceneActionsRequestIdRaw(...init) {
        return this.paths["/api/creator/v1/projects/{projectId}/scene/actions/{requestId}"].POST(...init);
    }
    postApiCreatorV1ProjectsProjectIdSceneActionsRequestId(...init) {
        return this.unwrap(this.postApiCreatorV1ProjectsProjectIdSceneActionsRequestIdRaw(...init));
    }
    postApiCreatorV1ProjectsProjectIdSceneSessionRaw(...init) {
        return this.paths["/api/creator/v1/projects/{projectId}/scene/session"].POST(...init);
    }
    postApiCreatorV1ProjectsProjectIdSceneSession(...init) {
        return this.unwrap(this.postApiCreatorV1ProjectsProjectIdSceneSessionRaw(...init));
    }
    postApiLocalBlobRaw(...init) {
        return this.paths["/api/local/blob"].POST(...init);
    }
    postApiLocalBlob(...init) {
        return this.unwrap(this.postApiLocalBlobRaw(...init));
    }
    postApiLocalModelsRaw(...init) {
        return this.paths["/api/local/models"].POST(...init);
    }
    postApiLocalModels(...init) {
        return this.unwrap(this.postApiLocalModelsRaw(...init));
    }
    postApiLocalModelsImportRaw(...init) {
        return this.paths["/api/local/models/import"].POST(...init);
    }
    postApiLocalModelsImport(...init) {
        return this.unwrap(this.postApiLocalModelsImportRaw(...init));
    }
    postApiLocalProjectsRaw(...init) {
        return this.paths["/api/local-projects"].POST(...init);
    }
    postApiLocalProjects(...init) {
        return this.unwrap(this.postApiLocalProjectsRaw(...init));
    }
    postApiLocalProjectsIdMapsRaw(...init) {
        return this.paths["/api/local-projects/{id}/maps"].POST(...init);
    }
    postApiLocalProjectsIdMaps(...init) {
        return this.unwrap(this.postApiLocalProjectsIdMapsRaw(...init));
    }
    postApiLocalProjectsIdPackageRaw(...init) {
        return this.paths["/api/local-projects/{id}/package"].POST(...init);
    }
    postApiLocalProjectsIdPackage(...init) {
        return this.unwrap(this.postApiLocalProjectsIdPackageRaw(...init));
    }
    postApiLocalProjectsIdPublishRaw(...init) {
        return this.paths["/api/local-projects/{id}/publish"].POST(...init);
    }
    postApiLocalProjectsIdPublish(...init) {
        return this.unwrap(this.postApiLocalProjectsIdPublishRaw(...init));
    }
    postApiLocalProjectsIdRuntimeRaw(...init) {
        return this.paths["/api/local-projects/{id}/runtime"].POST(...init);
    }
    postApiLocalProjectsIdRuntime(...init) {
        return this.unwrap(this.postApiLocalProjectsIdRuntimeRaw(...init));
    }
    postApiLocalProjectsIdSnapshotsRaw(...init) {
        return this.paths["/api/local-projects/{id}/snapshots"].POST(...init);
    }
    postApiLocalProjectsIdSnapshots(...init) {
        return this.unwrap(this.postApiLocalProjectsIdSnapshotsRaw(...init));
    }
    postApiLocalProjectsImportRaw(...init) {
        return this.paths["/api/local-projects/import"].POST(...init);
    }
    postApiLocalProjectsImport(...init) {
        return this.unwrap(this.postApiLocalProjectsImportRaw(...init));
    }
    postApiPlayAdminAdminsRaw(...init) {
        return this.paths["/api/play-admin/admins"].POST(...init);
    }
    postApiPlayAdminAdmins(...init) {
        return this.unwrap(this.postApiPlayAdminAdminsRaw(...init));
    }
    postApiPlayAdminContainerResourceGroupsRaw(...init) {
        return this.paths["/api/play-admin/container-resource-groups"].POST(...init);
    }
    postApiPlayAdminContainerResourceGroups(...init) {
        return this.unwrap(this.postApiPlayAdminContainerResourceGroupsRaw(...init));
    }
    postApiPlayAdminContainersRaw(...init) {
        return this.paths["/api/play-admin/containers"].POST(...init);
    }
    postApiPlayAdminContainers(...init) {
        return this.unwrap(this.postApiPlayAdminContainersRaw(...init));
    }
    postApiPlayAdminIdentityBansRaw(...init) {
        return this.paths["/api/play-admin/identity-bans"].POST(...init);
    }
    postApiPlayAdminIdentityBans(...init) {
        return this.unwrap(this.postApiPlayAdminIdentityBansRaw(...init));
    }
    postApiPlayAdminImportRaw(...init) {
        return this.paths["/api/play-admin/import"].POST(...init);
    }
    postApiPlayAdminImport(...init) {
        return this.unwrap(this.postApiPlayAdminImportRaw(...init));
    }
    postApiPlayAdminLibraryImportRaw(...init) {
        return this.paths["/api/play-admin/library/import"].POST(...init);
    }
    postApiPlayAdminLibraryImport(...init) {
        return this.unwrap(this.postApiPlayAdminLibraryImportRaw(...init));
    }
    postApiPlayAdminLibrarySectionRaw(...init) {
        return this.paths["/api/play-admin/library/{section}"].POST(...init);
    }
    postApiPlayAdminLibrarySection(...init) {
        return this.unwrap(this.postApiPlayAdminLibrarySectionRaw(...init));
    }
    postApiPlayAdminLibrarySectionIdRaw(...init) {
        return this.paths["/api/play-admin/library/{section}/{id}"].POST(...init);
    }
    postApiPlayAdminLibrarySectionId(...init) {
        return this.unwrap(this.postApiPlayAdminLibrarySectionIdRaw(...init));
    }
    postApiPlayAdminLoginRaw(...init) {
        return this.paths["/api/play-admin/login"].POST(...init);
    }
    postApiPlayAdminLogin(...init) {
        return this.unwrap(this.postApiPlayAdminLoginRaw(...init));
    }
    postApiPlayAdminLogoutRaw(...init) {
        return this.paths["/api/play-admin/logout"].POST(...init);
    }
    postApiPlayAdminLogout(...init) {
        return this.unwrap(this.postApiPlayAdminLogoutRaw(...init));
    }
    postApiPlayAdminMaintenanceRaw(...init) {
        return this.paths["/api/play-admin/maintenance"].POST(...init);
    }
    postApiPlayAdminMaintenance(...init) {
        return this.unwrap(this.postApiPlayAdminMaintenanceRaw(...init));
    }
    postApiPlayAdminOwnerSessionRaw(...init) {
        return this.paths["/api/play-admin/owner-session"].POST(...init);
    }
    postApiPlayAdminOwnerSession(...init) {
        return this.unwrap(this.postApiPlayAdminOwnerSessionRaw(...init));
    }
    postApiPlayAdminPermissionGroupsRaw(...init) {
        return this.paths["/api/play-admin/permission-groups"].POST(...init);
    }
    postApiPlayAdminPermissionGroups(...init) {
        return this.unwrap(this.postApiPlayAdminPermissionGroupsRaw(...init));
    }
    postApiPlayAdminPlayersRaw(...init) {
        return this.paths["/api/play-admin/players"].POST(...init);
    }
    postApiPlayAdminPlayers(...init) {
        return this.unwrap(this.postApiPlayAdminPlayersRaw(...init));
    }
    postApiPlayAdminPlayersBatchRaw(...init) {
        return this.paths["/api/play-admin/players/batch"].POST(...init);
    }
    postApiPlayAdminPlayersBatch(...init) {
        return this.unwrap(this.postApiPlayAdminPlayersBatchRaw(...init));
    }
    postApiPlayAdminPlayersSubjectIdRaw(...init) {
        return this.paths["/api/play-admin/players/{subjectId}"].POST(...init);
    }
    postApiPlayAdminPlayersSubjectId(...init) {
        return this.unwrap(this.postApiPlayAdminPlayersSubjectIdRaw(...init));
    }
    postApiPlayAdminScriptModerationRaw(...init) {
        return this.paths["/api/play-admin/script-moderation"].POST(...init);
    }
    postApiPlayAdminScriptModeration(...init) {
        return this.unwrap(this.postApiPlayAdminScriptModerationRaw(...init));
    }
    postApiPlayAdminSelfPasswordRaw(...init) {
        return this.paths["/api/play-admin/self-password"].POST(...init);
    }
    postApiPlayAdminSelfPassword(...init) {
        return this.unwrap(this.postApiPlayAdminSelfPasswordRaw(...init));
    }
    postApiPlayAdminVerifyRaw(...init) {
        return this.paths["/api/play-admin/verify"].POST(...init);
    }
    postApiPlayAdminVerify(...init) {
        return this.unwrap(this.postApiPlayAdminVerifyRaw(...init));
    }
    postApiPlayerAuthLoginRaw(...init) {
        return this.paths["/api/player-auth/login"].POST(...init);
    }
    postApiPlayerAuthLogin(...init) {
        return this.unwrap(this.postApiPlayerAuthLoginRaw(...init));
    }
    postApiPlayerAuthLogoutRaw(...init) {
        return this.paths["/api/player-auth/logout"].POST(...init);
    }
    postApiPlayerAuthLogout(...init) {
        return this.unwrap(this.postApiPlayerAuthLogoutRaw(...init));
    }
    postApiPlayerAuthPasswordRaw(...init) {
        return this.paths["/api/player-auth/password"].POST(...init);
    }
    postApiPlayerAuthPassword(...init) {
        return this.unwrap(this.postApiPlayerAuthPasswordRaw(...init));
    }
    postApiPlayerAuthRegisterRaw(...init) {
        return this.paths["/api/player-auth/register"].POST(...init);
    }
    postApiPlayerAuthRegister(...init) {
        return this.unwrap(this.postApiPlayerAuthRegisterRaw(...init));
    }
    postApiPlayerAuthTransferRaw(...init) {
        return this.paths["/api/player-auth/transfer"].POST(...init);
    }
    postApiPlayerAuthTransfer(...init) {
        return this.unwrap(this.postApiPlayerAuthTransferRaw(...init));
    }
    postApiPlayerInternalLoginTransferRaw(...init) {
        return this.paths["/api/player-internal/login-transfer"].POST(...init);
    }
    postApiPlayerInternalLoginTransfer(...init) {
        return this.unwrap(this.postApiPlayerInternalLoginTransferRaw(...init));
    }
    postApiPlayerInternalLogoutRaw(...init) {
        return this.paths["/api/player-internal/logout"].POST(...init);
    }
    postApiPlayerInternalLogout(...init) {
        return this.unwrap(this.postApiPlayerInternalLogoutRaw(...init));
    }
    postApiPlayerInternalMapAdmissionRaw(...init) {
        return this.paths["/api/player-internal/map-admission"].POST(...init);
    }
    postApiPlayerInternalMapAdmission(...init) {
        return this.unwrap(this.postApiPlayerInternalMapAdmissionRaw(...init));
    }
    postApiPlayerInternalRuntimeIdentityRaw(...init) {
        return this.paths["/api/player-internal/runtime-identity"].POST(...init);
    }
    postApiPlayerInternalRuntimeIdentity(...init) {
        return this.unwrap(this.postApiPlayerInternalRuntimeIdentityRaw(...init));
    }
    postApiPlayerInternalScriptMetadataRaw(...init) {
        return this.paths["/api/player-internal/script-metadata"].POST(...init);
    }
    postApiPlayerInternalScriptMetadata(...init) {
        return this.unwrap(this.postApiPlayerInternalScriptMetadataRaw(...init));
    }
    postApiPlayerInternalScriptModerationRaw(...init) {
        return this.paths["/api/player-internal/script-moderation"].POST(...init);
    }
    postApiPlayerInternalScriptModeration(...init) {
        return this.unwrap(this.postApiPlayerInternalScriptModerationRaw(...init));
    }
    postApiPlayLogoutRaw(...init) {
        return this.paths["/api/play-logout"].POST(...init);
    }
    postApiPlayLogout(...init) {
        return this.unwrap(this.postApiPlayLogoutRaw(...init));
    }
    postApiPlayPresenceRaw(...init) {
        return this.paths["/api/play-presence"].POST(...init);
    }
    postApiPlayPresence(...init) {
        return this.unwrap(this.postApiPlayPresenceRaw(...init));
    }
    postApiProjectModelsRaw(...init) {
        return this.paths["/api/project-models"].POST(...init);
    }
    postApiProjectModels(...init) {
        return this.unwrap(this.postApiProjectModelsRaw(...init));
    }
    postApiProjectScriptsRaw(...init) {
        return this.paths["/api/project-scripts"].POST(...init);
    }
    postApiProjectScripts(...init) {
        return this.unwrap(this.postApiProjectScriptsRaw(...init));
    }
    postApiProjectSkinsRaw(...init) {
        return this.paths["/api/project-skins"].POST(...init);
    }
    postApiProjectSkins(...init) {
        return this.unwrap(this.postApiProjectSkinsRaw(...init));
    }
    postApiRealtimeSessionRaw(...init) {
        return this.paths["/api/realtime/session"].POST(...init);
    }
    postApiRealtimeSession(...init) {
        return this.unwrap(this.postApiRealtimeSessionRaw(...init));
    }
    postApiRuntimeEnsureRaw(...init) {
        return this.paths["/api/runtime/ensure"].POST(...init);
    }
    postApiRuntimeEnsure(...init) {
        return this.unwrap(this.postApiRuntimeEnsureRaw(...init));
    }
    postApiSystemBackupsRaw(...init) {
        return this.paths["/api/system/backups"].POST(...init);
    }
    postApiSystemBackups(...init) {
        return this.unwrap(this.postApiSystemBackupsRaw(...init));
    }
    postBlockRaw(...init) {
        return this.paths["/block"].POST(...init);
    }
    postBlock(...init) {
        return this.unwrap(this.postBlockRaw(...init));
    }
    postBlockHashRaw(...init) {
        return this.paths["/block/{hash}"].POST(...init);
    }
    postBlockHash(...init) {
        return this.unwrap(this.postBlockHashRaw(...init));
    }
    postCreateSessionRaw(...init) {
        return this.paths["/createSession"].POST(...init);
    }
    postCreateSession(...init) {
        return this.unwrap(this.postCreateSessionRaw(...init));
    }
    postInternalSaveLocalProjectRaw(...init) {
        return this.paths["/internal/save-local-project"].POST(...init);
    }
    postInternalSaveLocalProject(...init) {
        return this.unwrap(this.postInternalSaveLocalProjectRaw(...init));
    }
    postLocalRuntimeDestroyRaw(...init) {
        return this.paths["/__local_runtime/destroy"].POST(...init);
    }
    postLocalRuntimeDestroy(...init) {
        return this.unwrap(this.postLocalRuntimeDestroyRaw(...init));
    }
    postLocalRuntimeStartRaw(...init) {
        return this.paths["/__local_runtime/start"].POST(...init);
    }
    postLocalRuntimeStart(...init) {
        return this.unwrap(this.postLocalRuntimeStartRaw(...init));
    }
    postRoomRoomIdLocalRuntimeDestroyRaw(...init) {
        return this.paths["/__room/{roomId}/__local_runtime/destroy"].POST(...init);
    }
    postRoomRoomIdLocalRuntimeDestroy(...init) {
        return this.unwrap(this.postRoomRoomIdLocalRuntimeDestroyRaw(...init));
    }
    putApiCreatorModelsIdRaw(...init) {
        return this.paths["/api/creator-models/{id}"].PUT(...init);
    }
    putApiCreatorModelsId(...init) {
        return this.unwrap(this.putApiCreatorModelsIdRaw(...init));
    }
    putApiCreatorV1ProjectsProjectIdScriptsSideEntryRaw(...init) {
        return this.paths["/api/creator/v1/projects/{projectId}/scripts/{side}/{entry}"].PUT(...init);
    }
    putApiCreatorV1ProjectsProjectIdScriptsSideEntry(...init) {
        return this.unwrap(this.putApiCreatorV1ProjectsProjectIdScriptsSideEntryRaw(...init));
    }
    putApiCreatorV1ProjectsProjectIdStorageScopeSpaceRaw(...init) {
        return this.paths["/api/creator/v1/projects/{projectId}/storage/{scope}/{space}"].PUT(...init);
    }
    putApiCreatorV1ProjectsProjectIdStorageScopeSpace(...init) {
        return this.unwrap(this.putApiCreatorV1ProjectsProjectIdStorageScopeSpaceRaw(...init));
    }
    putApiLocalDefaultSkinRaw(...init) {
        return this.paths["/api/local/default-skin"].PUT(...init);
    }
    putApiLocalDefaultSkin(...init) {
        return this.unwrap(this.putApiLocalDefaultSkinRaw(...init));
    }
    putApiLocalModelsIdRaw(...init) {
        return this.paths["/api/local/models/{id}"].PUT(...init);
    }
    putApiLocalModelsId(...init) {
        return this.unwrap(this.putApiLocalModelsIdRaw(...init));
    }
    constructor(options = {}){
        const { csrfCookie, csrfHeader = 'X-CSRF-Token', defaultErrorMessage = '请求失败，请稍后重试', ...clientOptions } = options;
        this.defaultErrorMessage = defaultErrorMessage;
        this.raw = createClient__default.default({
            credentials: 'same-origin',
            ...clientOptions
        });
        if (csrfCookie) {
            this.raw.use({
                onRequest ({ request }) {
                    if (typeof document === 'undefined' || /^(GET|HEAD|OPTIONS)$/i.test(request.method)) {
                        return request;
                    }
                    const prefix = `${csrfCookie}=`;
                    const entry = document.cookie.split('; ').find((item)=>item.startsWith(prefix));
                    if (entry) {
                        request.headers.set(csrfHeader, decodeURIComponent(entry.slice(prefix.length)));
                    }
                    return request;
                }
            });
        }
        this.paths = createClient.wrapAsPathBasedClient(this.raw);
    }
}
const createApiClient = (options = {})=>new ApiClient(options);

exports.ApiClient = ApiClient;
exports.ApiClientError = ApiClientError;
exports.REQUEST_TIMEOUT = REQUEST_TIMEOUT;
exports.apiOperations = apiOperations;
exports.createApiClient = createApiClient;
exports.playerAdminRoutes = playerAdminRoutes;
