const SANTO_DO_DIA_API_URL =
  'https://missaemteresina.com.br/api/santo-do-dia/';

const REQUEST_TIMEOUT = 15000;

/*
 * Cache simples em memória.
 *
 * A chave "hoje" guarda a consulta sem data.
 * As demais chaves usam o formato AAAA-MM-DD.
 */
const santoCache = new Map();

export class SantoDoDiaApiError extends Error {
  constructor(message, options = {}) {
    super(message);

    this.name = 'SantoDoDiaApiError';
    this.status = options.status;
    this.code = options.code;
    this.data = options.data;
  }
}

/**
 * Verifica se a data está no formato AAAA-MM-DD
 * e se ela realmente existe no calendário.
 */
function validateDateString(dateString) {
  if (!dateString) {
    return;
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!datePattern.test(dateString)) {
    throw new SantoDoDiaApiError(
      'A data deve estar no formato AAAA-MM-DD.',
      {
        code: 'invalid_date_format',
      }
    );
  }

  const [year, month, day] = dateString
    .split('-')
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  const isValidDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  if (!isValidDate) {
    throw new SantoDoDiaApiError(
      'A data informada não é válida.',
      {
        code: 'invalid_date',
      }
    );
  }
}

/**
 * Monta a URL conforme o tipo de consulta.
 *
 * Hoje:
 * /api/santo-do-dia/
 *
 * Data específica:
 * /api/santo-do-dia/2026-07-22/
 */
function buildSantoDoDiaUrl(dateString) {
  if (!dateString) {
    return SANTO_DO_DIA_API_URL;
  }

  validateDateString(dateString);

  return `${SANTO_DO_DIA_API_URL}${encodeURIComponent(
    dateString
  )}/`;
}

function normalizeText(value) {
  return typeof value === 'string'
    ? value.trim()
    : '';
}

/**
 * Aceita tanto uma resposta direta:
 *
 * {
 *   "titulo": "...",
 *   "nome": "..."
 * }
 *
 * quanto uma resposta envelopada:
 *
 * {
 *   "sucesso": true,
 *   "santo": {
 *     "titulo": "...",
 *     "nome": "..."
 *   }
 * }
 */
function extractSaintData(responseData) {
  if (
    responseData?.santo &&
    typeof responseData.santo === 'object'
  ) {
    return responseData.santo;
  }

  return responseData;
}

/**
 * Valida e normaliza o JSON retornado pelo Django.
 */
function normalizeSaintData(responseData) {
  const data = extractSaintData(responseData);

  if (!data || typeof data !== 'object') {
    throw new SantoDoDiaApiError(
      'A API retornou uma resposta inválida.',
      {
        code: 'invalid_response',
        data: responseData,
      }
    );
  }

  const saint = {
    titulo: normalizeText(data.titulo),
    nome: normalizeText(data.nome),
    data: normalizeText(data.data),

    imagem_url:
      typeof data.imagem_url === 'string' &&
      data.imagem_url.trim()
        ? data.imagem_url.trim()
        : null,

    imagem_alt:
      normalizeText(data.imagem_alt) ||
      normalizeText(data.nome) ||
      'Imagem do Santo do Dia',

    conteudo_html: normalizeText(
      data.conteudo_html
    ),

    fonte_url: normalizeText(
      data.fonte_url
    ),
  };

  if (!saint.titulo) {
    throw new SantoDoDiaApiError(
      'A resposta da API não possui o título do Santo do Dia.',
      {
        code: 'missing_title',
        data: responseData,
      }
    );
  }

  if (!saint.nome) {
    throw new SantoDoDiaApiError(
      'A resposta da API não possui o nome do santo.',
      {
        code: 'missing_name',
        data: responseData,
      }
    );
  }

  if (!saint.conteudo_html) {
    throw new SantoDoDiaApiError(
      'A resposta da API não possui o conteúdo do Santo do Dia.',
      {
        code: 'missing_content',
        data: responseData,
      }
    );
  }

  return saint;
}

