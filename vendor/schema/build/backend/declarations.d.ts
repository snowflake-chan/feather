export declare enum ContentCommentStatus {
    normal = 0,
    ownerDisabled = 1
}
export declare enum CommentStatus {
    normal = 0,
    userDeleted = 1,
    ownerDeleted = 2,
    adminDeleted = 3,
    ownerHidden = 4,
    baseCommentDeleted = 5
}
export declare enum ReportReason {
    advertisement = 1,
    political = 2,
    sex = 4,
    violent = 8,
    crime = 16,
    fraud = 32,
    copyright = 64,
    curse = 128,
    spam = 256,
    cheat = 512,
    dating = 1024,
    others = 2048
}
export declare enum ReportStatus2 {
    waiting = 1,
    rejected = 2,
    accepted = 3
}
export declare enum ReportType {
    chat = 0,
    comment = 1,
    user = 2,
    map = 3,
    model = 4,
    music = 5
}
export declare enum EditorOperate {
    nothing = 0,
    ban = 1,
    unban = 2
}
export declare enum PreparedNotifyType {
    contentReject = 1,
    editorApplyReject = 2,
    contentAccept = 3,
    editorApplyAccept = 4,
    contentRecommend = 5,
    userPunish = 6,
    displaynameReset = 7,
    reportAccept = 8,
    descriptionReset = 9
}
export declare enum ReceiverType {
    all = 1,
    some = 2
}
export declare const NEVER: Date;
export declare const FOREVER: Date;
export declare const ONE_HUNDRED_YEAR: number;
//# sourceMappingURL=declarations.d.ts.map