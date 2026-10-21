import { vec3 } from 'gl-matrix';
import { IKPose, IKPalette } from './ik-schema';
export declare function copyIK(dst: IKPose, src: IKPose): void;
export declare function scaleIKPose(outIK: IKPose, s: number): void;
export declare function clearV(v: vec3): void;
export declare function accumV(out: vec3, x: vec3, w: number): void;
export declare function scaleV(out: vec3, w: number): void;
export declare function normV(out: vec3): void;
export declare function mixIK(outIK: IKPose, poses: IKPose[], weights: number[], scale: number): void;
export declare function hermiteInterpolatePose(out: IKPose, keyframes: IKPose[], phase: number): void;
export declare function playEmotePose(out: {
    ikState: {
        groundEmotePhase: number;
        jitterPhase: number;
    };
    WEIGHTS: number[];
    BLENDS: IKPose[];
}, emoteInfo: {
    poses: IKPose[];
    rate: number;
    cycle: number;
}, palette: IKPalette, phase: number, dt: number, iterations?: number): void;
export declare function playCollapsePose(out: {
    ikState: {
        groundEmotePhase: number;
        jitterPhase: number;
    };
    WEIGHTS: number[];
    BLENDS: IKPose[];
}, palette: IKPalette, phase: number, dt: number, iterations?: number): void;
//# sourceMappingURL=compute-ik.d.ts.map