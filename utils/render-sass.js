const nodeSass = require('node-sass');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const util = require('util');

const render = util.promisify(nodeSass.render);

module.exports = function renderSass(sass) {
  if (!sass) {
    return '';
  }

  return render({
    data: sass,
  })
    .then(result => result.css.toString())
    .then(css => postcss([autoprefixer, cssnano]).process(css))
    .then(result => result.css);
};
