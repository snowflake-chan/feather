import React from 'react';
import { ComponentOptions } from '../interfaces';
interface TextAreaOptions extends ComponentOptions {
    value: string;
    onChange?: (value: string) => void;
    onBlur?: (value: string) => void;
}
export declare const TextArea: React.ForwardRefExoticComponent<TextAreaOptions & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value" | "onBlur"> & React.RefAttributes<HTMLTextAreaElement>>;
export {};
//# sourceMappingURL=index.d.ts.map