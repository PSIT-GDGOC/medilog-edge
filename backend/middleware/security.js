const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');

/**
 * Helmet Security Headers Middleware
 * Configures standard HTTP security headers including Content-Security-Policy,
 * X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security,
 * Referrer-Policy, X-DNS-Prefetch-Control, and disables X-Powered-By.
 * Configured with cross-origin resource policy to avoid CORS regressions.
 */
const helmetMiddleware = helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'", '*'],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
});

const securityHeadersMiddleware = (req, res, next) => {
  res.removeHeader('X-Powered-By');
  return helmetMiddleware(req, res, (err) => {
    res.removeHeader('X-Powered-By');
    next(err);
  });
};

/**
 * Custom 429 response handler for Authentication Rate Limiter
 */
const authRateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    status: 429,
    error: 'Too Many Requests',
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
  });
};

/**
 * Rate Limiter for Authentication Endpoints (e.g. login, register)
 * Protects against brute-force login attacks and credential stuffing.
 * Default: 5 requests per 15 minutes per IP.
 */
const authRateLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  limit: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: 429,
    error: 'Too Many Requests',
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
  },
  handler: authRateLimitHandler
});

/**
 * Custom 429 response handler for General API Rate Limiter
 */
const apiRateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    status: 429,
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  });
};

/**
 * Rate Limiter for General API Endpoints
 * Prevents denial of service and API abuse.
 * Default: 100 requests per 15 minutes per IP.
 */
const apiRateLimiter = rateLimit({
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  limit: parseInt(process.env.API_RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: 429,
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  handler: apiRateLimitHandler
});

const securityHeaders = securityHeadersMiddleware;

module.exports = {
  securityHeaders,
  securityHeadersMiddleware,
  authRateLimiter,
  apiRateLimiter
};

