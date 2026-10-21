import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UIConfigState = {
  menu: boolean;
  lowFrameRate: boolean;
  showStore: boolean;
  settings: boolean;
};

const initialState: UIConfigState = {
  menu: false,
  lowFrameRate: false,
  showStore: false,
  settings: false,
};

export const UIConfigSlice = createSlice({
  name: 'UIConfig',
  initialState,
  reducers: {
    setUIConfig: (state, action: PayloadAction<Partial<UIConfigState>>) => {
      Object.assign(state, action.payload);
      return state;
    },
  },
});

export const { setUIConfig } = UIConfigSlice.actions;
