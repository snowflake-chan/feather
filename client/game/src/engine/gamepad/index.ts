import { GameClientState } from '../game-client-schema';
import {
  playerFlyState,
  PlayerFlyState,
  InputDirectionState,
} from '@box/schema/player/player-schema';
import { getById } from '@box/utils/id';

import { SerializedVec2 } from '../interfaces';
import { InputController } from '../input/input-controller';
import { ActionABtn, ActionBBtn, CrouchBtn, JumpBtn } from './buttons';
import { FlyBtn } from './fly';
import { Joystick } from './joystick';
import { GamepadBtn, Spec } from './interface';
import { GamepadButtons, gamepadButtonsPlayerFlagsMap } from './const';
import { ResourceController } from '../resource';
import {
  GameElementType,
  IntersectElementsFun,
  PointerEventType,
} from '../input/events';
import { setTransformByScale } from '../utils/canvas';

export class MobileGamepad {
  private state: GameClientState;
  private input: InputController;
  private resourceController: ResourceController;
  private setEvent3DPropagation: (propagation: boolean) => void;

  private getIsFlying = () => {
    const input = getById(this.state.playerInputs, this.state.secret.id);
    return !!(input && playerFlyState(input.state) === PlayerFlyState.FLYING);
  };

  private getPermission(name: GamepadButtons) {
    const player = getById(this.state.players, this.state.secret.id);
    if (!player) {
      return false;
    }

    if (name === GamepadButtons.Joystick) {
      return !(
        player.inputDirectionState & InputDirectionState.DISABLE_HORIZONTAL &&
        player.inputDirectionState & InputDirectionState.DISABLE_VERTICAL
      );
    }

    return !!(player.flags & gamepadButtonsPlayerFlagsMap[name]);
  }

  private buttons: GamepadBtn[] = [];

  private activeButtons: { [identifier: number]: GamepadBtn } = {};

  public intersectElements: IntersectElementsFun<GamepadBtn> = (
    out: GamepadBtn[],
    pos: SerializedVec2,
    eventType: PointerEventType,
    identifier?: number,
  ) => {
    if (eventType !== 'touchStart') {
      return true;
    }

    if (identifier !== undefined && this.activeButtons[identifier]) {
      out.push(this.activeButtons[identifier]);
    }

    this.intersectNodes(out, pos);
    return !out.length;
  };

  constructor(spec: Spec) {
    const { state, input, resourceController, setEvent3DPropagation } = spec;
    this.state = state;
    this.input = input;
    this.resourceController = resourceController;
    this.setEvent3DPropagation = setEvent3DPropagation;

    this.buttons.push(
      new Joystick(spec),
      new JumpBtn(spec),
      new ActionABtn(spec),
      new ActionBBtn(spec),
      new CrouchBtn(spec),
      new FlyBtn(spec, this.getIsFlying),
    );

    this.input.touchStart.sub((ev) => {
      const { touches } = ev;
      for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        if (this.activeButtons[touch.identifier]) {
          continue;
        }
        const btns = touch.targets.filter(
          (t) => t.elementType === GameElementType.Gamepad,
        );
        if (btns.length) {
          this.activeButtons[touch.identifier] = btns[0] as GamepadBtn;
          this.activeButtons[touch.identifier].onTouchStart?.(touch.mouse);
        }
      }

      const propagation = !Object.keys(this.activeButtons).length;
      this.setEvent3DPropagation(propagation);
    });

    this.input.touchMove.sub((ev) => {
      const { touches } = ev;
      for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        const activeBtn = this.activeButtons[touch.identifier];
        if (activeBtn) {
          activeBtn.onTouchMove?.(touch.movement);
        }
      }
    });

    this.input.touchEnd.sub((ev) => {
      const { touches } = ev;
      for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        const activeBtn = this.activeButtons[touch.identifier];
        if (activeBtn) {
          activeBtn.onTouchEnd?.();
          delete this.activeButtons[touch.identifier];
        }
      }
    });
  }

  private getScreenWH() {
    const ratio = window.devicePixelRatio || 1;
    return {
      screenWidth: (this.state.overlays.context?.canvas.width || 0) / ratio,
      screenHeight: (this.state.overlays.context?.canvas.height || 0) / ratio,
      ratio,
    };
  }

  private intersectNodes(out: GamepadBtn[], pos: SerializedVec2) {
    const { screenWidth, screenHeight } = this.getScreenWH();
    this.buttons.forEach((btn) => {
      if (!this.getPermission(btn.name)) {
        return;
      }

      if (
        (btn.name === GamepadButtons.Jump ||
          btn.name === GamepadButtons.Crouch) &&
        this.getIsFlying()
      ) {
        return;
      }

      const area = btn.getHitArea(screenWidth, screenHeight);
      if (
        pos[0] > area.x &&
        pos[0] < area.x + area.w &&
        pos[1] > area.y &&
        pos[1] < area.y + area.h
      ) {
        out.push(btn);
      }
    });
  }

  public render() {
    const context2D = this.state.overlays.context;
    if (!context2D) {
      return;
    }

    const { ratio, screenWidth, screenHeight } = this.getScreenWH();

    this.buttons.forEach((btn) => {
      if (!this.getPermission(btn.name)) {
        return;
      }

      if (
        (btn.name === GamepadButtons.Jump ||
          btn.name === GamepadButtons.Crouch) &&
        this.getIsFlying()
      ) {
        return;
      }

      setTransformByScale(context2D, ratio);

      btn.draw(context2D, screenWidth, screenHeight);
    });
  }
}
