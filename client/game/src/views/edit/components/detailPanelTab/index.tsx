import type { JSX } from 'react';
import * as React from 'react';
import style from './index.module.scss';

type Props = {
  currentTab: number;
  tabList: {
    id: number;
    title: string | JSX.Element;
    tabElm: JSX.Element;
  }[];
  onChange: (id: number) => void;
  onClose?: () => void;
};

type State = {};

export class DetailPanelTab extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  public render() {
    return (
      <div className={style.tabList}>
        <div className={style.wrapper}>
          {this.props.tabList.map((tab) => {
            return (
              <div
                key={tab.id}
                className={
                  tab.id === this.props.currentTab
                    ? style.currentTab
                    : style.tab
                }
                onClick={() => this.props.onChange(tab.id)}
              >
                {tab.tabElm}
                <div className={style.tabTitle}>{tab.title}</div>
              </div>
            );
          })}
        </div>
        <div className={style.closeIconContainer}>
          <div className={style.closeIcon} onClick={this.props.onClose}></div>
        </div>
      </div>
    );
  }
}
