/**
 * The class holds details of the contact point.
 */
export declare class ManifoldPoint {
    px: number;
    py: number;
    pz: number;
    penetration: number;
}
/**
 * A contact manifold between two shapes.
 */
export declare class ContactManifold {
    numPoints: number;
    nx: number;
    ny: number;
    nz: number;
    points: ManifoldPoint[];
    /**
     * 碰撞分离轴index
     * 0 - obbA.x * obbB
     * 1 - obbA.y * obbB
     * 2 - obbA.z * obbB
     * 3 - obbB.x * obbA
     * 4 - obbB.y * obbA
     * 5 - obbB.z * obbA
     * 6 - obbA.x * obbB.x
     * 7 - obbA.x * obbB.y
     * 8 - obbA.x * obbB.z
     * 9 - obbA.y * obbB.x
     * 10 - obbA.y * obbB.y
     * 11 - obbA.y * obbB.z
     * 12 - obbA.z * obbB.x
     * 13 - obbA.z * obbB.y
     * 14 - obbA.z * obbB.z
     */
    separatingAxisIndex: number;
    /**
     * 是否在碰撞分离轴的右侧
     */
    right: boolean;
    addPoint(px: number, py: number, pz: number, penetration: number): void;
}
/**
 * obb与obb物理模型碰撞检测
 * @param ax obbA位置x
 * @param ay obbA位置y
 * @param az obbA位置z
 * @param ahsx obbA尺寸半径width
 * @param ahsy obbA尺寸半径height
 * @param ahsz obbA尺寸半径depth
 * @param am0 obbA旋转矩阵0
 * @param am1 obbA旋转矩阵1
 * @param am2 obbA旋转矩阵2
 * @param am3 obbA旋转矩阵3
 * @param am4 obbA旋转矩阵4
 * @param am5 obbA旋转矩阵5
 * @param am6 obbA旋转矩阵6
 * @param am7 obbA旋转矩阵7
 * @param am8 obbA旋转矩阵8
 * @param bx obbB位置x
 * @param by obbB位置y
 * @param bz obbB位置z
 * @param bhsx obbB尺寸半径width
 * @param bhsy obbB尺寸半径height
 * @param bhsz obbB尺寸半径depth
 * @param bm0 obbB旋转矩阵0
 * @param bm1 obbB旋转矩阵1
 * @param bm2 obbB旋转矩阵2
 * @param bm3 obbB旋转矩阵3
 * @param bm4 obbB旋转矩阵4
 * @param bm5 obbB旋转矩阵5
 * @param bm6 obbB旋转矩阵6
 * @param bm7 obbB旋转矩阵7
 * @param bm8 obbB旋转矩阵8
 * @param manifold 输出的碰撞点位置，法向量，深度等
 * @returns
 */
export declare function OBBOBBintersect(ax: number, ay: number, az: number, ahsx: number, ahsy: number, ahsz: number, am0: number, am1: number, am2: number, am3: number, am4: number, am5: number, am6: number, am7: number, am8: number, bx: number, by: number, bz: number, bhsx: number, bhsy: number, bhsz: number, bm0: number, bm1: number, bm2: number, bm3: number, bm4: number, bm5: number, bm6: number, bm7: number, bm8: number, manifold: ContactManifold, isTerrain?: boolean, 
/**
 * 地形暴露在外界的方向
 * 一位代表一个面，1表示暴露在外面，0表示没有暴露在外面
 * 每个位数分别代表
 * 0 b 1  1  1  1  1  1
 *    +z -z +y -y +x -x
 * 默认0b111111，代表所有面都暴露在外面
 */
faces?: number): void;
