const Logger = require('logger');
const connectToDB = require('../../../utils/connect-to-db');
const models = require('../../../models');

const VIEWS_FROM_GOOGLE_ANALYTICS = {
  'middle-js-interview-questions': 2521,
  'bye-univer': 5022,
  'back-to-lpml': 2558,
  'cyprus-for-tramps': 652,
  'orbita-holodnyi-yar': 718,
  'cake-in-face': 290,
  'deterministic-chaos': 1058,
  'new-bike-tutto': 264,
  'lviv-kyiv-by-bike': 252,
  'around-lviv-airport': 234,
  'ukulele-piezo-pickup': 228,
  'autumn-dzharylhach': 840,
  'berlin-dresden-and-so-on': 617,
  'math-parser-c-sharp': 948,
  'vinnytsia-avto-moto-velo-foto-tele-radio-museum': 1549,
  'read-2018': 143,
  'fucking-designers': 141,
  'koran-quotes': 525,
  'read-2017': 123,
  'alleycat-lucas-brunelle': 306,
  'huuuuge-update': 94,
  'new-year-with-homeless': 442,
  'time-treats': 308,
  'tickets-collection': 572,
  'code-for-food': 434,
  'hrechka-diet': 449,
  'thoughts-on-bydlokod': 290,
  'yellow-singlespeed': 336,
  'read-2014': 393,
  'brevet-200-2015': 349,
  'read-2016': 242,
  'three-days-no-water': 240,
  'hello-world': 143,
  'read-2015': 386,
  'disqus-comments-count': 322,
  'first-long-ride': 192,
  'javascript-onbeforeunload': 144,
  'sotka-2014': 331,
  'bicycle-vs-public-transport': 433,
  'sweets-for-pedestrians': 896,
  'custom-mosquito-build': 192,
  'validator-restoration': 245,
  'thoughts-on-discrimination': 123,
  'drum-stuff': 46,
  'drum-stuff-2': 30,
  'diy-furniture': 9893,
};

connectToDB()
  .then(() => models.post.find())
  .then((posts) => Promise.all(posts.map((post) => models.post.findOneAndUpdate({
    path: post.path,
  }, {
    views: VIEWS_FROM_GOOGLE_ANALYTICS[post.path] || 0,
  }))))
  .then(() => Logger.success('Successfully migrated'))
  .catch((error) => Logger.error(error))
  .then(() => process.exit());
