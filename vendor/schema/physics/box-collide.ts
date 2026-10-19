const EPSILON = 1e-6;
const SLOP = 1 / 256;

export class BoxRayHitResult {
  public collides: boolean = false;
  public t: number = 0.1;
  public axis: number = 0;
}

const _rayHitResult = new BoxRayHitResult();

export function boxRayIntersect(
  lox: number,
  loy: number,
  loz: number,
  hix: number,
  hiy: number,
  hiz: number,
  dx: number,
  dy: number,
  dz: number,
  ox: number,
  oy: number,
  oz: number,
) {
  let count = 0;
  let idx;
  let idy;
  let idz;
  if (Math.abs(dx) > EPSILON) {
    idx = 1 / dx;
  } else {
    idx = Infinity;
    ++count;
  }
  if (Math.abs(dy) > EPSILON) {
    idy = 1 / dy;
  } else {
    idy = Infinity;
    ++count;
  }
  if (Math.abs(dz) > EPSILON) {
    idz = 1 / dz;
  } else {
    idz = Infinity;
    ++count;
  }
  // handle case where ray has no direction
  if (count === 3) {
    _rayHitResult.collides =
      lox <= ox &&
      hix <= ox &&
      loy <= oy &&
      hiy <= oy &&
      loz <= oz &&
      hiz <= oz;
    _rayHitResult.axis = -1;
    _rayHitResult.t = 0;
    return _rayHitResult;
  }
  return boxRayIntersectRecip(
    lox,
    loy,
    loz,
    hix,
    hiy,
    hiz,
    idx,
    idy,
    idz,
    ox,
    oy,
    oz,
  );
}

export function boxRayIntersectRecip(
  lox: number,
  loy: number,
  loz: number,
  hix: number,
  hiy: number,
  hiz: number,
  invdx: number,
  invdy: number,
  invdz: number,
  ox: number,
  oy: number,
  oz: number,
): BoxRayHitResult {
  const tx0 = (lox - ox) * invdx;
  const tx1 = (hix - ox) * invdx;

  const x0 = Math.min(tx0, tx1);
  const x1 = Math.max(tx0, tx1);

  const ty0 = (loy - oy) * invdy;
  const ty1 = (hiy - oy) * invdy;

  const y0 = Math.min(ty0, ty1);
  const y1 = Math.max(ty0, ty1);

  const tz0 = (loz - oz) * invdz;
  const tz1 = (hiz - oz) * invdz;

  const z0 = Math.min(tz0, tz1);
  const z1 = Math.max(tz0, tz1);

  let tmin = 0;
  _rayHitResult.axis = -1;
  if (x0 >= tmin) {
    tmin = x0;
    _rayHitResult.axis = 0;
  }
  if (y0 >= tmin) {
    tmin = y0;
    _rayHitResult.axis = 1;
  }
  if (z0 >= tmin) {
    tmin = z0;
    _rayHitResult.axis = 2;
  }
  const tmax = Math.min(x1, y1, z1);
  _rayHitResult.t = tmin;
  if (tmax >= tmin) {
    _rayHitResult.collides = true;
  } else {
    _rayHitResult.collides = false;
    _rayHitResult.axis = -1;
    _rayHitResult.t = 0;
  }

  return _rayHitResult;
}

export class BoxSweepSweepResult {
  public collides: boolean = false;
  public t: number = 0.1;
  public depth: number = 0.1;
  public axis: number = 0;
  public flip: boolean = false;
}

const _sweepSweepResult = new BoxSweepSweepResult();

// computes an intersection between two moving boxes
export function sweepSweepIntersect(
  ax0: number,
  ay0: number,
  az0: number,
  ax1: number,
  ay1: number,
  az1: number,
  axr: number,
  ayr: number,
  azr: number,
  bx0: number,
  by0: number,
  bz0: number,
  bx1: number,
  by1: number,
  bz1: number,
  bxr: number,
  byr: number,
  bzr: number,
) {
  const xr = axr + bxr;
  const yr = ayr + byr;
  const zr = azr + bzr;

  const adx = ax1 - ax0;
  const ady = ay1 - ay0;
  const adz = az1 - az0;

  const bdx = bx1 - bx0;
  const bdy = by1 - by0;
  const bdz = bz1 - bz0;

  const abdx = bdx - adx;
  const abdy = bdy - ady;
  const abdz = bdz - adz;

  const abx = bx0 - ax0;
  const aby = by0 - ay0;
  const abz = bz0 - az0;

  let rayT = 0;
  let rayAxis = -1;

  if (
    !(
      Math.abs(abx) < SLOP + xr &&
      Math.abs(aby) < SLOP + yr &&
      Math.abs(abz) < SLOP + zr
    )
  ) {
    const rayHit = boxRayIntersect(
      -xr,
      -yr,
      -zr,
      xr,
      yr,
      zr,
      abdx,
      abdy,
      abdz,
      abx,
      aby,
      abz,
    );
    if (rayHit.t > 1 || !rayHit.collides) {
      _sweepSweepResult.collides = false;
      _sweepSweepResult.t = 0;
      _sweepSweepResult.depth = 0;
      _sweepSweepResult.axis = -1;
      _sweepSweepResult.flip = false;
      return _sweepSweepResult;
    }
    rayT = rayHit.t;
    rayAxis = rayHit.axis;
  }

  _sweepSweepResult.collides = true;

  if (rayAxis === -1) {
    _sweepSweepResult.t = 0;

    const hx = xr - Math.abs(abx);
    const hy = yr - Math.abs(aby);
    const hz = zr - Math.abs(abz);

    // special case: boxes initially intersecting
    if (hx <= hy && hx <= hz) {
      _sweepSweepResult.axis = 0;
      _sweepSweepResult.depth = hx;
      _sweepSweepResult.flip = ax0 > bx0;
    } else if (hy <= hx && hy <= hz) {
      _sweepSweepResult.axis = 1;
      _sweepSweepResult.depth = hy;
      _sweepSweepResult.flip = ay0 > by0;
    } else {
      _sweepSweepResult.axis = 2;
      _sweepSweepResult.depth = hz;
      _sweepSweepResult.flip = az0 > bz0;
    }
  } else {
    _sweepSweepResult.t = rayT;
    const axis = (_sweepSweepResult.axis = rayAxis);
    if (axis === 0) {
      _sweepSweepResult.flip = abdx > 0;
      _sweepSweepResult.depth = xr - Math.abs(abx);
    } else if (axis === 1) {
      _sweepSweepResult.flip = abdy > 0;
      _sweepSweepResult.depth = yr - Math.abs(aby);
    } else {
      _sweepSweepResult.flip = abdz > 0;
      _sweepSweepResult.depth = zr - Math.abs(abz);
    }
  }
  return _sweepSweepResult;
}

