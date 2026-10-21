import { SortOrder } from '@box/apis';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PlayerSkin = {
  id: number;
  name: string;
  previewUrl: string;
  modelFileHash?: string;
};
export type PlayerSkinList = PlayerSkin[];

export type PlayerSkinState = {
  // 项目皮肤列表
  extensionSkins: PlayerSkinList;
  // 项目皮肤列表的排序方式
  sortBy: SortOrder;
  // 当前地图的默认皮肤Id
  defaultSkinId: number;
  searchName: string;
};

const initialState: PlayerSkinState = {
  extensionSkins: [],
  sortBy: SortOrder.ModifyTimeDesc,
  defaultSkinId: 0,
  searchName: '',
};

export const playerSkinSlice = createSlice({
  name: 'playerSkin',
  initialState,
  reducers: {
    setExtensionSkins: (state, action: PayloadAction<PlayerSkinList>) => {
      state.extensionSkins = action.payload;
      return;
    },
    setSortBy: (state, action: PayloadAction<SortOrder>) => {
      state.sortBy = action.payload;
      return;
    },
    setDefaultSkinId: (state, action: PayloadAction<number>) => {
      state.defaultSkinId = action.payload;
      return;
    },
    setSearchName: (state, action: PayloadAction<string>) => {
      state.searchName = action.payload;
      return;
    },
  },
});

export const { setExtensionSkins, setSortBy, setDefaultSkinId, setSearchName } =
  playerSkinSlice.actions;
