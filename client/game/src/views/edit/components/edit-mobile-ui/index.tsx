import * as React from 'react';
import { vec3 } from 'gl-matrix';
import { CameraMode } from '@box/schema/camera/camera-schema';

import { UI3DContainer, UI3DText, UI3DDirectionSign } from '../ui-3d';
import { getById } from '@box/utils/id';
import { editor } from 'src/client/edit/edit-client';

import style from './index.module.css';
import { IntlShape, injectIntl } from 'react-intl';

interface EditorMobileExclusiveUIProps {
  intl: IntlShape;
  guest: boolean;
}

interface EditorMobileExclusiveUIState {
  showAxisIndicator: boolean;
  enableAxis: boolean;
  useCrossHair: boolean;
}

class EditorMobileExclusiveUIContainer extends React.Component<
  EditorMobileExclusiveUIProps,
  EditorMobileExclusiveUIState
> {
  constructor(props) {
    super(props);
    this.state = {
      showAxisIndicator: false,
      enableAxis: editor.game.input.isAxisEnabled(),
      useCrossHair: editor.game.state.input.useCrossHair,
    };
  }

  // 手机端人物axis
  private _renderPlayerCompass() {
    const gameState = editor.game.state;
    const config = gameState.secret.replica.camera;
    if (config.mode === CameraMode.FIXED) {
      return '';
    } else {
      const playerBody = getById(gameState.bodies, config.targetId);
      if (!playerBody) {
        return '';
      }
      const playerPos = playerBody.getPosition();
      playerPos[1] -= Math.floor(playerBody.ry);
      return (
        <div>
          <UI3DDirectionSign
            start={vec3.fromValues(
              playerPos[0] + 1.5,
              playerPos[1],
              playerPos[2],
            )}
            end={vec3.fromValues(playerPos[0] + 2, playerPos[1], playerPos[2])}
            width={0.25}
            faceToEye={false}
            normal={vec3.fromValues(0, 1, 0)}
            color={vec3.fromValues(1, 0, 0)}
            opacity={0.6}
          ></UI3DDirectionSign>
          <UI3DText
            position={vec3.fromValues(
              playerPos[0] + 2.2,
              playerPos[1],
              playerPos[2],
            )}
            fill={'#ff3b2c'}
            scale={3}
            text={`+X`}
          ></UI3DText>
          <UI3DDirectionSign
            start={vec3.fromValues(
              playerPos[0],
              playerPos[1],
              playerPos[2] + 1.5,
            )}
            end={vec3.fromValues(playerPos[0], playerPos[1], playerPos[2] + 2)}
            width={0.25}
            faceToEye={false}
            normal={vec3.fromValues(0, 1, 0)}
            color={vec3.fromValues(0, 0, 1)}
            opacity={0.6}
          ></UI3DDirectionSign>
          <UI3DText
            position={vec3.fromValues(
              playerPos[0],
              playerPos[1],
              playerPos[2] + 2.2,
            )}
            fill={'#3f51b5'}
            scale={3}
            text={`+Z`}
          ></UI3DText>
        </div>
      );
    }
  }

  public render() {
    return (
      <div>
        <div className={style.commonUseBtnGroup}>
          <div
            className={[
              style.commonUseBtn,
              style.showAsixBtn,
              this.state.showAxisIndicator ? style.selected : '',
            ].join(' ')}
            onClick={() => {
              this.setState({
                showAxisIndicator: !this.state.showAxisIndicator,
              });
            }}
          >
            {this.props.intl.formatMessage({ id: 'AxisHelper' })}
          </div>
          <div
            className={[
              style.commonUseBtn,
              style.lockCameraBtn,
              this.state.enableAxis === false ? style.selected : '',
            ].join(' ')}
            onClick={() => {
              this.state.enableAxis
                ? editor.game.input.disableAxis()
                : editor.game.input.enableAxis();
              this.setState({ enableAxis: editor.game.input.isAxisEnabled() });
            }}
          >
            {this.props.intl.formatMessage({ id: 'LockCamera' })}
          </div>
          <div
            className={[
              style.commonUseBtn,
              style.toggleCrossHairBtn,
              this.state.useCrossHair === true ? style.selected : '',
            ].join(' ')}
            onClick={() => {
              editor.game.state.input.useCrossHair = !this.state.useCrossHair;
              this.setState({
                useCrossHair: editor.game.state.input.useCrossHair,
              });
            }}
          >
            {this.props.intl.formatMessage({ id: 'Crosshair' })}
          </div>
        </div>
        <UI3DContainer ui3D={editor.game.state.ui3D}>
          {this.state.showAxisIndicator ? this._renderPlayerCompass() : ''}
        </UI3DContainer>
      </div>
    );
  }
}

export const EditorMobileExclusiveUI = injectIntl(
  EditorMobileExclusiveUIContainer,
);
