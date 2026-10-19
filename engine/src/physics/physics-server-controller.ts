import { GameServerState } from '../game-server-schema';
import { PhysicsParamsSchema } from '@box/schema/physics/physics-schema';

export function tickServerPhysics(state: GameServerState) {
  if (state.sync) {
    PhysicsParamsSchema.assign(state.physics, state.project.physics);
  }
}
