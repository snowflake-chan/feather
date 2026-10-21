import * as React from 'react';
import { vec3 } from 'gl-matrix';
import { UI3DMouseEvent } from 'src/engine/ui3d/ui3d-schema';
import { UI3DBox, UI3DLine } from './index';
import { MouseButton, MouseState } from '@box/schema/input/input-schema';

interface UI3DCubeLineProps {
  color?: vec3;
  dimension?: vec3;
  position: vec3;
  offset?: vec3;
  centerAtBottom: boolean;
  fixedSize?: number;
  screenSizeFixed?: boolean;
  draggable: boolean;
  onMouseDown?: (ev: UI3DMouseEvent) => void;
  onMouseMove?: (ev: UI3DMouseEvent) => void;
  onMouseUp?: (ev: UI3DMouseEvent) => void;
  onDrag?: (prevPos: vec3, currPos: vec3) => void;
  onMouseIn?: () => void;
  onMouseOut?: () => void;
  onMouseOver?: (ev: UI3DMouseEvent) => void;
}

export class CubeLine extends React.Component<UI3DCubeLineProps, {}> {
  private _prevMouseState: number = -1;
  private _prevPos = vec3.create();
  private _isMouseDown = false;

  private _lastPos = vec3.create();
  private _currentPos = vec3.create();
  private _isDragging = false;

  constructor(props) {
    super(props);
  }

  private onMouseDown(ev: UI3DMouseEvent) {
    this.props.onMouseDown && this.props.onMouseDown(ev);
    vec3.copy(this._lastPos, ev.worldPosition);
    this._isMouseDown = true;
    if (this.props.draggable) {
      this._isDragging = true;
    }
  }

  private onMouseMove(ev: UI3DMouseEvent) {
    this.props.onMouseMove && this.props.onMouseMove(ev);
    if (this._isDragging) {
      vec3.copy(this._currentPos, ev.worldPosition);
      this.props.onDrag && this.props.onDrag(this._lastPos, this._currentPos);
      vec3.copy(this._lastPos, this._currentPos);
    }
  }

  private onMouseUp(ev: UI3DMouseEvent) {
    this.props.onMouseUp && this.props.onMouseUp(ev);
    this._isMouseDown = false;
    this._isDragging = false;
  }

  private handleMouse = (ev: UI3DMouseEvent) => {
    let hit = false;
    if (ev.mouseButton === MouseButton.left) {
      if (
        ev.mouseState === MouseState.press &&
        this._prevMouseState === MouseState.release
      ) {
        hit = true;
        this.onMouseDown(ev);
      }
      if (
        ev.mouseState !== MouseState.press &&
        !vec3.equals(ev.worldPosition, this._prevPos)
      ) {
        hit = true;
        this.onMouseMove(ev);
      }
    }

    if (
      ev.mouseState === MouseState.release &&
      (this._isMouseDown || this._isDragging)
    ) {
      hit = true;
      this.onMouseUp(ev);
    }
    if (!this._isDragging) {
      this.props.onMouseOver && this.props.onMouseOver(ev);
    }
    this._prevMouseState = ev.mouseState;
    vec3.copy(this._prevPos, ev.worldPosition);
    return hit;
  };

  private handleDragStart = () => true;

  public render() {
    const center = this.props.position;
    const offset = this.props.offset || vec3.fromValues(0, 0, 0);
    return (
      <div>
        <UI3DBox
          position={this.props.position}
          centerAtBottom={this.props.centerAtBottom}
          offset={offset}
          dimension={this.props.dimension}
          color={this.props.color}
          fixedSize={this.props.fixedSize}
        />
        <UI3DLine
          start={center}
          end={vec3.fromValues(
            center[0] + offset[0],
            center[1] + offset[1],
            center[2] + offset[2],
          )}
          width={0.01}
          fixedSize={this.props.fixedSize}
          screenSizeFixed={this.props.screenSizeFixed}
          color={this.props.color}
          isDragging={this._isDragging}
          onDragStart={this.handleDragStart}
          onMouse={(ev) => {
            return this.handleMouse(ev);
          }}
          onMouseIn={() => {
            this.props.onMouseIn?.call(this);
            return false;
          }}
          onMouseOut={() => {
            this.props.onMouseOut?.call(this);
            return false;
          }}
        />
      </div>
    );
  }
}
