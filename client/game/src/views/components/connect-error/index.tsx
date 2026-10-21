import React from 'react';
import { Image } from '../image';

import { CloseType } from 'src/engine/game-client-schema';
import { clientConfig } from 'src/config/client';
import { Button } from '../game/button';
import { Modal } from '../edit/modal';
import { intlMessage } from 'src/utils/i18n';
import errorImage from 'src/assets/error_image.png';
import { GameEntryBackgroundImage } from '../landing/LandingBackground';
import style from './index.module.css';
import { messenger } from 'src/messenger';

export type PlayErrorProps = {
  intl: any;
  userId: number;
  errorType: CloseType;
  contentId: number;
  storeImageFile: (file: File) => Promise<string>;
};

export function ConnectError(props: PlayErrorProps) {
  const handleJumpWebsite = () => {
    messenger.jumpTo({ url: clientConfig.HOME_URL });
  };

  const getErrorTypeTitleAndMessage = () => {
    const { errorType } = props;
    switch (errorType) {
      case CloseType.Max: {
        return {
          title: intlMessage('serverMax'),
          message: intlMessage('serverMaxTip'),
        };
      }
      case CloseType.Network: {
        return {
          title: intlMessage('networkError'),
          message: intlMessage('networkErrorTip'),
        };
      }
      case CloseType.Webgl: {
        return {
          title: intlMessage('webglError'),
          message: intlMessage('webglErrorTip'),
        };
      }
      case CloseType.Server:
      default: {
        return {
          title: intlMessage('serverError'),
          message: intlMessage('serverErrorTip'),
        };
      }
    }
  };

  const { title, message } = getErrorTypeTitleAndMessage();

  let renderContent = <></>;

  const renderNoAuth = () => {
    return (
      <Modal
        width={400}
        title={intlMessage('cannotAccess')}
        visible
        confirm={intlMessage('backToWebsite')}
        disableBackgroundClick
        handleConfirm={handleJumpWebsite}
      >
        {intlMessage('noAuth')}
      </Modal>
    );
  };

  const renderLinkExpired = () => {
    return (
      <Modal
        width={400}
        title={intlMessage('invalidLink')}
        visible
        confirm={intlMessage('backToWebsite')}
        disableBackgroundClick
        handleConfirm={handleJumpWebsite}
      >
        {intlMessage('linkExpired')}
      </Modal>
    );
  };

  const renderErrorPage = () => {
    return (
      <div className={style.errorContainer}>
        <Image width={160} height={160} src={errorImage} />
        <div className={style.errorTitle}>{title}</div>
        <div className={style.errorMessage}>{message}</div>
        {props.errorType !== CloseType.Webgl && (
          <Button
            value={intlMessage('relink')}
            onClick={() => {
              location.reload();
            }}
            type="primary"
          />
        )}
      </div>
    );
  };

  switch (props.errorType) {
    case CloseType.NoAuth: {
      renderContent = renderNoAuth();
      break;
    }
    case CloseType.LinkExpired: {
      renderContent = renderLinkExpired();
      break;
    }
    default: {
      renderContent = renderErrorPage();
    }
  }

  return (
    <div className={style.errorWrapper}>
      <GameEntryBackgroundImage imageHash={clientConfig.mapInfo.image} />
      {renderContent}
    </div>
  );
}
