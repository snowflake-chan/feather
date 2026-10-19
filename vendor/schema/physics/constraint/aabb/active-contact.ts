import { addBodyContactRecordByAABBContact } from '../../contact-controller';
import {
  X0,
  Y0,
  Z0,
  ArrayType,
  INV_MASS,
  CR,
  INV_DT,
  ACTIVE_BODIES,
  ACTIVE_CONTACTS,
} from '../../prepare-bodies';
import {
  MAX_BODIES,
  CONTACT_BLOCK_SIZE,
  combineRestitution,
  combineFriction,
  FRICTION_CUTOFF,
  CONTACT_CUTOFF,
} from '../../def';
import { islandLink } from '../../lock-body';

export class ActiveContact {
  public ai = 0;
  public bi = 0;
  /**
   * (am * bm) / (am + bm)
   * 有效质量 https://en.wikipedia.org/wiki/Effective_mass_(solid-state_physics)
   */
  public diag = 0.1;
  /**
   * 如果弹性为0（完全非弹性碰撞）
   * 这个数据为 depth * INV_DT
   *
   * 如果弹性为1（完全弹性碰撞）
   * 这个数据为 depth * INV_DT - (invAm * va - invBm * vb)
   *
   * b(t)，防止穿透的速度偏差项
   */
  public bias = 0.1;
  /**
   * 拉格朗日乘数 https://en.wikipedia.org/wiki/Lagrange_multiplier
   * 维基百科我反正读不太懂，我觉得这个答主说的很好 https://www.zhihu.com/question/38586401
   * 本身是个纯数学层面的方法，但他正好是求解含不等式约束的最优化问题，恰好可用在物理引擎的约束计算中
   * 在物理碰撞约束实际问题中，此乘数*法向量 代表碰撞冲量
   */
  public lambda = 0.1;
}

let ACTIVE_CONTACT_POOL_PTR = 0;
const ACTIVE_CONTACT_POOL: ActiveContact[] = [new ActiveContact()];

export class ActiveContactSet {
  public outC: ActiveContact[] = [];
  public outIndex = new Int32Array(MAX_BODIES);
  public inC: ActiveContact[] = [];
  public inIndex = new Int32Array(MAX_BODIES);
  public friction: number[] = [0.1];

  constructor(
    // 碰撞关系的计算顺序按照碰撞轴的位置排序
    public outCmp: (a: ActiveContact, b: ActiveContact) => number,
    public inCmp: (a: ActiveContact, b: ActiveContact) => number,
  ) {}

  public clear() {
    this.outC.length = this.inC.length = this.friction.length = 0;
  }

  public push(
    flip: boolean,
    ai: number,
    bi: number,
    v: ArrayType,
    depth: number,
  ) {
    // check if we need to grow pool
    const n = ACTIVE_CONTACT_POOL.length;
    if (n <= ACTIVE_CONTACT_POOL_PTR) {
      ACTIVE_CONTACT_POOL.length += CONTACT_BLOCK_SIZE;
      for (let i = n; i < n + CONTACT_BLOCK_SIZE; ++i) {
        ACTIVE_CONTACT_POOL[i] = new ActiveContact();
      }
    }

    const c = ACTIVE_CONTACT_POOL[ACTIVE_CONTACT_POOL_PTR++];
    const am = INV_MASS[ai];
    const bm = INV_MASS[bi];
    const restitution = combineRestitution(CR[ai], CR[bi]);

    if (flip) {
      c.ai = bi;
      c.bi = ai;
      c.bias = depth * INV_DT - restitution * (am * v[ai] - bm * v[bi]);
    } else {
      c.ai = ai;
      c.bi = bi;
      c.bias = depth * INV_DT + restitution * (am * v[ai] - bm * v[bi]);
    }

    c.diag = 1 / (am + bm);
    c.lambda = 0;

    this.outC.push(c);
    this.inC.push(c);
  }

  public sort() {
    const { inC, outC, inIndex, outIndex, outCmp, inCmp } = this;
    const N = ACTIVE_BODIES.length;
    const O = outC.length;
    // 按照bodies顺序赋值，先都给的是contact长度
    for (let i = 0; i < N; ++i) {
      outIndex[i] = O;
    }
    outC.sort(outCmp);
    // 倒叙赋值，应该是为了做index映射
    // outIndex以ai为key
    // inIndex以bi为key
    for (let i = outC.length - 1; i >= 0; --i) {
      const ai = outC[i].ai;
      outIndex[ai] = i;
    }
    const I = inC.length;
    // 流程同out
    for (let i = 0; i < N; ++i) {
      inIndex[i] = I;
    }
    inC.sort(inCmp);
    for (let i = inC.length - 1; i >= 0; --i) {
      const bi = inC[i].bi;
      inIndex[bi] = i;
    }
  }

