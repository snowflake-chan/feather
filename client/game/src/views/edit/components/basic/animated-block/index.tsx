import * as React from 'react';
import { hashURL } from 'src/utils/hash-url';
import { writeClipboardText } from 'src/utils/copy2clipboard';
import { TooltipTrigger, Toast } from '@box/box-design';
import { BlockInfo, BlockIndex } from '@box/schema/voxel/block-schema';
import style from './index.module.css';

type BlockProps = {
  id: number;
  selected: boolean;
  name: string;
  blockInfo: BlockInfo;
  blockIndex: BlockIndex;
  rotation: number;
  onClick: (id: number) => void;
  onRotateVoxel: (id: number) => void;
};

type BlockState = {
  frame: number[];
};

function unpackTexCoord(id: number, offset: number) {
  return ` -${((id & 0xff) << 4) + (offset << 4)}px -${
    ((id >>> 8) & 0xff) << 4
  }px`;
}

export class AnimatedBlock extends React.Component<BlockProps, BlockState> {
  private intervalId: number | null = null;
  private interval: number = 1000;

  private animaInfo = [1, 1, 1, 1, 1, 1];
  constructor(props) {
    super(props);
    this.state = {
      frame: [0, 0, 0, 0, 0, 0],
    };
  }

  public componentDidMount() {
    this.checkIsAnimateBlock(this.props.id);
  }

  public componentWillUnmount() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
    }
  }

  private _handleClick = () => {
    this.props.onClick(this.props.id);
  };

  private animateTexture() {
    this.intervalId = window.setInterval(() => {
      const prevframe = this.state.frame;
      this.setState({
        frame: [
          (prevframe[0] + 1) % this.animaInfo[0],
          (prevframe[1] + 1) % this.animaInfo[1],
          (prevframe[2] + 1) % this.animaInfo[2],
          (prevframe[3] + 1) % this.animaInfo[3],
          (prevframe[4] + 1) % this.animaInfo[4],
          (prevframe[5] + 1) % this.animaInfo[5],
        ],
      });
    }, this.interval);
  }

  private checkIsAnimateBlock(id: number) {
    const blockInfo = this.props.blockInfo;
    let idIndx = 0;
    for (let i = 0; i < blockInfo.ids.length; i++) {
      if (blockInfo.ids[i] === id) {
        idIndx = i;
        break;
      }
    }
    let hasAnimtion = false;
    this.animaInfo = [];
    let maxFrame = 1;
    for (let j = 0; j < 6; j++) {
      const frame = blockInfo.animLength[idIndx * 6 + j];
      if (frame > 1) {
        hasAnimtion = true;
      }
      this.animaInfo[j] = frame;
      maxFrame = Math.max(maxFrame, frame);
    }
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
    }
    if (hasAnimtion) {
      this.interval = 1000 / maxFrame;
      this.animateTexture();
    }
  }

  public UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.rotation !== this.props.rotation ||
      nextProps.id !== this.props.id ||
      nextProps.selected !== this.props.selected
    ) {
      this.checkIsAnimateBlock(nextProps.id);
      return true;
    }
    return false;
  }

  private _copyNameToClipboard = () => {
    try {
      writeClipboardText(this.props.name)
        .then(() => {
          // 显示复制成功的提示
          Toast.success({
            content: `已复制: ${this.props.name}`,
            duration: 1,
          });
        })
        .catch((err) => {
          Toast.error({
            content: '复制失败',
            duration: 1,
          });
          console.error('复制到剪贴板失败:', err);
        });
    } catch (err) {
      Toast.error({
        content: '复制失败',
        duration: 1,
      });
      console.error('复制到剪贴板失败:', err);
    }
  };

  public render() {
    if (this.props.blockInfo.colorAtlas.length === 0) {
      return null;
    }
    const id = this.props.id;
    const fluid = this.props.blockIndex.fluid[id];
    let cubeStyle = style.cube + ' ';
    let wrapStyle = style.wrap;
    if (this.props.selected) {
      cubeStyle += style.cubeFullSelected;
    } else {
      cubeStyle += style.cubeFull;
    }
    if (fluid) {
      const fluidInfo = this.props.blockIndex.fluidInfo[fluid];
      const r = fluidInfo & 0xff;
      const g = (fluidInfo & 0xff00) >> 8;
      const b = (fluidInfo & 0xff0000) >>> 16;
      const a = (fluidInfo >>> 24) / 0xff;
      const bgStyle = {
        backgroundColor: `rgba(${r},${g},${b},${a.toFixed(3)})`,
      };
      return (
        <div className={wrapStyle}>
          <div className={cubeStyle} onClick={this._handleClick}>
            <div className={style.waterLeft} style={bgStyle} />
            <div className={style.waterRight} style={bgStyle} />
            <div className={style.waterBottom} style={bgStyle} />
            <div className={style.waterTop} style={bgStyle} />
            <div className={style.waterFront} style={bgStyle} />
            <div className={style.waterBack} style={bgStyle} />
          </div>
          <TooltipTrigger text={this.props.name} placement="rightTop">
            <div
              className={style.label}
              onClick={this._copyNameToClipboard}
              style={{ cursor: 'pointer' }}
              title="点击复制名称到剪贴板"
            >
              {this.props.name}
            </div>
          </TooltipTrigger>
        </div>
      );
    }
    const url = `url('${hashURL(this.props.blockInfo.colorAtlas[0])}')`;
    const offset = 6 * this.props.id;
    const textures = this.props.blockIndex.texture;
    let boxShadow: string = 'none';
    const emissive = this.props.blockIndex.emissive[id];
    if (emissive) {
      boxShadow = `0px 0px 5px rgb(${(emissive & 0xf) << 4},${
        emissive & 0xf0
      },${(emissive & 0xf00) >> 4})`;
    }
    const rotation = [style.north, style.west, style.south, style.east];
    return (
      <div className={wrapStyle}>
        <div
          className={[cubeStyle, rotation[this.props.rotation]].join(' ')}
          onClick={this._handleClick}
        >
          <div
            className={style.left}
            style={{
              background:
                url + unpackTexCoord(textures[offset], this.state.frame[0]),
              boxShadow,
            }}
          />
          <div
            className={style.right}
            style={{
              background:
                url + unpackTexCoord(textures[offset + 1], this.state.frame[1]),
              boxShadow,
            }}
          />
          <div
            className={style.bottom}
            style={{
              background:
                url + unpackTexCoord(textures[offset + 2], this.state.frame[2]),
              boxShadow,
            }}
          />
          <div
            className={style.top}
            style={{
              background:
                url + unpackTexCoord(textures[offset + 3], this.state.frame[3]),
              boxShadow,
            }}
          />
          <div
            className={style.front}
            style={{
              background:
                url + unpackTexCoord(textures[offset + 4], this.state.frame[4]),
              boxShadow,
            }}
          />
          <div
            className={style.back}
            style={{
              background:
                url + unpackTexCoord(textures[offset + 5], this.state.frame[5]),
              boxShadow,
            }}
          />
        </div>
        <div
          className={style.rotateBtn}
          onClick={() => {
            this.props.onRotateVoxel(this.props.id);
          }}
        ></div>
        <TooltipTrigger text={this.props.name} placement="rightTop">
          <div
            className={style.label}
            onClick={this._copyNameToClipboard}
            style={{ cursor: 'pointer' }}
            title="点击复制名称到剪贴板"
          >
            {this.props.name}
          </div>
        </TooltipTrigger>
      </div>
    );
  }
}
