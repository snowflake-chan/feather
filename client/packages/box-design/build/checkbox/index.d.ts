import React from 'react';
type SizeType = 'large' | 'medium' | 'small';
export type CheckboxProps = {
    value: boolean;
    mixed: boolean;
    onChange: (value: boolean, mixed: boolean) => void;
    size?: SizeType;
};
declare function CheckboxView(props: CheckboxProps): React.JSX.Element;
export declare const Checkbox: React.MemoExoticComponent<typeof CheckboxView>;
export {};
//# sourceMappingURL=index.d.ts.map