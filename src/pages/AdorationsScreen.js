import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import * as Location
  from 'expo-location';

import CollapsibleCelebrationFilters
  from '../components/CollapsibleCelebrationFilters';

import ScreenContainer
  from '../components/ScreenContainer';

import NextMassItem
  from '../components/NextMassItem';

import {
  getUpcomingAdorations
} from '../services/UpcomingAdorationsApi';

import {
  COLORS,
  RADIUS,
  SPACING,
} from '../constants/theme';




const DEFAULT_FILTERS = {
  dia: '',
  horarioDe: '',
  horarioAte: '',
  ordenar: 'inicio',
};


const INITIAL_PAGINATION = {
  paginaAtual: 1,
  totalPaginas: 1,
  temProxima: false,
  temAnterior: false,
};


function getCelebrationKey(item) {
  return (
    `${item?.categoria ?? 'adoração'}:` +
    `${item?.id ?? ''}`
  );
}


function mergeCelebrations(
  current,
  incoming
) {
  const existingKeys =
    new Set(
      current.map(
        getCelebrationKey
      )
    );

  const newItems =
    incoming.filter(
      (item) =>
        !existingKeys.has(
          getCelebrationKey(item)
        )
    );

  return [
    ...current,
    ...newItems,
  ];
}


export default function AdorationsScreen({
  navigation,
}) {
  const [
    masses,
    setMasses,
  ] = useState([]);

  const [
    draftFilters,
    setDraftFilters,
  ] = useState({
    ...DEFAULT_FILTERS,
  });

  const [
    appliedFilters,
    setAppliedFilters,
  ] = useState({
    ...DEFAULT_FILTERS,
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    loadingMore,
    setLoadingMore,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const [
    loadMoreError,
    setLoadMoreError,
  ] = useState('');

  const [
    totalFound,
    setTotalFound,
  ] = useState(0);

  const [
    pagination,
    setPagination,
  ] = useState(
    INITIAL_PAGINATION
  );

  const abortControllerRef =
    useRef(null);

  const requestIdRef =
    useRef(0);

  const cachedLocationRef =
    useRef(null);


  const getUserLocation =
    useCallback(async () => {
      if (
        cachedLocationRef.current
      ) {
        return (
          cachedLocationRef.current
        );
      }

      const currentPermission =
        await Location
          .getForegroundPermissionsAsync();

      let permission =
        currentPermission;

      if (
        currentPermission.status !==
        'granted'
      ) {
        permission =
          await Location
            .requestForegroundPermissionsAsync();
      }

      if (
        permission.status !==
        'granted'
      ) {
        throw new Error(
          (
            'Permita o acesso à localização ' +
            'para ordenar as adorações por proximidade.'
          )
        );
      }

      const servicesEnabled =
        await Location
          .hasServicesEnabledAsync();

      if (!servicesEnabled) {
        throw new Error(
          (
            'Ative a localização do aparelho ' +
            'para ordenar as adorações por proximidade.'
          )
        );
      }

      const currentPosition =
        await Location
          .getCurrentPositionAsync({
            accuracy:
              Location.Accuracy.Balanced,
          });

      const location = {
        latitude:
          currentPosition
            .coords
            .latitude,

        longitude:
          currentPosition
            .coords
            .longitude,
      };

      cachedLocationRef.current =
        location;

      return location;
    }, []);


  const loadMasses =
    useCallback(
      async (
        filters,
        {
          page = 1,
          mode = 'initial',
        } = {}
      ) => {
        abortControllerRef
          .current
          ?.abort();

        const controller =
          new AbortController();

        abortControllerRef.current =
          controller;

        requestIdRef.current += 1;

        const requestId =
          requestIdRef.current;

        if (mode === 'more') {
          setLoadingMore(true);
          setLoadMoreError('');
        } else if (
          mode === 'refresh'
        ) {
          setRefreshing(true);
          setError('');
        } else {
          setLoading(true);
          setError('');
          setLoadMoreError('');
          setMasses([]);
          setTotalFound(0);

          setPagination({
            ...INITIAL_PAGINATION,
          });
        }

        try {
          let latitude;
          let longitude;

          if (
            filters.ordenar ===
            'proximidade'
          ) {
            const location =
              await getUserLocation();

            latitude =
              location.latitude;

            longitude =
              location.longitude;
          }

          const response =
            await getUpcomingAdorations(
              {
                pagina: page,

                dia:
                  filters.dia,

                horarioDe:
                  filters.horarioDe,

                horarioAte:
                  filters.horarioAte,

                ordenar:
                  filters.ordenar,

                latitude,
                longitude,
              },
              {
                signal:
                  controller.signal,
              }
            );

          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          const incoming =
            Array.isArray(
              response.resultados
            )
              ? response.resultados
              : [];

          if (mode === 'more') {
            setMasses(
              (current) =>
                mergeCelebrations(
                  current,
                  incoming
                )
            );
          } else {
            setMasses(incoming);
          }

          setTotalFound(
            Number(
              response
                .total_encontrado ??
              incoming.length
            )
          );

          const pageData =
            response.paginacao ?? {};

          setPagination({
            paginaAtual:
              Number(
                pageData
                  .pagina_atual ??
                page
              ),

            totalPaginas:
              Number(
                pageData
                  .total_paginas ??
                1
              ),

            temProxima:
              Boolean(
                pageData
                  .tem_proxima
              ),

            temAnterior:
              Boolean(
                pageData
                  .tem_anterior
              ),
          });
        } catch (requestError) {
          if (
            requestError?.name ===
            'AbortError'
          ) {
            return;
          }

          console.error(
            'Erro ao carregar adorações:',
            requestError
          );

          const message =
            requestError?.message ||
            (
              'Não foi possível carregar ' +
              'as próximas adorações.'
            );

          if (mode === 'more') {
            setLoadMoreError(
              message
            );
          } else if (
            mode === 'refresh'
          ) {
            Alert.alert(
              'Erro ao atualizar',
              message
            );
          } else {
            setMasses([]);
            setTotalFound(0);
            setError(message);
          }
        } finally {
          if (
            requestId ===
            requestIdRef.current
          ) {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
          }
        }
      },
      [getUserLocation]
    );


  useEffect(() => {
    loadMasses(
      appliedFilters,
      {
        page: 1,
        mode: 'initial',
      }
    );

    return () => {
      abortControllerRef
        .current
        ?.abort();
    };
  }, [
    appliedFilters,
    loadMasses,
  ]);


  function updateDraftFilter(
    field,
    value
  ) {
    setDraftFilters(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }


  function handleApplyFilters() {
    setAppliedFilters({
      ...draftFilters,
    });
  }


  function handleClearFilters() {
    const cleanFilters = {
      ...DEFAULT_FILTERS,
    };

    cachedLocationRef.current =
      null;

    setDraftFilters(
      cleanFilters
    );

    setAppliedFilters(
      cleanFilters
    );
  }


  function handleRefresh() {
    if (
      loading ||
      loadingMore
    ) {
      return;
    }

    if (
      appliedFilters.ordenar ===
      'proximidade'
    ) {
      cachedLocationRef.current =
        null;
    }

    loadMasses(
      appliedFilters,
      {
        page: 1,
        mode: 'refresh',
      }
    );
  }


  function handleLoadMore() {
    if (
      loading ||
      refreshing ||
      loadingMore ||
      !pagination.temProxima
    ) {
      return;
    }

    loadMasses(
      appliedFilters,
      {
        page:
          pagination
            .paginaAtual + 1,

        mode: 'more',
      }
    );
  }


  function handleRetryLoadMore() {
    if (
      loadingMore ||
      !pagination.temProxima
    ) {
      return;
    }

    loadMasses(
      appliedFilters,
      {
        page:
          pagination
            .paginaAtual + 1,

        mode: 'more',
      }
    );
  }


  function openChurch(
    celebration
  ) {
    const slug =
      celebration
        ?.igreja_slug ||
      celebration
        ?.igreja
        ?.slug;

    if (!slug) {
      Alert.alert(
        'Igreja não encontrada',
        (
          'Não foi possível abrir os ' +
          'detalhes desta igreja.'
        )
      );

      return;
    }

    navigation.navigate(
      'ChurchDetails',
      {
        slug,
      }
    );
  }


  function renderMass({
    item,
  }) {
    return (
      <NextMassItem
        celebration={item}
        onPress={() =>
          openChurch(item)
        }
      />
    );
  }


  function renderHeader() {
    const busy =
      loading ||
      refreshing ||
      loadingMore;

    return (
      <View>
        <Text style={styles.title}>
          Próximas adorações
        </Text>

        <Text style={styles.subtitle}>
          Encontre adorações normais e
          votivas por dia, horário ou
          proximidade.
        </Text>

        <CollapsibleCelebrationFilters
          filters={draftFilters}
          onChangeFilter={
            updateDraftFilter
          }
          onApply={
            handleApplyFilters
          }
          onClear={
            handleClearFilters
          }
          disabled={busy}
          title="Filtrar adorações"
        />

        {!loading && !error ? (
          <View style={styles.resultsRow}>
            <Text style={styles.resultsText}>
              {totalFound === 1
                ? '1 adoração encontrada'
                : `${totalFound} adorações encontradas`}
            </Text>

            {totalFound > 0 ? (
              <Text style={styles.pageText}>
                Página{' '}
                {pagination.paginaAtual}
                {' de '}
                {pagination.totalPaginas}
              </Text>
            ) : null}
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>
              Não foi possível carregar
            </Text>

            <Text
              style={
                styles.errorMessage
              }
            >
              {error}
            </Text>

            <Pressable
              onPress={() =>
                loadMasses(
                  appliedFilters,
                  {
                    page: 1,
                    mode: 'initial',
                  }
                )
              }
              style={({ pressed }) => [
                styles.retryButton,

                pressed &&
                styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.retryButtonText
                }
              >
                Tentar novamente
              </Text>
            </Pressable>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Carregando adorações...
            </Text>
          </View>
        ) : null}
      </View>
    );
  }


  function renderEmpty() {
    if (loading || error) {
      return null;
    }

    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>
          Nenhuma adoração encontrada
        </Text>

        <Text style={styles.emptyText}>
          Altere o dia ou a faixa de
          horário para encontrar outras
          celebrações.
        </Text>
      </View>
    );
  }


  function renderFooter() {
    if (loadingMore) {
      return (
        <View style={styles.loadingMore}>
          <ActivityIndicator
            color={COLORS.primary}
          />

          <Text
            style={
              styles.loadingMoreText
            }
          >
            Carregando mais adorações...
          </Text>
        </View>
      );
    }

    if (loadMoreError) {
      return (
        <View
          style={
            styles.loadMoreErrorCard
          }
        >
          <Text
            style={
              styles.loadMoreErrorText
            }
          >
            {loadMoreError}
          </Text>

          <Pressable
            onPress={
              handleRetryLoadMore
            }
            style={({ pressed }) => [
              styles.retryMoreButton,

              pressed &&
              styles.pressed,
            ]}
          >
            <Text
              style={
                styles.retryMoreButtonText
              }
            >
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      );
    }

    if (
      masses.length > 0 &&
      !pagination.temProxima
    ) {
      return (
        <Text style={styles.endText}>
          Todas as adorações foram carregadas.
        </Text>
      );
    }

    return null;
  }


  return (
    <ScreenContainer>
      <FlatList
        data={
          error
            ? []
            : masses
        }
        keyExtractor={
          getCelebrationKey
        }
        renderItem={renderMass}
        ListHeaderComponent={
          renderHeader
        }
        ListEmptyComponent={
          renderEmpty
        }
        ListFooterComponent={
          renderFooter
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={
          handleLoadMore
        }
        onEndReachedThreshold={0.35}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.listContent
        }
      />
    </ScreenContainer>
  );
}


const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
    paddingHorizontal:
      SPACING.md,
    paddingBottom:
      SPACING.xl,
  },

  title: {
    marginTop: SPACING.md,
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
  },

  subtitle: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
    color: COLORS.textMuted,
    lineHeight: 20,
  },



  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },

  resultsText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },

  pageText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },

  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical:
      SPACING.xl,
  },

  loadingText: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
  },

  loadingMore: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical:
      SPACING.lg,
  },

  loadingMoreText: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
  },

  errorCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    backgroundColor:
      COLORS.surface,
  },

  errorTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },

  errorMessage: {
    marginTop: SPACING.xs,
    color: COLORS.textMuted,
    lineHeight: 20,
  },

  retryButton: {
    alignSelf: 'flex-start',
    marginTop: SPACING.md,
    paddingHorizontal:
      SPACING.md,
    paddingVertical:
      SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor:
      COLORS.primary,
  },

  retryButtonText: {
    color: COLORS.surface,
    fontWeight: '800',
  },

  loadMoreErrorCard: {
    alignItems: 'center',
    paddingVertical:
      SPACING.lg,
  },

  loadMoreErrorText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    lineHeight: 19,
  },

  retryMoreButton: {
    marginTop: SPACING.sm,
    paddingHorizontal:
      SPACING.md,
    paddingVertical:
      SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor:
      COLORS.primary,
  },

  retryMoreButtonText: {
    color: COLORS.surface,
    fontWeight: '800',
  },

  emptyCard: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor:
      COLORS.surface,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },

  emptyText: {
    marginTop: SPACING.xs,
    textAlign: 'center',
    color: COLORS.textMuted,
    lineHeight: 20,
  },

  endText: {
    paddingVertical:
      SPACING.lg,
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 12,
  },

  pressed: {
    opacity: 0.72,
  },

  disabled: {
    opacity: 0.55,
  },
});