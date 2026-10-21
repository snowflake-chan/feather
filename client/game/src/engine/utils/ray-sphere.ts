export function raySphere (
    ox:number, oy:number, oz:number,
    dx:number, dy:number, dz:number,
    cx:number, cy:number, cz:number,
    r:number) {
    const cox = ox - cx;
    const coy = oy - cy;
    const coz = oz - cz;

    const a = dx * dx + dy * dy + dz * dz;
    const b = 2 * (cox * dx + coy * dy + coz * dz);
    const c = cox * cox + coy * coy + coz * coz - r * r;

    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
        return Infinity;
    }

    const sqrtD = Math.sqrt(discriminant);
    const t0 = (-b - sqrtD) / (2 * a);
    const t1 = (-b + sqrtD) / (2 * a);

    const tmin = Math.min(t0, t1);
    if (tmin > 0) {
        return tmin;
    }

    const tmax = Math.max(t0, t1);
    if (tmax > 0) {
        return 0;
    }

    return Infinity;
}