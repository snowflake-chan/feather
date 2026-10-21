import { GUIData } from './element';

export interface GUIBind<T extends string> {
  event: string;
  selector?: string;
  action: T;
}
export interface GUIBindDefinition<T> {
  drag: {
    attributes: {
      [name: string]: 'x' | '-x' | 'y' | '-y';
    };
    targetSelector: string;
  };
  show: {
    name: T;
    allowMultiple?: boolean;
  };
  remove: {
    targetSelector: string;
  };
  sendMessage: {
    messageName: string;
    messageData?: string[];
  };
  clipboardWrite: {
    targetSelector: string;
    attributeName: string;
  };
}

export type GUIBindTypeMap<T> = {
  [key in keyof GUIBindDefinition<T>]: GUIBind<key> & GUIBindDefinition<T>[key];
};

export type GUIBindTypes<T> = GUIBindTypeMap<T>[keyof GUIBindTypeMap<T>];

export interface GUIConfigItem<T extends string> {
  display?: boolean;
  bindings?: GUIBindTypes<T>[];
  data: string | GUIData;
}

export type GUIConfig<T extends string, U extends T> = {
  [name in T]: GUIConfigItem<U>;
};
