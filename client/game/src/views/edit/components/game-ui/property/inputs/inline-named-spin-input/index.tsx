import { memo } from 'react';
import { SpinInput, SpinInputProps } from '../spin-input';
import { InlineNamedInput } from '../inline-named-input';
import styles from './style.module.scss';

interface Props extends SpinInputProps {
  name: string;
}

function InlineNamedSpinInputView(props: Props) {
  const { name, ...remain } = props;

  return (
    <InlineNamedInput name={name}>
      <SpinInput className={styles.input} {...remain} />
    </InlineNamedInput>
  );
}

export const InlineNamedSpinInput = memo(InlineNamedSpinInputView);
