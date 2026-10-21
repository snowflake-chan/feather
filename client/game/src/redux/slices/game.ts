import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type GameState = {
  isAllowGuest: boolean;
};

const initialState = {
  isAllowGuest: true,
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameInfo: (state, action: PayloadAction<Partial<GameState>>) => {
      Object.assign(state, action.payload);
      return state;
    },
  },
});

export const { setGameInfo } = gameSlice.actions;
