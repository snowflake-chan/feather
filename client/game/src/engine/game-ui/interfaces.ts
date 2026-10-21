import type { LayoutData } from './nodes/interface';
import type { GameUINode } from './nodes/base';
import type { GameUIScreen } from './nodes/screen';

export type GetRoot = () => GameUIScreen;

/**
 * 获取父节点的渲染数据
 * 如果父节点不存在，或者父节点不是渲染节点，返回根渲染数据
 * 根渲染数据会在
 */
export type GetParentLayoutData = (node: GameUINode) => LayoutData;
