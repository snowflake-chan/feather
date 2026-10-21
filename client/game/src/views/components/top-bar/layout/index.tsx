import type { JSX } from 'react';
import styles from './topBar.module.css';

interface Props {
  left?: JSX.Element;
  center?: JSX.Element;
  right?: JSX.Element;
}

export function Layout(props: Props) {
  return (
    <div className={styles.topBarWrapper}>
      <>{props.left}</>
      <>{props.center}</>
      <div className={styles.group}>{props.right}</div>
    </div>
  );
}
