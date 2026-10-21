import React from 'react';
import NextImage, { ImageProps } from 'next/legacy/image';

export const Image = React.memo((props: ImageProps) => {
  const src = props.src || '';
  if (typeof src == 'string' && src.match(/(http|https):\/\/\S*/)) {
    return <img {...props} src={src} />;
  }
  return <NextImage {...props} />;
});
