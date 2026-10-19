import type { VoxelCollision } from '../../voxel/voxel-collision-schema';

export interface ContactConstraint {
  /**
   * 新一轮查找Contacts前，清理contacts
   */
  clearContacts(): void;

  /**
   * 查找并处理两个active的物理模型碰撞关系
   * @param ai 初筛碰撞到的active物理模型ID a
   * @param bi 初筛碰撞到的active物理模型ID b
   * @param filter 碰撞过滤
   */
  processActiveContact(ai: number, bi: number, filter: number[][]): void;

  /**
   * 查找并处理active物理模型与fixed物理模型的碰撞关系
   * @param ai 初筛碰撞到的active物理模型ID
   * @param fi 初筛碰撞到的fixed物理模型ID
   * @param filter 碰撞过滤
   */
  processFixedContact(ai: number, fi: number, filter: number[][]): void;

  /**
   * 将查找到的contacts进行排序
   */
  sortContacts(): void;

  /**
   * 查找地形碰撞关系
   * @param geom 地形相关参数
   */
  findTerrainContacts(geom: VoxelCollision): void;

  /**
   * 碰撞约束pre solve
   */
  presolveCollisions(): void;
  /**
   * 碰撞约束处理
   */
  solveCollisions(): void;

  /**
   * 更新contact record，api接口相关处理
   */
  updateContactIndex(): void;
  /**
   * 处理物理模型锁定
   * 与server与client之间数据传输相关
   */
  propagateLocks(): void;
}
