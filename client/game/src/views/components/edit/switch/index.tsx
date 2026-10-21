import * as React from 'react';

import style from './index.module.css';

type Props = {
  operationList: {
    id: number;
    text: string;
  }[];
  currentOperation: number;
  disabled?: boolean;
  onChange: (operation: number) => void;
  wrapperStyle?: React.CSSProperties;
};

type State = {};

export class Switch extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  public render() {
    return (
      <div
        className={
          this.props.disabled
            ? style.operationList + ' ' + style.disabled
            : style.operationList
        }
        style={this.props.wrapperStyle}
      >
        {this.props.operationList.map((operation) => {
          return (
            <div
              key={operation.id}
              onClick={() =>
                !this.props.disabled && this.props.onChange(operation.id)
              }
              className={
                this.props.currentOperation === operation.id
                  ? style.operation + ' ' + style.active
                  : style.operation
              }
            >
              <span>{operation.text}</span>
            </div>
          );
        })}
      </div>
    );
  }
}
