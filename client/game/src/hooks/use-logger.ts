import type { Logger } from 'pino';
import { useMemo } from 'react';
import { rootLogger } from '~/utils/logger';

/**
 * 获取带有特定命名空间的结构化日志记录器
 *
 * 基于全局 rootLogger 创建子 logger，
 * 自动添加 caller 上下文标识，便于日志追踪和调试
 *
 * @param caller 调用者标识（通常是组件名或模块名）
 * @returns Pino Logger 实例
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const logger = useLogger('MyComponent');
 *
 *   useEffect(() => {
 *     logger.info('Component mounted');
 *   }, []);
 * }
 * ```
 */
export function useLogger(caller: string): Logger {
  return useMemo(() => rootLogger.child({ caller }), [caller]);
}
