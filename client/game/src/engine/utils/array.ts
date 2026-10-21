export function isEqual(src, dest) {
  if (src.length !== dest.length) {
    return false;
  }
  for (let i = 0; i < src.length; i++) {
    if (src[i] !== dest[i]) {
      return false;
    }
  }
  return true;
}
