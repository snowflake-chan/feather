export enum AnimationPlaybackMode {
  FORWARD = 0,
  REVERSE = 1,
  MIRROR = 2,
  MIRROR_REVERSE = 3,
  WRAP = 4,
  WRAP_REVERSE = 5,
}

export enum KeyframeEaseMode {
  NONE,
  LINEAR,
  QUADRATIC,
  SINE,
  EXP,
  BACK,
  ELASTIC,
  BOUNCE,
  CIRCLE,
}

export interface GenericKeyframe {
  tick: number;
  easeIn: KeyframeEaseMode;
  easeOut: KeyframeEaseMode;
  components: any;
}

export interface GenericAnimation {
  id: number;
  targetId: number;

  // playback info
  startTick: number; // tick to start animation
  endTicks: number; // amount of extra ticks to add to animation before firing finish event
  cycleTicks: number; // animation length
  cyclePhase: number; // phase offset for start of animation
  cycleCount: number; // amount of loops
  playbackMode: AnimationPlaybackMode; // animation wrapping mode (repeat/mirror etc.)

  keyframes: GenericKeyframe[];
}
