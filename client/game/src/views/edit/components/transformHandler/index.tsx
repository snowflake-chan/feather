import * as React from 'react';
import { vec3, quat, vec2 } from 'gl-matrix';
import { UI3DVoxelEventSchema } from 'src/engine/ui3d/ui3d-schema';
import { MouseButton, MouseState } from '@box/schema/input/input-schema';
import { UI3DContainer } from '../ui-3d';
import { BoundBox } from '../ui-3d/boundbox';

import { TranslationUI3D } from './translationUI3D';
import { RotationUI3D } from './rotationUI3D';
import { ScalingUI3D } from './scalingUI3D';
import {
  calcBoxDimension,
  computeEntitySeedRenderBox,
  HoverObject,
} from './util';

import { ClientProjectTransaction } from 'src/client/edit/replica/transaction/client-project-transaction';
import { EditReplicaClient } from 'src/client/edit/replica/replica-client';
import { editor } from 'src/client/edit/edit-client';

import { DEFAULT_SCALE } from 'src/defs/modelScale';
import {
  clipPosToScreenPos,
  worldPosToClipPos,
} from 'src/engine/camera/camera-controller';
import { store } from 'src/redux/edit';

export enum TransformType {
  Normal,
  Rotate,
  Scale,
}

interface TransformHandlerProps {
  seedIds: string[];
  editReplica: EditReplicaClient;
  transformType: TransformType;
}

const TEMP_VEC2 = vec2.create();
const TEMP_VEC3 = vec3.create();

export class TransformHandler extends React.Component<
  TransformHandlerProps,
  {}
