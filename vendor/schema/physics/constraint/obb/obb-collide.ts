import { ALLOC, ArrayType } from './def';

/**
 * The class holds details of the contact point.
 */
export class ManifoldPoint {
  //  The position of this manifold point.
  public px = 0;
  public py = 0;
  public pz = 0;

  // The depth of penetration.
  public penetration = 0;
}

/**
 * A contact manifold between two shapes.
 */
export class ContactManifold {
  // The number of manifold points.
  public numPoints = 0;

  // The normal vector of this manifold
  public nx = 0;
  public ny = 0;
  public nz = 0;

  // The manifold points.
  public points = [
    new ManifoldPoint(),
    new ManifoldPoint(),
    new ManifoldPoint(),
    new ManifoldPoint(),
  ];

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
  public separatingAxisIndex = 0;

  /**
   * 是否在碰撞分离轴的右侧
   */
  public right = false;

  //  Add a point into this manifold.
  public addPoint(px: number, py: number, pz: number, penetration: number) {
    this.points[this.numPoints].px = px;
    this.points[this.numPoints].py = py;
    this.points[this.numPoints].pz = pz;
    this.points[this.numPoints].penetration = penetration;

    this.numPoints++;
  }
}

const EPSILON = 0.00001;

/**
 * 刚体A的半径
 * 即half size * 每个轴的向量
 */
const A_WR = ALLOC(3);
const A_HR = ALLOC(3);
const A_DR = ALLOC(3);

/**
 * 刚体A的8个顶点，三个一组一共24位
 */
const A_VERTICES = ALLOC(24);

/**
 * 刚体B的半径
 * 即half size * 每个轴的想来那个
 */
const B_WR = ALLOC(3);
const B_HR = ALLOC(3);
const B_DR = ALLOC(3);
/**
 * 刚体B的8个顶点，三个一组一共24位
 */
const B_VERTICES = ALLOC(24);

/**
 * 刚体A到B的距离差
 * 即 B_POS - A_POS
 */
const POS_DIFF = ALLOC(3);

/**
 * 分离轴，一共有 3 + 3 + 9 = 15 个分离轴
 */
const SEPARATING_AXIS: ArrayType[] = [];
for (let i = 0; i < 15; i++) {
  SEPARATING_AXIS.push(ALLOC(3));
}

/**
 * 在分离轴的左边还是右边的flags
 * 0代表false，1代表true
 */
const RIGHTS = new Uint8Array(15);
/**
 * 在分离轴上投影重叠的距离
 * 大于0表示分离
 */
const OVERLAPS = ALLOC(15);
/**
 * 分离轴是否可用的flags
 * 当两个轴接近于平行的时候叉乘得出的分离轴数据不可用
 */
const INVALID = new Uint8Array(15);

/**
 * 碰撞面四个顶点数据
 */
const QUAD = ALLOC(12);
/**
 * 从两个碰撞面中截取的碰撞点，数量不超过8个
 */
const CLIP_VERTICES = ALLOC(24);
/**
 * 计算时候来回倒腾用的临时数据
 */
const TMP_CLIP_VERTICES = ALLOC(24);
const USED: boolean[] = [];

