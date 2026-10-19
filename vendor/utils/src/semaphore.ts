class SemaphoreNode {
  constructor(
    public I: number,
    public F: () => void,
    public next: SemaphoreNode | null,
    public prev: SemaphoreNode | null,
  ) {}
}

export class Semaphore {
  private _head: SemaphoreNode | null = null;
  private _tail: SemaphoreNode | null = null;
  constructor(public counter: number = 1) {}

  // quick enter/spin lock: fast semaphore p()
  public spinP(I: number = 1) {
    if (this.counter >= I) {
      this.counter -= I;
      return true;
    }
    return false;
  }

  // wait
  public p(I: number = 1): Promise<void> {
    return new Promise((F) => {
      if (I <= this.counter) {
        this.counter -= I;
        return F();
      } else {
        const tail = this._tail;
        const node = new SemaphoreNode(I, F, null, tail);
        if (tail) {
          tail.next = node;
        } else {
          this._head = node;
        }
        this._tail = node;
      }
    });
  }

  // signal
  public v(X: number = 1) {
    this.counter += X;
    for (let node = this._head; !!node && this.counter > 0; ) {
      const { next, prev, I, F } = node;
      if (I <= this.counter) {
        this.counter -= I;
        if (!prev) {
          this._head = next;
        } else {
          prev.next = next;
        }
        if (!next) {
          this._tail = prev;
        } else {
          next.prev = prev;
        }
        node.next = node.prev = null;
        F();
      }
      node = next;
    }
  }
}
