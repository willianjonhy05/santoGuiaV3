import {
  fetchUpcomingCelebrations,
  UpcomingCelebrationsApiError,
} from './UpcomingCelebrationsApi';


export const UPCOMING_WORD_CELEBRATIONS_ENDPOINT =
  '/celebracoes/palavra/proximas/';


export {
  UpcomingCelebrationsApiError,
};


export function getUpcomingWordCelebrations(
  filters = {},
  options = {}
) {
  const pagina =
    filters.pagina ??
    filters.page ??
    1;


  return fetchUpcomingCelebrations(
    UPCOMING_WORD_CELEBRATIONS_ENDPOINT,
    {
      ...filters,
      pagina,
    },
    options
  );
}


export function getUpcomingWordCelebrationsPage(
  pagina,
  filters = {},
  options = {}
) {
  return getUpcomingWordCelebrations(
    {
      ...filters,
      pagina,
    },
    options
  );
}