export const GOATCOUNTER_ENDPOINT = 'https://chriskujawa.goatcounter.com/count';
export const GOATCOUNTER_SCRIPT_SRC = 'https://gc.zgo.at/count.js';

export interface AnalyticsDocument {
  createElement: Document['createElement'];
  head: Pick<HTMLHeadElement, 'append'>;
  querySelector: Document['querySelector'];
}

interface RegisterAnalyticsOptions {
  documentRef?: AnalyticsDocument;
  isProduction?: boolean;
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
