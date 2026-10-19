import {
  VoxelCollisionBox,
  RBushSchema,
  RBushNode,
} from '../utils/rbush-schema';

const MAX_ENTRIES = 16;
const BIG_NUM = 1 << 28;

function createLeafNode(
  items: VoxelCollisionBox[],
  start: number,
  end: number,
) {
  const node = RBushSchema.alloc();
  const boxes = node.boxes;
  let lox = BIG_NUM;
  let loy = BIG_NUM;
  let loz = BIG_NUM;
  let hix = -BIG_NUM;
  let hiy = -BIG_NUM;
  let hiz = -BIG_NUM;

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

  return node;
}

function swap(arr: VoxelCollisionBox[], i: number, j: number) {
  const tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}

function quickselectStep(
  arr: VoxelCollisionBox[],
  k: number,
  left: number,
  right: number,
  compare: (a: VoxelCollisionBox, b: VoxelCollisionBox) => number,
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
  arr: VoxelCollisionBox[],
  left: number,
  right: number,
  n: number,
  compare,
) {
  STACK.length = 0;
  STACK.push(left, right);
  const s = 0.5 / n;
  while (STACK.length) {
    const a = STACK.pop()!;
    const b = STACK.pop()!;
    if (b - a <= n) {
      continue;
    }
    const mid = a + Math.ceil(s * (b - a)) * n;
    quickselectStep(arr, mid, a, b, compare);
    STACK.push(a, mid, mid, b);
  }
}

function compareMinX(a: VoxelCollisionBox, b: VoxelCollisionBox) {
  return a.minX - b.minX;
}
function compareMinY(a: VoxelCollisionBox, b: VoxelCollisionBox) {
  return a.minY - b.minY;
}
function compareMinZ(a: VoxelCollisionBox, b: VoxelCollisionBox) {
  return a.minZ - b.minZ;
}

const M_2_3 = Math.ceil(Math.pow(MAX_ENTRIES, 2 / 3));
const M_1_3 = Math.ceil(Math.pow(MAX_ENTRIES, 1 / 3));

export function createRBush(
  items: VoxelCollisionBox[],
  left: number,
  right: number,
  _height: number,
) {
  const N = right - left + 1;
  if (N <= MAX_ENTRIES) {
    // reached leaf level; return leaf
    return createLeafNode(items, left, right + 1);
  }

  let height;
  let N1;
  let N2;
  let N3;
  if (!_height) {
    // target height of the bulk-loaded tree
    height = Math.ceil(Math.log(N) / Math.log(MAX_ENTRIES));

    // target number of root entries to maximize storage utilization
    const M = Math.ceil(N / Math.pow(MAX_ENTRIES, height - 1));

    // split the items into M mostly square tiles
    N3 = Math.ceil(N / M);
    N2 = N3 * Math.ceil(Math.pow(M, 2 / 3));
    N1 = N3 * Math.ceil(Math.pow(M, 1 / 3));
  } else {
    height = _height;

    N3 = Math.ceil(N / MAX_ENTRIES);
    N2 = N3 * M_2_3;
    N1 = N3 * M_1_3;
  }

  const node = RBushSchema.alloc();
  let lox = BIG_NUM;
  let loy = BIG_NUM;
  let loz = BIG_NUM;
  let hix = -BIG_NUM;
  let hiy = -BIG_NUM;
  let hiz = -BIG_NUM;

  multiSelect(items, left, right, N1, compareMinX);
  for (let i = left; i <= right; i += N1) {
    const right2 = Math.min(i + N1 - 1, right);
    multiSelect(items, i, right2, N2, compareMinY);
    for (let j = i; j <= right2; j += N2) {
      const right3 = Math.min(j + N2 - 1, right2);
      multiSelect(items, j, right3, N3, compareMinZ);
      for (let k = j; k <= right3; k += N3) {
        const right4 = Math.min(k + N3 - 1, right3);
        const c = createRBush(items, k, right4, height - 1);
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

  return node;
}

function reportLeaves(
  result: VoxelCollisionBox[],
  boxes: VoxelCollisionBox[],
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
      result.push(b);
    }
  }
}

function intersects(
  node: RBushNode,
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

const SEARCH_STACK: RBushNode[] = [];
export function searchRBush(
  result: VoxelCollisionBox[],
  root: RBushNode,
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
    let node: RBushNode | undefined = root;
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
  boxes: VoxelCollisionBox[],
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
      return true;
    }
  }
  return false;
}

export function testRBush(
  root: RBushNode,
  minX: number,
  minY: number,
  minZ: number,
  maxX: number,
  maxY: number,
  maxZ: number,
) {
  if (!intersects(root, minX, minY, minZ, maxX, maxY, maxZ)) {
    return false;
  }
  if (root.boxes.length > 0) {
    return testLeaves(root.boxes, minX, minY, minZ, maxX, maxY, maxZ);
  }
  for (
    let node: RBushNode | undefined = root;
    !!node;
    node = SEARCH_STACK.pop()
  ) {
    const children = node.children;
    for (let i = 0; i < children.length; ++i) {
      const child = children[i];
      if (intersects(child, minX, minY, minZ, maxX, maxY, maxZ)) {
        if (child.boxes.length > 0) {
          if (testLeaves(child.boxes, minX, minY, minZ, maxX, maxY, maxZ)) {
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
