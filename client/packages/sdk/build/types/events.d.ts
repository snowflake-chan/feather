import type { EventObject } from './event-types';
export declare class Events<EventMap extends EventObject> {
    private handlers;
    addListener<EventName extends keyof EventMap>(eventName: EventName, handler: (value: EventMap[EventName]) => void): void;
    removeListener<EventName extends keyof EventMap>(eventName: EventName, handler: (value: EventMap[EventName]) => void): void;
    emit<EventName extends keyof EventMap>(eventName: EventName, value: EventMap[EventName]): void;
    removeAllListeners(): void;
}
