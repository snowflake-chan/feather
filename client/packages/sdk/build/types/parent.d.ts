import { IframeController, EmitType } from './iframe';
import { EventOnType, EmitEventType, EventsType } from './event-types';
type HeartbeatOptions = {
    interval?: number;
};
export declare class Parent<K extends EventsType, E extends EventsType> {
    url: string;
    type: string;
    private dom;
    iframeElement: HTMLIFrameElement | undefined;
    iframe: IframeController<K, E>;
    private heartbeatTimer;
    private events;
    constructor(url: string, type: string);
    init(spec: {
        dom: Element;
        eventsOn?: EmitEventType<K>;
        checkHeartbeat?: boolean | HeartbeatOptions;
    }): Promise<boolean>;
    emitEvent: EmitType<E>;
    destroy(): void;
    eventOn: EventOnType<K>;
    eventOff: EventOnType<K>;
    private startCheckingHeartbeat;
    private stopCheckingHeartbeat;
    private confirmHeartbeat;
}
export {};
