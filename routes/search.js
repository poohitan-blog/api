const express = require('express');
const models = require('../models');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

function searchText(model, query, additionalFields = {}) {
  const findParams = Object.assign({
    $text: { $search: `${query}` },
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
  const { query, page = 1, limit = Number.MAX_SAFE_INTEGER } = req.query;

  if (query === null || query === undefined) {
    res.json({ docs: [], meta: { currentPage: 1, totalPages: 0 } });

    return;
  }

  const filter = {};

  if (!req.isAuthenticated) {
    filter.private = false;
  }

  Promise.all([
    searchText(models.post, query, filter),
    searchText(models.page, query, filter),
    searchText(models.trashPost, query),
  ])
    .then(([posts, pages, trashPosts]) => {
      const postsSearchResults = posts.map(post => Object.assign({ searchResultType: 'post' }, post.serialize()));
      const pagesSearchResults = pages.map(page => Object.assign({ searchResultType: 'page' }, page.serialize())); // eslint-disable-line
      const trashPostsSearchResults = trashPosts.map(trashPost => Object.assign({ searchResultType: 'trashPost' }, trashPost.serialize()));
      const searchResults = [
        ...postsSearchResults,
        ...pagesSearchResults,
        ...trashPostsSearchResults,
      ]
        .sort((left, right) => {
          if (left.score > right.score) {
            return -1;
          }

          if (left.score < right.score) {
            return 1;
          }

          return 0;
        });

      const totalPages = Math.ceil(searchResults.length / limit);

      res.json({
        docs: searchResults.slice((page - 1) * limit, page * limit),
        meta: { currentPage: page, totalPages },
      });
    })
    .catch(next);
});

router.use(errorHandler);

module.exports = router;
