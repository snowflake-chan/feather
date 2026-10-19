import { EventEmitter } from './events';
export type ScreenResizeEvent = {
    screenWidth: number;
    screenHeight: number;
};
export type ScreenEvents = {
    resize: ScreenResizeEvent;
};
export declare class ClientScreen {
    readonly events: EventEmitter<ScreenEvents>;
    onResize(evt: ScreenResizeEvent): void;
}
export declare const screen: ClientScreen;
//# sourceMappingURL=screen.d.ts.map