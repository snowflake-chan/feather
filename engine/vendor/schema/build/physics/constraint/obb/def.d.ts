export type SerializedVec3 = [number, number, number];
export declare function ALLOC(size: number): Float32Array;
export type ArrayType = ReturnType<typeof ALLOC>;
export type Vec3 = SerializedVec3 | ArrayType;
export declare function calcRotation(out: ArrayType, qx: number, qy: number, qz: number, qw: number): void;
/**
 * 惯性张量的计算
 * https://wuli.wiki/online/ITensr.html
 * @param out 输出的惯性张量
 * @param id 刚体ID
 * @param rot 刚体的旋转矩阵
 */
export declare function getInverseInertia(out: ArrayType, id: number, rot: ArrayType): void;
//# sourceMappingURL=def.d.ts.map