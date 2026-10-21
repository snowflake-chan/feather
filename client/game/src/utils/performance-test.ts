/**
 * 将需要监控的对象放入，检查是否被回收
 */
export const DISPOSED_WEAK_SET = new WeakSet();

window['DISPOSED_WEAK_SET'] = DISPOSED_WEAK_SET;