const N = ALLOC(3);
const N1 = ALLOC(3);
const N2 = ALLOC(3);
const C = ALLOC(3);
const S1 = ALLOC(3);
const S2 = ALLOC(3);

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
export function OBBOBBintersect(
  ax: number,
  ay: number,
  az: number,
  ahsx: number,
  ahsy: number,
  ahsz: number,
  am0: number,
  am1: number,
  am2: number,
  am3: number,
  am4: number,
  am5: number,
  am6: number,
  am7: number,
  am8: number,
  bx: number,
  by: number,
  bz: number,
  bhsx: number,
  bhsy: number,
  bhsz: number,
  bm0: number,
  bm1: number,
  bm2: number,
  bm3: number,
  bm4: number,
  bm5: number,
  bm6: number,
  bm7: number,
  bm8: number,
  manifold: ContactManifold,
  isTerrain = false,
  /**
   * 地形暴露在外界的方向
   * 一位代表一个面，1表示暴露在外面，0表示没有暴露在外面
   * 每个位数分别代表
   * 0 b 1  1  1  1  1  1
   *    +z -z +y -y +x -x
   * 默认0b111111，代表所有面都暴露在外面
   */
  faces = 0b111111,
) {
  A_WR[0] = am0 * ahsx;
  A_WR[1] = am1 * ahsx;
  A_WR[2] = am2 * ahsx;

  A_HR[0] = am3 * ahsy;
  A_HR[1] = am4 * ahsy;
  A_HR[2] = am5 * ahsy;

  A_DR[0] = am6 * ahsz;
  A_DR[1] = am7 * ahsz;
  A_DR[2] = am8 * ahsz;

  // 8个顶点数据
  //v1
  A_VERTICES[0] = ax + A_WR[0] + A_HR[0] + A_DR[0];
  A_VERTICES[1] = ay + A_WR[1] + A_HR[1] + A_DR[1];
  A_VERTICES[2] = az + A_WR[2] + A_HR[2] + A_DR[2];
  //v2
  A_VERTICES[3] = ax + A_WR[0] + A_HR[0] - A_DR[0];
  A_VERTICES[4] = ay + A_WR[1] + A_HR[1] - A_DR[1];
  A_VERTICES[5] = az + A_WR[2] + A_HR[2] - A_DR[2];
  //v3
  A_VERTICES[6] = ax + A_WR[0] - A_HR[0] + A_DR[0];
  A_VERTICES[7] = ay + A_WR[1] - A_HR[1] + A_DR[1];
  A_VERTICES[8] = az + A_WR[2] - A_HR[2] + A_DR[2];
  //v4
  A_VERTICES[9] = ax + A_WR[0] - A_HR[0] - A_DR[0];
  A_VERTICES[10] = ay + A_WR[1] - A_HR[1] - A_DR[1];
  A_VERTICES[11] = az + A_WR[2] - A_HR[2] - A_DR[2];
  //v5
  A_VERTICES[12] = ax - A_WR[0] + A_HR[0] + A_DR[0];
  A_VERTICES[13] = ay - A_WR[1] + A_HR[1] + A_DR[1];
  A_VERTICES[14] = az - A_WR[2] + A_HR[2] + A_DR[2];
  //v6
  A_VERTICES[15] = ax - A_WR[0] + A_HR[0] - A_DR[0];
  A_VERTICES[16] = ay - A_WR[1] + A_HR[1] - A_DR[1];
  A_VERTICES[17] = az - A_WR[2] + A_HR[2] - A_DR[2];
  //v7
  A_VERTICES[18] = ax - A_WR[0] - A_HR[0] + A_DR[0];
  A_VERTICES[19] = ay - A_WR[1] - A_HR[1] + A_DR[1];
  A_VERTICES[20] = az - A_WR[2] - A_HR[2] + A_DR[2];
  //v8
  A_VERTICES[21] = ax - A_WR[0] - A_HR[0] - A_DR[0];
  A_VERTICES[22] = ay - A_WR[1] - A_HR[1] - A_DR[1];
  A_VERTICES[23] = az - A_WR[2] - A_HR[2] - A_DR[2];

  B_WR[0] = bm0 * bhsx;
  B_WR[1] = bm1 * bhsx;
  B_WR[2] = bm2 * bhsx;

  B_HR[0] = bm3 * bhsy;
  B_HR[1] = bm4 * bhsy;
  B_HR[2] = bm5 * bhsy;

  B_DR[0] = bm6 * bhsz;
  B_DR[1] = bm7 * bhsz;
  B_DR[2] = bm8 * bhsz;

  // 8个顶点数据
  //v1
  B_VERTICES[0] = bx + B_WR[0] + B_HR[0] + B_DR[0];
  B_VERTICES[1] = by + B_WR[1] + B_HR[1] + B_DR[1];
  B_VERTICES[2] = bz + B_WR[2] + B_HR[2] + B_DR[2];
  //v2
  B_VERTICES[3] = bx + B_WR[0] + B_HR[0] - B_DR[0];
  B_VERTICES[4] = by + B_WR[1] + B_HR[1] - B_DR[1];
  B_VERTICES[5] = bz + B_WR[2] + B_HR[2] - B_DR[2];
  //v3
  B_VERTICES[6] = bx + B_WR[0] - B_HR[0] + B_DR[0];
  B_VERTICES[7] = by + B_WR[1] - B_HR[1] + B_DR[1];
  B_VERTICES[8] = bz + B_WR[2] - B_HR[2] + B_DR[2];
  //v4
  B_VERTICES[9] = bx + B_WR[0] - B_HR[0] - B_DR[0];
  B_VERTICES[10] = by + B_WR[1] - B_HR[1] - B_DR[1];
  B_VERTICES[11] = bz + B_WR[2] - B_HR[2] - B_DR[2];
  //v5
  B_VERTICES[12] = bx - B_WR[0] + B_HR[0] + B_DR[0];
  B_VERTICES[13] = by - B_WR[1] + B_HR[1] + B_DR[1];
  B_VERTICES[14] = bz - B_WR[2] + B_HR[2] + B_DR[2];
  //v6
  B_VERTICES[15] = bx - B_WR[0] + B_HR[0] - B_DR[0];
  B_VERTICES[16] = by - B_WR[1] + B_HR[1] - B_DR[1];
  B_VERTICES[17] = bz - B_WR[2] + B_HR[2] - B_DR[2];
  //v7
  B_VERTICES[18] = bx - B_WR[0] - B_HR[0] + B_DR[0];
  B_VERTICES[19] = by - B_WR[1] - B_HR[1] + B_DR[1];
  B_VERTICES[20] = bz - B_WR[2] - B_HR[2] + B_DR[2];
  //v8
  B_VERTICES[21] = bx - B_WR[0] - B_HR[0] - B_DR[0];
  B_VERTICES[22] = by - B_WR[1] - B_HR[1] - B_DR[1];
  B_VERTICES[23] = bz - B_WR[2] - B_HR[2] - B_DR[2];

  // 计算15个分离轴的数据
  // obbA.xAxis
  SEPARATING_AXIS[0][0] = am0;
  SEPARATING_AXIS[0][1] = am1;
  SEPARATING_AXIS[0][2] = am2;
  // obbA.yAxis
  SEPARATING_AXIS[1][0] = am3;
  SEPARATING_AXIS[1][1] = am4;
  SEPARATING_AXIS[1][2] = am5;
  // obbA.zAxis
  SEPARATING_AXIS[2][0] = am6;
  SEPARATING_AXIS[2][1] = am7;
  SEPARATING_AXIS[2][2] = am8;

  // obbB.xAxis
  SEPARATING_AXIS[3][0] = bm0;
  SEPARATING_AXIS[3][1] = bm1;
  SEPARATING_AXIS[3][2] = bm2;
  // obbB.yAxis
  SEPARATING_AXIS[4][0] = bm3;
  SEPARATING_AXIS[4][1] = bm4;
  SEPARATING_AXIS[4][2] = bm5;
  // obbB.zAxis
  SEPARATING_AXIS[5][0] = bm6;
  SEPARATING_AXIS[5][1] = bm7;
  SEPARATING_AXIS[5][2] = bm8;

  // cross(SEPARATING_AXIS[6], obbA.xAxis, obbB.xAxis);
  SEPARATING_AXIS[6][0] = am1 * bm2 - am2 * bm1;
  SEPARATING_AXIS[6][1] = am2 * bm0 - am0 * bm2;
  SEPARATING_AXIS[6][2] = am0 * bm1 - am1 * bm0;
  // cross(SEPARATING_AXIS[7], obbA.xAxis, obbB.yAxis);
  SEPARATING_AXIS[7][0] = am1 * bm5 - am2 * bm4;
  SEPARATING_AXIS[7][1] = am2 * bm3 - am0 * bm5;
  SEPARATING_AXIS[7][2] = am0 * bm4 - am1 * bm3;
  // cross(SEPARATING_AXIS[8], obbA.xAxis, obbB.zAxis);
  SEPARATING_AXIS[8][0] = am1 * bm8 - am2 * bm7;
  SEPARATING_AXIS[8][1] = am2 * bm6 - am0 * bm8;
  SEPARATING_AXIS[8][2] = am0 * bm7 - am1 * bm6;

  // cross(SEPARATING_AXIS[9], obbA.yAxis, obbB.xAxis);
  SEPARATING_AXIS[9][0] = am4 * bm2 - am5 * bm1;
  SEPARATING_AXIS[9][1] = am5 * bm0 - am3 * bm2;
  SEPARATING_AXIS[9][2] = am3 * bm1 - am4 * bm0;
  // cross(SEPARATING_AXIS[10], obbA.yAxis, obbB.yAxis);
  SEPARATING_AXIS[10][0] = am4 * bm5 - am5 * bm4;
  SEPARATING_AXIS[10][1] = am5 * bm3 - am3 * bm5;
  SEPARATING_AXIS[10][2] = am3 * bm4 - am4 * bm3;
  // cross(SEPARATING_AXIS[11], obbA.yAxis, obbB.zAxis);
  SEPARATING_AXIS[11][0] = am4 * bm8 - am5 * bm7;
  SEPARATING_AXIS[11][1] = am5 * bm6 - am3 * bm8;
  SEPARATING_AXIS[11][2] = am3 * bm7 - am4 * bm6;

  // cross(SEPARATING_AXIS[12], obbA.zAxis, obbB.xAxis);
  SEPARATING_AXIS[12][0] = am7 * bm2 - am8 * bm1;
  SEPARATING_AXIS[12][1] = am8 * bm0 - am6 * bm2;
  SEPARATING_AXIS[12][2] = am6 * bm1 - am7 * bm0;
  // cross(SEPARATING_AXIS[13], obbA.zAxis, obbB.yAxis);
  SEPARATING_AXIS[13][0] = am7 * bm5 - am8 * bm4;
  SEPARATING_AXIS[13][1] = am8 * bm3 - am6 * bm5;
  SEPARATING_AXIS[13][2] = am6 * bm4 - am7 * bm3;
  // cross(SEPARATING_AXIS[14], obbA.zAxis, obbB.zAxis);
  SEPARATING_AXIS[14][0] = am7 * bm8 - am8 * bm7;
  SEPARATING_AXIS[14][1] = am8 * bm6 - am6 * bm8;
  SEPARATING_AXIS[14][2] = am6 * bm7 - am7 * bm6;

  POS_DIFF[0] = bx - ax;
  POS_DIFF[1] = by - ay;
  POS_DIFF[2] = bz - az;

  // 下面计算检查15个分离轴上的定点投影是否重叠
  // 如果相离（即overlaps的值大于0）则说明两个刚体没有碰撞到，直接return
  // 否则计算重叠overlaps的距离
  // http://marupeke296.com/COL_3D_No13_OBBvsOBB.html
  let len = 0;
  let ra = 0;
  let rb = 0;
  for (let i = 0; i < 3; i++) {
    // 计算第i个SEPARATING_AXIS，rb由3,4,5方向投影组成
    len =
      SEPARATING_AXIS[i][0] * POS_DIFF[0] +
      SEPARATING_AXIS[i][1] * POS_DIFF[1] +
      SEPARATING_AXIS[i][2] * POS_DIFF[2];

    // 检查分离轴与 a - b 刚体方向是钝角还是锐角
    // 锐角是1，钝角或者90度垂直是0
    // 记录投影值在分离轴的左边还是右边
    RIGHTS[i] = len > 0 ? 1 : 0;
    len = Math.abs(len);

    switch (i) {
      case 0:
        ra = ahsx;
        break;
      case 1:
        ra = ahsy;
        break;
      case 2:
        ra = ahsz;
        break;
    }

    // 单位方向的投影长度 * 真正的half size 就是 最后投影长度的半径
    rb =
      Math.abs(
        SEPARATING_AXIS[i][0] * SEPARATING_AXIS[3][0] +
          SEPARATING_AXIS[i][1] * SEPARATING_AXIS[3][1] +
          SEPARATING_AXIS[i][2] * SEPARATING_AXIS[3][2],
      ) *
        bhsx +
      Math.abs(
        SEPARATING_AXIS[i][0] * SEPARATING_AXIS[4][0] +
          SEPARATING_AXIS[i][1] * SEPARATING_AXIS[4][1] +
          SEPARATING_AXIS[i][2] * SEPARATING_AXIS[4][2],
      ) *
        bhsy +
      Math.abs(
        SEPARATING_AXIS[i][0] * SEPARATING_AXIS[5][0] +
          SEPARATING_AXIS[i][1] * SEPARATING_AXIS[5][1] +
          SEPARATING_AXIS[i][2] * SEPARATING_AXIS[5][2],
      ) *
        bhsz;

    OVERLAPS[i] = len - ra - rb;
    if (OVERLAPS[i] > 0) {
      return;
    }
  }

  for (let i = 3; i < 6; i++) {
    // 计算第i个SEPARATING_AXIS，rb由0,1,2方向投影组成
    len =
      SEPARATING_AXIS[i][0] * POS_DIFF[0] +
      SEPARATING_AXIS[i][1] * POS_DIFF[1] +
      SEPARATING_AXIS[i][2] * POS_DIFF[2];

    // 检查分离轴与 a - b 刚体方向是钝角还是锐角
    // 锐角是1，钝角或者90度垂直是0
    // 记录投影值在分离轴的左边还是右边
    RIGHTS[i] = len > 0 ? 1 : 0;
    len = Math.abs(len);

    switch (i) {
      case 3:
        ra = bhsx;
        break;
      case 4:
        ra = bhsy;
        break;
      case 5:
        ra = bhsz;
        break;
    }

    // 单位方向的投影长度 * 真正的half size 就是 最后投影长度的半径
    rb =
      Math.abs(
        SEPARATING_AXIS[i][0] * SEPARATING_AXIS[0][0] +
          SEPARATING_AXIS[i][1] * SEPARATING_AXIS[0][1] +
          SEPARATING_AXIS[i][2] * SEPARATING_AXIS[0][2],
      ) *
        ahsx +
      Math.abs(
        SEPARATING_AXIS[i][0] * SEPARATING_AXIS[1][0] +
          SEPARATING_AXIS[i][1] * SEPARATING_AXIS[1][1] +
          SEPARATING_AXIS[i][2] * SEPARATING_AXIS[1][2],
      ) *
        ahsy +
      Math.abs(
        SEPARATING_AXIS[i][0] * SEPARATING_AXIS[2][0] +
          SEPARATING_AXIS[i][1] * SEPARATING_AXIS[2][1] +
          SEPARATING_AXIS[i][2] * SEPARATING_AXIS[2][2],
      ) *
        ahsz;

    OVERLAPS[i] = len - ra - rb;
    if (OVERLAPS[i] > 0) {
      return;
    }
  }

  // 计算第6个SEPARATING_AXIS，ra由1,2方向投影组成，rb由4,5方向投影组成

  // 叉乘的向量模长等于两个基向量组成的平行四边形面积
  // 如果向量模(即len)接近0，则两个基向量基本平行
  len =
    SEPARATING_AXIS[6][0] * SEPARATING_AXIS[6][0] +
    SEPARATING_AXIS[6][1] * SEPARATING_AXIS[6][1] +
    SEPARATING_AXIS[6][2] * SEPARATING_AXIS[6][2];

  if (len > EPSILON) {
    // normalized
    const d = 1 / Math.sqrt(len);
    SEPARATING_AXIS[6][0] *= d;
    SEPARATING_AXIS[6][1] *= d;
    SEPARATING_AXIS[6][2] *= d;

    len =
      SEPARATING_AXIS[6][0] * POS_DIFF[0] +
      SEPARATING_AXIS[6][1] * POS_DIFF[1] +
      SEPARATING_AXIS[6][2] * POS_DIFF[2];

    RIGHTS[6] = len > 0 ? 1 : 0;
    len = Math.abs(len);

    ra =
      Math.abs(
        SEPARATING_AXIS[6][0] * SEPARATING_AXIS[1][0] +
          SEPARATING_AXIS[6][1] * SEPARATING_AXIS[1][1] +
          SEPARATING_AXIS[6][2] * SEPARATING_AXIS[1][2],
      ) *
        ahsy +
      Math.abs(
        SEPARATING_AXIS[6][0] * SEPARATING_AXIS[2][0] +
          SEPARATING_AXIS[6][1] * SEPARATING_AXIS[2][1] +
          SEPARATING_AXIS[6][2] * SEPARATING_AXIS[2][2],
      ) *
        ahsz;

    rb =
      Math.abs(
        SEPARATING_AXIS[6][0] * SEPARATING_AXIS[4][0] +
          SEPARATING_AXIS[6][1] * SEPARATING_AXIS[4][1] +
          SEPARATING_AXIS[6][2] * SEPARATING_AXIS[4][2],
      ) *
        bhsy +
      Math.abs(
        SEPARATING_AXIS[6][0] * SEPARATING_AXIS[5][0] +
          SEPARATING_AXIS[6][1] * SEPARATING_AXIS[5][1] +
          SEPARATING_AXIS[6][2] * SEPARATING_AXIS[5][2],
      ) *
        bhsz;

    OVERLAPS[6] = len - ra - rb;
    INVALID[6] = 0;
  } else {
    // 两个基向量基本平行，invalid设为1
    // 就不能仅凭overlaps大于0判断两个图形相离了。得接着往下看
    OVERLAPS[6] = 0;
    INVALID[6] = 1;
    RIGHTS[6] = 0;
  }
  if (!INVALID[6] && OVERLAPS[6] > 0) {
    return;
  }

  // 计算第7个SEPARATING_AXIS，ra由1,2方向投影组成，rb由3,5方向投影组成

  // 叉乘的向量模长等于两个基向量组成的平行四边形面积
  // 如果向量模(即len)接近0，则两个基向量基本平行
  len =
    SEPARATING_AXIS[7][0] * SEPARATING_AXIS[7][0] +
    SEPARATING_AXIS[7][1] * SEPARATING_AXIS[7][1] +
    SEPARATING_AXIS[7][2] * SEPARATING_AXIS[7][2];

  if (len > EPSILON) {
    // normalized
    const d = 1 / Math.sqrt(len);
    SEPARATING_AXIS[7][0] *= d;
    SEPARATING_AXIS[7][1] *= d;
    SEPARATING_AXIS[7][2] *= d;

    len =
      SEPARATING_AXIS[7][0] * POS_DIFF[0] +
      SEPARATING_AXIS[7][1] * POS_DIFF[1] +
      SEPARATING_AXIS[7][2] * POS_DIFF[2];

    RIGHTS[7] = len > 0 ? 1 : 0;
    len = Math.abs(len);

    ra =
      Math.abs(
        SEPARATING_AXIS[7][0] * SEPARATING_AXIS[1][0] +
          SEPARATING_AXIS[7][1] * SEPARATING_AXIS[1][1] +
          SEPARATING_AXIS[7][2] * SEPARATING_AXIS[1][2],
      ) *
        ahsy +
      Math.abs(
        SEPARATING_AXIS[7][0] * SEPARATING_AXIS[2][0] +
          SEPARATING_AXIS[7][1] * SEPARATING_AXIS[2][1] +
          SEPARATING_AXIS[7][2] * SEPARATING_AXIS[2][2],
      ) *
        ahsz;

    rb =
      Math.abs(
        SEPARATING_AXIS[7][0] * SEPARATING_AXIS[3][0] +
          SEPARATING_AXIS[7][1] * SEPARATING_AXIS[3][1] +
          SEPARATING_AXIS[7][2] * SEPARATING_AXIS[3][2],
      ) *
        bhsx +
      Math.abs(
        SEPARATING_AXIS[7][0] * SEPARATING_AXIS[5][0] +
          SEPARATING_AXIS[7][1] * SEPARATING_AXIS[5][1] +
          SEPARATING_AXIS[7][2] * SEPARATING_AXIS[5][2],
      ) *
        bhsz;

    OVERLAPS[7] = len - ra - rb;
    INVALID[7] = 0;
  } else {
    // 两个基向量基本平行，invalid设为1
    // 就不能仅凭overlaps大于0判断两个图形相离了。得接着往下看
    OVERLAPS[7] = 0;
    INVALID[7] = 1;
    RIGHTS[7] = 0;
  }
  if (!INVALID[7] && OVERLAPS[7] > 0) {
    return;
  }

  // 计算第8个SEPARATING_AXIS，ra由1,2方向投影组成，rb由3,4方向投影组成

  // 叉乘的向量模长等于两个基向量组成的平行四边形面积
  // 如果向量模(即len)接近0，则两个基向量基本平行
  len =
    SEPARATING_AXIS[8][0] * SEPARATING_AXIS[8][0] +
    SEPARATING_AXIS[8][1] * SEPARATING_AXIS[8][1] +
    SEPARATING_AXIS[8][2] * SEPARATING_AXIS[8][2];

  if (len > EPSILON) {
    // normalized
    const d = 1 / Math.sqrt(len);
    SEPARATING_AXIS[8][0] *= d;
    SEPARATING_AXIS[8][1] *= d;
    SEPARATING_AXIS[8][2] *= d;

    len =
      SEPARATING_AXIS[8][0] * POS_DIFF[0] +
      SEPARATING_AXIS[8][1] * POS_DIFF[1] +
      SEPARATING_AXIS[8][2] * POS_DIFF[2];

    RIGHTS[8] = len > 0 ? 1 : 0;
    len = Math.abs(len);

    ra =
      Math.abs(
        SEPARATING_AXIS[8][0] * SEPARATING_AXIS[1][0] +
          SEPARATING_AXIS[8][1] * SEPARATING_AXIS[1][1] +
          SEPARATING_AXIS[8][2] * SEPARATING_AXIS[1][2],
      ) *
        ahsy +
      Math.abs(
        SEPARATING_AXIS[8][0] * SEPARATING_AXIS[2][0] +
          SEPARATING_AXIS[8][1] * SEPARATING_AXIS[2][1] +
          SEPARATING_AXIS[8][2] * SEPARATING_AXIS[2][2],
      ) *
        ahsz;

    rb =
      Math.abs(
        SEPARATING_AXIS[8][0] * SEPARATING_AXIS[3][0] +
          SEPARATING_AXIS[8][1] * SEPARATING_AXIS[3][1] +
          SEPARATING_AXIS[8][2] * SEPARATING_AXIS[3][2],
      ) *
        bhsx +
      Math.abs(
        SEPARATING_AXIS[8][0] * SEPARATING_AXIS[4][0] +
          SEPARATING_AXIS[8][1] * SEPARATING_AXIS[4][1] +
          SEPARATING_AXIS[8][2] * SEPARATING_AXIS[4][2],
      ) *
        bhsy;

    OVERLAPS[8] = len - ra - rb;
    INVALID[8] = 0;
  } else {
    // 两个基向量基本平行，invalid设为1
    // 就不能仅凭overlaps大于0判断两个图形相离了。得接着往下看
    OVERLAPS[8] = 0;
    INVALID[8] = 1;
    RIGHTS[8] = 0;
  }
  if (!INVALID[8] && OVERLAPS[8] > 0) {
    return;
  }

  // 计算第9个SEPARATING_AXIS，ra由0,2方向投影组成，rb由4,5方向投影组成

  // 叉乘的向量模长等于两个基向量组成的平行四边形面积
  // 如果向量模(即len)接近0，则两个基向量基本平行
  len =
    SEPARATING_AXIS[9][0] * SEPARATING_AXIS[9][0] +
    SEPARATING_AXIS[9][1] * SEPARATING_AXIS[9][1] +
    SEPARATING_AXIS[9][2] * SEPARATING_AXIS[9][2];

  if (len > EPSILON) {
    // normalized
    const d = 1 / Math.sqrt(len);
    SEPARATING_AXIS[9][0] *= d;
    SEPARATING_AXIS[9][1] *= d;
    SEPARATING_AXIS[9][2] *= d;

    len =
      SEPARATING_AXIS[9][0] * POS_DIFF[0] +
      SEPARATING_AXIS[9][1] * POS_DIFF[1] +
      SEPARATING_AXIS[9][2] * POS_DIFF[2];

    RIGHTS[9] = len > 0 ? 1 : 0;
    len = Math.abs(len);

    ra =
      Math.abs(
        SEPARATING_AXIS[9][0] * SEPARATING_AXIS[0][0] +
          SEPARATING_AXIS[9][1] * SEPARATING_AXIS[0][1] +
          SEPARATING_AXIS[9][2] * SEPARATING_AXIS[0][2],
      ) *
        ahsx +
      Math.abs(
        SEPARATING_AXIS[9][0] * SEPARATING_AXIS[2][0] +
          SEPARATING_AXIS[9][1] * SEPARATING_AXIS[2][1] +
          SEPARATING_AXIS[9][2] * SEPARATING_AXIS[2][2],
      ) *
        ahsz;

    rb =
      Math.abs(
        SEPARATING_AXIS[9][0] * SEPARATING_AXIS[4][0] +
          SEPARATING_AXIS[9][1] * SEPARATING_AXIS[4][1] +
          SEPARATING_AXIS[9][2] * SEPARATING_AXIS[4][2],
      ) *
        bhsy +
      Math.abs(
        SEPARATING_AXIS[9][0] * SEPARATING_AXIS[5][0] +
          SEPARATING_AXIS[9][1] * SEPARATING_AXIS[5][1] +
          SEPARATING_AXIS[9][2] * SEPARATING_AXIS[5][2],
      ) *
        bhsz;

    OVERLAPS[9] = len - ra - rb;
    INVALID[9] = 0;
  } else {
    // 两个基向量基本平行，invalid设为1
    // 就不能仅凭overlaps大于0判断两个图形相离了。得接着往下看
    OVERLAPS[9] = 0;
    INVALID[9] = 1;
    RIGHTS[9] = 0;
  }
  if (!INVALID[9] && OVERLAPS[9] > 0) {
    return;
  }

  // 计算第10个SEPARATING_AXIS，ra由0,2方向投影组成，rb由3,5方向投影组成

  // 叉乘的向量模长等于两个基向量组成的平行四边形面积
  // 如果向量模(即len)接近0，则两个基向量基本平行
  len =
    SEPARATING_AXIS[10][0] * SEPARATING_AXIS[10][0] +
    SEPARATING_AXIS[10][1] * SEPARATING_AXIS[10][1] +
    SEPARATING_AXIS[10][2] * SEPARATING_AXIS[10][2];

  if (len > EPSILON) {
    // normalized
    const d = 1 / Math.sqrt(len);
    SEPARATING_AXIS[10][0] *= d;
    SEPARATING_AXIS[10][1] *= d;
    SEPARATING_AXIS[10][2] *= d;

    len =
      SEPARATING_AXIS[10][0] * POS_DIFF[0] +
      SEPARATING_AXIS[10][1] * POS_DIFF[1] +
      SEPARATING_AXIS[10][2] * POS_DIFF[2];

    RIGHTS[10] = len > 0 ? 1 : 0;
    len = Math.abs(len);

    ra =
      Math.abs(
        SEPARATING_AXIS[10][0] * SEPARATING_AXIS[0][0] +
          SEPARATING_AXIS[10][1] * SEPARATING_AXIS[0][1] +
          SEPARATING_AXIS[10][2] * SEPARATING_AXIS[0][2],
      ) *
        ahsx +
      Math.abs(
        SEPARATING_AXIS[10][0] * SEPARATING_AXIS[2][0] +
          SEPARATING_AXIS[10][1] * SEPARATING_AXIS[2][1] +
          SEPARATING_AXIS[10][2] * SEPARATING_AXIS[2][2],
      ) *
        ahsz;

    rb =
      Math.abs(
        SEPARATING_AXIS[10][0] * SEPARATING_AXIS[3][0] +
          SEPARATING_AXIS[10][1] * SEPARATING_AXIS[3][1] +
          SEPARATING_AXIS[10][2] * SEPARATING_AXIS[3][2],
      ) *
        bhsx +
      Math.abs(
        SEPARATING_AXIS[10][0] * SEPARATING_AXIS[5][0] +
          SEPARATING_AXIS[10][1] * SEPARATING_AXIS[5][1] +
          SEPARATING_AXIS[10][2] * SEPARATING_AXIS[5][2],
      ) *
        bhsz;

    OVERLAPS[10] = len - ra - rb;
    INVALID[10] = 0;
  } else {
    // 两个基向量基本平行，invalid设为1
    // 就不能仅凭overlaps大于0判断两个图形相离了。得接着往下看
    OVERLAPS[10] = 0;
    INVALID[10] = 1;
    RIGHTS[10] = 0;
  }
  if (!INVALID[10] && OVERLAPS[10] > 0) {
    return;
  }

  // 计算第11个SEPARATING_AXIS，ra由0,2方向投影组成，rb由3,4方向投影组成

  // 叉乘的向量模长等于两个基向量组成的平行四边形面积
  // 如果向量模(即len)接近0，则两个基向量基本平行
  len =
    SEPARATING_AXIS[11][0] * SEPARATING_AXIS[11][0] +
    SEPARATING_AXIS[11][1] * SEPARATING_AXIS[11][1] +
    SEPARATING_AXIS[11][2] * SEPARATING_AXIS[11][2];

  if (len > EPSILON) {
    // normalized
    const d = 1 / Math.sqrt(len);
    SEPARATING_AXIS[11][0] *= d;
    SEPARATING_AXIS[11][1] *= d;
    SEPARATING_AXIS[11][2] *= d;

    len =
      SEPARATING_AXIS[11][0] * POS_DIFF[0] +
      SEPARATING_AXIS[11][1] * POS_DIFF[1] +
      SEPARATING_AXIS[11][2] * POS_DIFF[2];

    RIGHTS[11] = len > 0 ? 1 : 0;
    len = Math.abs(len);

    ra =
      Math.abs(
        SEPARATING_AXIS[11][0] * SEPARATING_AXIS[0][0] +
          SEPARATING_AXIS[11][1] * SEPARATING_AXIS[0][1] +
          SEPARATING_AXIS[11][2] * SEPARATING_AXIS[0][2],
      ) *
        ahsx +
      Math.abs(
        SEPARATING_AXIS[11][0] * SEPARATING_AXIS[2][0] +
          SEPARATING_AXIS[11][1] * SEPARATING_AXIS[2][1] +
          SEPARATING_AXIS[11][2] * SEPARATING_AXIS[2][2],
      ) *
        ahsz;

    rb =
      Math.abs(
        SEPARATING_AXIS[11][0] * SEPARATING_AXIS[3][0] +
          SEPARATING_AXIS[11][1] * SEPARATING_AXIS[3][1] +
          SEPARATING_AXIS[11][2] * SEPARATING_AXIS[3][2],
      ) *
        bhsx +
      Math.abs(
        SEPARATING_AXIS[11][0] * SEPARATING_AXIS[4][0] +
          SEPARATING_AXIS[11][1] * SEPARATING_AXIS[4][1] +
          SEPARATING_AXIS[11][2] * SEPARATING_AXIS[4][2],
      ) *
        bhsy;

    OVERLAPS[11] = len - ra - rb;
    INVALID[11] = 0;
  } else {
    // 两个基向量基本平行，invalid设为1
    // 就不能仅凭overlaps大于0判断两个图形相离了。得接着往下看
    OVERLAPS[11] = 0;
    INVALID[11] = 1;
    RIGHTS[11] = 0;
  }
  if (!INVALID[11] && OVERLAPS[11] > 0) {
    return;
  }

  // 计算第12个SEPARATING_AXIS，ra由0,1方向投影组成，rb由4,5方向投影组成

  // 叉乘的向量模长等于两个基向量组成的平行四边形面积
  // 如果向量模(即len)接近0，则两个基向量基本平行
  len =
    SEPARATING_AXIS[12][0] * SEPARATING_AXIS[12][0] +
    SEPARATING_AXIS[12][1] * SEPARATING_AXIS[12][1] +
    SEPARATING_AXIS[12][2] * SEPARATING_AXIS[12][2];

  if (len > EPSILON) {
    // normalized
    const d = 1 / Math.sqrt(len);
    SEPARATING_AXIS[12][0] *= d;
    SEPARATING_AXIS[12][1] *= d;
    SEPARATING_AXIS[12][2] *= d;

    len =
      SEPARATING_AXIS[12][0] * POS_DIFF[0] +
      SEPARATING_AXIS[12][1] * POS_DIFF[1] +
      SEPARATING_AXIS[12][2] * POS_DIFF[2];

    RIGHTS[12] = len > 0 ? 1 : 0;
    len = Math.abs(len);

    ra =
      Math.abs(
        SEPARATING_AXIS[12][0] * SEPARATING_AXIS[0][0] +
          SEPARATING_AXIS[12][1] * SEPARATING_AXIS[0][1] +
          SEPARATING_AXIS[12][2] * SEPARATING_AXIS[0][2],
      ) *
        ahsx +
      Math.abs(
        SEPARATING_AXIS[12][0] * SEPARATING_AXIS[1][0] +
          SEPARATING_AXIS[12][1] * SEPARATING_AXIS[1][1] +
          SEPARATING_AXIS[12][2] * SEPARATING_AXIS[1][2],
      ) *
        ahsy;

    rb =
      Math.abs(
        SEPARATING_AXIS[12][0] * SEPARATING_AXIS[4][0] +
          SEPARATING_AXIS[12][1] * SEPARATING_AXIS[4][1] +
          SEPARATING_AXIS[12][2] * SEPARATING_AXIS[4][2],
      ) *
        bhsy +
      Math.abs(
        SEPARATING_AXIS[12][0] * SEPARATING_AXIS[5][0] +
          SEPARATING_AXIS[12][1] * SEPARATING_AXIS[5][1] +
          SEPARATING_AXIS[12][2] * SEPARATING_AXIS[5][2],
      ) *
        bhsz;

    OVERLAPS[12] = len - ra - rb;
    INVALID[12] = 0;
  } else {
    // 两个基向量基本平行，invalid设为1
    // 就不能仅凭overlaps大于0判断两个图形相离了。得接着往下看
    OVERLAPS[12] = 0;
    INVALID[12] = 1;
    RIGHTS[12] = 0;
  }
  if (!INVALID[12] && OVERLAPS[12] > 0) {
    return;
  }

  // 计算第13个SEPARATING_AXIS，ra由0,1方向投影组成，rb由3,5方向投影组成

  // 叉乘的向量模长等于两个基向量组成的平行四边形面积
  // 如果向量模(即len)接近0，则两个基向量基本平行
  len =
    SEPARATING_AXIS[13][0] * SEPARATING_AXIS[13][0] +
    SEPARATING_AXIS[13][1] * SEPARATING_AXIS[13][1] +
    SEPARATING_AXIS[13][2] * SEPARATING_AXIS[13][2];

  if (len > EPSILON) {
    // normalized
    const d = 1 / Math.sqrt(len);
    SEPARATING_AXIS[13][0] *= d;
    SEPARATING_AXIS[13][1] *= d;
    SEPARATING_AXIS[13][2] *= d;

    len =
      SEPARATING_AXIS[13][0] * POS_DIFF[0] +
      SEPARATING_AXIS[13][1] * POS_DIFF[1] +
      SEPARATING_AXIS[13][2] * POS_DIFF[2];

    RIGHTS[13] = len > 0 ? 1 : 0;
    len = Math.abs(len);

    ra =
      Math.abs(
        SEPARATING_AXIS[13][0] * SEPARATING_AXIS[0][0] +
          SEPARATING_AXIS[13][1] * SEPARATING_AXIS[0][1] +
          SEPARATING_AXIS[13][2] * SEPARATING_AXIS[0][2],
      ) *
        ahsx +
      Math.abs(
        SEPARATING_AXIS[13][0] * SEPARATING_AXIS[1][0] +
          SEPARATING_AXIS[13][1] * SEPARATING_AXIS[1][1] +
          SEPARATING_AXIS[13][2] * SEPARATING_AXIS[1][2],
      ) *
        ahsy;

    rb =
      Math.abs(
        SEPARATING_AXIS[13][0] * SEPARATING_AXIS[3][0] +
          SEPARATING_AXIS[13][1] * SEPARATING_AXIS[3][1] +
          SEPARATING_AXIS[13][2] * SEPARATING_AXIS[3][2],
      ) *
        bhsx +
      Math.abs(
        SEPARATING_AXIS[13][0] * SEPARATING_AXIS[5][0] +
          SEPARATING_AXIS[13][1] * SEPARATING_AXIS[5][1] +
          SEPARATING_AXIS[13][2] * SEPARATING_AXIS[5][2],
      ) *
        bhsz;

    OVERLAPS[13] = len - ra - rb;
    INVALID[13] = 0;
  } else {
    // 两个基向量基本平行，invalid设为1
    // 就不能仅凭overlaps大于0判断两个图形相离了。得接着往下看
    OVERLAPS[13] = 0;
    INVALID[13] = 1;
    RIGHTS[13] = 0;
  }
  if (!INVALID[13] && OVERLAPS[13] > 0) {
    return;
  }

  // 计算第14个SEPARATING_AXIS，ra由0,1方向投影组成，rb由3,4方向投影组成

  // 叉乘的向量模长等于两个基向量组成的平行四边形面积
  // 如果向量模(即len)接近0，则两个基向量基本平行
  len =
    SEPARATING_AXIS[14][0] * SEPARATING_AXIS[14][0] +
    SEPARATING_AXIS[14][1] * SEPARATING_AXIS[14][1] +
    SEPARATING_AXIS[14][2] * SEPARATING_AXIS[14][2];

  if (len > EPSILON) {
    // normalized
    const d = 1 / Math.sqrt(len);
    SEPARATING_AXIS[14][0] *= d;
    SEPARATING_AXIS[14][1] *= d;
    SEPARATING_AXIS[14][2] *= d;

    len =
      SEPARATING_AXIS[14][0] * POS_DIFF[0] +
      SEPARATING_AXIS[14][1] * POS_DIFF[1] +
      SEPARATING_AXIS[14][2] * POS_DIFF[2];

    RIGHTS[14] = len > 0 ? 1 : 0;
    len = Math.abs(len);

    ra =
      Math.abs(
        SEPARATING_AXIS[14][0] * SEPARATING_AXIS[0][0] +
          SEPARATING_AXIS[14][1] * SEPARATING_AXIS[0][1] +
          SEPARATING_AXIS[14][2] * SEPARATING_AXIS[0][2],
      ) *
        ahsx +
      Math.abs(
        SEPARATING_AXIS[14][0] * SEPARATING_AXIS[1][0] +
          SEPARATING_AXIS[14][1] * SEPARATING_AXIS[1][1] +
          SEPARATING_AXIS[14][2] * SEPARATING_AXIS[1][2],
      ) *
        ahsy;

    rb =
      Math.abs(
        SEPARATING_AXIS[14][0] * SEPARATING_AXIS[3][0] +
          SEPARATING_AXIS[14][1] * SEPARATING_AXIS[3][1] +
          SEPARATING_AXIS[14][2] * SEPARATING_AXIS[3][2],
      ) *
        bhsx +
      Math.abs(
        SEPARATING_AXIS[14][0] * SEPARATING_AXIS[4][0] +
          SEPARATING_AXIS[14][1] * SEPARATING_AXIS[4][1] +
          SEPARATING_AXIS[14][2] * SEPARATING_AXIS[4][2],
      ) *
        bhsy;

    OVERLAPS[14] = len - ra - rb;
    INVALID[14] = 0;
  } else {
    // 两个基向量基本平行，invalid设为1
    // 就不能仅凭overlaps大于0判断两个图形相离了。得接着往下看
    OVERLAPS[14] = 0;
    INVALID[14] = 1;
    RIGHTS[14] = 0;
  }
  if (!INVALID[14] && OVERLAPS[14] > 0) {
    return;
  }

  // 找出重叠深度最浅的那个分离轴 为 minIndex
  const { depth, minIndex, right } = getMinDepth(
    OVERLAPS,
    RIGHTS,
    INVALID,
    isTerrain,
    faces,
  );
  if (minIndex < 0) {
    return;
  }
  manifold.separatingAxisIndex = minIndex;
  manifold.right = !!right;

  // 计算这个分离轴的法向量相关数据
  // swap为AB是否碰撞交换
  let swap = false;
  switch (minIndex) {
    case 0: // obbA.x * obbB
      N[0] = SEPARATING_AXIS[0][0];
      N[1] = SEPARATING_AXIS[0][1];
      N[2] = SEPARATING_AXIS[0][2];

      // right说明在前方碰到，否则在后方碰到
      if (right) {
        C[0] = ax + A_WR[0];
        C[1] = ay + A_WR[1];
        C[2] = az + A_WR[2];
      } else {
        C[0] = ax - A_WR[0];
        C[1] = ay - A_WR[1];
        C[2] = az - A_WR[2];

        N[0] = -N[0];
        N[1] = -N[1];
        N[2] = -N[2];
      }
      S1[0] = A_HR[0];
      S1[1] = A_HR[1];
      S1[2] = A_HR[2];

      S2[0] = A_DR[0];
      S2[1] = A_DR[1];
      S2[2] = A_DR[2];

      N1[0] = -SEPARATING_AXIS[1][0];
      N1[1] = -SEPARATING_AXIS[1][1];
      N1[2] = -SEPARATING_AXIS[1][2];

      N2[0] = -SEPARATING_AXIS[2][0];
      N2[1] = -SEPARATING_AXIS[2][1];
      N2[2] = -SEPARATING_AXIS[2][2];
      break;
    case 1: // obbA.y * obbB
      N[0] = SEPARATING_AXIS[1][0];
      N[1] = SEPARATING_AXIS[1][1];
      N[2] = SEPARATING_AXIS[1][2];
      // right说明在前方碰到，否则在后方碰到
      if (right) {
        C[0] = ax + A_HR[0];
        C[1] = ay + A_HR[1];
        C[2] = az + A_HR[2];
      } else {
        C[0] = ax - A_HR[0];
        C[1] = ay - A_HR[1];
        C[2] = az - A_HR[2];

        N[0] = -N[0];
        N[1] = -N[1];
        N[2] = -N[2];
      }
      S1[0] = A_WR[0];
      S1[1] = A_WR[1];
      S1[2] = A_WR[2];

      S2[0] = A_DR[0];
      S2[1] = A_DR[1];
      S2[2] = A_DR[2];

      N1[0] = -SEPARATING_AXIS[0][0];
      N1[1] = -SEPARATING_AXIS[0][1];
      N1[2] = -SEPARATING_AXIS[0][2];

      N2[0] = -SEPARATING_AXIS[2][0];
      N2[1] = -SEPARATING_AXIS[2][1];
      N2[2] = -SEPARATING_AXIS[2][2];
      break;
    case 2: // obbA.z * obbB
      N[0] = SEPARATING_AXIS[2][0];
      N[1] = SEPARATING_AXIS[2][1];
      N[2] = SEPARATING_AXIS[2][2];
      // right说明在前方碰到，否则在后方碰到
      if (right) {
        C[0] = ax + A_DR[0];
        C[1] = ay + A_DR[1];
        C[2] = az + A_DR[2];
      } else {
        C[0] = ax - A_DR[0];
        C[1] = ay - A_DR[1];
        C[2] = az - A_DR[2];

        N[0] = -N[0];
        N[1] = -N[1];
        N[2] = -N[2];
      }
      S1[0] = A_WR[0];
      S1[1] = A_WR[1];
      S1[2] = A_WR[2];

      S2[0] = A_HR[0];
      S2[1] = A_HR[1];
      S2[2] = A_HR[2];

      N1[0] = -SEPARATING_AXIS[0][0];
      N1[1] = -SEPARATING_AXIS[0][1];
      N1[2] = -SEPARATING_AXIS[0][2];

      N2[0] = -SEPARATING_AXIS[1][0];
      N2[1] = -SEPARATING_AXIS[1][1];
      N2[2] = -SEPARATING_AXIS[1][2];
      break;
    case 3: // obbB.x * obbA
      N[0] = SEPARATING_AXIS[3][0];
      N[1] = SEPARATING_AXIS[3][1];
      N[2] = SEPARATING_AXIS[3][2];
      // right说明在前方碰到，否则在后方碰到
      if (!right) {
        C[0] = bx + B_WR[0];
        C[1] = by + B_WR[1];
        C[2] = bz + B_WR[2];
      } else {
        C[0] = bx - B_WR[0];
        C[1] = by - B_WR[1];
        C[2] = bz - B_WR[2];

        N[0] = -N[0];
        N[1] = -N[1];
        N[2] = -N[2];
      }
      S1[0] = B_HR[0];
      S1[1] = B_HR[1];
      S1[2] = B_HR[2];

      S2[0] = B_DR[0];
      S2[1] = B_DR[1];
      S2[2] = B_DR[2];

      N1[0] = -SEPARATING_AXIS[4][0];
      N1[1] = -SEPARATING_AXIS[4][1];
      N1[2] = -SEPARATING_AXIS[4][2];

      N2[0] = -SEPARATING_AXIS[5][0];
      N2[1] = -SEPARATING_AXIS[5][1];
      N2[2] = -SEPARATING_AXIS[5][2];
      swap = true;
      break;
    case 4: // obbB.y * obbA
      N[0] = SEPARATING_AXIS[4][0];
      N[1] = SEPARATING_AXIS[4][1];
      N[2] = SEPARATING_AXIS[4][2];
      // right说明在前方碰到，否则在后方碰到
      if (!right) {
        C[0] = bx + B_HR[0];
        C[1] = by + B_HR[1];
        C[2] = bz + B_HR[2];
      } else {
        C[0] = bx - B_HR[0];
        C[1] = by - B_HR[1];
        C[2] = bz - B_HR[2];

        N[0] = -N[0];
        N[1] = -N[1];
        N[2] = -N[2];
      }
      S1[0] = B_WR[0];
      S1[1] = B_WR[1];
      S1[2] = B_WR[2];

      S2[0] = B_DR[0];
      S2[1] = B_DR[1];
      S2[2] = B_DR[2];

      N1[0] = -SEPARATING_AXIS[3][0];
      N1[1] = -SEPARATING_AXIS[3][1];
      N1[2] = -SEPARATING_AXIS[3][2];

      N2[0] = -SEPARATING_AXIS[5][0];
      N2[1] = -SEPARATING_AXIS[5][1];
      N2[2] = -SEPARATING_AXIS[5][2];
      swap = true;
      break;
    case 5: // obbB.z * obbA
      N[0] = SEPARATING_AXIS[5][0];
      N[1] = SEPARATING_AXIS[5][1];
      N[2] = SEPARATING_AXIS[5][2];
      // right说明在前方碰到，否则在后方碰到
      if (!right) {
        C[0] = bx + B_DR[0];
        C[1] = by + B_DR[1];
        C[2] = bz + B_DR[2];
      } else {
        C[0] = bx - B_DR[0];
        C[1] = by - B_DR[1];
        C[2] = bz - B_DR[2];

        N[0] = -N[0];
        N[1] = -N[1];
        N[2] = -N[2];
      }
      S1[0] = B_WR[0];
      S1[1] = B_WR[1];
      S1[2] = B_WR[2];

      S2[0] = B_HR[0];
      S2[1] = B_HR[1];
      S2[2] = B_HR[2];

      N1[0] = -SEPARATING_AXIS[3][0];
      N1[1] = -SEPARATING_AXIS[3][1];
      N1[2] = -SEPARATING_AXIS[3][2];

      N2[0] = -SEPARATING_AXIS[4][0];
      N2[1] = -SEPARATING_AXIS[4][1];
      N2[2] = -SEPARATING_AXIS[4][2];
      swap = true;
      break;
    case 6: // obbA.x * obbB.x
      N[0] = SEPARATING_AXIS[6][0];
      N[1] = SEPARATING_AXIS[6][1];
      N[2] = SEPARATING_AXIS[6][2];

      N1[0] = SEPARATING_AXIS[0][0];
      N1[1] = SEPARATING_AXIS[0][1];
      N1[2] = SEPARATING_AXIS[0][2];

      N2[0] = SEPARATING_AXIS[3][0];
      N2[1] = SEPARATING_AXIS[3][1];
      N2[2] = SEPARATING_AXIS[3][2];
      if (!right) {
        N[0] = -N[0];
        N[1] = -N[1];
        N[2] = -N[2];
      }
      break;
    case 7: // obbA.x * obbB.y
      N[0] = SEPARATING_AXIS[7][0];
      N[1] = SEPARATING_AXIS[7][1];
      N[2] = SEPARATING_AXIS[7][2];

      N1[0] = SEPARATING_AXIS[0][0];
      N1[1] = SEPARATING_AXIS[0][1];
      N1[2] = SEPARATING_AXIS[0][2];

      N2[0] = SEPARATING_AXIS[4][0];
      N2[1] = SEPARATING_AXIS[4][1];
      N2[2] = SEPARATING_AXIS[4][2];
      if (!right) {
        N[0] = -N[0];
        N[1] = -N[1];
        N[2] = -N[2];
      }
      break;
    case 8: // obbA.x * obbB.z
      N[0] = SEPARATING_AXIS[8][0];
      N[1] = SEPARATING_AXIS[8][1];
      N[2] = SEPARATING_AXIS[8][2];

      N1[0] = SEPARATING_AXIS[0][0];
      N1[1] = SEPARATING_AXIS[0][1];
      N1[2] = SEPARATING_AXIS[0][2];

      N2[0] = SEPARATING_AXIS[5][0];
      N2[1] = SEPARATING_AXIS[5][1];
      N2[2] = SEPARATING_AXIS[5][2];
      if (!right) {
        N[0] = -N[0];
        N[1] = -N[1];
        N[2] = -N[2];
      }
      break;
    case 9: // obbA.y * obbB.x
      N[0] = SEPARATING_AXIS[9][0];
      N[1] = SEPARATING_AXIS[9][1];
      N[2] = SEPARATING_AXIS[9][2];

      N1[0] = SEPARATING_AXIS[1][0];
      N1[1] = SEPARATING_AXIS[1][1];
      N1[2] = SEPARATING_AXIS[1][2];

      N2[0] = SEPARATING_AXIS[3][0];
      N2[1] = SEPARATING_AXIS[3][1];
      N2[2] = SEPARATING_AXIS[3][2];
      if (!right) {
        N[0] = -N[0];
        N[1] = -N[1];
        N[2] = -N[2];
      }
      break;
    case 10: // obbA.y * obbB.y
      N[0] = SEPARATING_AXIS[10][0];
      N[1] = SEPARATING_AXIS[10][1];
      N[2] = SEPARATING_AXIS[10][2];

      N1[0] = SEPARATING_AXIS[1][0];
      N1[1] = SEPARATING_AXIS[1][1];
      N1[2] = SEPARATING_AXIS[1][2];

      N2[0] = SEPARATING_AXIS[4][0];
      N2[1] = SEPARATING_AXIS[4][1];
      N2[2] = SEPARATING_AXIS[4][2];
      if (!right) {
        N[0] = -N[0];
        N[1] = -N[1];
        N[2] = -N[2];
      }
      break;
    case 11: // obbA.y * obbB.z
      N[0] = SEPARATING_AXIS[11][0];
      N[1] = SEPARATING_AXIS[11][1];
      N[2] = SEPARATING_AXIS[11][2];

      N1[0] = SEPARATING_AXIS[1][0];
      N1[1] = SEPARATING_AXIS[1][1];
      N1[2] = SEPARATING_AXIS[1][2];

      N2[0] = SEPARATING_AXIS[5][0];
      N2[1] = SEPARATING_AXIS[5][1];
      N2[2] = SEPARATING_AXIS[5][2];
      if (!right) {
        N[0] = -N[0];
        N[1] = -N[1];
        N[2] = -N[2];
      }
      break;
    case 12: // obbA.z * obbB.x
      N[0] = SEPARATING_AXIS[12][0];
      N[1] = SEPARATING_AXIS[12][1];
      N[2] = SEPARATING_AXIS[12][2];

      N1[0] = SEPARATING_AXIS[2][0];
      N1[1] = SEPARATING_AXIS[2][1];
      N1[2] = SEPARATING_AXIS[2][2];

      N2[0] = SEPARATING_AXIS[3][0];
      N2[1] = SEPARATING_AXIS[3][1];
      N2[2] = SEPARATING_AXIS[3][2];
      if (!right) {
        N[0] = -N[0];
        N[1] = -N[1];
        N[2] = -N[2];
      }
      break;
    case 13: // obbA.z * obbB.y
      N[0] = SEPARATING_AXIS[13][0];
      N[1] = SEPARATING_AXIS[13][1];
      N[2] = SEPARATING_AXIS[13][2];

      N1[0] = SEPARATING_AXIS[2][0];
      N1[1] = SEPARATING_AXIS[2][1];
      N1[2] = SEPARATING_AXIS[2][2];

      N2[0] = SEPARATING_AXIS[4][0];
      N2[1] = SEPARATING_AXIS[4][1];
      N2[2] = SEPARATING_AXIS[4][2];
      if (!right) {
        N[0] = -N[0];
        N[1] = -N[1];
        N[2] = -N[2];
      }
      break;
    case 14: // obbA.z * obbB.z
      N[0] = SEPARATING_AXIS[14][0];
      N[1] = SEPARATING_AXIS[14][1];
      N[2] = SEPARATING_AXIS[14][2];

      N1[0] = SEPARATING_AXIS[2][0];
      N1[1] = SEPARATING_AXIS[2][1];
      N1[2] = SEPARATING_AXIS[2][2];

      N2[0] = SEPARATING_AXIS[5][0];
      N2[1] = SEPARATING_AXIS[5][1];
      N2[2] = SEPARATING_AXIS[5][2];
      if (!right) {
        N[0] = -N[0];
        N[1] = -N[1];
        N[2] = -N[2];
      }
      break;
  }

  // minIndex大于5的意思是，是叉乘的那个分离轴重叠了
  // 这样就是边和边碰撞，碰撞点只有一个, 否则碰撞点有1-4个
  // 在这里直接计算那个碰撞点然后return
  // case of a side collision
  // · Find points of two sides on which you made ​​the separation axis
  // · Calculates the point of closest approach of a straight line consisting of separate axis points obtained, and the collision point
  if (minIndex > 5) {
    calcSideCollide(manifold, N, N1, N2, depth);
    return;
  }

  // 接下来就是面的碰撞，寻找潜在碰撞点
  // 下面是原版注释，感觉都没写完【。读不太懂
  // Surface - the case of the plane crash
  // Box A, box B and the other a box of better made ​​a separate axis
  // • The surface A and the plane that made the separation axis of the box A, and B to the surface the face of the box B close in the opposite direction to the most isolated axis

  // When viewed from the front surface A, and the cut part exceeding the area of the surface A is a surface B
  //-Plane B becomes the 3-8 triangle, I a candidate for the collision point the vertex of surface B
  // • If more than one candidate 5 exists, scraping up to four

  // For potential collision points of all, to examine the distance between the surface A
  // • If you were on the inside surface of A, and the collision point

  // target quad
  let targetV: ArrayType;

  // search support face and vertex
  let tmpMinDot = 1; // 两个单位向量的dot值最大为1，用于比较的中间值，无用

  let dotValue = 0; // 纯中间值

  /**
   * 0 - x正面
   * 1 - x反面
   * 2 - y正面
   * 3 - y反面
   * 4 - z正面
   * 5 - z反面
   */
  let minDotId = 0;

  // 如果碰撞交换，说明是以B的平面为碰撞面，那就算A的三个面和碰撞轴的dot值
  // 否则算B的
  if (swap) {
    dotValue =
      SEPARATING_AXIS[0][0] * N[0] +
      SEPARATING_AXIS[0][1] * N[1] +
      SEPARATING_AXIS[0][2] * N[2];

    // dot为正说明在正面，否则在反面
    // 不管在哪一面，dot取绝对值
    if (dotValue < tmpMinDot) {
      tmpMinDot = dotValue;
      minDotId = 0;
    }
    if (-dotValue < tmpMinDot) {
      tmpMinDot = -dotValue;
      minDotId = 1;
    }

    dotValue =
      SEPARATING_AXIS[1][0] * N[0] +
      SEPARATING_AXIS[1][1] * N[1] +
      SEPARATING_AXIS[1][2] * N[2];

    // dot为正说明在正面，否则在反面
    // 不管在哪一面，dot取绝对值
    if (dotValue < tmpMinDot) {
      tmpMinDot = dotValue;
      minDotId = 2;
    }
    if (-dotValue < tmpMinDot) {
      tmpMinDot = -dotValue;
      minDotId = 3;
    }

    dotValue =
      SEPARATING_AXIS[2][0] * N[0] +
      SEPARATING_AXIS[2][1] * N[1] +
      SEPARATING_AXIS[2][2] * N[2];

    // dot为正说明在正面，否则在反面
    // 不管在哪一面，dot取绝对值
    if (dotValue < tmpMinDot) {
      tmpMinDot = dotValue;
      minDotId = 4;
    }
    if (-dotValue < tmpMinDot) {
      tmpMinDot = -dotValue;
      minDotId = 5;
    }

    targetV = A_VERTICES;
  } else {
    dotValue =
      SEPARATING_AXIS[3][0] * N[0] +
      SEPARATING_AXIS[3][1] * N[1] +
      SEPARATING_AXIS[3][2] * N[2];

    // dot为正说明在正面，否则在反面
    // 不管在哪一面，dot取绝对值
    if (dotValue < tmpMinDot) {
      tmpMinDot = dotValue;
      minDotId = 0;
    }
    if (-dotValue < tmpMinDot) {
      tmpMinDot = -dotValue;
      minDotId = 1;
    }
    dotValue =
      SEPARATING_AXIS[4][0] * N[0] +
      SEPARATING_AXIS[4][1] * N[1] +
      SEPARATING_AXIS[4][2] * N[2];

    // dot为正说明在正面，否则在反面
    // 不管在哪一面，dot取绝对值
    if (dotValue < tmpMinDot) {
      tmpMinDot = dotValue;
      minDotId = 2;
    }
    if (-dotValue < tmpMinDot) {
      tmpMinDot = -dotValue;
      minDotId = 3;
    }
    dotValue =
      SEPARATING_AXIS[5][0] * N[0] +
      SEPARATING_AXIS[5][1] * N[1] +
      SEPARATING_AXIS[5][2] * N[2];

    // dot为正说明在正面，否则在反面
    // 不管在哪一面，dot取绝对值
    if (dotValue < tmpMinDot) {
      tmpMinDot = dotValue;
      minDotId = 4;
    }
    if (-dotValue < tmpMinDot) {
      tmpMinDot = -dotValue;
      minDotId = 5;
    }

    targetV = B_VERTICES;
  }

  // 取碰撞面的四个顶点
  switch (minDotId) {
    case 0:
      QUAD.set([
        targetV[0],
        targetV[1],
        targetV[2],
        targetV[6],
        targetV[7],
        targetV[8],
        targetV[9],
        targetV[10],
        targetV[11],
        targetV[3],
        targetV[4],
        targetV[5],
      ]);
      break; // x+ face  vertex 1 3 4 2
    case 1:
      QUAD.set([
        targetV[15],
        targetV[16],
        targetV[17],
        targetV[21],
        targetV[22],
        targetV[23],
        targetV[18],
        targetV[19],
        targetV[20],
        targetV[12],
        targetV[13],
        targetV[14],
      ]);
      break; // x- face vertex 6 8 7 5
    case 2:
      QUAD.set([
        targetV[12],
        targetV[13],
        targetV[14],
        targetV[0],
        targetV[1],
        targetV[2],
        targetV[3],
        targetV[4],
        targetV[5],
        targetV[15],
        targetV[16],
        targetV[17],
      ]);
      break; // y+ face vertex 5 1 2 6
    case 3:
      QUAD.set([
        targetV[21],
        targetV[22],
        targetV[23],
        targetV[9],
        targetV[10],
        targetV[11],
        targetV[6],
        targetV[7],
        targetV[8],
        targetV[18],
        targetV[19],
        targetV[20],
      ]);
      break; // y- face vertex 8 4 3 7
    case 4:
      QUAD.set([
        targetV[12],
        targetV[13],
        targetV[14],
        targetV[18],
        targetV[19],
        targetV[20],
        targetV[6],
        targetV[7],
        targetV[8],
        targetV[0],
        targetV[1],
        targetV[2],
      ]);
      break; // z+ face vertex 5 7 3 1
    case 5:
      QUAD.set([
        targetV[3],
        targetV[4],
        targetV[5],
        targetV[9],
        targetV[10],
        targetV[11],
        targetV[21],
        targetV[22],
        targetV[23],
        targetV[15],
        targetV[16],
        targetV[17],
      ]);
      break; // z- face vertex 2 4 8 6
  }

  // clip vertices
  // 计算CLIP_VERTICES，得到的碰撞点数量
  let numClipVertices: number;

  // 下面都是计算过程用值
  let numAddedClipVertices: number;
  let index: number;
  let x1: number;
  let y1: number;
  let z1: number;
  let x2: number;
  let y2: number;
  let z2: number;
  let dot1: number;
  let dot2: number;

  // 分别从n1,n2,-n1,-n2四个方向算四遍得出最后的碰撞面的碰撞点
  CLIP_VERTICES.set(QUAD);
  numAddedClipVertices = 0;
  // 首尾互相连的四个顶点，按线段计算，转圈圈算
  // 初始点为最后一个点
  index = (4 - 1) * 3;
  x1 = CLIP_VERTICES[index];
  y1 = CLIP_VERTICES[index + 1];
  z1 = CLIP_VERTICES[index + 2];
  dot1 =
    (x1 - C[0] - S1[0]) * N1[0] +
    (y1 - C[1] - S1[1]) * N1[1] +
    (z1 - C[2] - S1[2]) * N1[2];

  for (let i = 0; i < 4; i++) {
    index = i * 3;
    x2 = CLIP_VERTICES[index];
    y2 = CLIP_VERTICES[index + 1];
    z2 = CLIP_VERTICES[index + 2];
    dot2 =
      (x2 - C[0] - S1[0]) * N1[0] +
      (y2 - C[1] - S1[1]) * N1[1] +
      (z2 - C[2] - S1[2]) * N1[2];
    if (dot1 > 0) {
      if (dot2 > 0) {
        index = numAddedClipVertices * 3;
        numAddedClipVertices++;
        TMP_CLIP_VERTICES[index] = x2;
        TMP_CLIP_VERTICES[index + 1] = y2;
        TMP_CLIP_VERTICES[index + 2] = z2;
      } else {
        index = numAddedClipVertices * 3;
        numAddedClipVertices++;
        dotValue = dot1 / (dot1 - dot2);
        TMP_CLIP_VERTICES[index] = x1 + (x2 - x1) * dotValue;
        TMP_CLIP_VERTICES[index + 1] = y1 + (y2 - y1) * dotValue;
        TMP_CLIP_VERTICES[index + 2] = z1 + (z2 - z1) * dotValue;
      }
    } else {
      if (dot2 > 0) {
        index = numAddedClipVertices * 3;
        numAddedClipVertices++;
        dotValue = dot1 / (dot1 - dot2);
        TMP_CLIP_VERTICES[index] = x1 + (x2 - x1) * dotValue;
        TMP_CLIP_VERTICES[index + 1] = y1 + (y2 - y1) * dotValue;
        TMP_CLIP_VERTICES[index + 2] = z1 + (z2 - z1) * dotValue;
        index = numAddedClipVertices * 3;
        numAddedClipVertices++;
        TMP_CLIP_VERTICES[index] = x2;
        TMP_CLIP_VERTICES[index + 1] = y2;
        TMP_CLIP_VERTICES[index + 2] = z2;
      }
    }
    x1 = x2;
    y1 = y2;
    z1 = z2;
    dot1 = dot2;
  }

  numClipVertices = numAddedClipVertices;
  if (numClipVertices === 0) {
    return;
  }
  numAddedClipVertices = 0;
  // 首尾互相连的四个顶点，按线段计算，转圈圈算
  // 初始点为最后一个点
  index = (numClipVertices - 1) * 3;
  x1 = TMP_CLIP_VERTICES[index];
  y1 = TMP_CLIP_VERTICES[index + 1];
  z1 = TMP_CLIP_VERTICES[index + 2];
  dot1 =
    (x1 - C[0] - S2[0]) * N2[0] +
    (y1 - C[1] - S2[1]) * N2[1] +
    (z1 - C[2] - S2[2]) * N2[2];

  for (let i = 0; i < numClipVertices; i++) {
    index = i * 3;
    x2 = TMP_CLIP_VERTICES[index];
    y2 = TMP_CLIP_VERTICES[index + 1];
    z2 = TMP_CLIP_VERTICES[index + 2];
    dot2 =
      (x2 - C[0] - S2[0]) * N2[0] +
      (y2 - C[1] - S2[1]) * N2[1] +
      (z2 - C[2] - S2[2]) * N2[2];
    if (dot1 > 0) {
      if (dot2 > 0) {
        index = numAddedClipVertices * 3;
        numAddedClipVertices++;
        CLIP_VERTICES[index] = x2;
        CLIP_VERTICES[index + 1] = y2;
        CLIP_VERTICES[index + 2] = z2;
      } else {
        index = numAddedClipVertices * 3;
        numAddedClipVertices++;
        dotValue = dot1 / (dot1 - dot2);
        CLIP_VERTICES[index] = x1 + (x2 - x1) * dotValue;
        CLIP_VERTICES[index + 1] = y1 + (y2 - y1) * dotValue;
        CLIP_VERTICES[index + 2] = z1 + (z2 - z1) * dotValue;
      }
    } else {
      if (dot2 > 0) {
        index = numAddedClipVertices * 3;
        numAddedClipVertices++;
        dotValue = dot1 / (dot1 - dot2);
        CLIP_VERTICES[index] = x1 + (x2 - x1) * dotValue;
        CLIP_VERTICES[index + 1] = y1 + (y2 - y1) * dotValue;
        CLIP_VERTICES[index + 2] = z1 + (z2 - z1) * dotValue;
        index = numAddedClipVertices * 3;
        numAddedClipVertices++;
        CLIP_VERTICES[index] = x2;
        CLIP_VERTICES[index + 1] = y2;
        CLIP_VERTICES[index + 2] = z2;
      }
    }
    x1 = x2;
    y1 = y2;
    z1 = z2;
    dot1 = dot2;
  }

  numClipVertices = numAddedClipVertices;
  if (numClipVertices === 0) {
    return;
  }
  numAddedClipVertices = 0;
  // 首尾互相连的四个顶点，按线段计算，转圈圈算
  // 初始点为最后一个点
  index = (numClipVertices - 1) * 3;
  x1 = CLIP_VERTICES[index];
  y1 = CLIP_VERTICES[index + 1];
  z1 = CLIP_VERTICES[index + 2];
  dot1 =
    (x1 - C[0] + S1[0]) * -N1[0] +
    (y1 - C[1] + S1[1]) * -N1[1] +
    (z1 - C[2] + S1[2]) * -N1[2];

  for (let i = 0; i < numClipVertices; i++) {
    index = i * 3;
    x2 = CLIP_VERTICES[index];
    y2 = CLIP_VERTICES[index + 1];
    z2 = CLIP_VERTICES[index + 2];
    dot2 =
      (x2 - C[0] + S1[0]) * -N1[0] +
      (y2 - C[1] + S1[1]) * -N1[1] +
      (z2 - C[2] + S1[2]) * -N1[2];
    if (dot1 > 0) {
      if (dot2 > 0) {
        index = numAddedClipVertices * 3;
        numAddedClipVertices++;
        TMP_CLIP_VERTICES[index] = x2;
        TMP_CLIP_VERTICES[index + 1] = y2;
        TMP_CLIP_VERTICES[index + 2] = z2;
      } else {
        index = numAddedClipVertices * 3;
        numAddedClipVertices++;
        dotValue = dot1 / (dot1 - dot2);
        TMP_CLIP_VERTICES[index] = x1 + (x2 - x1) * dotValue;
        TMP_CLIP_VERTICES[index + 1] = y1 + (y2 - y1) * dotValue;
        TMP_CLIP_VERTICES[index + 2] = z1 + (z2 - z1) * dotValue;
      }
    } else {
      if (dot2 > 0) {
        index = numAddedClipVertices * 3;
        numAddedClipVertices++;
        dotValue = dot1 / (dot1 - dot2);
        TMP_CLIP_VERTICES[index] = x1 + (x2 - x1) * dotValue;
        TMP_CLIP_VERTICES[index + 1] = y1 + (y2 - y1) * dotValue;
        TMP_CLIP_VERTICES[index + 2] = z1 + (z2 - z1) * dotValue;
        index = numAddedClipVertices * 3;
        numAddedClipVertices++;
        TMP_CLIP_VERTICES[index] = x2;
        TMP_CLIP_VERTICES[index + 1] = y2;
        TMP_CLIP_VERTICES[index + 2] = z2;
      }
    }
    x1 = x2;
    y1 = y2;
    z1 = z2;
    dot1 = dot2;
  }

  numClipVertices = numAddedClipVertices;
  if (numClipVertices === 0) {
    return;
  }
  numAddedClipVertices = 0;
  // 首尾互相连的四个顶点，按线段计算，转圈圈算
  // 初始点为最后一个点
  index = (numClipVertices - 1) * 3;
  x1 = TMP_CLIP_VERTICES[index];
  y1 = TMP_CLIP_VERTICES[index + 1];
  z1 = TMP_CLIP_VERTICES[index + 2];
  dot1 =
    (x1 - C[0] + S2[0]) * -N2[0] +
    (y1 - C[1] + S2[1]) * -N2[1] +
    (z1 - C[2] + S2[2]) * -N2[2];

  for (let i = 0; i < numClipVertices; i++) {
    index = i * 3;
    x2 = TMP_CLIP_VERTICES[index];
    y2 = TMP_CLIP_VERTICES[index + 1];
    z2 = TMP_CLIP_VERTICES[index + 2];
    dot2 =
      (x2 - C[0] + S2[0]) * -N2[0] +
      (y2 - C[1] + S2[1]) * -N2[1] +
      (z2 - C[2] + S2[2]) * -N2[2];
    if (dot1 > 0) {
      if (dot2 > 0) {
        index = numAddedClipVertices * 3;
        numAddedClipVertices++;
        CLIP_VERTICES[index] = x2;
        CLIP_VERTICES[index + 1] = y2;
        CLIP_VERTICES[index + 2] = z2;
      } else {
        index = numAddedClipVertices * 3;
        numAddedClipVertices++;
        dotValue = dot1 / (dot1 - dot2);
        CLIP_VERTICES[index] = x1 + (x2 - x1) * dotValue;
        CLIP_VERTICES[index + 1] = y1 + (y2 - y1) * dotValue;
        CLIP_VERTICES[index + 2] = z1 + (z2 - z1) * dotValue;
      }
    } else {
      if (dot2 > 0) {
        index = numAddedClipVertices * 3;
        numAddedClipVertices++;
        dotValue = dot1 / (dot1 - dot2);
        CLIP_VERTICES[index] = x1 + (x2 - x1) * dotValue;
        CLIP_VERTICES[index + 1] = y1 + (y2 - y1) * dotValue;
        CLIP_VERTICES[index + 2] = z1 + (z2 - z1) * dotValue;
        index = numAddedClipVertices * 3;
        numAddedClipVertices++;
        CLIP_VERTICES[index] = x2;
        CLIP_VERTICES[index + 1] = y2;
        CLIP_VERTICES[index + 2] = z2;
      }
    }
    x1 = x2;
    y1 = y2;
    z1 = z2;
    dot1 = dot2;
  }

  numClipVertices = numAddedClipVertices;
  if (!numClipVertices) {
    return;
  }

  // 如果碰撞点数量大于4个，需要进一步缩减为4个
  if (numClipVertices > 4) {
    // 大于四个点的处理，把四个顶点取均值
    x1 = (QUAD[0] + QUAD[3] + QUAD[6] + QUAD[9]) * 0.25;
    y1 = (QUAD[1] + QUAD[4] + QUAD[7] + QUAD[10]) * 0.25;
    z1 = (QUAD[2] + QUAD[5] + QUAD[8] + QUAD[11]) * 0.25;
    N1[0] = QUAD[0] - x1;
    N1[1] = QUAD[1] - y1;
    N1[2] = QUAD[2] - z1;
    N2[0] = QUAD[3] - x1;
    N2[1] = QUAD[4] - y1;
    N2[2] = QUAD[5] - z1;

    // 最后就取这四个点做碰撞点啦
    let index1 = 0; // n1方向最小dot index
    let index2 = 0; // n2方向最小dot index
    let index3 = 0; // n1方向最大dot index
    let index4 = 0; // n2方向最大dot index
    let maxDot = -Infinity;
    let minDot = Infinity;

    for (let i = 0; i < numClipVertices; i++) {
      USED[i] = false;
      index = i * 3;
      x1 = CLIP_VERTICES[index];
      y1 = CLIP_VERTICES[index + 1];
      z1 = CLIP_VERTICES[index + 2];
      dotValue = x1 * N1[0] + y1 * N1[1] + z1 * N1[2];
      if (dotValue < minDot) {
        minDot = dotValue;
        index1 = i;
      }
      if (dotValue > maxDot) {
        maxDot = dotValue;
        index3 = i;
      }
    }

    USED[index1] = true;
    USED[index3] = true;
    maxDot = -Infinity;
    minDot = Infinity;

    for (let i = 0; i < numClipVertices; i++) {
      if (USED[i]) {
        continue;
      }
      index = i * 3;
      x1 = CLIP_VERTICES[index];
      y1 = CLIP_VERTICES[index + 1];
      z1 = CLIP_VERTICES[index + 2];
      dotValue = x1 * N2[0] + y1 * N2[1] + z1 * N2[2];
      if (dotValue < minDot) {
        minDot = dotValue;
        index2 = i;
      }
      if (dotValue > maxDot) {
        maxDot = dotValue;
        index4 = i;
      }
    }

    index = index1 * 3;
    x1 = CLIP_VERTICES[index];
    y1 = CLIP_VERTICES[index + 1];
    z1 = CLIP_VERTICES[index + 2];
    dotValue = (x1 - C[0]) * N[0] + (y1 - C[1]) * N[1] + (z1 - C[2]) * N[2];
    if (dotValue < 0) {
      manifold.addPoint(x1, y1, z1, dotValue);
    }

    index = index2 * 3;
    x1 = CLIP_VERTICES[index];
    y1 = CLIP_VERTICES[index + 1];
    z1 = CLIP_VERTICES[index + 2];
    dotValue = (x1 - C[0]) * N[0] + (y1 - C[1]) * N[1] + (z1 - C[2]) * N[2];
    if (dotValue < 0) {
      manifold.addPoint(x1, y1, z1, dotValue);
    }

    index = index3 * 3;
    x1 = CLIP_VERTICES[index];
    y1 = CLIP_VERTICES[index + 1];
    z1 = CLIP_VERTICES[index + 2];
    dotValue = (x1 - C[0]) * N[0] + (y1 - C[1]) * N[1] + (z1 - C[2]) * N[2];
    if (dotValue < 0) {
      manifold.addPoint(x1, y1, z1, dotValue);
    }

    index = index4 * 3;
    x1 = CLIP_VERTICES[index];
    y1 = CLIP_VERTICES[index + 1];
    z1 = CLIP_VERTICES[index + 2];
    dotValue = (x1 - C[0]) * N[0] + (y1 - C[1]) * N[1] + (z1 - C[2]) * N[2];
    if (dotValue < 0) {
      manifold.addPoint(x1, y1, z1, dotValue);
    }
  } else {
    for (let i = 0; i < numClipVertices; i++) {
      index = i * 3;
      x1 = CLIP_VERTICES[index];
      y1 = CLIP_VERTICES[index + 1];
      z1 = CLIP_VERTICES[index + 2];
      dotValue = (x1 - C[0]) * N[0] + (y1 - C[1]) * N[1] + (z1 - C[2]) * N[2];
      if (dotValue < 0) {
        manifold.addPoint(x1, y1, z1, dotValue);
      }
    }
  }
  if (swap) {
    manifold.nx = -N[0];
    manifold.ny = -N[1];
    manifold.nz = -N[2];
  } else {
    manifold.nx = N[0];
    manifold.ny = N[1];
    manifold.nz = N[2];
  }
}

