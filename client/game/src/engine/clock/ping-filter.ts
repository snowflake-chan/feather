// ping = average of all samples within +/- standard deviation of median
const scratchBuffer:number[] = [];
function compareNum (a:number, b:number) { return a - b; }
export function estimateDelay (samples:number[]) {
    if (samples.length <= 0) {
        return 0;
    }
    const N = scratchBuffer.length = samples.length;
    let m0 = 0;
    let m1 = 0;
    for (let i = 0; i < N; ++i) {
        const x = scratchBuffer[i] = samples[i];
        m0 += x;
        m1 += x * x;
    }
    m0 /= N;
    m1 /= N;
    const sigma2 = m1 - m0 * m0;
    if (sigma2 <= 0) {
        return m0;
    }
    const sigma = Math.sqrt(sigma2);
    scratchBuffer.sort(compareNum);
    const med = scratchBuffer[N >>> 1];
    let total = 0;
    let count = 0;
    for (let i = 0; i < samples.length; ++i) {
        const x = samples[i];
        if (Math.abs(x - med) <= sigma) {
            total += x;
            count ++;
        }
    }
    if (count <= 0) {
        return med;
    }
    return total / count;
}
