const request = require('supertest');

// Mock User model so tests execute reliably without requiring an active external database
jest.mock('../models/User', () => {
  const mockUserInstance = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Dr. Test Worker',
    email: 'worker@phc-test.org',
    role: 'Community Health Worker',
    center: 'Primary Health Center Alpha',
    matchPassword: jest.fn().mockImplementation(async (pw) => pw === 'validPassword123')
  };

  return {
    findOne: jest.fn().mockImplementation(({ email }) => {
      const found = email === 'worker@phc-test.org' ? mockUserInstance : null;
      const query = Promise.resolve(found);
      query.select = jest.fn().mockResolvedValue(found);
      return query;
    }),
    create: jest.fn().mockImplementation(async (userData) => ({
      _id: '507f1f77bcf86cd799439012',
      name: userData.name,
      email: userData.email,
      role: userData.role || 'Community Health Worker',
      center: userData.center || 'Primary Health Center'
    })),
    findById: jest.fn().mockImplementation(() => {
      const query = Promise.resolve(mockUserInstance);
      query.select = jest.fn().mockResolvedValue(mockUserInstance);
      return query;
    })
  };
});

const { app } = require('../server');

describe('MediLog Edge - Automated Security & Rate Limiting Test Suite', () => {
  // Test Case 1 (Helmet Security Headers)
  describe('Test Case 1 (Helmet Security Headers)', () => {
    it('should verify x-content-type-options, x-frame-options, strict-transport-security, and x-dns-prefetch-control are set, and x-powered-by is removed', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);

      // x-content-type-options: nosniff
      expect(res.headers['x-content-type-options']).toBe('nosniff');

      // x-frame-options
      expect(res.headers['x-frame-options']).toBeDefined();
      expect(res.headers['x-frame-options'].toUpperCase()).toBe('SAMEORIGIN');

      // strict-transport-security (HSTS)
      expect(res.headers['strict-transport-security']).toBeDefined();
      expect(res.headers['strict-transport-security']).toContain('max-age');

      // x-dns-prefetch-control: off
      expect(res.headers['x-dns-prefetch-control']).toBe('off');

      // x-powered-by removed
      expect(res.headers['x-powered-by']).toBeUndefined();

      // referrer-policy
      expect(res.headers['referrer-policy']).toBeDefined();
      expect(res.headers['referrer-policy']).toBe('no-referrer');

      // cross-origin-resource-policy: cross-origin
      expect(res.headers['cross-origin-resource-policy']).toBe('cross-origin');
    });

    it('should include Helmet headers on authentication routes as well', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .set('X-Forwarded-For', '10.1.0.1')
        .send({ email: 'worker@phc-test.org', password: 'validPassword123' });

      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBeDefined();
      expect(res.headers['x-powered-by']).toBeUndefined();
    });
  });

  // Test Case 2 (Legitimate Login & Registration Work Normally)
  describe('Test Case 2 (Legitimate Login & Registration Work Normally)', () => {
    const legitimateIp = '10.2.0.1';

    it('should allow legitimate user registration within the rate limit (status !== 429)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('X-Forwarded-For', legitimateIp)
        .send({
          name: 'Nurse Fatima',
          email: 'fatima@phc-test.org',
          password: 'securePassword123',
          role: 'Community Health Worker',
          center: 'Rural Health Sub-Center'
        });

      expect(res.status).not.toBe(429);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('fatima@phc-test.org');
    });

    it('should return standard validation error (400) for missing fields without rate limit interference', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('X-Forwarded-For', legitimateIp)
        .send({ email: 'incomplete@phc-test.org' });

      expect(res.status).not.toBe(429);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Please provide name, email, and password.');
    });

    it('should allow legitimate user login with valid credentials within the rate limit (status !== 429)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .set('X-Forwarded-For', legitimateIp)
        .send({
          email: 'worker@phc-test.org',
          password: 'validPassword123'
        });

      expect(res.status).not.toBe(429);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should return standard authentication error (401) for incorrect password without rate limit interference', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .set('X-Forwarded-For', legitimateIp)
        .send({
          email: 'worker@phc-test.org',
          password: 'wrongPassword'
        });

      expect(res.status).not.toBe(429);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password.');
    });
  });

  // Test Case 3 (General API Requests Work Normally)
  describe('Test Case 3 (General API Requests Work Normally)', () => {
    it('should allow legitimate requests to general API routes (e.g. /api/health) without regressions', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('X-Forwarded-For', '10.3.0.1');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('MediLog Edge Core API');
      expect(res.body.timestamp).toBeDefined();
    });

    it('should return standard 404 response for undefined routes', async () => {
      const res = await request(app)
        .get('/api/non-existent-route')
        .set('X-Forwarded-For', '10.3.0.2');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });
  });

  // Test Case 4 (Repeated Auth Requests Exceeding Limit Are Rejected)
  describe('Test Case 4 (Repeated Auth Requests Exceeding Limit Are Rejected)', () => {
    const bruteForceIp = '10.4.0.1';
    const MAX_ALLOWED = 5;

    it(`should allow requests up to limit (${MAX_ALLOWED}) and reject the ${MAX_ALLOWED + 1}th request with HTTP 429`, async () => {
      // First 5 requests must be processed normally
      for (let i = 1; i <= MAX_ALLOWED; i++) {
        const res = await request(app)
          .post('/api/auth/login')
          .set('X-Forwarded-For', bruteForceIp)
          .send({
            email: 'worker@phc-test.org',
            password: `attempt_${i}`
          });

        expect(res.status).not.toBe(429);
      }

      // The 6th request (MAX_ALLOWED + 1) must be rejected with 429
      const excessRes = await request(app)
        .post('/api/auth/login')
        .set('X-Forwarded-For', bruteForceIp)
        .send({
          email: 'worker@phc-test.org',
          password: 'excess_attempt'
        });

      expect(excessRes.status).toBe(429);
    });

    it('should enforce rate limiting on registration endpoint when repeated attempts exceed limit', async () => {
      const registerSpamIp = '10.4.0.2';

      for (let i = 1; i <= MAX_ALLOWED; i++) {
        const res = await request(app)
          .post('/api/auth/register')
          .set('X-Forwarded-For', registerSpamIp)
          .send({ email: `spam_${i}@phc-test.org` });

        expect(res.status).not.toBe(429);
      }

      const excessRes = await request(app)
        .post('/api/auth/register')
        .set('X-Forwarded-For', registerSpamIp)
        .send({ email: 'excess_spam@phc-test.org' });

      expect(excessRes.status).toBe(429);
    });
  });

  // Test Case 5 (Clear Error Message & RateLimit Headers on 429)
  describe('Test Case 5 (Clear Error Message & RateLimit Headers on 429)', () => {
    const errorDetailIp = '10.5.0.1';
    const MAX_ALLOWED = 5;

    it('should return valid JSON with status 429, error, clear message, and standard RateLimit headers', async () => {
      for (let i = 0; i < MAX_ALLOWED; i++) {
        await request(app)
          .post('/api/auth/login')
          .set('X-Forwarded-For', errorDetailIp)
          .send({ email: 'worker@phc-test.org', password: 'bad' });
      }

      const res = await request(app)
        .post('/api/auth/login')
        .set('X-Forwarded-For', errorDetailIp)
        .send({ email: 'worker@phc-test.org', password: 'bad' });

      // HTTP Status 429 Too Many Requests
      expect(res.status).toBe(429);

      // JSON body format and clear error message
      expect(res.body).toBeDefined();
      expect(res.body.success).toBe(false);
      expect(res.body.status).toBe(429);
      expect(res.body.error).toBe('Too Many Requests');
      expect(typeof res.body.message).toBe('string');
      expect(res.body.message).toContain('Too many authentication attempts from this IP');
      expect(res.body.message).toContain('15 minutes');

      // Standard RateLimit headers
      const hasLimitHeader =
        res.headers['ratelimit-limit'] !== undefined ||
        res.headers['ratelimit-policy'] !== undefined;
      expect(hasLimitHeader).toBe(true);

      expect(res.headers['ratelimit-remaining']).toBeDefined();
      expect(Number(res.headers['ratelimit-remaining'])).toBe(0);
    });
  });

  // Test Case 6 (Rate Limit Window Reset / Isolation)
  describe('Test Case 6 (Rate Limit Window Reset / Isolation)', () => {
    it('should isolate rate limits per client IP so that blocking one IP does not affect another', async () => {
      const clientOne = '10.6.0.1';
      const clientTwo = '10.6.0.2';

      // Exhaust limit for Client One
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .set('X-Forwarded-For', clientOne)
          .send({ email: 'worker@phc-test.org', password: 'bad' });
      }

      // Client One is blocked
      const blockedRes = await request(app)
        .post('/api/auth/login')
        .set('X-Forwarded-For', clientOne)
        .send({ email: 'worker@phc-test.org', password: 'bad' });
      expect(blockedRes.status).toBe(429);

      // Client Two remains completely unaffected and can authenticate normally
      const unblockedRes = await request(app)
        .post('/api/auth/login')
        .set('X-Forwarded-For', clientTwo)
        .send({ email: 'worker@phc-test.org', password: 'validPassword123' });
      expect(unblockedRes.status).toBe(200);
      expect(unblockedRes.body.success).toBe(true);
      expect(unblockedRes.body.token).toBeDefined();
    });
  });
});
