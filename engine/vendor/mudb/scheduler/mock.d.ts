import { MuScheduler, MuRequestAnimationFrame, MuCancelAnimationFrame, MuRequestIdleCallback, MuCancelIdleCallback, MuProcessNextTick } from './scheduler';
export declare class MuMockScheduler implements MuScheduler {
    private _eventQueue;
    private _timeoutCounter;
    private _mockMSCounter;
    private _idToEvent;
    now(): number;
    poll(): boolean;
    setTimeout: (callback: () => void, ms: number) => number;
    clearTimeout: (id: number) => void;
    setInterval: (callback: () => void, ms: number) => number;
    clearInterval: (id: number) => void;
    private _rAFLast;
    requestAnimationFrame: MuRequestAnimationFrame;
    cancelAnimationFrame: MuCancelAnimationFrame;
    requestIdleCallback: MuRequestIdleCallback;
    cancelIdleCallback: MuCancelIdleCallback;
    nextTick: MuProcessNextTick;
}
//# sourceMappingURL=mock.d.ts.map