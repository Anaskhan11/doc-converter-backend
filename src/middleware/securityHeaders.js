// The project cannot add `helmet` (dependencies are frozen), so the four headers
// that matter for this service are set by hand. Every response is either a JSON
// error envelope or a downloaded file attachment, so a document-src of 'none'
// costs nothing: nothing here is meant to be rendered as a page by a browser.
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
  next();
};

module.exports = { securityHeaders };
