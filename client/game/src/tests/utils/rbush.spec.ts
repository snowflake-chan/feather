import { expect, test } from '@jest/globals';
import {
  VoxelCollisionBox,
  VoxelCollisionBoxSchema,
  RBushNode,
  RBushSchema,
  VoxelCollisionBoxList,
  VoxelCollisionBoxListSchema,
} from '@box/schema/utils/rbush-schema';
import { createRBush, searchRBush } from '@box/schema/voxel/rbush';

const REPORT_STACK: RBushNode[] = [];
function reportAll(result: VoxelCollisionBox[], node: RBushNode) {
  for (let n: RBushNode | undefined = node; !!n; n = REPORT_STACK.pop()) {
    if (n.boxes.length > 0) {
      for (let i = 0; i < n.boxes.length; ++i) {
        result.push(n.boxes[i]);
      }
    } else {
      for (let i = 0; i < n.children.length; ++i) {
        REPORT_STACK.push(n.children[i]);
      }
    }
  }
}

function rbushBoxes(node: RBushNode) {
  const result = VoxelCollisionBoxListSchema.alloc();
  reportAll(result, node);
  result.sort(VoxelCollisionBoxListSchema.compare);
  return result;
}

function createTree(boxes: VoxelCollisionBoxList) {
  return createRBush(
    VoxelCollisionBoxListSchema.clone(boxes),
    0,
    boxes.length - 1,
    0,
  );
}

function searchTree(node: RBushNode, box: VoxelCollisionBox) {
  const result: VoxelCollisionBox[] = [];
  searchRBush(
    result,
    node,
    box.minX,
    box.minY,
    box.minZ,
    box.maxX,
    box.maxY,
    box.maxZ,
  );
  return result;
}

const sortedEqual = (
  actual: VoxelCollisionBoxList,
  expected: VoxelCollisionBoxList,
  msg?: string,
) => {
  expect(actual.slice().sort(VoxelCollisionBoxListSchema.compare)).toEqual(
    expected.slice().sort(VoxelCollisionBoxListSchema.compare),
  );
};

const someData = (n: number) => {
  const result: VoxelCollisionBox[] = [];
  for (let i = 0; i < n; i++) {
    const b = VoxelCollisionBoxSchema.clone(VoxelCollisionBoxSchema.identity);
    b.minX = b.maxX = b.minY = b.maxY = i;
    b.minZ = b.maxZ = 0;
    result.push(b);
  }
  return result;
};

const arrToBBox = (arr: number[]) => {
  const result = VoxelCollisionBoxSchema.clone(
    VoxelCollisionBoxSchema.identity,
  );
  result.minX = arr[0];
  result.minY = arr[1];
  result.minZ = arr[2];
  result.maxX = arr[3];
  result.maxY = arr[4];
  result.maxZ = arr[5];
  return result;
};

const DATA = [
  [0, 0, 0, 0, 0, 0],
  [10, 10, 10, 10, 10, 10],
  [20, 20, 20, 20, 20, 20],
  [25, 0, 0, 25, 0, 0],
  [35, 10, 5, 35, 10, 5],
  [45, 20, 10, 45, 20, 10],
  [0, 25, 50, 0, 25, 50],
  [10, 35, 60, 10, 35, 60],
  [20, 45, 30, 20, 45, 30],
  [25, 25, 25, 25, 25, 25],
  [35, 35, 35, 35, 35, 35],
  [45, 45, 45, 45, 45, 45],
  [50, 0, 25, 50, 0, 25],
  [60, 10, 30, 60, 10, 30],
  [70, 20, 30, 70, 20, 30],
  [75, 0, 10, 75, 0, 10],
  [85, 10, 60, 85, 10, 60],
  [95, 20, 0, 95, 20, 0],
  [50, 25, 20, 50, 25, 20],
  [60, 35, 50, 60, 35, 50],
  [70, 45, 70, 70, 45, 70],
  [75, 25, 45, 75, 25, 45],
  [85, 35, 15, 85, 35, 15],
  [95, 45, 5, 95, 45, 5],
  [0, 50, 0, 0, 50, 0],
  [10, 60, 80, 10, 60, 80],
  [20, 70, 40, 20, 70, 40],
  [25, 50, 20, 25, 50, 20],
  [35, 60, 55, 35, 60, 55],
  [45, 70, 35, 45, 70, 35],
  [0, 75, 30, 0, 75, 30],
  [10, 85, 50, 10, 85, 50],
  [20, 95, 25, 20, 95, 25],
  [25, 75, 45, 25, 75, 45],
  [35, 85, 50, 35, 85, 50],
  [45, 95, 15, 45, 95, 15],
  [50, 50, 50, 50, 50, 50],
  [60, 60, 60, 60, 60, 60],
  [70, 70, 70, 70, 70, 70],
  [75, 50, 30, 75, 50, 30],
  [85, 60, 30, 85, 60, 30],
  [95, 70, 45, 95, 70, 45],
  [50, 75, 20, 50, 75, 20],
  [60, 85, 65, 60, 85, 65],
  [70, 95, 85, 70, 95, 85],
  [75, 75, 75, 75, 75, 75],
  [85, 85, 85, 85, 85, 85],
  [95, 95, 95, 95, 95, 95],
]
  .map(arrToBBox)
  .sort(VoxelCollisionBoxListSchema.compare);

function intersects(a: VoxelCollisionBox, b: VoxelCollisionBox) {
  return (
    b.minX <= a.maxX &&
    b.minY <= a.maxY &&
    b.minZ <= a.maxZ &&
    b.maxX >= a.minX &&
    b.maxY >= a.minY &&
    b.maxZ >= a.minZ
  );
}

