import React from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import zhMessages from '@game/i18n/zh.json';

// process/browser shim for official client code that reads process.env at runtime.
const processShim = require('process');
(window as any).process = processShim;

type ClientConfig = Record<string, unknown> & {
  mapInfo: Record<string, unknown>;
};

async function boot() {
  const configResponse = await fetch('./config.json', { cache: 'no-store' });
  if (!configResponse.ok) throw new Error('static game: missing config.json');
  const config = (await configResponse.json()) as ClientConfig;
  (window as any).CLIENT_CONFIG = config;

  const { default: PlayUi } = await import('@game/src/views/play');
  const root = createRoot(document.getElementById('root')!);
  const locale = String((config as any).locale || 'zh-CN');
  const messages = locale.toLowerCase().startsWith('zh')
    ? zhMessages
    : {};
  root.render(
    <IntlProvider locale={locale} messages={messages}>
      <PlayUi
        userInfo={null}
        setLoadingStage={() => {}}
        setLocale={() => {}}
      />
    </IntlProvider>,
  );
}

boot().catch((error) => {
  console.error(error);
  document.getElementById('root')!.textContent = `static game failed: ${String(error)}`;
});
