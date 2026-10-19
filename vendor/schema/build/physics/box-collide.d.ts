export declare class BoxRayHitResult {
    collides: boolean;
    t: number;
    axis: number;
}
export declare function boxRayIntersect(lox: number, loy: number, loz: number, hix: number, hiy: number, hiz: number, dx: number, dy: number, dz: number, ox: number, oy: number, oz: number): BoxRayHitResult;
export declare function boxRayIntersectRecip(lox: number, loy: number, loz: number, hix: number, hiy: number, hiz: number, invdx: number, invdy: number, invdz: number, ox: number, oy: number, oz: number): BoxRayHitResult;
export declare class BoxSweepSweepResult {
    collides: boolean;
    t: number;
    depth: number;
    axis: number;
    flip: boolean;
}
export declare function sweepSweepIntersect(ax0: number, ay0: number, az0: number, ax1: number, ay1: number, az1: number, axr: number, ayr: number, azr: number, bx0: number, by0: number, bz0: number, bx1: number, by1: number, bz1: number, bxr: number, byr: number, bzr: number): BoxSweepSweepResult;
export declare function boxSweepIntersect(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, rx: number, ry: number, rz: number, lx: number, ly: number, lz: number, hx: number, hy: number, hz: number, faces: number): BoxSweepSweepResult;
