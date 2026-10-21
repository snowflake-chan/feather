import React, { useEffect, useRef, useState } from 'react';
import { calc_class_name } from 'src/utils/classname';
import { usePrevious } from 'src/utils/react-hooks/common';
import { hashURL, ImageFit, ImageFormats } from 'src/utils/hash-url';
import { Image } from '../../components/image';
import defaultGameCoverUniversal from 'src/assets/default_game_cover_universal.png';

import style from './index.module.css';

interface BaseProps {
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (ev: React.MouseEvent<HTMLImageElement, MouseEvent>) => void;
}

interface PictureProps extends BaseProps {
  width: number;
  height: number;
  hash: string;
  fit?: ImageFit; // default is cover
}

interface ImageProps extends BaseProps {
  src: string;
}

const IMAGE_ORDER: { format: ImageFormats; type: string }[] = [
  { format: 'avif', type: 'image/avif' },
  { format: 'webp', type: 'image/webp' },
  { format: 'jpg', type: 'image/jpeg' },
  { format: 'png', type: 'image/png' },
];

const imgClsName = 'web-img';

function useImage(props: PictureProps | ImageProps) {
  const [error, setError] = useState<boolean>(false);

  return {
    imgProps: {
      alt: props.alt || '',
      width: props.width,
      height: props.height,
      onClick: props.onClick,
      style: props.style,
      className: calc_class_name(
        props.className,
        style.image,
        props.onClick && 'cursor-pointer',
        imgClsName,
      ),
      crossOrigin: 'anonymous' as 'anonymous',
      onError: !error
        ? (e) => {
            setError(true);
          }
        : undefined,
    },
    setError,
  };
}

function isAvailablePictureType(hash: string) {
  return /\.(png|jpe?g|webp|avif|wp2)$/.test(hash) || noExtension(hash);
}

function noExtension(hash: string) {
  return !/\./.test(hash);
}

function renderPictureSource(srcsetName: string, props: PictureProps) {
  if (!props.hash) {
    return null;
  }
  const element = (
    <>
      {IMAGE_ORDER.map((item, i) => (
        <source
          key={i}
          type={item.type}
          {...{
            [srcsetName]: `${hashURL(props.hash)} 1x, ${hashURL(
              props.hash,
            )} 2x`,
          }}
        />
      ))}
    </>
  );

  return element;
}

function DefaultImage(props: BaseProps) {
  return <Image {...props} layout="fill" src={defaultGameCoverUniversal} />;
}

/**
 * Use lazysizes library
 * Polyfilled in html-entry in case browser-level lazy-loading is not supported
 * Ref: https://github.com/aFarkas/lazysizes
 * @param props
 */
function LazyPicture_LazyLoad(props: PictureProps) {
  const { imgProps } = useImage(props);
  const prevSrc = usePrevious(props.hash);
  const ref = useRef<HTMLImageElement>(null);

  if (!imgProps.onError) {
    return <DefaultImage {...props} />;
  }

  if (!isAvailablePictureType(props.hash)) {
    return <LazeImage_LazyLoad {...props} src={hashURL(props.hash)} />;
  }

  if (prevSrc !== props.hash && ref.current) {
    ref.current.classList.add('lazyload');
  }

  return (
    <picture>
      {renderPictureSource('data-srcset', props)}
      <img
        {...imgProps}
        ref={ref}
        data-src={hashURL(props.hash)}
        className={'lazyload ' + imgProps.className}
      />
    </picture>
  );
}
function LazeImage_LazyLoad(props: ImageProps) {
  const { imgProps } = useImage(props);
  const prevSrc = usePrevious(props.src);
  const ref = useRef<HTMLImageElement>(null);
  if (prevSrc !== props.src && ref.current) {
    ref.current.classList.add('lazyload');
  }

  if (!imgProps.onError) {
    return <DefaultImage {...props} />;
  }

  return (
    <img
      {...imgProps}
      ref={ref}
      data-src={props.src}
      className={'lazyload ' + imgProps.className}
    />
  );
}

/**
 * Use browser-level for lazy loading
 * Browser compatibility: https://caniuse.com/?search=loading%3Dlazy
 * Ref: https://web.dev/browser-level-image-lazy-loading
 * @param props
 */
function LazyPicture_BrowserLevel(props: PictureProps) {
  const { imgProps, setError } = useImage(props);

  useEffect(() => {
    setError(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.hash]);

  if (!imgProps.onError) {
    return <DefaultImage {...props} />;
  }

  if (!isAvailablePictureType(props.hash)) {
    return <LazyImage_BrowserLevel {...props} src={hashURL(props.hash)} />;
  }

  return (
    <picture>
      {renderPictureSource('srcSet', props)}
      <img {...imgProps} loading="lazy" src={hashURL(props.hash)} />
    </picture>
  );
}
function LazyImage_BrowserLevel(props: ImageProps) {
  const { imgProps } = useImage(props);
  if (!imgProps.onError) {
    return <DefaultImage {...props} />;
  }

  return <img {...imgProps} loading="lazy" src={props.src} />;
}

/**
 * Default loading images
 * @param props
 */
function Picture_BrowserLevel(props: PictureProps) {
  const { imgProps } = useImage(props);

  if (!imgProps.onError) {
    return <DefaultImage {...props} />;
  }

  if (!isAvailablePictureType(props.hash)) {
    return <img {...imgProps} src={hashURL(props.hash)} />;
  }

  return (
    <picture>
      {renderPictureSource('srcSet', props)}
      <img {...imgProps} src={hashURL(props.hash)} />
    </picture>
  );
}

/**
 * Polyfilled responsive picture with lazysizes library.
 * Don't wanna implement other libraries.
 * @param props
 */
function Picture_Polyfill(props: PictureProps) {
  const { imgProps } = useImage(props);
  const prevSrc = usePrevious(props.hash);
  const ref = useRef<HTMLImageElement>(null);

  if (!imgProps.onError) {
    return <DefaultImage {...props} />;
  }

  if (!isAvailablePictureType(props.hash)) {
    return <img {...imgProps} src={hashURL(props.hash)} />;
  }

  if (prevSrc !== props.hash && ref.current) {
    ref.current.classList.add('lazyload');
  }

  return (
    <picture>
      {renderPictureSource('data-srcset', props)}
      <img
        {...imgProps}
        ref={ref}
        data-src={hashURL(props.hash)}
        className={'lazyload ' + imgProps.className}
      />
    </picture>
  );
}

function isSupportBrowserLazy() {
  return 'loading' in HTMLImageElement.prototype;
}

// TODO: 仅在website的组件中使用，待website部分清理时可以一起删除
const LazyPicture = isSupportBrowserLazy()
  ? LazyPicture_BrowserLevel
  : LazyPicture_LazyLoad;

// TODO: 线上仅在landingBackground组件中使用。其余部分可以待后续清理
const Picture = isSupportBrowserLazy()
  ? Picture_BrowserLevel
  : Picture_Polyfill;

export { Picture, LazyPicture };
