import { IframeController, EmitType } from './iframe';
import { EmitEventType, EventOnType, EventObject, CallAsyncType } from './event-types';
import { WebviewController } from './webview';
export declare class Children<K extends EventObject, E extends EventObject> {
    private events;
    iframe: IframeController<K, E>;
    webview: WebviewController<K, E>;
    constructor();
    connect(eventsOn?: EmitEventType<K>): Promise<boolean>;
    emitEvent: EmitType<E>;
    callAsync: CallAsyncType<E>;
    destroy(): void;
    isInIframe(): boolean;
    isInWebviewOrRusty(): any;
    isInIosWebview(): any;
    eventOn: EventOnType<K>;
    eventOff: EventOnType<K>;
}
