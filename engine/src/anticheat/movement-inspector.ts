export interface MovementSample {
  playerId: number;
  from: { x: number; y: number; z: number };
  to: { x: number; y: number; z: number };
  elapsedMs: number;
  velocity: { from: { x: number; y: number; z: number }; to: { x: number; y: number; z: number } };
  inputTick: number;
  serverTick: number;
  mode: 'edit' | 'play';
}
type Inspector = (sample: MovementSample, complete: (allow: boolean) => void) => boolean;
const inspectors = new WeakMap<object, Inspector>();
export function setMovementInspector(state: object, inspector: Inspector) {
  inspectors.set(state, inspector);
}
/** false means no listener: preserve the ordinary synchronous movement path. */
export function inspectMovement(state: object, sample: MovementSample, complete: (allow: boolean) => void): boolean {
  return inspectors.get(state)?.(sample, complete) || false;
}
