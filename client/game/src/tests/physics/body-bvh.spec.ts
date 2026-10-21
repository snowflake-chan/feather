import { expect, test } from '@jest/globals';
import {
  clearNodePool,
  createBodyRBush,
  resolveBodyCollisions,
  resolveSelfBodyCollisions,
  BodyCollisionBox,
  BodyRBushNode,
} from '@box/schema/physics/body-rbush';

function intersectBox(a: BodyCollisionBox, b: BodyCollisionBox) {
  return (
    a.minX <= b.maxX &&
    b.minX <= a.maxX &&
    a.minY <= b.maxY &&
    b.minY <= a.maxY &&
    a.minZ <= b.maxZ &&
    b.minZ <= a.maxZ
  );
}

function pairsSame(a: number[][], b: number[][]) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; ++i) {
    const ap = a[i];
    const bp = b[i];
    if (ap[0] !== bp[0] || ap[0] !== bp[0]) {
      return false;
    }
  }
  return true;
}

function createBox(
  lox: number,
  loy: number,
  loz: number,
  hix: number,
  hiy: number,
  hiz: number,
  id: number,
) {
  const b = new BodyCollisionBox();
  b.minX = Math.min(lox, hix);
  b.minY = Math.min(loy, hiy);
  b.minZ = Math.min(loz, hiz);
  b.maxX = Math.max(lox, hix);
  b.maxY = Math.max(loy, hiy);
  b.maxZ = Math.max(loz, hiz);
  b.id = id;
  return b;
}

function generateRandomBoxes(lo: number, hi: number, count: number) {
  const result: BodyCollisionBox[] = [];
  for (let i = 0; i < count; ++i) {
    result.push(
      createBox(
        lo + Math.random() * (hi - lo),
        lo + Math.random() * (hi - lo),
        lo + Math.random() * (hi - lo),
        lo + Math.random() * (hi - lo),
        lo + Math.random() * (hi - lo),
        lo + Math.random() * (hi - lo),
        i,
      ),
    );
  }
  return result;
}

function cmpBox(a: BodyCollisionBox, b: BodyCollisionBox) {
  return (
    a.id - b.id ||
    a.minX - b.minX ||
    a.minY - b.minY ||
    a.minZ - b.minZ ||
    a.maxX - b.maxX ||
    a.maxY - b.maxY ||
    a.maxZ - b.maxZ
  );
}

