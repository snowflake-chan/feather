/**
 * A standard SQL database
 */
export class GameDatabase {
  /**
   * @ignore
   */
  constructor(
    /**
     * Executes a SQL query on this database
     */
    public sql: (
      sql: string[],
      ...params: (number | string | Uint8Array | boolean | null)[]
    ) => GameQueryResult,
  ) {}
}

/**
 * Query result api
 */
export class GameQueryResult implements AsyncIterable<any> {
  public [Symbol.asyncIterator]() {
    return this;
  }

  public return: () => Promise<{ done: boolean; value: any }>;
  public throw: (err: any) => Promise<{ done: boolean; value: any }>;
  public then: (
    resolve: (rows: any[]) => any,
    reject: (err: any) => any,
  ) => void;

  /**
   * @ignore
   */
  constructor(
    public next: () => Promise<{
      done: boolean;
      value: any;
    }>,
    abort: () => Promise<{
      done: boolean;
      value: any;
    }>,
    error: (err: any) => Promise<{
      done: boolean;
      value: any;
    }>,
    then: (resolve: (rows: any[]) => any, reject: (err: any) => any) => void,
  ) {
    this['return'] = abort;
    this['throw'] = error;
    this['then'] = then;
  }
}
