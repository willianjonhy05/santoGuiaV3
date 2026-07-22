import {
  fetchUpcomingCelebrations,
  UpcomingCelebrationsApiError,
} from './UpcomingCelebrationsApi';


export const UPCOMING_ADORATION_ENDPOINT =
  '/celebracoes/adoracoes/proximas/';


export {
  UpcomingCelebrationsApiError,
};


/**
 * Busca as próximas adorações normais e votivas.
 *
 * Filtros aceitos:
 * - pagina
 * - dia
 * - horarioDe
 * - horarioAte
 * - ordenar
 * - latitude
 * - longitude
 *
 * Opções aceitas:
 * - signal
 */
export function getUpcomingAdorations(
  filters = {},
  options = {}
) {
  const pagina =
    filters.pagina ??
    filters.page ??
    1;


  return fetchUpcomingCelebrations(
    UPCOMING_ADORATION_ENDPOINT,
    {
      ...filters,
      pagina,
    },
    options
  );
}


/**
 * Atalho para buscar uma página específica.
 */
export function getUpcomingAdorationsPage(
  pagina,
  filters = {},
  options = {}
) {
  return getUpcomingAdorations(
    {
      ...filters,
      pagina,
    },
    options
  );
}