function boxListSame(a: BodyCollisionBox[], b: BodyCollisionBox[]) {
  if (a.length !== b.length) {
    return false;
  }
  const as = a.slice();
  const bs = b.slice();
  as.sort(cmpBox);
  bs.sort(cmpBox);
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

function checkTreeStructure(boxes: BodyCollisionBox[], root: BodyRBushNode) {
  const treeBoxes: BodyCollisionBox[] = [];
  const treeNodes: BodyRBushNode[] = [root];
  const m = new Set<BodyRBushNode>();
  for (let ptr = 0; ptr < treeNodes.length; ++ptr) {
    const node = treeNodes[ptr];
    expect(m.has(node)).toBeFalsy();
    m.add(node);
    expect(node.volume).toBe(
      (node.maxX - node.minX) *
        (node.maxY - node.minY) *
        (node.maxZ - node.minZ),
    );
    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;
    if (node.boxes.length) {
      expect(node.children.length).toBe(0);
      for (let i = 0; i < node.boxes.length; ++i) {
        const b = node.boxes[i];
        treeBoxes.push(node.boxes[i]);
        minX = Math.min(minX, b.minX);
        minY = Math.min(minY, b.minY);
        minZ = Math.min(minZ, b.minZ);
        maxX = Math.max(maxX, b.maxX);
        maxY = Math.max(maxY, b.maxY);
        maxZ = Math.max(maxZ, b.maxZ);
      }
    } else {
      expect(node.children.length > 0).toBeTruthy();
      for (let i = 0; i < node.children.length; ++i) {
        const c = node.children[i];
        treeNodes.push(c);
        minX = Math.min(minX, c.minX);
        minY = Math.min(minY, c.minY);
        minZ = Math.min(minZ, c.minZ);
        maxX = Math.max(maxX, c.maxX);
        maxY = Math.max(maxY, c.maxY);
        maxZ = Math.max(maxZ, c.maxZ);
      }
    }
    expect(node.minX).toBe(minX);
    expect(node.minY).toBe(minY);
    expect(node.minZ).toBe(minZ);
    expect(node.maxX).toBe(maxX);
    expect(node.maxY).toBe(maxY);
    expect(node.maxZ).toBe(maxZ);
  }
  expect(boxListSame(treeBoxes, boxes)).toBeTruthy();
}

test('self collision', () => {
  function zipAB(a: number[], b: number[]) {
    const result: number[][] = [];
    for (let i = 0; i < a.length; ++i) {
      const ai = a[i];
      const bi = b[i];
      result.push([Math.min(ai, bi), Math.max(ai, bi)]);
    }
    result.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
    return result;
  }

  function bruteForceSelfIntersect(boxes: BodyCollisionBox[]) {
    const result: number[][] = [];
    for (let i = 0; i < boxes.length; ++i) {
      for (let j = i + 1; j < boxes.length; ++j) {
        if (intersectBox(boxes[i], boxes[j])) {
          result.push([
            Math.min(boxes[i].id, boxes[j].id),
            Math.max(boxes[i].id, boxes[j].id),
          ]);
        }
      }
    }
    result.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
    return result;
  }

  function testSelfIntersect(boxes: BodyCollisionBox[]) {
    clearNodePool();
    const root = createBodyRBush(boxes, 0, boxes.length - 1, 0);
    checkTreeStructure(boxes, root);

    const aResult: number[] = [];
    const bResult: number[] = [];
    resolveSelfBodyCollisions(aResult, bResult, root);
    expect(aResult.length).toBe(bResult.length);
    const actualPairs: number[][] = zipAB(aResult, bResult);
    const expectedPairs = bruteForceSelfIntersect(boxes);

    expect(pairsSame(actualPairs, expectedPairs)).toBeTruthy();
  }

  for (let n = 1; n <= 1000; n *= 10) {
    for (let count = 0; count < 10; ++count) {
      testSelfIntersect(generateRandomBoxes(0, 10, n));
    }
  }
});

test('pair collision', () => {
  function zipAB(a: number[], b: number[]) {
    const result: number[][] = [];
    for (let i = 0; i < a.length; ++i) {
      result.push([a[i], b[i]]);
    }
    result.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
    return result;
  }

  function bruteForcePairIntersect(
    aboxes: BodyCollisionBox[],
    bboxes: BodyCollisionBox[],
  ) {
    const result: number[][] = [];
    for (let i = 0; i < aboxes.length; ++i) {
      for (let j = 0; j < bboxes.length; ++j) {
        if (intersectBox(aboxes[i], bboxes[j])) {
          result.push([aboxes[i].id, bboxes[j].id]);
        }
      }
    }
    result.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
    return result;
  }

  function testPairIntersect(
    aboxes: BodyCollisionBox[],
    bboxes: BodyCollisionBox[],
  ) {
    clearNodePool();
    const rootA = createBodyRBush(aboxes, 0, aboxes.length - 1, 0);
    checkTreeStructure(aboxes, rootA);
    const rootB = createBodyRBush(bboxes, 0, bboxes.length - 1, 0);
    checkTreeStructure(bboxes, rootB);

    const aResult: number[] = [];
    const bResult: number[] = [];
    resolveBodyCollisions(aResult, bResult, rootA, rootB);
    expect(aResult.length).toBe(bResult.length);
    const actualPairs: number[][] = zipAB(aResult, bResult);
    const expectedPairs = bruteForcePairIntersect(aboxes, bboxes);

    expect(pairsSame(actualPairs, expectedPairs)).toBeTruthy();
  }

  for (let n = 1; n <= 1000; n *= 10) {
    for (let m = 1; m <= 1000; m *= 10) {
      testPairIntersect(
        generateRandomBoxes(0, 10, n),
        generateRandomBoxes(0, 10, m),
      );
    }
  }
});
