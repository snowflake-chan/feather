const EPSILON = 0.000001;
export class GameQuaternion {
  constructor(
    public w: number,
    public x: number,
    public y: number,
    public z: number,
  ) {}

  public static rotationBetween(
    a: GameVector3,
    b: GameVector3,
  ): GameQuaternion {
    const dot = a.dot(b);
    let tmpvec3;
    if (dot < -0.999999) {
      tmpvec3 = new GameVector3(1, 0, 0).cross(a);
      if (tmpvec3.mag() < EPSILON) {
        tmpvec3 = new GameVector3(0, 1, 0).cross(a);
      }
      tmpvec3 = tmpvec3.normalize();
      return GameQuaternion.fromAxisAngle(tmpvec3, Math.PI);
    } else if (dot > 0.999999) {
      return new GameQuaternion(1, 0, 0, 0);
    } else {
      tmpvec3 = a.cross(b);

      return new GameQuaternion(
        1 + dot,
        tmpvec3.x,
        tmpvec3.y,
        tmpvec3.z,
      ).normalize();
    }
  }

  public static fromAxisAngle(axis: GameVector3, rad: number): GameQuaternion {
    rad = rad * 0.5;
    const s = Math.sin(rad);
    return new GameQuaternion(
      Math.cos(rad),
      s * axis.x,
      s * axis.y,
      s * axis.z,
    );
  }

  public static fromEuler(x: number, y: number, z: number): GameQuaternion {
    const halfToRad = (0.5 * Math.PI) / 180.0;
    x *= halfToRad;
    y *= halfToRad;
    z *= halfToRad;

    const sx = Math.sin(x);
    const cx = Math.cos(x);
    const sy = Math.sin(y);
    const cy = Math.cos(y);
    const sz = Math.sin(z);
    const cz = Math.cos(z);

    return new GameQuaternion(
      cx * cy * cz + sx * sy * sz,
      sx * cy * cz - cx * sy * sz,
      cx * sy * cz + sx * cy * sz,
      cx * cy * sz - sx * sy * cz,
    );
  }

