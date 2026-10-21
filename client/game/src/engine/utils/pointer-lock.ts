/**
 * 解锁指针，返回值表示document.exitPointerLock是否可调用
 */
export function exitPointerLock(): boolean {
  if (
    typeof document === 'undefined' ||
    typeof document.exitPointerLock === 'undefined'
  ) {
    return false;
  }

  document.exitPointerLock();

  return true;
}
