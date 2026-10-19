import { LibNoise } from './noise';
import { vec2 } from 'gl-matrix';
import { VoxelView } from '@box/utils/voxel';
type VEC2 = [number, number];

interface NoiseEdge {
  scale: number;
  frequency: number;
}

export class CircleMask {
  private voxels: VoxelView;

  public noise: LibNoise;
  public center: VEC2;
  public radius: number;
  public baseBlock: number;
  public surfaceBlock: number;
  public bottomBlock: number;
  public innerRadius: number;
  public innerCenter: VEC2;
  private mapH: number;

  public outerEdgeSpec: NoiseEdge;
  public innerEdgeSpec: NoiseEdge;

  private outerEdgeFlag = false;
  private innerEdgeFlag = false;
  private island = false;
  private islandSteep = 1;
  private islandStart = 0;
  private floatIsland = false;
  private floatIslandSteep = 1;
  private floatIslandStart = 0;

  constructor(spec: {
    voxels: VoxelView;
    center: VEC2;
    radius: number;
    baseBlock: number;
    mapH: number;
    surfaceBlock?: number;
    bottomBlock?: number;
    noise?: LibNoise;
    seed?: number;
    innerRadius?: number;
    innerCenter?: VEC2;
  }) {
    this.voxels = spec.voxels;
    this.center = spec.center;
    this.radius = spec.radius;
    this.baseBlock = spec.baseBlock;
    this.surfaceBlock = spec.surfaceBlock || spec.baseBlock;
    this.bottomBlock = spec.bottomBlock || spec.baseBlock;
    this.mapH = spec.mapH;
    this.innerRadius = spec.innerRadius || 0;
    this.innerCenter = spec.innerCenter || this.center;

    const seed = spec.seed || Math.random();
    this.noise = spec.noise || new LibNoise(seed);

    this.outerEdgeSpec = {
      scale: 30,
      frequency: 10,
    };

    this.innerEdgeSpec = {
      scale: 30,
      frequency: 10,
    };
  }

  public copy() {
    return new CircleMask({
      voxels: this.voxels,
      center: this.center,
      radius: this.radius,
      baseBlock: this.baseBlock,
      surfaceBlock: this.surfaceBlock,
      noise: this.noise.copy(),
      mapH: this.mapH,
    });
  }

  public setIsland(steep = 1, start = 0) {
    this.island = true;
    this.islandSteep = steep;
    this.islandStart = start;
  }

  public calIsland(pos: VEC2) {
    const distance = vec2.dist(this.center, pos) - this.islandStart;
    const delta = (distance * this.islandSteep) / this.radius;
    const gradient = delta * delta;
    return Math.max(0, 1 - gradient);
  }

  public setFloatIsland(steep = 1, start = 0) {
    this.floatIsland = true;
    this.floatIslandSteep = steep;
    this.floatIslandStart = start;
  }

  public calFloatIsland(pos: VEC2, h: number) {
    const dist = Math.max(0, this.dist(pos) - this.floatIslandStart);
    const delta = (dist * this.floatIslandSteep) / this.radius;
    const gradient = Math.pow(delta, 4) * h;
    return Math.floor(Math.max(0, Math.min(h, gradient)));
  }

  public dist(pos: VEC2) {
    return vec2.dist(pos, this.center);
  }

  public getOuterEdgeNoise(pos: VEC2): boolean {
    if (!this.outerEdgeFlag) {
      return false;
    }

    const dist = this.dist(pos);
    const spec = this.outerEdgeSpec;

    const n = this.noise.simplex2(
      pos[0] / spec.frequency,
      pos[1] / spec.frequency,
    );
    return dist <= this.radius - Math.abs(n) * spec.scale;
  }

  public getInnerEdgeNoise(pos: VEC2): boolean {
    if (!this.innerEdgeFlag) {
      return false;
    }

    const dist = vec2.dist(pos, this.innerCenter);
    const spec = this.innerEdgeSpec;

    const n = this.noise.simplex2(
      pos[0] / spec.frequency,
      pos[1] / spec.frequency,
    );
    return dist > this.innerRadius + n * spec.scale;
  }

  public inRange(pos: VEC2) {
    return this.dist(pos) <= this.radius;
  }

  public draw(
    pos: VEC2,
    setHeight?: (h: number) => number | [number, number],
    ySeed?: number,
  ) {
    const [x, z] = pos;
    const dist = this.dist(pos);
    if (
      dist > this.radius ||
      vec2.dist(pos, this.innerCenter) < this.innerRadius
    ) {
      return false;
    }
    if (this.outerEdgeFlag && !this.getOuterEdgeNoise(pos)) {
      return false;
    }
    if (this.innerEdgeFlag && !this.getInnerEdgeNoise(pos)) {
      return false;
    }

    let h = this.noise.noise(x, ySeed || 40, z);
    let d = 0;
    if (this.island) {
      h *= this.calIsland(pos);
    }

    if (setHeight) {
      const r = setHeight(h);
      if (typeof r === 'object') {
        d = Math.ceil(r[0]);
        h = Math.ceil(r[1]);
      } else {
        h = Math.ceil(r);
      }
    } else {
      h = Math.ceil(h);
    }

    if (h <= 0) {
      return false;
    }
    if (h > this.mapH) {
      h = this.mapH;
    }

    if (this.floatIsland) {
      d = this.calFloatIsland(pos, h);
    }

    if (d < h) {
      this.voxels.setVoxel(x, d, z, this.bottomBlock);
      for (let y = d + 1; y < h; y++) {
        this.voxels.setVoxel(x, y, z, this.baseBlock);
      }
    }
    this.voxels.setVoxel(x, h, z, this.surfaceBlock);
    return true;
  }

  public setOuterEdgeNoise(spec?: NoiseEdge) {
    this.outerEdgeFlag = true;
    Object.assign(this.outerEdgeSpec, spec || {});
  }

  public setInnerEdgeNoise(spec?: NoiseEdge) {
    this.innerEdgeFlag = true;
    Object.assign(this.innerEdgeSpec, spec || {});
  }
}
