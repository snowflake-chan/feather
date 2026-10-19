import { CommonSQL, CommonDatabase } from './types';

export class MockSQL implements CommonSQL {
  public open(spec: {
    name: string;
    size: number;
    chunkSize: number;
    onReady: (db: MockDB) => void;
    onError: (err: Error) => void;
  }) {
    spec.onReady(new MockDB());
  }
}

export class MockDB implements CommonDatabase {
  public prepareSQL(sqlExpr: string[]) {
    return sqlExpr.join(' ? ');
  }
  public query(spec: {
    sqlExpr: string;
    params: any[];
    onReady: (step: () => void, close: () => void) => void;
    onRows: (
      columns: string[],
      row: (Uint8Array | number | string | boolean | null)[][],
    ) => void;
    onDone: () => void;
    onError: (err: Error) => void;
  }) {
    spec.onError(new Error('storage disabled'));
  }
  public close(spec: { onSuccess: () => void; onError: (err: any) => void }) {
    spec.onSuccess();
  }
}