const bfSearch = (bbox: VoxelCollisionBox, data: VoxelCollisionBox[]) => {
  return data.filter(function (node) {
    return intersects(bbox, node);
  });
};

const randBox = (size: number) => {
  const x = Math.random() * (2 - size) - 1;
  const y = Math.random() * (2 - size) - 1;
  const z = Math.random() * (2 - size) - 1;
  return arrToBBox([
    Math.round(x),
    Math.round(y),
    Math.round(z),
    Math.round(x + size * Math.random()),
    Math.round(y + size * Math.random()),
    Math.round(z + size * Math.random()),
  ]);
};

const randBoxes = (n: number, size: number) => {
  const result: VoxelCollisionBox[] = new Array(n);
  for (let i = 0; i < n; i++) {
    result[i] = randBox(size);
  }
  return result;
};

function treeHeight(node: RBushNode) {
  let height = 0;
  for (let i = 0; i < node.children.length; ++i) {
    height = Math.max(treeHeight(node.children[i]), height);
  }
  return height + 1;
}

function checkTreeInvariants(root: RBushNode) {
  if (root.boxes.length > 0) {
    expect(root.children.length).toBe(0);
    for (let i = 0; i < root.boxes.length; ++i) {
      const b = root.boxes[i];
      expect(
        root.minX <= b.minX &&
          root.minY <= b.minY &&
          root.minZ <= b.minZ &&
          b.maxX <= b.maxX &&
          b.maxY <= b.maxY &&
          b.maxZ <= b.maxZ,
      ).toBeTruthy();
    }
  } else {
    expect(root.children.length).not.toBe(0);
    for (let i = 0; i < root.boxes.length; ++i) {
      const b = root.children[i];
      expect(
        root.minX <= b.minX &&
          root.minY <= b.minY &&
          root.minZ <= b.minZ &&
          b.maxX <= b.maxX &&
          b.maxY <= b.maxY &&
          b.maxZ <= b.maxZ,
      ).toBeTruthy();
      checkTreeInvariants(b);
    }
  }
}

test('constructor uses 16 max entries by default', () => {
  const tree = createRBush(someData(16), 0, 15, 0);
  expect(treeHeight(tree)).toBe(1);

  const tree2 = createRBush(someData(17), 0, 16, 0);
  expect(treeHeight(tree2)).toBe(2);

  RBushSchema.free(tree);
  RBushSchema.free(tree2);
});

test('load bulk-loads the given data given max node entries and forms a proper search tree', () => {
  const tree = createRBush(
    VoxelCollisionBoxListSchema.clone(DATA),
    0,
    DATA.length - 1,
    0,
  );
  sortedEqual(rbushBoxes(tree), DATA);
});

test('load handles the insertion of maxEntries + 2 empty bboxes', () => {
  const data = [
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity],
  ].map(arrToBBox);
  const tree = createRBush(
    VoxelCollisionBoxListSchema.clone(data),
    0,
    data.length - 1,
    0,
  );
  expect(treeHeight(tree)).toBe(2);
  sortedEqual(rbushBoxes(tree), data);
});

test('search finds matching points in the tree given a bbox', () => {
  const tree = createTree(DATA);
  const bbox = arrToBBox([40, 20, 90, 80, 70, 90]);
  const result = searchTree(tree, bbox);
  const expectedResult = bfSearch(bbox, DATA);
  sortedEqual(result, expectedResult);
});

test('search returns an empty array if nothing found', () => {
  const tree = createTree(DATA);
  const result = searchTree(tree, arrToBBox([200, 200, 200, 210, 210, 210]));
  expect(result).toEqual([]);
});

test('all returns all points in the tree', () => {
  const tree = createTree(DATA);
  const result = rbushBoxes(tree);

  sortedEqual(result, DATA);
  sortedEqual(searchTree(tree, arrToBBox([0, 0, 0, 100, 100, 100])), DATA);
});

test('search with random data', () => {
  const POINT_SIZE = 10000;
  const BOX_SIZE = 10000;
  const POINTS_NUMBER = 10000;
  const BOXEX_NUMBER = 100;

  const randomPoints = randBoxes(POINTS_NUMBER, POINT_SIZE);
  const randomBoxes = randBoxes(BOXEX_NUMBER, BOX_SIZE);
  const tree = createTree(randomPoints);

  randomBoxes.forEach(function (bbox) {
    const result = searchTree(tree, bbox);
    const expectedResult = bfSearch(bbox, randomPoints);
    sortedEqual(result, expectedResult);
  });
});

test('fuzz rbush search', () => {
  for (let i = 0; i < 50; ++i) {
    const boxes = randBoxes(Math.round(Math.random() * 256 + 10), 64);
    const tree = createTree(boxes);
    checkTreeInvariants(tree);
    expect(
      treeHeight(tree) >= Math.log(boxes.length) / Math.log(16),
    ).toBeTruthy();
    sortedEqual(rbushBoxes(tree), boxes, 'tree construction, no missed boxes');
    sortedEqual(
      searchTree(tree, arrToBBox([-100, -100, -100, 100, 100, 100])),
      boxes,
      'all boxes contained ok',
    );
    sortedEqual(
      searchTree(tree, arrToBBox([100, 10, 10, 101, 100, 100])),
      [],
      'empty box ok',
    );
    for (let j = 0; j < 100; ++j) {
      const b = randBox(64);
      sortedEqual(
        searchTree(tree, b),
        bfSearch(b, boxes),
        `random box: ${JSON.stringify(b)}`,
      );
    }
  }
});