  public solve(count: number, v: ArrayType) {
    const { outC, inC } = this;
    for (let n = 0; n < count; ++n) {
      for (let i = 0; i < outC.length; ++i) {
        const c = outC[i];
        const { ai, bi, diag, bias, lambda } = c;
        const am = INV_MASS[ai];
        const bm = INV_MASS[bi];
        // 计算力
        // 冲量叠加，拉格朗日乘数 + 有效质量 * (b(t) + 碰撞点速度差)
        const lambda1 = Math.max(0, lambda + diag * (bias + v[ai] - v[bi]));
        const dlambda = lambda1 - lambda;
        v[ai] -= dlambda * am;
        v[bi] += dlambda * bm;
        c.lambda = lambda1;
      }
      for (let i = 0; i < inC.length; ++i) {
        const c = inC[i];
        const { ai, bi, diag, bias, lambda } = c;
        const am = INV_MASS[ai];
        const bm = INV_MASS[bi];
        const lambda1 = Math.max(0, lambda + diag * (bias + v[ai] - v[bi]));
        const dlambda = lambda1 - lambda;
        v[ai] -= dlambda * am;
        v[bi] += dlambda * bm;
        c.lambda = lambda1;
      }
    }
  }

  public applyFriction(du: ArrayType, dv: ArrayType) {
    const contacts = this.outC;
    const friction = this.friction;
    friction.length = 2 * contacts.length;
    for (let i = 0; i < contacts.length; ++i) {
      const { ai, bi, diag, lambda } = contacts[i];
      const vu = du[ai] - dv[bi];
      const vv = du[ai] - dv[bi];
      const vmag = Math.max(
        FRICTION_CUTOFF,
        Math.sqrt(Math.pow(vu, 2) + Math.pow(vv, 2)),
      );
      const am = INV_MASS[ai];
      const bm = INV_MASS[bi];
      const mu = combineFriction(
        ACTIVE_BODIES[ai].friction,
        ACTIVE_BODIES[bi].friction,
      );
      const s = Math.min((mu * lambda) / vmag, diag);
      const fu = (friction[2 * i] = vu * s);
      const fv = (friction[2 * i + 1] = vv * s);
      du[ai] -= fu * am;
      du[bi] += fu * bm;
      dv[ai] -= fv * am;
      dv[bi] += fv * bm;
    }
  }

  public updateIndex(d: number) {
    const contacts = this.outC;
    const friction = this.friction;
    for (let i = 0, j = 0; i < contacts.length; ++i, j += 2) {
      const c = contacts[i];
      const { ai, bi } = c;
      const aRecord = ACTIVE_CONTACTS[ai];
      const bRecord = ACTIVE_CONTACTS[bi];
      if (!aRecord && !bRecord) {
        continue;
      }
      const lambda = c.lambda * INV_DT;
      if (lambda < CONTACT_CUTOFF) {
        continue;
      }
      const frictionU = friction[j] * INV_DT;
      const frictionV = friction[j + 1] * INV_DT;
      const aId = ACTIVE_BODIES[ai].id;
      const bId = ACTIVE_BODIES[bi].id;
      if (aRecord) {
        addBodyContactRecordByAABBContact(
          aRecord,
          bId,
          -1,
          d,
          -lambda,
          -frictionU,
          -frictionV,
        );
      }
      if (bRecord) {
        addBodyContactRecordByAABBContact(
          bRecord,
          aId,
          1,
          d,
          lambda,
          frictionU,
          frictionV,
        );
      }
    }
  }

  // scan over objects and propagate lock set
  public propagateLocks() {
    const c = this.outC;
    for (let i = 0; i < c.length; ++i) {
      const { ai, bi } = c[i];
      islandLink(ai, bi);
    }
  }
}

export const ACTIVE_X_CONTACTS = new ActiveContactSet(
  function (a, b) {
    return X0[a.ai] - X0[b.ai] || a.ai - b.ai || a.bi - b.bi;
  },
  function (a, b) {
    return X0[b.bi] - X0[a.bi] || a.bi - b.bi || a.ai - b.ai;
  },
);
export const ACTIVE_Y_CONTACTS = new ActiveContactSet(
  function (a, b) {
    return Y0[a.ai] - Y0[b.ai] || a.ai - b.ai || a.bi - b.bi;
  },
  function (a, b) {
    return Y0[b.bi] - Y0[a.bi] || a.bi - b.bi || a.ai - b.ai;
  },
);
export const ACTIVE_Z_CONTACTS = new ActiveContactSet(
  function (a, b) {
    return Z0[a.ai] - Z0[b.ai] || a.ai - b.ai || a.bi - b.bi;
  },
  function (a, b) {
    return Z0[b.bi] - Z0[a.bi] || a.bi - b.bi || a.ai - b.ai;
  },
);

export function clearActiveContacts() {
  ACTIVE_X_CONTACTS.clear();
  ACTIVE_Y_CONTACTS.clear();
  ACTIVE_Z_CONTACTS.clear();
  ACTIVE_CONTACT_POOL_PTR = 0;
}