export function boxSweepIntersect(
  x0: number,
  y0: number,
  z0: number,
  x1: number,
  y1: number,
  z1: number,
  rx: number,
  ry: number,
  rz: number,
  lx: number,
  ly: number,
  lz: number,
  hx: number,
  hy: number,
  hz: number,
  faces: number,
) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dz = z1 - z0;

  const minX = lx - rx;
  const minY = ly - ry;
  const minZ = lz - rz;
  const maxX = hx + rx;
  const maxY = hy + ry;
  const maxZ = hz + rz;

  _sweepSweepResult.collides = false;
  _sweepSweepResult.t = 0;
  _sweepSweepResult.depth = 0;
  _sweepSweepResult.axis = -1;
  _sweepSweepResult.flip = false;

  let rayT = 0;
  let rayAxis = -1;

  const rayHitResult = boxRayIntersect(
    minX,
    minY,
    minZ,
    maxX,
    maxY,
    maxZ,
    dx,
    dy,
    dz,
    x0,
    y0,
    z0,
  );
  if (!rayHitResult.collides || rayHitResult.t > 1) {
    return _sweepSweepResult;
  }
  rayT = rayHitResult.t;
  rayAxis = rayHitResult.axis;

  if (rayT < 1e-4) {
    // if initially intersecting then we take min over exposed faces, otherwise
    const intersectVol =
      (Math.min(hx, x0 + rx) - Math.max(lx, x0 - rx)) *
      (Math.min(hy, y0 + ry) - Math.max(ly, y0 - ry)) *
      (Math.min(hz, z0 + rz) - Math.max(lz, z0 - rz));
    const iFlag = intersectVol < 0.25 * Math.max(1, 8 * rx * ry * rz);

    // degenerate case: initially intersecting
    let minDepth = Infinity;
    let axis = -1;
    let flip = false;

    let d = 0;

    // -x
    d = x0 - minX;
    if (d < minDepth && (iFlag || faces & 1)) {
      minDepth = d;
      axis = 0;
      flip = true;
    }

    // +x
    d = maxX - x0;
    if (d < minDepth && (iFlag || faces & 2)) {
      minDepth = d;
      axis = 0;
      flip = false;
    }

    // -y
    d = y0 - minY;
    if (d < minDepth && (iFlag || faces & 4)) {
      minDepth = d;
      axis = 1;
      flip = true;
    }

    // +y
    d = maxY - y0;
    if (d < minDepth && (iFlag || faces & 8)) {
      minDepth = d;
      axis = 1;
      flip = false;
    }

    // -z
    d = z0 - minZ;
    if (d < minDepth && (iFlag || faces & 16)) {
      minDepth = d;
      axis = 2;
      flip = true;
    }

    // +z
    d = maxZ - z0;
    if (d < minDepth && (iFlag || faces & 32)) {
      minDepth = d;
      axis = 2;
      flip = false;
    }

    if (axis < 0 || (faces & (1 << (2 * axis + (flip ? 0 : 1)))) === 0) {
      return _sweepSweepResult;
    }

    _sweepSweepResult.axis = axis;
    _sweepSweepResult.flip = flip;
    _sweepSweepResult.t = 0;
    _sweepSweepResult.depth = minDepth;
  } else {
    // need to handle face-face intersections
    const axis = rayAxis;
    let flip = false;
    let depth = 0;
    if (axis === 0) {
      if (dx > 0) {
        flip = true;
        depth = x0 - minX;
      } else {
        depth = maxX - x0;
      }
    } else if (axis === 1) {
      if (dy > 0) {
        flip = true;
        depth = y0 - minY;
      } else {
        depth = maxY - y0;
      }
    } else {
      if (dz > 0) {
        flip = true;
        depth = z0 - minZ;
      } else {
        depth = maxZ - z0;
      }
    }

    // ignore collision with missing face
    const mask = 1 << (2 * axis + (flip ? 0 : 1));
    if ((faces & mask) === 0) {
      // handle edge collision
      return _sweepSweepResult;
    }

    _sweepSweepResult.axis = axis;
    _sweepSweepResult.flip = flip;
    _sweepSweepResult.t = rayT;
    _sweepSweepResult.depth = depth;
  }

  _sweepSweepResult.collides = true;
  return _sweepSweepResult;
}
