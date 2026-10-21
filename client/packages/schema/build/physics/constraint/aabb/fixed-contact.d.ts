import { ArrayType } from '../../prepare-bodies';
export declare class FixedContactSet {
    outA: number[];
    outF: number[];
    outBias: number[];
    outLambda: number[];
    outFriction: number[];
    inA: number[];
    inF: number[];
    inBias: number[];
    inLambda: number[];
    inFriction: number[];
    clear(): void;
    push(flip: boolean, ai: number, fi: number, v: ArrayType, fv: ArrayType, depth: number): void;
    applyFriction(du: ArrayType, dv: ArrayType, fdu: ArrayType, fdv: ArrayType): void;
    updateIndex(d: number): void;
}
export declare const FIXED_X_CONTACTS: FixedContactSet;
export declare const FIXED_Y_CONTACTS: FixedContactSet;
export declare const FIXED_Z_CONTACTS: FixedContactSet;
export declare function clearFixedContacts(): void;
//# sourceMappingURL=fixed-contact.d.ts.map