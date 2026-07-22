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

import * as Location from 'expo-location';

import CollapsibleCelebrationFilters
  from '../components/CollapsibleCelebrationFilters';

import ScreenContainer
  from '../components/ScreenContainer';

import NextMassItem
  from '../components/NextMassItem';

import {
  getUpcomingConfessions,
} from '../services/UpcomingConfessionsApi';

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
    `${item?.categoria ?? 'confissao'}:` +
    `${item?.id ?? ''}`
  );
}


function mergeCelebrations(current, incoming) {
  const existingKeys = new Set(
    current.map(getCelebrationKey)
  );

  const newItems = incoming.filter(
    item =>
      !existingKeys.has(
        getCelebrationKey(item)
      )
  );

  return [
    ...current,
    ...newItems,
  ];
}


export default function ConfessionsScreen({
  navigation,
}) {

  const [
    confessions,
    setConfessions,
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
    pagination,
    setPagination,
  ] = useState(
    INITIAL_PAGINATION
  );


  const abortControllerRef =
    useRef(null);


  const requestIdRef =
    useRef(0);


  const loadConfessions =
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


        try {

          const response =
            await getUpcomingConfessions(
              {
                pagina: page,
                ...filters,
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

            setConfessions(
              current =>
                mergeCelebrations(
                  current,
                  incoming
                )
            );

          } else {

            setConfessions(
              incoming
            );

          }


          const pageData =
            response.paginacao ?? {};


          setPagination({
            paginaAtual:
              Number(
                pageData.pagina_atual ??
                page
              ),

            totalPaginas:
              Number(
                pageData.total_paginas ??
                1
              ),

            temProxima:
              Boolean(
                pageData.tem_proxima
              ),

            temAnterior:
              Boolean(
                pageData.tem_anterior
              ),
          });


        } catch (error) {

          console.error(
            'Erro ao carregar confissões:',
            error
          );

          setError(
            error.message
          );


        } finally {

          setLoading(false);
          setRefreshing(false);
          setLoadingMore(false);

        }

      },
      []
    );


  useEffect(() => {

    loadConfessions(
      appliedFilters,
      {
        page:1,
        mode:'initial',
      }
    );


    return () => {
      abortControllerRef
        .current
        ?.abort();
    };

  }, [
    appliedFilters,
    loadConfessions,
  ]);



  function renderItem({item}) {

    return (
      <NextMassItem
        celebration={item}
        onPress={() =>
          navigation.navigate(
            'ChurchDetails',
            {
              slug:
                item?.igreja_slug
            }
          )
        }
      />
    );

  }



  return (
    <ScreenContainer>

      <FlatList

        data={
          error
            ? []
            : confessions
        }


        keyExtractor={
          getCelebrationKey
        }


        renderItem={
          renderItem
        }


        ListHeaderComponent={() => (

          <View>

            <Text style={styles.title}>
              Próximas confissões
            </Text>


            <Text style={styles.subtitle}>
              Encontre horários de confissões.
            </Text>


            <CollapsibleCelebrationFilters
              filters={draftFilters}
              onChangeFilter={
                (field,value)=>
                  setDraftFilters(
                    current=>({
                      ...current,
                      [field]:value
                    })
                  )
              }

              onApply={() =>
                setAppliedFilters(
                  draftFilters
                )
              }

              onClear={() => {
                setDraftFilters(
                  DEFAULT_FILTERS
                );

                setAppliedFilters(
                  DEFAULT_FILTERS
                );
              }}

              title="Filtrar confissões"
            />

          </View>

        )}


        ListEmptyComponent={() => (
          loading ? null :
          <Text>
            Nenhuma confissão encontrada.
          </Text>
        )}


        refreshing={refreshing}

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