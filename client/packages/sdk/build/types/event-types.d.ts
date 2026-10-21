import { AuthEventType, ChildrenEventType, ErrorType } from './defs';
export type EventsType = {
    status: 'ready' | 'started' | 'closed';
    jumpTo: {
        url: string;
        isNewTab: boolean;
        isLoginBack: boolean;
    };
    loaded: undefined;
    error: ErrorEvent;
    auth: AuthEvent;
    children: ChildrenEvent;
};
export type EventObject = {
    [key: string]: any;
};
export type EventOnType<K extends EventObject = EventsType> = <T extends keyof K>(key: T, handler: (value: K[T]) => void) => void;
export type EmitEventType<E extends EventObject = EventsType> = <T extends keyof E>(key: T, value?: E[T], callback?: (res: unknown) => void) => void;
export type CallAsyncType<E extends EventObject = EventsType> = <T extends keyof E>(key: T, value?: E[T]) => Promise<unknown>;
export type ErrorEvent = {
    type: ErrorType;
    msg?: string;
};
export type AuthEvent = {
    type: AuthEventType.Unauthorized;
    msg?: string;
} | {
    type: AuthEventType.UpdateToken;
    value: string;
};
export type ChildrenEvent = {
    type: ChildrenEventType;
    msg?: string;
};
