import * as React from 'react';
import { UI3DContextWrapper } from './index';
import {
  UI3DSeedSchema,
  UI3DMouseHandler,
  UI3DMouseEvent,
  UI3DMouseOutHandler,
} from 'src/engine/ui3d/ui3d-schema';
import { GLMeshSchema } from 'src/engine/mesh/gl-controller/gl-mesh-schema';
import { setMotionTexture } from '../../../../engine/mesh/gl-controller/gl-mesh-controller';
import {
  Renderable,
  isGLTexture,
  isGLMesh,
  isGPUMesh,
  isGPUModelTexture,
} from '../../../../engine/mesh/renderable-schema';
import { mat4, vec4, vec3, quat } from 'gl-matrix';
import { GLTextureSchema } from 'src/engine/gl/schema/gl-texture';
import { editor } from 'src/client/edit/edit-client';
import { parseDefaultMotion } from 'src/engine/mesh/parse/model-animation';
import {
  GPUMeshSchema,
  GPUModelTextureSchema,
} from 'src/engine/mesh/gpu-controller/gpu-mesh-schema';
import { setMotionGroup } from 'src/engine/mesh/gpu-controller/gpu-mesh-controller';
import { testFrustumBox } from 'src/engine/utils/frustum';

export const UI3DSeed = UI3DContextWrapper(
  UI3DSeedSchema,
  'seed',
  (
    element,
    props: {
      seedId: string;
      lightmapId: number;
      glRef: Renderable;
      model: mat4;
      color: vec4;
      position: vec3;
      scale: vec3;
      orientation: quat;
      bounds: vec3;
      metalness: number;
      shininess: number;
      emissive: number;
      defaultMotionId: string;
      animationStartTick: number;
      staticShadow: boolean;
      onMouse?: UI3DMouseHandler;
      onMouseIn?: UI3DMouseHandler;
      onMouseOut?: UI3DMouseOutHandler;
    },
    context,
  ) => {
    element.lightmapId = props.lightmapId;
    if (element.seedId !== props.seedId) {
      if (isGLMesh(props.glRef)) {
        element.glRef = GLMeshSchema.alloc();
        GLMeshSchema.assign(element.glRef, props.glRef);
      }
      if (isGLTexture(props.glRef)) {
        element.glRef = GLTextureSchema.alloc();
        GLTextureSchema.assign(element.glRef, props.glRef);
      }
      if (isGPUMesh(props.glRef)) {
        element.glRef = GPUMeshSchema.alloc();
        GPUMeshSchema.assign(element.glRef, props.glRef);
      }
      if (isGPUModelTexture(props.glRef)) {
        element.glRef = GPUModelTextureSchema.alloc();
        GPUModelTextureSchema.assign(element.glRef, props.glRef);
      }
    }
    mat4.copy(element.model, props.model);
    vec4.copy(element.color, props.color);
    vec3.copy(element.position, props.position);
    vec3.copy(element.scale, props.scale);
    quat.copy(element.orientation, props.orientation);
    vec3.copy(element.bounds, props.bounds);
    element.metalness = props.metalness;
    element.shininess = props.shininess;
    element.emissive = props.emissive;
    element.defaultMotionId = props.defaultMotionId;
    element.animationStartTick = props.animationStartTick;
    element.meshIsTransparent = false;
    element.useMotionTexture = false;
    element.renderShadow = props.color[3] === 1;
    element.staticShadow = props.staticShadow;
    if (isGLMesh(element.glRef) || isGPUMesh(element.glRef)) {
      element.meshIsTransparent = element.glRef.staticIsTransparent;
      const playbackInfo = parseDefaultMotion(element.glRef, {
        id: element.defaultMotionId,
        startTick: element.animationStartTick,
        currTick: editor.game.state.clock.tick,
      });
      if (playbackInfo) {
        const rx = element.bounds[0] * element.scale[0];
        const ry = element.bounds[1] * element.scale[1];
        const rz = element.bounds[2] * element.scale[2];
        if (
          testFrustumBox(
            editor.game.state.camera.frustum,
            element.position[0] - rx,
            element.position[1] - ry,
            element.position[2] - rz,
            element.position[0] + rx,
            element.position[1] + ry,
            element.position[2] + rz,
          )
        ) {
          element.useMotionTexture = true;
          element.meshIsTransparent = playbackInfo.animation.isTransparent;

          if (isGLMesh(element.glRef)) {
            setMotionTexture(
              element,
              editor.game.state,
              element.glRef,
              playbackInfo,
            );
          } else if (isGPUMesh(element.glRef)) {
            setMotionGroup(
              element,
              editor.game.state,
              element.glRef,
              playbackInfo,
            );
          }
        }
      }
    }

    if (props.onMouse) {
      element.onMouseChange = props.onMouse;
    } else {
      element.onMouseChange = null;
    }
    if ('onMouseIn' in props && props.onMouseIn !== undefined) {
      element.onMouseIn = props.onMouseIn as UI3DMouseHandler;
    } else {
      element.onMouseIn = null;
    }
    if ('onMouseOut' in props && props.onMouseOut !== undefined) {
      element.onMouseOut = props.onMouseOut as UI3DMouseOutHandler;
    } else {
      element.onMouseOut = null;
    }
  },
);

