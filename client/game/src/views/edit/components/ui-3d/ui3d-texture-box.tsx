import * as React from 'react';
import { UI3DTextureBoxSchema } from 'src/engine/ui3d/ui3d-schema';
import { UI3DContextWrapper, UI3DBox } from './index';
import { vec3, mat4, vec2 } from 'gl-matrix';
import { BoxGeometry } from './3d-shapes/boxGeometry';
import { editor } from 'src/client/edit/edit-client';

export const UI3DTextureBox = UI3DContextWrapper(
  UI3DTextureBoxSchema,
  'textureBox',
  (
    element,
    props: {
      opacity?: number;
      dimension?: vec3;
      position: vec3;
      offset?: vec3;
      blockType: number;
      texCoordXPos: vec2;
      texCoordXNeg: vec2;
      texCoordYPos: vec2;
      texCoordYNeg: vec2;
      texCoordZPos: vec2;
      texCoordZNeg: vec2;
      frames: number[];
      atlasRadius: number;
      rotation: number;
    },
    context,
  ) => {
    if (element.vertices.length === 0) {
      element.vertices = BoxGeometry().vertices;
    }
    if (props.dimension) {
      vec3.copy(element.dimension, props.dimension);
    } else {
      vec3.set(element.dimension, 1, 1, 1);
    }
    if (props.opacity !== undefined) {
      element.opacity = props.opacity;
    } else {
      element.opacity = 1;
    }
    element.blockType = props.blockType;
    if (!vec3.equals(element.position, props.position)) {
      vec3.copy(element.position, props.position);
      mat4.identity(element.translateMat);
      mat4.translate(
        element.translateMat,
        element.translateMat,
        element.position,
      );
    }
    if (props.offset) {
      vec3.copy(element.offset, props.offset);
    } else {
      vec3.set(element.offset, 0, 0, 0);
    }
    vec2.copy(element.texCoordXPos, props.texCoordXPos);
    vec2.copy(element.texCoordXNeg, props.texCoordXNeg);
    vec2.copy(element.texCoordYPos, props.texCoordYPos);
    vec2.copy(element.texCoordYNeg, props.texCoordYNeg);
    vec2.copy(element.texCoordZPos, props.texCoordZPos);
    vec2.copy(element.texCoordZNeg, props.texCoordZNeg);
    element.atlasRadius = props.atlasRadius;
    element.rotation = props.rotation;
    element.frameLeft = props.frames[0];
    element.frameRight = props.frames[1];
    element.frameBottom = props.frames[2];
    element.frameTop = props.frames[3];
    element.frameFront = props.frames[4];
    element.frameBack = props.frames[5];
  },
);

interface TextureBoxProps {
  opacity: number;
  dimension: vec3;
  position: vec3;
  offset: vec3;
  blockType: number;
  rotation: number;
}

interface TextureBoxState {
  texCoordXPos: vec2;
  texCoordXNeg: vec2;
  texCoordYPos: vec2;
  texCoordYNeg: vec2;
  texCoordZPos: vec2;
  texCoordZNeg: vec2;
  color: vec3;
  isFluid: boolean;
}

function unpackTexCoord(coord: vec2, texCode: number) {
  return vec2.set(coord, texCode & 0xff, (texCode >> 8) & 0xff);
}

export class TextureBox extends React.Component<
  TextureBoxProps,
  TextureBoxState
