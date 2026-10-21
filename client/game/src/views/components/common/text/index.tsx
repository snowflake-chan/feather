import React from 'react';
import { calc_class_name } from 'src/utils/classname';
import style from './index.module.css';

type Color =
  | 'white'
  | 'red'
  | 'blue'
  | 'red-gradient'
  | 'green'
  | 'orange'
  | false
  | 'font-black'
  | 'font-black-important';
type Weight = 'minor' | 'disabled' | 'default' | 'important';

// to be imported in other components
export interface TextProps {
  fontSize?: number;
  textColor?: Color;
  bold?: boolean;
  fontWeight?: Weight;
  lineHeight?: number;
  autoLineHeight?: boolean;
}

interface Props {
  size?: number;
  lineHeight?: number;
  autoLineHeight?: boolean;
  lineClamp?: number;

  unselect?: boolean;
  center?: boolean;
  wrap?: boolean;
  fitContent?: boolean;
  bold?: boolean;

  color?: Color;
  weight?: Weight;
  className?: string;
  style?: React.CSSProperties;

  onClick?: () => void; // deprecated, should use button
  disabled?: boolean; //deprecated, should use weight="disabled"
}

export const WebText = React.memo((props: React.PropsWithChildren<Props>) => {
  const _props = useProps(props);
  return <p {..._props}>{props.children}</p>;
});

export function getTextStyle(props: TextProps) {
  const classname = calc_class_name(
    style.text,
    props.textColor && `color-${props.textColor}`,
    props.bold && style.bold,
    style[props.fontWeight || 'default'],
  );
  const fontSize = props.fontSize || 16;
  const textStyle = {
    // lineHeight: `${props.lineHeight || (props.fontSize || 16) * 1.5}px`,
    fontSize: `${fontSize}px`,
  };
  if (props.lineHeight) {
    textStyle['lineHeight'] = `${props.lineHeight}px`;
  } else if (props.autoLineHeight) {
    textStyle['lineHeight'] = `${fontSize * 1.5}px`;
  }
  return { classname, style: textStyle };
}

function useProps(props: Props) {
  const textStyle = getTextStyle({
    fontSize: props.size,
    textColor: props.color || 'font-black',
    bold: props.bold,
    fontWeight: props.weight,
    lineHeight: props.lineHeight,
    autoLineHeight: props.autoLineHeight,
  });

  const className = calc_class_name(
    textStyle.classname,
    props.className,
    props.wrap && style.wrap,
    props.onClick && style.clickable,
    props.center && 'text-center',
    props.unselect && style.unselect,
    props.fitContent && style.fitContent,

    'text', // todo: should be deprecated
    props.disabled && style.disabled, // todo: should be deprecated
  );
  if (props.lineClamp) {
    textStyle.style['--line-clamp'] = props.lineClamp;
  }

  return {
    className,
    style: Object.assign(textStyle.style, props.style),

    onClick: props.onClick, // todo: should be deprecated
  };
}
