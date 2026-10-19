"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeltaListSchema = DeltaListSchema;
exports.deltaList = deltaList;
exports.patchList = patchList;
exports.patchListDelta = patchListDelta;
exports.DeltaSchema = DeltaSchema;
exports.deltaItem = deltaItem;
exports.patchItem = patchItem;
const schema_1 = require("@box/mudb/schema");
const id_1 = require("../id");
const sorted_array_remove_1 = require("../sorted-array-remove");
function DeltaListSchema(schema) {
    return new schema_1.MuStruct({
        upserts: schema,
        remove: new schema_1.MuArray(new schema_1.MuUint32(0), Infinity),
    });
}
function deltaList(schema, out, base, target) {
    for (let i = 0; i < out.upserts.length; ++i) {
        schema.free(out.upserts[i]);
    }
    out.upserts.length = 0;
    out.remove.length = 0;
    let bptr = 0;
    let tptr = 0;
    while (bptr < base.length && tptr < target.length) {
        const b = base[bptr];
        const t = target[tptr];
        if (b.id < t.id) {
            out.remove.push(b.id);
            bptr++;
        }
        else if (t.id < b.id) {
            out.upserts.push(schema.clone(t));
            tptr++;
        }
        else {
            if (!schema.equal(b, t)) {
                out.upserts.push(schema.clone(t));
            }
            tptr++;
            bptr++;
        }
    }
    while (tptr < target.length) {
        out.upserts.push(schema.clone(target[tptr++]));
    }
    while (bptr < base.length) {
        out.remove.push(base[bptr++].id);
    }
}
function patchList(schema, base, patch) {
    if (patch.remove.length !== 0) {
        (0, sorted_array_remove_1.sortedArrayDelete)(schema, base, patch.remove);
    }
    if (patch.upserts.length !== 0) {
        let pptr = 0;
        let bptr = 0;
        const PL = patch.upserts.length;
        const BL = base.length;
        while (bptr < BL && pptr < PL) {
            const p = patch.upserts[pptr];
            const b = base[bptr];
            if (b.id < p.id) {
                bptr++;
            }
            else if (p.id < b.id) {
                base.push(schema.clone(p));
                pptr++;
            }
            else {
                if (!schema.equal(b, p)) {
                    base[bptr] = schema.assign(b, p);
                }
                bptr++;
                pptr++;
            }
        }
        while (pptr < PL) {
            base.push(schema.clone(patch.upserts[pptr++]));
        }
        base.sort(id_1.compareId);
    }
}
function patchListDelta(schema, base, patch) {
    if (patch.remove.length !== 0) {
        (0, sorted_array_remove_1.sortedArrayDelete)(schema, base, patch.remove);
    }
    if (patch.upserts.length !== 0) {
        let pptr = 0;
        let bptr = 0;
        const PL = patch.upserts.length;
        const BL = base.length;
        while (bptr < BL && pptr < PL) {
            const p = patch.upserts[pptr];
            const b = base[bptr];
            if (b.id < p.id) {
                bptr++;
            }
            else if (p.id < b.id) {
                base.push(schema.clone(p));
                pptr++;
            }
            else {
                if (!schema.equal(b, p)) {
                    base[bptr] = schema.assign(b, p);
                }
                bptr++;
                pptr++;
            }
        }
        while (pptr < PL) {
            base.push(schema.clone(patch.upserts[pptr++]));
        }
        base.sort(id_1.compareId);
    }
}
function DeltaSchema(schema) {
    return new schema_1.MuStruct({
        patch: schema,
        changed: new schema_1.MuBoolean(false),
    });
}
function deltaItem(schema, out, base, target) {
    if (schema.equal(base, target)) {
        out.changed = false;
    }
    else {
        out.patch = schema.assign(out.patch, target);
        out.changed = true;
    }
}
function patchItem(schema, base, patch) {
    if (patch.changed) {
        return schema.assign(base, patch.patch);
    }
    return base;
}
