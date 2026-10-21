/**
 * A standard SQL database
 */
export declare class GameDatabase {
    /**
     * Executes a SQL query on this database
     */
    sql: (sql: string[], ...params: (number | string | Uint8Array | boolean | null)[]) => GameQueryResult;
    /**
     * @ignore
     */
    constructor(
    /**
     * Executes a SQL query on this database
     */
    sql: (sql: string[], ...params: (number | string | Uint8Array | boolean | null)[]) => GameQueryResult);
}
/**
 * Query result api
 */
export declare class GameQueryResult implements AsyncIterable<any> {
    next: () => Promise<{
        done: boolean;
        value: any;
    }>;
    [Symbol.asyncIterator](): this;
    return: () => Promise<{
        done: boolean;
        value: any;
    }>;
    throw: (err: any) => Promise<{
        done: boolean;
        value: any;
    }>;
    then: (resolve: (rows: any[]) => any, reject: (err: any) => any) => void;
    /**
     * @ignore
     */
    constructor(next: () => Promise<{
        done: boolean;
        value: any;
    }>, abort: () => Promise<{
        done: boolean;
        value: any;
    }>, error: (err: any) => Promise<{
        done: boolean;
        value: any;
    }>, then: (resolve: (rows: any[]) => any, reject: (err: any) => any) => void);
}
//# sourceMappingURL=db.d.ts.map