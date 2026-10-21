import * as React from 'react';
import { RadioProperty, SwitcherProperty } from '../../basic/property';
import {
  getDefaultSettingLevelIndex,
  getSettingLevels,
} from 'src/engine/settings/settings-controller';
import { intlMessage } from 'src/utils/i18n';
import { Settings } from 'src/engine/settings/settings-schema';

import style from './index.module.css';
import { RadioBtn } from '../../basic/radioBtn';

type Props = {
  settings: Settings;
  setGameSettings: (settings: Partial<Settings>) => void;
  setGraphicRadius?: (value: boolean) => void;
};

type State = {
  graphicsQuality: number;
};

export class GraphSetting extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      graphicsQuality: this.getInitialLevel(),
    };
  }

  public settingLevels = getSettingLevels();

  public componentDidMount() {
    this.props.setGraphicRadius?.(this.state.graphicsQuality === -1);
  }

  private getInitialLevel(): number {
    const localSettings = localStorage.getItem('GAME');
    if (!localSettings) {
      return getDefaultSettingLevelIndex();
    }
    const settings = JSON.parse(localSettings);
    const { graphicQuality } = settings;
    if (graphicQuality === -1) {
      return -1;
    }
    for (let i = 0; i < this.settingLevels.game.length; i++) {
      let equal = true;
      for (const prop in this.settingLevels.game[i]) {
        if (this.settingLevels.game[i][prop] !== settings[prop]) {
          equal = false;
        }
      }
      if (equal) {
        return i;
      }
    }
    return -1;
  }

  public setGraphicsQuality(level: number) {
    this.setState(
      {
        graphicsQuality: level,
      },
      () => {
        if (level === -1) {
          this.props.setGraphicRadius?.(true);
          this.props.setGameSettings({
            graphicQuality: level,
          });
          return;
        }

        this.props.setGraphicRadius?.(false);
        this.props.setGameSettings({
          ...this.settingLevels.game[level],
          graphicQuality: level,
        });
      },
    );
  }

  public render() {
    const settingLevels = getSettingLevels();
    let resolution = -1;
    let lodBias = -1;
    let shadow = -1;
    let animationQuality = -1;
    for (let i = 0; i < 3; i++) {
      if (
        this.props.settings.resolutionScale === settingLevels.resolutionScale[i]
      ) {
        resolution = i;
      }
      if (this.props.settings.lodBias === settingLevels.lodBias[i]) {
        lodBias = i;
      }
      if (
        this.props.settings.shadowResolution ===
        settingLevels.shadowResolution[i]
      ) {
        shadow = i;
      }
      if (
        this.props.settings.animationQuality ===
        settingLevels.animationQuality[i]
      ) {
        animationQuality = i;
      }
    }
    return (
      <div className={style.container}>
        <div className={style.radioContainer}>
          <RadioBtn
            checked={this.state.graphicsQuality === 0}
            onChange={() => this.setGraphicsQuality(0)}
            text={intlMessage('low')}
          />
        </div>
        <div className={style.radioContainer}>
          <RadioBtn
            checked={this.state.graphicsQuality === 1}
            onChange={() => this.setGraphicsQuality(1)}
            text={intlMessage('medium')}
          />
        </div>
        <div className={style.radioContainer}>
          <RadioBtn
            checked={this.state.graphicsQuality === 2}
            onChange={() => this.setGraphicsQuality(2)}
            text={intlMessage('high')}
          />
        </div>
        <div className={style.radioContainer}>
          <RadioBtn
            checked={this.state.graphicsQuality === -1}
            onChange={() => this.setGraphicsQuality(-1)}
            text={intlMessage('customized')}
          />
        </div>
        <SwitcherProperty
          name={intlMessage('resolution')}
          value={resolution}
          switch={[
            {
              id: 0,
              text: intlMessage('L'),
            },
            {
              id: 1,
              text: intlMessage('M'),
            },
            {
              id: 2,
              text: intlMessage('H'),
            },
          ]}
          onChange={(v) => {
            this.props.setGameSettings({
              resolutionScale: settingLevels.resolutionScale[+v],
            });
            this.setState({ graphicsQuality: this.getInitialLevel() });
          }}
          invisible={this.state.graphicsQuality !== -1}
        />
        <SwitcherProperty
          name={intlMessage('shadow')}
          value={shadow}
          switch={[
            {
              id: -1,
              text: intlMessage('OFF'),
            },
            {
              id: 0,
              text: intlMessage('L'),
            },
            {
              id: 1,
              text: intlMessage('M'),
            },
            {
              id: 2,
              text: intlMessage('H'),
            },
          ]}
          onChange={(v) => {
            this.props.setGameSettings({
              shadowResolution: settingLevels.shadowResolution[+v],
            });
            this.setState({ graphicsQuality: this.getInitialLevel() });
          }}
          invisible={this.state.graphicsQuality !== -1}
        />
        <SwitcherProperty
          name={intlMessage('animationQuality')}
          value={animationQuality}
          switch={[
            {
              id: 0,
              text: intlMessage('L'),
            },
            {
              id: 1,
              text: intlMessage('M'),
            },
            {
              id: 2,
              text: intlMessage('H'),
            },
          ]}
          onChange={(v) => {
            this.props.setGameSettings({
              animationQuality: settingLevels.animationQuality[+v],
            });
            this.setState({ graphicsQuality: this.getInitialLevel() });
          }}
          invisible={this.state.graphicsQuality !== -1}
        />
        <RadioProperty
          name={intlMessage('nicetextures')}
          value={!this.props.settings.lowQualityTextures}
          onChange={(v) => {
            this.props.setGameSettings({
              lowQualityTextures: !v,
            });
            this.setState({ graphicsQuality: this.getInitialLevel() });
          }}
          invisible={this.state.graphicsQuality !== -1}
        />
        <RadioProperty
          name={intlMessage('postprocessing')}
          value={this.props.settings.postprocess}
          onChange={(v) => {
            this.props.setGameSettings({
              postprocess: !!v,
            });
            this.setState({ graphicsQuality: this.getInitialLevel() });
          }}
          invisible={this.state.graphicsQuality !== -1}
        />
        <RadioProperty
          name={intlMessage('ambientOcclusion')}
          value={this.props.settings.ambientOcclusion}
          onChange={(v) => {
            this.props.setGameSettings({
              ambientOcclusion: !!v,
            });
            this.setState({ graphicsQuality: this.getInitialLevel() });
          }}
          disabled={!this.props.settings.postprocess}
          invisible={
            this.state.graphicsQuality !== -1 ||
            !this.props.settings.postprocess
          }
        />
        <RadioProperty
          name={intlMessage('depthOfField')}
          value={!!this.props.settings.depthOfField}
          onChange={(v) => {
            this.props.setGameSettings({
              depthOfField: v ? 4 : 0,
            });
            this.setState({ graphicsQuality: this.getInitialLevel() });
          }}
          disabled={!this.props.settings.postprocess}
          invisible={
            this.state.graphicsQuality !== -1 ||
            !this.props.settings.postprocess
          }
        />
        <RadioProperty
          name={intlMessage('volumetricScatter')}
          value={this.props.settings.volumetricScattering}
          onChange={(v) => {
            this.props.setGameSettings({
              volumetricScattering: !!v,
            });
            this.setState({ graphicsQuality: this.getInitialLevel() });
          }}
          disabled={!this.props.settings.postprocess}
          invisible={
            this.state.graphicsQuality !== -1 ||
            !this.props.settings.postprocess
          }
        />
        <RadioProperty
          name={intlMessage('bloom')}
          value={this.props.settings.bloom}
          onChange={(v) => {
            this.props.setGameSettings({
              bloom: !!v,
            });
            this.setState({ graphicsQuality: this.getInitialLevel() });
          }}
          disabled={!this.props.settings.postprocess}
          invisible={
            this.state.graphicsQuality !== -1 ||
            !this.props.settings.postprocess
          }
        />
        <RadioProperty
          name={intlMessage('Fxaa')}
          value={this.props.settings.fxaa}
          onChange={(v) => {
            this.props.setGameSettings({
              fxaa: !!v,
            });
            this.setState({ graphicsQuality: this.getInitialLevel() });
          }}
          disabled={!this.props.settings.postprocess}
          invisible={
            this.state.graphicsQuality !== -1 ||
            !this.props.settings.postprocess
          }
        />
      </div>
    );
  }
}
