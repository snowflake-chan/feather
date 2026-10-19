import type { ContactManifold } from './obb-collide';
import { Vec3 } from './def';
declare class ContactPointDataBuffer {
    /**
     * 法线
     */
    nor: Vec3;
    /**
     * 切线
     */
    tan: Vec3;
    /**
     * 副法线
     */
    bin: Vec3;
    /**
     * 法线 * 质量的倒数
     * v2 = v1 + 1 / m * n * lambda
     * v2 = v1 + norU1 * lambda
     */
    norU1: Vec3;
    /**
     * 切线 * 质量的倒数
     */
    tanU1: Vec3;
    /**
     * 副法线 * 质量的倒数
     */
    binU1: Vec3;
    /**
     * 法线 * 质量的倒数
     */
    norU2: Vec3;
    /**
     * 切线 * 质量的倒数
     */
    tanU2: Vec3;
    /**
     * 副法线 * 质量的倒数
     */
    binU2: Vec3;
    /**
     * 法线与力臂叉乘
     * w2 = w1 + I逆矩阵(r X n) * lambda
     * w2 = w1 + I逆矩阵norT1 * lambda
     */
    norT1: Vec3;
    /**
     * 切线与力臂叉乘
     */
    tanT1: Vec3;
    /**
     * 副法线与力臂叉乘
     */
    binT1: Vec3;
    /**
     * 法线与力臂叉乘
     */
    norT2: Vec3;
    /**
     * 切线与力臂叉乘
     */
    tanT2: Vec3;
    /**
     * 副法线与力臂叉乘
     */
    binT2: Vec3;
    /**
     * 法线与力臂叉乘再乘惯性张量的逆矩阵
     * w2 = w1 + I逆矩阵(r X n) * lambda
     * w2 = w1 + norTU1 * lambda
     */
    norTU1: Vec3;
    /**
     * 切线与力臂叉乘再乘惯性张量的逆矩阵
     */
    tanTU1: Vec3;
    /**
     * 副法线与力臂叉乘再乘惯性张量的逆矩阵
     */
    binTU1: Vec3;
    /**
     * 法线与力臂叉乘再乘惯性张量的逆矩阵
     */
    norTU2: Vec3;
    /**
     * 切线与力臂叉乘再乘惯性张量的逆矩阵
     */
    tanTU2: Vec3;
    /**
     * 副法线与力臂叉乘再乘惯性张量的逆矩阵
     */
    binTU2: Vec3;
    /**
     * 法线方向的冲量
     */
    norImp: number;
    /**
     * 切线方向的冲量
     */
    tanImp: number;
    /**
     * 副法线方向的冲量
     */
    binImp: number;
    /**
     * 有效质量
     */
    norDen: number;
    /**
     * 有效质量
     */
    tanDen: number;
    /**
     * 有效质量
     */
    binDen: number;
    norTar: number;
}
export declare class Contact {
    ai: number;
    bi: number;
    restitution: number;
    friction: number;
    num: number;
    cs: ContactPointDataBuffer[];
    /**
     * 传送带地形业务处理
     * 地形速度u
     */
    blockVU: number;
    /**
     * 传送带地形业务处理
     * 地形速度v
     */
    blockVV: number;
    /**
     * force x
     */
    fx: number;
    /**
     * force y
     */
    fy: number;
    /**
     * force z
     */
    fz: number;
    /**
     * normal x
     */
    nx: number;
    /**
     * normal y
     */
    ny: number;
    /**
     * normal z
     */
    nz: number;
}
export type ContactSetType = 'active' | 'fixed' | 'terrain';
export declare class ContactSet {
    type: ContactSetType;
    contacts: Contact[];
    constructor(type: ContactSetType);
    /**
     * 清空所有的contacts
     */
    clear(): void;
    /**
     * 将刚体碰撞信息处理为Contact信息
     * 并将处理后的contact放置在contacts中
     * @param ai obbA的ID
     * @param ax obbA位置x
     * @param ay obbA位置y
     * @param az obbA位置z
     * @param ar obbA的弹性系数
     * @param af obbA的摩擦系数
     * @param avx obbA的线速度x
     * @param avy obbA的线速度y
     * @param avz obbA的线速度z
     * @param aax obbA的角速度x
     * @param aay obbA的角速度y
     * @param aaz obbA的角速度z
     * @param aim obbA质量的倒数
     * @param aiin0 obbA惯性张量的逆矩阵0
     * @param aiin1 obbA惯性张量的逆矩阵1
     * @param aiin2 obbA惯性张量的逆矩阵2
     * @param aiin3 obbA惯性张量的逆矩阵3
     * @param aiin4 obbA惯性张量的逆矩阵4
     * @param aiin5 obbA惯性张量的逆矩阵5
     * @param aiin6 obbA惯性张量的逆矩阵6
     * @param aiin7 obbA惯性张量的逆矩阵7
     * @param aiin8 obbA惯性张量的逆矩阵8
     * @param bi obbB的ID
     * @param bx obbB位置x
     * @param by obbB位置y
     * @param bz obbB位置z
     * @param br obbB的弹性系数
     * @param bf obbB的摩擦系数
     * @param bvx obbB的线速度x
     * @param bvy obbB的线速度y
     * @param bvz obbB的线速度z
     * @param bax obbB的角速度x
     * @param bay obbB的角速度y
     * @param baz obbB的角速度z
     * @param bim obbB质量的倒数
     * @param biin0 obbB惯性张量的逆矩阵0
     * @param biin1 obbB惯性张量的逆矩阵1
     * @param biin2 obbB惯性张量的逆矩阵2
     * @param biin3 obbB惯性张量的逆矩阵3
     * @param biin4 obbB惯性张量的逆矩阵4
     * @param biin5 obbB惯性张量的逆矩阵5
     * @param biin6 obbB惯性张量的逆矩阵6
     * @param biin7 obbB惯性张量的逆矩阵7
     * @param biin8 obbB惯性张量的逆矩阵8
     * @param manifold 碰撞点位置，法向量，深度等
     * @param addBlockVelocity 是否添加地形速度，默认为false。业务处理，只有碰撞轴在地形+y轴方向的时候才会触发地形速度效果
     */
    push(ai: number, ax: number, ay: number, az: number, ar: number, af: number, avx: number, avy: number, avz: number, aax: number, aay: number, aaz: number, aim: number, aiin0: number, aiin1: number, aiin2: number, aiin3: number, aiin4: number, aiin5: number, aiin6: number, aiin7: number, aiin8: number, bi: number, bx: number, by: number, bz: number, br: number, bf: number, bvx: number, bvy: number, bvz: number, bax: number, bay: number, baz: number, bim: number, biin0: number, biin1: number, biin2: number, biin3: number, biin4: number, biin5: number, biin6: number, biin7: number, biin8: number, manifold: ContactManifold, addBlockVelocity?: boolean): void;
    solve(count: number): void;
    propagateLocks(): void;
}
export {};
