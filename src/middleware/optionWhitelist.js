const { badRequest } = require('../utils/optionParser');
const { removeAcceptedFiles } = require('./uploadMiddleware');

// Every controller picks its options out of req.body by name, so a key that
// nearly matched ("pageRange" instead of split's "pagesRange") read as "option
// absent" and the tool performed its no-option behaviour: /split-pdf answered
// 200 with a ZIP of every page instead of the 2 pages that were asked for.
// Each route declares the option keys it really reads, and anything else is a
// 400 before a controller runs. multer has already written the upload to disk at
// this point and no controller will run, so the rejected file is deleted here.
const rejectUnknownOptions = (allowedKeys = []) => {
  return (req, res, next) => {
    const unknown = Object.keys(req.body || {}).filter((key) => !allowedKeys.includes(key));
    if (unknown.length === 0) return next();

    removeAcceptedFiles(req);
    const listed = unknown.map((key) => `"${key}"`).join(', ');
    const accepts =
      allowedKeys.length > 0 ? `This tool accepts: ${allowedKeys.join(', ')}.` : 'This tool takes no options.';
    next(badRequest(`I don't recognize ${listed} as an option for this tool, so nothing was changed. ${accepts}`));
  };
};

module.exports = { rejectUnknownOptions };
