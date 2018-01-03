const fs = require('fs');
const util = require('util');
const path = require('path');

const readDir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

module.exports = async function (dirPath) {
  const filenames = await readDir(dirPath);

  return Promise.all(filenames.map(async (filename) => {
    const filepath = path.join(dirPath, filename);
    const fileContent = await readFile(filepath, { encoding: 'utf8' });

    return { name: filename, path: filepath, content: fileContent };
  }));
};
