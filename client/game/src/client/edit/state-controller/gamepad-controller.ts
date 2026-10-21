import { EditReplicaClient } from '../replica/replica-client';
import { ClientProjectTransaction } from '../replica/transaction/client-project-transaction';
import { ClientStateType } from '../edit-schema';
import { EditActionLabel } from '../replica/replica-client-schema';

export class GamepadController {
  private _tx: ClientProjectTransaction;

  constructor(_replica: EditReplicaClient, private _state: ClientStateType) {
    this._tx = _replica.projectTransaction();
  }

  public setJoystickBg = (value: string) => {
    this._tx
      .push((action) => action.gamepad.joystick.background(value))
      .commit(EditActionLabel.PROJECT, false);
  };

  public setJoystickCtrl = (value: string) => {
    this._tx
      .push((action) => action.gamepad.joystick.controller(value))
      .commit(EditActionLabel.PROJECT, false);
  };

  public setFlyBtn = (value: string) => {
    this._tx
      .push((action) => action.gamepad.fly.button(value))
      .commit(EditActionLabel.PROJECT, false);
  };

  public setFlyBg = (value: string) => {
    this._tx
      .push((action) => action.gamepad.fly.flyingBackground(value))
      .commit(EditActionLabel.PROJECT, false);
  };

  public setFlyCtrl = (value: string) => {
    this._tx
      .push((action) => action.gamepad.fly.flyingController(value))
      .commit(EditActionLabel.PROJECT, false);
  };

  public setJump = (value: string) => {
    this._tx
      .push((action) => action.gamepad.buttons.jump(value))
      .commit(EditActionLabel.PROJECT, false);
  };

  public setCrouch = (value: string) => {
    this._tx
      .push((action) => action.gamepad.buttons.crouch(value))
      .commit(EditActionLabel.PROJECT, false);
  };

  public setActionA = (value: string) => {
    this._tx
      .push((action) => action.gamepad.buttons.actionA(value))
      .commit(EditActionLabel.PROJECT, false);
  };

  public setActionB = (value: string) => {
    this._tx
      .push((action) => action.gamepad.buttons.actionB(value))
      .commit(EditActionLabel.PROJECT, false);
  };

  /**
   * 按键正在使用的图片资源被删除时，需要重置按键资源为空
   */
  public resetGamepadAssets = (deletedAssetName: string) => {
    const gamepad = this._state.replica.project.gamepad;
    for (let key in gamepad) {
      const btnGroup = gamepad[key];
      for (let btn in btnGroup) {
        if (btnGroup[btn] === deletedAssetName) {
          this._tx.push((action) => action.gamepad[key][btn](''));
        }
      }
    }
    this._tx.commit(EditActionLabel.PROJECT, false);
  };
}
