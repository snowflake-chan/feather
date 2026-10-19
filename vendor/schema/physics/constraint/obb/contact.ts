import {
  DX,
  DY,
  DZ,
  AX,
  AY,
  AZ,
  FIX_DX,
  FIX_DY,
  FIX_DZ,
  BLOCK_VELOCITY,
  INV_DT,
  FIX_AX,
  FIX_AY,
  FIX_AZ,
} from '../../prepare-bodies';
import { CONTACT_BLOCK_SIZE } from '../../def';
import { islandLink } from '../../lock-body';
import type { ContactManifold, ManifoldPoint } from './obb-collide';
import { Vec3 } from './def';

const TMP: Vec3 = [0, 0, 0];
const TMPC1: Vec3 = [0, 0, 0];
const TMPC2: Vec3 = [0, 0, 0];
const TMPP1: Vec3 = [0, 0, 0];
const TMPP2: Vec3 = [0, 0, 0];

const TMP_LV1: Vec3 = [0, 0, 0];
const TMP_LV2: Vec3 = [0, 0, 0];
const TMP_AV1: Vec3 = [0, 0, 0];
const TMP_AV2: Vec3 = [0, 0, 0];

class ContactPointDataBuffer {
  /**
   * 法线
   */
  public nor: Vec3 = [0, 0, 0];
  /**
   * 切线
   */
  public tan: Vec3 = [0, 0, 0];
  /**
   * 副法线
   */
  public bin: Vec3 = [0, 0, 0];

  /**
   * 法线 * 质量的倒数
   * v2 = v1 + 1 / m * n * lambda
   * v2 = v1 + norU1 * lambda
   */
  public norU1: Vec3 = [0, 0, 0];
  /**
   * 切线 * 质量的倒数
   */
  public tanU1: Vec3 = [0, 0, 0];
  /**
   * 副法线 * 质量的倒数
   */
  public binU1: Vec3 = [0, 0, 0];

  /**
   * 法线 * 质量的倒数
   */
  public norU2: Vec3 = [0, 0, 0];
  /**
   * 切线 * 质量的倒数
   */
  public tanU2: Vec3 = [0, 0, 0];
  /**
   * 副法线 * 质量的倒数
   */
  public binU2: Vec3 = [0, 0, 0];

  /**
   * 法线与力臂叉乘
   * w2 = w1 + I逆矩阵(r X n) * lambda
   * w2 = w1 + I逆矩阵norT1 * lambda
   */
  public norT1: Vec3 = [0, 0, 0];
  /**
   * 切线与力臂叉乘
   */
  public tanT1: Vec3 = [0, 0, 0];
  /**
   * 副法线与力臂叉乘
   */
  public binT1: Vec3 = [0, 0, 0];

  /**
   * 法线与力臂叉乘
   */
  public norT2: Vec3 = [0, 0, 0];
  /**
   * 切线与力臂叉乘
   */
  public tanT2: Vec3 = [0, 0, 0];
  /**
   * 副法线与力臂叉乘
   */
  public binT2: Vec3 = [0, 0, 0];

  /**
   * 法线与力臂叉乘再乘惯性张量的逆矩阵
   * w2 = w1 + I逆矩阵(r X n) * lambda
   * w2 = w1 + norTU1 * lambda
   */
  public norTU1: Vec3 = [0, 0, 0];
  /**
   * 切线与力臂叉乘再乘惯性张量的逆矩阵
   */
  public tanTU1: Vec3 = [0, 0, 0];
  /**
   * 副法线与力臂叉乘再乘惯性张量的逆矩阵
   */
  public binTU1: Vec3 = [0, 0, 0];

  /**
   * 法线与力臂叉乘再乘惯性张量的逆矩阵
   */
  public norTU2: Vec3 = [0, 0, 0];
  /**
   * 切线与力臂叉乘再乘惯性张量的逆矩阵
   */
  public tanTU2: Vec3 = [0, 0, 0];
  /**
   * 副法线与力臂叉乘再乘惯性张量的逆矩阵
   */
  public binTU2: Vec3 = [0, 0, 0];

