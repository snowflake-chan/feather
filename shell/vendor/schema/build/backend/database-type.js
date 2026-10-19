"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = void 0;
var DB;
(function (DB) {
    let Gender;
    (function (Gender) {
        Gender[Gender["male"] = 0] = "male";
        Gender[Gender["female"] = 1] = "female";
        Gender[Gender["unknow"] = 2] = "unknow";
    })(Gender = DB.Gender || (DB.Gender = {}));
    let UserPermission;
    (function (UserPermission) {
        UserPermission[UserPermission["none"] = 0] = "none";
        UserPermission[UserPermission["canChangePermission"] = 1] = "canChangePermission";
        UserPermission[UserPermission["canDealReport"] = 2] = "canDealReport";
        UserPermission[UserPermission["canReviewContent"] = 4] = "canReviewContent";
        UserPermission[UserPermission["canBanUserReleaseContent"] = 8] = "canBanUserReleaseContent";
        UserPermission[UserPermission["isReleaseLimited"] = 16] = "isReleaseLimited";
        UserPermission[UserPermission["canAddEditorChoice"] = 32] = "canAddEditorChoice";
        UserPermission[UserPermission["canChangeResourceGroup"] = 64] = "canChangeResourceGroup";
        UserPermission[UserPermission["canCreateGame"] = 128] = "canCreateGame";
        UserPermission[UserPermission["canInviteEditor"] = 256] = "canInviteEditor";
        UserPermission[UserPermission["gameAdmin"] = 512] = "gameAdmin";
        UserPermission[UserPermission["canBanUser"] = 1024] = "canBanUser";
        UserPermission[UserPermission["canAuditAvatar"] = 2048] = "canAuditAvatar";
        UserPermission[UserPermission["canPunish"] = 4096] = "canPunish";
        UserPermission[UserPermission["canManageComment"] = 8192] = "canManageComment";
        UserPermission[UserPermission["canNotify"] = 16384] = "canNotify";
    })(UserPermission = DB.UserPermission || (DB.UserPermission = {}));
    let UserStatus;
    (function (UserStatus) {
        UserStatus[UserStatus["normal"] = 0] = "normal";
        UserStatus[UserStatus["limited"] = 1] = "limited";
        UserStatus[UserStatus["warning"] = 2] = "warning";
        UserStatus[UserStatus["banned"] = 3] = "banned";
    })(UserStatus = DB.UserStatus || (DB.UserStatus = {}));
    let OperationType;
    (function (OperationType) {
        OperationType[OperationType["ban"] = 0] = "ban";
        OperationType[OperationType["liftBan"] = 1] = "liftBan";
    })(OperationType = DB.OperationType || (DB.OperationType = {}));
    let UserUpdateType;
    (function (UserUpdateType) {
        UserUpdateType[UserUpdateType["username"] = 0] = "username";
        UserUpdateType[UserUpdateType["phone"] = 1] = "phone";
        UserUpdateType[UserUpdateType["password"] = 2] = "password";
        UserUpdateType[UserUpdateType["email"] = 3] = "email";
        UserUpdateType[UserUpdateType["avatar"] = 4] = "avatar";
    })(UserUpdateType = DB.UserUpdateType || (DB.UserUpdateType = {}));
    let AvatarStatus;
    (function (AvatarStatus) {
        AvatarStatus[AvatarStatus["waiting"] = 0] = "waiting";
        AvatarStatus[AvatarStatus["rejected"] = 1] = "rejected";
        AvatarStatus[AvatarStatus["noticed"] = 2] = "noticed";
        AvatarStatus[AvatarStatus["accepted"] = 3] = "accepted";
        AvatarStatus[AvatarStatus["cancelled"] = 4] = "cancelled";
    })(AvatarStatus = DB.AvatarStatus || (DB.AvatarStatus = {}));
    let UserFlags;
    (function (UserFlags) {
        UserFlags[UserFlags["agreementOnChat"] = 1] = "agreementOnChat";
        UserFlags[UserFlags["agreementOnComment"] = 2] = "agreementOnComment";
        UserFlags[UserFlags["isbn"] = 4] = "isbn";
        UserFlags[UserFlags["weakUser"] = 8] = "weakUser";
    })(UserFlags = DB.UserFlags || (DB.UserFlags = {}));
    let SkinStatus;
    (function (SkinStatus) {
        SkinStatus[SkinStatus["not4sale"] = 0] = "not4sale";
        SkinStatus[SkinStatus["onsale"] = 1] = "onsale";
    })(SkinStatus = DB.SkinStatus || (DB.SkinStatus = {}));
    let ContentStatus;
    (function (ContentStatus) {
        ContentStatus[ContentStatus["unpublished"] = 1] = "unpublished";
        ContentStatus[ContentStatus["underReview"] = 2] = "underReview";
        ContentStatus[ContentStatus["published"] = 3] = "published";
        ContentStatus[ContentStatus["rejected"] = 4] = "rejected";
        ContentStatus[ContentStatus["censored"] = 5] = "censored";
        ContentStatus[ContentStatus["removed"] = 6] = "removed";
    })(ContentStatus = DB.ContentStatus || (DB.ContentStatus = {}));
    let ContentType;
    (function (ContentType) {
        ContentType[ContentType["game"] = 1] = "game";
        ContentType[ContentType["asset"] = 2] = "asset";
        ContentType[ContentType["music"] = 3] = "music";
    })(ContentType = DB.ContentType || (DB.ContentType = {}));
    let PostType;
    (function (PostType) {
        PostType[PostType["thread"] = 1] = "thread";
        PostType[PostType["comment"] = 2] = "comment";
        PostType[PostType["replyToComment"] = 3] = "replyToComment";
    })(PostType = DB.PostType || (DB.PostType = {}));
    let ViolationType;
    (function (ViolationType) {
        ViolationType[ViolationType["others"] = 0] = "others";
        ViolationType[ViolationType["advertisement"] = 1] = "advertisement";
        ViolationType[ViolationType["political"] = 2] = "political";
        ViolationType[ViolationType["sex"] = 3] = "sex";
        ViolationType[ViolationType["violent"] = 4] = "violent";
        ViolationType[ViolationType["crime"] = 5] = "crime";
        ViolationType[ViolationType["fraud"] = 6] = "fraud";
        ViolationType[ViolationType["copyright"] = 7] = "copyright";
    })(ViolationType = DB.ViolationType || (DB.ViolationType = {}));
    let ContentReviewViolationType;
    (function (ContentReviewViolationType) {
        ContentReviewViolationType[ContentReviewViolationType["codeError"] = 0] = "codeError";
        ContentReviewViolationType[ContentReviewViolationType["nameNotMatch"] = 1] = "nameNotMatch";
        ContentReviewViolationType[ContentReviewViolationType["coverNotMatch"] = 2] = "coverNotMatch";
        ContentReviewViolationType[ContentReviewViolationType["contentViolation"] = 3] = "contentViolation";
        ContentReviewViolationType[ContentReviewViolationType["contentNotClear"] = 4] = "contentNotClear";
        ContentReviewViolationType[ContentReviewViolationType["nameViolation"] = 5] = "nameViolation";
        ContentReviewViolationType[ContentReviewViolationType["descViolation"] = 6] = "descViolation";
        ContentReviewViolationType[ContentReviewViolationType["coverViolation"] = 7] = "coverViolation";
        ContentReviewViolationType[ContentReviewViolationType["advertisement"] = 8] = "advertisement";
        ContentReviewViolationType[ContentReviewViolationType["needOptimize"] = 9] = "needOptimize";
        ContentReviewViolationType[ContentReviewViolationType["linkViolation"] = 10] = "linkViolation";
        ContentReviewViolationType[ContentReviewViolationType["others"] = 11] = "others";
        ContentReviewViolationType[ContentReviewViolationType["descNotMatch"] = 12] = "descNotMatch";
    })(ContentReviewViolationType = DB.ContentReviewViolationType || (DB.ContentReviewViolationType = {}));
    let ReportStatus;
    (function (ReportStatus) {
        ReportStatus[ReportStatus["waiting"] = 1] = "waiting";
        ReportStatus[ReportStatus["reject"] = 2] = "reject";
        ReportStatus[ReportStatus["pass"] = 3] = "pass";
    })(ReportStatus = DB.ReportStatus || (DB.ReportStatus = {}));
    let ContainerType;
    (function (ContainerType) {
        ContainerType["edit"] = "edit";
        ContainerType["play"] = "play";
    })(ContainerType = DB.ContainerType || (DB.ContainerType = {}));
    let ContainerStatus;
    (function (ContainerStatus) {
        ContainerStatus["pending"] = "Pending";
        ContainerStatus["running"] = "Running";
        ContainerStatus["suspended"] = "Suspended";
        ContainerStatus["unknown"] = "Unknown";
    })(ContainerStatus = DB.ContainerStatus || (DB.ContainerStatus = {}));
    let ContentOrder;
    (function (ContentOrder) {
        ContentOrder[ContentOrder["updated"] = 1] = "updated";
        ContentOrder[ContentOrder["created"] = 2] = "created";
        ContentOrder[ContentOrder["published"] = 3] = "published";
    })(ContentOrder = DB.ContentOrder || (DB.ContentOrder = {}));
    let InvitationType;
    (function (InvitationType) {
        InvitationType[InvitationType["createGame"] = 1] = "createGame";
    })(InvitationType = DB.InvitationType || (DB.InvitationType = {}));
    let InvitationCodeStatus;
    (function (InvitationCodeStatus) {
        InvitationCodeStatus[InvitationCodeStatus["ready"] = 1] = "ready";
        InvitationCodeStatus[InvitationCodeStatus["expired"] = 2] = "expired";
        InvitationCodeStatus[InvitationCodeStatus["used"] = 3] = "used";
        InvitationCodeStatus[InvitationCodeStatus["unexist"] = 4] = "unexist";
    })(InvitationCodeStatus = DB.InvitationCodeStatus || (DB.InvitationCodeStatus = {}));
    let InvitationAppStatus;
    (function (InvitationAppStatus) {
        InvitationAppStatus[InvitationAppStatus["waiting"] = 1] = "waiting";
        InvitationAppStatus[InvitationAppStatus["approved"] = 2] = "approved";
        InvitationAppStatus[InvitationAppStatus["rejected"] = 3] = "rejected";
    })(InvitationAppStatus = DB.InvitationAppStatus || (DB.InvitationAppStatus = {}));
    DB.Limitations = {
        contentDescriptionBytes: 3000,
        contentUpdateNoticeBytes: 900,
        contentNameBytes: 30,
    };
    let BugReportStatus;
    (function (BugReportStatus) {
        BugReportStatus[BugReportStatus["pending"] = 0] = "pending";
        BugReportStatus[BugReportStatus["processed"] = 1] = "processed";
    })(BugReportStatus = DB.BugReportStatus || (DB.BugReportStatus = {}));
    let ContentQuality;
    (function (ContentQuality) {
        ContentQuality[ContentQuality["unset"] = 0] = "unset";
        ContentQuality[ContentQuality["low"] = 1] = "low";
    })(ContentQuality = DB.ContentQuality || (DB.ContentQuality = {}));
    let OrderByDate;
    (function (OrderByDate) {
        OrderByDate[OrderByDate["latest"] = 1] = "latest";
        OrderByDate[OrderByDate["oldest"] = 2] = "oldest";
    })(OrderByDate = DB.OrderByDate || (DB.OrderByDate = {}));
})(DB || (exports.DB = DB = {}));
