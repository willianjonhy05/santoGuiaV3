const POSTS_API_URL =
  'https://arquidiocesedeteresina.org.br/wp-json/wp/v2/posts/';

const REQUEST_TIMEOUT = 15000;

const CACHE_DURATION = 5 * 60 * 1000;

const newsCache = new Map();

export class LatestNewsApiError extends Error {
  constructor(message, options = {}) {
    super(message);

    this.name = 'LatestNewsApiError';
    this.status = options.status;
    this.code = options.code;
    this.data = options.data;
  }
}

function getCachedValue(key) {
  const cached = newsCache.get(key);

  if (!cached) {
    return null;
  }

  if (Date.now() > cached.expiresAt) {
    newsCache.delete(key);
    return null;
  }

  return cached.value;
}

function setCachedValue(key, value) {
  newsCache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_DURATION,
  });
}

function decodeHtmlEntities(value) {
  if (!value) {
    return '';
  }

  const entities = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
    ndash: '–',
    mdash: '—',
    hellip: '…',
    lsquo: '‘',
    rsquo: '’',
    ldquo: '“',
    rdquo: '”',
  };

  return String(value)
    .replace(
      /&#(\d+);/g,
      (_, number) =>
        String.fromCodePoint(
          Number(number)
        )
    )
    .replace(
      /&#x([0-9a-f]+);/gi,
      (_, hexadecimal) =>
        String.fromCodePoint(
          parseInt(hexadecimal, 16)
        )
    )
    .replace(
      /&([a-z]+);/gi,
      (entity, name) =>
        Object.prototype.hasOwnProperty.call(
          entities,
          name.toLowerCase()
        )
          ? entities[name.toLowerCase()]
          : entity
    );
}

function stripHtml(value) {
  if (!value) {
    return '';
  }

  return decodeHtmlEntities(
    String(value)
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/p>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function sanitizeContentHtml(value) {
  if (!value) {
    return '';
  }

  return String(value)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(
      /<(script|style|iframe|object|embed|form)[^>]*>[\s\S]*?<\/\1>/gi,
      ''
    )
    .replace(
      /<(script|style|iframe|object|embed|form|input|button|link|meta)[^>]*\/?>/gi,
      ''
    )
    .trim();
}

function extractFirstContentImage(
  contentHtml
) {
  if (!contentHtml) {
    return null;
  }

  const match = contentHtml.match(
    /<img[^>]+src=["']([^"']+)["']/i
  );

  return match?.[1]
    ? decodeHtmlEntities(match[1])
    : null;
}

function extractFeaturedImage(post) {
  const featuredMedia =
    post?._embedded?.[
      'wp:featuredmedia'
    ]?.[0];

  const sizes =
    featuredMedia?.media_details?.sizes;

  return (
    sizes?.medium_large?.source_url ||
    sizes?.large?.source_url ||
    sizes?.medium?.source_url ||
    featuredMedia?.source_url ||
    post?.yoast_head_json?.og_image?.[0]
      ?.url ||
    extractFirstContentImage(
      post?.content?.rendered
    ) ||
    null
  );
}

function extractCategories(post) {
  const termGroups =
    post?._embedded?.['wp:term'];

  if (!Array.isArray(termGroups)) {
    return [];
  }

  return termGroups
    .flat()
    .filter(
      (term) =>
        term?.taxonomy === 'category'
    )
    .map((term) => ({
      id: term.id,
      name: decodeHtmlEntities(
        term.name
      ),
      slug: term.slug,
    }));
}

function normalizePost(post) {
  if (!post || typeof post !== 'object') {
    throw new LatestNewsApiError(
      'A API retornou uma notícia inválida.',
      {
        code: 'invalid_post',
        data: post,
      }
    );
  }

  const title = stripHtml(
    post?.title?.rendered
  );

  const excerpt = stripHtml(
    post?.excerpt?.rendered
  );

  const contentHtml =
    sanitizeContentHtml(
      post?.content?.rendered
    );

  const featuredMedia =
    post?._embedded?.[
      'wp:featuredmedia'
    ]?.[0];

  const author =
    post?._embedded?.author?.[0];

  return {
    id: post.id,
    slug: post.slug || '',

    title:
      title || 'Notícia sem título',

    excerpt,

    contentHtml,

    date: post.date || null,
    modified: post.modified || null,

    link: post.link || null,

    imageUrl:
      extractFeaturedImage(post),

    imageAlt:
      featuredMedia?.alt_text?.trim() ||
      title ||
      'Imagem da notícia',

    author:
      author?.name ||
      'Arquidiocese de Teresina',

    categories:
      extractCategories(post),
  };
}

function buildNewsListUrl(perPage) {
  const params = new URLSearchParams({
    per_page: String(perPage),
    orderby: 'date',
    order: 'desc',
    _embed: '1',
  });

  return `${POSTS_API_URL}?${params.toString()}`;
}

function buildNewsDetailsUrl(postId) {
  return `${POSTS_API_URL}${encodeURIComponent(postId)}/?_embed=1`;
}

function getErrorMessage(data, status) {
  const apiMessage =
    data?.message ||
    data?.mensagem ||
    data?.detail;

  if (apiMessage) {
    return stripHtml(apiMessage);
  }

  if (status === 404) {
    return 'A notícia solicitada não foi encontrada.';
  }

  if (status >= 500) {
    return 'O servidor de notícias está temporariamente indisponível.';
  }

  return 'Não foi possível carregar as notícias.';
}

async function requestJson(
  url,
  {
    signal,
  } = {}
) {
  const controller = new AbortController();

  let didTimeout = false;

  function handleExternalAbort() {
    controller.abort();
  }

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener(
        'abort',
        handleExternalAbort,
        {
          once: true,
        }
      );
    }
  }

  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'GET',

      headers: {
        Accept: 'application/json',
      },

      signal: controller.signal,
    });

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new LatestNewsApiError(
        getErrorMessage(
          data,
          response.status
        ),
        {
          status: response.status,
          code:
            data?.code ||
            'request_failed',
          data,
        }
      );
    }

    return data;
  } catch (error) {
    if (
      error instanceof
      LatestNewsApiError
    ) {
      throw error;
    }

    if (error?.name === 'AbortError') {
      if (signal?.aborted) {
        throw error;
      }

      if (didTimeout) {
        throw new LatestNewsApiError(
          'O servidor demorou muito para responder. Tente novamente.',
          {
            code: 'request_timeout',
          }
        );
      }

      throw error;
    }

    if (error instanceof TypeError) {
      throw new LatestNewsApiError(
        'Não foi possível conectar ao servidor. Verifique sua internet.',
        {
          code: 'network_error',
        }
      );
    }

    throw new LatestNewsApiError(
      error?.message ||
        'Ocorreu um erro inesperado ao carregar as notícias.',
      {
        code: 'unexpected_error',
      }
    );
  } finally {
    clearTimeout(timeoutId);

    if (signal) {
      signal.removeEventListener(
        'abort',
        handleExternalAbort
      );
    }
  }
}