  /**
   * 法线方向的冲量
   */
  public norImp = 0;
  /**
   * 切线方向的冲量
   */
  public tanImp = 0;
  /**
   * 副法线方向的冲量
   */
  public binImp = 0;

  /**
   * 有效质量
   */
  public norDen = 0;
  /**
   * 有效质量
   */
  public tanDen = 0;
  /**
   * 有效质量
   */
  public binDen = 0;

  public norTar = 0;
}

export class Contact {
  public ai = 0;
  public bi = 0;

  // The coefficient of restitution of the constraint.
  public restitution = 0;
  // The coefficient of friction of the constraint.
  public friction = 0;
  public num = 0;
  public cs = [
    new ContactPointDataBuffer(),
    new ContactPointDataBuffer(),
    new ContactPointDataBuffer(),
    new ContactPointDataBuffer(),
  ];
  /**
   * 传送带地形业务处理
   * 地形速度u
   */
  public blockVU = 0;
  /**
   * 传送带地形业务处理
   * 地形速度v
   */
  public blockVV = 0;

  /**
   * force x
   */
  public fx = 0;
  /**
   * force y
   */
  public fy = 0;
  /**
   * force z
   */
  public fz = 0;

  /**
   * normal x
   */
  public nx = 0;
  /**
   * normal y
   */
  public ny = 0;
  /**
   * normal z
   */
  public nz = 0;
}

let CONTACT_POOL_PTR = 0;
const CONTACT_POOL: Contact[] = [new Contact()];

export type ContactSetType = 'active' | 'fixed' | 'terrain';

export class ContactSet {
  public contacts: Contact[] = [];

  constructor(public type: ContactSetType) {}

