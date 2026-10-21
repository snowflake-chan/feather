import {
  useCallback,
  useMemo,
  useState,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { useIntl } from 'react-intl';
import { Button, Input, Menu, Toast, Trigger } from '@box/box-design';
import { IconRetry, IconDropDown } from '@box/icons';
import { useEdit } from 'src/client/edit/edit-context';
import { copyToClipboard } from 'src/utils/copy2clipboard';

import { InnerRoles, MenuItemType } from '../index';
import { ArenaEditorUIContext } from '../../../editor-ui-context';

import style from '../index.module.scss';
import { clientConfig } from 'src/config/client';
import { apis } from 'src/apis/local-api';
import { getRoleId } from 'src/views/edit/components/collaboration/transform';

export const ShareLink = () => {
  const intl = useIntl();
  const editor = useEdit();
  const { replica } = useContext(ArenaEditorUIContext);

  const [isShowInviteRoleMenu, setIsShowInviteRoleMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemType>({
    text: intl.formatMessage({ id: InnerRoles.guest }),
    id: InnerRoles.guest,
  });
  const [shareLink, setShareLink] = useState('');
  const deadLine = useRef<number>(Date.now());

  const timerRef = useRef<number>(undefined);
  const [expireTime, setExpireTime] = useState('00:00:00');

  const formatExpireTime = useCallback(() => {
    let second = Math.floor((deadLine.current - Date.now()) / 1000);
    if (second < 0) {
      return '00:00:00';
    }
    const hour = Math.floor(second / 3600);
    second -= hour * 3600;
    const minute = Math.floor(second / 60);
    second -= minute * 60;
    const padZero = (n) => {
      return n >= 10 ? n.toString() : '0' + n;
    };
    return padZero(hour) + ':' + padZero(minute) + ':' + padZero(second);
  }, [deadLine]);

  const genLink = useCallback(
    (refresh?: boolean) => {
      const role = selectedItem.id ? selectedItem.id : InnerRoles.guest;
      const durationMS = 24 * 60 * 60 * 1000;
      let link = location.origin + location.pathname;
      if (location.ancestorOrigins.length > 0) {
        // 根据是否在iframe中打开来拼接不同的share link
        link = location.ancestorOrigins[0] + `/edit/${clientConfig.name}`;
      }

      // editor
      // call createra api
      apis.collaboration[
        refresh ? 'ticketRefreshUsingGet' : 'getTicketUsingGet'
      ]({
        mapId: clientConfig.mapInfo.contentId + '',
        roleId: role === InnerRoles.guest ? undefined : getRoleId(role),
      })
        .then(({ expireAt, ticket }) => {
          deadLine.current = expireAt;
          setShareLink(link + '?p=' + encodeURIComponent(ticket));
          setExpireTime(formatExpireTime());
        })
        .catch((e) => {
          console.log(e);
        });
    },
    [editor, selectedItem, formatExpireTime],
  );

  useEffect(() => {
    genLink();
    window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setExpireTime(formatExpireTime());
    }, 1000);
    return () => {
      window.clearInterval(timerRef.current);
    };
  }, [genLink, formatExpireTime, selectedItem]);

  const roleList = useMemo((): MenuItemType[] => {
    const roleNameList = Object.keys(replica.permissions.groups);
    const inner = [InnerRoles.guest];
    const roles = [...new Set([...inner, ...roleNameList])];

    return roles.map((id) => ({
      id,
      text: InnerRoles[id] ? intl.formatMessage({ id }) : id,
      className: style.dropdownItem,
    }));
  }, [replica.permissions.groups, intl]);

  const copy = useCallback(() => {
    copyToClipboard(shareLink);
    Toast.success({
      content: intl.formatMessage({ id: 'copySuccess' }),
    });
  }, [intl, shareLink]);

  return (
    <div className={style.invitePanel}>
      <div className={style.header}>
        <div className={style.title}>
          {intl.formatMessage({ id: 'invite' })}
        </div>
        <div className={style.operationBar}>
          <span className={style.text}>
            {intl.formatMessage({ id: 'link_will_expire_in' })} {expireTime}
          </span>
          <Button
            className={style.retryBtn}
            type={'icon'}
            size={'custom'}
            icon={<IconRetry className={style.icon} />}
            onClick={() => genLink(true)}
          />
        </div>
      </div>
      <div className={style.linkTitle}>
        <span className={style.tips}>
          {intl.formatMessage({ id: 'assignAs' })}
        </span>
        <Trigger
          placement={'bottomLeft'}
          align={{ offset: [4, 4] }}
          action={['click']}
          showAction={['click']}
          hideAction={['click']}
          delay={0}
          popup={
            <Menu
              className={style.dropdown}
              items={roleList}
              selectedItem=""
              onItemSelect={(id) => {
                if (typeof id === 'string') {
                  setSelectedItem({
                    id,
                    text: roleList.find((item) => item.id === id)?.text || '',
                  });
                }
              }}
            />
          }
        >
          <span
            className={style.dropdownTab}
            onMouseDown={(ev) => {
              ev.preventDefault();
            }}
          >
            {selectedItem.text}
            <IconDropDown className={style.dropdownIcon} />
          </span>
        </Trigger>
      </div>
      <div className={style.content}>
        <Input
          className={style.copyInput}
          disabled={true}
          valueType={'string'}
          type={'primary'}
          size={'large'}
          value={
            shareLink.substring(0, 11) +
            '...' +
            shareLink.substring(shareLink.indexOf('?p=') + 3)
          }
        />
        <Button
          className={style.copyBtn}
          type={'primary'}
          size={'custom'}
          onClick={copy}
        >
          {intl.formatMessage({ id: 'copyLink' })}
        </Button>
      </div>
    </div>
  );
};
