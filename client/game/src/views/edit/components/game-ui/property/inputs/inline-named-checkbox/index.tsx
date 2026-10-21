import { memo } from 'react';
import { Checkbox, CheckboxProps } from '@box/box-design';
import { InlineNamedInput } from '../inline-named-input';
import styles from './style.module.scss';

interface Props extends CheckboxProps {
  name: string;
}

function InlineNamedCheckboxView(props: Props) {
  const { name, ...checkboxProps } = props;

  return (
    <InlineNamedInput name={name} className={styles.inlineNamedCheckbox}>
      <Checkbox {...checkboxProps} />
    </InlineNamedInput>
  );
}

export const InlineNamedCheckbox = memo(InlineNamedCheckboxView);
