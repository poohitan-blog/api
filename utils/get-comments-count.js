const util = require('util');
const request = util.promisify(require('request'));
const Logger = require('logger');
const { current } = require('../config');

let cache = {};
let cacheUpdatedAt = 0;
let cacheUpdateInProgress = false;
let cacheUpdatingPromise = Promise.resolve(cache);
const CACHE_EXPIRES_IN = 60000; // one minute

async function fetchDataFromDisqus(previousData = {}, cursor) {
  const { APIKey, shortname } = current.disqus;
  const url = 'https://disqus.com/api/3.0/forums/listThreads.json';
  const query = {
    api_key: APIKey,
    forum: shortname,
    cursor,
  };

  const { body } = await request({ url, qs: query, json: true });

  const commentsCountByPost = body.response.reduce((result, thread) => thread.identifiers
    .reduce((accumulator, identifier) => ({
      [identifier]: thread.posts,
      ...accumulator,
    }), result), previousData);

  if (body.cursor && body.cursor.hasNext) {
    return fetchDataFromDisqus(commentsCountByPost, body.cursor.next);
  }

  return commentsCountByPost;
}

async function updateCache() {
  if (cacheUpdateInProgress) {
    return cacheUpdatingPromise;
  }

  cacheUpdateInProgress = true;

  cacheUpdatingPromise = fetchDataFromDisqus()
    .then((data) => {
      cacheUpdatedAt = Date.now();
      cacheUpdateInProgress = false;

      return data;
    })
    .catch((error) => {
      Logger.error(error);

      return cache; // fallback to old cache; maybe will succeed to update on next attempt
    });

  return cacheUpdatingPromise;
}

async function getCommentsCountForSinglePost(postPath) {
  const cacheHasExpired = Date.now() - cacheUpdatedAt > CACHE_EXPIRES_IN;

  if (cacheHasExpired) {
    cache = await updateCache();
  }

  return cache[postPath];
}

async function getCommentsCountForManyPosts(postPaths) {
  return postPaths.reduce((promise, postPath) =>
    promise.then(async (commentsCounts) => {
      const commentsCount = await getCommentsCountForSinglePost(postPath);

      return {
        [postPath]: commentsCount,
        ...commentsCounts,
      };
    }), Promise.resolve({}));
}

async function getCommentsCount(param) {
  try {
    if (Array.isArray(param)) {
      return getCommentsCountForManyPosts(param);
    }

    return getCommentsCountForSinglePost(param);
  } catch (error) {
    return console.error(error);
  }
}

module.exports = getCommentsCount;
