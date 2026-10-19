import { GameEventChannel, GameEventFuture } from '../api/js/api';
import { ScriptScheduler } from '@box/utils/script/script-scheduler';
export declare let DISPATCHER_CREATE_COUNT: number;
export declare let DISPATCHER_DESTROY_COUNT: number;
export declare let DISPATCHER_EVENT_COUNT: number;
export declare let DISPATCHER_HANDLER_COUNT: number;
export declare let DISPATCHER_PROMISE_COUNT: number;
export declare class ScriptDispatcher<EventType> {
    handlers: {
        finished: boolean;
        inQueue: boolean;
        handler: (e: EventType) => void;
    }[];
    promise: {
        finished: boolean;
        filter?: (event: EventType) => boolean;
        resolve: (event: EventType) => void;
        reject: (e: any) => void;
    }[];
    destroyed: boolean;
    channel: GameEventChannel<EventType>;
    future: GameEventFuture<EventType>;
    oneShot: boolean;
    private _commonDestroy;
    destroy(reason: string, scheduler: ScriptScheduler): void;
    notify(ev: EventType, handleException: (e: any) => void): boolean;
    constructor(oneShot?: boolean);
}
//# sourceMappingURL=dispatcher.d.ts.map