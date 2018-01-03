const { argv } = require('yargs'); // eslint-disable-line
const moment = require('moment');
const connectToDB = require('../../utils/connect-to-db');
const Logger = require('../../services/logger');
const slugifyText = require('../../helpers/slugify-text');
const models = require('../../models');

const readDir = require('../../utils/read-dir');

const { postsDir, tagsDir } = argv;

const regexes = {
  id: /\$post\['id'\]='((?:.|\s)*?)';/,
  title: /\$post\['title'\]='((?:.|\s)*?)';/,
  body: /\$post\['text'\]='((?:.|\s)*?)';/,
};

function preparePostBody(html) {
  return html.replace(/<br><br>/g, '</p><p>').replace(/<br>/g, '');
}

function makePostObject(filename, postFileContent, tagFiles) {
  const id = postFileContent.match(regexes.id)[1];
  const title = postFileContent.match(regexes.title)[1];
  const path = slugifyText(title); // eslint-disable-line
  const body = postFileContent.match(regexes.body)[1];
  const publishedAt = moment.unix(filename);
  const tagFile = tagFiles.find(file => file.name === id);
  const tags = tagFile ? tagFile.content.split(',').map(tag => tag.trim()) : [];

  return {
    title,
    body: preparePostBody(body),
    path,
    tags,
    publishedAt,
  };
}

connectToDB()
  .then(() => Promise.all([
    readDir(postsDir),
    readDir(tagsDir),
  ]))
  .then(([postFiles, tagFiles]) => {
    const objects = postFiles.map(({ name, content }) => makePostObject(name, content, tagFiles));

    return objects;
  })
  .then(posts => Promise.all(posts.map(post => models.post.create(post))))
  .then(() => Logger.success('Successfully migrated posts'))
  .catch(error => Logger.error(error))
  .then(() => process.exit());
