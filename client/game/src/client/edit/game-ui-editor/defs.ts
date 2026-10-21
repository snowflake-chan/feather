import type { UITree } from '@box/schema/project/ui-rda/defs';
import type { GameUIRenderable } from 'src/engine/game-ui/nodes/renderable';

export type GetUITree = () => UITree;

/**
 * 根据replica.project.uiTree全量更新节点树
 */
export type UpdateUITree = () => void;

export type GetRenderableNode = (
  nodeId: string,
) => GameUIRenderable | undefined;

export type GetDefaultScreenId = () => string;

export interface ISelectBox extends GameUIRenderable {
  /**
   * 是否更新绝对坐标数据
   * 进入拖拽状态时，禁止selectBox在beforeUpdateAbsData()中更新数据
   */
  shouldUpdateAbsData: boolean;
  /**
   * 是否显示选中框上的小方块
   * - 编辑文本框的文本时，需要隐藏小方块
   */
  cornersVisible: boolean;
}
