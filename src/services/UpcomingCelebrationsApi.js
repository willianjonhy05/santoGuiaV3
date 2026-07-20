const API_BASE_URL =
  'https://missaemteresina.com.br/api';


export class UpcomingCelebrationsApiError
  extends Error {
  constructor(
    message,
    {
      status = null,
      data = null,
      code = null,
    } = {}
  ) {
    super(message);

    this.name =
      'UpcomingCelebrationsApiError';

    this.status = status;
    this.data = data;
    this.code = code;
  }
}


function joinUrl(
  baseUrl,
  endpoint
) {
  const normalizedBase =
    String(baseUrl)
      .replace(/\/+$/, '');

  const normalizedEndpoint =
    String(endpoint)
      .replace(/^\/+/, '');

  return (
    `${normalizedBase}/` +
    normalizedEndpoint
  );
}


function getFirstValue(
  ...values
) {
  return values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ''
  );
}


function validatePage(value) {
  const parsedPage =
    Number(value ?? 1);

  if (
    !Number.isInteger(
      parsedPage
    ) ||
    parsedPage < 1
  ) {
    throw new UpcomingCelebrationsApiError(
      (
        'A página deve ser um número ' +
        'inteiro maior que zero.'
      ),
      {
        code: 'INVALID_PAGE',
      }
    );
  }

  return parsedPage;
}


function validateCoordinates(
  latitude,
  longitude,
  required = false
) {
  const hasLatitude =
    latitude !== undefined &&
    latitude !== null &&
    latitude !== '';

  const hasLongitude =
    longitude !== undefined &&
    longitude !== null &&
    longitude !== '';

  if (
    !hasLatitude &&
    !hasLongitude
  ) {
    if (required) {
      throw new UpcomingCelebrationsApiError(
        (
          'Latitude e longitude são obrigatórias ' +
          'para ordenar por proximidade.'
        ),
        {
          code:
            'LOCATION_REQUIRED',
        }
      );
    }

    return {
      latitude: null,
      longitude: null,
    };
  }

  if (
    !hasLatitude ||
    !hasLongitude
  ) {
    throw new UpcomingCelebrationsApiError(
      (
        'Informe latitude e longitude juntas.'
      ),
      {
        code:
          'INCOMPLETE_LOCATION',
      }
    );
  }

  const parsedLatitude =
    Number(latitude);

  const parsedLongitude =
    Number(longitude);

  if (
    !Number.isFinite(
      parsedLatitude
    ) ||
    !Number.isFinite(
      parsedLongitude
    )
  ) {
    throw new UpcomingCelebrationsApiError(
      (
        'Latitude e longitude devem ser numéricas.'
      ),
      {
        code:
          'INVALID_COORDINATES',
      }
    );
  }

  if (
    parsedLatitude < -90 ||
    parsedLatitude > 90
  ) {
    throw new UpcomingCelebrationsApiError(
      (
        'A latitude deve estar entre -90 e 90.'
      ),
      {
        code:
          'INVALID_LATITUDE',
      }
    );
  }

  if (
    parsedLongitude < -180 ||
    parsedLongitude > 180
  ) {
    throw new UpcomingCelebrationsApiError(
      (
        'A longitude deve estar entre -180 e 180.'
      ),
      {
        code:
          'INVALID_LONGITUDE',
      }
    );
  }

  return {
    latitude:
      parsedLatitude,

    longitude:
      parsedLongitude,
  };
}


function validateOrdering(
  ordering
) {
  const normalizedOrdering =
    String(
      ordering || 'inicio'
    )
      .trim()
      .toLowerCase();

  const validOrderings = [
    'inicio',
    'proximidade',
  ];

  if (
    !validOrderings.includes(
      normalizedOrdering
    )
  ) {
    throw new UpcomingCelebrationsApiError(
      (
        'Ordenação inválida. Use "inicio" ' +
        'ou "proximidade".'
      ),
      {
        code:
          'INVALID_ORDERING',
      }
    );
  }

  return normalizedOrdering;
}


