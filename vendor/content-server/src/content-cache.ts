export interface ContentCache {
  putCache: (hash: string, data: Uint8Array, needCopy: boolean) => void;
  getCache: (hash: string) => Uint8Array | undefined;
}

const nodePool: LruNode[] = [];

export function copyContent(array: Uint8Array) {
  let result: Uint8Array;

  if (typeof Buffer === 'function' && Uint8Array.isPrototypeOf(Buffer)) {
    // Server-side must be Buffer, can not just Uint8Array, otherwise an error will be threw when requesting content server.
    // Can be unsafe because it will be filled soon.
    result = Buffer.allocUnsafe(array.length);
  } else {
    // Browser-side must be Uint8Array, can not be Buffer, because browsers do not support Buffer natively.
    result = new Uint8Array(array.length);
  }

  result.set(array);

  return result;
}

class LruNode {
  public prev: LruNode | null = null;

  public next: LruNode | null = null;

  private constructor(public key: string, public value: Uint8Array | null) {}

  public static alloc(key: string, value: Uint8Array): LruNode {
    const node = nodePool.pop();

    if (node) {
      node.key = key;
      node.value = value;
      return node;
    }

    return new LruNode(key, value);
  }

  public static free(node: LruNode) {
    node.prev = null;
    node.next = null;
    node.key = '';
    node.value = null;

    nodePool.push(node);
  }
}

class Lru {
  private head: LruNode | null = null;
  private tail: LruNode | null = null;
  private size: number;

  constructor(private capacity: number) {
    if (capacity < 1) {
      throw new Error('You can not create a no-op cache :-(');
    }
    this.size = 0;
  }

  public put(node: LruNode): LruNode | undefined {
    node.prev = null;
    node.next = this.head;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }

    if (this.size < this.capacity) {
      ++this.size;
      return void 0;
    }

    const currentTail = this.tail;
    const newTail = currentTail.prev;

    if (newTail) {
      newTail.next = null;
    }

    currentTail.prev = null;
    this.tail = newTail;

    return currentTail;
  }

  public refresh(node: LruNode) {
    if (node == this.head) {
      return;
    }

    if (!this.head) {
      throw new Error('LRU must not be empty when refreshing');
    }

    const prev = node.prev;
    const next = node.next;

    if (prev != null) {
      prev.next = next;
    }

    if (next != null) {
      next.prev = prev;
    }

    if (node == this.tail) {
      this.tail = prev;
    }

    node.prev = null;
    node.next = this.head;
    this.head.prev = node;
    this.head = node;
  }

  public purge() {
    this.head = this.tail = null;
    this.size = 0;
  }
}

export class LruContentCache implements ContentCache {
  private hashing = new Map<string, LruNode>();
  private lru: Lru;

  constructor(capacity: number) {
    this.lru = new Lru(capacity);
  }

  public putCache(hash: string, data: Uint8Array, needCopy: boolean) {
    let node = this.hashing.get(hash);

    if (node) {
      this.lru.refresh(node);
      return;
    }

    if (needCopy) {
      data = copyContent(data);
    }

    node = LruNode.alloc(hash, data);
    const evicted = this.lru.put(node);

    if (evicted) {
      this.hashing.delete(evicted.key);
      LruNode.free(evicted);
    }

    this.hashing.set(hash, node);

    return;
  }

  public getCache(hash: string): Uint8Array | undefined {
    const node = this.hashing.get(hash);

    if (node && node.value) {
      this.lru.refresh(node);
      return node.value;
    }

    return void 0;
  }

  public purge() {
    this.hashing.clear();
  }
}

export const DEFAULT_CONTENT_CACHE = new LruContentCache(2048);
