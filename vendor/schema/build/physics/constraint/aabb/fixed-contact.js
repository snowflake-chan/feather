"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIXED_Z_CONTACTS = exports.FIXED_Y_CONTACTS = exports.FIXED_X_CONTACTS = exports.FixedContactSet = void 0;
exports.clearFixedContacts = clearFixedContacts;
const contact_controller_1 = require("../../contact-controller");
const prepare_bodies_1 = require("../../prepare-bodies");
const def_1 = require("../../def");
class FixedContactSet {
    constructor() {
        this.outA = [0];
        this.outF = [0];
        this.outBias = [0.1];
        this.outLambda = [0.1];
        this.outFriction = [0.1];
        this.inA = [0];
        this.inF = [0];
        this.inBias = [0.1];
        this.inLambda = [0.1];
        this.inFriction = [0.1];
    }
    clear() {
        this.outA.length =
            this.outF.length =
                this.outBias.length =
                    this.outLambda.length =
                        this.outFriction.length =
                            this.inA.length =
                                this.inF.length =
                                    this.inBias.length =
                                        this.inLambda.length =
                                            this.inFriction.length =
                                                0;
    }
    push(flip, ai, fi, v, fv, depth) {
        const restitution = (0, def_1.combineRestitution)(prepare_bodies_1.CR[ai], prepare_bodies_1.FIX_CR[fi]);
        if (flip) {
            this.outA.push(ai);
            this.outF.push(fi);
            this.outBias.push(prepare_bodies_1.INV_DT * depth + restitution * (fv[fi] - v[ai]) + fv[fi]);
            this.outLambda.push(0);
        }
        else {
            this.inA.push(ai);
            this.inF.push(fi);
            this.inBias.push(prepare_bodies_1.INV_DT * depth + restitution * (v[ai] - fv[fi]) - fv[fi]);
            this.inLambda.push(0);
        }
    }
    applyFriction(du, dv, fdu, fdv) {
        const { outA, outF, outLambda, outFriction, inA, inF, inLambda, inFriction, } = this;
        outFriction.length = 2 * outA.length;
        for (let i = 0; i < outA.length; ++i) {
            const ai = outA[i];
            const fi = outF[i];
            const vu = fdu[fi] - du[ai];
            const vv = fdv[fi] - dv[ai];
            const mi = prepare_bodies_1.MASS[ai];
            const mv = prepare_bodies_1.INV_MASS[ai];
            const vmag = Math.max(def_1.FRICTION_CUTOFF, Math.sqrt(Math.pow(vu, 2) + Math.pow(vv, 2)));
            const mu = (0, def_1.combineFriction)(prepare_bodies_1.MU[ai], prepare_bodies_1.FIX_MU[fi]);
            const s = Math.min((mu * outLambda[i]) / vmag, mi);
            const fu = (outFriction[2 * i] = vu * s);
            const fv = (outFriction[2 * i + 1] = vv * s);
            du[ai] += mv * fu;
            dv[ai] += mv * fv;
        }
        inFriction.length = 2 * inA.length;
        for (let i = 0; i < inA.length; ++i) {
            const ai = inA[i];
            const fi = inF[i];
            const vu = fdu[ai] - du[fi];
            const vv = fdv[ai] - dv[fi];
            const mi = prepare_bodies_1.MASS[ai];
            const mv = prepare_bodies_1.INV_MASS[ai];
            const vmag = Math.max(def_1.FRICTION_CUTOFF, Math.sqrt(Math.pow(vu, 2) + Math.pow(vv, 2)));
            const mu = (0, def_1.combineFriction)(prepare_bodies_1.MU[ai], prepare_bodies_1.FIX_MU[fi]);
            const s = Math.min((mu * inLambda[i]) / vmag, mi);
            const fu = (inFriction[2 * i] = vu * s);
            const fv = (inFriction[2 * i + 1] = vv * s);
            du[ai] += mv * fu;
            dv[ai] += mv * fv;
        }
    }
    updateIndex(d) {
        const { outA, outF, outLambda, outFriction, inA, inF, inLambda, inFriction, } = this;
        for (let i = 0; i < outLambda.length; ++i) {
            const bi = outA[i];
            const ai = outF[i];
            const aRecord = prepare_bodies_1.FIXED_CONTACTS[ai];
            const bRecord = prepare_bodies_1.ACTIVE_CONTACTS[bi];
            if (!aRecord && !bRecord) {
                continue;
            }
            const body = prepare_bodies_1.ACTIVE_BODIES[bi];
            const lambda = outLambda[i] * prepare_bodies_1.INV_DT;
            if (lambda < def_1.CONTACT_CUTOFF) {
                continue;
            }
            const frictionU = outFriction[2 * i] * prepare_bodies_1.INV_DT;
            const frictionV = outFriction[2 * i + 1] * prepare_bodies_1.INV_DT;
            const aId = prepare_bodies_1.FIXED_BODIES[ai].id;
            const bId = body.id;
            if (aRecord) {
                (0, contact_controller_1.addBodyContactRecordByAABBContact)(aRecord, bId, -1, d, -lambda, -frictionU, -frictionV);
            }
            if (bRecord) {
                (0, contact_controller_1.addBodyContactRecordByAABBContact)(bRecord, aId, 1, d, lambda, frictionU, frictionV);
            }
        }
        for (let i = 0; i < inLambda.length; ++i) {
            const ai = inA[i];
            const bi = inF[i];
            const aRecord = prepare_bodies_1.ACTIVE_CONTACTS[ai];
            const bRecord = prepare_bodies_1.FIXED_CONTACTS[bi];
            if (!aRecord && !bRecord) {
                continue;
            }
            const body = prepare_bodies_1.ACTIVE_BODIES[ai];
            const lambda = inLambda[i] * prepare_bodies_1.INV_DT;
            if (lambda < def_1.CONTACT_CUTOFF) {
                continue;
            }
            const frictionU = inFriction[2 * i] * prepare_bodies_1.INV_DT;
            const frictionV = inFriction[2 * i + 1] * prepare_bodies_1.INV_DT;
            const aId = body.id;
            const bId = prepare_bodies_1.FIXED_BODIES[bi].id;
            if (aRecord) {
                (0, contact_controller_1.addBodyContactRecordByAABBContact)(aRecord, bId, -1, d, -lambda, -frictionU, -frictionV);
            }
            if (bRecord) {
                (0, contact_controller_1.addBodyContactRecordByAABBContact)(bRecord, aId, 1, d, lambda, frictionU, frictionV);
            }
        }
    }
}
exports.FixedContactSet = FixedContactSet;
exports.FIXED_X_CONTACTS = new FixedContactSet();
exports.FIXED_Y_CONTACTS = new FixedContactSet();
exports.FIXED_Z_CONTACTS = new FixedContactSet();
function clearFixedContacts() {
    exports.FIXED_X_CONTACTS.clear();
    exports.FIXED_Y_CONTACTS.clear();
    exports.FIXED_Z_CONTACTS.clear();
}
