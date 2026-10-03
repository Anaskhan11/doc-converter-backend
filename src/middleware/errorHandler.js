const GENERIC_FAILURE = 'Something went wrong while converting your document. Please try again.';

const errorHandler = (err, req, res, next) => {
  // An error only carries statusCode when our own code classified it, which also
  // means we wrote the sentence (400 "Rotation angle must be a multiple of 90",
  // 501 "Redaction is not available in this build"). Everything else arrived from
  // a library and describes internals instead of a next step: pdf.js's "Failed to
  // parse PDF document (line:0 col:0 offset=0)" leaks byte offsets, and it made
  // every input mistake look like a server fault.
  const classified = typeof err.statusCode === 'number';
  const declared = classified ? err.statusCode : err.status;
  const statusCode = Number.isInteger(declared) && declared >= 400 && declared <= 599 ? declared : 500;

  console.error(`[Error Handler] ${statusCode}:`, err.message);

  res.status(statusCode).json({
    success: false,
    message: classified ? err.message : GENERIC_FAILURE
  });
};

module.exports = {
  errorHandler
};