  /**
   * 清空所有的contacts
   */
  public clear() {
    this.contacts.length = 0;
    CONTACT_POOL_PTR = 0;
  }

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
  public push(
    ai: number,
    ax: number,
    ay: number,
    az: number,
    ar: number,
    af: number,
    avx: number,
    avy: number,
    avz: number,
    aax: number,
    aay: number,
    aaz: number,
    aim: number,
    aiin0: number,
    aiin1: number,
    aiin2: number,
    aiin3: number,
    aiin4: number,
    aiin5: number,
    aiin6: number,
    aiin7: number,
    aiin8: number,
    bi: number,
    bx: number,
    by: number,
    bz: number,
    br: number,
    bf: number,
    bvx: number,
    bvy: number,
    bvz: number,
    bax: number,
    bay: number,
    baz: number,
    bim: number,
    biin0: number,
    biin1: number,
    biin2: number,
    biin3: number,
    biin4: number,
    biin5: number,
    biin6: number,
    biin7: number,
    biin8: number,
    manifold: ContactManifold,
    addBlockVelocity = false,
  ) {
    // check if we need to grow pool
    const n = CONTACT_POOL.length;
    if (n <= CONTACT_POOL_PTR) {
      CONTACT_POOL.length += CONTACT_BLOCK_SIZE;
      for (let i = n; i < n + CONTACT_BLOCK_SIZE; ++i) {
        CONTACT_POOL[i] = new Contact();
      }
    }

    const contact = CONTACT_POOL[CONTACT_POOL_PTR++];
    contact.ai = ai;
    contact.bi = bi;
    contact.nx = manifold.nx;
    contact.ny = manifold.ny;
    contact.nz = manifold.nz;

    contact.restitution = Math.sqrt(ar * br);
    contact.friction = Math.sqrt(af * bf);

    const lv1: Vec3 = [avx, avy, avz];
    const av1: Vec3 = [aax, aay, aaz];
    const lv2: Vec3 = [bvx, bvy, bvz];
    const av2: Vec3 = [bax, bay, baz];

    const m1 = aim;
    const m2 = bim;

    const m1m2 = m1 + m2;

    contact.num = manifold.numPoints;

    let i = contact.num;

    let c: ContactPointDataBuffer | ContactPointDataBuffer[] = contact.cs;
    let p: ManifoldPoint,
      rvn: number,
      len: number,
      norTar: number,
      sepV: number;

    while (i--) {
      c = contact.cs[i];
      p = manifold.points[i];

      // 转动轴到着力点的位置矢量：r力臂
      TMPP1[0] = p.px - ax;
      TMPP1[1] = p.py - ay;
      TMPP1[2] = p.pz - az;

      TMPP2[0] = p.px - bx;
      TMPP2[1] = p.py - by;
      TMPP2[2] = p.pz - bz;

      // 力臂r与角速度叉乘，加上速度等于接触点的速度
      // cross
      TMPC1[0] = av1[1] * TMPP1[2] - av1[2] * TMPP1[1];
      TMPC1[1] = av1[2] * TMPP1[0] - av1[0] * TMPP1[2];
      TMPC1[2] = av1[0] * TMPP1[1] - av1[1] * TMPP1[0];
      // cross
      TMPC2[0] = av2[1] * TMPP2[2] - av2[2] * TMPP2[1];
      TMPC2[1] = av2[2] * TMPP2[0] - av2[0] * TMPP2[2];
      TMPC2[2] = av2[0] * TMPP2[1] - av2[1] * TMPP2[0];

      // 法向量copy
      c.nor[0] = manifold.nx;
      c.nor[1] = manifold.ny;
      c.nor[2] = manifold.nz;

      // 2号接触点速度减去1号接触点速度
      // C = [v2 + w2 X r2 - (v1 - w1 X r1)] . n
      TMP[0] = lv2[0] + TMPC2[0] - (lv1[0] + TMPC1[0]);
      TMP[1] = lv2[1] + TMPC2[1] - (lv1[1] + TMPC1[1]);
      TMP[2] = lv2[2] + TMPC2[2] - (lv1[2] + TMPC1[2]);

      rvn = c.nor[0] * TMP[0] + c.nor[1] * TMP[1] + c.nor[2] * TMP[2];

      c.tan[0] = TMP[0] - rvn * c.nor[0];
      c.tan[1] = TMP[1] - rvn * c.nor[1];
      c.tan[2] = TMP[2] - rvn * c.nor[2];

      len = c.tan[0] * c.tan[0] + c.tan[1] * c.tan[1] + c.tan[2] * c.tan[2];
      // tangent求切线
      if (len <= 0.04) {
        c.tan[0] = c.nor[1] * c.nor[0] - c.nor[2] * c.nor[2];
        c.tan[1] = -c.nor[2] * c.nor[1] - c.nor[0] * c.nor[0];
        c.tan[2] = c.nor[0] * c.nor[2] + c.nor[1] * c.nor[1];
      }

      // 切线和法线叉乘是副法线，他们三个组成一个坐标系
      // cross
      c.bin[0] = c.nor[1] * c.tan[2] - c.nor[2] * c.tan[1];
      c.bin[1] = c.nor[2] * c.tan[0] - c.nor[0] * c.tan[2];
      c.bin[2] = c.nor[0] * c.tan[1] - c.nor[1] * c.tan[0];

      // 法线，切线，副法线，乘以质量的倒数
      c.norU1[0] = c.nor[0] * m1;
      c.norU1[1] = c.nor[1] * m1;
      c.norU1[2] = c.nor[2] * m1;

      c.norU2[0] = c.nor[0] * m2;
      c.norU2[1] = c.nor[1] * m2;
      c.norU2[2] = c.nor[2] * m2;

      c.tanU1[0] = c.tan[0] * m1;
      c.tanU1[1] = c.tan[1] * m1;
      c.tanU1[2] = c.tan[2] * m1;

      c.tanU2[0] = c.tan[0] * m2;
      c.tanU2[1] = c.tan[1] * m2;
      c.tanU2[2] = c.tan[2] * m2;

      c.binU1[0] = c.bin[0] * m1;
      c.binU1[1] = c.bin[1] * m1;
      c.binU1[2] = c.bin[2] * m1;

      c.binU2[0] = c.bin[0] * m2;
      c.binU2[1] = c.bin[1] * m2;
      c.binU2[2] = c.bin[2] * m2;

      // 法线，切线，副法线，与力臂叉乘
      // cross
      c.norT1[0] = TMPP1[1] * c.nor[2] - TMPP1[2] * c.nor[1];
      c.norT1[1] = TMPP1[2] * c.nor[0] - TMPP1[0] * c.nor[2];
      c.norT1[2] = TMPP1[0] * c.nor[1] - TMPP1[1] * c.nor[0];
      // cross
      c.tanT1[0] = TMPP1[1] * c.tan[2] - TMPP1[2] * c.tan[1];
      c.tanT1[1] = TMPP1[2] * c.tan[0] - TMPP1[0] * c.tan[2];
      c.tanT1[2] = TMPP1[0] * c.tan[1] - TMPP1[1] * c.tan[0];
      // cross
      c.binT1[0] = TMPP1[1] * c.bin[2] - TMPP1[2] * c.bin[1];
      c.binT1[1] = TMPP1[2] * c.bin[0] - TMPP1[0] * c.bin[2];
      c.binT1[2] = TMPP1[0] * c.bin[1] - TMPP1[1] * c.bin[0];

      // cross
      c.norT2[0] = TMPP2[1] * c.nor[2] - TMPP2[2] * c.nor[1];
      c.norT2[1] = TMPP2[2] * c.nor[0] - TMPP2[0] * c.nor[2];
      c.norT2[2] = TMPP2[0] * c.nor[1] - TMPP2[1] * c.nor[0];
      // cross
      c.tanT2[0] = TMPP2[1] * c.tan[2] - TMPP2[2] * c.tan[1];
      c.tanT2[1] = TMPP2[2] * c.tan[0] - TMPP2[0] * c.tan[2];
      c.tanT2[2] = TMPP2[0] * c.tan[1] - TMPP2[1] * c.tan[0];
      // cross
      c.binT2[0] = TMPP2[1] * c.bin[2] - TMPP2[2] * c.bin[1];
      c.binT2[1] = TMPP2[2] * c.bin[0] - TMPP2[0] * c.bin[2];
      c.binT2[2] = TMPP2[0] * c.bin[1] - TMPP2[1] * c.bin[0];

      // 法线，切线，副法线，与力臂叉乘，再乘以惯性张量的逆矩阵
      c.norTU1[0] =
        c.norT1[0] * aiin0 + c.norT1[1] * aiin1 + c.norT1[2] * aiin2;
      c.norTU1[1] =
        c.norT1[0] * aiin3 + c.norT1[1] * aiin4 + c.norT1[2] * aiin5;
      c.norTU1[2] =
        c.norT1[0] * aiin6 + c.norT1[1] * aiin7 + c.norT1[2] * aiin8;
      c.tanTU1[0] =
        c.tanT1[0] * aiin0 + c.tanT1[1] * aiin1 + c.tanT1[2] * aiin2;
      c.tanTU1[1] =
        c.tanT1[0] * aiin3 + c.tanT1[1] * aiin4 + c.tanT1[2] * aiin5;
      c.tanTU1[2] =
        c.tanT1[0] * aiin6 + c.tanT1[1] * aiin7 + c.tanT1[2] * aiin8;
      c.binTU1[0] =
        c.binT1[0] * aiin0 + c.binT1[1] * aiin1 + c.binT1[2] * aiin2;
      c.binTU1[1] =
        c.binT1[0] * aiin3 + c.binT1[1] * aiin4 + c.binT1[2] * aiin5;
      c.binTU1[2] =
        c.binT1[0] * aiin6 + c.binT1[1] * aiin7 + c.binT1[2] * aiin8;

      c.norTU2[0] =
        c.norT2[0] * biin0 + c.norT2[1] * biin1 + c.norT2[2] * biin2;
      c.norTU2[1] =
        c.norT2[0] * biin3 + c.norT2[1] * biin4 + c.norT2[2] * biin5;
      c.norTU2[2] =
        c.norT2[0] * biin6 + c.norT2[1] * biin7 + c.norT2[2] * biin8;
      c.tanTU2[0] =
        c.tanT2[0] * biin0 + c.tanT2[1] * biin1 + c.tanT2[2] * biin2;
      c.tanTU2[1] =
        c.tanT2[0] * biin3 + c.tanT2[1] * biin4 + c.tanT2[2] * biin5;
      c.tanTU2[2] =
        c.tanT2[0] * biin6 + c.tanT2[1] * biin7 + c.tanT2[2] * biin8;
      c.binTU2[0] =
        c.binT2[0] * biin0 + c.binT2[1] * biin1 + c.binT2[2] * biin2;
      c.binTU2[1] =
        c.binT2[0] * biin3 + c.binT2[1] * biin4 + c.binT2[2] * biin5;
      c.binTU2[2] =
        c.binT2[0] * biin6 + c.binT2[1] * biin7 + c.binT2[2] * biin8;

      // 上面的结果再次叉乘力臂
      // cross
      TMPC1[0] = c.norTU1[1] * TMPP1[2] - c.norTU1[2] * TMPP1[1];
      TMPC1[1] = c.norTU1[2] * TMPP1[0] - c.norTU1[0] * TMPP1[2];
      TMPC1[2] = c.norTU1[0] * TMPP1[1] - c.norTU1[1] * TMPP1[0];
      // cross
      TMPC2[0] = c.norTU2[1] * TMPP2[2] - c.norTU2[2] * TMPP2[1];
      TMPC2[1] = c.norTU2[2] * TMPP2[0] - c.norTU2[0] * TMPP2[2];
      TMPC2[2] = c.norTU2[0] * TMPP2[1] - c.norTU2[1] * TMPP2[0];

      TMP[0] = TMPC1[0] + TMPC2[0];
      TMP[1] = TMPC1[1] + TMPC2[1];
      TMP[2] = TMPC1[2] + TMPC2[2];
      c.norDen =
        1 / (m1m2 + c.nor[0] * TMP[0] + c.nor[1] * TMP[1] + c.nor[2] * TMP[2]);

      // cross
      TMPC1[0] = c.tanTU1[1] * TMPP1[2] - c.tanTU1[2] * TMPP1[1];
      TMPC1[1] = c.tanTU1[2] * TMPP1[0] - c.tanTU1[0] * TMPP1[2];
      TMPC1[2] = c.tanTU1[0] * TMPP1[1] - c.tanTU1[1] * TMPP1[0];
      // cross
      TMPC2[0] = c.tanTU2[1] * TMPP2[2] - c.tanTU2[2] * TMPP2[1];
      TMPC2[1] = c.tanTU2[2] * TMPP2[0] - c.tanTU2[0] * TMPP2[2];
      TMPC2[2] = c.tanTU2[0] * TMPP2[1] - c.tanTU2[1] * TMPP2[0];
      // add
      TMP[0] = TMPC1[0] + TMPC2[0];
      TMP[1] = TMPC1[1] + TMPC2[1];
      TMP[2] = TMPC1[2] + TMPC2[2];
      c.tanDen =
        1 / (m1m2 + c.tan[0] * TMP[0] + c.tan[1] * TMP[1] + c.tan[2] * TMP[2]);

      // cross
      TMPC1[0] = c.binTU1[1] * TMPP1[2] - c.binTU1[2] * TMPP1[1];
      TMPC1[1] = c.binTU1[2] * TMPP1[0] - c.binTU1[0] * TMPP1[2];
      TMPC1[2] = c.binTU1[0] * TMPP1[1] - c.binTU1[1] * TMPP1[0];
      // cross
      TMPC2[0] = c.binTU2[1] * TMPP2[2] - c.binTU2[2] * TMPP2[1];
      TMPC2[1] = c.binTU2[2] * TMPP2[0] - c.binTU2[0] * TMPP2[2];
      TMPC2[2] = c.binTU2[0] * TMPP2[1] - c.binTU2[1] * TMPP2[0];

      TMP[0] = TMPC1[0] + TMPC2[0];
      TMP[1] = TMPC1[1] + TMPC2[1];
      TMP[2] = TMPC1[2] + TMPC2[2];
      c.binDen =
        1 / (m1m2 + c.bin[0] * TMP[0] + c.bin[1] * TMP[1] + c.bin[2] * TMP[2]);

      c.norImp = 0;
      c.tanImp = 0;
      c.binImp = 0;

      if (rvn > -1) rvn = 0; // disable bouncing
      norTar = contact.restitution * -rvn; // rvn是当前点产生的冲量
      sepV = (-p.penetration - 0.005) * 0.5;
      if (norTar < sepV) norTar = sepV;
      c.norTar = norTar;

      // 蹦蹦床地形处理
      if (this.type === 'terrain' && addBlockVelocity) {
        const blockCode = contact.bi & 0xfff;
        const bounce = BLOCK_VELOCITY[3 * blockCode + 1];
        c.norTar += bounce;
      }
    }

    // 传送带地形处理，先清空数据
    contact.blockVU = 0;
    contact.blockVV = 0;
    if (this.type === 'terrain' && addBlockVelocity) {
      const blockCode = contact.bi & 0xfff;
      // compute velocity
      const du = BLOCK_VELOCITY[3 * blockCode];
      const dv = BLOCK_VELOCITY[3 * blockCode + 2];
      let vu = du;
      let vv = dv;
      /**
       * 处理地形y轴旋转
       * 旋转数据信息左移VOXEL_ROTATION_SHIFT(即14)位放置在地形id中
       * 因此需要将地形id右移14位获取旋转信息
       */
      switch (contact.bi >>> 14) {
        case 0:
          break;
        case 1:
          vu = dv;
          vv = -du;
          break;
        case 2:
          vu = -du;
          vv = -dv;
          break;
        case 3:
          vu = -dv;
          vv = du;
          break;
      }
      contact.blockVU = vu;
      contact.blockVV = vv;
    }

    this.contacts.push(contact);
  }

