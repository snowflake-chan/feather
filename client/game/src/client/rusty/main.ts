import { createIntl } from 'react-intl';
import { resolve_intl } from 'src/utils/i18n';
import { getQueryParam } from 'src/utils/url-helpers';

/**
 * 在浏览器运行时，修改publicPath
 * 在rusty_box中，文件是在js根目录的
 * see: https://webpack.js.org/guides/public-path/#on-the-fly
 */
if (typeof document !== 'undefined' && process.env.WEB_PUBLIC_PATH) {
  __webpack_public_path__ = process.env.WEB_PUBLIC_PATH;
}

async function main() {
  const gameName = getQueryParam('hash');
  const mode = getQueryParam('mode') || 'play';

  try {
    const url =
      typeof location === 'undefined'
        ? process.env.RUSTY_CONFIG_URL
        : location.origin;

    const response = await fetch(
      `${url}/api/config/${mode}/${gameName}`,
      {
        credentials: 'include',
      },
    );

    const config = await response.json();

    const { clientConfig, locale, message } = config;

    if (!clientConfig) {
      console.error('Cannot get client config', config.error);

      return;
    }

    window['CLIENT_CONFIG'] = clientConfig;

    const intl = createIntl({
      locale,
      messages: message,
    });

    resolve_intl(intl);

    import('./async-init').then(async ({ initClient }) => {
      initClient(clientConfig);
    });
  } catch (err) {
    console.error('Failed to fetch config', err);
  }
}

main();
