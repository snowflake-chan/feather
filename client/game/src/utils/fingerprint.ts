import FingerprintJS, { GetResult } from '@fingerprintjs/fingerprintjs';
let fingerprint:Promise<GetResult> | undefined;

export async function getFingerprint() {
    if (!fingerprint) {
        const fp = await FingerprintJS.load();
        fingerprint = fp.get();
    }
    return fingerprint;
}