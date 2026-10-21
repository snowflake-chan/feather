import { ReactNode, memo, useMemo } from 'react';
import { useClassName } from '@box/box-design';

import { InlineNamedCheckbox } from '../inline-named-checkbox';

import styles from './style.module.scss';

export interface CheckboxSwitchProps {
  name: string;
  enabled: boolean;
  mixedEnabled: boolean;
  onEnabledChange: (value: boolean, mixed: boolean) => void;
  children?: ReactNode;
  className?: string;
}

function CheckboxSwitchView(props: CheckboxSwitchProps) {
  const {
    name,
    className: propsClassName,
    children: propsChildren,
    enabled,
    mixedEnabled,
    onEnabledChange,
  } = props;

  const children = useMemo<ReactNode>(() => {
    if (!propsChildren || !enabled || mixedEnabled) {
      return;
    }

    return propsChildren;
  }, [propsChildren, enabled, mixedEnabled]);

  const className = useClassName(
    [styles.checkboxSwitch, propsClassName],
    [propsClassName],
  );

  return (
    <div className={className}>
      <InlineNamedCheckbox
        name={name}
        value={enabled}
        mixed={mixedEnabled}
        onChange={onEnabledChange}
      />
      {children}
    </div>
  );
}

export const CheckboxSwitch = memo(CheckboxSwitchView);
