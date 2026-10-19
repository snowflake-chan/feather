export declare class GameQuaternion {
    w: number;
    x: number;
    y: number;
    z: number;
    constructor(w: number, x: number, y: number, z: number);
    static rotationBetween(a: GameVector3, b: GameVector3): GameQuaternion;
    static fromAxisAngle(axis: GameVector3, rad: number): GameQuaternion;
    static fromEuler(x: number, y: number, z: number): GameQuaternion;
    set(w: number, x: number, y: number, z: number): GameQuaternion;
    copy(q: GameQuaternion): GameQuaternion;
    getAxisAngle(_q: GameQuaternion): {
        axis: GameVector3;
        angle: number;
    };
    rotateX(_rad: number): GameQuaternion;
    rotateY(_rad: number): GameQuaternion;
    rotateZ(_rad: number): GameQuaternion;
    dot(q: GameQuaternion): number;
    add(v: GameQuaternion): GameQuaternion;
    sub(v: GameQuaternion): GameQuaternion;
    angle(q: GameQuaternion): number;
    mul(q: GameQuaternion): GameQuaternion;
    inv(): GameQuaternion;
    div(q: GameQuaternion): GameQuaternion;
    slerp(q: GameQuaternion, n: number): GameQuaternion;
    mag(): number;
    sqrMag(): number;
    normalize(): GameQuaternion;
    equals(q: GameQuaternion): boolean;
    clone(): GameQuaternion;
    toString(): string;
}
export declare class GameVector3 {
    x: number;
    y: number;
    z: number;
    constructor(x: number, y: number, z: number);
    static fromPolar(mag: number, phi: number, theta: number): GameVector3;
    set(x: number, y: number, z: number): GameVector3;
    copy(v: GameVector3): GameVector3;
    add(v: GameVector3): GameVector3;
    sub(v: GameVector3): GameVector3;
    mul(v: GameVector3): GameVector3;
    div(v: GameVector3): GameVector3;
    addEq(v: GameVector3): GameVector3;
    subEq(v: GameVector3): GameVector3;
    mulEq(v: GameVector3): GameVector3;
    divEq(v: GameVector3): GameVector3;
    dot(v: GameVector3): number;
    cross(v: GameVector3): GameVector3;
    scale(n: number): GameVector3;
    clone(): GameVector3;
    lerp(v: GameVector3, n: number): GameVector3;
    mag(): number;
    sqrMag(): number;
    towards(v: GameVector3): GameVector3;
    distance(v: GameVector3): number;
    normalize(): GameVector3;
    angle(v: GameVector3): number;
    max(v: GameVector3): GameVector3;
    min(v: GameVector3): GameVector3;
    exactEquals(v: GameVector3): boolean;
    equals(v: GameVector3): boolean;
    toString(): string;
}
export declare class GameBounds3 {
    lo: GameVector3;
    hi: GameVector3;
    constructor(lo: GameVector3, hi: GameVector3);
    static fromPoints(...points: GameVector3[]): GameBounds3;
    intersect(b: GameBounds3): GameBounds3;
    contains(b: GameVector3): boolean;
    containsBounds(b: GameBounds3): boolean;
    intersects(b: GameBounds3): boolean;
    set(lox: number, loy: number, loz: number, hix: number, hiy: number, hiz: number): GameBounds3;
    copy(b: GameBounds3): GameBounds3;
    toString(): string;
}
export declare class GameRGBAColor {
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(r: number, g: number, b: number, a: number);
    set(r: number, g: number, b: number, a: number): GameRGBAColor;
    copy(c: GameRGBAColor): GameRGBAColor;
    add(rgba: GameRGBAColor): GameRGBAColor;
    sub(rgba: GameRGBAColor): GameRGBAColor;
    mul(rgba: GameRGBAColor): GameRGBAColor;
    div(rgba: GameRGBAColor): GameRGBAColor;
    addEq(rgba: GameRGBAColor): GameRGBAColor;
    subEq(rgba: GameRGBAColor): GameRGBAColor;
    mulEq(rgba: GameRGBAColor): GameRGBAColor;
    divEq(rgba: GameRGBAColor): GameRGBAColor;
    lerp(rgba: GameRGBAColor, n: number): GameRGBAColor;
    blendEq(rgb: GameRGBColor): GameRGBColor;
    equals(rgba: GameRGBAColor): boolean;
    clone(): GameRGBAColor;
    toString(): string;
}
export declare class GameRGBColor {
    r: number;
    g: number;
    b: number;
    static random(): GameRGBColor;
    constructor(r: number, g: number, b: number);
    set(r: number, g: number, b: number): GameRGBColor;
    copy(c: GameRGBColor): GameRGBColor;
    add(rgb: GameRGBColor): GameRGBColor;
    sub(rgb: GameRGBColor): GameRGBColor;
    mul(rgb: GameRGBColor): GameRGBColor;
    div(rgb: GameRGBColor): GameRGBColor;
    addEq(rgb: GameRGBColor): GameRGBColor;
    subEq(rgb: GameRGBColor): GameRGBColor;
    mulEq(rgb: GameRGBColor): GameRGBColor;
    divEq(rgb: GameRGBColor): GameRGBColor;
    lerp(rgb: GameRGBColor, n: number): GameRGBColor;
    equals(rgb: GameRGBColor): boolean;
    clone(): GameRGBColor;
    toRGBA(): GameRGBAColor;
    toString(): string;
}
//# sourceMappingURL=math.d.ts.map