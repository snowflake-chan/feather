import { GUIConfig } from '../../gui/types';
import { GamePlayerEntity } from './api';
export interface GameGUIEvent {
    entity: GamePlayerEntity;
    name: string;
    payload: any;
}
export interface GameGUIEventListener {
    (event: GameGUIEvent): void;
}
export declare class GameGUI {
    init: <T extends string, U extends T>(entity: GamePlayerEntity, config: GUIConfig<T, U>) => Promise<void>;
    show: (entity: GamePlayerEntity, name: string, allowMultiple?: boolean) => Promise<void>;
    remove: (entity: GamePlayerEntity, selector: string) => Promise<void>;
    getAttribute: (entity: GamePlayerEntity, selector: string, name: string) => Promise<any>;
    setAttribute: (entity: GamePlayerEntity, selector: string, name: string, value: any) => Promise<void>;
    onMessage: (listener: GameGUIEventListener) => void;
    ui: InstanceType<any>['ui'];
    constructor(init: <T extends string, U extends T>(entity: GamePlayerEntity, config: GUIConfig<T, U>) => Promise<void>, show: (entity: GamePlayerEntity, name: string, allowMultiple?: boolean) => Promise<void>, remove: (entity: GamePlayerEntity, selector: string) => Promise<void>, getAttribute: (entity: GamePlayerEntity, selector: string, name: string) => Promise<any>, setAttribute: (entity: GamePlayerEntity, selector: string, name: string, value: any) => Promise<void>, onMessage: (listener: GameGUIEventListener) => void);
}
