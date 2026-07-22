export interface ServiceWorkerRegistrationConfig {
  scriptUrl: string;
  scope: string;
}

interface RegisterServiceWorkerOptions {
  baseUrl?: string;
  enabled?: boolean;
}

export function createServiceWorkerRegistrationConfig(
  baseUrl = import.meta.env.BASE_URL
): ServiceWorkerRegistrationConfig {
  const scope = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  return {
    scriptUrl: `${scope}sw.js`,
    scope,
  };
}

export function registerServiceWorker({
  baseUrl = import.meta.env.BASE_URL,
  enabled = import.meta.env.PROD,
}: RegisterServiceWorkerOptions = {}) {
  if (!enabled) return;
  if (!('serviceWorker' in navigator)) return;

  const { scriptUrl, scope } = createServiceWorkerRegistrationConfig(baseUrl);

  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(scriptUrl, { scope }).catch((error: unknown) => {
      console.error('Service Worker konnte nicht registriert werden.', error);
    });
  }, { once: true });
}
