import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

/** A session ID is an identifier, not permission to join its transport. */
export class MuSessionProof {
    private key = randomBytes(32);
    constructor(private now:() => number = Date.now) {}
    private signature(id:string, expiry:string) {
        return createHmac('sha256', this.key).update(`mu-session-v1:${id}:${expiry}`).digest('hex');
    }
    issue(id:string) {
        const expiry = String(this.now() + 600000);
        return `${expiry}.${this.signature(id, expiry)}`;
    }
    verify(id:string, proof:unknown) {
        if (typeof proof !== 'string' || !/^\d{13}\.[a-f0-9]{64}$/.test(proof)) { return false; }
        const [expiry, signature] = proof.split('.');
        const time = Number(expiry);
        if (!Number.isSafeInteger(time) || time <= this.now() || time > this.now() + 600000) { return false; }
        return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(this.signature(id, expiry), 'hex'));
    }
    matches(expected:string, proof:unknown) {
        if (typeof proof !== 'string' || proof.length !== expected.length) { return false; }
        return timingSafeEqual(Buffer.from(proof), Buffer.from(expected));
    }
}
