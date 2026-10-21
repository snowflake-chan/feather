import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ModelData } from 'src/views/edit/components/stage-area/edit-model-panel';

export type UiState = {
  gameObjectOn: boolean;
  isRunning: boolean;
  chat: boolean;
  editorUiShowStatus: boolean;
  selectedModel?: {
    mousePosition: {
      x: number;
      y: number;
    };
    modelData: ModelData;
  };
};

const initialState: UiState = {
  editorUiShowStatus: true,
  gameObjectOn: false,
  isRunning: false,
  chat: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setIsRunning: (state, action: PayloadAction<boolean>) => {
      state.isRunning = action.payload;
      return state;
    },
    setChat: (state, action: PayloadAction<boolean>) => {
      state.chat = action.payload;
      return state;
    },
    setUIState: (state, action: PayloadAction<Partial<UiState>>) => {
      Object.assign(state, action.payload);
      return state;
    },
    setSelectedModel: (
      state,
      action: PayloadAction<UiState['selectedModel']>,
    ) => {
      state.selectedModel = action.payload;
      return state;
    },
  },
});

export const { setSelectedModel, setIsRunning, setChat, setUIState } =
  uiSlice.actions;
