import { addBodyContactRecordByAABBContact } from '../../contact-controller';
import {
  ArrayType,
  INV_MASS,
  CR,
  INV_DT,
  ACTIVE_BODIES,
  ACTIVE_CONTACTS,
  FIXED_CONTACTS,
  FIXED_BODIES,
  MASS,
  MU,
  FIX_MU,
  FIX_CR,
} from '../../prepare-bodies';
import {
  combineRestitution,
  combineFriction,
  FRICTION_CUTOFF,
  CONTACT_CUTOFF,
} from '../../def';

export class FixedContactSet {
  public outA: number[] = [0];
  public outF: number[] = [0];
  public outBias: number[] = [0.1];
  public outLambda: number[] = [0.1];
  public outFriction: number[] = [0.1];

  public inA: number[] = [0];
  public inF: number[] = [0];
  public inBias: number[] = [0.1];
  public inLambda: number[] = [0.1];
  public inFriction: number[] = [0.1];

  public clear() {
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

  public push(
    flip: boolean,
    ai: number,
    fi: number,
    v: ArrayType,
    fv: ArrayType,
    depth: number,
  ) {
    const restitution = combineRestitution(CR[ai], FIX_CR[fi]);
    if (flip) {
      this.outA.push(ai);
      this.outF.push(fi);
      this.outBias.push(
        INV_DT * depth + restitution * (fv[fi] - v[ai]) + fv[fi],
      );
      this.outLambda.push(0);
    } else {
      this.inA.push(ai);
      this.inF.push(fi);
      this.inBias.push(
        INV_DT * depth + restitution * (v[ai] - fv[fi]) - fv[fi],
      );
      this.inLambda.push(0);
    }
  }

  public applyFriction(
    du: ArrayType,
    dv: ArrayType,
    fdu: ArrayType,
    fdv: ArrayType,
  ) {
    const {
      outA,
      outF,
      outLambda,
      outFriction,
      inA,
      inF,
      inLambda,
      inFriction,
    } = this;
    outFriction.length = 2 * outA.length;
    for (let i = 0; i < outA.length; ++i) {
      const ai = outA[i];
      const fi = outF[i];
      const vu = fdu[fi] - du[ai];
      const vv = fdv[fi] - dv[ai];
      const mi = MASS[ai];
      const mv = INV_MASS[ai];
      const vmag = Math.max(
        FRICTION_CUTOFF,
        Math.sqrt(Math.pow(vu, 2) + Math.pow(vv, 2)),
      );
      const mu = combineFriction(MU[ai], FIX_MU[fi]);
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
      const mi = MASS[ai];
      const mv = INV_MASS[ai];
      const vmag = Math.max(
        FRICTION_CUTOFF,
        Math.sqrt(Math.pow(vu, 2) + Math.pow(vv, 2)),
      );
      const mu = combineFriction(MU[ai], FIX_MU[fi]);
      const s = Math.min((mu * inLambda[i]) / vmag, mi);
      const fu = (inFriction[2 * i] = vu * s);
      const fv = (inFriction[2 * i + 1] = vv * s);
      du[ai] += mv * fu;
      dv[ai] += mv * fv;
    }
  }

  public updateIndex(d: number) {
    const {
      outA,
      outF,
      outLambda,
      outFriction,
      inA,
      inF,
      inLambda,
      inFriction,
    } = this;
    for (let i = 0; i < outLambda.length; ++i) {
      const bi = outA[i];
      const ai = outF[i];
      const aRecord = FIXED_CONTACTS[ai];
      const bRecord = ACTIVE_CONTACTS[bi];
      if (!aRecord && !bRecord) {
        continue;
      }
      const body = ACTIVE_BODIES[bi];
      const lambda = outLambda[i] * INV_DT;
      if (lambda < CONTACT_CUTOFF) {
        continue;
      }
      const frictionU = outFriction[2 * i] * INV_DT;
      const frictionV = outFriction[2 * i + 1] * INV_DT;
      const aId = FIXED_BODIES[ai].id;
      const bId = body.id;
      if (aRecord) {
        addBodyContactRecordByAABBContact(
          aRecord,
          bId,
          -1,
          d,
          -lambda,
          -frictionU,
          -frictionV,
        );
      }
      if (bRecord) {
        addBodyContactRecordByAABBContact(
          bRecord,
          aId,
          1,
          d,
          lambda,
          frictionU,
          frictionV,
        );
      }
    }
    for (let i = 0; i < inLambda.length; ++i) {
      const ai = inA[i];
      const bi = inF[i];
      const aRecord = ACTIVE_CONTACTS[ai];
      const bRecord = FIXED_CONTACTS[bi];
      if (!aRecord && !bRecord) {
        continue;
      }
      const body = ACTIVE_BODIES[ai];
      const lambda = inLambda[i] * INV_DT;
      if (lambda < CONTACT_CUTOFF) {
        continue;
      }
      const frictionU = inFriction[2 * i] * INV_DT;
      const frictionV = inFriction[2 * i + 1] * INV_DT;
      const aId = body.id;
      const bId = FIXED_BODIES[bi].id;
      if (aRecord) {
        addBodyContactRecordByAABBContact(
          aRecord,
          bId,
          -1,
          d,
          -lambda,
          -frictionU,
          -frictionV,
        );
      }
      if (bRecord) {
        addBodyContactRecordByAABBContact(
          bRecord,
          aId,
          1,
          d,
          lambda,
          frictionU,
          frictionV,
        );
      }
    }
  }
}

export const FIXED_X_CONTACTS = new FixedContactSet();
export const FIXED_Y_CONTACTS = new FixedContactSet();
export const FIXED_Z_CONTACTS = new FixedContactSet();

export function clearFixedContacts() {
  FIXED_X_CONTACTS.clear();
  FIXED_Y_CONTACTS.clear();
  FIXED_Z_CONTACTS.clear();
}
