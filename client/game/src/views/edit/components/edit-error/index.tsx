import React, { useEffect } from 'react';
import styles from './index.module.css';
import { intlMessage } from 'src/utils/i18n';
import { Button, Modal } from '@box/box-design';

export const EditConnectError = React.memo(() => {
  useEffect(() => {
    Modal.destroyAll();
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.logo}></div>
      <div className={styles.bottom}>
        <Button
          size={'large'}
          type="primary"
          onClick={() => {
            location.reload();
          }}
        >
          {intlMessage('relink')}
        </Button>
      </div>
    </div>
  );
});

EditConnectError.displayName = 'EditConnecting';
