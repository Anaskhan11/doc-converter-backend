const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const { ensureDirectoriesExist, sweepStaleFiles } = require('./utils/fileUtils');
const { apiRateLimiter } = require('./middleware/rateLimiter');
const { securityHeaders } = require('./middleware/securityHeaders');
const { errorHandler } = require('./middleware/errorHandler');
const conversionRoutes = require('./routes/conversionRoutes');

const app = express();

// Express advertises itself on every response by default, which tells a client which
// framework to fingerprint. The hand-rolled header middleware below sets the security
// headers but never touches this one, so it has to be switched off at the app level.
app.disable('x-powered-by');

// Throttling keys on req.ip. On a bare deployment that is the socket address, which
// is what we want; behind nginx/Cloudflare it would be the proxy's own address and
// every visitor would share one bucket. TRUST_PROXY therefore takes a hop count
// ("1", "2") or a comma-separated IP/CIDR list. A bare "true" is refused on purpose:
// trusting every X-Forwarded-For header would let any client pick its own rate-limit
// bucket, and express-rate-limit rejects that configuration anyway.
const parseTrustProxy = (raw) => {
  const value = String(raw || '').trim();
  if (value === '' || /^(false|off|none)$/i.test(value)) return false;
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^true$/i.test(value)) {
    console.warn('TRUST_PROXY=true is ignored: set a hop count or an IP/CIDR list instead.');
    return false;
  }
  return value.split(',').map((entry) => entry.trim()).filter(Boolean);
};

app.set('trust proxy', parseTrustProxy(env.trustProxy));

ensureDirectoriesExist(env.uploadDir, env.convertedDir);

const sweepStaleUploads = async () => {
  const removed =
    (await sweepStaleFiles(env.uploadDir)) + (await sweepStaleFiles(env.convertedDir));
  if (removed > 0) {
    console.log(`Swept ${removed} stale upload/conversion file(s)`);
  }
};

sweepStaleUploads();
setInterval(sweepStaleUploads, 10 * 60 * 1000).unref();

app.use(
  cors({
    origin: '*',
    // `credentials: true` alongside `origin: '*'` is rejected by every browser, and
    // this service has no cookies, sessions or auth to send, so the flag bought
    // nothing and broke any future credentialed call. Methods are pinned to the two
    // the client actually uses instead of reflecting whatever the request asked for.
    methods: 'GET,POST,OPTIONS',
    allowedHeaders: ['Content-Type'],
    exposedHeaders: ['Content-Disposition']
  })
);

app.use(securityHeaders);

// Express parses these with a 100 kB ceiling by default; it is written down here so
// the ceiling survives a future refactor. Uploads never take this path (multer's
// diskStorage streams them) and are bounded by MAX_FILE_SIZE_MB / fieldSize.
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.use('/api', apiRateLimiter);
app.use('/api', conversionRoutes);

// Without this, unknown paths fell through to Express's HTML 404 page, which the
// client cannot parse as the { success, message } envelope every other response uses.
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'This endpoint does not exist.' });
});

app.use(errorHandler);

const startServer = () => {
  app.listen(env.port,"0.0.0.0", () => {
    console.log(`DocConvert Backend running on port ${env.port}`);
  });
};

startServer();

module.exports = app;
