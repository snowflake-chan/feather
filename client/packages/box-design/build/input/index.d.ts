import React, { ReactNode } from 'react';
import { ComponentOptions } from '../interfaces';
type InputType = 'primary' | 'line' | 'noBorder';
export type InputSizes = 'large' | 'middle' | 'small' | 'custom';
interface InputCommonOptions extends ComponentOptions {
    type: InputType;
    size: InputSizes;
    disabled?: boolean;
    center?: boolean;
    error?: boolean;
    prefix?: ReactNode;
    suffix?: ReactNode;
    maxLength?: number;
    formatter?: (value: string) => string;
    validator?: (value: string) => boolean;
    onChange?: (value: string) => void;
    onBlur?: (value: string) => void;
    onBlurValidator?: (value: string) => boolean;
    min?: number;
    max?: number;
    precision?: number;
    mixed?: boolean;
    step?: number;
}
interface ValueType {
    string: string;
    number: number;
}
export interface InputOptions<T extends keyof ValueType> extends InputCommonOptions {
    valueType: T;
    value?: ValueType[T];
    getNewestValue?: () => ValueType[T];
}
export declare const Input: React.ForwardRefExoticComponent<InputOptions<keyof ValueType> & Omit<React.InputHTMLAttributes<HTMLInputElement>, "min" | "max" | "onChange" | "type" | "size" | "value" | "prefix" | "onBlur"> & React.RefAttributes<HTMLInputElement>>;
export {};
//# sourceMappingURL=index.d.ts.map