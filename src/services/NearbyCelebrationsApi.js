const API_BASE_URL =
  'https://missaemteresina.com.br/api';

const ENDPOINTS = {
  missas:
    '/celebracoes/proximas/missas/',

  confissoes:
    '/celebracoes/proximas/confissoes/',

  adoracoes:
    '/celebracoes/proximas/adoracoes/',
};


export class NearbyCelebrationsApiError
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
      'NearbyCelebrationsApiError';

    this.status = status;
    this.data = data;
    this.code = code;
  }
}


function validateApiConfiguration() {
  if (!API_BASE_URL) {
    throw new NearbyCelebrationsApiError(
      'A URL da API não foi configurada.',
      {
        code:
          'API_URL_NOT_CONFIGURED',
      }
    );
  }
}


function validateCoordinates(
  latitude,
  longitude
) {
  const parsedLatitude =
    Number(latitude);

  const parsedLongitude =
    Number(longitude);

  if (
    !Number.isFinite(parsedLatitude) ||
    !Number.isFinite(parsedLongitude)
  ) {
    throw new NearbyCelebrationsApiError(
      'Latitude e longitude inválidas.',
      {
        code: 'INVALID_COORDINATES',
      }
    );
  }

  if (
    parsedLatitude < -90 ||
    parsedLatitude > 90
  ) {
    throw new NearbyCelebrationsApiError(
      'A latitude deve estar entre -90 e 90.',
      {
        code: 'INVALID_LATITUDE',
      }
    );
  }

  if (
    parsedLongitude < -180 ||
    parsedLongitude > 180
  ) {
    throw new NearbyCelebrationsApiError(
      'A longitude deve estar entre -180 e 180.',
      {
        code: 'INVALID_LONGITUDE',
      }
    );
  }

  return {
    latitude: parsedLatitude,
    longitude: parsedLongitude,
  };
}


function joinUrl(baseUrl, endpoint) {
  const normalizedBase =
    baseUrl.replace(/\/+$/, '');

  const normalizedEndpoint =
    endpoint.replace(/^\/+/, '');

  return (
    `${normalizedBase}/` +
    normalizedEndpoint
  );
}


function buildUrl(
  endpoint,
  latitude,
  longitude
) {
  const baseEndpoint = joinUrl(
    API_BASE_URL,
    endpoint
  );

  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
  });

  return (
    `${baseEndpoint}?` +
    params.toString()
  );
}


async function parseResponse(response) {
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

  const text = await response.text();

  return {
    detail:
      text?.slice(0, 300) || null,

    responseType: 'non-json',
  };
}


function getErrorMessage(
  data,
  fallbackMessage,
  status
) {
  if (status === 404) {
    return (
      'O endereço da API não foi ' +
      'encontrado. Verifique a rota ' +
      'configurada no serviço.'
    );
  }

  if (status >= 500) {
    return (
      'O servidor apresentou um erro. ' +
      'Tente novamente mais tarde.'
    );
  }

  const locationError =
    Array.isArray(data?.localizacao)
      ? data.localizacao[0]
      : data?.localizacao;

  return (
    data?.erro ||
    data?.message ||
    data?.mensagem ||
    locationError ||
    (
      data?.responseType === 'non-json'
        ? null
        : data?.detail
    ) ||
    fallbackMessage
  );
}


async function getCelebrations(
  endpoint,
  latitude,
  longitude,
  {
    signal,
  } = {}
) {
  validateApiConfiguration();

  const coordinates =
    validateCoordinates(
      latitude,
      longitude
    );

  const url = buildUrl(
    endpoint,
    coordinates.latitude,
    coordinates.longitude
  );

  let response;

  try {
    response = await fetch(url, {
      method: 'GET',

      headers: {
        Accept: 'application/json',
      },

      signal,
    });
  } catch (error) {
    if (
      error?.name === 'AbortError'
    ) {
      throw error;
    }

    throw new NearbyCelebrationsApiError(
      'Não foi possível conectar ao servidor.',
      {
        code: 'NETWORK_ERROR',
        data: error,
      }
    );
  }

  const data =
    await parseResponse(response);

  if (!response.ok) {
    throw new NearbyCelebrationsApiError(
      getErrorMessage(
        data,
        (
          'Não foi possível carregar ' +
          'as celebrações.'
        ),
        response.status
      ),
      {
        status: response.status,
        data,
        code: 'API_ERROR',
      }
    );
  }

  if (
    !data ||
    !Array.isArray(data.resultados)
  ) {
    throw new NearbyCelebrationsApiError(
      'A API retornou uma resposta inválida.',
      {
        status: response.status,
        data,
        code: 'INVALID_RESPONSE',
      }
    );
  }

  return data.resultados;
}


export function getNearbyMasses(
  latitude,
  longitude,
  options
) {
  return getCelebrations(
    ENDPOINTS.missas,
    latitude,
    longitude,
    options
  );
}


export function getNearbyConfessions(
  latitude,
  longitude,
  options
) {
  return getCelebrations(
    ENDPOINTS.confissoes,
    latitude,
    longitude,
    options
  );
}


export function getNearbyAdorations(
  latitude,
  longitude,
  options
) {
  return getCelebrations(
    ENDPOINTS.adoracoes,
    latitude,
    longitude,
    options
  );
}


export async function
getAllNearbyCelebrations(
  latitude,
  longitude,
  options
) {
  const [
    missas,
    confissoes,
    adoracoes,
  ] = await Promise.all([
    getNearbyMasses(
      latitude,
      longitude,
      options
    ),

    getNearbyConfessions(
      latitude,
      longitude,
      options
    ),

    getNearbyAdorations(
      latitude,
      longitude,
      options
    ),
  ]);

  return {
    missas,
    confissoes,
    adoracoes,
  };
}