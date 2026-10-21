import { MuClientProtocol, MuClient } from '@box/mudb/client';
import { InteractProtocol } from '@box/schema/interact/interact-protocol';
import { GameClientState } from '../game-client-schema';
import { getById, zipId } from '@box/utils/id';
import { GameKeys } from '@box/schema/input/input-schema';
import { InputController } from '../input/input-controller';
import {
  ElementRect,
  clipPosToScreenPos,
  pixelToRay,
  worldPosToClipPos,
} from '../camera/camera-controller';
import {
  BodyRaycastSchema,
  raycastBoxes,
} from '@box/schema/physics/raycast-bodies';
import { RigidBody } from '@box/schema/physics/physics-schema';
import { playSoundEffectSpatial } from '../sound/client-sound-controller';
import { IKState } from '@box/schema/animation/ik-schema';
import { raycastPlayersByMeshBound } from '../player/player-raycast';
import { vec2, vec3 } from 'gl-matrix';
import { messenger } from 'src/messenger';
import { raycastEye } from '../utils/raycast-eye';
import type { GameMouseEvent } from '../input/events';
import type { RenderBox } from '@box/schema/render-box/schema';

const INTERACT_TIME_LIMIT = 4;
const CLIP_POS = vec3.create();
const SCREEN_POS = vec2.create();

export class InteractClient {
  public protocol: MuClientProtocol<typeof InteractProtocol>;
  public state: GameClientState;
  public input: InputController;
  public playerIntractable = true;

  private _fireInteract(id: number) {
    if (this.state.interact.interactLocked) {
      return;
    }
    const tick = this.state.clock.tick;
    if (this.state.interact.lastInteract + INTERACT_TIME_LIMIT < tick) {
      this.state.interact.interactLocked = true;
      this.state.interact.interacting = true;
      this.protocol.server.message.interact({ id, tick });
      this.state.interact.lastInteract = tick;

      // TODO: should push an event

      const sfx = getById(this.state.replica.sound.entitySound, id);
      if (sfx && sfx.interact.sampleId) {
        const box = getById(this.state.renderBoxes, id);
        if (box) {
          playSoundEffectSpatial(
            this.state,
            sfx.interact,
            box.anchorX,
            box.anchorY,
            box.anchorZ,
          );
        }
      }
    }
  }

  constructor(spec: {
    client: MuClient;
    state: GameClientState;
    input: InputController;
  }) {
    this.state = spec.state;
    this.input = spec.input;
    this.protocol = spec.client.protocol(InteractProtocol);
    this.protocol.configure({
      message: {
        acknowledgeInteract: () => {
          this.state.interact.interactLocked = false;
        },
        emoteEvent: (event) => {
          this.state.events.emote.push(event);
        },
      },
    });

    this.addListeners();
  }

  /**
   * 添加input模块的事件监听
   */
  private addListeners() {
    this.input.onKeyDown.sub((key) => {
      const { currentInteractive, nearbyInteractive } = this.state.interact;
      if (currentInteractive) {
        if (key === GameKeys.INTERACT) {
          this._fireInteract(currentInteractive);
        } else if (key === GameKeys.PREV_ENTITY) {
          const idx = nearbyInteractive.indexOf(currentInteractive);
          this.state.interact.currentInteractive =
            nearbyInteractive[
              (idx + nearbyInteractive.length - 1) % nearbyInteractive.length
            ];
        } else if (key === GameKeys.NEXT_ENTITY) {
          const idx = nearbyInteractive.indexOf(currentInteractive);
          this.state.interact.currentInteractive =
            nearbyInteractive[(idx + 1) % nearbyInteractive.length];
        }
      }
    });

    this.input.onKeyUp.sub((key) => {
      if (key === GameKeys.INTERACT && this.state.interact.interacting) {
        this.state.interact.interacting = false;
      }
    });

    this.input.singleTouchClick.sub((ev) => {
      const {
        mouse: [offsetX, offsetY],
        clientPosition: [clientX, clientY],
      } = ev;

      const triggered = this.triggerInteract({
        offsetX,
        offsetY,
      });

      if (triggered) {
        return;
      }

      this.onTriggerPlayer({
        offsetX,
        offsetY,
        clientX,
        clientY,
      });
    });

    this.input.touchEnd.sub(() => {
      if (this.state.interact.interacting) {
        this.state.interact.interacting = false;
      }
    });

    this.input.onPointerLockChange.sub((ev) => {
      if (ev.isLocked) {
        this.state.interact.hoveringPlayerId = 0;
      }
    });

    this.input.unlockedMouseMove.sub(this.onMouseMove);
    this.input.unlockedContextMenu.sub((evt) => {
      const {
        mouse: [offsetX, offsetY],
        clientPosition: [clientX, clientY],
      } = evt;

      this.onTriggerPlayer({
        offsetX,
        offsetY,
        clientX,
        clientY,
      });
    });
  }

  private raycastPlayers(ev: { offsetX: number; offsetY: number }) {
    const id = this.state.secret.id;
    const playerBox = getById(this.state.renderBoxes, id);
    if (!playerBox) {
      return;
    }
    const playersAnimation: IKState[] = [];
    zipId(
      (animation, box) => {
        const d = Math.sqrt(
          Math.pow(box.px - playerBox.px, 2) +
            Math.pow(box.py - playerBox.py, 2) +
            Math.pow(box.pz - playerBox.pz, 2),
        );
        if (d < 20) {
          playersAnimation.push(animation);
        }
      },
      this.state.animations,
      this.state.renderBoxes,
    );
    const ray = pixelToRay(this.state, ev.offsetX, ev.offsetY);
    const hitResult = BodyRaycastSchema.alloc();
    raycastPlayersByMeshBound(
      hitResult,
      playersAnimation,
      this.state.camera.eye[0],
      this.state.camera.eye[1],
      this.state.camera.eye[2],
      ray[0],
      ray[1],
      ray[2],
    );

    if (raycastEye(this.state, hitResult.hitPosition)) {
      return hitResult;
    }
    return;
  }

