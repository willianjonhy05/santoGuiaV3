import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY =
  '@santoguia:favorite-churches';

const FavoritesContext =
  createContext(null);

function normalizeText(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  return String(value).trim();
}

function compactChurch(church) {
  if (
    !church ||
    church.id === null ||
    church.id === undefined
  ) {
    return null;
  }

  const endereco =
    normalizeText(church.endereco);

  const bairro =
    normalizeText(church.bairro);

  const cidade =
    normalizeText(church.cidade);

  return {
    id: church.id,

    nome:
      normalizeText(church.nome) ||
      'Igreja sem nome',

    slug: normalizeText(church.slug),

    endereco,
    bairro,
    cidade,

    enderecoCompleto:
      normalizeText(
        church.enderecoCompleto
      ) ||
      [
        endereco,
        bairro,
        cidade,
      ]
        .filter(Boolean)
        .join(' · '),

    paroquia:
      Boolean(church.paroquia),

    capela:
      Boolean(church.capela),

    latitude:
      church.latitude ?? null,

    longitude:
      church.longitude ?? null,

    distancia_km:
      church.distancia_km ?? null,

    imagem_url:
      normalizeText(
        church.imagem_url
      ),

    telefone:
      normalizeText(church.telefone),

    instagram_url:
      normalizeText(
        church.instagram_url
      ),

    whatsapp_url:
      normalizeText(
        church.whatsapp_url
      ),

    detalhe_url:
      normalizeText(
        church.detalhe_url
      ),
  };
}

export function FavoritesProvider({
  children,
}) {
  const [favorites, setFavorites] =
    useState([]);

  const [isReady, setIsReady] =
    useState(false);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const savedValue =
          await AsyncStorage.getItem(
            STORAGE_KEY
          );

        if (!savedValue) {
          return;
        }

        const parsed =
          JSON.parse(savedValue);

        if (!Array.isArray(parsed)) {
          return;
        }

        const validFavorites = parsed
          .map(compactChurch)
          .filter(
            (church) =>
              church &&
              church.slug
          );

        setFavorites(
          validFavorites
        );
      } catch (error) {
        console.error(
          'Erro ao carregar favoritos:',
          error
        );
      } finally {
        setIsReady(true);
      }
    }

    loadFavorites();
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    async function saveFavorites() {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(favorites)
        );
      } catch (error) {
        console.error(
          'Erro ao salvar favoritos:',
          error
        );
      }
    }

    saveFavorites();
  }, [favorites, isReady]);

  const favoriteIds = useMemo(
    () =>
      new Set(
        favorites.map((church) =>
          String(church.id)
        )
      ),
    [favorites]
  );

  const isFavorite = useCallback(
    (churchId) =>
      favoriteIds.has(
        String(churchId)
      ),
    [favoriteIds]
  );

  const addFavorite = useCallback(
    (church) => {
      const normalizedChurch =
        compactChurch(church);

      if (!normalizedChurch) {
        return;
      }

      setFavorites((current) => {
        const alreadyExists =
          current.some(
            (item) =>
              String(item.id) ===
              String(
                normalizedChurch.id
              )
          );

        if (alreadyExists) {
          return current;
        }

        return [
          normalizedChurch,
          ...current,
        ];
      });
    },
    []
  );

  const removeFavorite = useCallback(
    (churchId) => {
      setFavorites((current) =>
        current.filter(
          (church) =>
            String(church.id) !==
            String(churchId)
        )
      );
    },
    []
  );

  const toggleFavorite = useCallback(
    (church) => {
      if (
        !church ||
        church.id === null ||
        church.id === undefined
      ) {
        return;
      }

      setFavorites((current) => {
        const exists =
          current.some(
            (item) =>
              String(item.id) ===
              String(church.id)
          );

        if (exists) {
          return current.filter(
            (item) =>
              String(item.id) !==
              String(church.id)
          );
        }

        const normalizedChurch =
          compactChurch(church);

        if (!normalizedChurch) {
          return current;
        }

        return [
          normalizedChurch,
          ...current,
        ];
      });
    },
    []
  );

  const clearFavorites =
    useCallback(() => {
      setFavorites([]);
    }, []);

  const value = useMemo(
    () => ({
      favorites,
      isReady,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clearFavorites,
    }),
    [
      favorites,
      isReady,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clearFavorites,
    ]
  );

  return (
    <FavoritesContext.Provider
      value={value}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context =
    useContext(FavoritesContext);

  if (!context) {
    throw new Error(
      'useFavorites deve ser usado dentro de FavoritesProvider.'
    );
  }

  return context;
}