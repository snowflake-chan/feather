import REGL from 'regl';
import { REGLLoader } from '../regl';
import glBox from './debug-box';
import glArrow from './debug-arrow';
import glText from '../text';
import {
  playerButtonState,
  playerFlyState,
  playerJumpState,
  playerWalkState,
  playerStateBits,
  PlayerFlyState,
  PlayerButtonState,
  PlayerJumpState,
  PlayerWalkState,
  PlayerInputSet,
  Player,
  PlayerOccupancyFlags,
} from '@box/schema/player/player-schema';
import { GameClientState } from '../../game-client-schema';
import { RigidBodySet } from '@box/schema/physics/physics-schema';
import { zipId } from '@box/utils/id';

export default function (regl: REGL.Regl, loader: REGLLoader) {
  const text = loader.require(glText);
  const arrow = loader.require(glArrow);
  const box = loader.require(glBox);

  return function (
    state: GameClientState,
    inputs: PlayerInputSet,
    bodies: RigidBodySet,
    players: Player[],
    color: number[],
  ) {
    zipId(
      (input, body, player) => {
        const fly = playerFlyState(input.state);
        const jump = playerJumpState(input.state);
        const walk = playerWalkState(input.state);
        const buttons = playerButtonState(input.state);

        const stateStr: string[] = [
          PlayerFlyState[fly],
          PlayerWalkState[walk],
          PlayerJumpState[jump],
        ];
        for (let i = 1; i <= buttons; i <<= 1) {
          if (buttons & i) {
            stateStr.push(PlayerButtonState[i]);
          }
        }
        text.text3D(
          state.camera.viewProjection,
          `${input.id}: ${Math.round(
            (input.angle / 256) * 360,
          )} ${stateStr.join('\n')}`,
          body.getPosition(),
          {
            color: color,
            size: 4,
          },
        );

        // render occupancy
        // const occupancy = player.occupancy;
        // if (occupancy & PlayerOccupancyFlags.STEP_X_NEG) {
        //     arrow({
        //         origin: body.getPosition(),
        //         direction: [-1, 1, 0],
        //         color,
        //     });
        // }
        // if (occupancy & PlayerOccupancyFlags.EDGE_X_NEG) {
        //     arrow({
        //         origin: body.getPosition(),
        //         direction: [-1, -1, 0],
        //         color,
        //     });
        // }
        // if (occupancy & PlayerOccupancyFlags.STEP_X_POS) {
        //     arrow({
        //         origin: body.getPosition(),
        //         direction: [1, 1, 0],
        //         color,
        //     });
        // }
        // if (occupancy & PlayerOccupancyFlags.EDGE_X_POS) {
        //     arrow({
        //         origin: body.getPosition(),
        //         direction: [1, -1, 0],
        //         color,
        //     });
        // }

        // if (occupancy & PlayerOccupancyFlags.STEP_Z_NEG) {
        //     arrow({
        //         origin: body.getPosition(),
        //         direction: [0, 1, -1],
        //         color,
        //     });
        // }
        // if (occupancy & PlayerOccupancyFlags.EDGE_Z_NEG) {
        //     arrow({
        //         origin: body.getPosition(),
        //         direction: [0, -1, -1],
        //         color,
        //     });
        // }
        // if (occupancy & PlayerOccupancyFlags.STEP_Z_POS) {
        //     arrow({
        //         origin: body.getPosition(),
        //         direction: [0, 1, 1],
        //         color,
        //     });
        // }
        // if (occupancy & PlayerOccupancyFlags.EDGE_Z_POS) {
        //     arrow({
        //         origin: body.getPosition(),
        //         direction: [0, -1, 1],
        //         color,
        //     });
        // }
      },
      inputs,
      bodies,
      players,
    );
  };
}
