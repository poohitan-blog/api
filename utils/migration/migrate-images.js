const got = require('got');
const FormData = require('form-data');
const Logger = require('logger');
const config = require('../../config').current;

function getImagesFromHTML(html) {
  const regex = /<img(?:[^<>]+?)src="(https?:\/\/[^"]+?)"[^<>]*?\/?>/gi;
  const images = [];
  let match = regex.exec(html);

  while (match) {
    images.push(match[1]);

    match = regex.exec(html);
  }

  return images;
}

function uploadImage(stream) {
  return new Promise((resolve, reject) => {
    stream.on('error', (error) => reject(error));

    const form = new FormData();

    form.append('images', stream);

    got.post(`${config.apiURL}/images`, {
      body: form,
      headers: {
        Connection: 'keep-alive',
      },
    }, (error, response, body) => {
      if (error) {
        return reject(error);
      }

      const [link] = JSON.parse(body);

      Logger.log('Uploaded image', link);

      return resolve(link);
    });
  });
}

function downloadImage(url) {
  Logger.log('Downloading', url);

  return got(url, { timeout: 10000 }).buffer();
}

module.exports = (html) => {
  const imageLinks = getImagesFromHTML(html);
  let htmlCopy = html;

  return imageLinks.reduce(
    (promiseChain, link) => promiseChain.then(() => uploadImage(downloadImage(link)))
      .then((newLink) => {
        Logger.log('Replacing old link:', link, 'with new link:', newLink);

        htmlCopy = htmlCopy.replace(new RegExp(link, 'gi'), newLink);
      })
      .catch(() => Logger.error(`Failed to reupload ${link}`)),
    Promise.resolve(),
  )
    .then(() => htmlCopy);
};
