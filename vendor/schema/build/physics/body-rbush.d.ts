export declare class BodyCollisionBox {
    minX: number;
    minY: number;
    minZ: number;
    maxX: number;
    maxY: number;
    maxZ: number;
    id: number;
}
/**
 * 大佬的博客 https://0fps.net/2015/01/23/collision-detection-part-3-benchmarks/
 * 其中提到的 rBush https://github.com/mourner/rbush
 * 本文件就是实现rBush这个东西
 * 优化全靠这东西，粗略的碰撞过滤在这里做
 * 这里的碰撞都是aabb计算，初筛纯为了快
 */
export declare class BodyRBushNode {
    children: BodyRBushNode[];
    boxes: BodyCollisionBox[];
    minX: number;
    minY: number;
    minZ: number;
    maxX: number;
    maxY: number;
    maxZ: number;
    /**
     * 体积
     * 长 * 宽 * 高
     */
    volume: number;
}
export declare function clearNodePool(): void;
export declare function createBodyRBush(items: BodyCollisionBox[], left: number, right: number, _height: number): BodyRBushNode;
export declare function testBodyRBush(root: BodyRBushNode, minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number, skipId: number): boolean;
export declare function resolveBodyCollisions(resultA: number[], resultB: number[], rootA: BodyRBushNode, rootB: BodyRBushNode): void;
/**
 * 根据BodyRBushNode计算里面两两相撞的box，得到的结果放到resultA和resultB中
 * resultA和resultB的长度一定是一样的
 * 相同的索引值对应的一组碰撞关系，value为碰撞体的ID
 * @param resultA
 * @param resultB
 * @param root
 * @returns
 */
export declare function resolveSelfBodyCollisions(resultA: number[], resultB: number[], root: BodyRBushNode): void;
