export declare class EventBus<EventT> {
    handlers: ((e: EventT) => void)[];
    nextHandlers: ((e: EventT) => void)[];
    notify(e: EventT): void;
    sub(handler: (e: EventT) => void): void;
    unsub(handler: (e: EventT) => void): void;
    unsubAll(): void;
    next(handler: (e: EventT) => void): void;
}
//# sourceMappingURL=event.d.ts.map