> {
  private frames = [1, 1, 1, 1, 1, 1];

  constructor(props) {
    super(props);

    this.state = {
      isFluid: false,
      color: vec3.create(),
      texCoordXPos: vec2.create(),
      texCoordXNeg: vec2.create(),
      texCoordYPos: vec2.create(),
      texCoordYNeg: vec2.create(),
      texCoordZPos: vec2.create(),
      texCoordZNeg: vec2.create(),
    };
  }

  public componentDidMount() {
    this.computeTextCoord(this.props.blockType, this.props.rotation);
  }

  public UNSAFE_componentWillReceiveProps(nextProps: TextureBoxProps) {
    if (
      this.props.blockType !== nextProps.blockType ||
      this.props.rotation !== nextProps.rotation
    ) {
      this.computeTextCoord(nextProps.blockType, nextProps.rotation);
    }
    return true;
  }

  private computeTextCoord(id: number, rotateInfo: number) {
    const blockIndex = editor.game.state.blockIndex;
    const blockInfo = editor.game.state.blockInfo;
    const fluid = blockIndex.fluid[id];
    if (fluid) {
      const fluidInfo = blockIndex.fluidInfo[fluid];
      const r = fluidInfo & 0xff;
      const g = (fluidInfo & 0xff00) >> 8;
      const b = (fluidInfo & 0xff0000) >>> 16;
      this.setState({
        color: vec3.fromValues(r / 255, g / 255, b / 255),
        isFluid: true,
      });
      return;
    }

    let idIndx = 0;
    for (let i = 0; i < blockInfo.ids.length; i++) {
      if (blockInfo.ids[i] === id) {
        idIndx = i;
        break;
      }
    }

    for (let j = 0; j < 6; j++) {
      this.frames[j] = blockInfo.animLength[idIndx * 6 + j];
    }
    const blockTexture = blockIndex.texture;

    let new_texCoordXPos = unpackTexCoord(
      vec2.create(),
      blockTexture[6 * (id & 0x0fff) + 0],
    );
    let new_texCoordXNeg = unpackTexCoord(
      vec2.create(),
      blockTexture[6 * (id & 0x0fff) + 1],
    );
    const new_texCoordYPos = unpackTexCoord(
      vec2.create(),
      blockTexture[6 * (id & 0x0fff) + 2],
    );
    const new_texCoordYNeg = unpackTexCoord(
      vec2.create(),
      blockTexture[6 * (id & 0x0fff) + 3],
    );
    let new_texCoordZPos = unpackTexCoord(
      vec2.create(),
      blockTexture[6 * (id & 0x0fff) + 4],
    );
    let new_texCoordZNeg = unpackTexCoord(
      vec2.create(),
      blockTexture[6 * (id & 0x0fff) + 5],
    );
    if (rotateInfo === 3) {
      new_texCoordXPos = unpackTexCoord(
        vec2.create(),
        blockTexture[6 * (id & 0x0fff) + 4],
      );
      new_texCoordZPos = unpackTexCoord(
        vec2.create(),
        blockTexture[6 * (id & 0x0fff) + 1],
      );
      new_texCoordXNeg = unpackTexCoord(
        vec2.create(),
        blockTexture[6 * (id & 0x0fff) + 5],
      );
      new_texCoordZNeg = unpackTexCoord(
        vec2.create(),
        blockTexture[6 * (id & 0x0fff) + 0],
      );
    } else if (rotateInfo === 2) {
      new_texCoordXPos = unpackTexCoord(
        vec2.create(),
        blockTexture[6 * (id & 0x0fff) + 1],
      );
      new_texCoordZPos = unpackTexCoord(
        vec2.create(),
        blockTexture[6 * (id & 0x0fff) + 5],
      );
      new_texCoordXNeg = unpackTexCoord(
        vec2.create(),
        blockTexture[6 * (id & 0x0fff) + 0],
      );
      new_texCoordZNeg = unpackTexCoord(
        vec2.create(),
        blockTexture[6 * (id & 0x0fff) + 4],
      );
    } else if (rotateInfo === 1) {
      new_texCoordXPos = unpackTexCoord(
        vec2.create(),
        blockTexture[6 * (id & 0x0fff) + 5],
      );
      new_texCoordZPos = unpackTexCoord(
        vec2.create(),
        blockTexture[6 * (id & 0x0fff) + 0],
      );
      new_texCoordXNeg = unpackTexCoord(
        vec2.create(),
        blockTexture[6 * (id & 0x0fff) + 4],
      );
      new_texCoordZNeg = unpackTexCoord(
        vec2.create(),
        blockTexture[6 * (id & 0x0fff) + 1],
      );
    }

    this.setState({
      isFluid: false,
      texCoordXPos: new_texCoordXPos,
      texCoordXNeg: new_texCoordXNeg,
      texCoordYPos: new_texCoordYPos,
      texCoordYNeg: new_texCoordYNeg,
      texCoordZPos: new_texCoordZPos,
      texCoordZNeg: new_texCoordZNeg,
    });
  }

  public render() {
    if (this.state.isFluid) {
      return (
        <UI3DBox
          position={this.props.position}
          centerAtBottom={false}
          offset={vec3.fromValues(0.5, 0.5, 0.5)}
          dimension={this.props.dimension}
          color={this.state.color}
          opacity={0.5}
          line={false}
          screenSizeFixed={false}
        />
      );
    } else {
      return (
        <UI3DTextureBox
          texCoordXPos={this.state.texCoordXPos}
          texCoordXNeg={this.state.texCoordXNeg}
          texCoordYPos={this.state.texCoordYPos}
          texCoordYNeg={this.state.texCoordYNeg}
          texCoordZPos={this.state.texCoordZPos}
          texCoordZNeg={this.state.texCoordZNeg}
          opacity={this.props.opacity}
          dimension={this.props.dimension}
          position={this.props.position}
          offset={this.props.offset}
          blockType={this.props.blockType}
          atlasRadius={editor.game.state.blockInfo.atlasRadius << 4}
          rotation={this.props.rotation}
          frames={this.frames}
        ></UI3DTextureBox>
      );
    }
  }
}
