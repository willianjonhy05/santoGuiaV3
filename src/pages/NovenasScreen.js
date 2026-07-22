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

import CollapsibleCelebrationFilters
  from '../components/CollapsibleCelebrationFilters';

import ScreenContainer
  from '../components/ScreenContainer';

import NextMassItem
  from '../components/NextMassItem';

import {
  getUpcomingNovenas,
} from '../services/UpcomingNovenasApi';

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


function getCelebrationKey(item) {
  return (
    `${item?.categoria ?? 'novena'}:` +
    `${item?.id ?? ''}`
  );
}


export default function NovenasScreen({
  navigation,
}) {
  const [
    novenas,
    setNovenas,
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
    error,
    setError,
  ] = useState('');


  const [
    totalFound,
    setTotalFound,
  ] = useState(0);


  const abortControllerRef =
    useRef(null);


  const requestIdRef =
    useRef(0);


  const loadNovenas =
    useCallback(
      async (
        filters,
        {
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


        if (mode === 'refresh') {
          setRefreshing(true);
          setError('');
        } else {
          setLoading(true);
          setError('');
          setNovenas([]);
          setTotalFound(0);
        }


        try {
          const response =
            await getUpcomingNovenas(
              {
                dia:
                  filters.dia,

                horarioDe:
                  filters.horarioDe,

                horarioAte:
                  filters.horarioAte,

                ordenar:
                  filters.ordenar,
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


          const resultados =
            Array.isArray(
              response?.resultados
            )
              ? response.resultados
              : [];


          setNovenas(
            resultados
          );


          setTotalFound(
            Number(
              response
                ?.total_encontrado ??
              resultados.length
            )
          );
        } catch (requestError) {
          if (
            requestError?.name ===
            'AbortError'
          ) {
            return;
          }


          console.error(
            'Erro ao carregar novenas:',
            requestError
          );


          const message =
            requestError?.message ||
            (
              'Não foi possível carregar ' +
              'as próximas novenas.'
            );


          if (mode === 'refresh') {
            Alert.alert(
              'Erro ao atualizar',
              message
            );
          } else {
            setNovenas([]);
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
          }
        }
      },
      []
    );


  useEffect(() => {
    loadNovenas(
      appliedFilters,
      {
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
    loadNovenas,
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


    setDraftFilters(
      cleanFilters
    );


    setAppliedFilters(
      cleanFilters
    );
  }


  function handleRefresh() {
    if (loading) {
      return;
    }


    loadNovenas(
      appliedFilters,
      {
        mode: 'refresh',
      }
    );
  }


  function handleRetry() {
    loadNovenas(
      appliedFilters,
      {
        mode: 'initial',
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


  function renderNovena({
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
      refreshing;


    return (
      <View>
        <Text style={styles.title}>
          Próximas novenas
        </Text>


        <Text style={styles.subtitle}>
          Encontre novenas por dia,
          horário e igreja.
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
          title="Filtrar novenas"
        />


        {!loading && !error ? (
          <View style={styles.resultsRow}>
            <Text style={styles.resultsText}>
              {totalFound === 1
                ? '1 novena encontrada'
                : (
                  `${totalFound} ` +
                  'novenas encontradas'
                )}
            </Text>
          </View>
        ) : null}


        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>
              Não foi possível carregar
            </Text>


            <Text style={styles.errorMessage}>
              {error}
            </Text>


            <Pressable
              onPress={handleRetry}
              accessibilityRole="button"
              accessibilityLabel={
                'Tentar carregar as novenas novamente'
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


            <Text style={styles.loadingText}>
              Carregando novenas...
            </Text>
          </View>
        ) : null}
      </View>
    );
  }


  function renderEmpty() {
    if (
      loading ||
      error
    ) {
      return null;
    }


    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>
          Nenhuma novena encontrada
        </Text>


        <Text style={styles.emptyText}>
          Altere o dia ou a faixa de
          horário para encontrar outras
          novenas.
        </Text>
      </View>
    );
  }


  return (
    <ScreenContainer>
      <FlatList
        data={
          error
            ? []
            : novenas
        }
        keyExtractor={
          getCelebrationKey
        }
        renderItem={
          renderNovena
        }
        ListHeaderComponent={
          renderHeader
        }
        ListEmptyComponent={
          renderEmpty
        }
        refreshing={
          refreshing
        }
        onRefresh={
          handleRefresh
        }
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
    marginTop:
      SPACING.md,

    color:
      COLORS.text,

    fontSize: 28,

    fontWeight: '900',
  },


  subtitle: {
    marginTop:
      SPACING.xs,

    marginBottom:
      SPACING.md,

    color:
      COLORS.textMuted,

    lineHeight: 20,
  },


  resultsRow: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',

    gap:
      SPACING.sm,

    marginBottom:
      SPACING.sm,
  },


  resultsText: {
    flex: 1,

    color:
      COLORS.textMuted,

    fontSize: 13,

    fontWeight: '600',
  },


  loading: {
    alignItems: 'center',

    justifyContent: 'center',

    paddingVertical:
      SPACING.xl,
  },


  loadingText: {
    marginTop:
      SPACING.sm,

    color:
      COLORS.textMuted,
  },


  errorCard: {
    marginBottom:
      SPACING.md,

    padding:
      SPACING.md,

    borderWidth: 1,

    borderColor:
      COLORS.primary,

    borderRadius:
      RADIUS.md,

    backgroundColor:
      COLORS.surface,
  },


  errorTitle: {
    color:
      COLORS.text,

    fontSize: 15,

    fontWeight: '800',
  },


  errorMessage: {
    marginTop:
      SPACING.xs,

    color:
      COLORS.textMuted,

    lineHeight: 20,
  },


  retryButton: {
    alignSelf:
      'flex-start',

    marginTop:
      SPACING.md,

    paddingHorizontal:
      SPACING.md,

    paddingVertical:
      SPACING.sm,

    borderRadius:
      RADIUS.sm,

    backgroundColor:
      COLORS.primary,
  },


  retryButtonText: {
    color:
      COLORS.surface,

    fontWeight: '800',
  },


  emptyCard: {
    alignItems: 'center',

    marginTop:
      SPACING.lg,

    padding:
      SPACING.lg,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    borderRadius:
      RADIUS.md,

    backgroundColor:
      COLORS.surface,
  },


  emptyTitle: {
    color:
      COLORS.text,

    fontSize: 16,

    fontWeight: '800',
  },


  emptyText: {
    marginTop:
      SPACING.xs,

    textAlign: 'center',

    color:
      COLORS.textMuted,

    lineHeight: 20,
  },


  pressed: {
    opacity: 0.72,
  },
});