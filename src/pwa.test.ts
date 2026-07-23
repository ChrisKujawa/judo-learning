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
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
    vi.stubGlobal('navigator', {
      serviceWorker: { register },
    });

    registerServiceWorker({ baseUrl: '/judo-learning/', enabled: true });
    expect(register).not.toHaveBeenCalled();

    window.dispatchEvent(new Event('load'));

    expect(register).toHaveBeenCalledWith('/judo-learning/sw.js', {
      scope: '/judo-learning/',
    });
  });

  it('registers the service worker immediately when the page has already loaded', () => {
    const register = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete');
    vi.stubGlobal('navigator', {
      serviceWorker: { register },
    });

    registerServiceWorker({ baseUrl: '/judo-learning/', enabled: true });

    expect(register).toHaveBeenCalledWith('/judo-learning/sw.js', {
      scope: '/judo-learning/',
    });
  });

  it('does not register in disabled environments', () => {
    const register = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete');
    vi.stubGlobal('navigator', {
      serviceWorker: { register },
    });

    registerServiceWorker({ baseUrl: '/judo-learning/', enabled: false });
    window.dispatchEvent(new Event('load'));

    expect(register).not.toHaveBeenCalled();
  });
});
