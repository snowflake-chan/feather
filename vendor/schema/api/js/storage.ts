import type * as I from '@box/script-api';
export type DB_ERROR_STATUS =
  | 'CONSTRAINT_TARGET_INVALID'
  | 'PARAMS_INVALID'
  | 'DB_NAME_INVALID'
  | 'KEY_INVALID'
  | 'VALUE_INVALID'
  | 'SERVER_FETCH_ERROR'
  | 'REQUEST_THROTTLED'
  | 'INCREMENT_INVALID'
  | 'UNKNOWN';

export class GameStorage implements I.GameStorage {
  constructor(
    public getDataStorage: (key: string) => GameDataStorage,
    public getGroupStorage: (key: string) => GameDataStorage | undefined,
  ) {}
}

export type JSONValue = I.JSONValue;

export type ResultValue = {
  key: string;
  value: JSONValue;
  version: string;
  updateTime: number;
  createTime: number;
};
export type ListReturnValue = {
  items: ResultValue[];
  isLastPage: boolean;
};

export type ReturnValue = I.ReturnValue;

export type ListPageOptions = I.ListPageOptions;

/**
 *
 * A Data storage class
 * @export
 * @class GameDataStorage
 */
export class GameDataStorage implements I.GameDataStorage {
  constructor(
    public readonly key: string,
    // set value
    public set: (key: string, value: JSONValue) => Promise<void>,
    // update value
    public update: (
      key: string,
      handler: (prevValue: ReturnValue) => JSONValue,
    ) => Promise<void>,
    public get: (key: string) => Promise<ReturnValue>,
    public increment: (key: string, value?: number) => Promise<number>,
    public list: (options: ListPageOptions) => Promise<QueryList>,
    public remove: (key: string) => Promise<ReturnValue>,
    public destroy: () => Promise<void>,
  ) {}
}

export class QueryList implements I.QueryList {
  public isLastPage: boolean = false;
  constructor(
    public getCurrentPage: () => ReturnValue[],
    public nextPage: () => Promise<void>,
  ) {}
}
