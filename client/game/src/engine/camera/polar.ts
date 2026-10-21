import { vec3 } from 'gl-matrix';

export function fromPolar (v:vec3, theta:number, phi:number, r:number) {
    const cp = Math.cos(phi);
    const sp = Math.sin(phi);
    const ct = Math.cos(theta);
    const st = Math.sin(theta);

    v[0] = r * cp * ct;
    v[1] = r * sp;
    v[2] = r * cp * st;

    return v;
}