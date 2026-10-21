import type { InputDialogConfig } from '@box/schema/dialog/dialog-protocol';
import type { GameClientState } from 'src/engine/game-client-schema';
import type { HitArea } from 'src/engine/input/events';

export type IDialogInputControllerSpec = {
  state: GameClientState;
  getConfig: GetInputDialogConfig;
  getValue: GetInputDialogValue;
  setValue: SetInputDialogValue;
};

export interface IDialogInputController {
  inputElement?: HTMLInputElement | RustyInputElement;
  open(area: HitArea): void;
  close(): void;
}

export type GetInputDialogConfig = () => InputDialogConfig | undefined;
export type GetInputDialogValue = () => string | undefined;
export type SetInputDialogValue = (value?: string) => void;
