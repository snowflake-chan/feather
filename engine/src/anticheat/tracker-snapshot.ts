import type { ClientMessageData } from '@box/schema/api/js/anticheat';

/** Copy small map-authored evidence, never keep references to incoming packets or world entities. */
export function trackerSnapshot(data: ClientMessageData): ClientMessageData {
  let nodes = 0;
  const clone = (value: unknown, depth: number): ClientMessageData => {
    if (++nodes > 2048 || depth > 16) throw new Error('反作弊记录过大或嵌套过深');
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      if (value.length > 16384) throw new Error('单条反作弊记录过大');
      return value;
    }
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (!value || typeof value !== 'object') throw new Error('反作弊记录只接受有限数值和 JSON 数据');
    if (Array.isArray(value)) {
      if (value.length > 2048) throw new Error('反作弊记录数组过大');
      return Object.freeze(Array.from({ length: value.length }, (_, index) => {
        const property = Object.getOwnPropertyDescriptor(value, index);
        if (!property || !('value' in property)) throw new Error('反作弊记录数组不接受空项或 getter/setter');
        return clone(property.value, depth + 1);
      }));
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) throw new Error('请记录必要字段，不要传入玩家、实体或其他类实例');
    const fields = Object.getOwnPropertyDescriptors(value);
    return Object.freeze(Object.fromEntries(Object.entries(fields).map(([key, property]) => {
      if (!('value' in property)) throw new Error('反作弊记录不接受 getter/setter');
      return [key, clone(property.value, depth + 1)];
    })));
  };
  const snapshot = clone(data, 0);
  if (JSON.stringify(snapshot).length > 16384) throw new Error('单条反作弊记录不能超过 16384 个字符');
  return snapshot;
}
