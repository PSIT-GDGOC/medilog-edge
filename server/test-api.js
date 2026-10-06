/**
 * MediLog Edge - Core MVP Automated Backend & Sync API Test Suite
 */

const { connectDB, disconnectDB } = require('./services/db');
const { app } = require('./server');
const http = require('http');

let server;
let baseUrl;

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const contentType = response.headers.get('content-type');
  const data = contentType && contentType.includes('application/json') ? await response.json() : await response.text();

  return { status: response.status, data };
}

async function runTests() {
  console.log('====================================================');
  console.log('  MEDILOG EDGE - CORE MVP AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  try {
    await connectDB();

    const PORT = 5055;
    server = app.listen(PORT);
    baseUrl = `http://localhost:${PORT}/api`;
    console.log(`[Test Runner] Test server listening on port ${PORT}\n`);

    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
      if (condition) {
        console.log(`  ✓ PASS: ${message}`);
        passed++;
      } else {
        console.error(`  ✗ FAIL: ${message}`);
        failed++;
      }
    }

    // 1. Health Check
    console.log('--- 1. API Health & Configuration ---');
    const health = await request('/health');
    assert(health.status === 200, 'GET /api/health returns 200 OK');
    assert(health.data.status === 'ok', 'Health status is "ok"');

    // 2. Authentication Flow
    console.log('\n--- 2. Authentication & Authorization ---');
    const testEmail = `worker_${Date.now()}@phc-test.org`;
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Dr. Anita Sharma',
        email: testEmail,
        password: 'password123',
        role: 'Community Health Worker',
        center: 'Rural Sub-Center Alpha'
      }
    });
    assert(regRes.status === 201, 'POST /api/auth/register creates new account (201)');
    assert(!!regRes.data.token, 'Registration returns JWT auth token');

    const token = regRes.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // Duplicate registration prevention
    const dupRes = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Duplicate User',
        email: testEmail,
        password: 'password123'
      }
    });
    assert(dupRes.status === 400, 'Duplicate registration correctly rejected (400)');

    // Login test
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: 'password123'
      }
    });
    assert(loginRes.status === 200, 'POST /api/auth/login succeeds with valid credentials (200)');
    assert(!!loginRes.data.token, 'Login returns valid JWT token');

    // Invalid login
    const badLogin = await request('/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: 'wrongpassword'
      }
    });
    assert(badLogin.status === 401, 'POST /api/auth/login rejects incorrect password (401)');

    // Protected /me endpoint
    const meRes = await request('/auth/me', { headers: authHeaders });
    assert(meRes.status === 200, 'GET /api/auth/me returns authenticated user details');
    assert(meRes.data.user.email === testEmail, 'User profile matches registered email');

    // Unauthorized access rejection
    const unauthRes = await request('/patients');
    assert(unauthRes.status === 401, 'Unauthenticated GET /api/patients is rejected (401)');

    // 3. Patient Management Workflow
    console.log('\n--- 3. Patient Management CRUD Workflow ---');
    const createPatientRes = await request('/patients', {
      method: 'POST',
      headers: authHeaders,
      body: {
        name: 'Ramesh Patel',
        age: 48,
        gender: 'Male',
        phone: '+91 9876543210',
        address: 'House 14, Main Gram Panchayat',
        bloodGroup: 'B+',
        notes: 'Hypertension monitoring; blood pressure 138/88 mmHg on arrival.'
      }
    });
    assert(createPatientRes.status === 201, 'POST /api/patients creates new patient (201)');
    assert(createPatientRes.data.data.name === 'Ramesh Patel', 'Patient name matches');
    assert(createPatientRes.data.data.patientId.startsWith('MED-'), 'Patient ID format generated properly');

    const patient1 = createPatientRes.data.data;

    // List patients
    const listRes = await request('/patients', { headers: authHeaders });
    assert(listRes.status === 200, 'GET /api/patients returns patient list (200)');
    assert(listRes.data.count >= 1, `Patient list contains ${listRes.data.count} record(s)`);

    // Search patient
    const searchRes = await request('/patients?q=Ramesh', { headers: authHeaders });
    assert(searchRes.status === 200 && searchRes.data.data.length > 0, 'Search by patient name succeeds');

    // Filter by blood group
    const bgRes = await request('/patients?bloodGroup=B%2B', { headers: authHeaders });
    assert(bgRes.status === 200 && bgRes.data.data.some((p) => p.bloodGroup === 'B+'), 'Filter by blood group B+ succeeds');

    // Get single patient
    const getSingleRes = await request(`/patients/${patient1.patientId}`, { headers: authHeaders });
    assert(getSingleRes.status === 200, `GET /api/patients/${patient1.patientId} retrieves exact record`);

    // Update patient
    const updateRes = await request(`/patients/${patient1.patientId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: {
        notes: 'Prescribed Amlodipine 5mg OD. Schedule follow-up check in 14 days.'
      }
    });
    assert(updateRes.status === 200, 'PUT /api/patients/:id updates patient record (200)');
    assert(updateRes.data.data.notes.includes('Amlodipine'), 'Updated notes verified on server');

    // 4. Offline Sync & Deduplication Tests
    console.log('\n--- 4. Offline Synchronization & Deduplication Safety ---');
    const offlineTempId = `TEMP-LOCAL-${Date.now()}`;
    const offlinePatient = await request('/patients', {
      method: 'POST',
      headers: authHeaders,
      body: {
        name: 'Sunita Devi',
        age: 32,
        gender: 'Female',
        phone: '+91 9123456780',
        address: 'Basti Sector 2',
        bloodGroup: 'O+',
        notes: 'Prenatal checkup trimester 2',
        clientTempId: offlineTempId
      }
    });
    assert(offlinePatient.status === 201, 'Offline queued patient successfully created upon sync transmission');

    // Idempotency test: Re-syncing the same queued operation must not create duplicates
    const retrySync = await request('/patients', {
      method: 'POST',
      headers: authHeaders,
      body: {
        name: 'Sunita Devi',
        age: 32,
        gender: 'Female',
        clientTempId: offlineTempId
      }
    });
    assert(retrySync.status === 200, 'Re-sync with identical clientTempId returns existing record without duplicate (200)');
    assert(retrySync.data.data.patientId === offlinePatient.data.data.patientId, 'Deduplication matched original patientId');

    // Batch synchronization endpoint test
    const batchRes = await request('/patients/batch-sync', {
      method: 'POST',
      headers: authHeaders,
      body: {
        operations: [
          {
            id: 101,
            operation: 'CREATE',
            clientTempId: `BATCH-TEMP-${Date.now()}`,
            payload: {
              name: 'Karan Mehra',
              age: 21,
              gender: 'Male',
              bloodGroup: 'A+',
              notes: 'Acute seasonal allergic rhinitis'
            }
          },
          {
            id: 102,
            operation: 'UPDATE',
            patientId: patient1.patientId,
            payload: {
              address: 'Updated Residential Address Gram Panchayat'
            }
          }
        ]
      }
    });
    assert(batchRes.status === 200, 'POST /api/patients/batch-sync completes multi-operation payload');
    assert(batchRes.data.results.length === 2, 'Batch returned results for both operations');
    assert(batchRes.data.results.every((r) => r.status === 'success'), 'All batch operations processed with success status');

    // Delete patient test
    console.log('\n--- 5. Patient Record Deletion ---');
    const deleteRes = await request(`/patients/${patient1.patientId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    assert(deleteRes.status === 200, 'DELETE /api/patients/:id removes patient record');

    const verifyDel = await request(`/patients/${patient1.patientId}`, { headers: authHeaders });
    assert(verifyDel.status === 404, 'Deleted patient returns 404 Not Found');

    console.log('\n====================================================');
    console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    server.close();
    await disconnectDB();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('FATAL TEST ERROR:', err);
    if (server) server.close();
    await disconnectDB();
    process.exit(1);
  }
}

runTests();
