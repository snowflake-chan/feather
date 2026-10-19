// Based on https://github.com/mikolalysenko/pairing-heap
// * Turned into TS
// * Use class for nodes (good hidden class opt on recent V8, probably)
// * Add serial integer to node for "deterministic" execution
// * Add lambda to node
// * Added pool for nodes
// * Add taskId to uniquely identify nodes

export type Lambda = () => boolean;
export const NIL_LAMBDA: Lambda = () => false;
let _series = 0;

class PairingHeapNode {
  constructor(
    public weight: number,
    public taskId: number,
    public lambda: Lambda,

    // Only changed internally, never read from outside
    public _serial: number,
    public _parent: PairingHeapNode,
    public _left: PairingHeapNode,
    public _right: PairingHeapNode,
  ) {}
}
export type Node = PairingHeapNode;

// Linked-list structured object pool by re-using the ._parent property
let _pool: PairingHeapNode | null = null;
let nodesCreated = 0;
let nodesReused = 0;

export function clearPool() {
  _pool = null;
  nodesCreated = 0;
  nodesReused = 0;
}

export function stats() {
  return { nodesCreated, nodesReused };
}

// Sentinel node
export const NIL = new PairingHeapNode(
  -Infinity,
  -1,
  NIL_LAMBDA,
  -1,
  <any>null,
  <any>null,
  <any>null,
);
NIL._left = NIL._right = NIL._parent = NIL;

export function create(weight: number, taskId: number): PairingHeapNode {
  if (taskId < 0) {
    throw new Error('negative taskID not allowed');
  }
  if (!_pool) {
    nodesCreated++;
    return new PairingHeapNode(
      weight,
      taskId,
      NIL_LAMBDA,
      _series++,
      NIL,
      NIL,
      NIL,
    );
  }
  nodesReused++;
  const head = _pool;
  if (head._parent === NIL) {
    _pool = null;
  } else {
    _pool = head._parent;
  }
  head._parent = NIL;
  head.weight = weight;
  head.taskId = taskId;
  head._serial = _series++;
  return head;
}

export function free(node: PairingHeapNode) {
  if (node === NIL) {
    return;
  }
  // Note: No need to free or set node._left and node._right,
  // they've been taken care of by takeMin already
  node._parent = <any>_pool;
  // We set lambda on free instead of create to make sure we're not
  // holding on to refs via the closure
  node.lambda = NIL_LAMBDA;
  node._left = node._right = NIL;
  _pool = node;
}

export function cmp(a: PairingHeapNode, b: PairingHeapNode) {
  if (a.weight === b.weight) {
    return a._serial < b._serial;
  }
  return a.weight < b.weight;
}

function link(a: PairingHeapNode, b: PairingHeapNode) {
  // Note: MUST NOT try to free a._right or b._right,
  // since references to them are saved by the caller
  const al = a._left;
  b._right = al;
  al._parent = b;
  b._parent = a;
  a._left = b;
  a._right = NIL;
  return a;
}

export function merge(a: PairingHeapNode, b: PairingHeapNode) {
  if (a === NIL) {
    return b;
  } else if (b === NIL) {
    return a;
  } else if (cmp(a, b)) {
    return link(a, b);
  } else {
    return link(b, a);
  }
}

export function takeMin(root: PairingHeapNode): PairingHeapNode {
  let p = root._left;
  root._left = NIL;
  root = p;
  while (true) {
    let q = root._right;
    if (q === NIL) {
      break;
    }
    p = root;
    let r = q._right;
    let s = merge(p, q);
    root = s;
    while (true) {
      p = r;
      q = r._right;
      if (q === NIL) {
        break;
      }
      r = q._right;
      s = s._right = merge(p, q);
    }
    s._right = NIL;
    if (p !== NIL) {
      p._right = root;
      root = p;
    }
  }
  root._parent = NIL;
  return root;
}

export function decreaseKey(root: PairingHeapNode, p: PairingHeapNode) {
  const q = p._parent;
  if (cmp(q, p)) {
    return root;
  }
  const r = p._right;
  r._parent = q;
  if (q._left === p) {
    q._left = r;
  } else {
    q._right = r;
  }
  if (cmp(root, p)) {
    const l = root._left;
    l._parent = p;
    p._right = l;
    root._left = p;
    p._parent = root;
    return root;
  } else {
    const l = p._left;
    root._right = l;
    l._parent = root;
    p._left = root;
    root._parent = p;
    p._right = p._parent = NIL;
    return p;
  }
}
