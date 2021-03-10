const nodeSass = require('node-sass');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const util = require('util');

const render = util.promisify(nodeSass.render);

module.exports = async function renderSass(sass) {
  if (!sass) {
    return '';
  }

  try {
    const { css } = await render({ data: sass });
    const { css: optimizedCss } = await postcss([autoprefixer, cssnano])
      .process(css, { from: undefined });

    return optimizedCss;
  } catch (error) {
    return '';
  }
};
