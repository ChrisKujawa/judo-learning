import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  type AnalyticsDocument,
  GOATCOUNTER_ENDPOINT,
  GOATCOUNTER_SCRIPT_SRC,
  registerAnalytics,
  trackAnalyticsEvent,
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

describe('trackAnalyticsEvent', () => {
  it('does not send GoatCounter events outside production builds', () => {
    const count = vi.fn();

    trackAnalyticsEvent(
      { path: 'quiz-started-kyu8', title: 'Quiz started: 8. Kyu' },
      { isProduction: false, windowRef: { goatcounter: { count } } }
    );

    expect(count).not.toHaveBeenCalled();
  });

  it('does not fail when GoatCounter has not loaded yet', () => {
    expect(() =>
      trackAnalyticsEvent(
        { path: 'quiz-started-kyu8', title: 'Quiz started: 8. Kyu' },
        { isProduction: true, windowRef: {} }
      )
    ).not.toThrow();
  });

  it('sends custom GoatCounter events in production builds', () => {
    const count = vi.fn();

    trackAnalyticsEvent(
      { path: 'quiz-finished-kyu8', title: 'Quiz finished: 8. Kyu (100%)' },
      { isProduction: true, windowRef: { goatcounter: { count } } }
    );

    expect(count).toHaveBeenCalledWith({
      path: 'quiz-finished-kyu8',
      title: 'Quiz finished: 8. Kyu (100%)',
      event: true,
    });
  });
});
