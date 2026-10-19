/**
 * Generated from openapi/openapi.json. Do not edit by hand.
 *
 * Every Local Engine HTTP operation is exposed as a named method so callers
 * never need to duplicate a route or HTTP verb.
 */
import { type Client, type ClientOptions, type FetchResponse, type PathBasedClient } from 'openapi-fetch';
import type { paths } from './openapi';
export declare const apiOperations: {
    readonly deleteApiCreatorModelsId: {
        readonly path: "/api/creator-models/{id}";
        readonly method: "DELETE";
    };
    readonly deleteApiCreatorV1ProjectsProjectIdSceneSession: {
        readonly path: "/api/creator/v1/projects/{projectId}/scene/session";
        readonly method: "DELETE";
    };
    readonly deleteApiCreatorV1ProjectsProjectIdStorageScopeSpace: {
        readonly path: "/api/creator/v1/projects/{projectId}/storage/{scope}/{space}";
        readonly method: "DELETE";
    };
    readonly deleteApiLocalModelsId: {
        readonly path: "/api/local/models/{id}";
        readonly method: "DELETE";
    };
    readonly deleteApiLocalProjectsId: {
        readonly path: "/api/local-projects/{id}";
        readonly method: "DELETE";
    };
    readonly deleteApiPlayAdminAdminsId: {
        readonly path: "/api/play-admin/admins/{id}";
        readonly method: "DELETE";
    };
    readonly deleteApiPlayAdminContainerResourceGroupsId: {
        readonly path: "/api/play-admin/container-resource-groups/{id}";
        readonly method: "DELETE";
    };
    readonly deleteApiPlayAdminContainersPermanentMapId: {
        readonly path: "/api/play-admin/containers/{permanentMapId}";
        readonly method: "DELETE";
    };
    readonly deleteApiPlayAdminImport: {
        readonly path: "/api/play-admin/import";
        readonly method: "DELETE";
    };
    readonly deleteApiPlayAdminLibraryImport: {
        readonly path: "/api/play-admin/library/import";
        readonly method: "DELETE";
    };
    readonly deleteApiPlayAdminLibrarySection: {
        readonly path: "/api/play-admin/library/{section}";
        readonly method: "DELETE";
    };
    readonly deleteApiPlayAdminLibrarySectionId: {
        readonly path: "/api/play-admin/library/{section}/{id}";
        readonly method: "DELETE";
    };
    readonly deleteApiPlayAdminPermissionGroupsId: {
        readonly path: "/api/play-admin/permission-groups/{id}";
        readonly method: "DELETE";
    };
    readonly deleteApiPlayAdminPlayersSubjectId: {
        readonly path: "/api/play-admin/players/{subjectId}";
        readonly method: "DELETE";
    };
    readonly deleteApiPlayAdminWorldsId: {
        readonly path: "/api/play-admin/worlds/{id}";
        readonly method: "DELETE";
    };
    readonly deleteApiPlayPresence: {
        readonly path: "/api/play-presence";
        readonly method: "DELETE";
    };
    readonly deleteApiRuntimeContainerId: {
        readonly path: "/api/runtime/{container_id}";
        readonly method: "DELETE";
    };
    readonly getApiAuthSession: {
        readonly path: "/api/auth/session";
        readonly method: "GET";
    };
    readonly getApiBackupsArchiveDownload: {
        readonly path: "/api/backups/{archive}/download";
        readonly method: "GET";
    };
    readonly getApiConfigSlug: {
        readonly path: "/api/config/{slug}";
        readonly method: "GET";
    };
    readonly getApiCreatorModels: {
        readonly path: "/api/creator-models";
        readonly method: "GET";
    };
    readonly getApiCreatorModelsBlobsHash: {
        readonly path: "/api/creator-models/blobs/{hash}";
        readonly method: "GET";
    };
    readonly getApiCreatorModelsIdExport: {
        readonly path: "/api/creator-models/{id}/export";
        readonly method: "GET";
    };
    readonly getApiCreatorPermissions: {
        readonly path: "/api/creator-permissions";
        readonly method: "GET";
    };
    readonly getApiCreatorV1Health: {
        readonly path: "/api/creator/v1/health";
        readonly method: "GET";
    };
    readonly getApiCreatorV1Projects: {
        readonly path: "/api/creator/v1/projects";
        readonly method: "GET";
    };
    readonly getApiCreatorV1ProjectsProjectIdResources: {
        readonly path: "/api/creator/v1/projects/{projectId}/resources";
        readonly method: "GET";
    };
    readonly getApiCreatorV1ProjectsProjectIdRuntime: {
        readonly path: "/api/creator/v1/projects/{projectId}/runtime";
        readonly method: "GET";
    };
    readonly getApiCreatorV1ProjectsProjectIdRuntimeEvents: {
        readonly path: "/api/creator/v1/projects/{projectId}/runtime/events";
        readonly method: "GET";
    };
    readonly getApiCreatorV1ProjectsProjectIdSceneAction: {
        readonly path: "/api/creator/v1/projects/{projectId}/scene/action";
        readonly method: "GET";
    };
    readonly getApiCreatorV1ProjectsProjectIdSceneCapture: {
        readonly path: "/api/creator/v1/projects/{projectId}/scene/capture";
        readonly method: "GET";
    };
    readonly getApiCreatorV1ProjectsProjectIdSceneSession: {
        readonly path: "/api/creator/v1/projects/{projectId}/scene/session";
        readonly method: "GET";
    };
    readonly getApiCreatorV1ProjectsProjectIdScripts: {
        readonly path: "/api/creator/v1/projects/{projectId}/scripts";
        readonly method: "GET";
    };
    readonly getApiCreatorV1ProjectsProjectIdScriptsSideEntry: {
        readonly path: "/api/creator/v1/projects/{projectId}/scripts/{side}/{entry}";
        readonly method: "GET";
    };
    readonly getApiCreatorV1ProjectsProjectIdStorageScopeSpace: {
        readonly path: "/api/creator/v1/projects/{projectId}/storage/{scope}/{space}";
        readonly method: "GET";
    };
    readonly getApiDiagnosticsArchiveDownload: {
        readonly path: "/api/diagnostics/{archive}/download";
        readonly method: "GET";
    };
    readonly getApiGetMapInfo: {
        readonly path: "/api/getMapInfo";
        readonly method: "GET";
    };
    readonly getApiHealth: {
        readonly path: "/api/health";
        readonly method: "GET";
    };
    readonly getApiHealthCheck: {
        readonly path: "/api/health-check";
        readonly method: "GET";
    };
    readonly getApiLocalBlobsHash: {
        readonly path: "/api/local/blobs/{hash}";
        readonly method: "GET";
    };
    readonly getApiLocalDefaultSkin: {
        readonly path: "/api/local/default-skin";
        readonly method: "GET";
    };
    readonly getApiLocalModels: {
        readonly path: "/api/local/models";
        readonly method: "GET";
    };
    readonly getApiLocalModelsId: {
        readonly path: "/api/local/models/{id}";
        readonly method: "GET";
    };
    readonly getApiLocalModelsIdExport: {
        readonly path: "/api/local/models/{id}/export";
        readonly method: "GET";
    };
    readonly getApiLocalModelsIdSnapshots: {
        readonly path: "/api/local/models/{id}/snapshots";
        readonly method: "GET";
    };
    readonly getApiLocalProjects: {
        readonly path: "/api/local-projects";
        readonly method: "GET";
    };
    readonly getApiLocalProjectsAssetDistribution: {
        readonly path: "/api/local-projects/asset-distribution";
        readonly method: "GET";
    };
    readonly getApiLocalProjectsIdExport: {
        readonly path: "/api/local-projects/{id}/export";
        readonly method: "GET";
    };
    readonly getApiLocalProjectsIdMaps: {
        readonly path: "/api/local-projects/{id}/maps";
        readonly method: "GET";
    };
    readonly getApiLocalProjectsIdRuntime: {
        readonly path: "/api/local-projects/{id}/runtime";
        readonly method: "GET";
    };
    readonly getApiLocalProjectsIdSnapshots: {
        readonly path: "/api/local-projects/{id}/snapshots";
        readonly method: "GET";
    };
    readonly getApiOperationsId: {
        readonly path: "/api/operations/{id}";
        readonly method: "GET";
    };
    readonly getApiPlayAdminActivity: {
        readonly path: "/api/play-admin/activity";
        readonly method: "GET";
    };
    readonly getApiPlayAdminAdmins: {
        readonly path: "/api/play-admin/admins";
        readonly method: "GET";
    };
    readonly getApiPlayAdminContainerResourceGroups: {
        readonly path: "/api/play-admin/container-resource-groups";
        readonly method: "GET";
    };
    readonly getApiPlayAdminContainers: {
        readonly path: "/api/play-admin/containers";
        readonly method: "GET";
    };
    readonly getApiPlayAdminIdentityBans: {
        readonly path: "/api/play-admin/identity-bans";
        readonly method: "GET";
    };
    readonly getApiPlayAdminImport: {
        readonly path: "/api/play-admin/import";
        readonly method: "GET";
    };
    readonly getApiPlayAdminImportResource: {
        readonly path: "/api/play-admin/import-resource";
        readonly method: "GET";
    };
    readonly getApiPlayAdminLibraryImport: {
        readonly path: "/api/play-admin/library/import";
        readonly method: "GET";
    };
    readonly getApiPlayAdminLibrarySection: {
        readonly path: "/api/play-admin/library/{section}";
        readonly method: "GET";
    };
    readonly getApiPlayAdminLibrarySectionId: {
        readonly path: "/api/play-admin/library/{section}/{id}";
        readonly method: "GET";
    };
    readonly getApiPlayAdminPermissionGroups: {
        readonly path: "/api/play-admin/permission-groups";
        readonly method: "GET";
    };
    readonly getApiPlayAdminPlayers: {
        readonly path: "/api/play-admin/players";
        readonly method: "GET";
    };
    readonly getApiPlayAdminPlayersExport: {
        readonly path: "/api/play-admin/players/export";
        readonly method: "GET";
    };
    readonly getApiPlayAdminPlayersOverview: {
        readonly path: "/api/play-admin/players/overview";
        readonly method: "GET";
    };
    readonly getApiPlayAdminPlayersSubjectId: {
        readonly path: "/api/play-admin/players/{subjectId}";
        readonly method: "GET";
    };
    readonly getApiPlayAdminScriptModeration: {
        readonly path: "/api/play-admin/script-moderation";
        readonly method: "GET";
    };
    readonly getApiPlayAdminStatus: {
        readonly path: "/api/play-admin/status";
        readonly method: "GET";
    };
    readonly getApiPlayAdminVerify: {
        readonly path: "/api/play-admin/verify";
        readonly method: "GET";
    };
    readonly getApiPlayAdminWorlds: {
        readonly path: "/api/play-admin/worlds";
        readonly method: "GET";
    };
    readonly getApiPlayAdminWorldsStatus: {
        readonly path: "/api/play-admin/worlds/status";
        readonly method: "GET";
    };
    readonly getApiPlayerAuthLoginRequired: {
        readonly path: "/api/player-auth/login-required";
        readonly method: "GET";
    };
    readonly getApiPlayerAuthSession: {
        readonly path: "/api/player-auth/session";
        readonly method: "GET";
    };
    readonly getApiPlayerInternalMapLibrary: {
        readonly path: "/api/player-internal/map-library";
        readonly method: "GET";
    };
    readonly getApiPlayerInternalRevocations: {
        readonly path: "/api/player-internal/revocations";
        readonly method: "GET";
    };
    readonly getApiPlayerLauncherBootstrap: {
        readonly path: "/api/player-launcher/bootstrap";
        readonly method: "GET";
    };
    readonly getApiPlayerLauncherMaps: {
        readonly path: "/api/player-launcher/maps";
        readonly method: "GET";
    };
    readonly getApiPlayerLauncherMapsMapIdDescriptor: {
        readonly path: "/api/player-launcher/maps/{mapId}/descriptor";
        readonly method: "GET";
    };
    readonly getApiPlayerLauncherMapsMapIdDownloadPlan: {
        readonly path: "/api/player-launcher/maps/{mapId}/download-plan";
        readonly method: "GET";
    };
    readonly getApiPlayerLoginCallback: {
        readonly path: "/api/player-login/callback";
        readonly method: "GET";
    };
    readonly getApiPlayerLoginStart: {
        readonly path: "/api/player-login/start";
        readonly method: "GET";
    };
    readonly getApiPlayLibrary: {
        readonly path: "/api/play-library";
        readonly method: "GET";
    };
    readonly getApiPlayPresence: {
        readonly path: "/api/play-presence";
        readonly method: "GET";
    };
    readonly getApiPlayResourceCacheWorld: {
        readonly path: "/api/play-resource-cache/{world}";
        readonly method: "GET";
    };
    readonly getApiPlayWorlds: {
        readonly path: "/api/play-worlds";
        readonly method: "GET";
    };
    readonly getApiProjectModels: {
        readonly path: "/api/project-models";
        readonly method: "GET";
    };
    readonly getApiProjectSkinPreviews: {
        readonly path: "/api/project-skin-previews";
        readonly method: "GET";
    };
    readonly getApiProjectSkins: {
        readonly path: "/api/project-skins";
        readonly method: "GET";
    };
    readonly getApiRuntimeContainerIdStats: {
        readonly path: "/api/runtime/{container_id}/stats";
        readonly method: "GET";
    };
    readonly getApiServerInfo: {
        readonly path: "/api/server-info";
        readonly method: "GET";
    };
    readonly getApiSession: {
        readonly path: "/api/session";
        readonly method: "GET";
    };
    readonly getApiSystemBackups: {
        readonly path: "/api/system/backups";
        readonly method: "GET";
    };
    readonly getApiSystemBackupsProjectIdName: {
        readonly path: "/api/system/backups/{projectId}/{name}";
        readonly method: "GET";
    };
    readonly getApiSystemStatus: {
        readonly path: "/api/system/status";
        readonly method: "GET";
    };
    readonly getBlockHash: {
        readonly path: "/block/{hash}";
        readonly method: "GET";
    };
    readonly getInternalCreatorPreviewRuntime: {
        readonly path: "/internal/creator-preview-runtime";
        readonly method: "GET";
    };
    readonly getInternalCreatorPreviewRuntimeEvents: {
        readonly path: "/internal/creator-preview-runtime/events";
        readonly method: "GET";
    };
    readonly getLocalRuntimeStatus: {
        readonly path: "/__local_runtime/status";
        readonly method: "GET";
    };
    readonly patchApiAuthProfile: {
        readonly path: "/api/auth/profile";
        readonly method: "PATCH";
    };
    readonly patchApiCreatorProfile: {
        readonly path: "/api/creator-profile";
        readonly method: "PATCH";
    };
    readonly patchApiLocalProjectsAssetDistribution: {
        readonly path: "/api/local-projects/asset-distribution";
        readonly method: "PATCH";
    };
    readonly patchApiLocalProjectsId: {
        readonly path: "/api/local-projects/{id}";
        readonly method: "PATCH";
    };
    readonly patchApiPlayAdminAdminsId: {
        readonly path: "/api/play-admin/admins/{id}";
        readonly method: "PATCH";
    };
    readonly patchApiPlayAdminContainerResourceGroupsId: {
        readonly path: "/api/play-admin/container-resource-groups/{id}";
        readonly method: "PATCH";
    };
    readonly patchApiPlayAdminLibrarySection: {
        readonly path: "/api/play-admin/library/{section}";
        readonly method: "PATCH";
    };
    readonly patchApiPlayAdminLibrarySectionId: {
        readonly path: "/api/play-admin/library/{section}/{id}";
        readonly method: "PATCH";
    };
    readonly patchApiPlayAdminPermissionGroupsId: {
        readonly path: "/api/play-admin/permission-groups/{id}";
        readonly method: "PATCH";
    };
    readonly patchApiPlayAdminPlayersSubjectId: {
        readonly path: "/api/play-admin/players/{subjectId}";
        readonly method: "PATCH";
    };
    readonly patchApiPlayAdminWorldsId: {
        readonly path: "/api/play-admin/worlds/{id}";
        readonly method: "PATCH";
    };
    readonly patchApiPlayerAuthProfile: {
        readonly path: "/api/player-auth/profile";
        readonly method: "PATCH";
    };
    readonly patchApiPlayerInternalMapLibrary: {
        readonly path: "/api/player-internal/map-library";
        readonly method: "PATCH";
    };
    readonly patchApiPlayerInternalProfile: {
        readonly path: "/api/player-internal/profile";
        readonly method: "PATCH";
    };
    readonly patchApiPlayLibrary: {
        readonly path: "/api/play-library";
        readonly method: "PATCH";
    };
    readonly patchApiPlayProfile: {
        readonly path: "/api/play-profile";
        readonly method: "PATCH";
    };
    readonly postApiAuthLogin: {
        readonly path: "/api/auth/login";
        readonly method: "POST";
    };
    readonly postApiAuthLogout: {
        readonly path: "/api/auth/logout";
        readonly method: "POST";
    };
    readonly postApiAuthPassword: {
        readonly path: "/api/auth/password";
        readonly method: "POST";
    };
    readonly postApiAuthRegister: {
        readonly path: "/api/auth/register";
        readonly method: "POST";
    };
    readonly postApiBackupsUpload: {
        readonly path: "/api/backups/upload";
        readonly method: "POST";
    };
    readonly postApiCommandsName: {
        readonly path: "/api/commands/{name}";
        readonly method: "POST";
    };
    readonly postApiCreateSession: {
        readonly path: "/api/createSession";
        readonly method: "POST";
    };
    readonly postApiCreatorLogout: {
        readonly path: "/api/creator-logout";
        readonly method: "POST";
    };
    readonly postApiCreatorModelsImport: {
        readonly path: "/api/creator-models/import";
        readonly method: "POST";
    };
    readonly postApiCreatorV1ProjectsProjectIdRuntime: {
        readonly path: "/api/creator/v1/projects/{projectId}/runtime";
        readonly method: "POST";
    };
    readonly postApiCreatorV1ProjectsProjectIdSceneActionsRequestId: {
        readonly path: "/api/creator/v1/projects/{projectId}/scene/actions/{requestId}";
        readonly method: "POST";
    };
    readonly postApiCreatorV1ProjectsProjectIdSceneSession: {
        readonly path: "/api/creator/v1/projects/{projectId}/scene/session";
        readonly method: "POST";
    };
    readonly postApiLocalBlob: {
        readonly path: "/api/local/blob";
        readonly method: "POST";
    };
    readonly postApiLocalModels: {
        readonly path: "/api/local/models";
        readonly method: "POST";
    };
    readonly postApiLocalModelsImport: {
        readonly path: "/api/local/models/import";
        readonly method: "POST";
    };
    readonly postApiLocalProjects: {
        readonly path: "/api/local-projects";
        readonly method: "POST";
    };
    readonly postApiLocalProjectsIdMaps: {
        readonly path: "/api/local-projects/{id}/maps";
        readonly method: "POST";
    };
    readonly postApiLocalProjectsIdPackage: {
        readonly path: "/api/local-projects/{id}/package";
        readonly method: "POST";
    };
    readonly postApiLocalProjectsIdPublish: {
        readonly path: "/api/local-projects/{id}/publish";
        readonly method: "POST";
    };
    readonly postApiLocalProjectsIdRuntime: {
        readonly path: "/api/local-projects/{id}/runtime";
        readonly method: "POST";
    };
    readonly postApiLocalProjectsIdSnapshots: {
        readonly path: "/api/local-projects/{id}/snapshots";
        readonly method: "POST";
    };
    readonly postApiLocalProjectsImport: {
        readonly path: "/api/local-projects/import";
        readonly method: "POST";
    };
    readonly postApiPlayAdminAdmins: {
        readonly path: "/api/play-admin/admins";
        readonly method: "POST";
    };
    readonly postApiPlayAdminContainerResourceGroups: {
        readonly path: "/api/play-admin/container-resource-groups";
        readonly method: "POST";
    };
    readonly postApiPlayAdminContainers: {
        readonly path: "/api/play-admin/containers";
        readonly method: "POST";
    };
    readonly postApiPlayAdminIdentityBans: {
        readonly path: "/api/play-admin/identity-bans";
        readonly method: "POST";
    };
    readonly postApiPlayAdminImport: {
        readonly path: "/api/play-admin/import";
        readonly method: "POST";
    };
    readonly postApiPlayAdminLibraryImport: {
        readonly path: "/api/play-admin/library/import";
        readonly method: "POST";
    };
    readonly postApiPlayAdminLibrarySection: {
        readonly path: "/api/play-admin/library/{section}";
        readonly method: "POST";
    };
    readonly postApiPlayAdminLibrarySectionId: {
        readonly path: "/api/play-admin/library/{section}/{id}";
        readonly method: "POST";
    };
    readonly postApiPlayAdminLogin: {
        readonly path: "/api/play-admin/login";
        readonly method: "POST";
    };
    readonly postApiPlayAdminLogout: {
        readonly path: "/api/play-admin/logout";
        readonly method: "POST";
    };
    readonly postApiPlayAdminMaintenance: {
        readonly path: "/api/play-admin/maintenance";
        readonly method: "POST";
    };
    readonly postApiPlayAdminOwnerSession: {
        readonly path: "/api/play-admin/owner-session";
        readonly method: "POST";
    };
    readonly postApiPlayAdminPermissionGroups: {
        readonly path: "/api/play-admin/permission-groups";
        readonly method: "POST";
    };
    readonly postApiPlayAdminPlayers: {
        readonly path: "/api/play-admin/players";
        readonly method: "POST";
    };
    readonly postApiPlayAdminPlayersBatch: {
        readonly path: "/api/play-admin/players/batch";
        readonly method: "POST";
    };
    readonly postApiPlayAdminPlayersSubjectId: {
        readonly path: "/api/play-admin/players/{subjectId}";
        readonly method: "POST";
    };
    readonly postApiPlayAdminScriptModeration: {
        readonly path: "/api/play-admin/script-moderation";
        readonly method: "POST";
    };
    readonly postApiPlayAdminSelfPassword: {
        readonly path: "/api/play-admin/self-password";
        readonly method: "POST";
    };
    readonly postApiPlayAdminVerify: {
        readonly path: "/api/play-admin/verify";
        readonly method: "POST";
    };
    readonly postApiPlayerAuthLogin: {
        readonly path: "/api/player-auth/login";
        readonly method: "POST";
    };
    readonly postApiPlayerAuthLogout: {
        readonly path: "/api/player-auth/logout";
        readonly method: "POST";
    };
    readonly postApiPlayerAuthPassword: {
        readonly path: "/api/player-auth/password";
        readonly method: "POST";
    };
    readonly postApiPlayerAuthRegister: {
        readonly path: "/api/player-auth/register";
        readonly method: "POST";
    };
    readonly postApiPlayerAuthTransfer: {
        readonly path: "/api/player-auth/transfer";
        readonly method: "POST";
    };
    readonly postApiPlayerInternalLoginTransfer: {
        readonly path: "/api/player-internal/login-transfer";
        readonly method: "POST";
    };
    readonly postApiPlayerInternalLogout: {
        readonly path: "/api/player-internal/logout";
        readonly method: "POST";
    };
    readonly postApiPlayerInternalMapAdmission: {
        readonly path: "/api/player-internal/map-admission";
        readonly method: "POST";
    };
    readonly postApiPlayerInternalRuntimeIdentity: {
        readonly path: "/api/player-internal/runtime-identity";
        readonly method: "POST";
    };
    readonly postApiPlayerInternalScriptMetadata: {
        readonly path: "/api/player-internal/script-metadata";
        readonly method: "POST";
    };
    readonly postApiPlayerInternalScriptModeration: {
        readonly path: "/api/player-internal/script-moderation";
        readonly method: "POST";
    };
    readonly postApiPlayLogout: {
        readonly path: "/api/play-logout";
        readonly method: "POST";
    };
    readonly postApiPlayPresence: {
        readonly path: "/api/play-presence";
        readonly method: "POST";
    };
    readonly postApiProjectModels: {
        readonly path: "/api/project-models";
        readonly method: "POST";
    };
    readonly postApiProjectScripts: {
        readonly path: "/api/project-scripts";
        readonly method: "POST";
    };
    readonly postApiProjectSkins: {
        readonly path: "/api/project-skins";
        readonly method: "POST";
    };
    readonly postApiRealtimeSession: {
        readonly path: "/api/realtime/session";
        readonly method: "POST";
    };
    readonly postApiRuntimeEnsure: {
        readonly path: "/api/runtime/ensure";
        readonly method: "POST";
    };
    readonly postApiSystemBackups: {
        readonly path: "/api/system/backups";
        readonly method: "POST";
    };
    readonly postBlock: {
        readonly path: "/block";
        readonly method: "POST";
    };
    readonly postBlockHash: {
        readonly path: "/block/{hash}";
        readonly method: "POST";
    };
    readonly postCreateSession: {
        readonly path: "/createSession";
        readonly method: "POST";
    };
    readonly postInternalSaveLocalProject: {
        readonly path: "/internal/save-local-project";
        readonly method: "POST";
    };
    readonly postLocalRuntimeDestroy: {
        readonly path: "/__local_runtime/destroy";
        readonly method: "POST";
    };
    readonly postLocalRuntimeStart: {
        readonly path: "/__local_runtime/start";
        readonly method: "POST";
    };
    readonly postRoomRoomIdLocalRuntimeDestroy: {
        readonly path: "/__room/{roomId}/__local_runtime/destroy";
        readonly method: "POST";
    };
    readonly putApiCreatorModelsId: {
        readonly path: "/api/creator-models/{id}";
        readonly method: "PUT";
    };
    readonly putApiCreatorV1ProjectsProjectIdScriptsSideEntry: {
        readonly path: "/api/creator/v1/projects/{projectId}/scripts/{side}/{entry}";
        readonly method: "PUT";
    };
    readonly putApiCreatorV1ProjectsProjectIdStorageScopeSpace: {
        readonly path: "/api/creator/v1/projects/{projectId}/storage/{scope}/{space}";
        readonly method: "PUT";
    };
    readonly putApiLocalDefaultSkin: {
        readonly path: "/api/local/default-skin";
        readonly method: "PUT";
    };
    readonly putApiLocalModelsId: {
        readonly path: "/api/local/models/{id}";
        readonly method: "PUT";
    };
};
export interface ApiClientOptions extends ClientOptions {
    csrfCookie?: string;
    csrfHeader?: string;
    defaultErrorMessage?: string;
}
export declare class ApiClientError extends Error {
    readonly response: Response;
    readonly details: unknown;
    constructor(message: string, response: Response, details: unknown);
}
export declare class ApiClient {
    readonly raw: Client<paths>;
    private readonly paths;
    private readonly defaultErrorMessage;
    constructor(options?: ApiClientOptions);
    private unwrap;
    deleteApiCreatorModelsIdRaw(...init: Parameters<PathBasedClient<paths>["/api/creator-models/{id}"]["DELETE"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    deleteApiCreatorModelsId(...init: Parameters<PathBasedClient<paths>["/api/creator-models/{id}"]["DELETE"]>): Promise<{
        [x: string]: unknown;
    }>;
    deleteApiCreatorV1ProjectsProjectIdSceneSessionRaw(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/scene/session"]["DELETE"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    deleteApiCreatorV1ProjectsProjectIdSceneSession(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/scene/session"]["DELETE"]>): Promise<{
        [x: string]: unknown;
    }>;
    deleteApiCreatorV1ProjectsProjectIdStorageScopeSpaceRaw(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/storage/{scope}/{space}"]["DELETE"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                key?: string;
                limit?: string;
                page?: string;
            };
            header?: never;
            path: {
                projectId: string;
                scope: string;
                space: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: {
                key?: string;
                limit?: string;
                page?: string;
            };
            header?: never;
            path: {
                projectId: string;
                scope: string;
                space: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    key?: string;
                    limit?: string;
                    page?: string;
                };
                header?: never;
                path: {
                    projectId: string;
                    scope: string;
                    space: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    key?: string;
                    limit?: string;
                    page?: string;
                };
                header?: never;
                path: {
                    projectId: string;
                    scope: string;
                    space: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    deleteApiCreatorV1ProjectsProjectIdStorageScopeSpace(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/storage/{scope}/{space}"]["DELETE"]>): Promise<{
        [x: string]: unknown;
    }>;
    deleteApiLocalModelsIdRaw(...init: Parameters<PathBasedClient<paths>["/api/local/models/{id}"]["DELETE"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    deleteApiLocalModelsId(...init: Parameters<PathBasedClient<paths>["/api/local/models/{id}"]["DELETE"]>): Promise<{
        [x: string]: unknown;
    }>;
    deleteApiLocalProjectsIdRaw(...init: Parameters<PathBasedClient<paths>["/api/local-projects/{id}"]["DELETE"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    deleteApiLocalProjectsId(...init: Parameters<PathBasedClient<paths>["/api/local-projects/{id}"]["DELETE"]>): Promise<{
        [x: string]: unknown;
    }>;
    deleteApiPlayAdminAdminsIdRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/admins/{id}"]["DELETE"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    deleteApiPlayAdminAdminsId(...init: Parameters<PathBasedClient<paths>["/api/play-admin/admins/{id}"]["DELETE"]>): Promise<{
        [x: string]: unknown;
    }>;
    deleteApiPlayAdminContainerResourceGroupsIdRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/container-resource-groups/{id}"]["DELETE"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    deleteApiPlayAdminContainerResourceGroupsId(...init: Parameters<PathBasedClient<paths>["/api/play-admin/container-resource-groups/{id}"]["DELETE"]>): Promise<{
        [x: string]: unknown;
    }>;
    deleteApiPlayAdminContainersPermanentMapIdRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/containers/{permanentMapId}"]["DELETE"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                permanentMapId: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                permanentMapId: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    permanentMapId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    permanentMapId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    deleteApiPlayAdminContainersPermanentMapId(...init: Parameters<PathBasedClient<paths>["/api/play-admin/containers/{permanentMapId}"]["DELETE"]>): Promise<{
        [x: string]: unknown;
    }>;
    deleteApiPlayAdminImportRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/import"]["DELETE"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                mode?: string;
                resourceId?: string;
                reviewId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                mode?: string;
                resourceId?: string;
                reviewId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    mode?: string;
                    resourceId?: string;
                    reviewId?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    mode?: string;
                    resourceId?: string;
                    reviewId?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    deleteApiPlayAdminImport(...init: Parameters<PathBasedClient<paths>["/api/play-admin/import"]["DELETE"]>): Promise<{
        [x: string]: unknown;
    }>;
    deleteApiPlayAdminLibraryImportRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/library/import"]["DELETE"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                section?: string;
                mode?: string;
                reviewId?: string;
                resourceId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                section?: string;
                mode?: string;
                reviewId?: string;
                resourceId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    section?: string;
                    mode?: string;
                    reviewId?: string;
                    resourceId?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    section?: string;
                    mode?: string;
                    reviewId?: string;
                    resourceId?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    deleteApiPlayAdminLibraryImport(...init: Parameters<PathBasedClient<paths>["/api/play-admin/library/import"]["DELETE"]>): Promise<{
        [x: string]: unknown;
    }>;
    deleteApiPlayAdminLibrarySectionRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/library/{section}"]["DELETE"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                section: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                section: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    section: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    section: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    deleteApiPlayAdminLibrarySection(...init: Parameters<PathBasedClient<paths>["/api/play-admin/library/{section}"]["DELETE"]>): Promise<{
        [x: string]: unknown;
    }>;
    deleteApiPlayAdminLibrarySectionIdRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/library/{section}/{id}"]["DELETE"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                section: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                section: string;
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    section: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    section: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    deleteApiPlayAdminLibrarySectionId(...init: Parameters<PathBasedClient<paths>["/api/play-admin/library/{section}/{id}"]["DELETE"]>): Promise<{
        [x: string]: unknown;
    }>;
    deleteApiPlayAdminPermissionGroupsIdRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/permission-groups/{id}"]["DELETE"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    deleteApiPlayAdminPermissionGroupsId(...init: Parameters<PathBasedClient<paths>["/api/play-admin/permission-groups/{id}"]["DELETE"]>): Promise<{
        [x: string]: unknown;
    }>;
    deleteApiPlayAdminPlayersSubjectIdRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/players/{subjectId}"]["DELETE"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                subjectId: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                subjectId: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    subjectId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    subjectId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    deleteApiPlayAdminPlayersSubjectId(...init: Parameters<PathBasedClient<paths>["/api/play-admin/players/{subjectId}"]["DELETE"]>): Promise<{
        [x: string]: unknown;
    }>;
    deleteApiPlayAdminWorldsIdRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/worlds/{id}"]["DELETE"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    deleteApiPlayAdminWorldsId(...init: Parameters<PathBasedClient<paths>["/api/play-admin/worlds/{id}"]["DELETE"]>): Promise<{
        [x: string]: unknown;
    }>;
    deleteApiPlayPresenceRaw(...init: Parameters<PathBasedClient<paths>["/api/play-presence"]["DELETE"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                maps?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                maps?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    maps?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    maps?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    deleteApiPlayPresence(...init: Parameters<PathBasedClient<paths>["/api/play-presence"]["DELETE"]>): Promise<{
        [x: string]: unknown;
    }>;
    deleteApiRuntimeContainerIdRaw(...init: Parameters<PathBasedClient<paths>["/api/runtime/{container_id}"]["DELETE"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                container_id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                container_id: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    container_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    container_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    deleteApiRuntimeContainerId(...init: Parameters<PathBasedClient<paths>["/api/runtime/{container_id}"]["DELETE"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiAuthSessionRaw(...init: Parameters<PathBasedClient<paths>["/api/auth/session"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                source?: string;
                returnUrl?: string;
                transferState?: string;
                transferChallenge?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        player: import("./openapi").components["schemas"]["PlayerLauncherSessionPlayer"] | null;
                        registrationEnabled?: boolean;
                        returnUrl?: string;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                source?: string;
                returnUrl?: string;
                transferState?: string;
                transferChallenge?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    source?: string;
                    returnUrl?: string;
                    transferState?: string;
                    transferChallenge?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            player: import("./openapi").components["schemas"]["PlayerLauncherSessionPlayer"] | null;
                            registrationEnabled?: boolean;
                            returnUrl?: string;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    source?: string;
                    returnUrl?: string;
                    transferState?: string;
                    transferChallenge?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            player: import("./openapi").components["schemas"]["PlayerLauncherSessionPlayer"] | null;
                            registrationEnabled?: boolean;
                            returnUrl?: string;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiAuthSession(...init: Parameters<PathBasedClient<paths>["/api/auth/session"]["GET"]>): Promise<{
        player: {
            subjectId: string;
            username: string;
            displayName: string;
            role: string;
            status: string;
            avatarSkinId?: string | undefined;
        } | null;
        registrationEnabled?: boolean | undefined;
        returnUrl?: string | undefined;
    }>;
    getApiBackupsArchiveDownloadRaw(...init: Parameters<PathBasedClient<paths>["/api/backups/{archive}/download"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                archive: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                archive: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    archive: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    archive: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiBackupsArchiveDownload(...init: Parameters<PathBasedClient<paths>["/api/backups/{archive}/download"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiConfigSlugRaw(...init: Parameters<PathBasedClient<paths>["/api/config/{slug}"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    slug: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    slug: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiConfigSlug(...init: Parameters<PathBasedClient<paths>["/api/config/{slug}"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiCreatorModelsRaw(...init: Parameters<PathBasedClient<paths>["/api/creator-models"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                modelType?: string;
                mapId?: string;
                creativeMode?: string;
                modelName?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                modelType?: string;
                mapId?: string;
                creativeMode?: string;
                modelName?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    modelType?: string;
                    mapId?: string;
                    creativeMode?: string;
                    modelName?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    modelType?: string;
                    mapId?: string;
                    creativeMode?: string;
                    modelName?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiCreatorModels(...init: Parameters<PathBasedClient<paths>["/api/creator-models"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiCreatorModelsBlobsHashRaw(...init: Parameters<PathBasedClient<paths>["/api/creator-models/blobs/{hash}"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                hash: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                hash: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    hash: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    hash: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiCreatorModelsBlobsHash(...init: Parameters<PathBasedClient<paths>["/api/creator-models/blobs/{hash}"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiCreatorModelsIdExportRaw(...init: Parameters<PathBasedClient<paths>["/api/creator-models/{id}/export"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiCreatorModelsIdExport(...init: Parameters<PathBasedClient<paths>["/api/creator-models/{id}/export"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiCreatorPermissionsRaw(...init: Parameters<PathBasedClient<paths>["/api/creator-permissions"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiCreatorPermissions(...init: Parameters<PathBasedClient<paths>["/api/creator-permissions"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiCreatorV1HealthRaw(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/health"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiCreatorV1Health(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/health"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiCreatorV1ProjectsRaw(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiCreatorV1Projects(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiCreatorV1ProjectsProjectIdResourcesRaw(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/resources"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiCreatorV1ProjectsProjectIdResources(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/resources"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiCreatorV1ProjectsProjectIdRuntimeRaw(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/runtime"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiCreatorV1ProjectsProjectIdRuntime(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/runtime"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiCreatorV1ProjectsProjectIdRuntimeEventsRaw(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/runtime/events"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiCreatorV1ProjectsProjectIdRuntimeEvents(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/runtime/events"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiCreatorV1ProjectsProjectIdSceneActionRaw(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/scene/action"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiCreatorV1ProjectsProjectIdSceneAction(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/scene/action"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiCreatorV1ProjectsProjectIdSceneCaptureRaw(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/scene/capture"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                view?: string;
            };
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: {
                view?: string;
            };
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    view?: string;
                };
                header?: never;
                path: {
                    projectId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    view?: string;
                };
                header?: never;
                path: {
                    projectId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiCreatorV1ProjectsProjectIdSceneCapture(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/scene/capture"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiCreatorV1ProjectsProjectIdSceneSessionRaw(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/scene/session"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiCreatorV1ProjectsProjectIdSceneSession(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/scene/session"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiCreatorV1ProjectsProjectIdScriptsRaw(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/scripts"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiCreatorV1ProjectsProjectIdScripts(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/scripts"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiCreatorV1ProjectsProjectIdScriptsSideEntryRaw(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/scripts/{side}/{entry}"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                side: string;
                entry: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                side: string;
                entry: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                    side: string;
                    entry: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                    side: string;
                    entry: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiCreatorV1ProjectsProjectIdScriptsSideEntry(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/scripts/{side}/{entry}"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiCreatorV1ProjectsProjectIdStorageScopeSpaceRaw(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/storage/{scope}/{space}"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                key?: string;
                limit?: string;
                page?: string;
            };
            header?: never;
            path: {
                projectId: string;
                scope: string;
                space: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: {
                key?: string;
                limit?: string;
                page?: string;
            };
            header?: never;
            path: {
                projectId: string;
                scope: string;
                space: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    key?: string;
                    limit?: string;
                    page?: string;
                };
                header?: never;
                path: {
                    projectId: string;
                    scope: string;
                    space: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    key?: string;
                    limit?: string;
                    page?: string;
                };
                header?: never;
                path: {
                    projectId: string;
                    scope: string;
                    space: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiCreatorV1ProjectsProjectIdStorageScopeSpace(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/storage/{scope}/{space}"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiDiagnosticsArchiveDownloadRaw(...init: Parameters<PathBasedClient<paths>["/api/diagnostics/{archive}/download"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                archive: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                archive: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    archive: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    archive: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiDiagnosticsArchiveDownload(...init: Parameters<PathBasedClient<paths>["/api/diagnostics/{archive}/download"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiGetMapInfoRaw(...init: Parameters<PathBasedClient<paths>["/api/getMapInfo"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiGetMapInfo(...init: Parameters<PathBasedClient<paths>["/api/getMapInfo"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiHealthRaw(...init: Parameters<PathBasedClient<paths>["/api/health"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiHealth(...init: Parameters<PathBasedClient<paths>["/api/health"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiHealthCheckRaw(...init: Parameters<PathBasedClient<paths>["/api/health-check"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        status: string;
                        runtime?: string;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            status: string;
                            runtime?: string;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            status: string;
                            runtime?: string;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiHealthCheck(...init: Parameters<PathBasedClient<paths>["/api/health-check"]["GET"]>): Promise<{
        status: string;
        runtime?: string | undefined;
    }>;
    getApiLocalBlobsHashRaw(...init: Parameters<PathBasedClient<paths>["/api/local/blobs/{hash}"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                hash: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                hash: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    hash: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    hash: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiLocalBlobsHash(...init: Parameters<PathBasedClient<paths>["/api/local/blobs/{hash}"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiLocalDefaultSkinRaw(...init: Parameters<PathBasedClient<paths>["/api/local/default-skin"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                mapId?: string;
                projectKey?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                mapId?: string;
                projectKey?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    mapId?: string;
                    projectKey?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    mapId?: string;
                    projectKey?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiLocalDefaultSkin(...init: Parameters<PathBasedClient<paths>["/api/local/default-skin"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiLocalModelsRaw(...init: Parameters<PathBasedClient<paths>["/api/local/models"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                creativeMode?: string;
                mapId?: string;
                modelName?: string;
                modelType?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                creativeMode?: string;
                mapId?: string;
                modelName?: string;
                modelType?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    creativeMode?: string;
                    mapId?: string;
                    modelName?: string;
                    modelType?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    creativeMode?: string;
                    mapId?: string;
                    modelName?: string;
                    modelType?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiLocalModels(...init: Parameters<PathBasedClient<paths>["/api/local/models"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiLocalModelsIdRaw(...init: Parameters<PathBasedClient<paths>["/api/local/models/{id}"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiLocalModelsId(...init: Parameters<PathBasedClient<paths>["/api/local/models/{id}"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiLocalModelsIdExportRaw(...init: Parameters<PathBasedClient<paths>["/api/local/models/{id}/export"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiLocalModelsIdExport(...init: Parameters<PathBasedClient<paths>["/api/local/models/{id}/export"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiLocalModelsIdSnapshotsRaw(...init: Parameters<PathBasedClient<paths>["/api/local/models/{id}/snapshots"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                autoSave?: string;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: {
                autoSave?: string;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    autoSave?: string;
                };
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    autoSave?: string;
                };
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiLocalModelsIdSnapshots(...init: Parameters<PathBasedClient<paths>["/api/local/models/{id}/snapshots"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiLocalProjectsRaw(...init: Parameters<PathBasedClient<paths>["/api/local-projects"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiLocalProjects(...init: Parameters<PathBasedClient<paths>["/api/local-projects"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiLocalProjectsAssetDistributionRaw(...init: Parameters<PathBasedClient<paths>["/api/local-projects/asset-distribution"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiLocalProjectsAssetDistribution(...init: Parameters<PathBasedClient<paths>["/api/local-projects/asset-distribution"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiLocalProjectsIdExportRaw(...init: Parameters<PathBasedClient<paths>["/api/local-projects/{id}/export"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                scope?: string;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: {
                scope?: string;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    scope?: string;
                };
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    scope?: string;
                };
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiLocalProjectsIdExport(...init: Parameters<PathBasedClient<paths>["/api/local-projects/{id}/export"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiLocalProjectsIdMapsRaw(...init: Parameters<PathBasedClient<paths>["/api/local-projects/{id}/maps"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiLocalProjectsIdMaps(...init: Parameters<PathBasedClient<paths>["/api/local-projects/{id}/maps"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiLocalProjectsIdRuntimeRaw(...init: Parameters<PathBasedClient<paths>["/api/local-projects/{id}/runtime"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiLocalProjectsIdRuntime(...init: Parameters<PathBasedClient<paths>["/api/local-projects/{id}/runtime"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiLocalProjectsIdSnapshotsRaw(...init: Parameters<PathBasedClient<paths>["/api/local-projects/{id}/snapshots"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiLocalProjectsIdSnapshots(...init: Parameters<PathBasedClient<paths>["/api/local-projects/{id}/snapshots"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiOperationsIdRaw(...init: Parameters<PathBasedClient<paths>["/api/operations/{id}"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiOperationsId(...init: Parameters<PathBasedClient<paths>["/api/operations/{id}"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiPlayAdminActivityRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/activity"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                page?: string;
                pageSize?: string;
                kind?: string;
                search?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        events: import("./openapi").components["schemas"]["PlayerAdminActivity"][];
                        total: number;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                page?: string;
                pageSize?: string;
                kind?: string;
                search?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    page?: string;
                    pageSize?: string;
                    kind?: string;
                    search?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            events: import("./openapi").components["schemas"]["PlayerAdminActivity"][];
                            total: number;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    page?: string;
                    pageSize?: string;
                    kind?: string;
                    search?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            events: import("./openapi").components["schemas"]["PlayerAdminActivity"][];
                            total: number;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayAdminActivity(...init: Parameters<PathBasedClient<paths>["/api/play-admin/activity"]["GET"]>): Promise<{
        events: {
            id: string;
            kind: "login" | "admin";
            action: string;
            actor: string;
            actorDisplayName: string;
            subjectId: string;
            displayName: string;
            username: string;
            ip: string;
            userAgent?: string | undefined;
            details?: {
                [x: string]: unknown;
            } | undefined;
            createdAt: string;
        }[];
        total: number;
    }>;
    getApiPlayAdminAdminsRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/admins"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        admins: import("./openapi").components["schemas"]["PlayerAdminAccount"][];
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            admins: import("./openapi").components["schemas"]["PlayerAdminAccount"][];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            admins: import("./openapi").components["schemas"]["PlayerAdminAccount"][];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayAdminAdmins(...init: Parameters<PathBasedClient<paths>["/api/play-admin/admins"]["GET"]>): Promise<{
        admins: {
            id: string;
            username: string;
            displayName: string;
            role: "admin" | "moderator";
            status: "active" | "disabled";
            permissionGroupId?: string | undefined;
            permissionGroupName?: string | undefined;
            lastLoginAt?: string | undefined;
        }[];
    }>;
    getApiPlayAdminContainerResourceGroupsRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/container-resource-groups"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        resourceGroups: import("./openapi").components["schemas"]["ContainerResourceGroup"][];
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            resourceGroups: import("./openapi").components["schemas"]["ContainerResourceGroup"][];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            resourceGroups: import("./openapi").components["schemas"]["ContainerResourceGroup"][];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayAdminContainerResourceGroups(...init: Parameters<PathBasedClient<paths>["/api/play-admin/container-resource-groups"]["GET"]>): Promise<{
        resourceGroups: {
            id?: string | undefined;
            name: string;
            cpuMilli: number;
            memoryMb: number;
            description: string;
            networkPolicy: "unrestricted" | "private";
            processLimit: number;
            bandwidthMbps: number | null;
        }[];
    }>;
    getApiPlayAdminContainersRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/containers"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                mode?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ContainerCatalog"];
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                mode?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    mode?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ContainerCatalog"];
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    mode?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ContainerCatalog"];
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayAdminContainers(...init: Parameters<PathBasedClient<paths>["/api/play-admin/containers"]["GET"]>): Promise<{
        mode: "play" | "creator";
        defaults: {
            playerLimit: number;
            roomLimit: number;
            idleTimeoutMs: number;
            cpuMilli: number | null;
            memoryMb: number | null;
        };
        profiles: {
            permanentMapId: string;
            mode: "play";
            playerLimit: number;
            roomLimit: number;
            idleTimeoutMs: number;
            cpuMilli: number | null;
            memoryMb: number | null;
            resourceGroupId?: string | undefined;
            configurationScope: "group" | "map";
            configurationRootId: string;
        }[];
        resourceGroups: {
            id?: string | undefined;
            name: string;
            cpuMilli: number;
            memoryMb: number;
            description: string;
            networkPolicy: "unrestricted" | "private";
            processLimit: number;
            bandwidthMbps: number | null;
        }[];
        availableMaps: {
            permanentMapId: string;
            name: string;
            version?: string | undefined;
            mapGroupId?: string | undefined;
            memberCount?: number | undefined;
        }[];
        allMaps: {
            permanentMapId: string;
            name: string;
            version?: string | undefined;
            mapGroupId?: string | undefined;
            memberCount?: number | undefined;
        }[];
        maps: {
            id: string;
            permanentMapId: string;
            name: string;
            version?: string | undefined;
            mapGroupId?: string | undefined;
            mapRole: "main" | "submap";
            mainProjectId: string;
            status: {
                phase: string;
                percent: number;
                message: string;
                cpuPercent?: number | undefined;
                memoryBytes?: number | undefined;
                uptimeMs?: number | undefined;
                processCount?: number | undefined;
                onlineCount?: number | undefined;
                rooms?: {
                    roomId: string;
                    active: boolean;
                }[] | undefined;
            };
            profile?: {
                permanentMapId: string;
                mode: "play";
                playerLimit: number;
                roomLimit: number;
                idleTimeoutMs: number;
                cpuMilli: number | null;
                memoryMb: number | null;
                resourceGroupId?: string | undefined;
                configurationScope: "group" | "map";
                configurationRootId: string;
            } | undefined;
        }[];
    }>;
    getApiPlayAdminIdentityBansRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/identity-bans"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                kind?: string;
                page?: string;
                pageSize?: string;
                search?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        bans: import("./openapi").components["schemas"]["IdentityBan"][];
                        total: number;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                kind?: string;
                page?: string;
                pageSize?: string;
                search?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    kind?: string;
                    page?: string;
                    pageSize?: string;
                    search?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            bans: import("./openapi").components["schemas"]["IdentityBan"][];
                            total: number;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    kind?: string;
                    page?: string;
                    pageSize?: string;
                    search?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            bans: import("./openapi").components["schemas"]["IdentityBan"][];
                            total: number;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayAdminIdentityBans(...init: Parameters<PathBasedClient<paths>["/api/play-admin/identity-bans"]["GET"]>): Promise<{
        bans: {
            id: string;
            kind: "ip" | "device";
            displayValue: string;
            reason: string;
            bannedAt: string;
            bannedUntil?: string | undefined;
            sourceSubjectId?: string | undefined;
            sourceDisplayName: string;
            sourceUsername: string;
        }[];
        total: number;
    }>;
    getApiPlayAdminImportRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/import"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                mode?: string;
                resourceId?: string;
                reviewId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                mode?: string;
                resourceId?: string;
                reviewId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    mode?: string;
                    resourceId?: string;
                    reviewId?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    mode?: string;
                    resourceId?: string;
                    reviewId?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayAdminImport(...init: Parameters<PathBasedClient<paths>["/api/play-admin/import"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiPlayAdminImportResourceRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/import-resource"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                resourceId?: string;
                reviewId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                resourceId?: string;
                reviewId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    resourceId?: string;
                    reviewId?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    resourceId?: string;
                    reviewId?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayAdminImportResource(...init: Parameters<PathBasedClient<paths>["/api/play-admin/import-resource"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiPlayAdminLibraryImportRaw<const Init extends Parameters<PathBasedClient<paths>["/api/play-admin/library/import"]["GET"]>>(...init: Init): Promise<FetchResponse<paths["/api/play-admin/library/import"]["get"], Init[0], `${string}/${string}`>>;
    getApiPlayAdminLibraryImport<const Init extends Parameters<PathBasedClient<paths>["/api/play-admin/library/import"]["GET"]>>(...init: Init): Promise<NonNullable<FetchResponse<paths["/api/play-admin/library/import"]["get"], Init[0], `${string}/${string}`>["data"]>>;
    getApiPlayAdminLibrarySectionRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/library/{section}"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                section: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                section: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    section: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    section: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiPlayAdminLibrarySection(...init: Parameters<PathBasedClient<paths>["/api/play-admin/library/{section}"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiPlayAdminLibrarySectionIdRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/library/{section}/{id}"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                section: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                section: string;
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    section: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    section: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiPlayAdminLibrarySectionId(...init: Parameters<PathBasedClient<paths>["/api/play-admin/library/{section}/{id}"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiPlayAdminPermissionGroupsRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/permission-groups"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        groups: import("./openapi").components["schemas"]["PermissionGroup"][];
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            groups: import("./openapi").components["schemas"]["PermissionGroup"][];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            groups: import("./openapi").components["schemas"]["PermissionGroup"][];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayAdminPermissionGroups(...init: Parameters<PathBasedClient<paths>["/api/play-admin/permission-groups"]["GET"]>): Promise<{
        groups: {
            id: string;
            name: string;
            permissions: string[];
            adminCount: number;
            createdAt?: string | undefined;
        }[];
    }>;
    getApiPlayAdminPlayersRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/players"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                identity?: string;
                online?: string;
                search?: string;
                page?: string;
                pageSize?: string;
                sort?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        players: import("./openapi").components["schemas"]["Player"][];
                        total: number;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                identity?: string;
                online?: string;
                search?: string;
                page?: string;
                pageSize?: string;
                sort?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    identity?: string;
                    online?: string;
                    search?: string;
                    page?: string;
                    pageSize?: string;
                    sort?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            players: import("./openapi").components["schemas"]["Player"][];
                            total: number;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    identity?: string;
                    online?: string;
                    search?: string;
                    page?: string;
                    pageSize?: string;
                    sort?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            players: import("./openapi").components["schemas"]["Player"][];
                            total: number;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayAdminPlayers(...init: Parameters<PathBasedClient<paths>["/api/play-admin/players"]["GET"]>): Promise<{
        players: {
            subjectId: string;
            userId: string;
            username: string;
            displayName: string;
            boxId: string;
            userKey?: string | undefined;
            status: "active" | "banned";
            guest: boolean;
            createdAt?: string | undefined;
            registeredAt?: string | undefined;
            lastSeenAt?: string | undefined;
            lastLoginAt?: string | undefined;
            firstSeenIp?: string | undefined;
            registrationIp?: string | undefined;
            lastLoginIp?: string | undefined;
            lastSeenIp?: string | undefined;
            loginCount: number;
            activeSessionCount: number;
            tags: string[];
            adminNote: string;
            banReason?: string | undefined;
            bannedUntil?: string | undefined;
            creatorAccess?: boolean | undefined;
            creatorPermissions?: string[] | undefined;
            activeCreatorTokenCount?: number | undefined;
        }[];
        total: number;
    }>;
    getApiPlayAdminPlayersExportRaw<const Init extends Parameters<PathBasedClient<paths>["/api/play-admin/players/export"]["GET"]>>(...init: Init): Promise<FetchResponse<paths["/api/play-admin/players/export"]["get"], Init[0], `${string}/${string}`>>;
    getApiPlayAdminPlayersExport<const Init extends Parameters<PathBasedClient<paths>["/api/play-admin/players/export"]["GET"]>>(...init: Init): Promise<NonNullable<FetchResponse<paths["/api/play-admin/players/export"]["get"], Init[0], `${string}/${string}`>["data"]>>;
    getApiPlayAdminPlayersOverviewRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/players/overview"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        totals: {
                            [key: string]: number;
                        };
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            totals: {
                                [key: string]: number;
                            };
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            totals: {
                                [key: string]: number;
                            };
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayAdminPlayersOverview(...init: Parameters<PathBasedClient<paths>["/api/play-admin/players/overview"]["GET"]>): Promise<{
        totals: {
            [x: string]: number;
        };
    }>;
    getApiPlayAdminPlayersSubjectIdRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/players/{subjectId}"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                subjectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                subjectId: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    subjectId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    subjectId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiPlayAdminPlayersSubjectId(...init: Parameters<PathBasedClient<paths>["/api/play-admin/players/{subjectId}"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiPlayAdminScriptModerationRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/script-moderation"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        keys: {
                            id: string;
                            adminId: string | null;
                            adminName: string | null;
                            permissions: string[] | null;
                            name: string;
                            scope: "map" | "server";
                            maximumBanSeconds: 0 | number;
                            expiresAt: string;
                            revokedAt: string | null;
                        }[];
                        maps: {
                            mapId: string;
                            groupId: string;
                            name: string;
                            projectId: string;
                            publicId: string;
                            description: string;
                            version: string;
                            mode: "edit" | "play";
                            observedAt: string;
                        }[];
                        bindings: {
                            mapId: string;
                            mode: "edit" | "play";
                            keyId: string;
                        }[];
                        bans: {
                            id: string;
                            mapId: string;
                            subjectId: string;
                            kind: string;
                            reason: string;
                            expiresAt: string | null;
                        }[];
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            keys: {
                                id: string;
                                adminId: string | null;
                                adminName: string | null;
                                permissions: string[] | null;
                                name: string;
                                scope: "map" | "server";
                                maximumBanSeconds: 0 | number;
                                expiresAt: string;
                                revokedAt: string | null;
                            }[];
                            maps: {
                                mapId: string;
                                groupId: string;
                                name: string;
                                projectId: string;
                                publicId: string;
                                description: string;
                                version: string;
                                mode: "edit" | "play";
                                observedAt: string;
                            }[];
                            bindings: {
                                mapId: string;
                                mode: "edit" | "play";
                                keyId: string;
                            }[];
                            bans: {
                                id: string;
                                mapId: string;
                                subjectId: string;
                                kind: string;
                                reason: string;
                                expiresAt: string | null;
                            }[];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            keys: {
                                id: string;
                                adminId: string | null;
                                adminName: string | null;
                                permissions: string[] | null;
                                name: string;
                                scope: "map" | "server";
                                maximumBanSeconds: 0 | number;
                                expiresAt: string;
                                revokedAt: string | null;
                            }[];
                            maps: {
                                mapId: string;
                                groupId: string;
                                name: string;
                                projectId: string;
                                publicId: string;
                                description: string;
                                version: string;
                                mode: "edit" | "play";
                                observedAt: string;
                            }[];
                            bindings: {
                                mapId: string;
                                mode: "edit" | "play";
                                keyId: string;
                            }[];
                            bans: {
                                id: string;
                                mapId: string;
                                subjectId: string;
                                kind: string;
                                reason: string;
                                expiresAt: string | null;
                            }[];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayAdminScriptModeration(...init: Parameters<PathBasedClient<paths>["/api/play-admin/script-moderation"]["GET"]>): Promise<{
        keys: {
            id: string;
            adminId: string | null;
            adminName: string | null;
            permissions: string[] | null;
            name: string;
            scope: "map" | "server";
            maximumBanSeconds: 0 | number;
            expiresAt: string;
            revokedAt: string | null;
        }[];
        maps: {
            mapId: string;
            groupId: string;
            name: string;
            projectId: string;
            publicId: string;
            description: string;
            version: string;
            mode: "edit" | "play";
            observedAt: string;
        }[];
        bindings: {
            mapId: string;
            mode: "edit" | "play";
            keyId: string;
        }[];
        bans: {
            id: string;
            mapId: string;
            subjectId: string;
            kind: string;
            reason: string;
            expiresAt: string | null;
        }[];
    }>;
    getApiPlayAdminStatusRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/status"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayAdminStatus(...init: Parameters<PathBasedClient<paths>["/api/play-admin/status"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiPlayAdminVerifyRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/verify"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        actor: import("./openapi").components["schemas"]["PlayerAdminActor"];
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            actor: import("./openapi").components["schemas"]["PlayerAdminActor"];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            actor: import("./openapi").components["schemas"]["PlayerAdminActor"];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayAdminVerify(...init: Parameters<PathBasedClient<paths>["/api/play-admin/verify"]["GET"]>): Promise<{
        actor: {
            displayName: string;
            username?: string | undefined;
            role: "moderator" | "admin" | "owner";
            credential: string;
            permissions: string[];
        };
    }>;
    getApiPlayAdminWorldsRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/worlds"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayAdminWorlds(...init: Parameters<PathBasedClient<paths>["/api/play-admin/worlds"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiPlayAdminWorldsStatusRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/worlds/status"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayAdminWorldsStatus(...init: Parameters<PathBasedClient<paths>["/api/play-admin/worlds/status"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiPlayerAuthLoginRequiredRaw(...init: Parameters<PathBasedClient<paths>["/api/player-auth/login-required"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                source?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                source?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    source?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    source?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayerAuthLoginRequired(...init: Parameters<PathBasedClient<paths>["/api/player-auth/login-required"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiPlayerAuthSessionRaw(...init: Parameters<PathBasedClient<paths>["/api/player-auth/session"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayerAuthSession(...init: Parameters<PathBasedClient<paths>["/api/player-auth/session"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiPlayerInternalMapLibraryRaw(...init: Parameters<PathBasedClient<paths>["/api/player-internal/map-library"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayerInternalMapLibrary(...init: Parameters<PathBasedClient<paths>["/api/player-internal/map-library"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiPlayerInternalRevocationsRaw(...init: Parameters<PathBasedClient<paths>["/api/player-internal/revocations"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                after?: string;
                since?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                after?: string;
                since?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    after?: string;
                    since?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    after?: string;
                    since?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayerInternalRevocations(...init: Parameters<PathBasedClient<paths>["/api/player-internal/revocations"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiPlayerLauncherBootstrapRaw(...init: Parameters<PathBasedClient<paths>["/api/player-launcher/bootstrap"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["PlayerLauncherBootstrap"];
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["PlayerLauncherBootstrap"];
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["PlayerLauncherBootstrap"];
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayerLauncherBootstrap(...init: Parameters<PathBasedClient<paths>["/api/player-launcher/bootstrap"]["GET"]>): Promise<{
        protocolVersion: 1;
        serverName: string;
        loginRequired: boolean;
        loginApiUrl: string;
        signingKey: {
            keyId: string;
            publicKey: {
                kty: string;
                crv: string;
                x: string;
                y: string;
            };
        } | null;
    }>;
    getApiPlayerLauncherMapsRaw(...init: Parameters<PathBasedClient<paths>["/api/player-launcher/maps"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        worlds: import("./openapi").components["schemas"]["PlayerLauncherWorld"][];
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            worlds: import("./openapi").components["schemas"]["PlayerLauncherWorld"][];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            worlds: import("./openapi").components["schemas"]["PlayerLauncherWorld"][];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayerLauncherMaps(...init: Parameters<PathBasedClient<paths>["/api/player-launcher/maps"]["GET"]>): Promise<{
        worlds: {
            id: string;
            permanentMapId: string;
            publicId: string;
            name: string;
            author: string;
            description: string;
            cover?: string | undefined;
            loadingCover?: string | undefined;
            version: string;
            onlineCount: number;
        }[];
    }>;
    getApiPlayerLauncherMapsMapIdDescriptorRaw(...init: Parameters<PathBasedClient<paths>["/api/player-launcher/maps/{mapId}/descriptor"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                mapId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["PlayerLauncherPackageDescriptor"];
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                mapId: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    mapId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["PlayerLauncherPackageDescriptor"];
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    mapId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["PlayerLauncherPackageDescriptor"];
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiPlayerLauncherMapsMapIdDescriptor(...init: Parameters<PathBasedClient<paths>["/api/player-launcher/maps/{mapId}/descriptor"]["GET"]>): Promise<{
        formatVersion: 1;
        permanentMapId: string;
        accessId: string;
        releaseVersion: string;
        manifestDigest: string;
        required: {
            hash: string;
            size: number;
            kind: "static";
            contentType: "application/octet-stream";
        }[];
        optional: {
            hash: string;
            size: number;
            kind: "static";
            contentType: "application/octet-stream";
        }[];
        signature: {
            algorithm: "ES256";
            keyId: string;
            publicKey: {
                kty: string;
                crv: string;
                x: string;
                y: string;
            };
            value: string;
        };
    }>;
    getApiPlayerLauncherMapsMapIdDownloadPlanRaw(...init: Parameters<PathBasedClient<paths>["/api/player-launcher/maps/{mapId}/download-plan"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                mapId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["PlayerLauncherDownloadPlan"];
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                mapId: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    mapId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["PlayerLauncherDownloadPlan"];
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    mapId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["PlayerLauncherDownloadPlan"];
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiPlayerLauncherMapsMapIdDownloadPlan(...init: Parameters<PathBasedClient<paths>["/api/player-launcher/maps/{mapId}/download-plan"]["GET"]>): Promise<{
        permanentMapId: string;
        manifestDigest: string;
        ticket: string;
        expiresAt: number;
    }>;
    getApiPlayerLoginCallbackRaw(...init: Parameters<PathBasedClient<paths>["/api/player-login/callback"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query: {
                code: string;
                state: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            303: {
                headers: {
                    Location?: string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query: {
                code: string;
                state: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query: {
                    code: string;
                    state: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                303: {
                    headers: {
                        Location?: string;
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query: {
                    code: string;
                    state: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                303: {
                    headers: {
                        Location?: string;
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiPlayerLoginCallback(...init: Parameters<PathBasedClient<paths>["/api/player-login/callback"]["GET"]>): Promise<never>;
    getApiPlayerLoginStartRaw(...init: Parameters<PathBasedClient<paths>["/api/player-login/start"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                returnUrl?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            302: {
                headers: {
                    Location?: string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                returnUrl?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    returnUrl?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                302: {
                    headers: {
                        Location?: string;
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    returnUrl?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                302: {
                    headers: {
                        Location?: string;
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayerLoginStart(...init: Parameters<PathBasedClient<paths>["/api/player-login/start"]["GET"]>): Promise<never>;
    getApiPlayLibraryRaw(...init: Parameters<PathBasedClient<paths>["/api/play-library"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        player: import("./openapi").components["schemas"]["PlayerLauncherSessionPlayer"];
                        entries: import("./openapi").components["schemas"]["PlayerMapLibraryEntry"][];
                        libraryEnabled: boolean;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            player: import("./openapi").components["schemas"]["PlayerLauncherSessionPlayer"];
                            entries: import("./openapi").components["schemas"]["PlayerMapLibraryEntry"][];
                            libraryEnabled: boolean;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            player: import("./openapi").components["schemas"]["PlayerLauncherSessionPlayer"];
                            entries: import("./openapi").components["schemas"]["PlayerMapLibraryEntry"][];
                            libraryEnabled: boolean;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayLibrary(...init: Parameters<PathBasedClient<paths>["/api/play-library"]["GET"]>): Promise<{
        player: {
            subjectId: string;
            username: string;
            displayName: string;
            role: string;
            status: string;
            avatarSkinId?: string | undefined;
        };
        entries: {
            mapId: string;
            favorite: boolean;
            lastPlayedAt: string | null;
        }[];
        libraryEnabled: boolean;
    }>;
    getApiPlayPresenceRaw(...init: Parameters<PathBasedClient<paths>["/api/play-presence"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                maps?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                maps?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    maps?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    maps?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayPresence(...init: Parameters<PathBasedClient<paths>["/api/play-presence"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiPlayResourceCacheWorldRaw(...init: Parameters<PathBasedClient<paths>["/api/play-resource-cache/{world}"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                world: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                world: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    world: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    world: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiPlayResourceCacheWorld(...init: Parameters<PathBasedClient<paths>["/api/play-resource-cache/{world}"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiPlayWorldsRaw(...init: Parameters<PathBasedClient<paths>["/api/play-worlds"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiPlayWorlds(...init: Parameters<PathBasedClient<paths>["/api/play-worlds"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiProjectModelsRaw(...init: Parameters<PathBasedClient<paths>["/api/project-models"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiProjectModels(...init: Parameters<PathBasedClient<paths>["/api/project-models"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiProjectSkinPreviewsRaw(...init: Parameters<PathBasedClient<paths>["/api/project-skin-previews"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiProjectSkinPreviews(...init: Parameters<PathBasedClient<paths>["/api/project-skin-previews"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiProjectSkinsRaw(...init: Parameters<PathBasedClient<paths>["/api/project-skins"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiProjectSkins(...init: Parameters<PathBasedClient<paths>["/api/project-skins"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiRuntimeContainerIdStatsRaw(...init: Parameters<PathBasedClient<paths>["/api/runtime/{container_id}/stats"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                container_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                container_id: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    container_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    container_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiRuntimeContainerIdStats(...init: Parameters<PathBasedClient<paths>["/api/runtime/{container_id}/stats"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiServerInfoRaw(...init: Parameters<PathBasedClient<paths>["/api/server-info"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiServerInfo(...init: Parameters<PathBasedClient<paths>["/api/server-info"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiSessionRaw(...init: Parameters<PathBasedClient<paths>["/api/session"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiSession(...init: Parameters<PathBasedClient<paths>["/api/session"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiSystemBackupsRaw(...init: Parameters<PathBasedClient<paths>["/api/system/backups"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiSystemBackups(...init: Parameters<PathBasedClient<paths>["/api/system/backups"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiSystemBackupsProjectIdNameRaw(...init: Parameters<PathBasedClient<paths>["/api/system/backups/{projectId}/{name}"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                name: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                name: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                    name: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                    name: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getApiSystemBackupsProjectIdName(...init: Parameters<PathBasedClient<paths>["/api/system/backups/{projectId}/{name}"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getApiSystemStatusRaw(...init: Parameters<PathBasedClient<paths>["/api/system/status"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getApiSystemStatus(...init: Parameters<PathBasedClient<paths>["/api/system/status"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getBlockHashRaw(...init: Parameters<PathBasedClient<paths>["/block/{hash}"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                hash: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                hash: string;
            };
            cookie?: never;
        };
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    hash: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    hash: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    getBlockHash(...init: Parameters<PathBasedClient<paths>["/block/{hash}"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getInternalCreatorPreviewRuntimeRaw(...init: Parameters<PathBasedClient<paths>["/internal/creator-preview-runtime"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getInternalCreatorPreviewRuntime(...init: Parameters<PathBasedClient<paths>["/internal/creator-preview-runtime"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getInternalCreatorPreviewRuntimeEventsRaw(...init: Parameters<PathBasedClient<paths>["/internal/creator-preview-runtime/events"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getInternalCreatorPreviewRuntimeEvents(...init: Parameters<PathBasedClient<paths>["/internal/creator-preview-runtime/events"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    getLocalRuntimeStatusRaw(...init: Parameters<PathBasedClient<paths>["/__local_runtime/status"]["GET"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    getLocalRuntimeStatus(...init: Parameters<PathBasedClient<paths>["/__local_runtime/status"]["GET"]>): Promise<{
        [x: string]: unknown;
    }>;
    patchApiAuthProfileRaw(...init: Parameters<PathBasedClient<paths>["/api/auth/profile"]["PATCH"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    displayName: string;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        player: import("./openapi").components["schemas"]["PlayerSelfProfile"];
                    };
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
            429: {
                headers: {
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: {
            displayName: string;
        } & {};
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        displayName: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            player: import("./openapi").components["schemas"]["PlayerSelfProfile"];
                        };
                    };
                };
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                429: {
                    headers: {
                        "Retry-After"?: number;
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        displayName: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            player: import("./openapi").components["schemas"]["PlayerSelfProfile"];
                        };
                    };
                };
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                429: {
                    headers: {
                        "Retry-After"?: number;
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    patchApiAuthProfile(...init: Parameters<PathBasedClient<paths>["/api/auth/profile"]["PATCH"]>): Promise<{
        player: {
            subjectId: string;
            userId: string;
            username: string;
            displayName: string;
        };
    }>;
    patchApiCreatorProfileRaw(...init: Parameters<PathBasedClient<paths>["/api/creator-profile"]["PATCH"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    patchApiCreatorProfile(...init: Parameters<PathBasedClient<paths>["/api/creator-profile"]["PATCH"]>): Promise<{
        [x: string]: unknown;
    }>;
    patchApiLocalProjectsAssetDistributionRaw(...init: Parameters<PathBasedClient<paths>["/api/local-projects/asset-distribution"]["PATCH"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    patchApiLocalProjectsAssetDistribution(...init: Parameters<PathBasedClient<paths>["/api/local-projects/asset-distribution"]["PATCH"]>): Promise<{
        [x: string]: unknown;
    }>;
    patchApiLocalProjectsIdRaw(...init: Parameters<PathBasedClient<paths>["/api/local-projects/{id}"]["PATCH"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    patchApiLocalProjectsId(...init: Parameters<PathBasedClient<paths>["/api/local-projects/{id}"]["PATCH"]>): Promise<{
        [x: string]: unknown;
    }>;
    patchApiPlayAdminAdminsIdRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/admins/{id}"]["PATCH"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    displayName?: string;
                    password?: string;
                    permissionGroupId?: string | null;
                    status?: "active" | "disabled";
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body: {
            displayName?: string | undefined;
            password?: string | undefined;
            permissionGroupId?: (string | null) | undefined;
            status?: ("active" | "disabled") | undefined;
        } & {};
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        displayName?: string;
                        password?: string;
                        permissionGroupId?: string | null;
                        status?: "active" | "disabled";
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        displayName?: string;
                        password?: string;
                        permissionGroupId?: string | null;
                        status?: "active" | "disabled";
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    patchApiPlayAdminAdminsId(...init: Parameters<PathBasedClient<paths>["/api/play-admin/admins/{id}"]["PATCH"]>): Promise<{
        [x: string]: unknown;
    }>;
    patchApiPlayAdminContainerResourceGroupsIdRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/container-resource-groups/{id}"]["PATCH"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": import("./openapi").components["schemas"]["ContainerResourceGroup"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body: {
            id?: string | undefined;
            name: string;
            cpuMilli: number;
            memoryMb: number;
            description: string;
            networkPolicy: "unrestricted" | "private";
            processLimit: number;
            bandwidthMbps: number | null;
        } & {};
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": import("./openapi").components["schemas"]["ContainerResourceGroup"];
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": import("./openapi").components["schemas"]["ContainerResourceGroup"];
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    patchApiPlayAdminContainerResourceGroupsId(...init: Parameters<PathBasedClient<paths>["/api/play-admin/container-resource-groups/{id}"]["PATCH"]>): Promise<{
        [x: string]: unknown;
    }>;
    patchApiPlayAdminLibrarySectionRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/library/{section}"]["PATCH"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                section: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                section: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    section: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    section: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    patchApiPlayAdminLibrarySection(...init: Parameters<PathBasedClient<paths>["/api/play-admin/library/{section}"]["PATCH"]>): Promise<{
        [x: string]: unknown;
    }>;
    patchApiPlayAdminLibrarySectionIdRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/library/{section}/{id}"]["PATCH"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                section: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                section: string;
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    section: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    section: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    patchApiPlayAdminLibrarySectionId(...init: Parameters<PathBasedClient<paths>["/api/play-admin/library/{section}/{id}"]["PATCH"]>): Promise<{
        [x: string]: unknown;
    }>;
    patchApiPlayAdminPermissionGroupsIdRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/permission-groups/{id}"]["PATCH"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    patchApiPlayAdminPermissionGroupsId(...init: Parameters<PathBasedClient<paths>["/api/play-admin/permission-groups/{id}"]["PATCH"]>): Promise<{
        [x: string]: unknown;
    }>;
    patchApiPlayAdminPlayersSubjectIdRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/players/{subjectId}"]["PATCH"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                subjectId: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                subjectId: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    subjectId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    subjectId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    patchApiPlayAdminPlayersSubjectId(...init: Parameters<PathBasedClient<paths>["/api/play-admin/players/{subjectId}"]["PATCH"]>): Promise<{
        [x: string]: unknown;
    }>;
    patchApiPlayAdminWorldsIdRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/worlds/{id}"]["PATCH"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    patchApiPlayAdminWorldsId(...init: Parameters<PathBasedClient<paths>["/api/play-admin/worlds/{id}"]["PATCH"]>): Promise<{
        [x: string]: unknown;
    }>;
    patchApiPlayerAuthProfileRaw(...init: Parameters<PathBasedClient<paths>["/api/player-auth/profile"]["PATCH"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    displayName: string;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        player: import("./openapi").components["schemas"]["PlayerSelfProfile"];
                    };
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
            429: {
                headers: {
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: {
            displayName: string;
        } & {};
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        displayName: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            player: import("./openapi").components["schemas"]["PlayerSelfProfile"];
                        };
                    };
                };
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                429: {
                    headers: {
                        "Retry-After"?: number;
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        displayName: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            player: import("./openapi").components["schemas"]["PlayerSelfProfile"];
                        };
                    };
                };
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                429: {
                    headers: {
                        "Retry-After"?: number;
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    patchApiPlayerAuthProfile(...init: Parameters<PathBasedClient<paths>["/api/player-auth/profile"]["PATCH"]>): Promise<{
        player: {
            subjectId: string;
            userId: string;
            username: string;
            displayName: string;
        };
    }>;
    patchApiPlayerInternalMapLibraryRaw(...init: Parameters<PathBasedClient<paths>["/api/player-internal/map-library"]["PATCH"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    patchApiPlayerInternalMapLibrary(...init: Parameters<PathBasedClient<paths>["/api/player-internal/map-library"]["PATCH"]>): Promise<{
        [x: string]: unknown;
    }>;
    patchApiPlayerInternalProfileRaw(...init: Parameters<PathBasedClient<paths>["/api/player-internal/profile"]["PATCH"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    patchApiPlayerInternalProfile(...init: Parameters<PathBasedClient<paths>["/api/player-internal/profile"]["PATCH"]>): Promise<{
        [x: string]: unknown;
    }>;
    patchApiPlayLibraryRaw(...init: Parameters<PathBasedClient<paths>["/api/play-library"]["PATCH"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    mapId: string;
                    favorite?: boolean;
                    played?: boolean;
                };
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: {
            mapId: string;
            favorite?: boolean | undefined;
            played?: boolean | undefined;
        } & {};
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        mapId: string;
                        favorite?: boolean;
                        played?: boolean;
                    };
                };
            };
            responses: {
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        mapId: string;
                        favorite?: boolean;
                        played?: boolean;
                    };
                };
            };
            responses: {
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    patchApiPlayLibrary(...init: Parameters<PathBasedClient<paths>["/api/play-library"]["PATCH"]>): Promise<undefined>;
    patchApiPlayProfileRaw(...init: Parameters<PathBasedClient<paths>["/api/play-profile"]["PATCH"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    displayName?: string;
                    avatarSkinId?: string;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        player: import("./openapi").components["schemas"]["PlayerLauncherSessionPlayer"];
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: {
            displayName?: string | undefined;
            avatarSkinId?: string | undefined;
        } & {};
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        displayName?: string;
                        avatarSkinId?: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            player: import("./openapi").components["schemas"]["PlayerLauncherSessionPlayer"];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        displayName?: string;
                        avatarSkinId?: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            player: import("./openapi").components["schemas"]["PlayerLauncherSessionPlayer"];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    patchApiPlayProfile(...init: Parameters<PathBasedClient<paths>["/api/play-profile"]["PATCH"]>): Promise<{
        player: {
            subjectId: string;
            username: string;
            displayName: string;
            role: string;
            status: string;
            avatarSkinId?: string | undefined;
        };
    }>;
    postApiAuthLoginRaw(...init: Parameters<PathBasedClient<paths>["/api/auth/login"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    username: string;
                    password: string;
                    source?: string;
                    returnUrl?: string;
                    transferState?: string;
                    transferChallenge?: string;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        player: import("./openapi").components["schemas"]["PlayerLauncherSessionPlayer"] | null;
                        registrationEnabled?: boolean;
                        returnUrl?: string;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: {
            username: string;
            password: string;
            source?: string | undefined;
            returnUrl?: string | undefined;
            transferState?: string | undefined;
            transferChallenge?: string | undefined;
        } & {};
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        username: string;
                        password: string;
                        source?: string;
                        returnUrl?: string;
                        transferState?: string;
                        transferChallenge?: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            player: import("./openapi").components["schemas"]["PlayerLauncherSessionPlayer"] | null;
                            registrationEnabled?: boolean;
                            returnUrl?: string;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        username: string;
                        password: string;
                        source?: string;
                        returnUrl?: string;
                        transferState?: string;
                        transferChallenge?: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            player: import("./openapi").components["schemas"]["PlayerLauncherSessionPlayer"] | null;
                            registrationEnabled?: boolean;
                            returnUrl?: string;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiAuthLogin(...init: Parameters<PathBasedClient<paths>["/api/auth/login"]["POST"]>): Promise<{
        player: {
            subjectId: string;
            username: string;
            displayName: string;
            role: string;
            status: string;
            avatarSkinId?: string | undefined;
        } | null;
        registrationEnabled?: boolean | undefined;
        returnUrl?: string | undefined;
    }>;
    postApiAuthLogoutRaw(...init: Parameters<PathBasedClient<paths>["/api/auth/logout"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": Record<string, never>;
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        loggedOut: boolean;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: {} & {
            [x: string]: undefined;
        };
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": Record<string, never>;
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            loggedOut: boolean;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": Record<string, never>;
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            loggedOut: boolean;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiAuthLogout(...init: Parameters<PathBasedClient<paths>["/api/auth/logout"]["POST"]>): Promise<{
        loggedOut: boolean;
    }>;
    postApiAuthPasswordRaw(...init: Parameters<PathBasedClient<paths>["/api/auth/password"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    currentPassword: string;
                    newPassword: string;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        changed: true;
                        reloginRequired: true;
                    };
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
            429: {
                headers: {
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: {
            currentPassword: string;
            newPassword: string;
        } & {};
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        currentPassword: string;
                        newPassword: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            changed: true;
                            reloginRequired: true;
                        };
                    };
                };
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                429: {
                    headers: {
                        "Retry-After"?: number;
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        currentPassword: string;
                        newPassword: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            changed: true;
                            reloginRequired: true;
                        };
                    };
                };
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                429: {
                    headers: {
                        "Retry-After"?: number;
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiAuthPassword(...init: Parameters<PathBasedClient<paths>["/api/auth/password"]["POST"]>): Promise<{
        changed: true;
        reloginRequired: true;
    }>;
    postApiAuthRegisterRaw(...init: Parameters<PathBasedClient<paths>["/api/auth/register"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    username: string;
                    displayName: string;
                    password: string;
                    source?: string;
                    returnUrl?: string;
                    transferState?: string;
                    transferChallenge?: string;
                };
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        player: import("./openapi").components["schemas"]["PlayerLauncherSessionPlayer"] | null;
                        registrationEnabled?: boolean;
                        returnUrl?: string;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: {
            username: string;
            displayName: string;
            password: string;
            source?: string | undefined;
            returnUrl?: string | undefined;
            transferState?: string | undefined;
            transferChallenge?: string | undefined;
        } & {};
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        username: string;
                        displayName: string;
                        password: string;
                        source?: string;
                        returnUrl?: string;
                        transferState?: string;
                        transferChallenge?: string;
                    };
                };
            };
            responses: {
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            player: import("./openapi").components["schemas"]["PlayerLauncherSessionPlayer"] | null;
                            registrationEnabled?: boolean;
                            returnUrl?: string;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        username: string;
                        displayName: string;
                        password: string;
                        source?: string;
                        returnUrl?: string;
                        transferState?: string;
                        transferChallenge?: string;
                    };
                };
            };
            responses: {
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            player: import("./openapi").components["schemas"]["PlayerLauncherSessionPlayer"] | null;
                            registrationEnabled?: boolean;
                            returnUrl?: string;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiAuthRegister(...init: Parameters<PathBasedClient<paths>["/api/auth/register"]["POST"]>): Promise<{
        player: {
            subjectId: string;
            username: string;
            displayName: string;
            role: string;
            status: string;
            avatarSkinId?: string | undefined;
        } | null;
        registrationEnabled?: boolean | undefined;
        returnUrl?: string | undefined;
    }>;
    postApiBackupsUploadRaw(...init: Parameters<PathBasedClient<paths>["/api/backups/upload"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiBackupsUpload(...init: Parameters<PathBasedClient<paths>["/api/backups/upload"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiCommandsNameRaw(...init: Parameters<PathBasedClient<paths>["/api/commands/{name}"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                name: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                name: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    name: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    name: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiCommandsName(...init: Parameters<PathBasedClient<paths>["/api/commands/{name}"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiCreateSessionRaw(...init: Parameters<PathBasedClient<paths>["/api/createSession"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiCreateSession(...init: Parameters<PathBasedClient<paths>["/api/createSession"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiCreatorLogoutRaw(...init: Parameters<PathBasedClient<paths>["/api/creator-logout"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiCreatorLogout(...init: Parameters<PathBasedClient<paths>["/api/creator-logout"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiCreatorModelsImportRaw(...init: Parameters<PathBasedClient<paths>["/api/creator-models/import"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiCreatorModelsImport(...init: Parameters<PathBasedClient<paths>["/api/creator-models/import"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiCreatorV1ProjectsProjectIdRuntimeRaw(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/runtime"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiCreatorV1ProjectsProjectIdRuntime(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/runtime"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiCreatorV1ProjectsProjectIdSceneActionsRequestIdRaw(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/scene/actions/{requestId}"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                requestId: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                requestId: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                    requestId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                    requestId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiCreatorV1ProjectsProjectIdSceneActionsRequestId(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/scene/actions/{requestId}"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiCreatorV1ProjectsProjectIdSceneSessionRaw(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/scene/session"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiCreatorV1ProjectsProjectIdSceneSession(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/scene/session"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiLocalBlobRaw(...init: Parameters<PathBasedClient<paths>["/api/local/blob"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiLocalBlob(...init: Parameters<PathBasedClient<paths>["/api/local/blob"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiLocalModelsRaw(...init: Parameters<PathBasedClient<paths>["/api/local/models"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                creativeMode?: string;
                mapId?: string;
                modelName?: string;
                modelType?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                creativeMode?: string;
                mapId?: string;
                modelName?: string;
                modelType?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    creativeMode?: string;
                    mapId?: string;
                    modelName?: string;
                    modelType?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    creativeMode?: string;
                    mapId?: string;
                    modelName?: string;
                    modelType?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiLocalModels(...init: Parameters<PathBasedClient<paths>["/api/local/models"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiLocalModelsImportRaw(...init: Parameters<PathBasedClient<paths>["/api/local/models/import"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiLocalModelsImport(...init: Parameters<PathBasedClient<paths>["/api/local/models/import"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiLocalProjectsRaw(...init: Parameters<PathBasedClient<paths>["/api/local-projects"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiLocalProjects(...init: Parameters<PathBasedClient<paths>["/api/local-projects"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiLocalProjectsIdMapsRaw(...init: Parameters<PathBasedClient<paths>["/api/local-projects/{id}/maps"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiLocalProjectsIdMaps(...init: Parameters<PathBasedClient<paths>["/api/local-projects/{id}/maps"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiLocalProjectsIdPackageRaw(...init: Parameters<PathBasedClient<paths>["/api/local-projects/{id}/package"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiLocalProjectsIdPackage(...init: Parameters<PathBasedClient<paths>["/api/local-projects/{id}/package"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiLocalProjectsIdPublishRaw(...init: Parameters<PathBasedClient<paths>["/api/local-projects/{id}/publish"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiLocalProjectsIdPublish(...init: Parameters<PathBasedClient<paths>["/api/local-projects/{id}/publish"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiLocalProjectsIdRuntimeRaw(...init: Parameters<PathBasedClient<paths>["/api/local-projects/{id}/runtime"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiLocalProjectsIdRuntime(...init: Parameters<PathBasedClient<paths>["/api/local-projects/{id}/runtime"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiLocalProjectsIdSnapshotsRaw(...init: Parameters<PathBasedClient<paths>["/api/local-projects/{id}/snapshots"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiLocalProjectsIdSnapshots(...init: Parameters<PathBasedClient<paths>["/api/local-projects/{id}/snapshots"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiLocalProjectsImportRaw(...init: Parameters<PathBasedClient<paths>["/api/local-projects/import"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                mode?: string;
                targetMainProjectId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                mode?: string;
                targetMainProjectId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    mode?: string;
                    targetMainProjectId?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    mode?: string;
                    targetMainProjectId?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiLocalProjectsImport(...init: Parameters<PathBasedClient<paths>["/api/local-projects/import"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiPlayAdminAdminsRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/admins"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    username: string;
                    displayName: string;
                    password: string;
                    permissionGroupId: string;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: {
            username: string;
            displayName: string;
            password: string;
            permissionGroupId: string;
        } & {};
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        username: string;
                        displayName: string;
                        password: string;
                        permissionGroupId: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        username: string;
                        displayName: string;
                        password: string;
                        permissionGroupId: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiPlayAdminAdmins(...init: Parameters<PathBasedClient<paths>["/api/play-admin/admins"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiPlayAdminContainerResourceGroupsRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/container-resource-groups"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": import("./openapi").components["schemas"]["ContainerResourceGroup"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: {
            id?: string | undefined;
            name: string;
            cpuMilli: number;
            memoryMb: number;
            description: string;
            networkPolicy: "unrestricted" | "private";
            processLimit: number;
            bandwidthMbps: number | null;
        } & {};
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": import("./openapi").components["schemas"]["ContainerResourceGroup"];
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": import("./openapi").components["schemas"]["ContainerResourceGroup"];
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiPlayAdminContainerResourceGroups(...init: Parameters<PathBasedClient<paths>["/api/play-admin/container-resource-groups"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiPlayAdminContainersRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/containers"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                mode?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                mode?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    mode?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    mode?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiPlayAdminContainers(...init: Parameters<PathBasedClient<paths>["/api/play-admin/containers"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiPlayAdminIdentityBansRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/identity-bans"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                kind?: string;
                page?: string;
                pageSize?: string;
                search?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                kind?: string;
                page?: string;
                pageSize?: string;
                search?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    kind?: string;
                    page?: string;
                    pageSize?: string;
                    search?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    kind?: string;
                    page?: string;
                    pageSize?: string;
                    search?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiPlayAdminIdentityBans(...init: Parameters<PathBasedClient<paths>["/api/play-admin/identity-bans"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiPlayAdminImportRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/import"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                mode?: string;
                resourceId?: string;
                reviewId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                mode?: string;
                resourceId?: string;
                reviewId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    mode?: string;
                    resourceId?: string;
                    reviewId?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    mode?: string;
                    resourceId?: string;
                    reviewId?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiPlayAdminImport(...init: Parameters<PathBasedClient<paths>["/api/play-admin/import"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiPlayAdminLibraryImportRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/library/import"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                section?: string;
                mode?: string;
                reviewId?: string;
                resourceId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": unknown;
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: {
                section?: string;
                mode?: string;
                reviewId?: string;
                resourceId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: unknown;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    section?: string;
                    mode?: string;
                    reviewId?: string;
                    resourceId?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": unknown;
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    section?: string;
                    mode?: string;
                    reviewId?: string;
                    resourceId?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": unknown;
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiPlayAdminLibraryImport(...init: Parameters<PathBasedClient<paths>["/api/play-admin/library/import"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiPlayAdminLibrarySectionRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/library/{section}"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                section: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                section: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    section: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    section: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiPlayAdminLibrarySection(...init: Parameters<PathBasedClient<paths>["/api/play-admin/library/{section}"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiPlayAdminLibrarySectionIdRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/library/{section}/{id}"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                section: string;
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                section: string;
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    section: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    section: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiPlayAdminLibrarySectionId(...init: Parameters<PathBasedClient<paths>["/api/play-admin/library/{section}/{id}"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiPlayAdminLoginRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/login"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    username: string;
                    password: string;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        actor: import("./openapi").components["schemas"]["PlayerAdminActor"];
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: {
            username: string;
            password: string;
        } & {};
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        username: string;
                        password: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            actor: import("./openapi").components["schemas"]["PlayerAdminActor"];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        username: string;
                        password: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            actor: import("./openapi").components["schemas"]["PlayerAdminActor"];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiPlayAdminLogin(...init: Parameters<PathBasedClient<paths>["/api/play-admin/login"]["POST"]>): Promise<{
        actor: {
            displayName: string;
            username?: string | undefined;
            role: "moderator" | "admin" | "owner";
            credential: string;
            permissions: string[];
        };
    }>;
    postApiPlayAdminLogoutRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/logout"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiPlayAdminLogout(...init: Parameters<PathBasedClient<paths>["/api/play-admin/logout"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiPlayAdminMaintenanceRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/maintenance"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiPlayAdminMaintenance(...init: Parameters<PathBasedClient<paths>["/api/play-admin/maintenance"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiPlayAdminOwnerSessionRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/owner-session"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        actor: import("./openapi").components["schemas"]["PlayerAdminActor"];
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            actor: import("./openapi").components["schemas"]["PlayerAdminActor"];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            actor: import("./openapi").components["schemas"]["PlayerAdminActor"];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiPlayAdminOwnerSession(...init: Parameters<PathBasedClient<paths>["/api/play-admin/owner-session"]["POST"]>): Promise<{
        actor: {
            displayName: string;
            username?: string | undefined;
            role: "moderator" | "admin" | "owner";
            credential: string;
            permissions: string[];
        };
    }>;
    postApiPlayAdminPermissionGroupsRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/permission-groups"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name: string;
                    permissions: string[];
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: {
            name: string;
            permissions: string[];
        } & {};
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        name: string;
                        permissions: string[];
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        name: string;
                        permissions: string[];
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiPlayAdminPermissionGroups(...init: Parameters<PathBasedClient<paths>["/api/play-admin/permission-groups"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiPlayAdminPlayersRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/players"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                identity?: string;
                online?: string;
                search?: string;
                page?: string;
                pageSize?: string;
                sort?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        player: import("./openapi").components["schemas"]["Player"];
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                identity?: string;
                online?: string;
                search?: string;
                page?: string;
                pageSize?: string;
                sort?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    identity?: string;
                    online?: string;
                    search?: string;
                    page?: string;
                    pageSize?: string;
                    sort?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            player: import("./openapi").components["schemas"]["Player"];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    identity?: string;
                    online?: string;
                    search?: string;
                    page?: string;
                    pageSize?: string;
                    sort?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            player: import("./openapi").components["schemas"]["Player"];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiPlayAdminPlayers(...init: Parameters<PathBasedClient<paths>["/api/play-admin/players"]["POST"]>): Promise<{
        player: {
            subjectId: string;
            userId: string;
            username: string;
            displayName: string;
            boxId: string;
            userKey?: string | undefined;
            status: "active" | "banned";
            guest: boolean;
            createdAt?: string | undefined;
            registeredAt?: string | undefined;
            lastSeenAt?: string | undefined;
            lastLoginAt?: string | undefined;
            firstSeenIp?: string | undefined;
            registrationIp?: string | undefined;
            lastLoginIp?: string | undefined;
            lastSeenIp?: string | undefined;
            loginCount: number;
            activeSessionCount: number;
            tags: string[];
            adminNote: string;
            banReason?: string | undefined;
            bannedUntil?: string | undefined;
            creatorAccess?: boolean | undefined;
            creatorPermissions?: string[] | undefined;
            activeCreatorTokenCount?: number | undefined;
        };
    }>;
    postApiPlayAdminPlayersBatchRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/players/batch"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiPlayAdminPlayersBatch(...init: Parameters<PathBasedClient<paths>["/api/play-admin/players/batch"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiPlayAdminPlayersSubjectIdRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/players/{subjectId}"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                subjectId: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                subjectId: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    subjectId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    subjectId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiPlayAdminPlayersSubjectId(...init: Parameters<PathBasedClient<paths>["/api/play-admin/players/{subjectId}"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiPlayAdminScriptModerationRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/script-moderation"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    action: "create";
                    values: {
                        mapId: string;
                        mode?: "edit" | "play";
                        permissions?: ("players.view" | "players.ban" | "identity-bans.manage" | "moderation.view")[];
                        name?: string;
                        scope?: "map" | "server";
                        maximumBanSeconds?: 0 | number;
                        expiresAt?: string;
                    };
                } | {
                    action: "bind";
                    values: {
                        mapId: string;
                        mode: "edit" | "play";
                        keyId: string;
                    };
                } | {
                    action: "update";
                    values: {
                        mapId: string;
                        mode?: "edit" | "play";
                        keyId: string;
                        permissions?: ("players.view" | "players.ban" | "identity-bans.manage" | "moderation.view")[];
                        days?: number;
                        maximumBanSeconds?: 0 | number;
                        scope?: "map" | "server";
                    };
                } | {
                    action: "revoke";
                    keyId: string;
                } | {
                    action: "unbind";
                    mapId: string;
                    mode?: "edit" | "play";
                } | {
                    action: "revoke-map-ban";
                    banId: string;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: ({
            action: "create";
            values: {
                mapId: string;
                mode?: ("edit" | "play") | undefined;
                permissions?: ("players.view" | "players.ban" | "identity-bans.manage" | "moderation.view")[] | undefined;
                name?: string | undefined;
                scope?: ("map" | "server") | undefined;
                maximumBanSeconds?: (0 | number) | undefined;
                expiresAt?: string | undefined;
            } & {};
        } & {}) | ({
            action: "bind";
            values: {
                mapId: string;
                mode: "edit" | "play";
                keyId: string;
            } & {};
        } & {}) | ({
            action: "update";
            values: {
                mapId: string;
                mode?: ("edit" | "play") | undefined;
                keyId: string;
                permissions?: ("players.view" | "players.ban" | "identity-bans.manage" | "moderation.view")[] | undefined;
                days?: number | undefined;
                maximumBanSeconds?: (0 | number) | undefined;
                scope?: ("map" | "server") | undefined;
            } & {};
        } & {}) | ({
            action: "revoke";
            keyId: string;
        } & {}) | ({
            action: "unbind";
            mapId: string;
            mode?: ("edit" | "play") | undefined;
        } & {}) | ({
            action: "revoke-map-ban";
            banId: string;
        } & {});
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        action: "create";
                        values: {
                            mapId: string;
                            mode?: "edit" | "play";
                            permissions?: ("players.view" | "players.ban" | "identity-bans.manage" | "moderation.view")[];
                            name?: string;
                            scope?: "map" | "server";
                            maximumBanSeconds?: 0 | number;
                            expiresAt?: string;
                        };
                    } | {
                        action: "bind";
                        values: {
                            mapId: string;
                            mode: "edit" | "play";
                            keyId: string;
                        };
                    } | {
                        action: "update";
                        values: {
                            mapId: string;
                            mode?: "edit" | "play";
                            keyId: string;
                            permissions?: ("players.view" | "players.ban" | "identity-bans.manage" | "moderation.view")[];
                            days?: number;
                            maximumBanSeconds?: 0 | number;
                            scope?: "map" | "server";
                        };
                    } | {
                        action: "revoke";
                        keyId: string;
                    } | {
                        action: "unbind";
                        mapId: string;
                        mode?: "edit" | "play";
                    } | {
                        action: "revoke-map-ban";
                        banId: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        action: "create";
                        values: {
                            mapId: string;
                            mode?: "edit" | "play";
                            permissions?: ("players.view" | "players.ban" | "identity-bans.manage" | "moderation.view")[];
                            name?: string;
                            scope?: "map" | "server";
                            maximumBanSeconds?: 0 | number;
                            expiresAt?: string;
                        };
                    } | {
                        action: "bind";
                        values: {
                            mapId: string;
                            mode: "edit" | "play";
                            keyId: string;
                        };
                    } | {
                        action: "update";
                        values: {
                            mapId: string;
                            mode?: "edit" | "play";
                            keyId: string;
                            permissions?: ("players.view" | "players.ban" | "identity-bans.manage" | "moderation.view")[];
                            days?: number;
                            maximumBanSeconds?: 0 | number;
                            scope?: "map" | "server";
                        };
                    } | {
                        action: "revoke";
                        keyId: string;
                    } | {
                        action: "unbind";
                        mapId: string;
                        mode?: "edit" | "play";
                    } | {
                        action: "revoke-map-ban";
                        banId: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiPlayAdminScriptModeration(...init: Parameters<PathBasedClient<paths>["/api/play-admin/script-moderation"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiPlayAdminSelfPasswordRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/self-password"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiPlayAdminSelfPassword(...init: Parameters<PathBasedClient<paths>["/api/play-admin/self-password"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiPlayAdminVerifyRaw(...init: Parameters<PathBasedClient<paths>["/api/play-admin/verify"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiPlayAdminVerify(...init: Parameters<PathBasedClient<paths>["/api/play-admin/verify"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiPlayerAuthLoginRaw(...init: Parameters<PathBasedClient<paths>["/api/player-auth/login"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    username: string;
                    password: string;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: {
            username: string;
            password: string;
        } & {};
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        username: string;
                        password: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        username: string;
                        password: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiPlayerAuthLogin(...init: Parameters<PathBasedClient<paths>["/api/player-auth/login"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiPlayerAuthLogoutRaw(...init: Parameters<PathBasedClient<paths>["/api/player-auth/logout"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": Record<string, never>;
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: {} & {
            [x: string]: undefined;
        };
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": Record<string, never>;
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": Record<string, never>;
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiPlayerAuthLogout(...init: Parameters<PathBasedClient<paths>["/api/player-auth/logout"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiPlayerAuthPasswordRaw(...init: Parameters<PathBasedClient<paths>["/api/player-auth/password"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    currentPassword: string;
                    newPassword: string;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        changed: true;
                        reloginRequired: true;
                    };
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
            429: {
                headers: {
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: {
            currentPassword: string;
            newPassword: string;
        } & {};
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        currentPassword: string;
                        newPassword: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            changed: true;
                            reloginRequired: true;
                        };
                    };
                };
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                429: {
                    headers: {
                        "Retry-After"?: number;
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        currentPassword: string;
                        newPassword: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            changed: true;
                            reloginRequired: true;
                        };
                    };
                };
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                429: {
                    headers: {
                        "Retry-After"?: number;
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiPlayerAuthPassword(...init: Parameters<PathBasedClient<paths>["/api/player-auth/password"]["POST"]>): Promise<{
        changed: true;
        reloginRequired: true;
    }>;
    postApiPlayerAuthRegisterRaw(...init: Parameters<PathBasedClient<paths>["/api/player-auth/register"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    username: string;
                    displayName: string;
                    password: string;
                };
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        player: import("./openapi").components["schemas"]["PlayerLauncherSessionPlayer"];
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: {
            username: string;
            displayName: string;
            password: string;
        } & {};
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        username: string;
                        displayName: string;
                        password: string;
                    };
                };
            };
            responses: {
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            player: import("./openapi").components["schemas"]["PlayerLauncherSessionPlayer"];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        username: string;
                        displayName: string;
                        password: string;
                    };
                };
            };
            responses: {
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            player: import("./openapi").components["schemas"]["PlayerLauncherSessionPlayer"];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiPlayerAuthRegister(...init: Parameters<PathBasedClient<paths>["/api/player-auth/register"]["POST"]>): Promise<{
        player: {
            subjectId: string;
            username: string;
            displayName: string;
            role: string;
            status: string;
            avatarSkinId?: string | undefined;
        };
    }>;
    postApiPlayerAuthTransferRaw(...init: Parameters<PathBasedClient<paths>["/api/player-auth/transfer"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    source: "play" | "creator";
                    challenge: string;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: {
            source: "play" | "creator";
            challenge: string;
        } & {};
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        source: "play" | "creator";
                        challenge: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            code: string;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        source: "play" | "creator";
                        challenge: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            code: string;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiPlayerAuthTransfer(...init: Parameters<PathBasedClient<paths>["/api/player-auth/transfer"]["POST"]>): Promise<{
        code: string;
    }>;
    postApiPlayerInternalLoginTransferRaw(...init: Parameters<PathBasedClient<paths>["/api/player-internal/login-transfer"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    code: string;
                    source: "play" | "creator";
                    verifier: string;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        session: string;
                        device: string;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: {
            code: string;
            source: "play" | "creator";
            verifier: string;
        } & {};
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        code: string;
                        source: "play" | "creator";
                        verifier: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            session: string;
                            device: string;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        code: string;
                        source: "play" | "creator";
                        verifier: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            session: string;
                            device: string;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiPlayerInternalLoginTransfer(...init: Parameters<PathBasedClient<paths>["/api/player-internal/login-transfer"]["POST"]>): Promise<{
        session: string;
        device: string;
    }>;
    postApiPlayerInternalLogoutRaw(...init: Parameters<PathBasedClient<paths>["/api/player-internal/logout"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiPlayerInternalLogout(...init: Parameters<PathBasedClient<paths>["/api/player-internal/logout"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiPlayerInternalMapAdmissionRaw(...init: Parameters<PathBasedClient<paths>["/api/player-internal/map-admission"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    mapId: string;
                    userId: string;
                    ipAddress: string;
                    deviceHash?: string;
                } | {
                    mapId: string;
                    players: {
                        userId: string;
                        ipAddress: string;
                        deviceHash?: string;
                    }[];
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        allowed?: boolean;
                        denied?: number[];
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: ({
            mapId: string;
            userId: string;
            ipAddress: string;
            deviceHash?: string | undefined;
        } & {}) | ({
            mapId: string;
            players: ({
                userId: string;
                ipAddress: string;
                deviceHash?: string | undefined;
            } & {})[];
        } & {});
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        mapId: string;
                        userId: string;
                        ipAddress: string;
                        deviceHash?: string;
                    } | {
                        mapId: string;
                        players: {
                            userId: string;
                            ipAddress: string;
                            deviceHash?: string;
                        }[];
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            allowed?: boolean;
                            denied?: number[];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        mapId: string;
                        userId: string;
                        ipAddress: string;
                        deviceHash?: string;
                    } | {
                        mapId: string;
                        players: {
                            userId: string;
                            ipAddress: string;
                            deviceHash?: string;
                        }[];
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            allowed?: boolean;
                            denied?: number[];
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiPlayerInternalMapAdmission(...init: Parameters<PathBasedClient<paths>["/api/player-internal/map-admission"]["POST"]>): Promise<{
        allowed?: boolean | undefined;
        denied?: number[] | undefined;
    }>;
    postApiPlayerInternalRuntimeIdentityRaw(...init: Parameters<PathBasedClient<paths>["/api/player-internal/runtime-identity"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiPlayerInternalRuntimeIdentity(...init: Parameters<PathBasedClient<paths>["/api/player-internal/runtime-identity"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiPlayerInternalScriptMetadataRaw(...init: Parameters<PathBasedClient<paths>["/api/player-internal/script-metadata"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    mapId: string;
                    groupId?: string;
                    mode: "edit" | "play";
                    name: string;
                    projectId?: string;
                    publicId?: string;
                    description?: string;
                    version?: string;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        observed: boolean;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: {
            mapId: string;
            groupId?: string | undefined;
            mode: "edit" | "play";
            name: string;
            projectId?: string | undefined;
            publicId?: string | undefined;
            description?: string | undefined;
            version?: string | undefined;
        } & {};
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        mapId: string;
                        groupId?: string;
                        mode: "edit" | "play";
                        name: string;
                        projectId?: string;
                        publicId?: string;
                        description?: string;
                        version?: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            observed: boolean;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        mapId: string;
                        groupId?: string;
                        mode: "edit" | "play";
                        name: string;
                        projectId?: string;
                        publicId?: string;
                        description?: string;
                        version?: string;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            observed: boolean;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiPlayerInternalScriptMetadata(...init: Parameters<PathBasedClient<paths>["/api/player-internal/script-metadata"]["POST"]>): Promise<{
        observed: boolean;
    }>;
    postApiPlayerInternalScriptModerationRaw(...init: Parameters<PathBasedClient<paths>["/api/player-internal/script-moderation"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    mapId: string;
                    action: "banPlayer" | "banCurrentIP" | "banCurrentDevice" | "revokeBan" | "getPlayerStatus" | "listBans" | "getBan";
                    userId?: string;
                    ipAddress?: string;
                    deviceHash?: string;
                    scope?: "map" | "server";
                    durationSeconds?: number;
                    reason?: string;
                    banId?: string;
                    requestId?: string;
                    kind?: "account" | "ip" | "device";
                    status?: "active" | "expired" | "revoked" | "all";
                    page?: number;
                    pageSize?: number;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        ban: {
                            id: string;
                            kind: "account" | "ip" | "device";
                            scope: "map" | "server";
                            userId: string | null;
                            reason: string;
                            createdAt: string;
                            expiresAt: string | null;
                            revokedAt: string | null;
                            status: "active" | "expired" | "revoked";
                            remainingSeconds: number | null;
                        } | null;
                        replayed: boolean;
                    } | {
                        items: {
                            id: string;
                            kind: "account" | "ip" | "device";
                            scope: "map" | "server";
                            userId: string | null;
                            reason: string;
                            createdAt: string;
                            expiresAt: string | null;
                            revokedAt: string | null;
                            status: "active" | "expired" | "revoked";
                            remainingSeconds: number | null;
                        }[];
                        total: number;
                        page: number;
                        pageSize: number;
                        replayed: boolean;
                    } | {
                        id: string;
                        scope: "map" | "server";
                        expiresAt: string | null;
                        replayed: boolean;
                    } | {
                        id: string;
                        revoked: boolean;
                        replayed: boolean;
                    } | {
                        status: "active" | "banned";
                        replayed: boolean;
                        bans: {
                            id: string;
                            kind: "account" | "ip" | "device";
                            scope: "map" | "server";
                            reason: string;
                            expiresAt: string | null;
                        }[];
                    };
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                        code: number;
                        msg: string;
                    };
                };
            };
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                        code: number;
                        msg: string;
                    };
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                        code: number;
                        msg: string;
                    };
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                        code: number;
                        msg: string;
                    };
                };
            };
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                        code: number;
                        msg: string;
                    };
                };
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                        code: number;
                        msg: string;
                    };
                };
            };
            429: {
                headers: {
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                        code: number;
                        msg: string;
                    };
                };
            };
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                        code: number;
                        msg: string;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body: {
            mapId: string;
            action: "banPlayer" | "banCurrentIP" | "banCurrentDevice" | "revokeBan" | "getPlayerStatus" | "listBans" | "getBan";
            userId?: string | undefined;
            ipAddress?: string | undefined;
            deviceHash?: string | undefined;
            scope?: ("map" | "server") | undefined;
            durationSeconds?: number | undefined;
            reason?: string | undefined;
            banId?: string | undefined;
            requestId?: string | undefined;
            kind?: ("account" | "ip" | "device") | undefined;
            status?: ("active" | "expired" | "revoked" | "all") | undefined;
            page?: number | undefined;
            pageSize?: number | undefined;
        } & {};
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        mapId: string;
                        action: "banPlayer" | "banCurrentIP" | "banCurrentDevice" | "revokeBan" | "getPlayerStatus" | "listBans" | "getBan";
                        userId?: string;
                        ipAddress?: string;
                        deviceHash?: string;
                        scope?: "map" | "server";
                        durationSeconds?: number;
                        reason?: string;
                        banId?: string;
                        requestId?: string;
                        kind?: "account" | "ip" | "device";
                        status?: "active" | "expired" | "revoked" | "all";
                        page?: number;
                        pageSize?: number;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            ban: {
                                id: string;
                                kind: "account" | "ip" | "device";
                                scope: "map" | "server";
                                userId: string | null;
                                reason: string;
                                createdAt: string;
                                expiresAt: string | null;
                                revokedAt: string | null;
                                status: "active" | "expired" | "revoked";
                                remainingSeconds: number | null;
                            } | null;
                            replayed: boolean;
                        } | {
                            items: {
                                id: string;
                                kind: "account" | "ip" | "device";
                                scope: "map" | "server";
                                userId: string | null;
                                reason: string;
                                createdAt: string;
                                expiresAt: string | null;
                                revokedAt: string | null;
                                status: "active" | "expired" | "revoked";
                                remainingSeconds: number | null;
                            }[];
                            total: number;
                            page: number;
                            pageSize: number;
                            replayed: boolean;
                        } | {
                            id: string;
                            scope: "map" | "server";
                            expiresAt: string | null;
                            replayed: boolean;
                        } | {
                            id: string;
                            revoked: boolean;
                            replayed: boolean;
                        } | {
                            status: "active" | "banned";
                            replayed: boolean;
                            bans: {
                                id: string;
                                kind: "account" | "ip" | "device";
                                scope: "map" | "server";
                                reason: string;
                                expiresAt: string | null;
                            }[];
                        };
                    };
                };
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                            code: number;
                            msg: string;
                        };
                    };
                };
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                            code: number;
                            msg: string;
                        };
                    };
                };
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                            code: number;
                            msg: string;
                        };
                    };
                };
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                            code: number;
                            msg: string;
                        };
                    };
                };
                405: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                            code: number;
                            msg: string;
                        };
                    };
                };
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                            code: number;
                            msg: string;
                        };
                    };
                };
                429: {
                    headers: {
                        "Retry-After"?: number;
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                            code: number;
                            msg: string;
                        };
                    };
                };
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                            code: number;
                            msg: string;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        mapId: string;
                        action: "banPlayer" | "banCurrentIP" | "banCurrentDevice" | "revokeBan" | "getPlayerStatus" | "listBans" | "getBan";
                        userId?: string;
                        ipAddress?: string;
                        deviceHash?: string;
                        scope?: "map" | "server";
                        durationSeconds?: number;
                        reason?: string;
                        banId?: string;
                        requestId?: string;
                        kind?: "account" | "ip" | "device";
                        status?: "active" | "expired" | "revoked" | "all";
                        page?: number;
                        pageSize?: number;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            ban: {
                                id: string;
                                kind: "account" | "ip" | "device";
                                scope: "map" | "server";
                                userId: string | null;
                                reason: string;
                                createdAt: string;
                                expiresAt: string | null;
                                revokedAt: string | null;
                                status: "active" | "expired" | "revoked";
                                remainingSeconds: number | null;
                            } | null;
                            replayed: boolean;
                        } | {
                            items: {
                                id: string;
                                kind: "account" | "ip" | "device";
                                scope: "map" | "server";
                                userId: string | null;
                                reason: string;
                                createdAt: string;
                                expiresAt: string | null;
                                revokedAt: string | null;
                                status: "active" | "expired" | "revoked";
                                remainingSeconds: number | null;
                            }[];
                            total: number;
                            page: number;
                            pageSize: number;
                            replayed: boolean;
                        } | {
                            id: string;
                            scope: "map" | "server";
                            expiresAt: string | null;
                            replayed: boolean;
                        } | {
                            id: string;
                            revoked: boolean;
                            replayed: boolean;
                        } | {
                            status: "active" | "banned";
                            replayed: boolean;
                            bans: {
                                id: string;
                                kind: "account" | "ip" | "device";
                                scope: "map" | "server";
                                reason: string;
                                expiresAt: string | null;
                            }[];
                        };
                    };
                };
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                            code: number;
                            msg: string;
                        };
                    };
                };
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                            code: number;
                            msg: string;
                        };
                    };
                };
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                            code: number;
                            msg: string;
                        };
                    };
                };
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                            code: number;
                            msg: string;
                        };
                    };
                };
                405: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                            code: number;
                            msg: string;
                        };
                    };
                };
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                            code: number;
                            msg: string;
                        };
                    };
                };
                429: {
                    headers: {
                        "Retry-After"?: number;
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                            code: number;
                            msg: string;
                        };
                    };
                };
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            status: "MODERATION_PARAMS_INVALID" | "MODERATION_AUTH_REQUIRED" | "MODERATION_FORBIDDEN" | "MODERATION_NOT_FOUND" | "MODERATION_CONFLICT" | "MODERATION_RATE_LIMITED" | "MODERATION_UNAVAILABLE";
                            code: number;
                            msg: string;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postApiPlayerInternalScriptModeration(...init: Parameters<PathBasedClient<paths>["/api/player-internal/script-moderation"]["POST"]>): Promise<{
        ban: {
            id: string;
            kind: "account" | "ip" | "device";
            scope: "map" | "server";
            userId: string | null;
            reason: string;
            createdAt: string;
            expiresAt: string | null;
            revokedAt: string | null;
            status: "active" | "expired" | "revoked";
            remainingSeconds: number | null;
        } | null;
        replayed: boolean;
    } | {
        items: {
            id: string;
            kind: "account" | "ip" | "device";
            scope: "map" | "server";
            userId: string | null;
            reason: string;
            createdAt: string;
            expiresAt: string | null;
            revokedAt: string | null;
            status: "active" | "expired" | "revoked";
            remainingSeconds: number | null;
        }[];
        total: number;
        page: number;
        pageSize: number;
        replayed: boolean;
    } | {
        id: string;
        scope: "map" | "server";
        expiresAt: string | null;
        replayed: boolean;
    } | {
        id: string;
        revoked: boolean;
        replayed: boolean;
    } | {
        status: "active" | "banned";
        replayed: boolean;
        bans: {
            id: string;
            kind: "account" | "ip" | "device";
            scope: "map" | "server";
            reason: string;
            expiresAt: string | null;
        }[];
    }>;
    postApiPlayLogoutRaw(...init: Parameters<PathBasedClient<paths>["/api/play-logout"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiPlayLogout(...init: Parameters<PathBasedClient<paths>["/api/play-logout"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiPlayPresenceRaw(...init: Parameters<PathBasedClient<paths>["/api/play-presence"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                maps?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                maps?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    maps?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    maps?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiPlayPresence(...init: Parameters<PathBasedClient<paths>["/api/play-presence"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiProjectModelsRaw(...init: Parameters<PathBasedClient<paths>["/api/project-models"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiProjectModels(...init: Parameters<PathBasedClient<paths>["/api/project-models"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiProjectScriptsRaw(...init: Parameters<PathBasedClient<paths>["/api/project-scripts"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiProjectScripts(...init: Parameters<PathBasedClient<paths>["/api/project-scripts"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiProjectSkinsRaw(...init: Parameters<PathBasedClient<paths>["/api/project-skins"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiProjectSkins(...init: Parameters<PathBasedClient<paths>["/api/project-skins"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiRealtimeSessionRaw(...init: Parameters<PathBasedClient<paths>["/api/realtime/session"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiRealtimeSession(...init: Parameters<PathBasedClient<paths>["/api/realtime/session"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiRuntimeEnsureRaw(...init: Parameters<PathBasedClient<paths>["/api/runtime/ensure"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiRuntimeEnsure(...init: Parameters<PathBasedClient<paths>["/api/runtime/ensure"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postApiSystemBackupsRaw(...init: Parameters<PathBasedClient<paths>["/api/system/backups"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postApiSystemBackups(...init: Parameters<PathBasedClient<paths>["/api/system/backups"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postBlockRaw(...init: Parameters<PathBasedClient<paths>["/block"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postBlock(...init: Parameters<PathBasedClient<paths>["/block"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postBlockHashRaw(...init: Parameters<PathBasedClient<paths>["/block/{hash}"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                hash: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                hash: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    hash: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    hash: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postBlockHash(...init: Parameters<PathBasedClient<paths>["/block/{hash}"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postCreateSessionRaw(...init: Parameters<PathBasedClient<paths>["/createSession"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postCreateSession(...init: Parameters<PathBasedClient<paths>["/createSession"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postInternalSaveLocalProjectRaw(...init: Parameters<PathBasedClient<paths>["/internal/save-local-project"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postInternalSaveLocalProject(...init: Parameters<PathBasedClient<paths>["/internal/save-local-project"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postLocalRuntimeDestroyRaw(...init: Parameters<PathBasedClient<paths>["/__local_runtime/destroy"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postLocalRuntimeDestroy(...init: Parameters<PathBasedClient<paths>["/__local_runtime/destroy"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postLocalRuntimeStartRaw(...init: Parameters<PathBasedClient<paths>["/__local_runtime/start"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    postLocalRuntimeStart(...init: Parameters<PathBasedClient<paths>["/__local_runtime/start"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    postRoomRoomIdLocalRuntimeDestroyRaw(...init: Parameters<PathBasedClient<paths>["/__room/{roomId}/__local_runtime/destroy"]["POST"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                roomId: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                roomId: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    roomId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    roomId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    postRoomRoomIdLocalRuntimeDestroy(...init: Parameters<PathBasedClient<paths>["/__room/{roomId}/__local_runtime/destroy"]["POST"]>): Promise<{
        [x: string]: unknown;
    }>;
    putApiCreatorModelsIdRaw(...init: Parameters<PathBasedClient<paths>["/api/creator-models/{id}"]["PUT"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    putApiCreatorModelsId(...init: Parameters<PathBasedClient<paths>["/api/creator-models/{id}"]["PUT"]>): Promise<{
        [x: string]: unknown;
    }>;
    putApiCreatorV1ProjectsProjectIdScriptsSideEntryRaw(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/scripts/{side}/{entry}"]["PUT"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                side: string;
                entry: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                side: string;
                entry: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                    side: string;
                    entry: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: string;
                    side: string;
                    entry: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    putApiCreatorV1ProjectsProjectIdScriptsSideEntry(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/scripts/{side}/{entry}"]["PUT"]>): Promise<{
        [x: string]: unknown;
    }>;
    putApiCreatorV1ProjectsProjectIdStorageScopeSpaceRaw(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/storage/{scope}/{space}"]["PUT"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                key?: string;
                limit?: string;
                page?: string;
            };
            header?: never;
            path: {
                projectId: string;
                scope: string;
                space: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: {
                key?: string;
                limit?: string;
                page?: string;
            };
            header?: never;
            path: {
                projectId: string;
                scope: string;
                space: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    key?: string;
                    limit?: string;
                    page?: string;
                };
                header?: never;
                path: {
                    projectId: string;
                    scope: string;
                    space: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    key?: string;
                    limit?: string;
                    page?: string;
                };
                header?: never;
                path: {
                    projectId: string;
                    scope: string;
                    space: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    putApiCreatorV1ProjectsProjectIdStorageScopeSpace(...init: Parameters<PathBasedClient<paths>["/api/creator/v1/projects/{projectId}/storage/{scope}/{space}"]["PUT"]>): Promise<{
        [x: string]: unknown;
    }>;
    putApiLocalDefaultSkinRaw(...init: Parameters<PathBasedClient<paths>["/api/local/default-skin"]["PUT"]>): Promise<FetchResponse<{
        parameters: {
            query?: {
                mapId?: string;
                projectKey?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, ({
        params?: {
            query?: {
                mapId?: string;
                projectKey?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        } | undefined;
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: {
                    mapId?: string;
                    projectKey?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: {
                    mapId?: string;
                    projectKey?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body"> & {
        [key: string]: unknown;
    }) | undefined, `${string}/${string}`>>;
    putApiLocalDefaultSkin(...init: Parameters<PathBasedClient<paths>["/api/local/default-skin"]["PUT"]>): Promise<{
        [x: string]: unknown;
    }>;
    putApiLocalModelsIdRaw(...init: Parameters<PathBasedClient<paths>["/api/local/models/{id}"]["PUT"]>): Promise<FetchResponse<{
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": import("./openapi").components["schemas"]["ApiError"];
                };
            };
        };
    }, {
        params: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
    } & {
        body?: ({
            [x: string]: unknown;
        } & {}) | undefined;
    } & {
        baseUrl?: string;
        querySerializer?: import("openapi-fetch").QuerySerializerOptions | import("openapi-fetch").QuerySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        bodySerializer?: import("openapi-fetch").BodySerializer<{
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
                        };
                    };
                };
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": import("./openapi").components["schemas"]["ApiError"];
                    };
                };
            };
        }> | undefined;
        pathSerializer?: import("openapi-fetch").PathSerializer;
        parseAs?: import("openapi-fetch").ParseAs;
        fetch?: ClientOptions["fetch"];
        headers?: import("openapi-fetch").HeadersOptions;
        middleware?: import("openapi-fetch").Middleware[];
    } & Omit<RequestInit, "headers" | "body">, `${string}/${string}`>>;
    putApiLocalModelsId(...init: Parameters<PathBasedClient<paths>["/api/local/models/{id}"]["PUT"]>): Promise<{
        [x: string]: unknown;
    }>;
}
export declare const createApiClient: (options?: ApiClientOptions) => ApiClient;
//# sourceMappingURL=client.d.ts.map