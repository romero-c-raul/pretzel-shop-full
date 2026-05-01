// Run (Docker — use --add-host on Linux; not needed on Mac/Windows Docker Desktop):
//   docker run --rm -i --add-host=host.docker.internal:host-gateway \
//     -e BASE_URL=http://host.docker.internal:3001 \
//     grafana/k6:1.7.1 run - <perf/k6/smoke.js
// Run (local k6):
//   k6 run perf/k6/smoke.js

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    // Smoke: allow up to 1% errors and p(95) under 500ms
    http_req_failed: ['rate<0.01'],
    'http_req_duration{name:health}': ['p(95)<100'],
    'http_req_duration{name:products}': ['p(95)<500'],
  },
};

export default function () {
  const healthRes = http.get(`${BASE_URL}/health`, {
    tags: { name: 'health' },
  });
  check(healthRes, {
    'health status 200': (r) => r.status === 200,
  });

  const productsRes = http.get(`${BASE_URL}/api/products`, {
    tags: { name: 'products' },
  });
  check(productsRes, {
    'products status 200': (r) => r.status === 200,
  });

  sleep(1);
}
