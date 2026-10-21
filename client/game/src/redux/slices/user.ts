import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState } from 'src/utils/user';

const initialState = {
  id: 0,
} as UserState;

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<UserState>) => {
      state = action.payload;
      return state;
    },
    updateUserInfo: (state, action: PayloadAction<Partial<UserState>>) => {
      Object.assign(state, action.payload);
      return state;
    },
  },
});

export const { setUserInfo, updateUserInfo } = userSlice.actions;
