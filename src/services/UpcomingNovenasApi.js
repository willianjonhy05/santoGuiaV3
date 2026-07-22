import {
  fetchUpcomingCelebrations,
  UpcomingCelebrationsApiError,
} from './UpcomingCelebrationsApi';


export const UPCOMING_NOVENAS_ENDPOINT =
  '/celebracoes/novenas/proximas/';


export {
  UpcomingCelebrationsApiError,
};


export function getUpcomingNovenas(
  filters = {},
  options = {}
) {
  const pagina =
    filters.pagina ??
    filters.page ??
    1;


  return fetchUpcomingCelebrations(
    UPCOMING_NOVENAS_ENDPOINT,
    {
      ...filters,
      pagina,
    },
    options
  );
}


export function getUpcomingNovenasPage(
  pagina,
  filters = {},
  options = {}
) {
  return getUpcomingNovenas(
    {
      ...filters,
      pagina,
    },
    options
  );
}