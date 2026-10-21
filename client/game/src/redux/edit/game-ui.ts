import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_SCREEN_ID } from '@box/schema/project/ui-rda/defs';
import { SerializedVec2 } from 'src/engine/interfaces';

export type GameUIState = {
  /**
   * 当前悬浮的UI元素id
   */
  hoveredId?: string;
  /**
   * 当前选中的UI元素id
   * 当选中的数量不为0时，表示正处于UI编辑状态
   */
  selectedIds: string[];
  /**
   * 当前展开的节点
   */
  expandedIds: string[];
  /**
   * UI右键菜单
   */
  contextMenu?: GameUIContextMenuState;
  /**
   * 正在重名的节点id
   */
  renamingNodeId?: string;
  /**
   * 全部UI元素是否可见
   * （控制按钮在ui列表搜索按钮旁边）
   */
  gameUIVisible: boolean;
  /**
   * 屏幕列表
   */
  screen: {
    listVisible: boolean;
    selectedScreenId?: string;
    renameModalInfo?: {
      id: string;
    };
    menuInfo?: {
      menuPos: SerializedVec2;
      screenId: string;
    };
    hiddenScreenIds: string[];
  };
};

export type GameUIContextMenuState = {
  position: [number, number];
  /**
   * 右键交互的节点，仅在内容区会传入
   */
  pointerDownNodeId?: string;
  /**
   * 内容区点击时为true
   */
  insideCanvas: boolean;
};

const initialState: GameUIState = {
  hoveredId: undefined,
  selectedIds: [],
  expandedIds: [DEFAULT_SCREEN_ID],
  contextMenu: undefined,
  gameUIVisible: true,
  screen: {
    listVisible: false,
    selectedScreenId: undefined,
    menuInfo: undefined,
    renameModalInfo: undefined,
    hiddenScreenIds: [],
  },
};

export const gameUISlice = createSlice({
  name: 'game-ui',
  initialState,
  reducers: {
    setHoveredId: (state, action: PayloadAction<GameUIState['hoveredId']>) => {
      state.hoveredId = action.payload;
      return state;
    },
    setSelectedIds: (
      state,
      action: PayloadAction<GameUIState['selectedIds']>,
    ) => {
      state.selectedIds = action.payload;
      return state;
    },
    setContextMenu: (
      state,
      action: PayloadAction<GameUIContextMenuState | undefined>,
    ) => {
      state.contextMenu = action.payload;
      return state;
    },
    setExpandedIds: (state, action: PayloadAction<string[]>) => {
      state.expandedIds = action.payload;
      return;
    },
    setExpandedId: (
      state,
      action: PayloadAction<{ id: string; isExpanded: boolean }>,
    ) => {
      const { id, isExpanded } = action.payload;

      const idx = state.expandedIds.indexOf(id);
      const isCurrentExpanded = idx > -1;

      if (isCurrentExpanded === isExpanded) {
        return;
      }

      if (isExpanded) {
        state.expandedIds.push(id);
      } else {
        state.expandedIds.splice(idx, 1);
      }
      return state;
    },
    setRenamingNodeId: (state, action: PayloadAction<string | undefined>) => {
      state.renamingNodeId = action.payload;
      return state;
    },
    setGameUIVisible: (state, action: PayloadAction<boolean>) => {
      state.gameUIVisible = action.payload;
      return state;
    },
    setGameUIScreenListVisible: (state, action: PayloadAction<boolean>) => {
      state.screen.listVisible = action.payload;
      return state;
    },
    setSelectedScreenId: (state, action: PayloadAction<string | undefined>) => {
      state.screen.selectedScreenId = action.payload;
      return state;
    },
    setScreenListMenuInfo: (
      state,
      action: PayloadAction<
        | {
            menuPos: SerializedVec2;
            screenId: string;
          }
        | undefined
      >,
    ) => {
      state.screen.menuInfo = action.payload;
      return state;
    },
    setScreenRenameModalInfo: (
      state,
      action: PayloadAction<{ id: string } | undefined>,
    ) => {
      state.screen.renameModalInfo = action.payload;
      return state;
    },
    setHiddenScreenIds: (state, action: PayloadAction<string[]>) => {
      state.screen.hiddenScreenIds = action.payload;
      return state;
    },
  },
});

export const {
  setHoveredId,
  setSelectedIds,
  setContextMenu,
  setExpandedId,
  setExpandedIds,
  setRenamingNodeId,
  setGameUIVisible,
  setGameUIScreenListVisible,
  setScreenListMenuInfo,
  setSelectedScreenId,
  setScreenRenameModalInfo,
  setHiddenScreenIds,
} = gameUISlice.actions;
