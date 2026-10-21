import type { JSX } from 'react';
import * as React from 'react';
import imgGameCover from 'src/assets/default_map_cover.png';
import { hashURL } from 'src/utils/hash-url';
import { Image } from 'src/views/components/image';
import style from './index.module.css';

type Props = {
  id: number;
  name: string;
  nameIcon?: JSX.Element;
  nameDisplay?: 'center' | 'flex-start';
  selected: boolean;
  style?: React.CSSProperties;
  previewImg?: string;
  hideDefaultImg?: boolean;
  imgText?: string;
  onClick: (id: number, event: React.MouseEvent) => void;
};

type State = {};

export class Card extends React.Component<Props, State> {
  public shouldComponentUpdate(nextProps: Props, nextState: State) {
    if (
      nextProps.id !== this.props.id ||
      nextProps.name !== this.props.name ||
      nextProps.selected !== this.props.selected ||
      nextProps.previewImg !== this.props.previewImg ||
      nextProps.imgText !== this.props.imgText ||
      nextProps.hideDefaultImg !== this.props.hideDefaultImg
    ) {
      return true;
    }
    if (
      (nextProps.style && !this.props.style) ||
      (!nextProps.style && this.props.style)
    ) {
      return true;
    }
    if (nextProps.style && this.props.style) {
      const nextKeys = Object.keys(nextProps.style);
      const currentKeys = Object.keys(this.props.style);
      if (nextKeys.length !== currentKeys.length) {
        return true;
      }
      for (let i = 0; i < nextKeys.length; i++) {
        if (nextProps.style[nextKeys[i]] !== this.props.style[nextKeys[i]]) {
          return true;
        }
      }
    }
    return false;
  }

  public render() {
    const cardStyle = {};
    if (this.props.previewImg) {
      Object.assign(cardStyle, {
        backgroundImage: `url(${hashURL(this.props.previewImg)}`,
      });
    }
    if (this.props.style) {
      Object.assign(cardStyle, this.props.style);
    }

    return (
      <div
        className={this.props.selected ? style.cardSelected : style.card}
        onClick={(e) => this.props.onClick(this.props.id, e)}
        style={cardStyle}
      >
        {!this.props.previewImg && !this.props.hideDefaultImg && (
          <Image className={style.defaultBg} src={imgGameCover} layout="fill" />
        )}
        <div className={style.mask}></div>
        {this.props.imgText && !this.props.previewImg && (
          <div className={style.imgTextContainer}>
            <div>{this.props.imgText}</div>
          </div>
        )}
        <div
          className={style.name}
          style={{
            justifyContent: this.props.nameDisplay || 'center',
          }}
        >
          {this.props.nameIcon && this.props.nameIcon}
          <span className={style.nameText}>{this.props.name}</span>
        </div>
      </div>
    );
  }
}
