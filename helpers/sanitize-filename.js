const sanitizeFilename = require('sanitize-filename');

module.exports = filename => sanitizeFilename(filename).replace(/[&%@=:+,?; \\{}^`<>[\]#%"'~|]/g, '');
