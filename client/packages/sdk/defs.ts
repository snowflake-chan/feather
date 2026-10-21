export enum ErrorType {
  LoadError = 'loadError',
  Custom = 'custom',
}

export enum CommonErrorMsg {
  Unauthorized = 'unauthorized',
  PermissionDenied = 'permissionDenied',
  Unknown = 'unknown',
}

export enum AuthEventType {
  Unauthorized = 'unauthorized',
  UpdateToken = 'updateToken',
}

export enum ChildrenEventType {
  ConnectionLost = 'connectionLost',
}
