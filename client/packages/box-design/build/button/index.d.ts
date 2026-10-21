import React, { ReactNode } from 'react';
import { ComponentOptions } from '../interfaces';
type ButtonType = 'primary' | 'secondary' | 'text' | 'warning' | 'hyperLink' | 'icon';
type SizeType = 'large' | 'medium' | 'small' | 'custom';
interface ButtonOptions extends ComponentOptions {
    type?: ButtonType;
    size?: SizeType;
    activated?: boolean;
    background?: boolean;
    loading?: boolean;
    icon?: string | ReactNode;
    children?: ReactNode;
}
export declare const Button: React.NamedExoticComponent<ButtonOptions & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> & React.RefAttributes<HTMLButtonElement>>;
export {};
//# sourceMappingURL=index.d.ts.map