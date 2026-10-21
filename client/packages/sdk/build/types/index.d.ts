import { Parent } from './parent';
import { Children } from './children';
import { EventsType } from './event-types';
export type { Children } from './children';
export type { Parent } from './parent';
export * from './defs';
export * from './event-types';
export declare function create<K extends EventsType, E extends EventsType>(param: {
    type: string;
    url: string;
}): Parent<K, E>;
export declare function createTool<K extends EventsType, E extends EventsType>(): Children<K, E>;