function getMinDepth(
  overlaps: ArrayType,
  rights: Uint8Array,
  invalid: Uint8Array,
  isTerrain: boolean,
  faces: number,
) {
  if (isTerrain) {
    /**
     * overlaps都是负数
     * 这里得出最大值，也就是最浅的深度
     */
    let depth = -Infinity;
    /**
     * 最浅投影深度的索引值
     */
    let minIndex = -1;
    /**
     * 最浅投影深度的左右值
     */
    let right = 0;

    // 地形碰撞直接取地形三个面做检测
    for (let i = 3; i < 6; i++) {
      // 检查faces值，只取地形暴露出来的一面
      if (
        overlaps[i] > depth &&
        faces & (1 << ((i - 3) * 2 + (rights[i] ? 0 : 1)))
      ) {
        depth = overlaps[i];
        minIndex = i;
        right = rights[i];
      }
    }
    return {
      depth,
      minIndex,
      right,
    };
  }
  /**
   * overlaps都是负数
   * 这里得出最大值，也就是最浅的深度
   */
  let depth = overlaps[0];
  /**
   * 用于比较大小的中间值，无实际意义
   */
  let depth2 = overlaps[0];
  /**
   * 最浅投影深度的索引值
   */
  let minIndex = 0;
  /**
   * 最浅投影深度的左右值
   */
  let right = rights[0];

  for (let i = 0; i < 6; i++) {
    if (overlaps[i] > depth2) {
      depth = overlaps[i];
      depth2 = overlaps[i];
      minIndex = i;
      right = rights[i];
    }
  }

  // 下面的0.01是什么啊救命，看起来像是专门用于做叉乘计算误差的，其实应该也可以没有
  // depth2仅仅用于比较大小
  for (let i = 6; i < 15; i++) {
    if (overlaps[i] - 0.01 > depth2 && !invalid[i]) {
      depth = overlaps[i];
      depth2 = overlaps[i] - 0.01;
      minIndex = i;
      right = rights[i];
    }
  }

  return {
    depth,
    minIndex,
    right,
  };
}