  public set(w: number, x: number, y: number, z: number): GameQuaternion {
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  public copy(q: GameQuaternion): GameQuaternion {
    this.w = q.w;
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    return this;
  }

  public getAxisAngle(_q: GameQuaternion): {
    axis: GameVector3;
    angle: number;
  } {
    const q = _q.normalize();
    const angle = Math.acos(q.w) * 2.0;
    const s = Math.sin(angle / 2.0);
    let axis: GameVector3;

    if (s > EPSILON) {
      axis = new GameVector3(q.x / s, q.y / s, q.z / s);
    } else {
      axis = new GameVector3(1, 0, 0);
    }
    return { axis, angle };
  }

  public rotateX(_rad: number): GameQuaternion {
    const aw = this.w;
    const ax = this.x;
    const ay = this.y;
    const az = this.z;
    const rad = 0.5 * _rad;
    const bx = Math.sin(rad);
    const bw = Math.cos(rad);
    return new GameQuaternion(
      aw * bw - ax * bx,
      ax * bw + aw * bx,
      ay * bw + az * bx,
      az * bw - ay * bx,
    );
  }

  public rotateY(_rad: number): GameQuaternion {
    const aw = this.w;
    const ax = this.x;
    const ay = this.y;
    const az = this.z;
    const rad = 0.5 * _rad;
    const by = Math.sin(rad);
    const bw = Math.cos(rad);
    return new GameQuaternion(
      aw * bw - ay * by,
      ax * bw - az * by,
      ay * bw + aw * by,
      az * bw + ax * by,
    );
  }

  public rotateZ(_rad: number): GameQuaternion {
    const aw = this.w;
    const ax = this.x;
    const ay = this.y;
    const az = this.z;
    const rad = 0.5 * _rad;
    const bz = Math.sin(rad);
    const bw = Math.cos(rad);
    return new GameQuaternion(
      aw * bw - az * bz,
      ax * bw + ay * bz,
      ay * bw - ax * bz,
      az * bw + aw * bz,
    );
  }

  public dot(q: GameQuaternion): number {
    return this.w * q.w + this.x * q.x + this.y * q.y + this.z * q.z;
  }

  public add(v: GameQuaternion): GameQuaternion {
    return new GameQuaternion(
      this.w + v.w,
      this.x + v.x,
      this.y + v.y,
      this.z + v.z,
    );
  }

  public sub(v: GameQuaternion): GameQuaternion {
    return new GameQuaternion(
      this.w - v.w,
      this.x - v.x,
      this.y - v.y,
      this.z - v.z,
    );
  }

  public angle(q: GameQuaternion): number {
    const dotproduct = this.dot(q);
    return Math.acos(2 * dotproduct * dotproduct - 1);
  }

  public mul(q: GameQuaternion): GameQuaternion {
    const ax = this.x;
    const ay = this.y;
    const az = this.z;
    const aw = this.w;
    const bx = q.x;
    const by = q.y;
    const bz = q.z;
    const bw = q.w;

    return new GameQuaternion(
      aw * bw - ax * bx - ay * by - az * bz,
      ax * bw + aw * bx + ay * bz - az * by,
      ay * bw + aw * by + az * bx - ax * bz,
      az * bw + aw * bz + ax * by - ay * bx,
    );
  }

  public inv(): GameQuaternion {
    const a0 = this.x;
    const a1 = this.y;
    const a2 = this.z;
    const a3 = this.w;
    const dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
    let r = dot;
    if (Math.abs(r) > EPSILON) {
      r = 1 / r;
    }
    return new GameQuaternion(a3 * r, -a0 * r, -a1 * r, -a2 * r);
  }

  public div(q: GameQuaternion): GameQuaternion {
    return this.mul(q.inv());
  }

  public slerp(q: GameQuaternion, n: number): GameQuaternion {
    const aw = this.w;
    const ax = this.x;
    const ay = this.y;
    const az = this.z;
    let bw = q.w;
    let bx = q.x;
    let by = q.y;
    let bz = q.z;
    let omega;
    let cosomg;
    let sinomg;
    let scale0;
    let scale1;

    cosomg = ax * bx + ay * by + az * bz + aw * bw;

    if (cosomg < 0.0) {
      cosomg = -cosomg;
      bx = -bx;
      by = -by;
      bz = -bz;
      bw = -bw;
    }

    if (1.0 - cosomg > EPSILON) {
      omega = Math.acos(cosomg);
      sinomg = Math.sin(omega);
      scale0 = Math.sin((1.0 - n) * omega) / sinomg;
      scale1 = Math.sin(n * omega) / sinomg;
    } else {
      scale0 = 1.0 - n;
      scale1 = n;
    }

    return new GameQuaternion(
      scale0 * aw + scale1 * bw,
      scale0 * ax + scale1 * bx,
      scale0 * ay + scale1 * by,
      scale0 * az + scale1 * bz,
    );
  }

  public mag(): number {
    return Math.sqrt(this.dot(this));
  }

  public sqrMag(): number {
    return this.dot(this);
  }

  public normalize(): GameQuaternion {
    const w = this.w;
    const x = this.x;
    const y = this.y;
    const z = this.z;
    let r = this.dot(this);
    if (r > 0) {
      r = 1 / Math.sqrt(r);
    }
    return new GameQuaternion(r * w, r * x, r * y, r * z);
  }

  public equals(q: GameQuaternion): boolean {
    return (
      Math.abs(this.w - q.w) < EPSILON &&
      Math.abs(this.x - q.x) < EPSILON &&
      Math.abs(this.y - q.y) < EPSILON &&
      Math.abs(this.z - q.z) < EPSILON
    );
  }

  public clone(): GameQuaternion {
    return new GameQuaternion(this.w, this.x, this.y, this.z);
  }

  public toString(): string {
    return `{ w:${this.w}, x:${this.x}, y:${this.y}, z:${this.z} }`;
  }
}

export class GameVector3 {
  constructor(public x: number, public y: number, public z: number) {}

  public static fromPolar(
    mag: number,
    phi: number,
    theta: number,
  ): GameVector3 {
    return new GameVector3(
      mag * Math.sin(theta) * Math.sin(phi),
      mag * Math.cos(theta),
      mag * Math.sin(theta) * Math.cos(phi),
    );
  }

  public set(x: number, y: number, z: number): GameVector3 {
    this.x = +x;
    this.y = +y;
    this.z = +z;
    return this;
  }

