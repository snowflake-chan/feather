import type { GameClientState } from 'src/engine/game-client-schema';

export class ScriptClientWorldController {
  constructor(private state: GameClientState) {}

  public setRendering3d(val: boolean) {
    this.state.rendering3d = val;
  }
  public getRendering3d() {
    return this.state.rendering3d;
  }

  public reset() {
    this.state.rendering3d = true;
  }
}