const TMP = ALLOC(3);
const TMP_A = ALLOC(3);
const TMP_B = ALLOC(3);
function calcSideCollide(
  manifold: ContactManifold,
  n: ArrayType,
  n1: ArrayType,
  n2: ArrayType,
  depth: number,
) {
  // 算八个顶点在碰撞法向量上的投影，取最大值，以及最大值对应的顶点
  // 先取第一个顶点作为初始化数据，然后循环大比拼
  TMP_A[0] = A_VERTICES[0];
  TMP_A[1] = A_VERTICES[1];
  TMP_A[2] = A_VERTICES[2];

  let maxDA = n[0] * TMP_A[0] + n[1] * TMP_A[1] + n[2] * TMP_A[2];

  TMP_B[0] = B_VERTICES[0];
  TMP_B[1] = B_VERTICES[1];
  TMP_B[2] = B_VERTICES[2];
  let maxDB = n[0] * TMP_B[0] + n[1] * TMP_B[1] + n[2] * TMP_B[2];

  let distance: number;
  for (let i = 1; i < 8; i++) {
    let k = i * 3;

    TMP[0] = A_VERTICES[k];
    TMP[1] = A_VERTICES[k + 1];
    TMP[2] = A_VERTICES[k + 2];
    distance = n[0] * TMP[0] + n[1] * TMP[1] + n[2] * TMP[2];

    if (distance > maxDA) {
      maxDA = distance;
      TMP_A[0] = TMP[0];
      TMP_A[1] = TMP[1];
      TMP_A[2] = TMP[2];
    }

    TMP[0] = B_VERTICES[k];
    TMP[1] = B_VERTICES[k + 1];
    TMP[2] = B_VERTICES[k + 2];
    distance = n[0] * TMP[0] + n[1] * TMP[1] + n[2] * TMP[2];

    if (distance > maxDB) {
      maxDB = distance;
      TMP_B[0] = TMP[0];
      TMP_B[1] = TMP[1];
      TMP_B[2] = TMP[2];
    }
  }

  // 这个t是什么意思怎么算的没有资料看不懂【。
  // 大概是 两个顶点A - B向量 与 n1 - N2对称方向的向量 的点乘值
  TMP[0] = TMP_B[0] - TMP_A[0];
  TMP[1] = TMP_B[1] - TMP_A[1];
  TMP[2] = TMP_B[2] - TMP_A[2];
  const dotN = n1[0] * n2[0] + n1[1] * n2[1] + n1[2] * n2[2];
  const t =
    (TMP[0] * (n1[0] - n2[0] * dotN) +
      TMP[1] * (n1[1] - n2[1] * dotN) +
      TMP[2] * (n1[2] - n2[2] * dotN)) /
    (1 - dotN * dotN);

  // 接触面加点
  manifold.nx = n[0];
  manifold.ny = n[1];
  manifold.nz = n[2];

  manifold.addPoint(
    TMP_A[0] + n1[0] * t + n[0] * depth * 0.5,
    TMP_A[1] + n1[1] * t + n[1] * depth * 0.5,
    TMP_A[2] + n1[2] * t + n[2] * depth * 0.5,
    depth,
  );
}
