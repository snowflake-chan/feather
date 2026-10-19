const MAX_ENTRIES = 16;
const MAX_RBUSH_NODE = 2000;

export class BodyCollisionBox {
  public minX = 0.1;
  public minY = 0.1;
  public minZ = 0.1;
  public maxX = 0.1;
  public maxY = 0.1;
  public maxZ = 0.1;
  public id = 0;
}

/**
 * 大佬的博客 https://0fps.net/2015/01/23/collision-detection-part-3-benchmarks/
 * 其中提到的 rBush https://github.com/mourner/rbush
 * 本文件就是实现rBush这个东西
 * 优化全靠这东西，粗略的碰撞过滤在这里做
 * 这里的碰撞都是aabb计算，初筛纯为了快
 */
export class BodyRBushNode {
  public children: BodyRBushNode[] = [];
  public boxes: BodyCollisionBox[] = [];
  public minX = 0.1;
  public minY = 0.1;
  public minZ = 0.1;
  public maxX = 0.1;
  public maxY = 0.1;
  public maxZ = 0.1;
  /**
   * 体积
   * 长 * 宽 * 高
   */
  public volume = 0.1;
}

const NODE_POOL: BodyRBushNode[] = [];
let NODE_POOL_PTR = 0;
{
  for (let i = 0; i < MAX_RBUSH_NODE; ++i) {
    NODE_POOL.push(new BodyRBushNode());
  }
}

function allocNode() {
  return NODE_POOL[NODE_POOL_PTR++];
}

export function clearNodePool() {
  NODE_POOL_PTR = 0;
}

function createLeafNode(items: BodyCollisionBox[], start: number, end: number) {
  const node = allocNode();
  node.children.length = 0;
  const boxes = node.boxes;
  let lox = Infinity;
  let loy = Infinity;
  let loz = Infinity;
  let hix = -Infinity;
  let hiy = -Infinity;
  let hiz = -Infinity;

  const N = (boxes.length = end - start);
  for (let i = 0; i < N; ++i) {
    const b = (boxes[i] = items[start + i]);
    lox = Math.min(lox, b.minX);
    loy = Math.min(loy, b.minY);
    loz = Math.min(loz, b.minZ);
    hix = Math.max(hix, b.maxX);
    hiy = Math.max(hiy, b.maxY);
    hiz = Math.max(hiz, b.maxZ);
  }

  node.minX = lox;
  node.minY = loy;
  node.minZ = loz;
  node.maxX = hix;
  node.maxY = hiy;
  node.maxZ = hiz;
  node.volume = (hix - lox) * (hiy - loy) * (hiz - loz);

  return node;
}

function swap(arr: BodyCollisionBox[], i: number, j: number) {
  const tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}

function quickselectStep(
  arr: BodyCollisionBox[],
  k: number,
  left: number,
  right: number,
  compare: (a: BodyCollisionBox, b: BodyCollisionBox) => number,
) {
  while (right > left) {
    if (right - left > 600) {
      const n = right - left + 1;
      const m = k - left + 1;
      const z = Math.log(n);
      const s = 0.5 * Math.exp((2 * z) / 3);
      const sd =
        0.5 * Math.sqrt((z * s * (n - s)) / n) * (m - n / 2 < 0 ? -1 : 1);
      const newLeft = Math.max(left, Math.floor(k - (m * s) / n + sd));
      const newRight = Math.min(right, Math.floor(k + ((n - m) * s) / n + sd));
      quickselectStep(arr, k, newLeft, newRight, compare);
    }

    const t = arr[k];
    let i = left;
    let j = right;

    swap(arr, left, k);
    if (compare(arr[right], t) > 0) {
      swap(arr, left, right);
    }

    while (i < j) {
      swap(arr, i, j);
      i++;
      j--;
      while (compare(arr[i], t) < 0) {
        i++;
      }
      while (compare(arr[j], t) > 0) {
        j--;
      }
    }

    if (compare(arr[left], t) === 0) {
      swap(arr, left, j);
    } else {
      j++;
      swap(arr, j, right);
    }

    if (j <= k) {
      left = j + 1;
    }
    if (k <= j) {
      right = j - 1;
    }
  }
}

