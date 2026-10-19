import type * as I from '@box/script-api';
export type DB_ERROR_STATUS = 'CONSTRAINT_TARGET_INVALID' | 'PARAMS_INVALID' | 'DB_NAME_INVALID' | 'KEY_INVALID' | 'VALUE_INVALID' | 'SERVER_FETCH_ERROR' | 'REQUEST_THROTTLED' | 'INCREMENT_INVALID' | 'UNKNOWN';
export declare class GameStorage implements I.GameStorage {
    getDataStorage: (key: string) => GameDataStorage;
    getGroupStorage: (key: string) => GameDataStorage | undefined;
    constructor(getDataStorage: (key: string) => GameDataStorage, getGroupStorage: (key: string) => GameDataStorage | undefined);
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
export declare class GameDataStorage implements I.GameDataStorage {
    readonly key: string;
    set: (key: string, value: JSONValue) => Promise<void>;
    update: (key: string, handler: (prevValue: ReturnValue) => JSONValue) => Promise<void>;
    get: (key: string) => Promise<ReturnValue>;
    increment: (key: string, value?: number) => Promise<number>;
    list: (options: ListPageOptions) => Promise<QueryList>;
    remove: (key: string) => Promise<ReturnValue>;
    destroy: () => Promise<void>;
    constructor(key: string, set: (key: string, value: JSONValue) => Promise<void>, update: (key: string, handler: (prevValue: ReturnValue) => JSONValue) => Promise<void>, get: (key: string) => Promise<ReturnValue>, increment: (key: string, value?: number) => Promise<number>, list: (options: ListPageOptions) => Promise<QueryList>, remove: (key: string) => Promise<ReturnValue>, destroy: () => Promise<void>);
}
export declare class QueryList implements I.QueryList {
    getCurrentPage: () => ReturnValue[];
    nextPage: () => Promise<void>;
    isLastPage: boolean;
    constructor(getCurrentPage: () => ReturnValue[], nextPage: () => Promise<void>);
}
