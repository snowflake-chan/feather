import { MuReadStream } from '@box/mudb/stream';
import { GameClientState } from '../game-client-schema';

export const PARTICLE_SIZE = 32;

export interface ParticleRenderer {
  initBuffer: (state: GameClientState) => void;
  updateParticleData: (
    state: GameClientState,
    stream: MuReadStream,
    count: number,
    offset: number,
  ) => void;
}
