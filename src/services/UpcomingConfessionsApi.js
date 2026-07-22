import {
  fetchUpcomingCelebrations,
  UpcomingCelebrationsApiError,
} from './UpcomingCelebrationsApi';


export const UPCOMING_CONFESSIONS_ENDPOINT =
  '/celebracoes/confissoes/proximas/';


export {
  UpcomingCelebrationsApiError,
};


export function getUpcomingConfessions(
  filters = {},
  options = {}
) {
  const pagina =
    filters.pagina ??
    filters.page ??
    1;


  return fetchUpcomingCelebrations(
    UPCOMING_CONFESSIONS_ENDPOINT,
    {
      ...filters,
      pagina,
    },
    options
  );
}


export function getUpcomingConfessionsPage(
  pagina,
  filters = {},
  options = {}
) {
  return getUpcomingConfessions(
    {
      ...filters,
      pagina,
    },
    options
  );
}