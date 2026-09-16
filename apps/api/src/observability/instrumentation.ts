import { SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchSpanProcessor, NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const headers = process.env.OTEL_EXPORTER_OTLP_HEADERS;
const release = process.env.COMMIT_SHA;
const environment = process.env.DEPLOYMENT_ENVIRONMENT ?? process.env.NODE_ENV;

function sanitizePath(target: string): string {
  const [path = ''] = target.split('?', 1);
  const sanitizedPath = path
    .split('/')
    .map((segment) => {
      if (
        /^\d+$/.test(segment) ||
        /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(segment) ||
        segment.includes('@')
      ) {
        return ':redacted';
      }
      return segment;
    })
    .join('/');

  return sanitizedPath;
}

function redactSensitiveText(value: string): string {
  return value
    .replace(/\bBearer\s+[^\s]+/gi, 'Bearer [REDACTED]')
    .replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, '[REDACTED_EMAIL]')
    .replace(
      /\b(authorization|cookie|password|token|access[_-]?token|api[_-]?key)\s*[=:]\s*[^\s,;]+/gi,
      '$1=[REDACTED]',
    )
    .replace(/\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s]+/gi, '[REDACTED_DSN]');
}

let telemetryEnabled = false;
let telemetryProvider: NodeTracerProvider | undefined;

if (endpoint && headers && release && environment) {
  const provider = new NodeTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'platform-api',
      [ATTR_SERVICE_VERSION]: release,
      [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: environment,
      'deployment.environment': environment,
    }),
    spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())],
  });

  try {
    provider.register();
    telemetryProvider = provider;
    telemetryEnabled = true;
    process.once('beforeExit', () => void shutdownTelemetry());
  } catch {
    // Ошибка инициализации telemetry не должна мешать запуску API.
  }
}

type ExceptionTelemetryContext = {
  requestId: string | null;
  method: string;
  path: string;
  statusCode: number;
};

/** Отправляет только минимальный обезличенный error span для необработанной HTTP-ошибки. */
export function recordExceptionTelemetry(
  exception: unknown,
  context: ExceptionTelemetryContext,
): boolean {
  if (!telemetryEnabled || context.path.startsWith('/health/')) {
    return false;
  }

  const error = exception instanceof Error ? exception : new Error(String(exception));
  const span = trace.getTracer('platform-api-errors').startSpan('request.exception', {
    kind: SpanKind.SERVER,
    attributes: {
      'http.request.method': context.method,
      'http.response.status_code': context.statusCode,
      'url.path': sanitizePath(context.path),
      ...(context.requestId ? { 'request.id': context.requestId } : {}),
    },
  });

  span.recordException({
    name: error.name,
    message: redactSensitiveText(error.message),
    stack: error.stack ? redactSensitiveText(error.stack) : undefined,
  });
  span.setStatus({ code: SpanStatusCode.ERROR });
  span.end();
  return true;
}

/** Завершает exporter и дожидается отправки накопленных spans. */
async function shutdownTelemetry(): Promise<void> {
  const provider = telemetryProvider;
  telemetryProvider = undefined;
  telemetryEnabled = false;

  if (provider) {
    await provider.shutdown();
  }
}
