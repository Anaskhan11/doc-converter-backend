const { badRequest } = require('./optionParser');

// split/extract/delete/reorder each re-answered "which pages did the user ask
// for?" and disagreed: "abc" and "9999" were dropped, Arabic-Indic digits meant
// every page, "1,1,1" became one page, "5-2" 500ed. One strict parser for all
// four -- every token must be a page number or an in-bounds, forward range, and
// nothing is dropped, deduped or reinterpreted silently. ASCII digits only on
// purpose: parseInt/Number accept Arabic-Indic digits and "1e1", which is how a
// garbage range turned into "all pages".
const TOKEN = /^(\d+)(?:-(\d+))?$/;

const allIndices = (totalPages) => Array.from({ length: totalPages }, (_, i) => i);

const parsePageList = (raw, totalPages, { name, onEmpty = 'reject', emptyMessage, hint = '' } = {}) => {
  const fail = (message) => {
    throw badRequest(hint ? `${message} ${hint}` : message);
  };

  const text = String(raw === undefined || raw === null ? '' : raw).trim();

  if (text === '') {
    if (onEmpty === 'all') return allIndices(totalPages);
    fail(emptyMessage || `Enter ${name}, for example 2-5 or 1, 3.`);
  }

  const indices = [];
  const seen = new Set();

  text.split(',').forEach((part) => {
    const token = part.trim();
    const match = TOKEN.exec(token);
    if (!match) fail(`I could not read "${token}" in ${name}. Use page numbers or ranges like 2-5.`);

    const start = Number(match[1]);
    const end = match[2] === undefined ? start : Number(match[2]);
    if (end < start) fail(`"${token}" in ${name} runs backwards. Write ranges low to high, for example ${end}-${start}.`);
    if (start < 1 || end > totalPages) {
      const bounds = `valid pages are 1-${totalPages}`;
      if (match[2] === undefined) fail(`Page ${start} does not exist in ${name} (${bounds}).`);
      else fail(`Pages ${start}-${end} run past the end in ${name} (${bounds}).`);
    }

    for (let page = start; page <= end; page++) {
      if (seen.has(page)) fail(`Page ${page} is listed more than once in ${name}.`);
      seen.add(page);
      indices.push(page - 1);
    }
  });

  return indices;
};

module.exports = { parsePageList };
