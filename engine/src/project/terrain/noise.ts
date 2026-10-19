import SimplexNoise from 'simplex-noise';

type noise2Func = (x: number, y: number) => number;
type noise3Func = (x: number, y: number, z: number) => number;

export class LibNoise {
  public simplex2: noise2Func;
  public simplex3: noise3Func;

  private _noise: SimplexNoise;
  private scale = 1;
  private octaves = 1;
  private persistence = 1;
  private lacunarity = 1;
  private baseHeight = 0;
  private seed: number;

  constructor(seed?: number) {
    this.seed = seed || Math.random();
    this._noise = new SimplexNoise('' + this.seed);
    this.simplex2 = (x, y) => this._noise.noise2D(x, y);
    this.simplex3 = (x, y, z) => this._noise.noise3D(x, y, z);
  }

  public copy() {
    const clone = new LibNoise(this.seed);
    clone.setSpec(
      this.scale,
      this.octaves,
      this.persistence,
      this.lacunarity,
      this.baseHeight,
    );
    return clone;
  }

  public setSpec(
    scale: number,
    octaves: number,
    persistence: number,
    lacunarity: number,
    baseHeight: number,
  ) {
    this.setScale(scale);
    this.setOctaves(octaves);
    this.setPersistence(persistence);
    this.setLacunarity(lacunarity);
    this.setBaseHeight(baseHeight);
  }

  public setScale(s: number) {
    this.scale = s || 100;
  }

  public setOctaves(o: number) {
    this.octaves = o || 1;
  }

  public setPersistence(p: number) {
    this.persistence = p || 1;
  }

  public setLacunarity(l: number) {
    this.lacunarity = l || 1;
  }

  public setBaseHeight(h: number) {
    this.baseHeight = h;
  }

  public coherentNoise(
    x: number,
    y = 1,
    z?: number,
    frequency = 1,
    amplitudes = 1,
  ) {
    const a = amplitudes * this.scale;
    const f = this.scale / frequency;
    if (z) {
      return this._noise.noise3D(x / f, y / f, z / f) * a;
    } else {
      return this._noise.noise2D(x / f, y / f) * a;
    }
  }

  public noise(x: number, y?: number, z?: number) {
    let r = 0;
    for (let i = 0, f = 1; i < this.octaves; i++, f *= 2) {
      r += this.coherentNoise(
        x,
        y,
        z,
        f * this.lacunarity,
        (1 / f) * this.persistence,
      );
    }
    return r + this.baseHeight;
  }
}
