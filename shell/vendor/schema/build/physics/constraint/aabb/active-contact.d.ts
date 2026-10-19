import { ArrayType } from '../../prepare-bodies';
export declare class ActiveContact {
    ai: number;
    bi: number;
    /**
     * (am * bm) / (am + bm)
     * 有效质量 https://en.wikipedia.org/wiki/Effective_mass_(solid-state_physics)
     */
    diag: number;
    /**
     * 如果弹性为0（完全非弹性碰撞）
     * 这个数据为 depth * INV_DT
     *
     * 如果弹性为1（完全弹性碰撞）
     * 这个数据为 depth * INV_DT - (invAm * va - invBm * vb)
     *
     * b(t)，防止穿透的速度偏差项
     */
    bias: number;
    /**
     * 拉格朗日乘数 https://en.wikipedia.org/wiki/Lagrange_multiplier
     * 维基百科我反正读不太懂，我觉得这个答主说的很好 https://www.zhihu.com/question/38586401
     * 本身是个纯数学层面的方法，但他正好是求解含不等式约束的最优化问题，恰好可用在物理引擎的约束计算中
     * 在物理碰撞约束实际问题中，此乘数*法向量 代表碰撞冲量
     */
    lambda: number;
}
export declare class ActiveContactSet {
    outCmp: (a: ActiveContact, b: ActiveContact) => number;
    inCmp: (a: ActiveContact, b: ActiveContact) => number;
    outC: ActiveContact[];
    outIndex: Int32Array;
    inC: ActiveContact[];
    inIndex: Int32Array;
    friction: number[];
    constructor(outCmp: (a: ActiveContact, b: ActiveContact) => number, inCmp: (a: ActiveContact, b: ActiveContact) => number);
    clear(): void;
    push(flip: boolean, ai: number, bi: number, v: ArrayType, depth: number): void;
    sort(): void;
    solve(count: number, v: ArrayType): void;
    applyFriction(du: ArrayType, dv: ArrayType): void;
    updateIndex(d: number): void;
    propagateLocks(): void;
}
export declare const ACTIVE_X_CONTACTS: ActiveContactSet;
export declare const ACTIVE_Y_CONTACTS: ActiveContactSet;
export declare const ACTIVE_Z_CONTACTS: ActiveContactSet;
export declare function clearActiveContacts(): void;
