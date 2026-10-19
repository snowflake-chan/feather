export declare class Coord2 {
    readonly offset: Vec2;
    readonly scale: Vec2;
    /**
     * @param args 绑定内部数据相关的依赖，不在脚本中定义
     * @ignore
     */
    constructor(...args: any);
    static create(val?: Coord2): Coord2;
}
export declare class Vec2 {
    x: number;
    y: number;
    /**
     * @param args 绑定内部数据相关的依赖，不在脚本中定义
     * @ignore
     */
    constructor(...args: any);
    copy(val: Vec2): void;
    static create(val?: Vec2): Vec2;
}
export declare class Vec3 {
    x: number;
    y: number;
    z: number;
    r: number;
    g: number;
    b: number;
    /**
     * @param args 绑定内部数据相关的依赖，不在脚本中定义
     * @ignore
     */
    constructor(...args: any);
    copy(val: Vec3): void;
    static create(val?: Vec3): Vec3;
}
//# sourceMappingURL=math.d.ts.map