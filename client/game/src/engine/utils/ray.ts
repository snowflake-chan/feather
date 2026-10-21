import { vec3 } from 'gl-matrix';

export function rayHitBox(minB:number[] | vec3, maxB:number[] | vec3, origin:vec3, dir:vec3, coord:vec3) {
    const NUMDIM = 3;
    const RIGHT = 0;
    const LEFT = 1;
    const MIDDLE = 2;
    const quadrant = vec3.create();
    const candidatePlane = vec3.create();
    const maxT = vec3.create();
    let inside = true;

    /* Find candidate planes; this loop can be avoided if
       rays cast all from the eye(assume perpsective view) */
    for (let i = 0; i < NUMDIM; i++) {
        if (origin[i] < minB[i]) {
            quadrant[i] = LEFT;
            candidatePlane[i] = minB[i];
            inside = false;
        } else if (origin[i] > maxB[i]) {
            quadrant[i] = RIGHT;
            candidatePlane[i] = maxB[i];
            inside = false;
        } else {
            quadrant[i] = MIDDLE;
        }
    }

    /* Ray origin inside bounding box */
    if (inside) {
        // coord = origin;
        return true;
    }

    /* Calculate T distances to candidate planes */
    for (let i = 0; i < NUMDIM; i++) {
        if (quadrant[i] !== MIDDLE && dir[i] !== 0) {
            maxT[i] = (candidatePlane[i] - origin[i]) / dir[i];
        } else {
            maxT[i] = -1;
        }
    }

    /* Get largest of the maxT's for final choice of intersection */
    let whichPlane = 0;
    for (let i = 1; i < NUMDIM; i++) {
        if (maxT[whichPlane] < maxT[i]) {
            whichPlane = i;
        }
    }
    if (maxT[whichPlane] < 0) {
        return false;
    }
    for (let i = 0; i < NUMDIM; i++) {
        if (whichPlane !== i) {
            coord[i] = origin[i] + maxT[whichPlane] * dir[i];
            if (coord[i] < minB[i] || coord[i] > maxB[i]) {
                return false;
            }
        } else {
            coord[i] = candidatePlane[i];
        }
    }
    return true;
}

export function rayHitPlane(
    linePoint:vec3,
    lineVector:vec3,
    planePoint:vec3,
    planeVector:vec3,
    hit?:vec3,
) {
    const vp1 = planeVector[0];
    const vp2 = planeVector[1];
    const vp3 = planeVector[2];
    const n1 = planePoint[0];
    const n2 = planePoint[1];
    const n3 = planePoint[2];
    const v1 = lineVector[0];
    const v2 = lineVector[1];
    const v3 = lineVector[2];
    const m1 = linePoint[0];
    const m2 = linePoint[1];
    const m3 = linePoint[2];
    const vpt = v1 * vp1 + v2 * vp2 + v3 * vp3;

    if (vpt !== 0) {
        const t = ((n1 - m1) * vp1 + (n2 - m2) * vp2 + (n3 - m3) * vp3) / vpt;
        if (hit) {
            hit[0] = m1 + v1 * t;
            hit[1] = m2 + v2 * t;
            hit[2] = m3 + v3 * t;
        }
        return true;
    }
    return false;
}