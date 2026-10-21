import React from 'react';
import { DB } from '@box/schema/backend/database-type';
import { calc_class_name } from 'src/utils/classname';
import { intlMessage } from 'src/utils/i18n';
import { dateToStr } from 'src/utils/time';
import { getIntlStatus } from './statusMessage';
import { ContentHistorySchema } from '@box/schema/backend/rpc/content-protocol';

type StatusHistory = typeof ContentHistorySchema.identity[];

interface Props {
  history: StatusHistory;
  onPublishVersion: number;
  className: { [name: string]: string };

  cancelReview: () => void;
  openModal: (title: string, content: string) => void;
  icons?: {
    expand: React.ReactNode;
    fold: React.ReactNode;
    info: React.ReactNode;
  };
}

interface State {
  expandedVersion: boolean[];
}

export class ContentVersionHistory extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const maxVersion = props.history[0] ? props.history[0].version : 0;
    const expandedVersion = new Array(maxVersion);
    for (let i = 0; i < expandedVersion.length; i++) {
      expandedVersion[i] = true;
    }
    this.state = {
      expandedVersion,
    };
  }

  public render() {
    const { className: style } = this.props;
    const versionGroups: { [version: number]: StatusHistory } = {};
    const { history } = this.props;
    for (let i = 0; i < history.length; i++) {
      const status = history[i];
      if (!versionGroups[status.version]) {
        versionGroups[status.version] = [];
      }
      versionGroups[status.version].push(status);
    }
    const versions = Object.keys(versionGroups).sort((a, b) => +b - +a);

    return (
      <div className={style.contentVersionHistoryContainer}>
        {versions.map((version, i) =>
          this.renderVersionGroup(+version, versionGroups[version], i),
        )}
      </div>
    );
  }

  public renderVersionGroup(
    version: number,
    statusHistory: StatusHistory,
    versionIndex: number,
  ) {
    const { className: style } = this.props;
    const expanded = this.state.expandedVersion[versionIndex];
    return (
      <div className={style.versionContainer} key={versionIndex}>
        <div
          className={style.versionTitle}
          onClick={() => this.expandVersion(versionIndex)}
        >
          {this.props.icons ? (
            expanded ? (
              this.props.icons.expand
            ) : (
              this.props.icons.fold
            )
          ) : (
            <div
              className={calc_class_name(
                style.versionExpandIcon,
                expanded ? style.expandIcon : style.foldIcon,
              )}
            ></div>
          )}
          <div className={style.titleText}>
            v.{version}
            {version === this.props.onPublishVersion
              ? ` (${intlMessage('currentPublishedVersion')})`
              : ''}
          </div>
        </div>
        {this.state.expandedVersion[versionIndex] && (
          <div className={style.statusList}>
            {statusHistory.map((status, i) => (
              <div className={style.statusItem} key={i}>
                <div className={style.statusData}>
                  <div className={style.statusTime}>
                    {dateToStr(status.updated_at)}
                  </div>
                  <div className={style.statusContent}>
                    <div className={style.statusText}>
                      {getIntlStatus(intlMessage, status.status)}
                    </div>
                    {status.review_info && status.review_info['title'] && (
                      <div
                        className={style.infoIcon}
                        onClick={() => {
                          const data = this.getRejectData(status.review_info);
                          this.props.openModal(data.title, data.content);
                        }}
                      >
                        {this.props.icons && this.props.icons.info}
                      </div>
                    )}
                  </div>
                </div>
                {/* {status.status === DB.ContentStatus.underReview &&
                            i === 0 && versionIndex === 0 &&
                            <Button
                                value={intlMessage('revoke')}
                                onClick={this.props.cancelReview}
                            />
                        } */}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  public getRejectData(
    reviewInfo: DB.ContentReviewRejectInfo | null | undefined,
  ) {
    const data = {
      title: '',
      content: '',
    };
    if (!reviewInfo) {
      return data;
    }
    data.title = reviewInfo.title || intlMessage('notPassedReview');
    data.content = reviewInfo.details || intlMessage('unknownReason');
    return data;
  }

  public expandVersion = (versionIndex: number) => {
    this.setState((prevState) => {
      const expandedVersion = prevState.expandedVersion.concat();
      expandedVersion[versionIndex] = !expandedVersion[versionIndex];
      return { expandedVersion };
    });
  };
}
