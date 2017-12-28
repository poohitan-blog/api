const express = require('express');
const models = require('../models');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

function searchText(model, query, additionalFields = {}) {
  const findParams = Object.assign({
    $text: { $search: query },
    deleted: false,
  }, additionalFields);

  return model
    .find(findParams, {
      score: { $meta: 'textScore' },
    })
    .sort({
      score: { $meta: 'textScore' },
    });
}

router.get('/', (req, res, next) => {
  const { query } = req.query;

  Promise.all([
    searchText(models.post, query, { private: false }),
    searchText(models.page, query, { private: false }),
    searchText(models.trashPost, query),
  ])
    .then(([posts, pages, trashPosts]) => {
      const postsSearchResults = posts.map(post => Object.assign({ searchResultType: 'post' }, post.serialize()));
      const pagesSearchResults = pages.map(page => Object.assign({ searchResultType: 'page' }, page.serialize()));
      const trashPostsSearchResults = trashPosts.map(trashPost => Object.assign({ searchResultType: 'trash-post' }, trashPost.serialize()));
      const searchResults = [
        ...postsSearchResults,
        ...pagesSearchResults,
        ...trashPostsSearchResults,
      ].sort((left, right) => {
        if (left.score > right.score) {
          return -1;
        }

        if (left.score < right.score) {
          return 1;
        }

        return 0;
      });

      res.json(searchResults);
    })
    .catch(next);
});

router.use(errorHandler);

module.exports = router;
