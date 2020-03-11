const express = require('express');

const models = require('../models');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

function searchText(model, query, additionalFields = {}) {
  const findParams = {
    $text: { $search: `${query}` },
    deleted: false,
    ...additionalFields,
  };

  return model
    .find(findParams, {
      score: { $meta: 'textScore' },
    })
    .sort({
      score: { $meta: 'textScore' },
    });
}

router.get('/', async (req, res, next) => {
  const { query, page = 1, limit = Number.MAX_SAFE_INTEGER } = req.query;

  if (query === null || query === undefined) {
    res.json({ docs: [], meta: { currentPage: 1, totalPages: 0 } });

    return;
  }

  const filter = {};

  if (!req.isAuthenticated) {
    filter.hidden = false;
  }

  try {
    const [posts, pages, trashPosts] = await Promise.all([
      searchText(models.post, query, filter),
      searchText(models.page, query, filter),
      searchText(models.trashPost, query),
    ]);

    const postsSearchResults = posts.map(value => ({ searchResultType: 'post', ...value.serialize() }));
    const pagesSearchResults = pages.map(value => ({ searchResultType: 'page', ...value.serialize() }));
    const trashPostsSearchResults = trashPosts.map(value => ({ searchResultType: 'trashPost', ...value.serialize() }));

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
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
