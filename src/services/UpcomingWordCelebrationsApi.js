import {
  fetchUpcomingCelebrations,
  UpcomingCelebrationsApiError,
} from './UpcomingCelebrationsApi';


const ENDPOINT =
  '/celebracoes/palavra/proximas/';


export {
  UpcomingCelebrationsApiError,
};


export function
getUpcomingWordCelebrations(
  filters = {},
  options = {}
) {
  return fetchUpcomingCelebrations(
    ENDPOINT,
    filters,
    options
  );
}