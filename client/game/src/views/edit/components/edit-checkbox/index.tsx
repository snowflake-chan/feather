import * as React from 'react';
import style from './index.module.scss';

interface Props {
  onChange: (checked: boolean) => void;
  checked: boolean;
}

export class EditCheckbox extends React.Component<Props, {}> {
  public shouldComponentUpdate(nextProps: Props) {
    return this.props.checked !== nextProps.checked;
  }
  public render() {
    return (
      <label className={style.container}>
        <input
          type="checkbox"
          checked={this.props.checked}
          onChange={(e) => {
            this.props.onChange(e.target.checked);
          }}
        />
        <div className={style.checkMarkBox}>
          <span className={style.checkMark}></span>
        </div>
      </label>
    );
  }
}
