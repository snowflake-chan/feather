import styles from './style.module.scss';
import React from 'react';
import { useIntl } from 'react-intl';

export function DefaultTag() {
  const intl = useIntl();

  return (
    <div className={styles.defaultTag}>
      {intl.formatMessage({ id: 'gameUIScreenDefault' })}
    </div>
  );
}
