import type { EmitEventType, EventObject } from './event-types';
import { Events } from './events';
export declare class WebviewController<HandlerMap extends EventObject, EmitEventMap extends EventObject> {
    private events;
    constructor(events: Events<HandlerMap>);
    isReady: boolean;
    isInRusty(): string | undefined;
    isInIosWebview(): any;
    isInWebviewOrRusty(): any;
    connect(eventsOn?: EmitEventType<HandlerMap>): Promise<boolean>;
    emitEvent: EmitEventType<EmitEventMap>;
}
