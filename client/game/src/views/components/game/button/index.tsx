import * as React from 'react';

import localStyle from './index.module.css';

export type ButtonColor =
  | 'primary'
  | 'blue'
  | 'red'
  | 'orangeBorder'
  | 'website';
export type Status = 'loading' | 'default';

type ButtonProps = {
  value: string;
  onClick: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
  ghost?: boolean;
  type?: ButtonColor;
  loading?: boolean;
};

export class Button extends React.Component<ButtonProps, {}> {
  private _handleClick = (e) => {
    this.props.onClick(e);
  };

  private colorClassName: { [color in ButtonColor]: string } = {
    primary: localStyle.buttonPrimary,
    red: localStyle.buttonRed,
    blue: localStyle.buttonBlue,
    orangeBorder: localStyle.btnOrangeBorder,
    website: localStyle.websitePrimary,
  };

  public render() {
    const buttonClassName = [this.props.className || localStyle.button];
    this.props.ghost && buttonClassName.push(localStyle.buttonGhost);
    if (this.props.type) {
      buttonClassName.push(this.colorClassName[this.props.type]);
    }
    if (this.props.disabled) {
      buttonClassName.push(localStyle.disabled);
    }
    if (this.props.loading) {
      buttonClassName.push(localStyle.loading);
    }
    return (
      <button
        disabled={this.props.disabled}
        className={buttonClassName.join(' ')}
        style={this.props.style}
        onClick={this._handleClick}
      >
        {this.props.value}
      </button>
    );
  }
}