async function fetchNewsList(
  perPage,
  {
    ignoreCache = false,
    signal,
  } = {}
) {
  const cacheKey = `list:${perPage}`;

  if (!ignoreCache) {
    const cached =
      getCachedValue(cacheKey);

    if (cached) {
      return cached;
    }
  }

  const response = await requestJson(
    buildNewsListUrl(perPage),
    {
      signal,
    }
  );

  if (!Array.isArray(response)) {
    throw new LatestNewsApiError(
      'A API retornou uma lista de notícias inválida.',
      {
        code: 'invalid_response',
        data: response,
      }
    );
  }

  const normalizedNews =
    response.map(normalizePost);

  setCachedValue(
    cacheKey,
    normalizedNews
  );

  normalizedNews.forEach((news) => {
    setCachedValue(
      `details:${news.id}`,
      news
    );
  });

  return normalizedNews;
}

/**
 * Carrega as quatro notícias usadas na Home.
 */
export function getLatestNews(
  options = {}
) {
  return fetchNewsList(4, options);
}

/**
 * Carrega as doze notícias da página geral.
 */
export function getNewsList(
  options = {}
) {
  return fetchNewsList(12, options);
}

/**
 * Carrega uma notícia individual pelo ID.
 */
export async function getNewsById(
  postId,
  {
    ignoreCache = false,
    signal,
  } = {}
) {
  if (!postId) {
    throw new LatestNewsApiError(
      'O identificador da notícia não foi informado.',
      {
        code: 'missing_post_id',
      }
    );
  }

  const cacheKey =
    `details:${postId}`;

  if (!ignoreCache) {
    const cached =
      getCachedValue(cacheKey);

    if (cached) {
      return cached;
    }
  }

  const response = await requestJson(
    buildNewsDetailsUrl(postId),
    {
      signal,
    }
  );

  const normalizedNews =
    normalizePost(response);

  setCachedValue(
    cacheKey,
    normalizedNews
  );

  return normalizedNews;
}

export function clearNewsCache() {
  newsCache.clear();
}