export const GOATCOUNTER_ENDPOINT = 'https://chriskujawa.goatcounter.com/count';
export const GOATCOUNTER_SCRIPT_SRC = 'https://gc.zgo.at/count.js';

interface GoatCounterEvent {
  event: true;
  path: string;
  title: string;
}

interface GoatCounter {
  count?: (event: GoatCounterEvent) => void;
}

declare global {
  interface Window {
    goatcounter?: GoatCounter;
  }
}

export interface AnalyticsDocument {
  createElement: Document['createElement'];
  head: Pick<HTMLHeadElement, 'append'>;
  querySelector: Document['querySelector'];
}

export interface AnalyticsWindow {
  goatcounter?: GoatCounter;
}

interface RegisterAnalyticsOptions {
  documentRef?: AnalyticsDocument;
  isProduction?: boolean;
}

interface TrackAnalyticsEventOptions {
  isProduction?: boolean;
  windowRef?: AnalyticsWindow;
}

export interface AnalyticsEvent {
  path: string;
  title: string;
}

export function registerAnalytics({
  documentRef = document,
  isProduction = import.meta.env.PROD,
}: RegisterAnalyticsOptions = {}) {
  if (!isProduction) {
    return;
  }

  const existingScript = documentRef.querySelector(
    `script[data-goatcounter="${GOATCOUNTER_ENDPOINT}"]`
  );

  if (existingScript) {
    return;
  }

  const script = documentRef.createElement('script');
  script.dataset.goatcounter = GOATCOUNTER_ENDPOINT;
  script.async = true;
  script.src = GOATCOUNTER_SCRIPT_SRC;

  documentRef.head.append(script);
}

export function trackAnalyticsEvent(
  { path, title }: AnalyticsEvent,
  {
    isProduction = import.meta.env.PROD,
    windowRef = window,
  }: TrackAnalyticsEventOptions = {}
) {
  if (!isProduction) {
    return;
  }

  windowRef.goatcounter?.count?.({
    path,
    title,
    event: true,
  });
}
