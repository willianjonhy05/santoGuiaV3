import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  cancelCelebrationReminder,
  scheduleCelebrationReminder,
} from '../services/CelebrationNotifications';

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
    celebration.igreja ||
    celebration.church ||
    {
      id:
        celebration.igreja_id ??
        celebration.igrejaId ??
        celebration.churchId,

      slug:
        celebration.igreja_slug ||
        celebration.igrejaSlug ||
        celebration.churchSlug,

      nome:
        celebration.igreja_nome ||
        celebration.igrejaNome ||
        celebration.churchName,

      endereco:
        celebration.igreja_endereco ||
        celebration.igrejaEndereco,

      bairro:
        celebration.igreja_bairro ||
        celebration.igrejaBairro,

      cidade:
        celebration.igreja_cidade ||
        celebration.igrejaCidade,
    };

  const igreja =
    compactChurch(
      churchSource
    );

  const horarioInicio =
    normalizeText(
      celebration.horario_inicio ??
      celebration.horarioInicio ??
      celebration.time
    );

  const horarioFim =
    normalizeText(
      celebration.horario_fim ??
      celebration.horarioFim
    );

  const proximaData =
    normalizeText(
      celebration.proxima_data ??
      celebration.proximaData
    );

  const proximaDataIso =
    normalizeText(
      celebration.proxima_data_iso ??
      celebration.proximaDataIso
    );

  return {
    id:
      celebration.id,

    favoriteKey:
      getCelebrationKey({
        id:
          celebration.id,

        categoria,
      }),

    notificationId:
      normalizeText(
        celebration.notificationId ??
        celebration.notification_id
      ),

    nome:
      normalizeText(
        celebration.nome ??
        celebration.name
      ) || 'Celebração',

    categoria,

    categoria_display:
      normalizeText(
        celebration.categoria_display ??
        celebration.categoriaDisplay
      ),

    recorrencia:
      normalizeText(
        celebration.recorrencia
      ),

    recorrencia_display:
      normalizeText(
        celebration.recorrencia_display ??
        celebration.recorrenciaDisplay
      ),

    descricao_recorrencia:
      normalizeText(
        celebration.descricao_recorrencia ??
        celebration.descricaoRecorrencia
      ),

    dia:
      normalizeText(
        celebration.dia ??
        celebration.day
      ),

    dia_display:
      normalizeText(
        celebration.dia_display ??
        celebration.diaDisplay
      ),

    proxima_data:
      proximaData,

    proxima_data_iso:
      proximaDataIso,

    horario_inicio:
      horarioInicio,

    horario_fim:
      horarioFim,

    descricao:
      normalizeText(
        celebration.descricao ??
        celebration.description
      ),

    exige_agendamento:
      Boolean(
        celebration.exige_agendamento ??
        celebration.exigeAgendamento
      ),

    igreja_id:
      celebration.igreja_id ??
      celebration.igrejaId ??
      igreja?.id ??
      null,

    igreja_slug:
      normalizeText(
        celebration.igreja_slug ??
        celebration.igrejaSlug
      ) ||
      igreja?.slug ||
      '',

    igreja_nome:
      normalizeText(
        celebration.igreja_nome ??
        celebration.igrejaNome
      ) ||
      igreja?.nome ||
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
      async (
        celebrationOrId,
        category
      ) => {
        const key =
          getCelebrationKey(
            celebrationOrId,
            category
          );

        const existing =
          favoriteCelebrations.find(
            (item) => {
              if (key) {
                return (
                  item.favoriteKey ===
                  key
                );
              }

              return (
                String(item.id) ===
                String(
                  celebrationOrId
                )
              );
            }
          );

        if (existing) {
          await cancelCelebrationReminder(
            existing.notificationId
          );
        }

        setFavoriteCelebrations(
          (current) =>
            current.filter(
              (item) => {
                if (key) {
                  return (
                    item.favoriteKey !==
                    key
                  );
                }

                return (
                  String(item.id) !==
                  String(
                    celebrationOrId
                  )
                );
              }
            )
        );
      },
      [favoriteCelebrations]
    );


  const toggleCelebrationFavorite =
    useCallback(
      async (celebration) => {
        const normalizedCelebration =
          compactCelebration(
            celebration
          );

        if (!normalizedCelebration) {
          return {
            favorite: false,
            notificationScheduled:
              false,
          };
        }

        const existing =
          favoriteCelebrations.find(
            (item) =>
              item.favoriteKey ===
              normalizedCelebration
                .favoriteKey
          );

        /*
         * Já é favorita:
         * cancela a notificação e remove.
         */
        if (existing) {
          await cancelCelebrationReminder(
            existing.notificationId
          );

          setFavoriteCelebrations(
            (current) =>
              current.filter(
                (item) =>
                  item.favoriteKey !==
                  normalizedCelebration
                    .favoriteKey
              )
          );

          return {
            favorite: false,
            notificationScheduled:
              false,
          };
        }

        let notificationId = '';

        try {
          notificationId =
            await scheduleCelebrationReminder(
              celebration
            ) || '';
        } catch (error) {
          console.error(
            'Erro ao agendar lembrete:',
            error
          );
        }

        const favoriteWithNotification = {
          ...normalizedCelebration,
          notificationId,
        };

        setFavoriteCelebrations(
          (current) => {
            const alreadyExists =
              current.some(
                (item) =>
                  item.favoriteKey ===
                  favoriteWithNotification
                    .favoriteKey
              );

            if (alreadyExists) {
              return current;
            }

            return [
              favoriteWithNotification,
              ...current,
            ];
          }
        );

        return {
          favorite: true,

          notificationScheduled:
            Boolean(notificationId),
        };
      },
      [favoriteCelebrations]
    );


  const clearCelebrationFavorites =
    useCallback(async () => {
      await Promise.all(
        favoriteCelebrations.map(
          (celebration) =>
            cancelCelebrationReminder(
              celebration.notificationId
            )
        )
      );

      setFavoriteCelebrations([]);
    }, [favoriteCelebrations]);

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