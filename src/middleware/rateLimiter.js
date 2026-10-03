const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const windowMinutes = Math.max(1, Math.round(env.rateLimitWindowMs / 60000));
const windowLabel = windowMinutes === 1 ? '1 minute' : `${windowMinutes} minutes`;

// One bucket for the whole API meant a single person using six multi-call tools hit
// the ceiling and was locked out of everything, including tools they never touched.
// Every request now spends two budgets: a small one per endpoint, which stops abuse
// of a single tool, and a large one across the API, which stops flooding.
// 7.5.1's CommonJS build exports only rateLimit/MemoryStore, so the helper that
// normalises IPv6 addresses is not reachable from here. req.ip already honours
// `trust proxy`, which is set deliberately in server.js.
const keyBase = (req) => String(req.ip);

const newWindowOptions = (max) => ({
  windowMs: env.rateLimitWindowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false
});

const globalRateLimiter = rateLimit({
  ...newWindowOptions(env.rateLimitGlobalMax),
  keyGenerator: (req) => `${keyBase(req)}|all`,
  standardHeaders: false,
  message: {
    success: false,
    message: `Too many requests from this address, please try again in ${windowLabel}.`
  }
});

const apiRateLimiter = rateLimit({
  ...newWindowOptions(env.rateLimitPerToolMax),
  keyGenerator: (req) => `${keyBase(req)}|${req.baseUrl}${req.path}`.replace(/\/+$/, ''),
  message: {
    success: false,
    message: `This tool has been used too many times in the last ${windowLabel}. Please wait a moment, or try a different tool.`
  }
});

module.exports = {
  apiRateLimiter: [globalRateLimiter, apiRateLimiter]
};
