const express = require('express');
const HttpStatus = require('http-status-codes');

const models = require('../models');
const generateQueryFilter = require('../helpers/generate-query-filter');
const Guard = require('../middlewares/guard');
const errorHandler = require('../middlewares/error-handler');
const getCommentsCount = require('../utils/get-comments-count');
const renderSass = require('../utils/render-sass');

const router = express.Router();

router.get('/', Guard.excludeHiddenData, async (req, res, next) => {
  try {
    const filter = generateQueryFilter({ model: models.post, query: req.query });

    if (req.query.tag) {
      filter.tags = req.query.tag;
    }

    const { page = 1, limit = Number.MAX_SAFE_INTEGER } = req.query;
    const { docs, pages } = await models.post
      .paginate(filter, {
        page,
        limit,
        sort: '-publishedAt',
        select: 'title body slug tags views hidden publishedAt',
        populate: {
          path: 'translations',
          select: 'title lang',
          match: req.isAuthenticated ? null : { hidden: false },
        },
      });

    const commentsCounts = await getCommentsCount(docs.map(doc => doc.slug));

    res.json({
      docs: docs.map(doc => ({
        ...doc.serialize(),
        body: req.query.cut ? doc.getCutBody() : doc.body,
        commentsCount: commentsCounts[doc.slug],
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

router.get('/:slug', async (req, res, next) => {
  try {
    const post = req.isAuthenticated
      ? await models.post
        .findOne({
          slug: req.params.slug,
        })
        .populate('translations')
      : await models.post
        .findOneAndUpdate({
          slug: req.params.slug,
        }, {
          $inc: {
            views: 1,
          },
        }, {
          new: true,
        })
        .select('title description body slug tags customStylesProcessed imagesWidth publishedAt')
        .populate({
          path: 'translations',
          select: 'title description body lang',
          match: { hidden: false },
        });

    if (!post) {
      return next({ status: HttpStatus.NOT_FOUND });
    }

    const commentsCount = await getCommentsCount(req.params.slug);
    const postWithCommentsCount = {
      ...post.serialize(),
      commentsCount,
    };

    return res.json(postWithCommentsCount);
  } catch (error) {
    return next(error);
  }
});

router.get('/:slug/similar', async (req, res, next) => {
  try {
    const post = await models.post.findOne({ slug: req.params.slug });

    if (!post) {
      return next({ status: HttpStatus.NOT_FOUND });
    }

    const { tags } = post;

    const similarPosts = await models.post
      .find({
        slug: {
          $ne: post.slug,
        },
        tags: {
          $elemMatch: {
            $in: tags,
          },
        },
        hidden: false,
      })
      .sort('-views')
      .select('title description body slug publishedAt');

    const mainImageUrlRegex = /src=\\?"(\S+?)\\?"/;

    const postsWithImages = similarPosts.map((similarPost) => {
      const { _id, body, ...rest } = similarPost.toObject();
      const matches = body.match(mainImageUrlRegex);

      const image = matches ? matches[1] : null;

      return {
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

router.patch('/:slug', Guard.protectRoute, async (req, res, next) => {
  try {
    const { body, params } = req;

    const post = await models.post.findOneAndUpdate({
      slug: params.slug,
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

router.delete('/:slug', Guard.protectRoute, async (req, res, next) => {
  try {
    await models.post.delete({ slug: req.params.slug });

    res.json({});
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
