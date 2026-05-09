const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-http');
const {
  OTLPMetricExporter,
} = require('@opentelemetry/exporter-metrics-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');

const otlpBase = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';

const traceExporter = new OTLPTraceExporter({
  url: `${otlpBase}/v1/traces`,
});

const metricsExporter = new OTLPMetricExporter({
  url: `${otlpBase}/v1/metrics`,
});

const metricReader = new PeriodicExportingMetricReader({
  exporter: metricsExporter,
  exportIntervalMillis: 15000, // Export metrics every 15 seconds
});

const sdk = new opentelemetry.NodeSDK({
  serviceName: process.env.OTEL_SERVICE_NAME || 'pretzel-shop',
  traceExporter: traceExporter,
  metricReader: metricReader,
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing and Metrics terminated'))
    .catch((error) => console.log('Error terminating tracing and metrics', error))
    .finally(() => process.exit(0));
});