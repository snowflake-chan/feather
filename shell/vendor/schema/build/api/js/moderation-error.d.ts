import type { ModerationError, ModerationErrorStatus } from './moderation';
/** Stable business codes; independent of the HTTP response status. */
export declare const moderationErrorCodes: {
    readonly MODERATION_PARAMS_INVALID: 41000;
    readonly MODERATION_OPTIONS_INVALID: 41001;
    readonly MODERATION_TARGET_INVALID: 41002;
    readonly MODERATION_PAYLOAD_TOO_LARGE: 41003;
    readonly MODERATION_BATCH_TOO_LARGE: 41004;
    readonly MODERATION_REQUEST_ID_INVALID: 41005;
    readonly MODERATION_REASON_INVALID: 41006;
    readonly MODERATION_DURATION_INVALID: 41007;
    readonly MODERATION_BAN_ID_INVALID: 41008;
    readonly MODERATION_QUERY_INVALID: 41009;
    readonly MODERATION_ACTION_INVALID: 41010;
    readonly MODERATION_IP_INVALID: 41011;
    readonly MODERATION_DEVICE_UNAVAILABLE: 41012;
    readonly MODERATION_METHOD_NOT_ALLOWED: 41013;
    readonly MODERATION_AUTH_REQUIRED: 41100;
    readonly MODERATION_FORBIDDEN: 41300;
    readonly MODERATION_MAP_MISMATCH: 41301;
    readonly MODERATION_GRANT_INVALID: 41302;
    readonly MODERATION_LEGACY_GRANT_INVALID: 41303;
    readonly MODERATION_QUERY_FORBIDDEN: 41304;
    readonly MODERATION_ACTION_FORBIDDEN: 41305;
    readonly MODERATION_BAN_ACCESS_DENIED: 41306;
    readonly MODERATION_DURATION_LIMIT_EXCEEDED: 41307;
    readonly MODERATION_ADMIN_PROTECTED: 41308;
    readonly MODERATION_DEVICE_PROTECTED: 41309;
    readonly MODERATION_SERVER_BAN_FORBIDDEN: 41310;
    readonly MODERATION_GRANT_REQUIRED: 41311;
    readonly MODERATION_GRANT_EXPIRED: 41312;
    readonly MODERATION_GRANT_REVOKED: 41313;
    readonly MODERATION_PERMANENT_FORBIDDEN: 41314;
    readonly MODERATION_NOT_FOUND: 41400;
    readonly MODERATION_PLAYER_OFFLINE: 41401;
    readonly MODERATION_PLAYER_NOT_FOUND: 41402;
    readonly MODERATION_CONFLICT: 41900;
    readonly MODERATION_REQUEST_ID_CONFLICT: 41901;
    readonly MODERATION_BAN_ALREADY_EXISTS: 41902;
    readonly MODERATION_ACCOUNT_ALREADY_PUNISHED: 41903;
    readonly MODERATION_BAN_CHANGED: 41904;
    readonly MODERATION_RATE_LIMITED: 42900;
    readonly MODERATION_RESPONSE_INVALID: 45002;
    readonly MODERATION_INTERNAL_ERROR: 45000;
    readonly MODERATION_UNAVAILABLE: 45003;
    readonly MODERATION_RUNTIME_DISABLED: 45004;
    readonly MODERATION_RATE_LIMIT_UNAVAILABLE: 45005;
    readonly MODERATION_TIMEOUT: 45006;
};
export declare function moderationError(httpStatus: number, msg: string, status?: ModerationErrorStatus): ModerationError;
/** Normalize current replies and legacy HTTP-code replies using the same catalog. */
export declare function normalizeModerationError(error: unknown, code?: number, fallback?: string): ModerationError;
/** Shared by host and HTTP validation, with no dependency on a particular Zod version. */
export declare function moderationValidationError(issues: readonly {
    path: readonly PropertyKey[];
}[]): ModerationError;
