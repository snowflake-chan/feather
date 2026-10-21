import { log2, nextPow2 } from 'bit-twiddle';

const pool: ArrayBuffer[][] = new Array(32);
for (let i = 0; i < 32; ++i) {
  pool[i] = [];
}

/**
 * Allocates a temporary ArrayBuffer of size at least sz.
 * @param size The size of the array to be allocated
 */
export function alloc(size: number): ArrayBuffer {
  const sz = nextPow2(size);
  const bin = pool[log2(sz)];
  const mem = bin.pop();
  if (mem) {
    return mem;
  } else {
    try {
      return new Uint8Array(sz).buffer;
    } catch (err) {
      // memory pool alloc with size failed, clear pool and try again.
      clearMemoryPool();
      return new Uint8Array(sz).buffer;
    }
  }
}

/**
 * Returns an ArrayBuffer to the memory pool
 * @param buffer The ArrayBuffer to be returned to the pool.
 */
export function free(buffer: ArrayBuffer) {
  pool[log2(buffer.byteLength)].push(buffer);
}

export function cloneU8(data: Uint8Array) {
  const sz = nextPow2(data.length);
  const bin = pool[log2(sz)];
  const mem = bin.pop();
  if (mem) {
    const result = new Uint8Array(mem);
    result.set(data);
    return result;
  } else {
    return new Uint8Array(data);
  }
}

export function clearMemoryPool() {
  for (let i = 0; i < pool.length; ++i) {
    pool[i].length = 0;
  }
}
