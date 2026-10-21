import { AsyncMethodReturns } from 'penpal';
import type { EmitEventType, EventObject } from './event-types';
import type { Events } from './events';
interface Protocol<E extends EventObject> {
    emit: EmitEventType<E>;
    receiveHeartbeat: () => Promise<boolean>;
}
export type EmitType<T extends EventObject> = Protocol<T>['emit'];
type CurrentType = 'parent' | 'children';
export declare class IframeController<HandlerMap extends EventObject, EmitEventMap extends EventObject> {
    private events;
    isReady: boolean;
    target: AsyncMethodReturns<Protocol<EmitEventMap>> | undefined;
    private connection;
    constructor(events: Events<HandlerMap>);
    connect<T extends CurrentType>(spec: T extends 'parent' ? {
        current: T;
        eventsOn?: EmitEventType<HandlerMap>;
        iframe: HTMLIFrameElement;
        timeout?: number;
    } : {
        current: T;
        eventsOn?: EmitEventType<HandlerMap>;
        timeout?: number;
    }): Promise<boolean>;
    emitEvent: EmitType<EmitEventMap>;
    destroy(): void;
}
export {};
