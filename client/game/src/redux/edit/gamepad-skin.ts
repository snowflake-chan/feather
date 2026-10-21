import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum GamepadSkinType {
  JoystickBg,
  JoystickCtrl,
  FlyBtn,
  FlyBg,
  FlyCtrl,
  Jump,
  Crouch,
  ActionA,
  ActionB,
}

export type GamepadSkinState = {
  currEditType: GamepadSkinType;
  pictureLibraryVisible: boolean;
  resetModalVisible: boolean;
};

const initialState: GamepadSkinState = {
  currEditType: GamepadSkinType.JoystickBg,
  pictureLibraryVisible: false,
  resetModalVisible: false,
};

export const gamepadSkinSlice = createSlice({
  name: 'gamepad-skin',
  initialState,
  reducers: {
    setCurrEditType: (state, action: PayloadAction<GamepadSkinType>) => {
      state.currEditType = action.payload;
      return state;
    },
    setPictureLibraryVisible: (state, action: PayloadAction<boolean>) => {
      state.pictureLibraryVisible = action.payload;
      return state;
    },
    setResetModalVisible: (state, action: PayloadAction<boolean>) => {
      state.resetModalVisible = action.payload;
      return state;
    },
  },
});

export const {
  setCurrEditType,
  setPictureLibraryVisible,
  setResetModalVisible,
} = gamepadSkinSlice.actions;
