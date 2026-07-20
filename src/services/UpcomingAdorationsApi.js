import {
  fetchUpcomingCelebrations,
  UpcomingCelebrationsApiError,
} from './UpcomingCelebrationsApi';


const ENDPOINT =
  '/celebracoes/adoracoes/proximas/';


export {
  UpcomingCelebrationsApiError,
};


export function getUpcomingAdorations(
  filters = {},
  options = {}
) {
  return fetchUpcomingCelebrations(
    ENDPOINT,
    filters,
    options
  );
}