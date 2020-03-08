const express = require('express');
const HttpStatus = require('http-status-codes');

const models = require('../models');
const generateQueryFilter = require('../helpers/generate-query-filter');
const Guard = require('../middlewares/guard');
const errorHandler = require('../middlewares/error-handler');
const getCommentsCount = require('../utils/get-comments-count');
const renderSass = require('../utils/render-sass');

const router = express.Router();

router.get('/', Guard.protectPrivateData, async (req, res, next) => {
  try {
    const filter = generateQueryFilter({ model: models.page, query: req.query });

    if (req.query.tag) {
      filter.tags = req.query.tag;
    }

    const { page = 1, limit = Number.MAX_SAFE_INTEGER } = req.query;
    const { docs, pages } = await models.post
      .paginate(filter, {
        page,
        limit,
        sort: '-publishedAt',
        select: '-customStyles -customStylesProcessed',
        populate: {
          path: 'translations',
          select: 'title lang -_id',
          match: req.isAuthenticated ? null : { private: false },
        },
      });

    const commentsCounts = await getCommentsCount(docs.map(doc => doc.path));

    res.json({
      docs: docs.map(doc => ({
        ...doc.serialize(),
        body: req.query.cut ? doc.getCutBody() : doc.body,
        commentsCount: commentsCounts[doc.path],
      })),
      meta: {
        currentPage: page,
        totalPages: pages,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:post_path', async (req, res, next) => {
  try {
    const post = req.isAuthenticated
      ? await models.post
        .findOne({
          path: req.params.post_path,
        })
        .populate('translations')
      : await models.post
        .findOneAndUpdate({
          path: req.params.post_path,
        }, {
          $inc: {
            views: 1,
          },
        }, {
          new: true,
        })
        .select('-customStyles')
        .populate('translations');

    const commentsCount = await getCommentsCount(req.params.post_path);
    const postWithCommentsCount = {
      ...post.serialize(),
      commentsCount,
    };

    if (!post) {
      return next({ status: HttpStatus.NOT_FOUND });
    }

    return res.json(postWithCommentsCount);
  } catch (error) {
    return next(error);
  }
});

router.get('/:post_path/similar', async (req, res, next) => {
  try {
    const post = await models.post.findOne({ path: req.params.post_path });

    if (!post) {
      return next({ status: HttpStatus.NOT_FOUND });
    }

    const { tags } = post;

    const similarPosts = await models.post
      .find({
        path: {
          $ne: post.path,
        },
        tags: {
          $elemMatch: {
            $in: tags,
          },
        },
        private: false,
      })
      .sort('-views')
      .select('title body path views publishedAt tags');

    const mainImageUrlRegex = /src=\\?"(\S+?)\\?"/;

    const postsWithImages = similarPosts.map((similarPost) => {
      const { _id, body, ...rest } = similarPost.toObject();
      const matches = body.match(mainImageUrlRegex);

      const image = matches ? matches[1] : null;

      return {
        id: _id,
        image,
        ...rest,
      };
    });

    return res.json(postsWithImages);
  } catch (error) {
    return next(error);
  }
});

router.post('/', Guard.protectRoute, async (req, res, next) => {
  try {
    const { body } = req;

    const post = await models.post.create({
      ...body,
      customStylesProcessed: await renderSass(body.customStyles),
    });

    res.json(post.serialize());
  } catch (error) {
    next(error);
  }
});

router.patch('/:post_path', Guard.protectRoute, async (req, res, next) => {
  try {
    const { body, params } = req;

    const post = await models.post.findOneAndUpdate({
      path: params.post_path,
    }, {
      ...body,
      customStylesProcessed: await renderSass(body.customStyles),
    }, {
      new: true,
    });

    res.json(post.serialize());
  } catch (error) {
    next(error);
  }
});

router.delete('/:post_path', Guard.protectRoute, async (req, res, next) => {
  try {
    await models.post.delete({ path: req.params.post_path });

    res.json({});
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
