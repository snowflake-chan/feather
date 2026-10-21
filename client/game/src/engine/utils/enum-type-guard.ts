/**
 * 传入枚举集合，生成枚举值类型判定的方法
 *
 * 🌰
 * enum A {}
 *
 * const isA = isEnumType(A);
 *
 * isA(val)
 *
 * @param e 枚举集合
 */
export function isEnumType<T extends object>(e: T) {
  const values = Object.values(e);

  return (token: any): token is T[keyof T] => values.includes(token);
}
