import React from 'react';
import { DB } from '@box/schema/backend/database-type';
import { getIntlStatus } from './statusMessage';
import { intlMessage } from 'src/utils/i18n';

interface Props {
  version: number;
  status: DB.ContentStatus;
  reviewInfo: DB.ContentReviewRejectInfo | null;
  className: { [name: string]: string };

  openModal: (title: string, content: string) => void;
}

interface State {}

export class LatestContentVersion extends React.Component<Props, State> {
  public render() {
    const { className: style } = this.props;
    let title = '';
    let details = '';
    if (this.props.reviewInfo) {
      title = this.props.reviewInfo.title;
      details = this.props.reviewInfo.details;
    }
    return (
      <div className={style.latestContentVersionContainer}>
        <div className={style.versionText}>
          v.{this.props.version} {getIntlStatus(intlMessage, this.props.status)}
        </div>
        {title && (
          <div
            className={style.reviewInfoIcon}
            onClick={() =>
              this.props.openModal(
                title || intlMessage('notPassedReview'),
                details || intlMessage('unknownReason'),
              )
            }
          ></div>
        )}
      </div>
    );
  }
}
