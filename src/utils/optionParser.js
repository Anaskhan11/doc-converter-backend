// A missing option and a legitimate zero are not the same thing, but every
// numeric form field here was read with `parseInt(x) || default` -- so angle 0,
// crop margin 0 and opacity 0 were silently replaced by 90 deg, 20 pt and 25 %.
// Values also reached pdf-lib unvalidated (angle 45 threw "must be a multiple
// of 90" as a 500, opacity 5 was written straight into the PDF). One parser for
// all three keeps the tools from drifting apart again: it applies the default
// only when the option is absent, and rejects anything else with a 400 the
// frontend already knows how to display.
const badRequest = (message) => {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
};

const parseNumericOption = (raw, { name, def, integer = false, multipleOf, min, max }) => {
  const text = String(raw).trim();
  if (raw === undefined || raw === null || text === '') return def;

  const value = Number(text);
  if (!Number.isFinite(value)) throw badRequest(`${name} must be a number (got "${text}").`);
  if (integer && !Number.isInteger(value)) throw badRequest(`${name} must be a whole number (got ${value}).`);
  if (multipleOf !== undefined && value % multipleOf !== 0) {
    throw badRequest(`${name} must be a multiple of ${multipleOf} (got ${value}).`);
  }
  if (min !== undefined && value < min) throw badRequest(`${name} cannot be below ${min} (got ${value}).`);
  if (max !== undefined && value > max) throw badRequest(`${name} cannot be above ${max} (got ${value}).`);
  return value;
};

/* Several converters build their output from a PDF's extracted text. When the
   document has no text layer there is nothing to convert, and the fallbacks used
   to write a plausible sentence ("No text extracted from PDF.", "Document content
   extracted from PDF.") into the .txt/.docx/.xlsx, so the user downloaded a
   well-formed file asserting something untrue about their document. One shared
   message, so it cannot drift between services. */
const NO_TEXT_LAYER =
  'No text layer was found in this PDF, so there is nothing to extract. It looks like a scanned document, and this server cannot run OCR on it.';

const noTextLayerError = () => badRequest(NO_TEXT_LAYER);

module.exports = { parseNumericOption, badRequest, noTextLayerError };