> {
  private _position = vec3.create();
  private _dimension = vec3.create();
  private _tx: ClientProjectTransaction;
  private _hoverObj: HoverObject = HoverObject.none;
  private _isDraggingBox = false;
  private _isMouseDownScale: boolean = false;
  private _isMouseDownTranslation: boolean = false;
  private _isMouseDownRotation: boolean = false;
  private _prevMouseState = MouseState.release;
  private _scaleDiff: number = 0;

  private _quatX = quat.create();
  private _quatY = quat.create();
  private _quatZ = quat.create();
  private _tempQuat = quat.create();
  private _startCenter = vec3.create();
  private _startHitRes = UI3DVoxelEventSchema.alloc();
  private _startPosRecord: Map<string, vec3> = new Map();
  private _startScaleRecord: Map<string, vec3> = new Map();
  private _startRotationRecord: Map<string, quat> = new Map();
  private _colorW = vec3.fromValues(1, 0.906, 0.055);
  private _colorY = vec3.fromValues(0, 1, 0.278);
  private _colorZ = vec3.fromValues(0.055, 0.431, 1);
  private _colorX = vec3.fromValues(1, 0, 0);
  private _rotationContent: string = '0°';
  private _scaleContent: string = '0%';

  private _shiftKey: boolean = false;

  constructor(props) {
    super(props);
    this._tx = this.props.editReplica.projectTransaction();
  }
  public componentDidMount() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  public componentWillUnmount() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }

  private _onKeyDown = (e: KeyboardEvent) => {
    if (e.shiftKey) {
      this._shiftKey = e.shiftKey;
    }
  };

  private _onKeyUp = (e: KeyboardEvent) => {
    if (!e.shiftKey) {
      this._shiftKey = e.shiftKey;
    }
  };

  private _setBoxSize() {
    const size = calcBoxDimension(
      this.props.seedIds,
      editor.state,
      editor.game.state,
    );
    if (!size) {
      return;
    }
    vec3.copy(this._position, size.position);
    vec3.copy(this._dimension, size.dimension);
  }

  private _seed(seedId: string) {
    return editor.state.replica.project.entitiesTree[seedId]?.value;
  }

  private _getIsIdle() {
    return (
      !this._isDraggingBox &&
      !this._isMouseDownScale &&
      !this._isMouseDownTranslation &&
      !this._isMouseDownRotation
    );
  }

  private _recordStartPos() {
    this._startPosRecord.clear();
    this.props.seedIds.forEach((id) => {
      const seed = this._seed(id);
      if (!seed) {
        return;
      }
      const pos = vec3.create();
      vec3.copy(pos, seed.position);
      this._startPosRecord.set(id, pos);
    });
  }

  private _recordStartScale() {
    this._startScaleRecord.clear();
    this.props.seedIds.forEach((id) => {
      const seed = this._seed(id);
      if (!seed) {
        return;
      }
      const scale = vec3.create();
      vec3.copy(scale, seed.scale);
      this._startScaleRecord.set(id, scale);
    });
  }

  private _recordStartRotation() {
    this._startRotationRecord.clear();
    this.props.seedIds.forEach((id) => {
      const seed = this._seed(id);
      if (!seed) {
        return;
      }
      const pos = quat.create();
      quat.copy(pos, seed.orientation);
      this._startRotationRecord.set(id, pos);
    });
  }

  private _onRotationStart = () => {
    this._isMouseDownRotation = true;
    vec3.copy(this._startCenter, this._position);
    this._recordStartPos();
    this._recordStartRotation();
  };

  private _getRotatedPos(
    pos: vec3,
    radin: number,
    rotationAxis1: number,
    rotationAxis2: number,
  ) {
    const newPos = vec3.create();
    vec3.sub(newPos, pos, this._startCenter);
    const pos11 = newPos[rotationAxis1];
    const pos2 = newPos[rotationAxis2];

    newPos[rotationAxis1] = Math.cos(radin) * pos11 - Math.sin(radin) * pos2;
    newPos[rotationAxis2] = Math.sin(radin) * pos11 + Math.cos(radin) * pos2;
    vec3.add(newPos, newPos, this._startCenter);
    return newPos;
  }

  private _handleRotateX = (diffX: number) => {
    this._rotationContent = `${Math.round((diffX * 180) / Math.PI)}°`;
    quat.identity(this._quatX);
    quat.rotateX(this._quatX, this._quatX, diffX);
    this._startPosRecord.forEach((pos, id) => {
      this._tx.push((action) =>
        action.entitiesTree
          .update(id)
          .position(this._getRotatedPos(pos, diffX, 1, 2)),
      );
    });
    this._startRotationRecord.forEach((rotation, id) => {
      quat.mul(this._tempQuat, this._quatX, rotation);
      this._tx.push((action) =>
        action.entitiesTree.update(id).orientation(this._tempQuat),
      );
    });
  };
  private _handleRotateY = (diffY: number) => {
    this._rotationContent = `${Math.round((diffY * 180) / Math.PI)}°`;
    quat.identity(this._quatY);
    quat.rotateY(this._quatY, this._quatY, diffY);
    this._startPosRecord.forEach((pos, id) => {
      this._tx.push((action) =>
        action.entitiesTree
          .update(id)
          .position(this._getRotatedPos(pos, -diffY, 0, 2)),
      );
    });
    this._startRotationRecord.forEach((rotation, id) => {
      quat.mul(this._tempQuat, this._quatY, rotation);
      this._tx.push((action) =>
        action.entitiesTree.update(id).orientation(this._tempQuat),
      );
    });
  };
  private _handleRotateZ = (diffZ: number) => {
    this._rotationContent = `${Math.round((diffZ * 180) / Math.PI)}°`;
    quat.identity(this._quatZ);
    quat.rotateZ(this._quatZ, this._quatZ, diffZ);
    this._startPosRecord.forEach((pos, id) => {
      this._tx.push((action) =>
        action.entitiesTree
          .update(id)
          .position(this._getRotatedPos(pos, diffZ, 0, 1)),
      );
    });
    this._startRotationRecord.forEach((rotation, id) => {
      quat.mul(this._tempQuat, this._quatZ, rotation);
      this._tx.push((action) =>
        action.entitiesTree.update(id).orientation(this._tempQuat),
      );
    });
  };

  private _handleSetRotateEnd = () => {
    this._rotationContent = '0°';
    this._isMouseDownRotation = false;
    this._tx.commit();
  };

  private _handleMouseDownScale = () => {
    this._isMouseDownScale = true;
    vec3.copy(this._startCenter, this._position);
    this._recordStartPos();
    this._recordStartScale();
  };

  private _handleScale = (scale: number, axis?: number) => {
    this._scaleDiff = this._scaleDiff + scale;
    this._scaleContent = `${Math.round(this._scaleDiff * 100)}%`;
    this._startScaleRecord.forEach((startScale, id) => {
      const startPos = this._startPosRecord.get(id);
      if (!startPos) {
        return;
      }
      if (axis === undefined) {
        const s1 =
          startScale[0] +
          ((startScale[0] / DEFAULT_SCALE) * this._scaleDiff) / 10;
        const s2 =
          startScale[1] +
          ((startScale[1] / DEFAULT_SCALE) * this._scaleDiff) / 10;
        const s3 =
          startScale[2] +
          ((startScale[2] / DEFAULT_SCALE) * this._scaleDiff) / 10;
        if (s1 < 0 || s2 < 0 || s3 < 0) {
          return;
        }
        const newScale = vec3.fromValues(s1, s2, s3);
        const originDir = vec3.create();
        vec3.sub(originDir, startPos, this._startCenter);
        const scaleOffset = vec3.create();
        vec3.divide(scaleOffset, newScale, startScale);
        const newPos = vec3.create();
        vec3.scaleAndAdd(newPos, this._startCenter, originDir, scaleOffset[0]);
        this._tx
          .push((action) => action.entitiesTree.update(id).scale(newScale))
          .push((action) => action.entitiesTree.update(id).position(newPos));
      } else {
        const s = startScale[axis] + this._scaleDiff / 10;
        const newScale = vec3.create();
        vec3.copy(newScale, startScale);
        newScale[axis] = s;
        const newPos = vec3.create();
        vec3.copy(newPos, startPos);
        newPos[axis] =
          (s / startScale[axis]) * (startPos[axis] - this._startCenter[axis]) +
          this._startCenter[axis];
        this._tx
          .push((action) => action.entitiesTree.update(id).scale(newScale))
          .push((action) => action.entitiesTree.update(id).position(newPos));
      }
    });
  };

  private _handleSetSeedScaleEnd = () => {
    this._scaleDiff = 0;
    this._scaleContent = '0%';
    this._isMouseDownScale = false;
    this._tx.commit();
  };

  private _renderBoundBox() {
    return (
      <div>
        {this.props.seedIds.map((seedId) => {
          const seed = this._seed(seedId);
          if (!seed) {
            return <></>;
          }
          const { dimension, position } = computeEntitySeedRenderBox(
            editor.game.state,
            seed,
          );

          return (
            <BoundBox
              key={seedId}
              position={position}
              dimension={dimension}
              lineColor={vec3.fromValues(1, 0.6, 0)}
              line={true}
              screenSizeFixed={false}
              opacity={0}
              onDragStart={(ev) => {
                if (
                  ev.mouseButton !== MouseButton.left ||
                  this._isMouseDownTranslation ||
                  this._isMouseDownRotation ||
                  this._isMouseDownScale ||
                  store.getState().seeds.hasLockedSeedSelected
                ) {
                  return true;
                }
                this._isDraggingBox = true;
                this._recordStartPos();
                return true;
              }}
            />
          );
        })}
      </div>
    );
  }

  private _renderTranslation() {
    return (
      <TranslationUI3D
        position={this._position}
        colorX={this._colorX}
        colorY={this._colorY}
        colorZ={this._colorZ}
        hoverObj={this._hoverObj}
        setHoverObj={(obj) => {
          if (this._hoverObj !== HoverObject.cubeW) {
            this._hoverObj = obj;
          }
        }}
        onMouseDown={() => {
          this._isMouseDownTranslation = true;
          vec3.copy(this._startCenter, this._position);
          this._recordStartPos();
        }}
        onMouseUp={() => {
          this._isMouseDownTranslation = false;
          this._tx.commit();
        }}
        onDrag={(diff) => {
          if (!this._isMouseDownTranslation) {
            return;
          }
          let diffX = diff[0];
          let diffY = diff[1];
          let diffZ = diff[2];

          if (this._shiftKey) {
            const roundPos = (v: number) => {
              const roundV = Math.round(v);
              const middle = roundV > v ? roundV - 0.5 : roundV + 0.5;
              return Math.abs(v - roundV) <= Math.abs(v - middle)
                ? roundV
                : middle;
            };
            diffX = diffX
              ? roundPos(this._startCenter[0] + diff[0]) - this._startCenter[0]
              : diffX;
            diffY = diffY
              ? roundPos(this._startCenter[1] + diff[1]) - this._startCenter[1]
              : diffY;
            diffZ = diffZ
              ? roundPos(this._startCenter[2] + diff[2]) - this._startCenter[2]
              : diffZ;
          }
          this._startPosRecord.forEach((pos, id) => {
            this._tx.push((action) =>
              action.entitiesTree
                .update(id)
                .position(
                  vec3.fromValues(
                    pos[0] + diffX,
                    pos[1] + diffY,
                    pos[2] + diffZ,
                  ),
                ),
            );
          });
        }}
      />
    );
  }

  private _renderRotation3D() {
    return (
      <RotationUI3D
        position={
          this._isMouseDownRotation ? this._startCenter : this._position
        }
        colorX={this._colorX}
        colorY={this._colorY}
        colorZ={this._colorZ}
        shiftKey={this._shiftKey}
        showXZ={this.props.transformType === TransformType.Rotate}
        hoverObj={this._hoverObj}
        setHoverObj={(obj) => (this._hoverObj = obj)}
        handleDragStart={this._onRotationStart}
        handleRotateX={(diffX) => this._handleRotateX(diffX)}
        handleRotateY={(diffY) => this._handleRotateY(diffY)}
        handleRotateZ={(diffZ) => this._handleRotateZ(diffZ)}
        handleDragEnd={this._handleSetRotateEnd}
      />
    );
  }

  private _renderScale3D() {
    return (
      <ScalingUI3D
        position={this._isMouseDownScale ? this._startCenter : this._position}
        colorX={this._colorX}
        colorY={this._colorY}
        colorZ={this._colorZ}
        colorW={this._colorW}
        showXYZ={this.props.transformType === TransformType.Scale}
        hoverObj={this._hoverObj}
        setHoverObj={(obj) => (this._hoverObj = obj)}
        handleMouseDown={this._handleMouseDownScale}
        handleScaleX={(x) => this._handleScale(x, 0)}
        handleScaleY={(y) => this._handleScale(y, 1)}
        handleScaleZ={(z) => this._handleScale(z, 2)}
        handleFixedRatioScale={(scale) => this._handleScale(scale)}
        handleDragEnd={this._handleSetSeedScaleEnd}
      />
    );
  }

  private _renderTranslationHelper() {
    return (
      <UI3DContainer
        ui3D={editor.game.state.ui3D}
        onVoxel={(hitRes) => {
          if (this._isDraggingBox) {
            if (
              hitRes.mouseState === MouseState.release &&
              this._prevMouseState !== MouseState.release
            ) {
              this._isDraggingBox = false;
              this._tx.commit();
            } else {
              const diffX =
                hitRes.worldPosition[0] - this._startHitRes.worldPosition[0];
              const diffY =
                hitRes.worldPosition[1] - this._startHitRes.worldPosition[1];
              const diffZ =
                hitRes.worldPosition[2] - this._startHitRes.worldPosition[2];
              this._startPosRecord.forEach((pos, id) => {
                this._tx.push((action) =>
                  action.entitiesTree
                    .update(id)
                    .position(
                      vec3.fromValues(
                        pos[0] + diffX,
                        pos[1] + diffY,
                        pos[2] + diffZ,
                      ),
                    ),
                );
              });
            }
          } else {
            UI3DVoxelEventSchema.assign(this._startHitRes, hitRes);
          }
          this._prevMouseState = hitRes.mouseState;
          return false;
        }}
      ></UI3DContainer>
    );
  }

  private _getTipContent() {
    if (this._isMouseDownRotation) {
      return this._rotationContent;
    }
    if (this._isMouseDownScale) {
      return this._scaleContent;
    }
    return '';
  }

  private _renderTips() {
    const worldPos =
      this._isMouseDownScale || this._isMouseDownRotation
        ? this._startCenter
        : this._position;

    const canvas = editor.game.state.dom.canvas;
    if (!canvas) {
      return;
    }
    worldPosToClipPos(TEMP_VEC3, worldPos, editor.game.state.camera);
    const isVisible = clipPosToScreenPos(TEMP_VEC2, TEMP_VEC3, {
      height: canvas.height,
      width: canvas.width,
      left: 0,
      top: 0,
    });
    if (!isVisible) {
      return;
    }
    const posMargin = 6;
    const height = 17;
    return (
      <div
        style={{
          position: 'absolute',
          left: TEMP_VEC2[0] + posMargin,
          top: TEMP_VEC2[1] - height - posMargin,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          padding: '0 4px',
          whiteSpace: 'nowrap',
          borderRadius: 2,
          fontSize: 12,
          height: height,
          lineHeight: `${height}px`,
        }}
      >
        {this._getTipContent()}
      </div>
    );
  }

  public render() {
    this._setBoxSize();
    const hasLockedSeedSelected = store.getState().seeds.hasLockedSeedSelected;
    return (
      <div>
        {(this._getIsIdle() || this._isDraggingBox) && this._renderBoundBox()}
        {!hasLockedSeedSelected &&
          this.props.transformType === TransformType.Normal &&
          (this._getIsIdle() || this._isMouseDownTranslation) &&
          this._renderTranslation()}
        {!hasLockedSeedSelected &&
          this.props.transformType !== TransformType.Scale &&
          (this._getIsIdle() || this._isMouseDownRotation) &&
          this._renderRotation3D()}
        {!hasLockedSeedSelected &&
          this.props.transformType !== TransformType.Rotate &&
          (this._getIsIdle() || this._isMouseDownScale) &&
          this._renderScale3D()}
        {!hasLockedSeedSelected && this._renderTranslationHelper()}
        {!hasLockedSeedSelected &&
          (this._isMouseDownRotation || this._isMouseDownScale) &&
          this._renderTips()}
      </div>
    );
  }
}
