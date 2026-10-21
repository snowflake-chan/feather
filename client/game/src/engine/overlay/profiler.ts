import type { GameClientState } from '../game-client-schema';
import type { EngineProfiler } from '../profile/profiler';

export function drawProfiler(state: GameClientState, profiler: EngineProfiler) {
  const context2D = state.overlays.context;
  if (!context2D) {
    return;
  }

  const { width, height } = context2D.canvas;
  const ratio = window.devicePixelRatio || 1;
  const screenWidth = width / ratio;
  const screenHeight = height / ratio;

  context2D.font = '14px Montserrat-Regular';
  context2D.textAlign = 'right';
  context2D.textBaseline = 'bottom';
  context2D.fillStyle = '#EEE';

  const fps = profiler.getFps();

  context2D.fillText(
    `Max:${fps.maxFps}/Min:${fps.minFps}/${fps.avgFps}FPS`,
    screenWidth,
    screenHeight,
  );
}
