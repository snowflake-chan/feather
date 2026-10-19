import { IKRig, IKPose, IKPoints, IKConfiguration } from './ik-schema';
export declare function solveIKPoints(outPoints: IKPoints, skeleton: IKRig, pose: IKPose, scale: number): void;
export declare function solveIKConfiguration(outPose: IKConfiguration, points: IKPoints, pose: IKPose): void;
//# sourceMappingURL=solve-ik.d.ts.map