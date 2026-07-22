import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

describe('PWA assets', () => {
  it('links the manifest and app-owned icons from the HTML entry point', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8');

    expect(html).toContain('rel="manifest" href="%BASE_URL%manifest.webmanifest"');
    expect(html).toContain('rel="icon" type="image/svg+xml" href="%BASE_URL%icons/icon.svg"');
    expect(html).toContain('rel="apple-touch-icon" href="%BASE_URL%icons/icon-192.png"');
    expect(html).not.toContain('/vite.svg');
  });

  it('defines an installable German manifest for the GitHub Pages scope', () => {
    const manifest = JSON.parse(
      readFileSync(join(root, 'public', 'manifest.webmanifest'), 'utf8')
    ) as {
      name: string;
      short_name: string;
      lang: string;
      start_url: string;
      scope: string;
      display: string;
      icons: Array<{ src: string; sizes: string; purpose: string }>;
    };

    expect(manifest).toMatchObject({
      name: 'Judo Lernen',
      short_name: 'Judo',
      lang: 'de',
      start_url: '/judo-learning/',
      scope: '/judo-learning/',
      display: 'standalone',
    });
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: '/judo-learning/icons/icon.svg', sizes: 'any' }),
        expect.objectContaining({ src: '/judo-learning/icons/icon-192.png', sizes: '192x192' }),
        expect.objectContaining({ src: '/judo-learning/icons/icon-512.png', sizes: '512x512' }),
        expect.objectContaining({
          src: '/judo-learning/icons/maskable-512.png',
          sizes: '512x512',
          purpose: 'maskable',
        }),
      ])
    );
  });

  it('caches the app shell and falls back to the cached index for offline navigation', () => {
    const serviceWorker = readFileSync(join(root, 'public', 'sw.js'), 'utf8');

    expect(serviceWorker).toContain("const BASE_PATH = '/judo-learning/'");
    expect(serviceWorker).toContain('APP_SHELL_URLS');
    expect(serviceWorker).toContain('`${BASE_PATH}manifest.webmanifest`');
    expect(serviceWorker).toContain('`${BASE_PATH}icons/icon-192.png`');
    expect(serviceWorker).toContain('`${BASE_PATH}icons/icon-512.png`');
    expect(serviceWorker).toContain('`${BASE_PATH}icons/maskable-512.png`');
    expect(serviceWorker).toContain("request.mode === 'navigate'");
    expect(serviceWorker).toContain('cache.match(INDEX_URL)');
  });
});
