import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AssetEntry } from '@box/schema/project/project-rda';
import { SerializedVec2 } from 'src/engine/interfaces';

export type ScriptManagerState = {
  scriptMenuInfo?: {
    menuPos: SerializedVec2;
    menuScriptId: string;
  };
  serverTabExpand: boolean;
  clientTabExpand: boolean;
  renameOptions?: {
    renameInfo?: { fileId: string; isShare: boolean };
    recoverInfo?: { key: string; value: AssetEntry };
    shareInfo?: { fileId: string };
  };
  removeId?: string;
  shareScriptId: string | undefined;
  unshareScriptId: string | undefined;
};

const initialState: ScriptManagerState = {
  serverTabExpand: true,
  clientTabExpand: true,
  shareScriptId: undefined,
  unshareScriptId: undefined,
};

export const scriptManagerSlice = createSlice({
  name: 'script-manager',
  initialState,
  reducers: {
    setScriptMenuInfo: (
      state,
      action: PayloadAction<ScriptManagerState['scriptMenuInfo']>,
    ) => {
      state.scriptMenuInfo = action.payload;
      return state;
    },
    setServerTabExpand: (
      state,
      action: PayloadAction<ScriptManagerState['serverTabExpand']>,
    ) => {
      state.serverTabExpand = action.payload;
      return state;
    },
    setClientTabExpand: (
      state,
      action: PayloadAction<ScriptManagerState['clientTabExpand']>,
    ) => {
      state.clientTabExpand = action.payload;
      return state;
    },
    setRenameOptions: (
      state,
      action: PayloadAction<ScriptManagerState['renameOptions']>,
    ) => {
      state.renameOptions = action.payload;
      return state;
    },
    setShareScriptId: (
      state,
      action: PayloadAction<ScriptManagerState['shareScriptId']>,
    ) => {
      state.shareScriptId = action.payload;
      return state;
    },
    setUnshareScriptId: (
      state,
      action: PayloadAction<ScriptManagerState['unshareScriptId']>,
    ) => {
      state.unshareScriptId = action.payload;
      return state;
    },

    setRemoveId: (
      state,
      action: PayloadAction<ScriptManagerState['removeId']>,
    ) => {
      state.removeId = action.payload;
      return state;
    },
  },
});

export const {
  setScriptMenuInfo,
  setServerTabExpand,
  setClientTabExpand,
  setRenameOptions,
  setRemoveId,
  setUnshareScriptId,
  setShareScriptId,
} = scriptManagerSlice.actions;