const STACK: number[] = [];
function multiSelect(
  arr: BodyCollisionBox[],
  left: number,
  right: number,
  n: number,
  compare: (a: BodyCollisionBox, b: BodyCollisionBox) => number,
) {
  STACK.length = 0;
  STACK.push(left, right);
  const s = 0.5 / n;
  while (STACK.length) {
    const a = STACK.pop()!;
    const b = STACK.pop()!;
    // 错误纠正？交换位置？一般情况下，左不可能大于右
    // 后面创建node的时候计算长度会用(右-左)
    if (b - a <= n) {
      continue;
    }
    const mid = a + Math.ceil(s * (b - a)) * n;
    quickselectStep(arr, mid, a, b, compare);
    STACK.push(a, mid, mid, b);
  }
}

function compareMinX(a: BodyCollisionBox, b: BodyCollisionBox) {
  return a.minX - b.minX;
}
function compareMinY(a: BodyCollisionBox, b: BodyCollisionBox) {
  return a.minY - b.minY;
}
function compareMinZ(a: BodyCollisionBox, b: BodyCollisionBox) {
  return a.minZ - b.minZ;
}

const M_2_3 = Math.ceil(Math.pow(MAX_ENTRIES, 2 / 3));
const M_1_3 = Math.ceil(Math.pow(MAX_ENTRIES, 1 / 3));

export function createBodyRBush(
  items: BodyCollisionBox[],
  left: number,
  right: number,
  _height: number,
) {
  const N = right - left + 1;
  if (N <= MAX_ENTRIES) {
    // reached leaf level; return leaf
    return createLeafNode(items, left, right + 1);
  }

  let height: number;
  let N1: number;
  let N2: number;
  let N3: number;
  if (!_height) {
    // 得到以MAX_ENTRIES为底，N的对数，即「MAX_ENTRIES ^ height = N」
    // 使用ceil是因为log的计算结果有浮点精度问题，也有可能雀氏除不开
    // 取大不取小
    // target height of the bulk-loaded tree
    height = Math.ceil(Math.log(N) / Math.log(MAX_ENTRIES));

    // 因为上面height是ceil（取大不取小）的结果，所以这里重新计算下最后乘数
    // 「MAX_ENTRIES ^ (height - 1) * M = N」
    // M依然是取大不取小的整数。这样M作为根节点的数量，做到最大空间利用
    // target number of root entries to maximize storage utilization
    const M = Math.ceil(N / Math.pow(MAX_ENTRIES, height - 1));

    // split the items into M mostly square tiles
    // 每个根节点有N3个item
    N3 = Math.ceil(N / M);
    // N2和N1大概为了快速计算，不讲道理的两个数字
    N2 = N3 * Math.ceil(Math.pow(M, 2 / 3));
    N1 = N3 * Math.ceil(Math.pow(M, 1 / 3));
  } else {
    height = _height;

    N3 = Math.ceil(N / MAX_ENTRIES);
    N2 = N3 * M_2_3;
    N1 = N3 * M_1_3;
  }

  const node = allocNode();
  node.children.length = node.boxes.length = 0;
  let lox = Infinity;
  let loy = Infinity;
  let loz = Infinity;
  let hix = -Infinity;
  let hiy = -Infinity;
  let hiz = -Infinity;

  multiSelect(items, left, right, N1, compareMinX);
  for (let i = left; i <= right; i += N1) {
    const right2 = Math.min(i + N1 - 1, right);
    multiSelect(items, i, right2, N2, compareMinY);
    for (let j = i; j <= right2; j += N2) {
      const right3 = Math.min(j + N2 - 1, right2);
      multiSelect(items, j, right3, N3, compareMinZ);
      for (let k = j; k <= right3; k += N3) {
        const right4 = Math.min(k + N3 - 1, right3);
        const c = createBodyRBush(items, k, right4, height - 1);
        node.children.push(c);
        lox = Math.min(lox, c.minX);
        loy = Math.min(loy, c.minY);
        loz = Math.min(loz, c.minZ);
        hix = Math.max(hix, c.maxX);
        hiy = Math.max(hiy, c.maxY);
        hiz = Math.max(hiz, c.maxZ);
      }
    }
  }

  node.minX = lox;
  node.minY = loy;
  node.minZ = loz;
  node.maxX = hix;
  node.maxY = hiy;
  node.maxZ = hiz;
  node.volume = (hix - lox) * (hiy - loy) * (hiz - loz);

  return node;
}

