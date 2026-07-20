import {
  fetchUpcomingCelebrations,
  UpcomingCelebrationsApiError,
} from './UpcomingCelebrationsApi';


export const UPCOMING_MASSES_ENDPOINT =
  '/celebracoes/missas/proximas/';


export {
  UpcomingCelebrationsApiError,
};


/**
 * Busca as próximas missas normais e votivas.
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
export function getUpcomingMasses(
  filters = {},
  options = {}
) {
  const pagina =
    filters.pagina ??
    filters.page ??
    1;

  return fetchUpcomingCelebrations(
    UPCOMING_MASSES_ENDPOINT,
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
export function getUpcomingMassesPage(
  pagina,
  filters = {},
  options = {}
) {
  return getUpcomingMasses(
    {
      ...filters,
      pagina,
    },
    options
  );
}