/**
 * BILIMTEST PRO — 500 VIRTUAL FOYDALANUVCHI UCHUN K6 LOAD TEST SKRIPTI
 *
 * MUHIM ESLATMA:
 * Google AI Studio Build preview konteyneri ichida 500 ta virtual foydalanuvchi
 * (concurrent TCP connection) bilan haqiqiy tashqi load-testni ishga tushirish
 * cheklangan. Haqiqiy 500-user load testni tashqi load-testing muhitida
 * (masalan, lokal terminalda yoki k6 Cloud'da) quyidagi buyruq orqali ishga tushiring:
 *
 *   k6 run -e BASE_URL=https://sizning-saytingiz.run.app load-tests/k6-500-users.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const dbErrors = new Counter('database_errors');
const submissionErrors = new Counter('submission_errors');
const completedAttempts = new Counter('completed_attempts');
const submitLatency = new Trend('submit_latency_ms');

export const options = {
  scenarios: {
    concurrent_500_students: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 150 }, // Dastlabki 150 o'quvchi kirishi
        { duration: '30s', target: 500 }, // 500 ta o'quvchi bir vaqtda test ishlashi
        { duration: '40s', target: 500 }, // 500 ta foydalanuvchi faol javob belgilashi va topshirishi
        { duration: '15s', target: 0 },   // Bosqichma-bosqich yakunlash
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'], // Xatoliklar 2% dan kam bo'lishi shart
    http_req_duration: ['p(95)<800', 'p(99)<1500'], // P95 < 800ms, P99 < 1500ms
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TEST_ID = __ENV.TEST_ID || 'test-eng-1';

export default function () {
  const vuId = __VU;
  const paddedPhone = String(1000000 + (vuId % 9000000)).padStart(7, '0');
  const phone = `+998 90 ${paddedPhone.slice(0, 3)} ${paddedPhone.slice(3, 5)} ${paddedPhone.slice(5, 7)}`;

  // 1. O'quvchi tizimga kirishi (Virtual user login)
  const loginRes = http.post(
    `${BASE_URL}/api/auth/load-test-login`,
    JSON.stringify({
      first_name: `Student_${vuId}`,
      last_name: `Virtual`,
      phone,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const loginOk = check(loginRes, {
    'login status is 200': (r) => r.status === 200,
  });

  if (!loginOk) {
    dbErrors.add(1);
    return;
  }

  const { token } = loginRes.json();
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  sleep(0.3);

  // 2. Testni ochish va urinishni (Attempt) boshlash
  const startRes = http.post(
    `${BASE_URL}/api/tests/${TEST_ID}/start`,
    JSON.stringify({}),
    { headers: authHeaders }
  );

  const startOk = check(startRes, {
    'attempt started 200': (r) => r.status === 200,
  });

  if (!startOk) {
    dbErrors.add(1);
    return;
  }

  const startData = startRes.json();
  const attemptId = startData.attempt.id;
  const questions = startData.questions || [];

  // 3. Savollarga javob belgilash va oraliq sinxronizatsiya (Offline/Sync simulation)
  const selectedAnswers = {};
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (q.answers && q.answers.length > 0) {
      const randomAns = q.answers[i % q.answers.length];
      selectedAnswers[q.id] = randomAns.id;
    }
  }

  sleep(0.5);

  const syncRes = http.post(
    `${BASE_URL}/api/attempts/${attemptId}/sync`,
    JSON.stringify({
      answers: selectedAnswers,
      tab_switch_count: vuId % 3 === 0 ? 1 : 0,
    }),
    { headers: authHeaders }
  );

  check(syncRes, {
    'sync status 200': (r) => r.status === 200,
  });

  sleep(0.4);

  // 4. Testni yakunlash (Authoritative Server-Side Scoring)
  const submitStart = Date.now();
  const submitRes = http.post(
    `${BASE_URL}/api/attempts/${attemptId}/submit`,
    JSON.stringify({
      answers: selectedAnswers,
      tab_switch_count: vuId % 3 === 0 ? 1 : 0,
    }),
    { headers: authHeaders }
  );
  submitLatency.add(Date.now() - submitStart);

  const submitOk = check(submitRes, {
    'submit status 200': (r) => r.status === 200,
  });

  if (submitOk) {
    completedAttempts.add(1);
  } else {
    submissionErrors.add(1);
  }
}