  private getBodyScreenRect(
    box: RenderBox,
    elementRect: ElementRect,
  ): ElementRect {
    const { px, py, pz, rx, ry, rz } = box;
    const min3 = [px - rx, py - ry, pz - rz];
    const max3 = [px + rx, py + ry, pz + rz];
    const lo: vec2 = [Infinity, Infinity];
    const hi: vec2 = [-Infinity, -Infinity];

    for (let i = 0; i < 8; i++) {
      const x = i & 1 ? max3[0] : min3[0];
      const y = i & 2 ? max3[1] : min3[1];
      const z = i & 4 ? max3[2] : min3[2];
      worldPosToClipPos(CLIP_POS, [x, y, z], this.state.camera);
      clipPosToScreenPos(SCREEN_POS, CLIP_POS, elementRect);

      vec2.min(lo, lo, SCREEN_POS);
      vec2.max(hi, hi, SCREEN_POS);
    }
    return {
      left: lo[0],
      top: lo[1],
      width: hi[0] - lo[0],
      height: hi[1] - lo[1],
    };
  }

  private onMouseMove = (ev: GameMouseEvent) => {
    if (!this.playerIntractable || ev.targets.length) {
      return;
    }
    const {
      mouse: [x, y],
    } = ev;
    const hitResult = this.raycastPlayers({ offsetX: x, offsetY: y });
    this.state.interact.hoveringPlayerId = 0;
    if (!hitResult) {
      return;
    }
    this.state.interact.hoveringPlayerId = hitResult.hitId;
    BodyRaycastSchema.free(hitResult);
  };

  private onTriggerPlayer = (ev: {
    offsetX: number;
    offsetY: number;
    clientX: number;
    clientY: number;
  }) => {
    if (!this.playerIntractable) {
      return false;
    }
    const hitResult = this.raycastPlayers(ev);
    if (!hitResult) {
      return false;
    }
    if (hitResult.hit) {
      const hitBox = getById(this.state.renderBoxes, hitResult.hitId);
      const hitPlayer = getById(this.state.replica.players, hitResult.hitId);
      const rect = this.state.dom.canvas?.getBoundingClientRect();
      if (!hitBox || !hitPlayer || !rect) {
        return false;
      }
      const bodyRect = this.getBodyScreenRect(hitBox, rect);
      messenger.messageTool.emitEvent('playerContextmenu', {
        id: this.state.secret.id,
        clientX: ev.clientX,
        clientY: ev.clientY,
        hitId: hitResult.hitId,
        hitUserId: hitPlayer.userId,
        hitName: hitPlayer.name,
        hitRect: bodyRect,
      });
      return true;
    }
    BodyRaycastSchema.free(hitResult);
    return false;
  };

  private triggerInteract = (ev: { offsetX: number; offsetY: number }) => {
    if (this.state.interact.interactLocked) {
      return;
    }
    const id = this.state.secret.id;
    const playerBox = getById(this.state.renderBoxes, id);
    if (!playerBox) {
      return;
    }
    const boxes: RenderBox[] = [];
    zipId(
      (box, interact) => {
        if (interact.id === this.state.secret.id) {
          return;
        }
        const d = Math.sqrt(
          Math.pow(box.px - playerBox.px, 2) +
            Math.pow(box.py - playerBox.py, 2) +
            Math.pow(box.pz - playerBox.pz, 2),
        );
        if (d < interact.radius) {
          boxes.push(box);
        }
      },
      this.state.renderBoxes,
      this.state.replica.interactive,
    );
    const ray = pixelToRay(this.state, ev.offsetX, ev.offsetY);
    const hitResult = BodyRaycastSchema.alloc();
    if (
      raycastBoxes(
        hitResult,
        boxes,
        this.state.camera.eye[0],
        this.state.camera.eye[1],
        this.state.camera.eye[2],
        ray[0],
        ray[1],
        ray[2],
        0,
      )
    ) {
      if (hitResult.hitId !== this.state.interact.currentInteractive) {
        this.state.interact.currentInteractive = hitResult.hitId;
      }
      this._fireInteract(hitResult.hitId);
      return true;
    }
    BodyRaycastSchema.free(hitResult);
    return false;
  };

  public tick() {
    const interactState = this.state.interact;
    interactState.nearbyInteractive.length = 0;

    const id = this.state.secret.id;
    const box = getById(this.state.renderBoxes, id);
    if (!box) {
      interactState.currentInteractive = 0;
      return;
    }

    let closestId = 0;
    let closestDistance = Infinity;
    zipId(
      (interact, targetBox) => {
        if (targetBox.id !== id) {
          const d = Math.sqrt(
            Math.pow(targetBox.px - box.px, 2) +
              Math.pow(targetBox.py - box.py, 2) +
              Math.pow(targetBox.pz - box.pz, 2),
          );
          if (d < interact.radius) {
            interactState.nearbyInteractive.push(targetBox.id);
            if (d < closestDistance) {
              closestDistance = d;
              closestId = targetBox.id;
            }
          }
        }
      },
      this.state.replica.interactive,
      this.state.renderBoxes,
    );

    if (
      interactState.nearbyInteractive.indexOf(
        interactState.currentInteractive,
      ) < 0
    ) {
      interactState.currentInteractive = closestId;
    }
  }
}
