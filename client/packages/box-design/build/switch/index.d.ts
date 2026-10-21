import React from 'react';
import { ComponentOptions } from '../interfaces';
export interface SwitchOptions extends ComponentOptions {
    defaultChecked?: boolean;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
}
export declare function Switch(options: SwitchOptions): React.JSX.Element;
//# sourceMappingURL=index.d.ts.map