import { ReactNode, memo } from 'react';
import { useClassName } from '@box/box-design';
import styles from './style.module.scss';

function InlineNamedInputView(props: {
  name: string;
  children: ReactNode;
  className?: string;
}) {
  const className = useClassName(
    [styles.inlineNamedInput, props.className],
    [props.className],
  );

  return (
    <div className={className}>
      <div className={styles.name}>{props.name}</div>
      {props.children}
    </div>
  );
}

export const InlineNamedInput = memo(InlineNamedInputView);
