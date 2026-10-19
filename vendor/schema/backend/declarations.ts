export enum ContentCommentStatus {
  normal,
  ownerDisabled,
}

export enum CommentStatus {
  normal,
  userDeleted,
  ownerDeleted,
  adminDeleted,
  ownerHidden,
  baseCommentDeleted,
}

export enum ReportReason {
  advertisement = 1 << 0,
  political = 1 << 1,
  sex = 1 << 2,
  violent = 1 << 3,
  crime = 1 << 4,
  fraud = 1 << 5,
  copyright = 1 << 6,
  curse = 1 << 7,
  spam = 1 << 8,
  cheat = 1 << 9,
  dating = 1 << 10,
  others = 1 << 11,
}

export enum ReportStatus2 {
  waiting = 1,
  rejected,
  accepted,
}

export enum ReportType {
  chat,
  comment,
  user,
  map,
  model,
  music,
}

export enum EditorOperate {
  nothing,
  ban,
  unban,
}

export enum PreparedNotifyType {
  contentReject = 1,
  editorApplyReject = 2,
  contentAccept = 3,
  editorApplyAccept = 4,
  contentRecommend = 5,
  userPunish = 6,
  displaynameReset = 7,
  reportAccept = 8,
  descriptionReset = 9,
}

export enum ReceiverType {
  all = 1,
  some = 2,
}

// save as timestamp in db anyway, handle these two situations in front end plz @necolo
// if {Date} <= NEVER then show never, if {Date} >= FOREVER then show forever
export const NEVER = new Date(0);
export const FOREVER = new Date(9999999999999);
export const ONE_HUNDRED_YEAR = 86400 * 1000 * 365 * 100;
