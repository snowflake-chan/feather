import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SeedsState = {
  selectedTreeNodes: string[];
  expandedIds: string[];
  /**
   * 正在重名的节点id
   */
  renamingNodeId?: string;
  /**
   * 选中的节点中是否存在被锁定的实体
   */
  hasLockedSeedSelected: boolean;
  /**
   * 选中的实体节点的id
   */
  allSelectedSeeds: string[];
};
const initialState: SeedsState = {
  selectedTreeNodes: [],
  expandedIds: [],
  hasLockedSeedSelected: false,
  allSelectedSeeds: [],
};

export const seedsSlice = createSlice({
  name: 'seeds',
  initialState,
  reducers: {
    setSelectedTreeNodes: (state, action: PayloadAction<string[]>) => {
      state.selectedTreeNodes = action.payload;
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
    setSeedState: (
      state,
      {
        payload: { hasLockedSeedSelected, allSelectedSeeds },
      }: PayloadAction<{
        hasLockedSeedSelected: SeedsState['hasLockedSeedSelected'];
        allSelectedSeeds: SeedsState['allSelectedSeeds'];
      }>,
    ) => {
      state.allSelectedSeeds = allSelectedSeeds;
      state.hasLockedSeedSelected = hasLockedSeedSelected;
      return state;
    },
  },
});

export const {
  setSelectedTreeNodes,
  setExpandedIds,
  setExpandedId,
  setRenamingNodeId,
  setSeedState,
} = seedsSlice.actions;
