import { getById } from '@box/utils/id';
import { PhysicsZone, ZoneSelectorGroup } from '../zone/zone-schema';

const MAX_ENTRIES = 16;

export class PhysicsZoneIndexNode {
  public children: PhysicsZoneIndexNode[] = [];
  public boxes: PhysicsZone[] = [];
  public minX = 0.1;
  public minY = 0.1;
  public minZ = 0.1;
  public maxX = 0.1;
  public maxY = 0.1;
  public maxZ = 0.1;
}

const SEARCH_STACK: PhysicsZoneIndexNode[] = [];

function swap(arr: PhysicsZone[], i: number, j: number) {
  const tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}

function quickselectStep(
  arr: PhysicsZone[],
  k: number,
  left: number,
  right: number,
  compare: (a: PhysicsZone, b: PhysicsZone) => number,
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
  arr: PhysicsZone[],
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

function compareMinX(a: PhysicsZone, b: PhysicsZone) {
  return a.minX - b.minX;
}
function compareMinY(a: PhysicsZone, b: PhysicsZone) {
  return a.minY - b.minY;
}
function compareMinZ(a: PhysicsZone, b: PhysicsZone) {
  return a.minZ - b.minZ;
}

const M_2_3 = Math.ceil(Math.pow(MAX_ENTRIES, 2 / 3));
const M_1_3 = Math.ceil(Math.pow(MAX_ENTRIES, 1 / 3));

export class PhysicsZoneIndex {
  public pool: PhysicsZoneIndexNode[] = [];
  public poolPtr = 0;

  public root: PhysicsZoneIndexNode = new PhysicsZoneIndexNode();
  public selectors: ZoneSelectorGroup[] = [];
  public zones: PhysicsZone[] = [];

  private allocNode() {
    return this.pool[this.poolPtr++];
  }

  private createLeafNode(items: PhysicsZone[], start: number, end: number) {
    const node = this.allocNode();
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

    return node;
  }

  private createRBush(
    items: PhysicsZone[],
    left: number,
    right: number,
    _height: number,
  ) {
    const N = right - left + 1;
    if (N <= MAX_ENTRIES) {
      // reached leaf level; return leaf
      return this.createLeafNode(items, left, right + 1);
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

    const node = this.allocNode();
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
          const c = this.createRBush(items, k, right4, height - 1);
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

  public rebuild(zones: PhysicsZone[], selectors: ZoneSelectorGroup[]) {
    this.zones.length = zones.length;
    for (let i = 0; i < zones.length; ++i) {
      this.zones[i] = zones[i];
    }
    this.selectors = selectors;

    // if empty, skip
    if (zones.length === 0) {
      return;
    }

    // reserve nodes in pool
    while (this.pool.length < zones.length) {
      this.pool.push(new PhysicsZoneIndexNode());
    }
    this.poolPtr = 0;
    this.root = this.createRBush(this.zones, 0, this.zones.length - 1, 0);
  }

  public fx: number = 0.1;
  public fy: number = 0.1;
  public fz: number = 0.1;

  private _minX: number = 0.1;
  private _minY: number = 0.1;
  private _minZ: number = 0.1;
  private _maxX: number = 0.1;
  private _maxY: number = 0.1;
  private _maxZ: number = 0.1;

  private _groupBin: number = 0;
  private _groupBit: number = 1;

  private _invMass = 1;

  private reportLeaves(boxes: PhysicsZone[]) {
    for (let i = 0; i < boxes.length; ++i) {
      const b = boxes[i];
      if (
        b.minX <= this._maxX &&
        b.minY <= this._maxY &&
        b.minZ <= this._maxZ &&
        b.maxX >= this._minX &&
        b.maxY >= this._minY &&
        b.maxZ >= this._minZ
      ) {
        // check group
        const selector = getById(this.selectors, b.selectorGroup);
        if (
          !selector ||
          selector.groupBits.length <= this._groupBin ||
          !(selector.groupBits[this._groupBin] & this._groupBit)
        ) {
          continue;
        }

        let w = 1;
        if (b.massScale === 1) {
          w = this._invMass;
        } else {
          w = Math.pow(this._invMass, b.massScale);
        }

        this.fx += b.fx * w;
        this.fy += b.fy * w;
        this.fz += b.fz * w;
      }
    }
  }

  private intersects(node: PhysicsZoneIndexNode) {
    return (
      node.minX <= this._maxX &&
      node.minY <= this._maxY &&
      node.minZ <= this._maxZ &&
      node.maxX >= this._minX &&
      node.maxY >= this._minY &&
      node.maxZ >= this._minZ
    );
  }

  private searchRBush(root: PhysicsZoneIndexNode) {
    if (!this.intersects(root)) {
      return;
    }
    if (root.boxes.length > 0) {
      this.reportLeaves(root.boxes);
      return;
    }
    for (
      let node: PhysicsZoneIndexNode | undefined = root;
      !!node;
      node = SEARCH_STACK.pop()
    ) {
      const children = node.children;
      for (let i = 0; i < children.length; ++i) {
        const child = children[i];
        if (this.intersects(child)) {
          if (child.boxes.length > 0) {
            this.reportLeaves(child.boxes);
          } else {
            SEARCH_STACK.push(child);
          }
        }
      }
    }
  }

  public accumulateForce(
    minX: number,
    minY: number,
    minZ: number,
    maxX: number,
    maxY: number,
    maxZ: number,
    group: number,
    invMass: number,
  ) {
    this.fx = this.fy = this.fz = 0;
    if (this.zones.length === 0) {
      return;
    }
    this._minX = minX;
    this._minY = minY;
    this._minZ = minZ;
    this._maxX = maxX;
    this._maxY = maxY;
    this._maxZ = maxZ;
    this._groupBin = group >>> 5;
    this._groupBit = 1 << (group & 31);
    this._invMass = invMass;
    this.searchRBush(this.root);
  }
}
