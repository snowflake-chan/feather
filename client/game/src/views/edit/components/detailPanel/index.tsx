import { IconCancel } from '@box/icons';
import type { JSX } from 'react';
import * as React from 'react';
import { calc_class_name } from 'src/utils/classname';
import { DetailPanelTab } from '../detailPanelTab';
import style from './index.module.scss';

type Props = {
  contentList: {
    title: string | JSX.Element;
    tab: JSX.Element;
    content: () => JSX.Element;
    footer?: JSX.Element;
    borderRadius?: boolean;
    contentContainerStyle?: React.CSSProperties;
    contentStyle?: React.CSSProperties;
    titleStyle?: React.CSSProperties;
  }[];
  contentWrapperStyle?: React.CSSProperties;
  onClose?: () => void;
  footer?: JSX.Element;
  onSelectPage?: (index: number) => void;
  hidden?: boolean;
  expand?: boolean;
  onExpand?: () => void;
  className?: string;
};

type State = {
  currentTab: number;
  isBorderRadius: boolean;
};

export class DetailPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentTab: 0,
      isBorderRadius: true,
    };
  }

  public componentDidMount() {
    this.updateDetailPanelHeight();
  }

  private detailPanelTabRef = React.createRef<HTMLDivElement>();
  private detailPanelContentRef = React.createRef<HTMLDivElement>();
  private detailPanelContentScrollRef = React.createRef<HTMLDivElement>();

  private _shouldSetBorderRadius = () => {
    const panelTab = this.detailPanelTabRef.current?.getBoundingClientRect();
    const panelContent =
      this.detailPanelContentRef.current?.getBoundingClientRect();
    if (!panelTab || !panelContent) {
      return true;
    }
    return panelTab.height < panelContent.height;
  };

  private _handleSelectTab = (tabId: number) => {
    if (this.props.onSelectPage) {
      this.props.onSelectPage(tabId);
    }

    this.setState({
      currentTab: tabId,
      isBorderRadius: this._shouldSetBorderRadius(),
    });
  };

  public updateDetailPanelHeight = () => {
    this.setState({
      isBorderRadius: this._shouldSetBorderRadius(),
    });
  };

  public scrollTo = (x: number, y: number) => {
    this.detailPanelContentScrollRef.current?.scrollTo(x, y);
  };

  public componentDidUpdate(prevProp, prevState: State) {
    if (prevState.currentTab !== this.state.currentTab) {
      this.updateDetailPanelHeight();
    }
  }

  public render() {
    const tabList: {
      id: number;
      title: string | JSX.Element;
      tabElm: JSX.Element;
    }[] = [];
    for (let i = 0; i < this.props.contentList.length; i++) {
      tabList.push({
        id: i,
        title: this.props.contentList[i].title,
        tabElm: this.props.contentList[i].tab,
      });
    }
    const content = this.props.contentList[this.state.currentTab];
    const footer = content.footer || this.props.footer || null;
    // 100vh will outside the viewport, should use innerHeight instead
    // https://dev.to/maciejtrzcinski/100vh-problem-with-ios-safari-3ge9
    const isPortrait = !window.orientation;
    const isBorderRadius = content.borderRadius ?? this.state.isBorderRadius;
    return (
      <div
        className={
          style.panelContainer +
          ' ' +
          (this.props.hidden ? style.panelHidden : '') +
          ' ' +
          (this.props.className ? this.props.className : '')
        }
      >
        <div ref={this.detailPanelTabRef} className={style.tabList}>
          <DetailPanelTab
            tabList={tabList}
            onChange={this._handleSelectTab}
            onClose={this.props.onClose}
            currentTab={this.state.currentTab}
          />
        </div>
        <div
          ref={this.detailPanelContentRef}
          className={calc_class_name(
            style.contentContainer,
            isBorderRadius ? style.borderRadius : null,
            'contentContainer',
          )}
          style={{ ...content.contentContainerStyle }}
        >
          <div className={style.title} style={content.titleStyle}>
            <span>{content.title}</span>
            {this.props.onClose && (
              <div className={style.closeBtn} onClick={this.props.onClose}>
                <IconCancel />
              </div>
            )}
          </div>
          <div
            ref={this.detailPanelContentScrollRef}
            className={footer ? style.contentWithFooter : style.content}
            style={{
              ...this.props.contentWrapperStyle,
              ...content.contentStyle,
            }}
          >
            {content.content()}
          </div>
          {footer && <div className={style.footer}>{footer}</div>}
        </div>
        {this.props.expand !== undefined && (
          <div
            className={this.props.expand ? style.expanded : style.exapndBtn}
            onClick={this.props.onExpand}
          >
            <div className={style.expandIcon}></div>
          </div>
        )}
      </div>
    );
  }
}
