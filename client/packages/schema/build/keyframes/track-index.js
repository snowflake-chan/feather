"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyframeTrackIndexSchema = void 0;
exports.rebuildKeyframeTrackIndex = rebuildKeyframeTrackIndex;
exports.updateKeyframeTrackIndex = updateKeyframeTrackIndex;
const schema_1 = require("@box/mudb/schema");
const type_1 = require("./type");
function applyEasing(easing, weight) {
    switch (easing) {
        case type_1.KeyframeEaseMode.QUADRATIC:
            return Math.pow(weight, 2);
        case type_1.KeyframeEaseMode.SINE:
            return Math.sin(0.5 * Math.PI * weight);
        case type_1.KeyframeEaseMode.CIRCLE:
            return 1 - Math.sqrt(Math.max(0, 1 - Math.pow(weight, 2)));
        case type_1.KeyframeEaseMode.ELASTIC:
            if (weight <= 0.0001) {
                return 0;
            }
            else if (weight >= 0.9999) {
                return 1;
            }
            else {
                const c4 = (2 * Math.PI) / 3;
                return (-Math.pow(2, 10 * weight - 10) * Math.sin((weight * 10 - 10.75) * c4));
            }
        case type_1.KeyframeEaseMode.EXP:
            if (weight <= 0) {
                return 0;
            }
            return Math.pow(2, 10 * weight - 10);
        case type_1.KeyframeEaseMode.BOUNCE:
            const n1 = 7.5625;
            const d1 = 2.75;
            let x = 1 - weight;
            if (x < 1 / d1) {
                return 1 - n1 * Math.pow(x, 2);
            }
            else if (x < 2 / d1) {
                return 1 - (n1 * (x -= 1.5 / d1) * x + 0.75);
            }
            else if (x < 2.5 / d1) {
                return 1 - (n1 * (x -= 2.25 / d1) * x + 0.9375);
            }
            else {
                return 1 - (n1 * (x -= 2.625 / d1) * x + 0.984375);
            }
        case type_1.KeyframeEaseMode.BACK:
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return weight * weight * (c3 * weight - c1);
        case type_1.KeyframeEaseMode.NONE:
        case type_1.KeyframeEaseMode.LINEAR:
        default:
            return weight;
    }
}
exports.KeyframeTrackIndexSchema = new schema_1.MuStruct({
    // index data for keyframes
    targetId: new schema_1.MuArray(new schema_1.MuVarint(), Infinity),
    wrapMode: new schema_1.MuArray(new schema_1.MuVarint(), Infinity),
    cycleLength: new schema_1.MuArray(new schema_1.MuFloat64(), Infinity),
    loopCount: new schema_1.MuArray(new schema_1.MuFloat64(), Infinity),
    loopPhase: new schema_1.MuArray(new schema_1.MuFloat64(), Infinity),
    tickOffset: new schema_1.MuArray(new schema_1.MuQuantizedFloat(1 / 16), Infinity),
    tickScale: new schema_1.MuArray(new schema_1.MuFloat64(1), Infinity),
    dataOffset: new schema_1.MuArray(new schema_1.MuVarint(), Infinity),
    data: new schema_1.MuArray(new schema_1.MuFloat64(), Infinity),
    inEasing: new schema_1.MuArray(new schema_1.MuVarint(), Infinity),
    outEasing: new schema_1.MuArray(new schema_1.MuVarint(), Infinity),
    // tracking data goes here
    prevFrame: new schema_1.MuArray(new schema_1.MuVarint(), Infinity),
    nextFrame: new schema_1.MuArray(new schema_1.MuVarint(), Infinity),
    prevWeight: new schema_1.MuArray(new schema_1.MuFloat64(), Infinity),
    nextWeight: new schema_1.MuArray(new schema_1.MuFloat64(), Infinity),
});
function rebuildKeyframeTrackIndex(animations, tracker) {
    // reallocate lindex
    tracker.targetId.length =
        tracker.wrapMode.length =
            tracker.cycleLength.length =
                tracker.loopCount.length =
                    tracker.loopPhase.length =
                        tracker.tickOffset.length =
                            tracker.tickScale.length =
                                tracker.prevFrame.length =
                                    tracker.nextFrame.length =
                                        tracker.prevWeight.length =
                                            tracker.nextWeight.length =
                                                animations.length;
    tracker.dataOffset.length = animations.length + 1;
    // clear data array
    const data = tracker.data;
    const inEasing = tracker.inEasing;
    const outEasing = tracker.outEasing;
    data.length = inEasing.length = outEasing.length = 0;
    for (let i = 0; i < animations.length; ++i) {
        const anim = animations[i];
        tracker.targetId[i] = anim.targetId;
        tracker.dataOffset[i] = data.length;
        const frames = anim.keyframes;
        let prevTick = 0;
        for (let j = 0; j < frames.length; ++j) {
            const f = frames[j];
            data.push(prevTick);
            inEasing.push(f.easeIn);
            outEasing.push(f.easeOut);
            prevTick = f.tick;
        }
        const maxTick = prevTick;
        tracker.wrapMode[i] = anim.playbackMode;
        tracker.loopCount[i] =
            anim.cycleCount < 0 ? Infinity : maxTick * anim.cycleCount;
        tracker.loopPhase[i] = maxTick * anim.cyclePhase;
        tracker.cycleLength[i] = maxTick;
        tracker.tickOffset[i] = anim.startTick;
        tracker.tickScale[i] = maxTick / anim.cycleTicks;
        tracker.nextFrame[i] = -1;
        tracker.prevFrame[i] = -1;
        tracker.prevWeight[i] = 0;
        tracker.nextWeight[i] = 0;
    }
    // update sentinal value in data
    tracker.dataOffset[animations.length] = data.length;
}
function updateKeyframeTrackIndex(tracker, tick, deltaTick) {
    const N = tracker.wrapMode.length;
    for (let i = 0; i < N; ++i) {
        const tickOffset = tracker.tickOffset[i];
        let t = tracker.tickScale[i] * (tick - tickOffset) + tracker.loopPhase[i];
        const dt = tracker.tickScale[i] * deltaTick;
        const loopCount = tracker.loopCount[i];
        // check animation bounds
        if (tick <= tickOffset || t - dt > loopCount) {
            tracker.prevFrame[i] = tracker.nextFrame[i] = -1;
            tracker.prevWeight[i] = tracker.nextWeight[i] = 0;
            continue;
        }
        // clamp t
        t = Math.min(t, loopCount);
        // compute wrap mode and mirror state
        const cycleLength = tracker.cycleLength[i];
        const parity = (t / tracker.cycleLength[i]) & 1;
        const wrapMode = tracker.wrapMode[i];
        const flip = !!(((wrapMode >>> 1) & parity) ^ (wrapMode & 1));
        // apply wrapping
        if (t === loopCount && loopCount > 0) {
            t = cycleLength;
        }
        else {
            t %= cycleLength;
        }
        if (flip) {
            t = cycleLength - t;
        }
        // interpolation search to find predecessor index
        const dataLo = tracker.dataOffset[i];
        const dataHi = tracker.dataOffset[i + 1];
        let l = dataLo;
        let h = dataHi - 1;
        let pred = l;
        while (l < h) {
            const a = tracker.data[l];
            const b = tracker.data[h];
            const w = (t - a) / (b - a);
            const m = Math.max(l, Math.min(h, Math.round((1 - w) * l + w * h) | 0));
            const x = tracker.data[m];
            if (x <= t) {
                pred = m;
                l = m + 1;
            }
            else {
                h = m - 1;
            }
        }
        if (l === h && tracker.data[l] <= t) {
            pred = l;
        }
        // apply wrap mode boundary conditions and output pred/succ frame index
        let prevFrameIndex;
        let nextFrameIndex;
        switch (wrapMode) {
            case type_1.AnimationPlaybackMode.FORWARD:
            default:
                prevFrameIndex = pred;
                nextFrameIndex = Math.min(dataHi - 1, pred + 1);
                break;
            case type_1.AnimationPlaybackMode.REVERSE:
                nextFrameIndex = pred;
                prevFrameIndex = Math.min(dataHi - 1, pred + 1);
                break;
            case type_1.AnimationPlaybackMode.WRAP:
                prevFrameIndex = pred;
                nextFrameIndex = pred + 1 >= dataHi ? dataLo : pred + 1;
                break;
            case type_1.AnimationPlaybackMode.WRAP_REVERSE:
                nextFrameIndex = pred;
                prevFrameIndex = pred + 1 >= dataHi ? dataLo : pred + 1;
                break;
            case type_1.AnimationPlaybackMode.MIRROR:
            case type_1.AnimationPlaybackMode.MIRROR_REVERSE:
                if (flip) {
                    nextFrameIndex = pred;
                    prevFrameIndex = pred + 1 >= dataHi ? pred - 1 : pred + 1;
                }
                else {
                    prevFrameIndex = pred;
                    nextFrameIndex = pred + 1 >= dataHi ? pred - 1 : pred + 1;
                }
                break;
        }
        // write out prev and next frame
        tracker.prevFrame[i] = prevFrameIndex - dataLo;
        tracker.nextFrame[i] = nextFrameIndex - dataLo;
        // calculate weights
        if (prevFrameIndex === nextFrameIndex) {
            tracker.prevWeight[i] = 1;
            tracker.nextWeight[i] = 0;
            tracker.nextFrame[i] = -1;
        }
        else {
            // apply easing
            let t0 = tracker.data[prevFrameIndex];
            let t1 = tracker.data[nextFrameIndex];
            let prevWeight;
            if (t0 === t1) {
                prevWeight = 1;
            }
            else if (flip) {
                if (t0 < t1) {
                    t0 += cycleLength;
                }
                prevWeight = Math.max(0, Math.min(1, (t - t1) / (t0 - t1)));
            }
            else {
                if (t1 < t0) {
                    t1 += cycleLength;
                }
                prevWeight = 1 - Math.max(0, Math.min(1, (t - t0) / (t1 - t0)));
            }
            const outEasing = tracker.outEasing[prevFrameIndex];
            const inEasing = tracker.inEasing[nextFrameIndex];
            if (outEasing === type_1.KeyframeEaseMode.NONE) {
                prevWeight = 1 - applyEasing(inEasing, 1 - prevWeight);
            }
            else if (inEasing === type_1.KeyframeEaseMode.NONE) {
                prevWeight = applyEasing(outEasing, prevWeight);
            }
            else if (prevWeight > 0.5) {
                prevWeight = 1 - 0.5 * applyEasing(inEasing, 2 - 2 * prevWeight);
            }
            else {
                prevWeight = 0.5 * applyEasing(outEasing, 2 * prevWeight);
            }
            tracker.prevWeight[i] = prevWeight;
            tracker.nextWeight[i] = 1 - prevWeight;
        }
    }
}
//# sourceMappingURL=track-index.js.map