import { ScriptPerfCounter } from './scheduler-schema';
export declare function createScriptScheduler(raiseError: (e: any) => void): {
    scheduler: {
        setTimeout: (fn: Function, t: number, ...args: any[]) => number;
        setInterval: (fn: Function, t: number, ...args: any[]) => number;
        clearTimeout: (id: number) => void;
        clearInterval: (id: number) => void;
    };
    scheduleAt: (x: () => boolean, t: number) => number;
    schedule: (event: () => void) => number;
    setTime: (t: number) => void;
    poll: (stopTick: number) => boolean;
    currentMS: () => number;
    stats: (perf: ScriptPerfCounter) => void;
};
export type ScriptScheduler = ReturnType<typeof createScriptScheduler>;
//# sourceMappingURL=script-scheduler.d.ts.map