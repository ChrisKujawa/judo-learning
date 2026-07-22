import { afterEach, describe, expect, it, vi } from 'vitest';
import { createServiceWorkerRegistrationConfig, registerServiceWorker } from './pwa';

describe('PWA service worker registration', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('builds service worker paths for the GitHub Pages base path', () => {
    expect(createServiceWorkerRegistrationConfig('/judo-learning/')).toEqual({
      scriptUrl: '/judo-learning/sw.js',
      scope: '/judo-learning/',
    });
  });

  it('registers the service worker after the page has loaded', () => {
    const register = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {
      serviceWorker: { register },
    });

    registerServiceWorker({ baseUrl: '/judo-learning/', enabled: true });
    window.dispatchEvent(new Event('load'));

    expect(register).toHaveBeenCalledWith('/judo-learning/sw.js', {
      scope: '/judo-learning/',
    });
  });

  it('does not register in disabled environments', () => {
    const register = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {
      serviceWorker: { register },
    });

    registerServiceWorker({ baseUrl: '/judo-learning/', enabled: false });
    window.dispatchEvent(new Event('load'));

    expect(register).not.toHaveBeenCalled();
  });
});
