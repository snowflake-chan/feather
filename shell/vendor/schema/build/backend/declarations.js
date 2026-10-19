"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ONE_HUNDRED_YEAR = exports.FOREVER = exports.NEVER = exports.ReceiverType = exports.PreparedNotifyType = exports.EditorOperate = exports.ReportType = exports.ReportStatus2 = exports.ReportReason = exports.CommentStatus = exports.ContentCommentStatus = void 0;
var ContentCommentStatus;
(function (ContentCommentStatus) {
    ContentCommentStatus[ContentCommentStatus["normal"] = 0] = "normal";
    ContentCommentStatus[ContentCommentStatus["ownerDisabled"] = 1] = "ownerDisabled";
})(ContentCommentStatus || (exports.ContentCommentStatus = ContentCommentStatus = {}));
var CommentStatus;
(function (CommentStatus) {
    CommentStatus[CommentStatus["normal"] = 0] = "normal";
    CommentStatus[CommentStatus["userDeleted"] = 1] = "userDeleted";
    CommentStatus[CommentStatus["ownerDeleted"] = 2] = "ownerDeleted";
    CommentStatus[CommentStatus["adminDeleted"] = 3] = "adminDeleted";
    CommentStatus[CommentStatus["ownerHidden"] = 4] = "ownerHidden";
    CommentStatus[CommentStatus["baseCommentDeleted"] = 5] = "baseCommentDeleted";
})(CommentStatus || (exports.CommentStatus = CommentStatus = {}));
var ReportReason;
(function (ReportReason) {
    ReportReason[ReportReason["advertisement"] = 1] = "advertisement";
    ReportReason[ReportReason["political"] = 2] = "political";
    ReportReason[ReportReason["sex"] = 4] = "sex";
    ReportReason[ReportReason["violent"] = 8] = "violent";
    ReportReason[ReportReason["crime"] = 16] = "crime";
    ReportReason[ReportReason["fraud"] = 32] = "fraud";
    ReportReason[ReportReason["copyright"] = 64] = "copyright";
    ReportReason[ReportReason["curse"] = 128] = "curse";
    ReportReason[ReportReason["spam"] = 256] = "spam";
    ReportReason[ReportReason["cheat"] = 512] = "cheat";
    ReportReason[ReportReason["dating"] = 1024] = "dating";
    ReportReason[ReportReason["others"] = 2048] = "others";
})(ReportReason || (exports.ReportReason = ReportReason = {}));
var ReportStatus2;
(function (ReportStatus2) {
    ReportStatus2[ReportStatus2["waiting"] = 1] = "waiting";
    ReportStatus2[ReportStatus2["rejected"] = 2] = "rejected";
    ReportStatus2[ReportStatus2["accepted"] = 3] = "accepted";
})(ReportStatus2 || (exports.ReportStatus2 = ReportStatus2 = {}));
var ReportType;
(function (ReportType) {
    ReportType[ReportType["chat"] = 0] = "chat";
    ReportType[ReportType["comment"] = 1] = "comment";
    ReportType[ReportType["user"] = 2] = "user";
    ReportType[ReportType["map"] = 3] = "map";
    ReportType[ReportType["model"] = 4] = "model";
    ReportType[ReportType["music"] = 5] = "music";
})(ReportType || (exports.ReportType = ReportType = {}));
var EditorOperate;
(function (EditorOperate) {
    EditorOperate[EditorOperate["nothing"] = 0] = "nothing";
    EditorOperate[EditorOperate["ban"] = 1] = "ban";
    EditorOperate[EditorOperate["unban"] = 2] = "unban";
})(EditorOperate || (exports.EditorOperate = EditorOperate = {}));
var PreparedNotifyType;
(function (PreparedNotifyType) {
    PreparedNotifyType[PreparedNotifyType["contentReject"] = 1] = "contentReject";
    PreparedNotifyType[PreparedNotifyType["editorApplyReject"] = 2] = "editorApplyReject";
    PreparedNotifyType[PreparedNotifyType["contentAccept"] = 3] = "contentAccept";
    PreparedNotifyType[PreparedNotifyType["editorApplyAccept"] = 4] = "editorApplyAccept";
    PreparedNotifyType[PreparedNotifyType["contentRecommend"] = 5] = "contentRecommend";
    PreparedNotifyType[PreparedNotifyType["userPunish"] = 6] = "userPunish";
    PreparedNotifyType[PreparedNotifyType["displaynameReset"] = 7] = "displaynameReset";
    PreparedNotifyType[PreparedNotifyType["reportAccept"] = 8] = "reportAccept";
    PreparedNotifyType[PreparedNotifyType["descriptionReset"] = 9] = "descriptionReset";
})(PreparedNotifyType || (exports.PreparedNotifyType = PreparedNotifyType = {}));
var ReceiverType;
(function (ReceiverType) {
    ReceiverType[ReceiverType["all"] = 1] = "all";
    ReceiverType[ReceiverType["some"] = 2] = "some";
})(ReceiverType || (exports.ReceiverType = ReceiverType = {}));
// save as timestamp in db anyway, handle these two situations in front end plz @necolo
// if {Date} <= NEVER then show never, if {Date} >= FOREVER then show forever
exports.NEVER = new Date(0);
exports.FOREVER = new Date(9999999999999);
exports.ONE_HUNDRED_YEAR = 86400 * 1000 * 365 * 100;