function validateTime(
  value,
  fieldName
) {
  if (!value) {
    return null;
  }

  const normalizedValue =
    String(value).trim();

  const match =
    /^([01]\d|2[0-3]):([0-5]\d)$/
      .exec(normalizedValue);

  if (!match) {
    throw new UpcomingCelebrationsApiError(
      (
        `${fieldName} deve estar no ` +
        'formato HH:MM.'
      ),
      {
        code:
          'INVALID_TIME',
      }
    );
  }

  return normalizedValue;
}


function buildQueryParams(
  filters = {}
) {
  const page =
    validatePage(
      getFirstValue(
        filters.pagina,
        filters.page,
        1
      )
    );

  const ordering =
    validateOrdering(
      getFirstValue(
        filters.ordenar,
        filters.ordering,
        'inicio'
      )
    );

  const latitude =
    getFirstValue(
      filters.latitude,
      filters.lat
    );

  const longitude =
    getFirstValue(
      filters.longitude,
      filters.lon
    );

  const coordinates =
    validateCoordinates(
      latitude,
      longitude,
      ordering ===
        'proximidade'
    );

  const startTime =
    validateTime(
      getFirstValue(
        filters.horarioDe,
        filters.horario_de
      ),
      'O horário inicial'
    );

  const endTime =
    validateTime(
      getFirstValue(
        filters.horarioAte,
        filters.horario_ate
      ),
      'O horário final'
    );

  if (
    startTime &&
    endTime &&
    startTime > endTime
  ) {
    throw new UpcomingCelebrationsApiError(
      (
        'O horário inicial não pode ser ' +
        'maior que o horário final.'
      ),
      {
        code:
          'INVALID_TIME_RANGE',
      }
    );
  }

  const params =
    new URLSearchParams();

  params.set(
    'pagina',
    String(page)
  );

  params.set(
    'ordenar',
    ordering
  );

  const day =
    getFirstValue(
      filters.dia,
      filters.day
    );

  if (day) {
    params.set(
      'dia',
      String(day).trim()
    );
  }

  if (startTime) {
    params.set(
      'horario_de',
      startTime
    );
  }

  if (endTime) {
    params.set(
      'horario_ate',
      endTime
    );
  }

  if (
    coordinates.latitude !== null &&
    coordinates.longitude !== null
  ) {
    params.set(
      'lat',
      String(
        coordinates.latitude
      )
    );

    params.set(
      'lon',
      String(
        coordinates.longitude
      )
    );
  }

  return params;
}


async function parseResponse(
  response
) {
  const contentType =
    response.headers.get(
      'content-type'
    ) ?? '';

  if (
    contentType.includes(
      'application/json'
    )
  ) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  const text =
    await response.text();

  return {
    responseType:
      'non-json',

    detail:
      text?.slice(0, 300) ||
      null,
  };
}


function getErrorField(
  data,
  field
) {
  const value =
    data?.[field];

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  if (
    typeof value === 'string'
  ) {
    return value;
  }

  return null;
}


function getApiErrorMessage(
  data,
  status
) {
  if (status === 404) {
    return (
      'O endpoint solicitado não foi encontrado.'
    );
  }

  if (status === 400) {
    return (
      getErrorField(
        data,
        'pagina'
      ) ||
      getErrorField(
        data,
        'localizacao'
      ) ||
      getErrorField(
        data,
        'dia'
      ) ||
      getErrorField(
        data,
        'ordenar'
      ) ||
      getErrorField(
        data,
        'horarios'
      ) ||
      getErrorField(
        data,
        'horario_de'
      ) ||
      getErrorField(
        data,
        'horario_ate'
      ) ||
      data?.detail ||
      (
        'Os filtros informados são inválidos.'
      )
    );
  }

  if (status >= 500) {
    return (
      'O servidor apresentou um erro. ' +
      'Tente novamente mais tarde.'
    );
  }

  return (
    data?.erro ||
    data?.mensagem ||
    data?.message ||
    getErrorField(
      data,
      'pagina'
    ) ||
    getErrorField(
      data,
      'localizacao'
    ) ||
    getErrorField(
      data,
      'dia'
    ) ||
    getErrorField(
      data,
      'ordenar'
    ) ||
    getErrorField(
      data,
      'horarios'
    ) ||
    (
      data?.responseType ===
        'non-json'
        ? null
        : data?.detail
    ) ||
    (
      'Não foi possível carregar ' +
      'as celebrações.'
    )
  );
}


