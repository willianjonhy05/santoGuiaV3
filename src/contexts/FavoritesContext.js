import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import AsyncStorage
  from '@react-native-async-storage/async-storage';


const CHURCHES_STORAGE_KEY =
  '@santoguia:favorite-churches';

const CELEBRATIONS_STORAGE_KEY =
  '@santoguia:favorite-celebrations';


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


function getCelebrationKey(
  celebrationOrId,
  category
) {
  const isObject =
    celebrationOrId !== null &&
    typeof celebrationOrId === 'object';

  const id = isObject
    ? celebrationOrId.id
    : celebrationOrId;

  const celebrationCategory = isObject
    ? (
      celebrationOrId.categoria ||
      celebrationOrId.category
    )
    : category;

  if (
    id === null ||
    id === undefined
  ) {
    return '';
  }

  return [
    normalizeText(
      celebrationCategory
    ) || 'celebracao',

    String(id),
  ].join(':');
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

    slug:
      normalizeText(church.slug),

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
      normalizeText(
        church.telefone
      ),

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


function compactCelebration(
  celebration
) {
  if (
    !celebration ||
    celebration.id === null ||
    celebration.id === undefined
  ) {
    return null;
  }

  const categoria =
    normalizeText(
      celebration.categoria ||
      celebration.category
    ) || 'celebracao';

  const churchSource =
    celebration.igreja || {
      id:
        celebration.igreja_id,

      slug:
        celebration.igreja_slug,

      nome:
        celebration.igreja_nome,
    };

  const igreja =
    compactChurch(churchSource);

  return {
    id:
      celebration.id,

    favoriteKey:
      getCelebrationKey({
        id: celebration.id,
        categoria,
      }),

    nome:
      normalizeText(
        celebration.nome
      ) ||
      'Celebração',

    categoria,

    categoria_display:
      normalizeText(
        celebration.categoria_display
      ),

    recorrencia:
      normalizeText(
        celebration.recorrencia
      ),

    recorrencia_display:
      normalizeText(
        celebration.recorrencia_display
      ),

    descricao_recorrencia:
      normalizeText(
        celebration.descricao_recorrencia
      ),

    dia:
      normalizeText(
        celebration.dia
      ),

    dia_display:
      normalizeText(
        celebration.dia_display
      ),

    proxima_data:
      normalizeText(
        celebration.proxima_data
      ),

    proxima_data_iso:
      normalizeText(
        celebration.proxima_data_iso
      ),

    horario_inicio:
      normalizeText(
        celebration.horario_inicio
      ),

    horario_fim:
      normalizeText(
        celebration.horario_fim
      ),

    descricao:
      normalizeText(
        celebration.descricao
      ),

    exige_agendamento:
      Boolean(
        celebration.exige_agendamento
      ),

    igreja_id:
      celebration.igreja_id ??
      igreja?.id ??
      null,

    igreja_slug:
      normalizeText(
        celebration.igreja_slug
      ) ||
      igreja?.slug ||
      '',

    igreja,
  };
}


export function FavoritesProvider({
  children,
}) {
  /*
   * Igrejas favoritas.
   */
  const [
    favorites,
    setFavorites,
  ] = useState([]);

  /*
   * Missas, confissões e adorações
   * favoritas.
   */
  const [
    favoriteCelebrations,
    setFavoriteCelebrations,
  ] = useState([]);

  const [isReady, setIsReady] =
    useState(false);


  /*
   * Carrega os dois tipos de favoritos.
   */
  useEffect(() => {
    async function loadFavorites() {
      try {
        const [
          savedChurches,
          savedCelebrations,
        ] = await Promise.all([
          AsyncStorage.getItem(
            CHURCHES_STORAGE_KEY
          ),

          AsyncStorage.getItem(
            CELEBRATIONS_STORAGE_KEY
          ),
        ]);

        if (savedChurches) {
          const parsedChurches =
            JSON.parse(savedChurches);

          if (
            Array.isArray(
              parsedChurches
            )
          ) {
            const validChurches =
              parsedChurches
                .map(compactChurch)
                .filter(
                  (church) =>
                    church &&
                    church.slug
                );

            setFavorites(
              validChurches
            );
          }
        }

        if (savedCelebrations) {
          const parsedCelebrations =
            JSON.parse(
              savedCelebrations
            );

          if (
            Array.isArray(
              parsedCelebrations
            )
          ) {
            const validCelebrations =
              parsedCelebrations
                .map(
                  compactCelebration
                )
                .filter(
                  (celebration) =>
                    celebration &&
                    celebration
                      .favoriteKey
                );

            setFavoriteCelebrations(
              validCelebrations
            );
          }
        }
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


  /*
   * Salva igrejas favoritas.
   */
  useEffect(() => {
    if (!isReady) {
      return;
    }

    async function saveChurches() {
      try {
        await AsyncStorage.setItem(
          CHURCHES_STORAGE_KEY,
          JSON.stringify(favorites)
        );
      } catch (error) {
        console.error(
          'Erro ao salvar igrejas favoritas:',
          error
        );
      }
    }

    saveChurches();
  }, [
    favorites,
    isReady,
  ]);


  /*
   * Salva celebrações favoritas.
   */
  useEffect(() => {
    if (!isReady) {
      return;
    }

    async function saveCelebrations() {
      try {
        await AsyncStorage.setItem(
          CELEBRATIONS_STORAGE_KEY,
          JSON.stringify(
            favoriteCelebrations
          )
        );
      } catch (error) {
        console.error(
          'Erro ao salvar celebrações favoritas:',
          error
        );
      }
    }

    saveCelebrations();
  }, [
    favoriteCelebrations,
    isReady,
  ]);


  /*
   * Igrejas favoritas.
   */
  const favoriteIds = useMemo(
    () =>
      new Set(
        favorites.map(
          (church) =>
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
      const normalizedChurch =
        compactChurch(church);

      if (!normalizedChurch) {
        return;
      }

      setFavorites((current) => {
        const exists =
          current.some(
            (item) =>
              String(item.id) ===
              String(
                normalizedChurch.id
              )
          );

        if (exists) {
          return current.filter(
            (item) =>
              String(item.id) !==
              String(
                normalizedChurch.id
              )
          );
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


  /*
   * Celebrações favoritas.
   */
  const favoriteCelebrationKeys =
    useMemo(
      () =>
        new Set(
          favoriteCelebrations.map(
            (celebration) =>
              getCelebrationKey(
                celebration
              )
          )
        ),
      [favoriteCelebrations]
    );


  const isCelebrationFavorite =
    useCallback(
      (
        celebrationOrId,
        category
      ) => {
        const key =
          getCelebrationKey(
            celebrationOrId,
            category
          );

        if (!key) {
          return false;
        }

        return (
          favoriteCelebrationKeys
            .has(key)
        );
      },
      [favoriteCelebrationKeys]
    );


  const addCelebrationFavorite =
    useCallback(
      (celebration) => {
        const normalizedCelebration =
          compactCelebration(
            celebration
          );

        if (!normalizedCelebration) {
          return;
        }

        setFavoriteCelebrations(
          (current) => {
            const exists =
              current.some(
                (item) =>
                  item.favoriteKey ===
                  normalizedCelebration
                    .favoriteKey
              );

            if (exists) {
              return current;
            }

            return [
              normalizedCelebration,
              ...current,
            ];
          }
        );
      },
      []
    );


  const removeCelebrationFavorite =
    useCallback(
      (
        celebrationOrId,
        category
      ) => {
        const key =
          getCelebrationKey(
            celebrationOrId,
            category
          );

        setFavoriteCelebrations(
          (current) => {
            /*
             * Quando recebe somente o ID,
             * remove pelo ID.
             */
            if (
              typeof celebrationOrId !==
                'object' &&
              !category
            ) {
              return current.filter(
                (item) =>
                  String(item.id) !==
                  String(
                    celebrationOrId
                  )
              );
            }

            return current.filter(
              (item) =>
                item.favoriteKey !== key
            );
          }
        );
      },
      []
    );


  const toggleCelebrationFavorite =
    useCallback(
      (celebration) => {
        const normalizedCelebration =
          compactCelebration(
            celebration
          );

        if (!normalizedCelebration) {
          return;
        }

        setFavoriteCelebrations(
          (current) => {
            const exists =
              current.some(
                (item) =>
                  item.favoriteKey ===
                  normalizedCelebration
                    .favoriteKey
              );

            if (exists) {
              return current.filter(
                (item) =>
                  item.favoriteKey !==
                  normalizedCelebration
                    .favoriteKey
              );
            }

            return [
              normalizedCelebration,
              ...current,
            ];
          }
        );
      },
      []
    );


  const clearCelebrationFavorites =
    useCallback(() => {
      setFavoriteCelebrations([]);
    }, []);


  const value = useMemo(
    () => ({
      /*
       * Igrejas.
       */
      favorites,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clearFavorites,

      /*
       * Celebrações.
       */
      favoriteCelebrations,
      isCelebrationFavorite,
      addCelebrationFavorite,
      removeCelebrationFavorite,
      toggleCelebrationFavorite,
      clearCelebrationFavorites,

      isReady,
    }),
    [
      favorites,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clearFavorites,

      favoriteCelebrations,
      isCelebrationFavorite,
      addCelebrationFavorite,
      removeCelebrationFavorite,
      toggleCelebrationFavorite,
      clearCelebrationFavorites,

      isReady,
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