function reportLeaves(
  result: number[],
  boxes: BodyCollisionBox[],
  minX: number,
  minY: number,
  minZ: number,
  maxX: number,
  maxY: number,
  maxZ: number,
) {
  for (let i = 0; i < boxes.length; ++i) {
    const b = boxes[i];
    if (
      b.minX <= maxX &&
      b.minY <= maxY &&
      b.minZ <= maxZ &&
      b.maxX >= minX &&
      b.maxY >= minY &&
      b.maxZ >= minZ
    ) {
      result.push(b.id);
    }
  }
}

function intersects(
  node: BodyRBushNode,
  minX: number,
  minY: number,
  minZ: number,
  maxX: number,
  maxY: number,
  maxZ: number,
) {
  return (
    node.minX <= maxX &&
    node.minY <= maxY &&
    node.minZ <= maxZ &&
    node.maxX >= minX &&
    node.maxY >= minY &&
    node.maxZ >= minZ
  );
}

const SEARCH_STACK: BodyRBushNode[] = [];
function searchRBush(
  result: number[],
  root: BodyRBushNode,
  minX: number,
  minY: number,
  minZ: number,
  maxX: number,
  maxY: number,
  maxZ: number,
) {
  if (!intersects(root, minX, minY, minZ, maxX, maxY, maxZ)) {
    return;
  }
  if (root.boxes.length > 0) {
    reportLeaves(result, root.boxes, minX, minY, minZ, maxX, maxY, maxZ);
    return;
  }
  for (
    let node: BodyRBushNode | undefined = root;
    !!node;
    node = SEARCH_STACK.pop()
  ) {
    const children = node.children;
    for (let i = 0; i < children.length; ++i) {
      const child = children[i];
      if (intersects(child, minX, minY, minZ, maxX, maxY, maxZ)) {
        if (child.boxes.length > 0) {
          reportLeaves(result, child.boxes, minX, minY, minZ, maxX, maxY, maxZ);
        } else {
          SEARCH_STACK.push(child);
        }
      }
    }
  }
}

function testLeaves(
  boxes: BodyCollisionBox[],
  minX: number,
  minY: number,
  minZ: number,
  maxX: number,
  maxY: number,
  maxZ: number,
  skipId: number,
) {
  for (let i = 0; i < boxes.length; ++i) {
    const b = boxes[i];
    if (
      b.id !== skipId &&
      b.minX <= maxX &&
      b.minY <= maxY &&
      b.minZ <= maxZ &&
      b.maxX >= minX &&
      b.maxY >= minY &&
      b.maxZ >= minZ
    ) {
      return true;
    }
  }
  return false;
}

export function testBodyRBush(
  root: BodyRBushNode,
  minX: number,
  minY: number,
  minZ: number,
  maxX: number,
  maxY: number,
  maxZ: number,
  skipId: number,
) {
  if (!intersects(root, minX, minY, minZ, maxX, maxY, maxZ)) {
    return false;
  }
  if (root.boxes.length > 0) {
    return testLeaves(root.boxes, minX, minY, minZ, maxX, maxY, maxZ, skipId);
  }
  for (
    let node: BodyRBushNode | undefined = root;
    !!node;
    node = SEARCH_STACK.pop()
  ) {
    const children = node.children;
    for (let i = 0; i < children.length; ++i) {
      const child = children[i];
      if (intersects(child, minX, minY, minZ, maxX, maxY, maxZ)) {
        if (child.boxes.length > 0) {
          if (
            testLeaves(child.boxes, minX, minY, minZ, maxX, maxY, maxZ, skipId)
          ) {
            SEARCH_STACK.length = 0;
            return true;
          }
        } else {
          SEARCH_STACK.push(child);
        }
      }
    }
  }
  return false;
}

function intersectsPair(a: BodyRBushNode, b: BodyRBushNode) {
  return (
    a.minX <= b.maxX &&
    a.minY <= b.maxY &&
    a.minZ <= b.maxZ &&
    a.maxX >= b.minX &&
    a.maxY >= b.minY &&
    a.maxZ >= b.minZ
  );
}

function multiPush(result: number[], hi: number, x: number) {
  const lo = result.length;
  for (let i = lo; i < hi; ++i) {
    result.push(x);
  }
}

function bruteForceA(
  resultA: number[],
  resultB: number[],
  aBoxes: BodyCollisionBox[],
  rootB: BodyRBushNode,
) {
  for (let i = 0; i < aBoxes.length; ++i) {
    const a = aBoxes[i];
    searchRBush(resultB, rootB, a.minX, a.minY, a.minZ, a.maxX, a.maxY, a.maxZ);
    multiPush(resultA, resultB.length, a.id);
  }
}

