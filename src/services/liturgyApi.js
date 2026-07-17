import { splitDateString } from '../utils/date';

const BASE_URL = 'https://liturgia.up.railway.app/v2/';
const responseCache = new Map();

function buildLiturgyUrl(dateString) {
  const { year, month, day } = splitDateString(dateString);

  return `${BASE_URL}?dia=${encodeURIComponent(day)}&mes=${encodeURIComponent(
    month
  )}&ano=${encodeURIComponent(year)}`;
}

export async function getLiturgyByDate(
  dateString,
  { signal, ignoreCache = false } = {}
) {
  if (!ignoreCache && responseCache.has(dateString)) {
    return responseCache.get(dateString);
  }

  const response = await fetch(buildLiturgyUrl(dateString), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    throw new Error('A API retornou uma resposta inválida.');
  }

  if (!response.ok) {
    const error = new Error(
      data?.erro || 'Não foi possível carregar a liturgia desta data.'
    );
    error.status = response.status;
    throw error;
  }

  responseCache.set(dateString, data);
  return data;
}

export function clearLiturgyCache(dateString) {
  if (dateString) {
    responseCache.delete(dateString);
    return;
  }

  responseCache.clear();
}
