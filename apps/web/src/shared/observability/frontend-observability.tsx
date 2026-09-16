'use client';

import {
  getInternalFaroFromGlobalObject,
  getWebInstrumentations,
  initializeFaro,
  type ExceptionEvent,
  TransportItemType,
} from '@grafana/faro-web-sdk';
import { useEffect } from 'react';

import { loadWebObservabilityEnv } from '@/shared/config/env';

const APP_NAME = 'platform-web';

function stripUrlDetails(value: string): string {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return value.split(/[?#]/, 1)[0] ?? value;
  }
}

function redactSensitiveText(value: string): string {
  return value
    .replace(/\bBearer\s+[^\s]+/gi, 'Bearer [REDACTED]')
    .replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, '[REDACTED_EMAIL]')
    .replace(
      /([?&](?:access_token|api_key|authorization|cookie|password|token)=)[^&#\s]*/gi,
      '$1[REDACTED]',
    )
    .replace(/\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s]+/gi, '[REDACTED_DSN]');
}

export function FrontendObservability() {
  useEffect(() => {
    const config = loadWebObservabilityEnv({
      NEXT_PUBLIC_FARO_URL: process.env.NEXT_PUBLIC_FARO_URL,
      NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT: process.env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT,
      NEXT_PUBLIC_COMMIT_SHA: process.env.NEXT_PUBLIC_COMMIT_SHA,
    });

    if (!config || getInternalFaroFromGlobalObject()) {
      return;
    }

    try {
      initializeFaro({
        url: config.NEXT_PUBLIC_FARO_URL,
        app: {
          name: APP_NAME,
          version: config.NEXT_PUBLIC_COMMIT_SHA,
          release: config.NEXT_PUBLIC_COMMIT_SHA,
          gitHash: config.NEXT_PUBLIC_COMMIT_SHA,
          bundleId: config.NEXT_PUBLIC_COMMIT_SHA,
          environment: config.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT,
        },
        instrumentations: getWebInstrumentations(),
        sessionTracking: { enabled: true, persistent: false },
        beforeSend(item) {
          const meta = {
            ...item.meta,
            user: undefined,
            page: item.meta.page
              ? { ...item.meta.page, url: stripUrlDetails(item.meta.page.url ?? '') }
              : undefined,
          };

          if (item.type !== TransportItemType.EXCEPTION) {
            return { ...item, meta };
          }

          const exception = item.payload as ExceptionEvent;
          return {
            ...item,
            meta,
            payload: {
              ...exception,
              value: redactSensitiveText(exception.value),
              context: undefined,
              action: undefined,
              stacktrace: exception.stacktrace
                ? {
                    frames: exception.stacktrace.frames.map((frame) => ({
                      ...frame,
                      filename: stripUrlDetails(frame.filename),
                    })),
                  }
                : undefined,
            },
          };
        },
      });
    } catch {
      // Observability не должна влиять на доступность приложения.
    }
  }, []);

  return null;
}
