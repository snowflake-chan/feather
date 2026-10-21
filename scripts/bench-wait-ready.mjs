#!/usr/bin/env node
import process from 'node:process';

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const urls = [];
for (let i = 0; i < process.argv.length; i++) {
  if (process.argv[i] === '--url' && process.argv[i + 1]) urls.push(process.argv[++i]);
}
if (urls.length === 0) {
  urls.push('http://127.0.0.1:9966', 'http://127.0.0.1:3000');
}
const timeoutMs = Number(arg('--timeout', '600000'));
const intervalMs = Number(arg('--interval', '100'));
const started = Date.now();
let attempts = 0;
let firstConnectedAt = null;
let lastError = '';

async function probe(base) {
  const url = `${base.replace(/\/$/, '')}/api/health-check`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(1000),
      cache: 'no-store',
    });
    if (firstConnectedAt === null) firstConnectedAt = Date.now();
    if (!res.ok) {
      lastError = `HTTP ${res.status}`;
      return null;
    }
    const body = await res.json();
    if (body?.status === 'ok' && body?.runtime === 'ready') {
      return { base, body };
    }
    lastError = JSON.stringify(body);
    return null;
  } catch (error) {
    lastError = error instanceof Error ? error.message : String(error);
    return null;
  }
}

async function main() {
  process.stderr.write(`waiting ready: ${urls.join(' ')}\n`);
  while (Date.now() - started < timeoutMs) {
    attempts++;
    for (const base of urls) {
      const ready = await probe(base);
      if (ready) {
        const now = Date.now();
        process.stdout.write(JSON.stringify({
          ready: true,
          url: ready.base,
          elapsedMs: now - started,
          firstConnectedMs: firstConnectedAt === null ? null : firstConnectedAt - started,
          attempts,
          health: ready.body,
        }) + '\n');
        return;
      }
    }
    if (attempts % 50 === 0) {
      process.stderr.write(`still waiting ${Math.round((Date.now() - started) / 1000)}s: ${lastError}\n`);
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  process.stdout.write(JSON.stringify({
    ready: false,
    elapsedMs: Date.now() - started,
    attempts,
    error: lastError,
  }) + '\n');
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
