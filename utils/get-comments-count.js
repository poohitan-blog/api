const got = require('got');
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

  const response = await got(url, { searchParams: query }).json();

  const commentsCountByPost = response.response.reduce((result, thread) => thread.identifiers
    .reduce((accumulator, identifier) => ({
      [identifier]: thread.posts,
      ...accumulator,
    }), result), previousData);

  if (response.cursor?.hasNext) {
    return fetchDataFromDisqus(commentsCountByPost, response.cursor.next);
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

async function getCommentsCountForSinglePost(postSlug) {
  const cacheHasExpired = Date.now() - cacheUpdatedAt > CACHE_EXPIRES_IN;

  if (cacheHasExpired) {
    cache = await updateCache();
  }

  return cache[postSlug];
}

async function getCommentsCountForManyPosts(postSlugs) {
  return postSlugs.reduce((promise, postSlug) => promise.then(async (commentsCounts) => {
    const commentsCount = await getCommentsCountForSinglePost(postSlug);

    return {
      [postSlug]: commentsCount,
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
    return Logger.error(error);
  }
}

module.exports = getCommentsCount;
