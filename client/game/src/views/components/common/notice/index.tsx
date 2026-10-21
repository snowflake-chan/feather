import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { intlMessage } from 'src/utils/i18n';
import { handleRPCError } from 'src/utils/rpc-error';
import * as uuid from 'uuid';
import { Icon } from '../../basic/icon';

import style from './index.module.css';

type NoticeProps = {
  noticeList: NoticeData[];
};

type NoticeData = {
  title: string;
  detail?: string;
  type: NoticeType;
  id: string;
  timeout?: number;
  timerId?: number;
};

enum NoticeType {
  info,
  error,
  warning,
  success,
  pending,
}

type NoticeConfig = {
  icon: string;
  showClose: boolean;
};
const NoticeConfig: { [type in NoticeType]: NoticeConfig } = {
  [NoticeType.info]: { icon: '', showClose: false },
  [NoticeType.error]: { icon: 'exclamation-triangle', showClose: true },
  [NoticeType.warning]: { icon: 'exclamation-triangle', showClose: true },
  [NoticeType.success]: { icon: 'check-circle', showClose: true },
  [NoticeType.pending]: { icon: 'loading', showClose: false },
};

class Notice extends React.Component<NoticeProps, {}> {
  public render() {
    return (
      <div className={style.noticeList}>
        {this.props.noticeList.map((_notice) => {
          const typeStr = NoticeType[_notice.type];
          const config = NoticeConfig[_notice.type];
          let className = style.notice + ' ' + style[typeStr];
          if (!_notice.detail) {
            className += ' ' + style.singleLine;
          }
          return (
            <div
              key={_notice.id}
              className={className}
              style={{
                animationDelay: `${
                  _notice.timeout ? _notice.timeout / 1000 : 4
                }s`,
              }}
            >
              <div className={style.noticeContainer}>
                <div className={style.decorator}></div>
                {config.icon && (
                  <Icon
                    icon={config.icon}
                    size={24}
                    className={style.noticeIcon}
                  />
                )}
                <div className={style.content}>
                  <div className={style.contentTitle}>{_notice.title}</div>
                  {_notice.detail && (
                    <div className={style.contentDetail}>{_notice.detail}</div>
                  )}
                </div>
                {config.showClose && (
                  <Icon
                    icon="close"
                    size={16}
                    className={style.closeBtn}
                    onClick={() => closeNotice(_notice.id)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

const noticeList: NoticeData[] = [];

let noticeRoot: Root | null = null;

function render() {
  if (!noticeRoot) {
    const rootContainer = document.createElement('div');
    rootContainer.className = style.container;
    document.body.appendChild(rootContainer);
    noticeRoot = createRoot(rootContainer);
  }
  const localDom = <Notice noticeList={noticeList} />;
  noticeRoot.render(localDom);
}

function addNotice(
  content: string | { title: string; detail: string },
  type: NoticeType,
  timeout = 3200,
): string {
  const id = uuid.v4();
  const firstNotice = noticeList[0];
  if (firstNotice) {
    noticeList.length = 0;
    clearTimeout(firstNotice.timerId);
  }
  const timerId = window.setTimeout(() => {
    const noticeItem = noticeList[0];
    if (!noticeItem) {
      return;
    }
    if (
      noticeItem.type !== NoticeType.pending &&
      noticeItem.type !== NoticeType.error &&
      noticeItem.type !== NoticeType.warning
    ) {
      noticeList.shift();
      render();
    }
  }, timeout);
  if (typeof content === 'string') {
    noticeList.push({
      title: content,
      type: type,
      id: id,
      timeout,
      timerId,
    });
  } else {
    noticeList.push({
      title: content.title,
      detail: content.detail,
      type: type,
      id: id,
      timeout,
      timerId,
    });
  }
  render();
  return id;
}

function closeNotice(id: string) {
  for (let i = 0; i < noticeList.length; i++) {
    const _notice = noticeList[i];
    if (id === _notice.id) {
      noticeList.splice(i, 1);
      clearTimeout(_notice.timerId);
      render();
      return;
    }
  }
}

function success(
  content: string | { title: string; detail: string },
  timeout?: number,
) {
  return addNotice(content, NoticeType.success, timeout);
}
function info(
  content: string | { title: string; detail: string },
  timeout?: number,
) {
  return addNotice(content, NoticeType.info, timeout);
}
function warning(
  content: string | { title: string; detail: string },
  timeout?: number,
) {
  return addNotice(content, NoticeType.warning, timeout);
}
function error(content: string | { title: string; detail: string }) {
  return addNotice(content, NoticeType.error);
}
function pending(content: string) {
  return addNotice(content, NoticeType.pending);
}
function rpcError(err: string) {
  const data = handleRPCError(err);
  return addNotice(intlMessage(data.i18n), NoticeType.error);
}

export const notice = {
  success,
  info,
  warning,
  error,
  pending,
  closeNotice,
  rpcError,
};

export type Notices = typeof notice;
