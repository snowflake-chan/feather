import * as React from 'react';
import { vec3 } from 'gl-matrix';
import { UI3DMouseEvent } from 'src/engine/ui3d/ui3d-schema';
import { UI3DBox } from './index';
import { MouseButton, MouseState } from '@box/schema/input/input-schema';

interface BoundBoxProps {
  position: vec3;
  dimension: vec3;
  color?: vec3;
  lineColor?: vec3;
  opacity?: number;
  line?: boolean;
  screenSizeFixed?: boolean;
  onMouseDown?: (ev: UI3DMouseEvent) => boolean;
  onDragStart?: (ev: UI3DMouseEvent) => boolean;
  onMouseUp?: (ev: UI3DMouseEvent) => boolean;
  onMouseIn?: () => void;
  onMouseOut?: () => void;
}

export class BoundBox extends React.Component<BoundBoxProps> {
  private _prevMouseState = MouseState.release;
  private _isMouseDown = false;

  constructor(props) {
    super(props);
  }
  private handleMouse = (ev: UI3DMouseEvent) => {
    let hit = false;
    if (ev.mouseButton === MouseButton.left) {
      if (
        ev.mouseState === MouseState.press &&
        this._prevMouseState === MouseState.release
      ) {
        this._isMouseDown = true;
        if (this.props.onMouseDown) {
          hit = this.props.onMouseDown(ev);
        }
      } else if (
        ev.mouseState === MouseState.release &&
        this._prevMouseState !== MouseState.release &&
        this._isMouseDown
      ) {
        this._isMouseDown = false;
        if (this.props.onMouseUp) {
          hit = this.props.onMouseUp(ev);
        }
      }
    }
    this._prevMouseState = ev.mouseState;
    return hit;
  };

  public render() {
    return (
      <UI3DBox
        position={this.props.position}
        centerAtBottom={false}
        dimension={this.props.dimension}
        color={this.props.color}
        lineColor={this.props.lineColor}
        opacity={this.props.opacity}
        line={this.props.line}
        screenSizeFixed={this.props.screenSizeFixed}
        onMouse={this.handleMouse}
        onMouseIn={() => {
          this.props.onMouseIn?.call(this);
          return false;
        }}
        onMouseOut={() => {
          this.props.onMouseOut?.call(this);
          return false;
        }}
        onDragStart={(ev) => {
          let hit = false;
          if (this.props.onDragStart) {
            hit = this.props.onDragStart(ev);
          }
          return hit;
        }}
      />
    );
  }
}
