import { afterEach, describe, expect, it } from 'vitest';
import {
  type AnalyticsDocument,
  GOATCOUNTER_ENDPOINT,
  GOATCOUNTER_SCRIPT_SRC,
  registerAnalytics,
} from './analytics';

function goatCounterScripts() {
  return Array.from(document.head.querySelectorAll('script[data-goatcounter]'));
}

function createAnalyticsDocument() {
  const scripts: HTMLScriptElement[] = [];
  const documentRef: AnalyticsDocument = {
    createElement: document.createElement.bind(document),
    head: {
      append: (...nodes: Node[]) => {
        scripts.push(...nodes.filter((node): node is HTMLScriptElement => node instanceof HTMLScriptElement));
      },
    },
    querySelector: (selector: string) => scripts.find((script) => script.matches(selector)) ?? null,
  };

  return { documentRef, scripts };
}

describe('registerAnalytics', () => {
  afterEach(() => {
    goatCounterScripts().forEach((script) => script.remove());
  });

  it('does not load GoatCounter outside production builds', () => {
    registerAnalytics({ isProduction: false });

    expect(goatCounterScripts()).toHaveLength(0);
  });

  it('loads the configured GoatCounter script in production builds', () => {
    const { documentRef, scripts } = createAnalyticsDocument();
    registerAnalytics({ documentRef, isProduction: true });

    const [script] = scripts;
    expect(script).toBeDefined();
    expect(script.dataset.goatcounter).toBe(GOATCOUNTER_ENDPOINT);
    expect(script.async).toBe(true);
    expect(script.src).toBe(GOATCOUNTER_SCRIPT_SRC);
  });

  it('does not append duplicate GoatCounter scripts', () => {
    const { documentRef, scripts } = createAnalyticsDocument();
    registerAnalytics({ documentRef, isProduction: true });
    registerAnalytics({ documentRef, isProduction: true });

    expect(scripts).toHaveLength(1);
  });
});
