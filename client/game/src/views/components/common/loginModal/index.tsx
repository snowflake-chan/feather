import React from 'react';
import { intlMessage } from 'src/utils/i18n';
import { clientConfig } from 'src/config/client';
import { Icon } from '../../basic/icon';
import { messenger } from 'src/messenger';

import style from './index.module.css';

type LoginModalProps = {
  onClose: () => void;
  tips: string;
};

export const LoginModal = React.memo((props: LoginModalProps) => {
  return (
    <div className={style.wrapper} onClick={() => props.onClose()}>
      <div className={style.content_box} onClick={(ev) => ev.stopPropagation()}>
        <Icon
          icon="close-createra"
          size={24}
          className={style.closeIcon}
          onClick={props.onClose}
        />
        <p className={style.title}>{intlMessage('notLogin')}</p>
        <p className={style.tips}>{props.tips}</p>
        <span
          className={style.jumpBtn}
          onClick={() =>
            messenger.jumpTo({
              url: `${clientConfig.WEBSITE_URL}/login`,
              isLoginBack: true,
            })
          }
        >
          {intlMessage('instant-jump')}
        </span>
      </div>
    </div>
  );
});
