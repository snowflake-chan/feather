export function initArray<T>(size: number, content: (i: number) => T) {
  const result = new Array<T>(size);
  for (let i = 0; i < size; ++i) {
    result[i] = content(i);
  }
  return result;
}

export function initArrayConstant<T>(size: number, x: T) {
  const result = new Array<T>(size);
  for (let i = 0; i < size; ++i) {
    result[i] = x;
  }
  return result;
}
