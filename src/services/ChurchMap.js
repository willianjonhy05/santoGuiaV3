import AsyncStorage from
  '@react-native-async-storage/async-storage';

const CHURCH_MAP_API_URL =
  'https://missaemteresina.com.br/api/mapa/';

const REQUEST_TIMEOUT = 15000;

const CACHE_VERSION = 3;

const CACHE_KEY =
  '@santo-guia/church-map:v3';

export const CHURCH_MAP_CACHE_TTL_MS =
  12 * 60 * 60 * 1000;

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

function normalizeSlug(value) {
  return normalizeText(value)
    .replace(/^\/+|\/+$/g, '');
}

function extractSlugFromUrl(value) {
  const url = normalizeText(value);

  if (!url) {
    return '';
  }

  const match = url.match(
    /\/igrejas\/([^/?#]+)\/?/i
  );

  return normalizeSlug(
    match?.[1]
  );
}

function createSlugFromName(value) {
  const normalizedName =
    normalizeText(value);

  if (!normalizedName) {
    return '';
  }

  return normalizedName
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function resolveChurchDetails(
  church
) {
  const detailsUrl = normalizeText(
    church?.detalhes_url ??
    church?.details_url ??
    church?.detail_url ??
    church?.detailsUrl ??
    church?.detailUrl ??
    church?.permalink ??
    church?.link
  );

  const slug =
    normalizeSlug(
      church?.slug
    ) ||
    extractSlugFromUrl(
      detailsUrl
    ) ||
    extractSlugFromUrl(
      church?.url
    ) ||
    createSlugFromName(
      church?.nome ??
      church?.name
    );

  return {
    slug,
    detailsUrl,
  };
}

function isValidCoordinate(
  latitude,
  longitude
) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function createChurchId(
  church,
  latitude,
  longitude
) {
  const originalId =
    church?.id ??
    church?.slug;

  if (
    originalId !== null &&
    originalId !== undefined &&
    String(originalId).trim()
  ) {
    return String(originalId);
  }

  return [
    latitude,
    longitude,
    normalizeText(church?.nome),
  ].join(':');
}

function normalizeChurch(church) {
  if (
    !church ||
    typeof church !== 'object'
  ) {
    return null;
  }

  const latitude = parseNumber(
    church.latitude
  );

  const longitude = parseNumber(
    church.longitude
  );

  if (
    !isValidCoordinate(
      latitude,
      longitude
    )
  ) {
    return null;
  }

  const address = normalizeText(
    church.endereco ??
    church.address
  );

  const neighborhood = normalizeText(
    church.bairro ??
    church.neighborhood
  );

  const city = normalizeText(
    church.cidade ??
    church.city
  );

  const addressLine =
    normalizeText(church.addressLine) ||
    [
      address,
      neighborhood,
      city,
    ]
      .filter(Boolean)
      .join(' · ');

  const {
    slug,
    detailsUrl,
  } = resolveChurchDetails(
    church
  );

  return {
    id: createChurchId(
      church,
      latitude,
      longitude
    ),

    name:
      normalizeText(
        church.nome ??
        church.name
      ) ||
      'Igreja sem nome',

    address,
    neighborhood,
    city,
    addressLine,

    parish:
      church.paroquia ??
      church.parish ??
      null,

    chapel:
      church.capela ??
      church.chapel ??
      null,

    phone: normalizeText(
      church.telefone ??
      church.phone
    ),

    latitude,
    longitude,

    slug,
    detailsUrl,

    distanceKm: null,
  };
}

function normalizeChurchList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const uniqueChurches =
    new Map();

  value.forEach((church) => {
    const normalized =
      normalizeChurch(church);

    if (!normalized) {
      return;
    }

    uniqueChurches.set(
      normalized.id,
      normalized
    );
  });

  return Array.from(
    uniqueChurches.values()
  );
}

function toRadians(value) {
  return value * (Math.PI / 180);
}

function calculateDistanceKm(
  from,
  to
) {
  if (
    !isValidCoordinate(
      from?.latitude,
      from?.longitude
    ) ||
    !isValidCoordinate(
      to?.latitude,
      to?.longitude
    )
  ) {
    return null;
  }

  const earthRadiusKm = 6371;

  const latitudeDifference =
    toRadians(
      to.latitude - from.latitude
    );

  const longitudeDifference =
    toRadians(
      to.longitude - from.longitude
    );

  const fromLatitude =
    toRadians(from.latitude);

  const toLatitude =
    toRadians(to.latitude);

  const haversine =
    Math.sin(
      latitudeDifference / 2
    ) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(
        longitudeDifference / 2
      ) ** 2;

  const angularDistance =
    2 *
    Math.atan2(
      Math.sqrt(haversine),
      Math.sqrt(1 - haversine)
    );

  return (
    earthRadiusKm *
    angularDistance
  );
}

export function sortChurchesForMap(
  churches,
  userLocation
) {
  const normalizedChurches =
    normalizeChurchList(churches);

  const hasUserLocation =
    isValidCoordinate(
      userLocation?.latitude,
      userLocation?.longitude
    );

  const churchesWithDistance =
    normalizedChurches.map(
      (church) => ({
        ...church,

        distanceKm:
          hasUserLocation
            ? calculateDistanceKm(
                userLocation,
                church
              )
            : null,
      })
    );

  churchesWithDistance.sort(
    (firstChurch, secondChurch) => {
      if (hasUserLocation) {
        const firstDistance =
          firstChurch.distanceKm;

        const secondDistance =
          secondChurch.distanceKm;

        if (
          Number.isFinite(firstDistance) &&
          Number.isFinite(secondDistance)
        ) {
          return (
            firstDistance -
            secondDistance
          );
        }
      }

      return firstChurch.name.localeCompare(
        secondChurch.name,
        'pt-BR',
        {
          sensitivity: 'base',
        }
      );
    }
  );

  return churchesWithDistance;
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

function isCacheFresh(savedAt) {
  return (
    Number.isFinite(savedAt) &&
    Date.now() - savedAt <
      CHURCH_MAP_CACHE_TTL_MS
  );
}

async function readCache() {
  try {
    const storedValue =
      await AsyncStorage.getItem(
        CACHE_KEY
      );

    if (!storedValue) {
      return null;
    }

    const parsedValue =
      JSON.parse(storedValue);

    if (
      parsedValue?.version !==
        CACHE_VERSION ||
      !Number.isFinite(
        parsedValue?.savedAt
      )
    ) {
      await AsyncStorage.removeItem(
        CACHE_KEY
      );

      return null;
    }

    const churches =
      normalizeChurchList(
        parsedValue.churches
      );

    if (churches.length === 0) {
      await AsyncStorage.removeItem(
        CACHE_KEY
      );

      return null;
    }

    return {
      version: CACHE_VERSION,
      savedAt: parsedValue.savedAt,
      totalChurches:
        parsedValue.totalChurches ??
        churches.length,
      churches,
    };
  } catch (error) {
    console.warn(
      'Não foi possível ler o cache do mapa:',
      error
    );

    return null;
  }
}

async function saveCache({
  churches,
  totalChurches,
}) {
  const cachePayload = {
    version: CACHE_VERSION,
    savedAt: Date.now(),
    totalChurches:
      totalChurches ??
      churches.length,
    churches,
  };

  try {
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify(cachePayload)
    );
  } catch (error) {
    /*
     * A falha ao salvar cache não deve
     * impedir a exibição dos dados.
     */
    console.warn(
      'Não foi possível salvar o cache do mapa:',
      error
    );
  }

  return cachePayload;
}

function createMapResponse({
  cache,
  source,
  userLocation,
  syncError = null,
}) {
  const churches =
    sortChurchesForMap(
      cache.churches,
      userLocation
    );

  return {
    success: true,

    totalChurches:
      cache.totalChurches ??
      churches.length,

    locationAvailable:
      isValidCoordinate(
        userLocation?.latitude,
        userLocation?.longitude
      ),

    userLocation:
      isValidCoordinate(
        userLocation?.latitude,
        userLocation?.longitude
      )
        ? {
            latitude:
              userLocation.latitude,

            longitude:
              userLocation.longitude,
          }
        : null,

    churches,

    cache: {
      source,
      savedAt: cache.savedAt,
      isStale:
        !isCacheFresh(
          cache.savedAt
        ),
      ageMs:
        Math.max(
          0,
          Date.now() -
            cache.savedAt
        ),
    },

    syncError,
  };
}

async function requestChurches({
  signal,
} = {}) {
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
    /*
     * A API é chamada sem latitude e
     * longitude. A lista fica igual para
     * todos e a distância é calculada
     * localmente no aparelho.
     */
    const response = await fetch(
      CHURCH_MAP_API_URL,
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

    const churches =
      normalizeChurchList(
        data.igrejas
      );

    if (churches.length === 0) {
      throw new ChurchMapApiError(
        'A API não retornou igrejas com coordenadas válidas.',
        {
          code:
            'empty_valid_response',
          data,
        }
      );
    }

    return {
      churches,

      totalChurches:
        data.total_igrejas ??
        churches.length,
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
            code:
              'request_timeout',
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

export async function getCachedChurchesForMap(
  {
    latitude,
    longitude,
  } = {}
) {
  const cache = await readCache();

  if (!cache) {
    return null;
  }

  return createMapResponse({
    cache,
    source: 'cache',

    userLocation: {
      latitude,
      longitude,
    },
  });
}

export async function refreshChurchesForMap(
  {
    latitude,
    longitude,
    signal,
    forceRefresh = false,
  } = {}
) {
  const userLocation = {
    latitude,
    longitude,
  };

  const existingCache =
    await readCache();

  if (
    existingCache &&
    !forceRefresh &&
    isCacheFresh(
      existingCache.savedAt
    )
  ) {
    return createMapResponse({
      cache: existingCache,
      source: 'cache',
      userLocation,
    });
  }

  try {
    const remoteData =
      await requestChurches({
        signal,
      });

    const savedCache =
      await saveCache(
        remoteData
      );

    return createMapResponse({
      cache: savedCache,
      source: 'network',
      userLocation,
    });
  } catch (error) {
    if (
      error?.name === 'AbortError'
    ) {
      throw error;
    }

    if (existingCache) {
      return createMapResponse({
        cache: existingCache,
        source: 'stale-cache',
        userLocation,
        syncError:
          error instanceof
          ChurchMapApiError
            ? error.message
            : 'Não foi possível atualizar os dados.',
      });
    }

    throw error;
  }
}

/*
 * Mantém compatibilidade com o nome
 * usado pela implementação anterior.
 */
export async function getChurchesForMap(
  options = {}
) {
  return refreshChurchesForMap(
    options
  );
}

export async function clearChurchMapCache() {
  await AsyncStorage.removeItem(
    CACHE_KEY
  );
}

export function buildChurchMapsUrl(
  church,
  userLocation
) {
  const destinationLatitude =
    parseNumber(
      church?.latitude
    );

  const destinationLongitude =
    parseNumber(
      church?.longitude
    );

  if (
    !isValidCoordinate(
      destinationLatitude,
      destinationLongitude
    )
  ) {
    return null;
  }

  const hasOrigin =
    isValidCoordinate(
      userLocation?.latitude,
      userLocation?.longitude
    );

  if (hasOrigin) {
    const route = encodeURIComponent(
      [
        `${userLocation.latitude},${userLocation.longitude}`,
        `${destinationLatitude},${destinationLongitude}`,
      ].join(';')
    );

    return (
      'https://www.openstreetmap.org/directions' +
      '?engine=fossgis_osrm_car' +
      `&route=${route}`
    );
  }

  return (
    'https://www.openstreetmap.org/' +
    `?mlat=${destinationLatitude}` +
    `&mlon=${destinationLongitude}` +
    `#map=17/${destinationLatitude}/${destinationLongitude}`
  );
}