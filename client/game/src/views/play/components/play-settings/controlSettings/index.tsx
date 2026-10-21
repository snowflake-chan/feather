import * as React from 'react';
import { intlMessage } from 'src/utils/i18n';
import { Settings } from 'src/engine/settings/settings-schema';
import { Range } from '../../basic/inputSlider';

import style from '../volumeController/index.module.css';

type Props = {
  settings: Settings;
  setGameSettings: (settings: Partial<Settings>) => void;
};

export class ControlSettings extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  private setCameraSensitivity = (v: number) => {
    if (!Number.isFinite(v)) {
      return;
    }
    const cameraSensitivity = Number(v.toFixed(2));
    this.props.setGameSettings({
      cameraSensitivity,
    });
  };

  public render() {
    return (
      <div className={style.wrapper}>
        <div className={style.title}>
          {intlMessage('cameraSensitivity')}:{' '}
          {this.props.settings.cameraSensitivity.toFixed(2)}
        </div>
        <div className={style.rangeWrapper}>
          <Range
            value={this.props.settings.cameraSensitivity}
            onValueChange={this.setCameraSensitivity}
            step={0.01}
            min={0}
            max={10}
            dragEndCb={(value: number) => {
              this.setCameraSensitivity(+value);
            }}
          />
        </div>
      </div>
    );
  }
}