  public copy(v: GameVector3): GameVector3 {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  public add(v: GameVector3): GameVector3 {
    return new GameVector3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  public sub(v: GameVector3): GameVector3 {
    return new GameVector3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  public mul(v: GameVector3): GameVector3 {
    return new GameVector3(this.x * v.x, this.y * v.y, this.z * v.z);
  }

  public div(v: GameVector3): GameVector3 {
    return new GameVector3(
      v.x === 0 ? 0 : this.x / v.x,
      v.y === 0 ? 0 : this.y / v.y,
      v.z === 0 ? 0 : this.z / v.z,
    );
  }

  public addEq(v: GameVector3): GameVector3 {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  public subEq(v: GameVector3): GameVector3 {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  public mulEq(v: GameVector3): GameVector3 {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    return this;
  }

  public divEq(v: GameVector3): GameVector3 {
    this.x = v.x === 0 ? 0 : this.x / v.x;
    this.y = v.y === 0 ? 0 : this.y / v.y;
    this.z = v.z === 0 ? 0 : this.z / v.z;
    return this;
  }

  public dot(v: GameVector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  public cross(v: GameVector3): GameVector3 {
    return new GameVector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x,
    );
  }

  public scale(n: number): GameVector3 {
    return new GameVector3(this.x * n, this.y * n, this.z * n);
  }

  public clone(): GameVector3 {
    return new GameVector3(this.x, this.y, this.z);
  }

  public lerp(v: GameVector3, n: number): GameVector3 {
    return new GameVector3(
      this.x + (v.x - this.x) * n,
      this.y + (v.y - this.y) * n,
      this.z + (v.z - this.z) * n,
    );
  }

  public mag(): number {
    return Math.sqrt(this.dot(this));
  }

  public sqrMag(): number {
    return this.dot(this);
  }

  public towards(v: GameVector3): GameVector3 {
    return v.sub(this);
  }

  public distance(v: GameVector3): number {
    return this.sub(v).mag();
  }

  public normalize(): GameVector3 {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    let r = x * x + y * y + z * z;
    if (r > 0) {
      r = 1 / Math.sqrt(r);
    }
    return new GameVector3(x * r, y * r, z * r);
  }

  public angle(v: GameVector3): number {
    let r = v.sqrMag() * this.sqrMag();
    if (r > 0) {
      r = 1 / Math.sqrt(r);
    }
    const cos = r * this.dot(v);
    if (1 < cos) {
      return 0;
    } else if (cos < -1) {
      return Math.PI;
    } else {
      return Math.acos(cos);
    }
  }

  public max(v: GameVector3): GameVector3 {
    return new GameVector3(
      Math.max(this.x, v.x),
      Math.max(this.y, v.y),
      Math.max(this.z, v.z),
    );
  }

  public min(v: GameVector3): GameVector3 {
    return new GameVector3(
      Math.min(this.x, v.x),
      Math.min(this.y, v.y),
      Math.min(this.z, v.z),
    );
  }

  public exactEquals(v: GameVector3): boolean {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  }

  public equals(v: GameVector3): boolean {
    return (
      Math.abs(this.x - v.x) < EPSILON &&
      Math.abs(this.y - v.y) < EPSILON &&
      Math.abs(this.z - v.z) < EPSILON
    );
  }

  public toString(): string {
    return `{ x:${this.x}, y:${this.y}, z:${this.z} }`;
  }
}

export class GameBounds3 {
  constructor(public lo: GameVector3, public hi: GameVector3) {}

  public static fromPoints(...points: GameVector3[]): GameBounds3 {
    const lo = new GameVector3(Infinity, Infinity, Infinity);
    const hi = new GameVector3(-Infinity, -Infinity, -Infinity);
    for (let i = 0; i < points.length; ++i) {
      const p = points[i];
      lo.x = Math.min(lo.x, p.x);
      lo.y = Math.min(lo.y, p.y);
      lo.z = Math.min(lo.z, p.z);

      hi.x = Math.max(hi.x, p.x);
      hi.y = Math.max(hi.y, p.y);
      hi.z = Math.max(hi.z, p.z);
    }
    return new GameBounds3(lo, hi);
  }

  public intersect(b: GameBounds3): GameBounds3 {
    return new GameBounds3(this.lo.max(b.lo), this.hi.min(b.hi));
  }

  public contains(b: GameVector3): boolean {
    return !(
      b.x < this.lo.x ||
      b.x > this.hi.x ||
      b.y < this.lo.y ||
      b.y > this.hi.y ||
      b.z < this.lo.z ||
      b.z > this.hi.z
    );
  }

  public containsBounds(b: GameBounds3): boolean {
    return !(
      b.lo.x < this.lo.x ||
      b.hi.x > this.hi.x ||
      b.lo.y < this.lo.y ||
      b.hi.y > this.hi.y ||
      b.lo.z < this.lo.z ||
      b.hi.z > this.hi.z
    );
  }

  public intersects(b: GameBounds3): boolean {
    return (
      this.lo.x < b.hi.x &&
      b.lo.x < this.hi.x &&
      this.lo.y < b.hi.y &&
      b.lo.y < this.hi.y &&
      this.lo.z < b.hi.z &&
      b.lo.z < this.hi.z
    );
  }

  public set(
    lox: number,
    loy: number,
    loz: number,
    hix: number,
    hiy: number,
    hiz: number,
  ): GameBounds3 {
    this.lo.x = lox;
    this.lo.y = loy;
    this.lo.z = loz;
    this.hi.x = hix;
    this.hi.y = hiy;
    this.hi.z = hiz;
    return this;
  }

  public copy(b: GameBounds3): GameBounds3 {
    this.lo.copy(b.lo);
    this.hi.copy(b.hi);
    return this;
  }

  public toString(): string {
    return `{ lo:${this.lo.toString()}, hi:${this.hi.toString()} }`;
  }
}

export class GameRGBAColor {
  constructor(
    public r: number,
    public g: number,
    public b: number,
    public a: number,
  ) {}

  public set(r: number, g: number, b: number, a: number): GameRGBAColor {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    return this;
  }

  public copy(c: GameRGBAColor): GameRGBAColor {
    this.r = c.r;
    this.g = c.g;
    this.b = c.b;
    this.a = c.a;
    return this;
  }

  public add(rgba: GameRGBAColor): GameRGBAColor {
    return new GameRGBAColor(
      this.r + rgba.r,
      this.g + rgba.g,
      this.b + rgba.b,
      this.a + rgba.a,
    );
  }

  public sub(rgba: GameRGBAColor): GameRGBAColor {
    return new GameRGBAColor(
      this.r - rgba.r,
      this.g - rgba.g,
      this.b - rgba.b,
      this.a - rgba.a,
    );
  }

  public mul(rgba: GameRGBAColor): GameRGBAColor {
    return new GameRGBAColor(
      this.r * rgba.r,
      this.g * rgba.g,
      this.b * rgba.b,
      this.a * rgba.a,
    );
  }

  public div(rgba: GameRGBAColor): GameRGBAColor {
    return new GameRGBAColor(
      rgba.r === 0 ? 0 : this.r / rgba.r,
      rgba.g === 0 ? 0 : this.g / rgba.g,
      rgba.b === 0 ? 0 : this.b / rgba.b,
      rgba.a === 0 ? 0 : this.a / rgba.a,
    );
  }

  public addEq(rgba: GameRGBAColor): GameRGBAColor {
    this.r += rgba.r;
    this.g += rgba.g;
    this.b += rgba.b;
    this.a += rgba.a;
    return this;
  }

  public subEq(rgba: GameRGBAColor): GameRGBAColor {
    this.r -= rgba.r;
    this.g -= rgba.g;
    this.b -= rgba.b;
    this.a -= rgba.a;
    return this;
  }

  public mulEq(rgba: GameRGBAColor): GameRGBAColor {
    this.r *= rgba.r;
    this.g *= rgba.g;
    this.b *= rgba.b;
    this.a *= rgba.a;
    return this;
  }

  public divEq(rgba: GameRGBAColor): GameRGBAColor {
    this.r = rgba.r === 0 ? 0 : this.r / rgba.r;
    this.g = rgba.g === 0 ? 0 : this.g / rgba.g;
    this.b = rgba.b === 0 ? 0 : this.b / rgba.b;
    this.a = rgba.a === 0 ? 0 : this.a / rgba.a;
    return this;
  }

  public lerp(rgba: GameRGBAColor, n: number): GameRGBAColor {
    return new GameRGBAColor(
      this.r + (rgba.r - this.r) * n,
      this.g + (rgba.g - this.g) * n,
      this.b + (rgba.b - this.b) * n,
      this.a + (rgba.a - this.a) * n,
    );
  }

  public blendEq(rgb: GameRGBColor): GameRGBColor {
    const a = this.a;
    const c = 1.0 - a;
    return new GameRGBColor(
      c * rgb.r + a * this.r,
      c * rgb.g + a * this.g,
      c * rgb.b + a * this.b,
    );
  }

  public equals(rgba: GameRGBAColor): boolean {
    return (
      Math.abs(this.r - rgba.r) < EPSILON &&
      Math.abs(this.g - rgba.g) < EPSILON &&
      Math.abs(this.b - rgba.b) < EPSILON &&
      Math.abs(this.a - rgba.a) < EPSILON
    );
  }

  public clone(): GameRGBAColor {
    return new GameRGBAColor(this.r, this.g, this.b, this.a);
  }

  public toString(): string {
    return `{ r:${this.r}, g:${this.g}, b:${this.b}, a:${this.a} }`;
  }
}

export class GameRGBColor {
  public static random(): GameRGBColor {
    return new GameRGBColor(Math.random(), Math.random(), Math.random());
  }
  constructor(public r: number, public g: number, public b: number) {}

  public set(r: number, g: number, b: number): GameRGBColor {
    this.r = r;
    this.g = g;
    this.b = b;
    return this;
  }

  public copy(c: GameRGBColor): GameRGBColor {
    this.r = c.r;
    this.g = c.g;
    this.b = c.b;
    return this;
  }

  public add(rgb: GameRGBColor): GameRGBColor {
    return new GameRGBColor(this.r + rgb.r, this.g + rgb.g, this.b + rgb.b);
  }

  public sub(rgb: GameRGBColor): GameRGBColor {
    return new GameRGBColor(this.r - rgb.r, this.g - rgb.g, this.b - rgb.b);
  }

  public mul(rgb: GameRGBColor): GameRGBColor {
    return new GameRGBColor(this.r * rgb.r, this.g * rgb.g, this.b * rgb.b);
  }

  public div(rgb: GameRGBColor): GameRGBColor {
    return new GameRGBColor(
      rgb.r === 0 ? 0 : this.r / rgb.r,
      rgb.g === 0 ? 0 : this.g / rgb.g,
      rgb.b === 0 ? 0 : this.b / rgb.b,
    );
  }

  public addEq(rgb: GameRGBColor): GameRGBColor {
    this.r += rgb.r;
    this.g += rgb.g;
    this.b += rgb.b;
    return this;
  }

  public subEq(rgb: GameRGBColor): GameRGBColor {
    this.r -= rgb.r;
    this.g -= rgb.g;
    this.b -= rgb.b;
    return this;
  }

  public mulEq(rgb: GameRGBColor): GameRGBColor {
    this.r *= rgb.r;
    this.g *= rgb.g;
    this.b *= rgb.b;
    return this;
  }

  public divEq(rgb: GameRGBColor): GameRGBColor {
    this.r = rgb.r === 0 ? 0 : this.r / rgb.r;
    this.g = rgb.g === 0 ? 0 : this.g / rgb.g;
    this.b = rgb.b === 0 ? 0 : this.b / rgb.b;
    return this;
  }

  public lerp(rgb: GameRGBColor, n: number): GameRGBColor {
    return new GameRGBColor(
      this.r + (rgb.r - this.r) * n,
      this.g + (rgb.g - this.g) * n,
      this.b + (rgb.b - this.b) * n,
    );
  }

  public equals(rgb: GameRGBColor): boolean {
    return (
      Math.abs(this.r - rgb.r) < EPSILON &&
      Math.abs(this.g - rgb.g) < EPSILON &&
      Math.abs(this.b - rgb.b) < EPSILON
    );
  }

  public clone(): GameRGBColor {
    return new GameRGBColor(this.r, this.g, this.b);
  }

  public toRGBA(): GameRGBAColor {
    return new GameRGBAColor(this.r, this.g, this.b, 1.0);
  }

  public toString(): string {
    return `{ r:${this.r}, g:${this.g}, b:${this.b} }`;
  }
}
