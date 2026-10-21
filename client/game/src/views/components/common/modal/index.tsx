import React from 'react';
import { calc_class_name } from 'src/utils/classname';
import localStyle from './index.module.css';

interface Props {
  className?: { [name: string]: string };
  containerClassname?: string;
  style?: React.CSSProperties;
  staticBackdrop?: boolean; // when click backdrop ,not close the modal
  onClose: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}
interface State {}

export class Modal extends React.Component<Props, State> {
  public render() {
    const style = this.props.className || localStyle;
    return (
      <div className={style.wrapper} style={this.props.style}>
        <div
          className={style.background}
          onClick={this.props.staticBackdrop ? undefined : this.props.onClose}
        ></div>
        <div
          className={calc_class_name(
            style.container,
            this.props.containerClassname,
          )}
        >
          {this.props.children}
        </div>
      </div>
    );
  }
}
