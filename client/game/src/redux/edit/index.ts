import { configureStore } from '@reduxjs/toolkit';
import { userSlice } from '../slices/user';
import { uiSlice } from './ui';
import { gameUISlice } from './game-ui';
import { creatorSlice } from './creator';
import { permissionSlice } from './permission';
import { seedsSlice } from './seeds';
import { playerSkinSlice } from './player-skin';
import { gamepadSkinSlice } from './gamepad-skin';
import { scriptManagerSlice } from './script-manager';

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    ui: uiSlice.reducer,
    gameUI: gameUISlice.reducer,
    creator: creatorSlice.reducer,
    permission: permissionSlice.reducer,
    seeds: seedsSlice.reducer,
    playerSkin: playerSkinSlice.reducer,
    gamePadSkin: gamepadSkinSlice.reducer,
    scriptManager: scriptManagerSlice.reducer,
  },
});

export const reduxDispatch = store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
