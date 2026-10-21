import type { GameClientState } from '../../game-client-schema';
import type {
  GetInputDialogConfig,
  GetInputDialogValue,
  SetInputDialogValue,
  IDialogInputController,
  IDialogInputControllerSpec,
} from './interface';

export class RustyInputController implements IDialogInputController {
  private state: GameClientState;
  private getConfig: GetInputDialogConfig;
  private getValue: GetInputDialogValue;
  private setValue: SetInputDialogValue;

  public inputElement?: RustyInputElement;

  constructor(spec: IDialogInputControllerSpec) {
    const { state, getConfig, getValue, setValue } = spec;

    this.state = state;
    this.getConfig = getConfig;
    this.getValue = getValue;
    this.setValue = setValue;
  }

  public open() {
    if (!window.RustyInputElement || this.inputElement) {
      return;
    }

    const inputElement = new window.RustyInputElement();

    this.inputElement = inputElement;

    this.inputElement.addEventListener('change', () => {
      this.setValue(inputElement.value);

      this.inputElement = undefined;
    });

    this.inputElement.addEventListener('cancel', () => {
      this.inputElement = undefined;
    });

    this.inputElement.open(
      this.getValue() || '',
      this.getConfig()?.placeholder || '',
      true,
    );
  }

  public close = () => {
    this.inputElement?.close();
    this.inputElement = undefined;
  };
}
