import { MuRDA, MuRDATypes } from '@box/mudb/rda';

// transactions must be constructed and dispatched within a single tick or else stuff can fuck up
export class RDATransaction<RDA extends MuRDA<any, any, any, any>> {
  private forward: MuRDATypes<RDA>['action'][] = [];
  private inverse: MuRDATypes<RDA>['action'][] = [];

  constructor(
    private rda: RDA,
    private store: MuRDATypes<RDA>['store'],
    private dispatch: (a: MuRDATypes<RDA>['action'][]) => Promise<void>,
  ) {}

  public push(cb: (x: ReturnType<RDA['action']>) => MuRDATypes<RDA>['action']) {
    const { rda, forward, inverse, store } = this;
    for (let i = 0; i < forward.length; ++i) {
      store.apply(rda, forward[i]);
    }
    const action = cb(rda.action(store));
    const invAction = store.inverse(rda, action);
    for (let i = inverse.length - 1; i >= 0; --i) {
      store.apply(rda, inverse[i]);
    }
    forward.push(action);
    inverse.push(invAction);
    return this;
  }

  public async commit() {
    try {
      await this.dispatch(this.forward);
    } finally {
      this.abort();
    }
  }

  public abort() {
    const { forward, inverse } = this;
    for (let i = 0; i < forward.length; ++i) {
      this.rda.actionSchema.free(forward[i]);
    }
    for (let i = 0; i < this.inverse.length; ++i) {
      this.rda.actionSchema.free(inverse[i]);
    }
    forward.length = inverse.length = 0;
  }
}
