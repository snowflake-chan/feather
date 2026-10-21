import * as React from 'react';

import style from './index.module.css';

type ButtonProps = {
  value: string | React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  disabled?: boolean;
  type?: 'primary' | 'danger';
  fullWidth?: boolean;
};

export class Button extends React.Component<ButtonProps, {}> {
  private _handleClick = (e) => {
    this.props.onClick(e);
  };

  private _checkIsChinese = (str: string) => {
    if (/^[\u4e00-\u9fa5]+$/.test(str)) {
      return true;
    } else {
      return false;
    }
  };

  public render() {
    const buttonClassName = [style.button];
    this.props.type === 'primary' && buttonClassName.push(style.buttonPrimary);
    this.props.type === 'danger' && buttonClassName.push(style.butttonDanger);
    this.props.fullWidth && buttonClassName.push(style.fullWidth);
    let value = this.props.value;
    if (
      typeof this.props.value === 'string' &&
      this._checkIsChinese(this.props.value) &&
      this.props.value.length === 2
    ) {
      value = this.props.value[0] + ' ' + this.props.value[1];
    }
    return (
      <button
        disabled={this.props.disabled}
        className={buttonClassName.join(' ')}
        style={this.props.style}
        onClick={this._handleClick}
      >
        {value}
      </button>
    );
  }
}
