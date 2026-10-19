import * as G from './global';

export * from './global';

/**
 * 约束客户端脚本全局环境，仅提供给项目内其他代码使用，因此单独抽一个文件输出。
 */
export type ClientGlobalThis = typeof G;
