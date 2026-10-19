export declare class Coord2 {
  public readonly offset: Vec2;
  public readonly scale: Vec2;

  /**
   * @param args 绑定内部数据相关的依赖，不在脚本中定义
   * @ignore
   */
  constructor(...args: any);

  static create(val?: Coord2): Coord2;
}

export declare class Vec2 {
  public x: number;
  public y: number;
  /**
   * @param args 绑定内部数据相关的依赖，不在脚本中定义
   * @ignore
   */
  constructor(...args: any);
  public copy(val: Vec2): void;

  static create(val?: Vec2): Vec2;
}

export declare class Vec3 {
  public x: number;
  public y: number;
  public z: number;
  public r: number;
  public g: number;
  public b: number;
  /**
   * @param args 绑定内部数据相关的依赖，不在脚本中定义
   * @ignore
   */
  constructor(...args: any);
  public copy(val: Vec3): void;

  static create(val?: Vec3): Vec3;
}