interface UI3DSeedProps {
  seedId: string;
  lightmapId: number;
  glRef: Renderable;
  model: mat4;
  color: vec4;
  position: vec3;
  scale: vec3;
  orientation: quat;
  bounds: vec3;
  metalness: number;
  shininess: number;
  emissive: number;
  defaultMotionId?: string;
  staticShadow?: boolean;
  onMouseDown?: (ev) => void;
  onMouseMove?: (ev) => void;
  onMouseUp?: (ev) => void;
  onMouseOut?: () => void;
  onMouseIn?: () => void;
}

export class SeedView extends React.Component<UI3DSeedProps, {}> {
  private _prevMouseState: number = -1;
  private _prevPos = vec3.create();
  private _isMouseDown = false;
  private _isMouseIn = false;

  private _lastPos = vec3.create();

  private _startTick = editor.game.state.clock.tick;

  constructor(props) {
    super(props);
  }

  private onMouseDown(ev: UI3DMouseEvent) {
    this.props.onMouseDown && this.props.onMouseDown(ev);
    vec3.copy(this._lastPos, ev.worldPosition);
    this._isMouseDown = true;
  }

  private onMouseMove(ev: UI3DMouseEvent) {
    this.props.onMouseMove && this.props.onMouseMove(ev);
  }

  private onMouseUp(ev: UI3DMouseEvent) {
    this.props.onMouseUp && this.props.onMouseUp(ev);
    this._isMouseDown = false;
  }

  private handleMouse(ev: UI3DMouseEvent) {
    let hit = false;
    if (ev.mouseButton === 0) {
      if (ev.mouseState === 1 && this._prevMouseState === 0) {
        this.onMouseDown(ev as UI3DMouseEvent);
        hit = true;
      } else if (
        ev.mouseState === 0 &&
        this._isMouseDown &&
        (this._prevMouseState === 1 || this._prevMouseState === 2)
      ) {
        this.onMouseUp(ev as UI3DMouseEvent);
        hit = true;
      }
      if (ev.mouseState === 0 || ev.mouseState === 2) {
        if (!vec3.equals(ev.worldPosition, this._prevPos)) {
          this.onMouseMove(ev as UI3DMouseEvent);
        }
        hit = true;
      }
    }
    this._prevMouseState = ev.mouseState;
    vec3.copy(this._prevPos, ev.worldPosition);
    return hit;
  }

  componentDidUpdate(prevProps: Readonly<UI3DSeedProps>): void {
    if (prevProps.defaultMotionId !== this.props.defaultMotionId) {
      this._startTick = editor.game.state.clock.tick;
    }
  }

  public render() {
    return (
      <UI3DSeed
        seedId={this.props.seedId}
        lightmapId={this.props.lightmapId}
        glRef={this.props.glRef}
        model={this.props.model}
        color={this.props.color}
        position={this.props.position}
        scale={this.props.scale}
        orientation={this.props.orientation}
        bounds={this.props.bounds}
        metalness={this.props.metalness}
        shininess={this.props.shininess}
        emissive={this.props.emissive}
        defaultMotionId={this.props.defaultMotionId || ''}
        animationStartTick={this._startTick}
        staticShadow={!!this.props.staticShadow}
        onMouse={(ev) => {
          const rst = this.handleMouse(ev as UI3DMouseEvent);
          return rst;
        }}
        onMouseOut={() => {
          if (this._isMouseDown || this._isMouseIn) {
            this.props.onMouseOut && this.props.onMouseOut();
            this._isMouseDown = false;
            this._isMouseIn = false;
            return true;
          } else {
            return false;
          }
        }}
        onMouseIn={() => {
          this.props.onMouseIn && this.props.onMouseIn();
          this._isMouseIn = true;
          return true;
        }}
      />
    );
  }
}