function normalizeErrorMessages(value) {
  if (Array.isArray(value)) {
    return value
      .map(normalizeErrorMessages)
      .filter(Boolean)
      .join(' ');
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (
    value &&
    typeof value === 'object'
  ) {
    return Object.values(value)
      .map(normalizeErrorMessages)
      .filter(Boolean)
      .join(' ');
  }

  return '';
}

/**
 * Extrai mensagens retornadas pelo Django REST Framework.
 */
function getApiErrorMessage(data, status) {
  if (status === 404) {
    return (
      normalizeErrorMessages(
        data?.mensagem ||
        data?.detail ||
        data?.erro
      ) ||
      'Santo do Dia não encontrado para a data selecionada.'
    );
  }

  if (status === 400) {
    return (
      normalizeErrorMessages(data) ||
      'A data informada não é válida.'
    );
  }

  if (status === 502) {
    return (
      normalizeErrorMessages(
        data?.mensagem ||
        data?.detail
      ) ||
      'A fonte do Santo do Dia apresentou uma resposta inesperada.'
    );
  }

  if (status === 503) {
    return (
      normalizeErrorMessages(
        data?.mensagem ||
        data?.detail
      ) ||
      'O Santo do Dia está temporariamente indisponível.'
    );
  }

  return (
    normalizeErrorMessages(
      data?.mensagem ||
      data?.detail ||
      data?.erro ||
      data
    ) ||
    'Não foi possível carregar o Santo do Dia.'
  );
}

/**
 * Busca o Santo do Dia.
 *
 * Sem data:
 * buscarSantoDoDia()
 *
 * Com data:
 * buscarSantoDoDia('2026-07-22')
 */
export async function buscarSantoDoDia(
  dateString = null,
  {
    ignoreCache = false,
    signal,
  } = {}
) {
  validateDateString(dateString);

  const cacheKey = dateString || 'hoje';

  if (
    !ignoreCache &&
    santoCache.has(cacheKey)
  ) {
    return santoCache.get(cacheKey);
  }

  const controller = new AbortController();

  /*
   * Caso a tela envie um signal externo,
   * o cancelamento também interrompe este fetch.
   */
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
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const response = await fetch(
      buildSantoDoDiaUrl(dateString),
      {
        method: 'GET',

        headers: {
          Accept: 'application/json',
        },

        signal: controller.signal,
      }
    );

    let responseData = null;

    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }

    if (!response.ok) {
      throw new SantoDoDiaApiError(
        getApiErrorMessage(
          responseData,
          response.status
        ),
        {
          status: response.status,
          code:
            responseData?.codigo ||
            'request_failed',
          data: responseData,
        }
      );
    }

    const saint = normalizeSaintData(
      responseData
    );

    santoCache.set(
      cacheKey,
      saint
    );

    return saint;
  } catch (error) {
    if (
      error instanceof SantoDoDiaApiError
    ) {
      throw error;
    }

    if (error?.name === 'AbortError') {
      /*
       * Quando existe um signal externo cancelado,
       * normalmente a tela trocou de data ou foi fechada.
       */
      if (signal?.aborted) {
        throw error;
      }

      throw new SantoDoDiaApiError(
        'O servidor demorou muito para responder. Tente novamente.',
        {
          code: 'request_timeout',
        }
      );
    }

    if (error instanceof TypeError) {
      throw new SantoDoDiaApiError(
        'Não foi possível conectar ao servidor. Verifique sua internet.',
        {
          code: 'network_error',
        }
      );
    }

    throw new SantoDoDiaApiError(
      error?.message ||
      'Ocorreu um erro inesperado ao carregar o Santo do Dia.',
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

/**
 * Atalho explícito para consultar o santo de hoje.
 */
export function buscarSantoDeHoje(options = {}) {
  return buscarSantoDoDia(
    null,
    options
  );
}

/**
 * Atalho explícito para consultar uma data.
 */
export function buscarSantoPorData(
  dateString,
  options = {}
) {
  return buscarSantoDoDia(
    dateString,
    options
  );
}

/**
 * Limpa uma data específica ou todo o cache.
 */
export function limparCacheSantoDoDia(
  dateString = null
) {
  if (dateString) {
    santoCache.delete(dateString);
    return;
  }

  santoCache.clear();
}