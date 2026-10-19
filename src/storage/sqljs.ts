import initSQLjs from 'sql.js';
import { CommonSQL, CommonDatabase } from './types';
import { SQLJS_RES } from './sqljs-res';

export class SQLJS implements CommonSQL {
  public sql: any = null;

  public async init(cdnPath: string) {
    if (typeof window !== 'undefined') {
      this.sql = await initSQLjs({
        locateFile: (file: string) => cdnPath + '/block/' + SQLJS_RES[file],
      });
    } else {
      this.sql = await initSQLjs({});
    }
  }

  public open(spec: {
    chunkSize: number;
    onReady: (db: SQLJSDB) => void;
    onError: (err: Error) => void;
  }) {
    if (!this.sql) {
      spec.onError(new Error('sqljs not initiailized'));
      return;
    }
    let db: SQLJSDB;
    try {
      db = new SQLJSDB(new this.sql.Database(), this, spec.chunkSize);
    } catch (e) {
      spec.onError(e);
      return;
    }
    spec.onReady(db);
  }
}

export class SQLJSDB implements CommonDatabase {
  constructor(public db, public sql: SQLJS, private chunkSize: number) {}

  public prepareSQL(sqlExpr: string[]) {
    return sqlExpr.join(' ? ');
  }

  public query(spec: {
    sqlExpr: string;
    params: any[];
    onReady: (step: () => void, close: () => void) => void;
    onRows: (columns: string[], rows: any[]) => void;
    onDone: () => void;
    onError: (err: Error) => void;
  }) {
    let statement: any = null;
    try {
      statement = this.db.prepare(spec.sqlExpr);
      statement.bind(spec.params);
    } catch (e) {
      if (statement) {
        statement.free();
      }
      return spec.onError(e);
    }

    let done = false;
    const abort = () => {
      if (done) {
        return;
      }
      done = true;
      try {
        statement.free();
      } catch (e) {}
      spec.onDone();
    };

    const step = () => {
      if (done) {
        return;
      }
      try {
        const rows: any[] = [];
        let cols: string[] | undefined;
        for (let i = 0; i < this.chunkSize; i++) {
          if (statement.step()) {
            if (!cols) {
              cols = statement.getColumnNames();
            }
            rows.push(statement.get());
          } else {
            done = true;
            break;
          }
        }
        if (cols) {
          spec.onRows(cols, rows);
        }
        if (done) {
          statement.free();
          spec.onDone();
        }
      } catch (e) {
        done = true;
        try {
          statement.free();
        } catch (x) {}
        spec.onError(e);
      }
    };

    spec.onReady(step, abort);
  }

  public close(spec: { onSuccess: () => void; onError: (err: Error) => void }) {
    // TODO
    this.db.close();
  }
}
