import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import IconSvg from '../../assets/icons.svg';
import { ClientRuntimeConfig } from '../../configs/client';
import { IntlProvider } from 'react-intl';
import { LangType } from 'src/apis/createra';
import { syncClientConfig } from 'src/config/client';
import { UserState } from 'src/utils/user';

export type EngineAppProps = {
  locale: LangType;
  message: { [param: string]: string };
  clientConfig: ClientRuntimeConfig;
  userInfo: UserState | null;
};

export const EngineApp = (
  props: EngineAppProps & { children: React.ReactNode },
) => {
  const { clientConfig, locale, message } = props;

  const [localeMsg, setLocaleMsg] = useState<{ [param: string]: string }>(
    message,
  );

  const loadMsgOnDemand = useCallback(async () => {
    await import(`../../i18n/${locale}.json`).then((m) =>
      setLocaleMsg(m.default),
    );
  }, [locale]);

  useEffect(() => {
    loadMsgOnDemand();
  }, [locale, loadMsgOnDemand]);

  if (typeof window !== 'undefined') {
    // Legacy engine clients read this singleton. Keep it aligned with the
    // page-specific config (not only window.CLIENT_CONFIG), especially when
    // the launcher swaps the asset base to its signed local resource protocol.
    syncClientConfig(clientConfig);
    window['CLIENT_CONFIG'] = clientConfig;
  }

  // 修复了一个iOS系统缩放的问题：https://stackoverflow.com/questions/37808180/disable-viewport-zooming-ios-10-safari
  // prevent zoom
  useEffect(() => {
    const isSafari =
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const match = navigator.userAgent.match(/OS (\\d+)_(\\d+)_?(\\d+)?/);
    if (isSafari && match && Number(match[1]) >= 10) {
      const gestureStart = function (event) {
        event.preventDefault();
      };
      document.addEventListener('gesturestart', gestureStart);
      var lastTouchEnd = 0;
      const touchEnd = function (event) {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      };
      document.addEventListener('touchend', touchEnd, false);
      window['removePreventZoom'] = function () {
        document.removeEventListener('gesturestart', gestureStart);
        document.removeEventListener('touchend', touchEnd, false);
      };
    }
  }, []);
  const { description, name, image, customizeType } = clientConfig.mapInfo;
  const title = customizeType || name;
  const preconnectHref = Array.from(
    new Set(
      [clientConfig.CDN_PATH, clientConfig.BACKEND_SERVER_URL].filter(
        (href): href is string => Boolean(href),
      ),
    ),
  );
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          name="viewport"
          content="width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, shrink-to-fit=no, viewport-fit=cover, minimal-ui"
        />
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:site_name" content="BOX" />
        <meta property="og:type" content="webpage" />
        <meta property="og:description" content={description} />
        <meta name="twitter:description" content={description} />
        <meta itemProp="name" content={title} />
        <meta itemProp="description" name="description" content={description} />
        <meta property="og:image" content={image} />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta itemProp="image" content={image} />
        <meta property="og:url" content={''} />
        {preconnectHref.map((href) => (
          <link
            href={href}
            rel="preconnect"
            crossOrigin="anonymous"
            key={href}
          />
        ))}
        {clientConfig.mode === 'edit' && (
          <style id="monacoStyle">
            {
              /**
               * 这里存放覆盖Monaco的样式
               **/
              `
                .monaco-editor-background,
                .monaco-editor .margin {
                    background-color: transparent;
                }

                .monaco-editor .margin-view-overlays div.current-line,
                .monaco-editor .view-overlays div.current-line
                {
                    border: none;
                    background-color: rgba(200,200,200,.1);
                }

                .liveCursor {
                    border-right: solid #94b0c2 2px;
                    border-left: solid transparent 2px;
                    margin-left: -3px;
                    height: 24px;
                    position: absolute;
                    cursor:pointer;
                }
                .liveCursor::after {
                    content: ' ';
                    position: absolute;
                    top: -23px;
                    border-radius: 0.25em 0.25em 0.25em 0;
                    padding: 0px 0.5ch;
                    display: inline-block;
                    color: #333c57;
                    font-size: 0.9em;
                    pointer-events: none;
                    z-index: 1;
                    font-weight: bold;
                    background-color: #94b0c2;
                }
                .liveCursor.firstline::after {
                    top: 22px;
                    border-radius: 0 0.25em 0.25em 0.25em;
                }
                .hide::after {
                    opacity:0;
                }
                .hide:hover::after {
                    opacity:1;
                }
                .show::after {
                    -moz-animation: fadeOutAnime 0.8s forwards;
                    -webkit-animation: fadeOutAnime 0.8s forwards;
                    -o-animation: fadeOutAnime 0.8s forwards;
                    animation: fadeOutAnime 0.8s forwards;
                    -webkit-animation-fill-mode: forwards;
                    animation-fill-mode: forwards;
                    opacity: 1;
                }
                .show:hover::after {
                    opacity:1;
                }
                @keyframes fadeOutAnime {
                    0% {
                        opacity: 1;
                    }
                    99%{
                    opacity: 1;
                    }
                    100% {
                        opacity: 0;
                    }
                }
                @-webkit-keyframes fadeOutAnime {
                    0% {
                        opacity: 1;
                    }
                    99%{
                    opacity: 1;
                    }
                    100% {
                        opacity: 0;
                    }
                }
              `
            }
          </style>
        )}
      </Head>
      <IconSvg />
      <noscript>Please allow JavaScript in order to use this site.</noscript>
      <IntlProvider messages={localeMsg} locale={locale}>
        {props.children}
      </IntlProvider>
    </>
  );
};
