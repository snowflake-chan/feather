import { GameClientState } from '../game-client-schema';

export const vibrateDevice =
  typeof navigator !== 'undefined' && navigator.vibrate
    ? (id: number, state: GameClientState, pattern: number | number[]) => {
        if (state.settings.enableVibration && (!id || id === state.secret.id)) {
          try {
            navigator.vibrate(pattern);
          } catch (e) {}
        }
      }
    : (id: number, state: GameClientState, pattern: number | number[]) => {};
