import {
  fetchUpcomingCelebrations,
  UpcomingCelebrationsApiError,
} from './UpcomingCelebrationsApi';


const ENDPOINT =
  '/celebracoes/confissoes/proximas/';


export {
  UpcomingCelebrationsApiError,
};


export function getUpcomingConfessions(
  filters = {},
  options = {}
) {
  return fetchUpcomingCelebrations(
    ENDPOINT,
    filters,
    options
  );
}