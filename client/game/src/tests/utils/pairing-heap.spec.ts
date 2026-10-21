import { expect, test } from '@jest/globals';
import * as pq from '@box/utils/script/pairing-heap';

function checkHeapInvariant(root) {
  expect(pq.NIL._left).toBe(pq.NIL);
  expect(pq.NIL._right).toBe(pq.NIL);
  //Allow for _parent of NIL to be modified
  function checkNode(node, _parent, leader) {
    if (node === pq.NIL) {
      return;
    }
    expect(node._parent).toBe(_parent);
    expect(node._serial).not.toBe(_parent._serial);
    if (leader !== pq.NIL) {
      expect(pq.cmp(leader, node)).toBeTruthy();
    }
    checkNode(node._left, node, node);
    checkNode(node._right, node, leader);
  }
  checkNode(root, pq.NIL, pq.NIL);
}

function nodeCmp(a: pq.Node, b: pq.Node): number {
  if (a.weight === b.weight) {
    return a._serial - b._serial;
  }
  return a.weight - b.weight;
}

test('pairing heap fuzz + object pool test', function () {
  // reset pool state
  pq.clearPool();

  const items: { [_taskId: number]: pq.Node } = {};
  let root = pq.NIL;
  let latestId = 0;

  let reservedError = false;
  try {
    pq.create(0, -666);
  } catch (e) {
    reservedError = true;
  }
  expect(reservedError).toBeTruthy();

  for (let i = 0; i < 100; ++i) {
    const w = Math.random();
    const node = pq.create(w, latestId++);
    items[node.taskId] = node;
    root = pq.merge(root, node);
    checkHeapInvariant(root);
  }

  // 20 times, remove two nodes and add one
  for (let i = 0; i < 20; ++i) {
    let oldRoot = root;
    root = pq.takeMin(root);
    delete items[oldRoot.taskId];
    pq.free(oldRoot);

    oldRoot = root;
    root = pq.takeMin(root);
    delete items[oldRoot.taskId];
    pq.free(oldRoot);

    const w = Math.random();
    const node = pq.create(w, latestId++);
    items[node.taskId] = node;
    root = pq.merge(root, node);

    checkHeapInvariant(root);
  }

  // Construct list of all nodes
  const itemList: pq.Node[] = [];
  for (const taskId in items) {
    const node = items[taskId];
    expect(parseInt(taskId)).toBe(node.taskId);
    itemList.push(node);
  }

  // Randomly decrease keys
  for (let i = 0; i < 200; ++i) {
    const j = (Math.random() * 80) | 0;
    const node = itemList[j];
    node.weight -= Math.random();
    root = pq.decreaseKey(root, node);
    checkHeapInvariant(root);
  }

  // Ensure order
  itemList.sort(nodeCmp);

  while (itemList.length > 0) {
    const node = itemList.shift();
    if (node === undefined) {
      throw new Error('broken test, please fix');
    }
    expect(node).toBe(root);
    root = pq.takeMin(root);
    checkHeapInvariant(root);
  }

  const { nodesReused, nodesCreated } = pq.stats();
  expect(nodesReused).toBe(20);
  expect(nodesCreated).toBe(100);
});
