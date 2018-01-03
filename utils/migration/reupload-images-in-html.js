const request = require('request');
const Logger = require('../../services/logger');
const config = require('../../config').current;

function getImagesFromHTML(html) {
  const regex = /<img(?:.+?)src="(https?:\/\/.+?)".*?\/?>/gi;
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
    request.post({
      url: `${config.apiURL}/images`,
      formData: {
        images: stream,
      },
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

function downloadImage(link) {
  Logger.log('Downloading', link);

  return request({
    url: link,
    encoding: null,
    timeout: 10000,
  });
}

module.exports = (html) => {
  const imageLinks = getImagesFromHTML(html);
  let htmlCopy = html;

  return imageLinks.reduce((promiseChain, link) => promiseChain.then(() => uploadImage(downloadImage(link)))
    .then((newLink) => {
      Logger.log('Replacing old link:', link, 'with new link:', newLink);

      htmlCopy = htmlCopy.replace(new RegExp(link, 'g'), newLink);
    }), Promise.resolve())
    .then(() => htmlCopy);
};
