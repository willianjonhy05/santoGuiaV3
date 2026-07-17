import { useCallback, useEffect, useState } from 'react';
import { clearLiturgyCache, getLiturgyByDate } from '../services/liturgyApi';

export default function useLiturgy(dateString) {
  const [liturgy, setLiturgy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadLiturgy() {
      setLoading(true);
      setError(null);

      try {
        const data = await getLiturgyByDate(dateString, {
          signal: controller.signal,
        });

        if (active) {
          setLiturgy(data);
        }
      } catch (requestError) {
        if (requestError?.name === 'AbortError') {
          return;
        }

        if (active) {
          setLiturgy(null);
          setError(requestError);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadLiturgy();

    return () => {
      active = false;
      controller.abort();
    };
  }, [dateString, requestVersion]);

  const retry = useCallback(() => {
    clearLiturgyCache(dateString);
    setRequestVersion((current) => current + 1);
  }, [dateString]);

  return {
    liturgy,
    loading,
    error,
    retry,
  };
}
