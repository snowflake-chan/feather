/**
 * @deprecated Region logic is removed. Use Feature Flags instead.
 */
export type Region = string;

/**
 * @deprecated Region logic is removed. Use Feature Flags instead.
 */
export function resolveRegion(hostname: string): Region {
  return 'CN';
}
