import React, { useEffect, useRef, useState } from 'react';

import { Toast } from '@box/box-design';
import { URL } from '@box/schema/api/js/url';
import { InputPauseFlags } from '@box/schema/input/input-schema';

import { HrefClient } from 'src/engine/href/href-client';
import { HyperLink as HyperLinkType } from 'src/engine/href/href-client-state';
import { messenger } from 'src/messenger';
import { copyToClipboard } from 'src/utils/copy2clipboard';
import { intlMessage } from 'src/utils/i18n';
import { isInternalURL } from 'src/utils/url-helpers';
import { Icon } from '../basic/icon';
import { Modal } from '../edit/modal';
import { InputPause, useInputPause } from '../input-lock';

import styles from './index.module.css';
interface Props {
  href: HrefClient;
  hyperLink: HyperLinkType;
  owner: number;
  isPlay: boolean;
}

enum ConfirmType {
  teleportToMap,
  teleportToOutside,
}

export const HyperLink = React.memo((props: Props) => {
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState<ConfirmType>(
    ConfirmType.teleportToMap,
  );
  const [loading, setLoading] = useState(false);
  const [tip, setTips] = useState('');
  const url = useRef<string>('');

  const { inputPauseChange } = useInputPause();
  useEffect(() => {
    if (props.hyperLink.href) {
      if (!props.hyperLink.isConfirm) {
        messenger.jumpTo({
          url: url.current || props.hyperLink.href,
          isNewTab: props.hyperLink.isNewTab,
        });
        props.href.clearHyperLink();
      } else {
        setShowModal(true);
        setLoading(true);
        const match = getMatchRoute(props.hyperLink.href);
        if (isInternalURL(props.hyperLink.href) && match) {
          const pathname = new URL(props.hyperLink.href).pathname;
          replaceDomain(window.location.href, props.hyperLink.href);
          switch (match) {
            case '/p': {
              setConfirmText(ConfirmType.teleportToMap);
              setTips(intlMessage('normalRequest'));
              setLoading(false);
              break;
            }
            default: {
              setShowModal(false);
            }
          }
        } else {
          setTips(intlMessage('normalRequest'));
          setConfirmText(ConfirmType.teleportToOutside);
          setLoading(false);
          setShowModal(true);
        }
      }
    } else {
      setShowModal(false);
    }
  }, [props.hyperLink.href]);

  useEffect(() => {
    return () => {
      props.href.clearHyperLink();
    };
  }, []);

  const replaceDomain = (link, targetLink) => {
    const { hostname } = new URL(link);
    const targetUrl = new URL(targetLink);
    targetUrl.hostname = hostname;
    url.current = targetUrl.href;
  };

  const copyLink = () => {
    copyToClipboard(props.hyperLink.href);
    Toast.success({ content: intlMessage('copySuccess') });
  };

  const catchEvent = () => {
    setTips(intlMessage('normalRequest'));
    setConfirmText(ConfirmType.teleportToOutside);
    setLoading(false);
    setShowModal(true);
  };

  return (
    <Modal
      title={intlMessage('portal')}
      visible={showModal}
      confirm={
        confirmText === ConfirmType.teleportToMap
          ? intlMessage('teleport')
          : intlMessage('open')
      }
      cancel={intlMessage('cancel')}
      disableConfirm={loading}
      handleConfirm={() => {
        messenger.jumpTo({
          url: url.current || props.hyperLink.href,
          isNewTab: props.hyperLink.isNewTab,
        });
        url.current = '';
        props.href.clearHyperLink();
        setShowModal(false);
      }}
      handleCancel={() => {
        props.href.clearHyperLink();
        setShowModal(false);
      }}
      width={400}
      contentNoOverlay={loading}
      footer={loading ? <></> : undefined}
    >
      {showModal && (
        <InputPause flags={InputPauseFlags.ALL} change={inputPauseChange} />
      )}
      {loading ? (
        <Icon className={styles.loadingWrapper} size={32} icon="loading" />
      ) : (
        <>
          {confirmText === ConfirmType.teleportToMap && tip}
          {confirmText === ConfirmType.teleportToOutside && (
            <div>
              {tip}
              <div className={styles.link}>
                <span onClick={copyLink}>{props.hyperLink.href}</span>
                <div className={styles.copyIcon} onClick={copyLink}></div>
              </div>
              {!isInternalURL(props.hyperLink.href) && (
                <div className={styles.reminder}>{intlMessage('reminder')}</div>
              )}
            </div>
          )}
        </>
      )}
    </Modal>
  );
});
HyperLink.displayName = 'HyperLink';
const getMatchRoute = (url: string) => {
  let pathname = '';
  try {
    pathname = new URL(url).pathname;
  } catch {
    return null;
  }
  const res = pathname.match(/^\/(p)/);
  if (!res) {
    return null;
  }
  const [match] = res;
  switch (match) {
    case '/p':
      return '/p';
    default:
      return null;
  }
};
