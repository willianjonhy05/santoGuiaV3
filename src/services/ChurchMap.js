const CHURCH_MAP_API_URL =
  'https://missaemteresina.com.br/api/mapa/';

const REQUEST_TIMEOUT = 15000;

export class ChurchMapApiError extends Error {
  constructor(message, options = {}) {
    super(message);

    this.name = 'ChurchMapApiError';
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

function normalizeChurch(church) {
  const latitude = parseNumber(
    church?.latitude
  );

  const longitude = parseNumber(
    church?.longitude
  );

  if (
    latitude === null ||
    longitude === null
  ) {
    return null;
  }

  const address = normalizeText(
    church?.endereco
  );

  const neighborhood = normalizeText(
    church?.bairro
  );

  const city = normalizeText(
    church?.cidade
  );

  const addressParts = [
    address,
    neighborhood,
    city,
  ].filter(Boolean);

  return {
    id: church.id,
    name:
      normalizeText(church.nome) ||
      'Igreja sem nome',

    address,
    neighborhood,
    city,

    addressLine:
      addressParts.join(' · '),

    parish: church.paroquia,
    chapel: church.capela,

    phone: normalizeText(
      church.telefone
    ),

    latitude,
    longitude,

    mapsUrl: normalizeText(
      church.maps
    ),

    slug: normalizeText(
      church.slug
    ),

    distanceKm: parseNumber(
      church.distancia_km
    ),

    raw: church,
  };
}

function buildRequestUrl({
  latitude,
  longitude,
} = {}) {
  const hasLocation =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  if (!hasLocation) {
    return CHURCH_MAP_API_URL;
  }

  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
  });

  return `${CHURCH_MAP_API_URL}?${params.toString()}`;
}

function extractErrorMessage(
  data,
  status
) {
  if (data?.detail) {
    return String(data.detail);
  }

  if (data?.message) {
    return String(data.message);
  }

  if (data?.mensagem) {
    return String(data.mensagem);
  }

  if (status >= 500) {
    return 'O servidor de igrejas está temporariamente indisponível.';
  }

  return 'Não foi possível carregar as igrejas.';
}

export async function getChurchesForMap(
  {
    latitude,
    longitude,
    signal,
  } = {}
) {
  const controller =
    new AbortController();

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
    const response = await fetch(
      buildRequestUrl({
        latitude,
        longitude,
      }),
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      }
    );

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new ChurchMapApiError(
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

    if (
      !data ||
      !Array.isArray(data.igrejas)
    ) {
      throw new ChurchMapApiError(
        'A API retornou uma lista de igrejas inválida.',
        {
          code: 'invalid_response',
          data,
        }
      );
    }

    const churches = data.igrejas
      .map(normalizeChurch)
      .filter(Boolean);

    return {
      success:
        data.sucesso !== false,

      totalChurches:
        data.total_igrejas ??
        churches.length,

      locationAvailable:
        Boolean(
          data.localizacao_disponivel
        ),

      userLocation: {
        latitude: parseNumber(
          data.localizacao_usuario
            ?.latitude
        ),

        longitude: parseNumber(
          data.localizacao_usuario
            ?.longitude
        ),
      },

      churches,
    };
  } catch (error) {
    if (
      error instanceof
      ChurchMapApiError
    ) {
      throw error;
    }

    if (
      error?.name === 'AbortError'
    ) {
      if (signal?.aborted) {
        throw error;
      }

      if (didTimeout) {
        throw new ChurchMapApiError(
          'O servidor demorou muito para responder.',
          {
            code: 'request_timeout',
          }
        );
      }

      throw error;
    }

    throw new ChurchMapApiError(
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

export function buildChurchMapsUrl(
  church
) {
  if (church?.mapsUrl) {
    return church.mapsUrl;
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