export declare enum AnimationPlaybackMode {
    FORWARD = 0,
    REVERSE = 1,
    MIRROR = 2,
    MIRROR_REVERSE = 3,
    WRAP = 4,
    WRAP_REVERSE = 5
}
export declare enum KeyframeEaseMode {
    NONE = 0,
    LINEAR = 1,
    QUADRATIC = 2,
    SINE = 3,
    EXP = 4,
    BACK = 5,
    ELASTIC = 6,
    BOUNCE = 7,
    CIRCLE = 8
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
    startTick: number;
    endTicks: number;
    cycleTicks: number;
    cyclePhase: number;
    cycleCount: number;
    playbackMode: AnimationPlaybackMode;
    keyframes: GenericKeyframe[];
}
