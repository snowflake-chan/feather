import { configureStore } from '@reduxjs/toolkit';
import { userSlice } from '../slices/user';
import { gameSlice } from '../slices/game';
import { UIConfigSlice } from '../slices/UIConfig';

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    game: gameSlice.reducer,
    UIConfig: UIConfigSlice.reducer,
  },
});

export const reduxDispatch = store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
