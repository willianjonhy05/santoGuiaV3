const API_BASE_URL =
    'https://missaemteresina.com.br/api';

const REQUEST_TIMEOUT = 15000;

const cache = new Map();

export class ChurchApiError extends Error {
    constructor(message, options = {}) {
        super(message);

        this.name = 'ChurchApiError';
        this.status = options.status;
        this.code = options.code;
        this.data = options.data;
    }
}

function parseNumber(value) {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return null;
    }

    const parsed = Number(
        String(value).replace(',', '.')
    );

    return Number.isFinite(parsed)
        ? parsed
        : null;
}

function normalizeText(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return '';
    }

    return String(value).trim();
}

function stripHtml(value) {
    if (!value) {
        return '';
    }

    return String(value)
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&#8211;/gi, '–')
        .replace(/&#8212;/gi, '—')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function normalizeChurch(data) {
    if (!data || typeof data !== 'object') {
        return null;
    }

    const endereco = normalizeText(
        data.endereco
    );

    const bairro = normalizeText(
        data.bairro
    );

    const cidade = normalizeText(
        data.cidade
    );

    return {
        id: data.id,

        nome:
            normalizeText(data.nome) ||
            'Igreja sem nome',

        slug: normalizeText(data.slug),

        endereco,
        bairro,
        cidade,

        enderecoCompleto: [
            endereco,
            bairro,
            cidade,
        ]
            .filter(Boolean)
            .join(' · '),

        paroquia: Boolean(data.paroquia),
        capela: Boolean(data.capela),

        aberta_ao_publico:
            data.aberta_ao_publico ?? null,

        latitude: parseNumber(
            data.latitude
        ),

        longitude: parseNumber(
            data.longitude
        ),

        distancia_km: parseNumber(
            data.distancia_km
        ),

        imagem_url: normalizeText(
            data.imagem_url
        ),

        telefone: normalizeText(
            data.telefone
        ),

        email: normalizeText(
            data.email
        ),

        site: normalizeText(
            data.site
        ),

        facebook: normalizeText(
            data.facebook
        ),

        instagram: normalizeText(
            data.instagram
        ),

        instagram_url: normalizeText(
            data.instagram_url
        ),

        youtube: normalizeText(
            data.youtube
        ),

        maps_url: normalizeText(
            data.maps
        ),

        contato_whatsapp: normalizeText(
            data.contato_whatsapp
        ),

        whatsapp_url: normalizeText(
            data.whatsapp_url
        ),

        detalhe_url: normalizeText(
            data.detalhe_url
        ),

        sacerdotes:
            data.sacerdotes || null,

        clerigos: Array.isArray(
            data.clerigos
        )
            ? data.clerigos
            : [],

        raw: data,
    };
}


function normalizeCelebration(
  celebration
) {
  if (
    !celebration ||
    typeof celebration !== 'object'
  ) {
    return null;
  }

  return {
    id: celebration.id,

    nome:
      normalizeText(
        celebration.nome
      ) || 'Celebração',

    categoria: normalizeText(
      celebration.categoria
    ),

    categoriaDisplay:
      normalizeText(
        celebration
          .categoria_display
      ),

    recorrencia: normalizeText(
      celebration.recorrencia
    ),

    recorrenciaDisplay:
      normalizeText(
        celebration
          .recorrencia_display
      ),

    descricaoRecorrencia:
      normalizeText(
        celebration
          .descricao_recorrencia
      ),

    dia: normalizeText(
      celebration.dia
    ),

    diaDisplay: normalizeText(
      celebration.dia_display
    ),

    diaMes:
      celebration.dia_mes ?? null,

    semanaDoMes:
      celebration.semana_do_mes ??
      null,

    dataEspecifica:
      normalizeText(
        celebration.data_especifica
      ),

    proximaData:
      normalizeText(
        celebration.proxima_data
      ),

    proximaDataIso:
      normalizeText(
        celebration
          .proxima_data_iso
      ),

    horarioInicio:
      normalizeText(
        celebration.horario_inicio
      ),

    horarioFim:
      normalizeText(
        celebration.horario_fim
      ),

    descricao:
      normalizeText(
        celebration.descricao
      ),

    exigeAgendamento: Boolean(
      celebration.exige_agendamento
    ),

    igreja: celebration.igreja
      ? normalizeChurch(
          celebration.igreja
        )
      : null,

    raw: celebration,
  };
}



function extractCelebrations(data) {
    if (Array.isArray(data)) {
        return data;
    }

    const possibleLists = [
        data?.celebracoes,
        data?.resultados,
        data?.results,
        data?.horarios,
        data?.dados,
    ];

    return (
        possibleLists.find(Array.isArray) ||
        []
    );
}

function extractErrorMessage(
    data,
    status
) {
    const message =
        data?.erro ||
        data?.detail ||
        data?.mensagem ||
        data?.message;

    if (message) {
        if (typeof message === 'string') {
            return message;
        }

        return JSON.stringify(message);
    }

    if (status === 404) {
        return 'A igreja solicitada não foi encontrada.';
    }

    if (status >= 500) {
        return 'O servidor está temporariamente indisponível.';
    }

    return 'Não foi possível carregar as informações.';
}

async function requestJson(
    url,
    {
        signal,
    } = {}
) {
    const controller =
        new AbortController();

    let timedOut = false;

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
        timedOut = true;
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
            throw new ChurchApiError(
                extractErrorMessage(
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
            error instanceof ChurchApiError
        ) {
            throw error;
        }

        if (error?.name === 'AbortError') {
            if (signal?.aborted) {
                throw error;
            }

            if (timedOut) {
                throw new ChurchApiError(
                    'O servidor demorou muito para responder.',
                    {
                        code: 'request_timeout',
                    }
                );
            }

            throw error;
        }

        throw new ChurchApiError(
            'Não foi possível conectar ao servidor. Verifique sua internet.',
            {
                code: 'network_error',
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

export async function getNearbyChurches(
    {
        latitude,
        longitude,
        signal,
        ignoreCache = false,
    }
) {
    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {
        throw new ChurchApiError(
            'A localização do usuário é inválida.',
            {
                code: 'invalid_location',
            }
        );
    }

    const cacheKey =
        `nearby:${latitude.toFixed(3)}:` +
        longitude.toFixed(3);

    if (
        !ignoreCache &&
        cache.has(cacheKey)
    ) {
        return cache.get(cacheKey);
    }

    const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
    });

    const data = await requestJson(
        `${API_BASE_URL}/igrejas/proximas/?${params.toString()}`,
        {
            signal,
        }
    );

    if (!Array.isArray(data?.resultados)) {
        throw new ChurchApiError(
            'A API retornou uma lista de igrejas inválida.',
            {
                code: 'invalid_response',
                data,
            }
        );
    }

    const result = {
        total:
            data.total ??
            data.resultados.length,

        igrejas: data.resultados
            .map(normalizeChurch)
            .filter(Boolean),
    };

    cache.set(cacheKey, result);

    return result;
}


export async function getChurchBySlug(
  slug,
  {
    signal,
    ignoreCache = false,
  } = {}
) {
  if (!slug) {
    throw new ChurchApiError(
      'O slug da igreja não foi informado.',
      {
        code: 'missing_slug',
      }
    );
  }

  const cacheKey =
    `church:${slug}`;

  if (
    !ignoreCache &&
    cache.has(cacheKey)
  ) {
    return cache.get(cacheKey);
  }

  const data = await requestJson(
    `${API_BASE_URL}/igrejas/${encodeURIComponent(
      slug
    )}/`,
    {
      signal,
    }
  );

  const church =
    normalizeChurch(data);

  if (!church) {
    throw new ChurchApiError(
      'A API retornou dados inválidos da igreja.',
      {
        code: 'invalid_church',
        data,
      }
    );
  }

  cache.set(cacheKey, church);

  return church;
}



export async function getChurchCelebrations(
  slug,
  {
    signal,
    ignoreCache = false,
  } = {}
) {
  if (!slug) {
    throw new ChurchApiError(
      'O slug da igreja não foi informado.',
      {
        code: 'missing_slug',
      }
    );
  }

  const cacheKey =
    `celebrations:${slug}`;

  if (
    !ignoreCache &&
    cache.has(cacheKey)
  ) {
    return cache.get(cacheKey);
  }

  const data = await requestJson(
    `${API_BASE_URL}/igrejas/${encodeURIComponent(
      slug
    )}/celebracoes/`,
    {
      signal,
    }
  );

  if (!Array.isArray(data)) {
    throw new ChurchApiError(
      'A API retornou uma lista de celebrações inválida.',
      {
        code: 'invalid_celebrations',
        data,
      }
    );
  }

  const celebrations = data
    .map(normalizeCelebration)
    .filter(Boolean);

  cache.set(
    cacheKey,
    celebrations
  );

  return celebrations;
}


export function buildChurchMapUrl(
    church
) {
    if (church?.maps_url) {
        return church.maps_url;
    }

    if (
        !Number.isFinite(
            church?.latitude
        ) ||
        !Number.isFinite(
            church?.longitude
        )
    ) {
        return null;
    }

    const query = encodeURIComponent(
        `${church.latitude},${church.longitude}`
    );

    return (
        'https://www.google.com/maps/' +
        `search/?api=1&query=${query}`
    );
}


export async function getChurches({
  search = '',
  latitude,
  longitude,
  pageUrl = null,
  signal,
} = {}) {
  let url = pageUrl;

  if (!url) {
    const params = new URLSearchParams();

    const normalizedSearch =
      search.trim();

    if (normalizedSearch) {
      params.append(
        'search',
        normalizedSearch
      );
    }

    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      params.append(
        'latitude',
        String(latitude)
      );

      params.append(
        'longitude',
        String(longitude)
      );
    }

    const queryString =
      params.toString();

    url =
      `${API_BASE_URL}/igrejas/` +
      (queryString
        ? `?${queryString}`
        : '');
  }

  const data = await requestJson(url, {
    signal,
  });

  // Resposta paginada do Django REST Framework.
  if (
    data &&
    Array.isArray(data.results)
  ) {
    return {
      total:
        data.count ??
        data.results.length,

      next: data.next || null,

      previous:
        data.previous || null,

      igrejas: data.results
        .map(normalizeChurch)
        .filter(Boolean),
    };
  }

  // Resposta sem paginação.
  if (Array.isArray(data)) {
    return {
      total: data.length,
      next: null,
      previous: null,

      igrejas: data
        .map(normalizeChurch)
        .filter(Boolean),
    };
  }

  throw new ChurchApiError(
    'A API retornou uma lista de igrejas inválida.',
    {
      code: 'invalid_church_list',
      data,
    }
  );
}