function bruteForceB(
  resultA: number[],
  resultB: number[],
  rootA: BodyRBushNode,
  bBoxes: BodyCollisionBox[],
) {
  for (let i = 0; i < bBoxes.length; ++i) {
    const b = bBoxes[i];
    searchRBush(resultA, rootA, b.minX, b.minY, b.minZ, b.maxX, b.maxY, b.maxZ);
    multiPush(resultB, resultA.length, b.id);
  }
}

const COLLIDE_STACK: BodyRBushNode[] = [];

export function resolveBodyCollisions(
  resultA: number[],
  resultB: number[],
  rootA: BodyRBushNode,
  rootB: BodyRBushNode,
) {
  if (!intersectsPair(rootA, rootB)) {
    return;
  }

  // handle child case
  if (rootA.boxes.length > 0) {
    bruteForceA(resultA, resultB, rootA.boxes, rootB);
    return;
  } else if (rootB.boxes.length > 0) {
    bruteForceB(resultA, resultB, rootA, rootB.boxes);
    return;
  }

  for (
    let nodeA: BodyRBushNode | undefined = rootA,
      nodeB: BodyRBushNode | undefined = rootB;
    !!(nodeA && nodeB);

  ) {
    if (nodeA.volume > nodeB.volume) {
      const children = nodeA.children;
      for (let i = 0; i < children.length; ++i) {
        const child = children[i];
        if (intersectsPair(child, nodeB)) {
          if (child.boxes.length > 0) {
            bruteForceA(resultA, resultB, child.boxes, nodeB);
          } else {
            COLLIDE_STACK.push(child, nodeB);
          }
        }
      }
    } else {
      const children = nodeB.children;
      for (let i = 0; i < children.length; ++i) {
        const child = children[i];
        if (intersectsPair(nodeA, child)) {
          if (child.boxes.length > 0) {
            bruteForceB(resultA, resultB, nodeA, child.boxes);
          } else {
            COLLIDE_STACK.push(nodeA, child);
          }
        }
      }
    }
    nodeB = COLLIDE_STACK.pop();
    nodeA = COLLIDE_STACK.pop();
  }
}

function intersectsBox(a: BodyCollisionBox, b: BodyCollisionBox) {
  return (
    a.minX <= b.maxX &&
    a.minY <= b.maxY &&
    a.minZ <= b.maxZ &&
    a.maxX >= b.minX &&
    a.maxY >= b.minY &&
    a.maxZ >= b.minZ
  );
}

function bruteForceSelf(
  resultA: number[],
  resultB: number[],
  boxes: BodyCollisionBox[],
) {
  for (let i = 0; i < boxes.length; ++i) {
    const a = boxes[i];
    for (let j = 0; j < i; ++j) {
      const b = boxes[j];
      if (intersectsBox(a, b)) {
        resultA.push(a.id);
        resultB.push(b.id);
      }
    }
  }
}

const SELF_COLLIDE_STACK: BodyRBushNode[] = [];
/**
 * 根据BodyRBushNode计算里面两两相撞的box，得到的结果放到resultA和resultB中
 * resultA和resultB的长度一定是一样的
 * 相同的索引值对应的一组碰撞关系，value为碰撞体的ID
 * @param resultA
 * @param resultB
 * @param root
 * @returns
 */
export function resolveSelfBodyCollisions(
  resultA: number[],
  resultB: number[],
  root: BodyRBushNode,
) {
  // handle child case
  // 没有叶子🍃，直接在里面算碰撞
  if (root.boxes.length > 0) {
    bruteForceSelf(resultA, resultB, root.boxes);
    return;
  }

  for (
    let node: BodyRBushNode | undefined = root;
    !!node;
    node = SELF_COLLIDE_STACK.pop()
  ) {
    const children = node.children;
    for (let i = 0; i < children.length; ++i) {
      const child = children[i];
      if (child.boxes.length > 0) {
        bruteForceSelf(resultA, resultB, child.boxes);
      } else {
        SELF_COLLIDE_STACK.push(child);
      }
      for (let j = 0; j < i; ++j) {
        resolveBodyCollisions(resultA, resultB, child, children[j]);
      }
    }
  }
}
