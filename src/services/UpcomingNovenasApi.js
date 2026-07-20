import {
  fetchUpcomingCelebrations,
  UpcomingCelebrationsApiError,
} from './UpcomingCelebrationsApi';


const ENDPOINT =
  '/celebracoes/novenas/proximas/';


export {
  UpcomingCelebrationsApiError,
};


export function getUpcomingNovenas(
  filters = {},
  options = {}
) {
  return fetchUpcomingCelebrations(
    ENDPOINT,
    filters,
    options
  );
}