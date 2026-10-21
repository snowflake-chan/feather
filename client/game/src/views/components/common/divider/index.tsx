import * as React from 'react';
import style from './index.module.css';

type Props = {
  vertical?: boolean;
  color?: string;
  style?: React.CSSProperties;
};

type State = {};

export class Divider extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  public render() {
    const cssStyle = this.props.style || {};
    if (this.props.color) {
      cssStyle['backgroundColor'] = this.props.color;
    }
    return (
      <div
        className={this.props.vertical ? style.dividerVertical : style.divider}
        style={cssStyle}
      ></div>
    );
  }
}
