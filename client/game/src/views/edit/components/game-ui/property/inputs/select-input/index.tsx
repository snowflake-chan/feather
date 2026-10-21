import { memo } from 'react';
import { Select, SelectProps } from '@box/box-design';
import styles from './style.module.scss';
import { InlineNamedInput } from '../inline-named-input';
import { calc_class_name } from 'src/utils/classname';

export interface SelectInputProps extends SelectProps {
  name: string;
}

function InlineSelectInputView(props: SelectInputProps) {
  const {
    name,
    mixed,
    selection,
    items,
    onSelect,
    className: optionClassName,
  } = props;

  return (
    <InlineNamedInput
      name={name}
      className={calc_class_name(styles.selectInput, optionClassName)}
    >
      <Select
        mixed={mixed}
        selection={selection}
        items={items}
        onSelect={onSelect}
      />
    </InlineNamedInput>
  );
}

export const InlineSelectInput = memo(InlineSelectInputView);