  public solve(count: number) {
    for (let n = 0; n < count; n++) {
      for (let i = 0; i < this.contacts.length; i++) {
        const contact = this.contacts[i];

        contact.fx = 0;
        contact.fy = 0;
        contact.fz = 0;

        TMP_LV1[0] = DX[contact.ai];
        TMP_LV1[1] = DY[contact.ai];
        TMP_LV1[2] = DZ[contact.ai];

        TMP_AV1[0] = AX[contact.ai];
        TMP_AV1[1] = AY[contact.ai];
        TMP_AV1[2] = AZ[contact.ai];

        if (this.type === 'active') {
          TMP_LV2[0] = DX[contact.bi];
          TMP_LV2[1] = DY[contact.bi];
          TMP_LV2[2] = DZ[contact.bi];

          TMP_AV2[0] = AX[contact.bi];
          TMP_AV2[1] = AY[contact.bi];
          TMP_AV2[2] = AZ[contact.bi];
        } else if (this.type === 'fixed') {
          TMP_LV2[0] = FIX_DX[contact.bi];
          TMP_LV2[1] = FIX_DY[contact.bi];
          TMP_LV2[2] = FIX_DZ[contact.bi];

          TMP_AV2[0] = FIX_AX[contact.bi];
          TMP_AV2[1] = FIX_AY[contact.bi];
          TMP_AV2[2] = FIX_AZ[contact.bi];
        } else {
          TMP_LV2[0] = 0;
          TMP_LV2[1] = 0;
          TMP_LV2[2] = 0;

          TMP_AV2[0] = 0;
          TMP_AV2[1] = 0;
          TMP_AV2[2] = 0;
        }

        TMP_LV2[0] += contact.blockVV;
        TMP_LV2[2] += contact.blockVU;

        let oldImp1: number,
          newImp1: number,
          oldImp2: number,
          newImp2: number,
          rvn: number,
          norImp: number,
          tanImp: number,
          binImp: number,
          max: number,
          len: number,
          c: ContactPointDataBuffer;
        let j = contact.num;

        while (j--) {
          c = contact.cs[j];

          norImp = c.norImp;
          tanImp = c.tanImp;
          binImp = c.binImp;

          max = contact.friction * Math.abs(norImp);

          TMP[0] = TMP_LV2[0] - TMP_LV1[0];
          TMP[1] = TMP_LV2[1] - TMP_LV1[1];
          TMP[2] = TMP_LV2[2] - TMP_LV1[2];

          // rvn = dot(TMP, c.tan) + dot(TMP_AV2, c.tanT2) - dot(TMP_AV1, c.tanT1);
          rvn =
            TMP[0] * c.tan[0] +
            TMP[1] * c.tan[1] +
            TMP[2] * c.tan[2] +
            (TMP_AV2[0] * c.tanT2[0] +
              TMP_AV2[1] * c.tanT2[1] +
              TMP_AV2[2] * c.tanT2[2]) -
            (TMP_AV1[0] * c.tanT1[0] +
              TMP_AV1[1] * c.tanT1[1] +
              TMP_AV1[2] * c.tanT1[2]);

          oldImp1 = tanImp;
          newImp1 = rvn * c.tanDen;
          tanImp += newImp1;

          // rvn = dot(TMP, c.bin) + dot(TMP_AV2, c.binT2) - dot(TMP_AV1, c.binT1);
          rvn =
            TMP[0] * c.bin[0] +
            TMP[1] * c.bin[1] +
            TMP[2] * c.bin[2] +
            (TMP_AV2[0] * c.binT2[0] +
              TMP_AV2[1] * c.binT2[1] +
              TMP_AV2[2] * c.binT2[2]) -
            (TMP_AV1[0] * c.binT1[0] +
              TMP_AV1[1] * c.binT1[1] +
              TMP_AV1[2] * c.binT1[2]);

          oldImp2 = binImp;
          newImp2 = rvn * c.binDen;
          binImp += newImp2;

          // cone friction clamp
          len = tanImp * tanImp + binImp * binImp;
          if (len > max * max) {
            len = max / Math.sqrt(len);
            tanImp *= len;
            binImp *= len;
          }

          newImp1 = tanImp - oldImp1;
          newImp2 = binImp - oldImp2;

          TMP[0] = c.tanU1[0] * newImp1 + c.binU1[0] * newImp2;
          TMP[1] = c.tanU1[1] * newImp1 + c.binU1[1] * newImp2;
          TMP[2] = c.tanU1[2] * newImp1 + c.binU1[2] * newImp2;

          TMP_LV1[0] = TMP_LV1[0] + TMP[0];
          TMP_LV1[1] = TMP_LV1[1] + TMP[1];
          TMP_LV1[2] = TMP_LV1[2] + TMP[2];

          TMP[0] = c.tanTU1[0] * newImp1 + c.binTU1[0] * newImp2;
          TMP[1] = c.tanTU1[1] * newImp1 + c.binTU1[1] * newImp2;
          TMP[2] = c.tanTU1[2] * newImp1 + c.binTU1[2] * newImp2;

          TMP_AV1[0] = TMP_AV1[0] + TMP[0];
          TMP_AV1[1] = TMP_AV1[1] + TMP[1];
          TMP_AV1[2] = TMP_AV1[2] + TMP[2];

          TMP[0] = c.tanU2[0] * newImp1 + c.binU2[0] * newImp2;
          TMP[1] = c.tanU2[1] * newImp1 + c.binU2[1] * newImp2;
          TMP[2] = c.tanU2[2] * newImp1 + c.binU2[2] * newImp2;

          TMP_LV2[0] = TMP_LV2[0] - TMP[0];
          TMP_LV2[1] = TMP_LV2[1] - TMP[1];
          TMP_LV2[2] = TMP_LV2[2] - TMP[2];

          TMP[0] = c.tanTU2[0] * newImp1 + c.binTU2[0] * newImp2;
          TMP[1] = c.tanTU2[1] * newImp1 + c.binTU2[1] * newImp2;
          TMP[2] = c.tanTU2[2] * newImp1 + c.binTU2[2] * newImp2;

          TMP_AV2[0] = TMP_AV2[0] - TMP[0];
          TMP_AV2[1] = TMP_AV2[1] - TMP[1];
          TMP_AV2[2] = TMP_AV2[2] - TMP[2];

          // restitution part

          TMP[0] = TMP_LV2[0] - TMP_LV1[0];
          TMP[1] = TMP_LV2[1] - TMP_LV1[1];
          TMP[2] = TMP_LV2[2] - TMP_LV1[2];

          // rvn = dot(TMP, c.nor) + dot(TMP_AV2, c.norT2) - dot(TMP_AV1, c.norT1);
          rvn =
            TMP[0] * c.nor[0] +
            TMP[1] * c.nor[1] +
            TMP[2] * c.nor[2] +
            (TMP_AV2[0] * c.norT2[0] +
              TMP_AV2[1] * c.norT2[1] +
              TMP_AV2[2] * c.norT2[2]) -
            (TMP_AV1[0] * c.norT1[0] +
              TMP_AV1[1] * c.norT1[1] +
              TMP_AV1[2] * c.norT1[2]);

          oldImp1 = norImp;
          newImp1 = (rvn - c.norTar) * c.norDen;

          norImp += newImp1;
          if (norImp > 0) norImp = 0;

          newImp1 = norImp - oldImp1;

          TMP_LV1[0] = TMP_LV1[0] + c.norU1[0] * newImp1;
          TMP_LV1[1] = TMP_LV1[1] + c.norU1[1] * newImp1;
          TMP_LV1[2] = TMP_LV1[2] + c.norU1[2] * newImp1;

          TMP_AV1[0] = TMP_AV1[0] + c.norTU1[0] * newImp1;
          TMP_AV1[1] = TMP_AV1[1] + c.norTU1[1] * newImp1;
          TMP_AV1[2] = TMP_AV1[2] + c.norTU1[2] * newImp1;

          TMP_LV2[0] = TMP_LV2[0] - c.norU2[0] * newImp1;
          TMP_LV2[1] = TMP_LV2[1] - c.norU2[1] * newImp1;
          TMP_LV2[2] = TMP_LV2[2] - c.norU2[2] * newImp1;

          TMP_AV2[0] = TMP_AV2[0] - c.norTU2[0] * newImp1;
          TMP_AV2[1] = TMP_AV2[1] - c.norTU2[1] * newImp1;
          TMP_AV2[2] = TMP_AV2[2] - c.norTU2[2] * newImp1;

          c.norImp = norImp;
          c.tanImp = tanImp;
          c.binImp = binImp;

          // 计算force
          contact.fx += c.nor[0] * norImp * INV_DT;
          contact.fy += c.nor[1] * norImp * INV_DT;
          contact.fz += c.nor[2] * norImp * INV_DT;

          contact.fx += (c.tan[0] * tanImp + c.bin[0] * binImp) * INV_DT;
          contact.fy += (c.tan[1] * tanImp + c.bin[1] * binImp) * INV_DT;
          contact.fz += (c.tan[2] * tanImp + c.bin[2] * binImp) * INV_DT;
        }

        DX[contact.ai] = TMP_LV1[0];
        DY[contact.ai] = TMP_LV1[1];
        DZ[contact.ai] = TMP_LV1[2];

        AX[contact.ai] = TMP_AV1[0];
        AY[contact.ai] = TMP_AV1[1];
        AZ[contact.ai] = TMP_AV1[2];

        if (this.type === 'active') {
          DX[contact.bi] = TMP_LV2[0];
          DY[contact.bi] = TMP_LV2[1];
          DZ[contact.bi] = TMP_LV2[2];

          AX[contact.bi] = TMP_AV2[0];
          AY[contact.bi] = TMP_AV2[1];
          AZ[contact.bi] = TMP_AV2[2];
        }
      }
    }
  }

  // scan over objects and propagate lock set
  public propagateLocks() {
    const c = this.contacts;
    for (let i = 0; i < c.length; ++i) {
      const { ai, bi } = c[i];
      islandLink(ai, bi);
    }
  }
}
