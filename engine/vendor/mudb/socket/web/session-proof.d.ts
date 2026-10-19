export declare class MuSessionProof {
    private now;
    private key;
    constructor(now?: () => number);
    private signature;
    issue(id: string): string;
    verify(id: string, proof: unknown): boolean;
    matches(expected: string, proof: unknown): boolean;
}
//# sourceMappingURL=session-proof.d.ts.map