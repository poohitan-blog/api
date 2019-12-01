const express = require('express');
const models = require('../models');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const posts = await models.post.find()
      .select('tags');

    const tags = posts.reduce((result, post) => result.concat(post.tags), [])
      .filter((tag, index, array) => array.indexOf(tag) === index)
      .filter(tag => tag);

    res.json(tags);
  } catch (error) {
    next(error);
  }
});

router.get('/cloud', async (req, res, next) => {
  try {
    const posts = await models.post.find()
      .select('tags');

    const cloud = posts
      .reduce((result, post) => post.tags.reduce((innerResult, tag) => {
        if (!tag) {
          return innerResult;
        }

        const postsCount = innerResult[tag];

        if (postsCount) {
          return {
            ...innerResult,
            [tag]: postsCount + 1,
          };
        }

        return {
          ...innerResult,
          [tag]: 1,
        };
      }, result), {});

    res.json(cloud);
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
