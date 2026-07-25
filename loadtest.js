import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 }, // Ramp up to 20 virtual users
    { duration: '30s', target: 20 }, // Hold steady at 20 VUs
    { duration: '5s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // Require <1% error rate (essentially 0%)
  },
};

export default function () {
  const url = 'http://localhost:3000/users';
  
  // 1. Test GET /users
  const getRes = http.get(url);
  check(getRes, {
    'GET status is 200': (r) => r.status === 200,
  });

  // 2. Test POST /users
  const payload = JSON.stringify({
    first_name: 'Test',
    last_name: `User_${Math.floor(Math.random() * 100000)}`,
    email: `loadtest_${Date.now()}_${Math.random()}@example.com`,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const postRes = http.post(url, payload, params);
  check(postRes, {
    'POST status is 201': (r) => r.status === 201,
  });

  sleep(0.1); // Small delay between requests
}
