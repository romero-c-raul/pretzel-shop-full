# Observability Stack

  ## Environment Variables

  ### Backend — running on host
  OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
  OTEL_SERVICE_NAME=pretzel-backend

  ### Backend — running in Docker (joined to pretzel_observability network)
  OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
  OTEL_SERVICE_NAME=pretzel-backend

  ### Integration tests — running on host
  OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
  OTEL_SERVICE_NAME=pretzel-integration-tests

  ### k6 — always runs on host, uses gRPC
  K6_OTLP_GRPC_EXPORTER_ENDPOINT=localhost:4317
  K6_OTLP_GRPC_EXPORTER_INSECURE=true
  Note: INSECURE=true is local dev only — never use in production.

  ## Starting the stack
  docker compose -f observability/docker-compose.yml up -d
  Start observability stack first so the pretzel_observability network exists before the app stack tries to join it.