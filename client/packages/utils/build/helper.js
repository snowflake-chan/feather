"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaceModeSelectOption = exports.FaceModeColorOption = exports.CenterModeOption = exports.colorSelectOptions = exports.EditingMode = exports.Actions = exports.WorkAction = void 0;
exports.generateCuboid = generateCuboid;
exports.boundary = boundary;
exports.surfaceScale = surfaceScale;
exports.hex2rgb = hex2rgb;
exports.absMod = absMod;
exports.traverseVoxels = traverseVoxels;
exports.inRange = inRange;
exports.adjacentVoxels = adjacentVoxels;
exports.drawVoxelSphere = drawVoxelSphere;
exports.drawVoxelCircle = drawVoxelCircle;
exports.drawVoxelSquare = drawVoxelSquare;
exports.calcRadius = calcRadius;
exports.calcHalfEdgeLen = calcHalfEdgeLen;
exports.drawVoxelLine = drawVoxelLine;
exports.cloneArray = cloneArray;
exports.newBundle = newBundle;
exports.fillSpace = fillSpace;
exports.allocEmptyVoxels = allocEmptyVoxels;
exports.getElementPos = getElementPos;
exports.mergeVoxel = mergeVoxel;
exports.surfaceByNormalAndPoint = surfaceByNormalAndPoint;
const voxel_1 = require("./voxel");
const gl_matrix_1 = require("gl-matrix");
var WorkAction;
(function (WorkAction) {
    WorkAction[WorkAction["bakeAoData"] = 0] = "bakeAoData";
    WorkAction[WorkAction["syncVoxel"] = 1] = "syncVoxel";
    WorkAction[WorkAction["updateVoxel"] = 2] = "updateVoxel";
    WorkAction[WorkAction["sendPoints"] = 3] = "sendPoints";
    WorkAction[WorkAction["clearData"] = 4] = "clearData";
    WorkAction[WorkAction["changeSize"] = 5] = "changeSize";
})(WorkAction || (exports.WorkAction = WorkAction = {}));
var Actions;
(function (Actions) {
    Actions[Actions["Attach"] = 0] = "Attach";
    Actions[Actions["Erase"] = 1] = "Erase";
    Actions[Actions["Paint"] = 2] = "Paint";
    Actions[Actions["Select"] = 3] = "Select";
    Actions[Actions["Translate"] = 4] = "Translate";
    Actions[Actions["ColorSelect"] = 5] = "ColorSelect";
    Actions[Actions["PickColor"] = 6] = "PickColor";
    Actions[Actions["HollowOut"] = 7] = "HollowOut";
    Actions[Actions["FillSameColorSpace"] = 8] = "FillSameColorSpace";
    Actions[Actions["Extrude"] = 9] = "Extrude";
})(Actions || (exports.Actions = Actions = {}));
var EditingMode;
(function (EditingMode) {
    EditingMode[EditingMode["line"] = 0] = "line";
    EditingMode[EditingMode["center"] = 1] = "center";
    EditingMode[EditingMode["box"] = 2] = "box";
    EditingMode[EditingMode["voxel"] = 3] = "voxel";
    EditingMode[EditingMode["face"] = 4] = "face";
    EditingMode[EditingMode["rect"] = 5] = "rect";
})(EditingMode || (exports.EditingMode = EditingMode = {}));
var colorSelectOptions;
(function (colorSelectOptions) {
    colorSelectOptions[colorSelectOptions["volume"] = 0] = "volume";
    colorSelectOptions[colorSelectOptions["face"] = 1] = "face";
    colorSelectOptions[colorSelectOptions["all"] = 2] = "all";
})(colorSelectOptions || (exports.colorSelectOptions = colorSelectOptions = {}));
var CenterModeOption;
(function (CenterModeOption) {
    CenterModeOption[CenterModeOption["square"] = 0] = "square";
    CenterModeOption[CenterModeOption["circle"] = 1] = "circle";
})(CenterModeOption || (exports.CenterModeOption = CenterModeOption = {}));
var FaceModeColorOption;
(function (FaceModeColorOption) {
    FaceModeColorOption[FaceModeColorOption["voxelColor"] = 0] = "voxelColor";
    FaceModeColorOption[FaceModeColorOption["currentColor"] = 1] = "currentColor";
})(FaceModeColorOption || (exports.FaceModeColorOption = FaceModeColorOption = {}));
var FaceModeSelectOption;
(function (FaceModeSelectOption) {
    FaceModeSelectOption[FaceModeSelectOption["geometry"] = 0] = "geometry";
    FaceModeSelectOption[FaceModeSelectOption["colorGeometry"] = 1] = "colorGeometry";
})(FaceModeSelectOption || (exports.FaceModeSelectOption = FaceModeSelectOption = {}));
function generateCuboid(a, b, isVoxle, outerNormal, range) {
    const { start, end } = boundary(a, b, [-Infinity, -Infinity, -Infinity], [Infinity, Infinity, Infinity]);
    const positions = [];
    const elements = [];
    const normals = [];
    const nSign = outerNormal ? -1 : 1;
    if (isVoxle) {
        for (let i = 0; i < 3; i++) {
            if (range) {
                end[i] = Math.min(end[i] + 1, range[i]);
            }
            else {
                end[i] = end[i] + 1;
            }
        }
    }
    positions.push([start[0], start[1], start[2]]);
    positions.push([start[0], start[1], end[2]]);
    positions.push([end[0], start[1], end[2]]);
    positions.push([end[0], start[1], start[2]]);
    positions.push([start[0], end[1], start[2]]);
    positions.push([end[0], end[1], start[2]]);
    positions.push([end[0], end[1], end[2]]);
    positions.push([start[0], end[1], end[2]]);
    positions.push([end[0], start[1], start[2]]);
    positions.push([end[0], start[1], end[2]]);
    positions.push([end[0], end[1], end[2]]);
    positions.push([end[0], end[1], start[2]]);
    positions.push([start[0], start[1], start[2]]);
    positions.push([start[0], end[1], start[2]]);
    positions.push([start[0], end[1], end[2]]);
    positions.push([start[0], start[1], end[2]]);
    positions.push([start[0], start[1], start[2]]);
    positions.push([end[0], start[1], start[2]]);
    positions.push([end[0], end[1], start[2]]);
    positions.push([start[0], end[1], start[2]]);
    positions.push([start[0], start[1], end[2]]);
    positions.push([start[0], end[1], end[2]]);
    positions.push([end[0], end[1], end[2]]);
    positions.push([end[0], start[1], end[2]]);
    for (let i = 0; i < 4; i++) {
        normals.push([0, 1 * nSign, 0]);
    }
    for (let i = 0; i < 4; i++) {
        normals.push([0, -1 * nSign, 0]);
    }
    for (let i = 0; i < 4; i++) {
        normals.push([-1 * nSign, 0, 0]);
    }
    for (let i = 0; i < 4; i++) {
        normals.push([1 * nSign, 0, 0]);
    }
    for (let i = 0; i < 4; i++) {
        normals.push([0, 0, 1 * nSign]);
    }
    for (let i = 0; i < 4; i++) {
        normals.push([0, 0, -1 * nSign]);
    }
    const surfaceIndex = [0, 4, 8, 12, 16, 20];
    for (let i = 0; i < surfaceIndex.length; i++) {
        if (nSign == -1) {
            elements.push([
                surfaceIndex[i] + 2,
                surfaceIndex[i] + 1,
                surfaceIndex[i],
            ]);
            elements.push([
                surfaceIndex[i],
                surfaceIndex[i] + 3,
                surfaceIndex[i] + 2,
            ]);
        }
        else {
            elements.push([
                surfaceIndex[i],
                surfaceIndex[i] + 1,
                surfaceIndex[i] + 2,
            ]);
            elements.push([
                surfaceIndex[i] + 2,
                surfaceIndex[i] + 3,
                surfaceIndex[i],
            ]);
        }
    }
    return {
        lo: [start[0], start[1], start[2]],
        hi: [end[0], end[1], end[2]],
        positions,
        elements,
        normals,
    };
}
function boundary(a, b, minima, maxima) {
    const start = gl_matrix_1.vec3.create();
    const end = gl_matrix_1.vec3.create();
    gl_matrix_1.vec3.max(start, gl_matrix_1.vec3.min(start, a, b), minima);
    gl_matrix_1.vec3.min(end, gl_matrix_1.vec3.max(end, a, b), maxima);
    return {
        start,
        end,
    };
}
function surfaceScale(normal, surface, scale) {
    const min = Math.min;
    const offset = [surface[0][0], surface[0][1], surface[0][2]];
    for (let i = 1; i < surface.length; i++) {
        offset[0] = min(offset[0], surface[i][0]);
        offset[1] = min(offset[1], surface[i][1]);
        offset[2] = min(offset[2], surface[i][2]);
    }
    const out = [];
    for (let i = 0; i < surface.length; i++) {
        const pos = [0, 0, 0];
        if (normal[0] == 0) {
            pos[0] = (surface[i][0] - offset[0]) * scale - scale / 2;
        }
        else if (normal[0] != 0) {
            pos[0] = surface[0][0];
        }
        if (normal[1] == 0) {
            pos[1] = (surface[i][1] - offset[1]) * scale - scale / 2;
        }
        else if (normal[1] != 0) {
            pos[1] = surface[0][1];
        }
        if (normal[2] == 0) {
            pos[2] = (surface[i][2] - offset[2]) * scale - scale / 2;
        }
        else if (normal[2] != 0) {
            pos[2] = surface[0][2];
        }
        out.push(pos);
    }
    return out;
}
function hex2rgb(hex) {
    if (hex[0] == '#') {
        hex = hex.substr(1);
    }
    return [
        parseInt(hex.substr(0, 2), 16),
        parseInt(hex.substr(2, 2), 16),
        parseInt(hex.substr(4, 2), 16),
    ];
}
function absMod(n, mod) {
    if (n < 0) {
        n = Math.ceil(Math.abs(n / mod)) * mod + n;
    }
    else {
        n %= mod;
    }
    return n;
}
function traverseVoxels(voxel, start, end, operation) {
    const { data, stride: [sx, sy, sz], offset, } = voxel;
    const l = end[0] - start[0] + 1;
    const h = end[1] - start[1] + 1;
    const stepi = sx;
    const stepj = sy - sx * l;
    const stepk = sz - sy * h;
    let ptr = sx * start[0] + sy * start[1] + sz * start[2] + offset;
    for (let k = start[2]; k <= end[2]; ++k) {
        for (let j = start[1]; j <= end[1]; ++j) {
            for (let i = start[0]; i <= end[0]; ++i) {
                operation(i, j, k, data[ptr], ptr);
                ptr += stepi;
            }
            ptr += stepj;
        }
        ptr += stepk;
    }
}
function inRange(position, minimum, maximum) {
    const [x, y, z] = position;
    const [minX, minY, minZ] = minimum;
    const [maxX, maxY, maxZ] = maximum;
    return (x >= minX && y >= minY && z >= minZ && x <= maxX && y <= maxY && z <= maxZ);
}
function adjacentVoxels(src, out, currentPos, value, currentMaterial, axis, start, end, normal) {
    const queue = [];
    queue.push(currentPos);
    const maximum = [src.shape[0] - 1, src.shape[1] - 1, src.shape[2] - 1];
    while (queue.length) {
        const [x, y, z] = queue.pop();
        if (!inRange([x, y, z], [0, 0, 0], maximum)) {
            continue;
        }
        if (normal &&
            inRange([x + normal[0], y + normal[1], z + normal[2]], [0, 0, 0], maximum)) {
            if (src.getVoxel(x + normal[0], y + normal[1], z + normal[2]) !== 0) {
                continue;
            }
        }
        if (value === -1) {
            const index = out.index(x, y, z);
            if (out.data[index] != 0) {
                continue;
            }
            if (src.data[index] !== 0) {
                out.data[index] = src.data[index];
            }
            else {
                continue;
            }
        }
        else if (value === 0) {
            if (out.getVoxel(x, y, z) === currentMaterial) {
                continue;
            }
            if (src.getVoxel(x, y, z) === 0) {
                out.setVoxel(x, y, z, currentMaterial);
                src.setVoxel(x, y, z, currentMaterial);
            }
            else {
                continue;
            }
        }
        else {
            if (out.getVoxel(x, y, z) === value) {
                continue;
            }
            if (src.getVoxel(x, y, z) === value) {
                out.setVoxel(x, y, z, value);
            }
            else {
                continue;
            }
        }
        gl_matrix_1.vec3.min(start, start, [x, y, z]);
        gl_matrix_1.vec3.max(end, end, [x, y, z]);
        if (axis[0] != 0) {
            queue.push([x + 1, y, z]);
            queue.push([x - 1, y, z]);
        }
        if (axis[1] != 0) {
            queue.push([x, y + 1, z]);
            queue.push([x, y - 1, z]);
        }
        if (axis[2] != 0) {
            queue.push([x, y, z + 1]);
            queue.push([x, y, z - 1]);
        }
    }
}
function drawVoxelSphere(voxels, center, radius) {
    for (let i = 0; i < radius; i++) {
        for (let j = 0; j < radius; j++) {
            for (let k = 0; k < radius; k++) {
                if (i * i + j * j + k * k < radius * radius) {
                    voxels.setVoxel(center[0] + i, center[1] + j, center[2] + k, 1);
                    voxels.setVoxel(center[0] - i, center[1] + j, center[2] + k, 1);
                    voxels.setVoxel(center[0] + i, center[1] - j, center[2] + k, 1);
                    voxels.setVoxel(center[0] + i, center[1] + j, center[2] - k, 1);
                    voxels.setVoxel(center[0] - i, center[1] - j, center[2] + k, 1);
                    voxels.setVoxel(center[0] - i, center[1] - j, center[2] - k, 1);
                    voxels.setVoxel(center[0] + i, center[1] - j, center[2] - k, 1);
                    voxels.setVoxel(center[0] - i, center[1] + j, center[2] - k, 1);
                }
            }
        }
    }
}
function drawVoxelCircle(voxels, color, center, radius, N_axis, visitor) {
    let a = 0;
    let b = radius;
    let p = 5 / 4 - radius;
    if (typeof N_axis !== 'string') {
        if (N_axis[0] != 0) {
            N_axis = 'x';
        }
        else if (N_axis[1] != 0) {
            N_axis = 'y';
        }
        else if (N_axis[2] != 0) {
            N_axis = 'z';
        }
    }
    while (a <= b) {
        if (p < 0) {
            p = p + 2 * a + 3;
            a++;
        }
        else {
            p = p + 2 * (a - b) + 5;
            b--;
            a++;
        }
        if (N_axis === 'z') {
            for (let i = center[0] - a; i <= center[0] + a; i++) {
                visitor(i, center[1] + b, center[2]);
                visitor(i, center[1] - b, center[2]);
            }
            for (let i = center[0] - b; i <= center[0] + b; i++) {
                visitor(i, center[1] + a, center[2]);
                visitor(i, center[1] - a, center[2]);
            }
            for (let i = center[0] - radius; i <= center[0] + radius; i++) {
                if (i != center[0]) {
                    visitor(i, center[1], center[2]);
                }
            }
        }
        else if (N_axis === 'y') {
            for (let i = center[2] - a; i <= center[2] + a; i++) {
                visitor(center[0] + b, center[1], i);
                visitor(center[0] - b, center[1], i);
            }
            for (let i = center[2] - b; i <= center[2] + b; i++) {
                visitor(center[0] + a, center[1], i);
                visitor(center[0] - a, center[1], i);
            }
            for (let i = center[2] - radius; i <= center[2] + radius; i++) {
                if (i != center[2]) {
                    visitor(center[0], center[1], i);
                }
            }
        }
        else if (N_axis === 'x') {
            for (let i = center[2] - a; i <= center[2] + a; i++) {
                visitor(center[0], center[1] + b, i);
                visitor(center[0], center[1] - b, i);
            }
            for (let i = center[2] - b; i <= center[2] + b; i++) {
                visitor(center[0], center[1] + a, i);
                visitor(center[0], center[1] - a, i);
            }
            for (let i = center[2] - radius; i <= center[2] + radius; i++) {
                if (i != center[2]) {
                    visitor(center[0], center[1], i);
                }
            }
        }
    }
}
function drawVoxelSquare(voxels, color, center, halfEdgeLen, N_axis, force = false) {
    if (typeof N_axis !== 'string') {
        if (N_axis[0] != 0) {
            N_axis = 'x';
        }
        else if (N_axis[1] != 0) {
            N_axis = 'y';
        }
        else if (N_axis[2] != 0) {
            N_axis = 'z';
        }
    }
    if (N_axis === 'z') {
        for (let i = center[0] - halfEdgeLen; i <= center[0] + halfEdgeLen; i++) {
            for (let j = center[1] - halfEdgeLen; j <= center[1] + halfEdgeLen; j++) {
                if (i != center[0] || j != center[1]) {
                    const idx = voxels.index(i, j, center[2]);
                    if (idx > -1) {
                        voxels.data[idx] = force ? color : voxels.data[idx] || color;
                    }
                }
            }
        }
    }
    else if (N_axis === 'y') {
        for (let i = center[0] - halfEdgeLen; i <= center[0] + halfEdgeLen; i++) {
            for (let k = center[2] - halfEdgeLen; k <= center[2] + halfEdgeLen; k++) {
                if (i != center[0] || k != center[2]) {
                    const idx = voxels.index(i, center[1], k);
                    if (idx > -1) {
                        voxels.data[idx] = force ? color : voxels.data[idx] || color;
                    }
                }
            }
        }
    }
    else if (N_axis === 'x') {
        for (let j = center[1] - halfEdgeLen; j <= center[1] + halfEdgeLen; j++) {
            for (let k = center[2] - halfEdgeLen; k <= center[2] + halfEdgeLen; k++) {
                if (j != center[1] || k != center[2]) {
                    const idx = voxels.index(center[0], j, k);
                    if (idx > -1) {
                        voxels.data[idx] = force ? color : voxels.data[idx] || color;
                    }
                }
            }
        }
    }
}
function calcRadius(N_axis, center, pos) {
    if (N_axis[0] != 0) {
        const _dy = pos[1] - center[1];
        const _dz = pos[2] - center[2];
        return Math.round(Math.pow(_dy * _dy + _dz * _dz, 0.5));
    }
    else if (N_axis[1] != 0) {
        const _dx = pos[0] - center[0];
        const _dz = pos[2] - center[2];
        return Math.round(Math.pow(_dx * _dx + _dz * _dz, 0.5));
    }
    else if (N_axis[2] != 0) {
        const _dx = pos[0] - center[0];
        const _dy = pos[1] - center[1];
        return Math.round(Math.pow(_dx * _dx + _dy * _dy, 0.5));
    }
    return 0;
}
function calcHalfEdgeLen(N_axis, center, pos) {
    if (N_axis[0] != 0) {
        const _dy = Math.abs(pos[1] - center[1]);
        const _dz = Math.abs(pos[2] - center[2]);
        return Math.max(_dy, _dz);
    }
    else if (N_axis[1] != 0) {
        const _dx = Math.abs(pos[0] - center[0]);
        const _dz = Math.abs(pos[2] - center[2]);
        return Math.max(_dx, _dz);
    }
    else if (N_axis[2] != 0) {
        const _dx = Math.abs(pos[0] - center[0]);
        const _dy = Math.abs(pos[1] - center[1]);
        return Math.max(_dx, _dy);
    }
    return 0;
}
function drawVoxelLine(startP, endP, visitor) {
    const minX = Math.min(startP[0], endP[0]);
    const minY = Math.min(startP[1], endP[1]);
    const minZ = Math.min(startP[2], endP[2]);
    const maxX = Math.max(startP[0], endP[0]);
    const maxY = Math.max(startP[1], endP[1]);
    const maxZ = Math.max(startP[2], endP[2]);
    let dx = +(endP[0] - startP[0]);
    let dy = +(endP[1] - startP[1]);
    let dz = +(endP[2] - startP[2]);
    const s = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));
    dx = dx / s;
    dy = dy / s;
    dz = dz / s;
    const txDelta = Math.abs(1 / dx);
    const tyDelta = Math.abs(1 / dy);
    const tzDelta = Math.abs(1 / dz);
    let txMax = txDelta < Infinity ? Math.abs(dx) + 1 : Infinity;
    let tyMax = tyDelta < Infinity ? Math.abs(dy) + 1 : Infinity;
    let tzMax = tzDelta < Infinity ? Math.abs(dz) + 1 : Infinity;
    const stepx = dx < 0 ? -1 : dx > 0 ? 1 : 0;
    const stepy = dy < 0 ? -1 : dy > 0 ? 1 : 0;
    const stepz = dz < 0 ? -1 : dz > 0 ? 1 : 0;
    let [x, y, z] = startP;
    while (true) {
        visitor(x, y, z);
        if (x == endP[0] && y == endP[1] && z == endP[2]) {
            return;
        }
        if (txMax < tyMax) {
            if (txMax < tzMax) {
                x = x + stepx;
                if (x < minX || x > maxX) {
                    return;
                }
                txMax = txMax + txDelta;
            }
            else {
                z = z + stepz;
                if (z < minZ || z > maxZ) {
                    return;
                }
                tzMax = tzMax + tzDelta;
            }
        }
        else {
            if (tyMax < tzMax) {
                y = y + stepy;
                if (y < minY || y > maxY) {
                    return;
                }
                tyMax = tyMax + tyDelta;
            }
            else {
                z = z + stepz;
                if (z < minZ || z > maxZ) {
                    return;
                }
                tzMax = tzMax + tzDelta;
            }
        }
    }
}
function cloneArray(x) {
    const result = new Array(x.length);
    for (let i = 0; i < x.length; ++i) {
        result[i] = x[i].slice();
    }
    return result;
}
function getSubSpace(as, ae, bs, be) {
    const max = Math.max;
    const min = Math.min;
    const intersectS = [max(as[0], bs[0]), max(as[1], bs[1]), max(as[2], bs[2])];
    const intersectE = [min(ae[0], be[0]), min(ae[1], be[1]), min(ae[2], be[2])];
    if (!(intersectS[0] < intersectE[0] &&
        intersectS[1] < intersectE[1] &&
        intersectS[2] < intersectE[2])) {
        return { eliminate: [[as, ae]], addition: [[bs, be]] };
    }
    const eliminateSpace = [];
    [
        [as, [intersectE[0], ae[1], intersectS[2]]],
        [
            [intersectE[0] + 1, as[1], as[2]],
            [ae[0], ae[1], intersectE[2]],
        ],
        [
            [as[0], as[1], intersectS[2]],
            [intersectS[0] - 1, ae[1], ae[2]],
        ],
        [[intersectS[0], as[1], intersectE[2]], ae],
        [
            [intersectS[0], as[1], intersectS[2]],
            [intersectE[0], intersectS[1] - 1, intersectE[2]],
        ],
        [
            [intersectS[0], intersectE[1] + 1, intersectS[2]],
            [intersectE[0], ae[1], intersectE[2]],
        ],
    ].forEach((points) => {
        for (let i = 0; i < points[0].length; i++) {
            if (points[1][i] - points[0][i] < 0) {
                return;
            }
        }
        eliminateSpace.push(points);
    });
    const additionSpace = [];
    [
        [bs, [intersectE[0], be[1], intersectS[2]]],
        [
            [intersectE[0] + 1, bs[1], bs[2]],
            [be[0], be[1], intersectE[2]],
        ],
        [
            [bs[0], bs[1], intersectS[2]],
            [intersectS[0] - 1, be[1], be[2]],
        ],
        [[intersectS[0], bs[1], intersectE[2]], be],
        [
            [intersectS[0], bs[1], intersectS[2]],
            [intersectE[0], intersectS[1] - 1, intersectE[2]],
        ],
        [
            [intersectS[0], intersectE[1] + 1, intersectS[2]],
            [intersectE[0], be[1], intersectE[2]],
        ],
    ].forEach((points) => {
        for (let i = 0; i < points[0].length; i++) {
            if (points[1][i] - points[0][i] < 0) {
                return;
            }
        }
        additionSpace.push(points);
    });
    return { eliminate: eliminateSpace, addition: additionSpace };
}
function newBundle(voxel, prevStart, prevEnd, start, end, eliminateMaterial, newMaterial, condition) {
    const currBound = boundary(start, end, [0, 0, 0], voxel.getDimension());
    const [minX, minY, minZ] = currBound.start;
    const [maxX, maxY, maxZ] = currBound.end;
    if (prevStart && prevStart.length == 3) {
        const prevBound = boundary(prevStart, prevEnd, [0, 0, 0], voxel.getDimension());
        const [preMinX, preMinY, preMinZ] = prevBound.start;
        const [preMaxX, preMaxY, preMaxZ] = prevBound.end;
        const rst = getSubSpace([preMinX, preMinY, preMinZ], [preMaxX, preMaxY, preMaxZ], [minX, minY, minZ], [maxX, maxY, maxZ]);
        rst.eliminate.forEach((pos) => {
            fillSpace(voxel, pos[0], pos[1], eliminateMaterial);
        });
        rst.addition.forEach((pos) => {
            fillSpace(voxel, pos[0], pos[1], newMaterial, condition);
        });
    }
    else {
        for (let i = minX; i <= maxX; i++) {
            for (let j = minY; j <= maxY; j++) {
                for (let k = minZ; k <= maxZ; k++) {
                    if (typeof newMaterial == 'function') {
                        voxel.setVoxel(i, j, k, newMaterial(i, j, k));
                    }
                    else {
                        voxel.setVoxel(i, j, k, newMaterial);
                    }
                }
            }
        }
    }
    return voxel;
}
function fillSpace(voxel, start, end, material, condition) {
    const getTextureId = typeof material === 'function' ? material : () => material;
    const onCondition = typeof condition === 'function' ? condition : () => true;
    traverseVoxels(voxel, start, end, (i, j, k) => {
        if (!onCondition(i, j, k)) {
            return;
        }
        voxel.setVoxel(i, j, k, getTextureId(i, j, k));
    });
}
function allocEmptyVoxels(x, y, z) {
    const voxels = (0, voxel_1.allocVoxels)(x, y, z);
    for (let i = 0; i < voxels.data.length; i++) {
        voxels.data[i] = 0;
    }
    return voxels;
}
function getElementPos(e) {
    let x = 0;
    let y = 0;
    while (e != null) {
        x += e.offsetLeft;
        y += e.offsetTop;
        e = e.offsetParent;
    }
    return {
        x,
        y,
    };
}
function mergeVoxel(a, b, start, end, type = 1) {
    const bound = boundary(start, end, [0, 0, 0], a.shape.map((v) => v - 1));
    const [minX, minY, minZ] = bound.start;
    const [maxX, maxY, maxZ] = bound.end;
    for (let i = minX; i <= maxX; i++) {
        for (let j = minY; j <= maxY; j++) {
            for (let k = minZ; k <= maxZ; k++) {
                if (type === 1) {
                    if (a.getVoxel(i, j, k) == 0) {
                        a.setVoxel(i, j, k, b.getVoxel(i, j, k));
                    }
                }
                else if (type === 2) {
                    a.setVoxel(i, j, k, b.getVoxel(i, j, k));
                }
                else if (type === 3) {
                    if (b.getVoxel(i, j, k) != 0) {
                        a.setVoxel(i, j, k, b.getVoxel(i, j, k));
                    }
                }
                else if (type === 4) {
                    if (b.getVoxel(i, j, k) != 0) {
                        a.setVoxel(i, j, k, b.getVoxel(i, j, k));
                        b.setVoxel(i, j, k, 0);
                    }
                }
                else if (type === 5) {
                    if (a.getVoxel(i, j, k) == 0) {
                        a.setVoxel(i, j, k, b.getVoxel(i, j, k));
                        b.setVoxel(i, j, k, 0);
                    }
                }
            }
        }
    }
    return function (c, s, e, t = 1) {
        return mergeVoxel(a, c, s, e, t);
    };
}
function surfaceByNormalAndPoint(p, q) {
    const tris = [];
    const A = q[0] - p[0];
    const B = q[1] - p[1];
    const C = q[2] - p[2];
    const Cx = p[0];
    const Cy = p[1];
    const Cz = p[2];
    const maxDN = Math.max(Math.abs(A), Math.abs(B), Math.abs(C));
    let vertices;
    const v = 2000;
    if (maxDN === Math.abs(A)) {
        if (A > 0) {
            vertices = [
                [v, v],
                [-v, v],
                [-v, -v],
                [v, -v],
            ];
        }
        else {
            vertices = [
                [v, v],
                [v, -v],
                [-v, -v],
                [-v, v],
            ];
        }
        for (let i = 0; i < vertices.length; i++) {
            const y = vertices[i][0];
            const z = vertices[i][1];
            const x = Cx - (B * (y - Cy) + C * (z - Cz)) / A;
            tris.push([x, y, z]);
        }
    }
    else if (maxDN === Math.abs(B)) {
        if (B > 0) {
            vertices = [
                [v, v],
                [v, -v],
                [-v, -v],
                [-v, v],
            ];
        }
        else {
            vertices = [
                [v, v],
                [-v, v],
                [-v, -v],
                [v, -v],
            ];
        }
        for (let i = 0; i < vertices.length; i++) {
            const x = vertices[i][0];
            const z = vertices[i][1];
            const y = Cy - (A * (x - Cx) + C * (z - Cz)) / B;
            tris.push([x, y, z]);
        }
    }
    else {
        if (C > 0) {
            vertices = [
                [v, v],
                [-v, v],
                [-v, -v],
                [v, -v],
            ];
        }
        else if (C < 0) {
            vertices = [
                [v, v],
                [v, -v],
                [-v, -v],
                [-v, v],
            ];
        }
        else {
            throw new Error('C should not be zero');
        }
        for (let i = 0; i < vertices.length; i++) {
            const x = vertices[i][0];
            const y = vertices[i][1];
            const z = Cz - (A * (x - Cx) + B * (y - Cy)) / C;
            tris.push([x, y, z]);
        }
    }
    return tris;
}