function normalizeResponse(data) {
  if (
    !data ||
    !Array.isArray(
      data.resultados
    )
  ) {
    throw new UpcomingCelebrationsApiError(
      (
        'A API retornou uma resposta inválida.'
      ),
      {
        code:
          'INVALID_RESPONSE',

        data,
      }
    );
  }

  const pagination =
    data.paginacao ?? {};

  const currentPage =
    Number(
      pagination.pagina_atual ??
      1
    );

  const pageSize =
    Number(
      pagination.itens_por_pagina ??
      10
    );

  const totalPages =
    Number(
      pagination.total_paginas ??
      1
    );

  const totalItems =
    Number(
      pagination.total_itens ??
      data.total_encontrado ??
      data.resultados.length
    );

  /*
   * Também calcula temProxima pelo número
   * da página, caso o backend não retorne
   * explicitamente o booleano.
   */
  const hasNext =
    pagination.tem_proxima !==
      undefined
      ? Boolean(
        pagination.tem_proxima
      )
      : currentPage <
        totalPages;

  const hasPrevious =
    pagination.tem_anterior !==
      undefined
      ? Boolean(
        pagination.tem_anterior
      )
      : currentPage > 1;

  return {
    sucesso:
      data.sucesso !== false,

    tipo:
      data.tipo || '',

    categorias:
      Array.isArray(
        data.categorias
      )
        ? data.categorias
        : [],

    ordenacao:
      data.ordenacao ||
      'inicio',

    total_encontrado:
      Number(
        data.total_encontrado ??
        totalItems
      ),

    filtros:
      data.filtros ??
      null,

    localizacao_usuario:
      data.localizacao_usuario ??
      null,

    paginacao: {
      pagina_atual:
        currentPage,

      itens_por_pagina:
        pageSize,

      total_paginas:
        totalPages,

      total_itens:
        totalItems,

      tem_proxima:
        hasNext,

      tem_anterior:
        hasPrevious,

      proxima:
        pagination.proxima ??
        null,

      anterior:
        pagination.anterior ??
        null,
    },

    resultados:
      data.resultados,
  };
}


export async function
fetchUpcomingCelebrations(
  endpoint,
  filters = {},
  {
    signal,
  } = {}
) {
  if (!endpoint) {
    throw new UpcomingCelebrationsApiError(
      (
        'O endpoint das celebrações não foi informado.'
      ),
      {
        code:
          'ENDPOINT_REQUIRED',
      }
    );
  }

  const params =
    buildQueryParams(
      filters
    );

  const queryString =
    params.toString();

  const baseUrl =
    joinUrl(
      API_BASE_URL,
      endpoint
    );

  const url =
    queryString
      ? (
        `${baseUrl}?` +
        queryString
      )
      : baseUrl;

  let response;

  try {
    response = await fetch(
      url,
      {
        method: 'GET',

        headers: {
          Accept:
            'application/json',
        },

        signal,
      }
    );
  } catch (error) {
    if (
      error?.name ===
      'AbortError'
    ) {
      throw error;
    }

    throw new UpcomingCelebrationsApiError(
      (
        'Não foi possível conectar ao servidor.'
      ),
      {
        code:
          'NETWORK_ERROR',

        data: error,
      }
    );
  }

  const data =
    await parseResponse(
      response
    );

  if (!response.ok) {
    throw new UpcomingCelebrationsApiError(
      getApiErrorMessage(
        data,
        response.status
      ),
      {
        status:
          response.status,

        data,

        code:
          'API_ERROR',
      }
    );
  }

  return normalizeResponse(
    data
  );
}