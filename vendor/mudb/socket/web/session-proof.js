"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuSessionProof = void 0;
const crypto_1 = require("crypto");
class MuSessionProof {
    constructor(now = Date.now) {
        this.now = now;
        this.key = (0, crypto_1.randomBytes)(32);
    }
    signature(id, expiry) {
        return (0, crypto_1.createHmac)('sha256', this.key).update(`mu-session-v1:${id}:${expiry}`).digest('hex');
    }
    issue(id) {
        const expiry = String(this.now() + 600000);
        return `${expiry}.${this.signature(id, expiry)}`;
    }
    verify(id, proof) {
        if (typeof proof !== 'string' || !/^\d{13}\.[a-f0-9]{64}$/.test(proof)) {
            return false;
        }
        const [expiry, signature] = proof.split('.');
        const time = Number(expiry);
        if (!Number.isSafeInteger(time) || time <= this.now() || time > this.now() + 600000) {
            return false;
        }
        return (0, crypto_1.timingSafeEqual)(Buffer.from(signature, 'hex'), Buffer.from(this.signature(id, expiry), 'hex'));
    }
    matches(expected, proof) {
        if (typeof proof !== 'string' || proof.length !== expected.length) {
            return false;
        }
        return (0, crypto_1.timingSafeEqual)(Buffer.from(proof), Buffer.from(expected));
    }
}
exports.MuSessionProof = MuSessionProof;
//# sourceMappingURL=session-proof.js.map