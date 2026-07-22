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



function getCelebrationKey(item) {

  return (
    `${item?.categoria ?? 'confissao'}:` +
    `${item?.id ?? ''}`
  );

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




  const loadConfessions =
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

          setConfessions([]);

          setTotalFound(0);

        }




        try {


          const response =
            await getUpcomingConfessions(

              {
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




          const resultados =
            Array.isArray(
              response?.resultados
            )

              ?

              response.resultados

              :

              [];




          setConfessions(
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

            'Erro ao carregar confissões:',

            requestError

          );




          const message =

            requestError?.message ||

            (
              'Não foi possível carregar ' +
              'as próximas confissões.'
            );




          if (mode === 'refresh') {

            Alert.alert(

              'Erro ao atualizar',

              message

            );


          } else {


            setConfessions([]);

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


    loadConfessions(

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

    loadConfessions,

  ]);

    function updateDraftFilter(
    field,
    value
  ) {

    setDraftFilters(
      current => ({
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


    loadConfessions(
      appliedFilters,
      {
        mode: 'refresh',
      }
    );

  }




  function handleRetry() {

    loadConfessions(
      appliedFilters,
      {
        mode: 'initial',
      }
    );

  }




  function openChurch(
    confession
  ) {

    const slug =
      confession?.igreja_slug ||
      confession?.igreja?.slug;



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




  function renderConfession({
    item,
  }) {

    return (

      <NextMassItem

        celebration={
          item
        }


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

          Próximas confissões

        </Text>



        <Text style={styles.subtitle}>

          Encontre horários de confissões
          por dia, horário e igreja.

        </Text>




        <CollapsibleCelebrationFilters

          filters={
            draftFilters
          }


          onChangeFilter={
            updateDraftFilter
          }


          onApply={
            handleApplyFilters
          }


          onClear={
            handleClearFilters
          }


          disabled={
            busy
          }


          title="Filtrar confissões"

        />




        {!loading && !error ? (

          <View style={styles.resultsRow}>

            <Text style={styles.resultsText}>

              {
                totalFound === 1

                  ?

                  '1 confissão encontrada'

                  :

                  `${totalFound} confissões encontradas`
              }

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

              onPress={
                handleRetry
              }


              style={({pressed}) => [

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

              color={
                COLORS.primary
              }

            />



            <Text style={styles.loadingText}>

              Carregando confissões...

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

          Nenhuma confissão encontrada

        </Text>




        <Text style={styles.emptyText}>

          Altere o dia ou horário para
          encontrar outras confissões.

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
            : confessions
        }


        keyExtractor={
          getCelebrationKey
        }


        renderItem={
          renderConfession
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

    fontSize:
      28,

    fontWeight:
      '900',

  },



  subtitle: {

    marginTop:
      SPACING.xs,

    marginBottom:
      SPACING.md,

    color:
      COLORS.textMuted,

    lineHeight:
      20,

  },



  resultsRow: {

    marginBottom:
      SPACING.sm,

  },



  resultsText: {

    color:
      COLORS.textMuted,

    fontSize:
      13,

    fontWeight:
      '600',

  },



  loading: {

    alignItems:
      'center',

    justifyContent:
      'center',

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

    borderWidth:
      1,

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

    fontSize:
      15,

    fontWeight:
      '800',

  },



  errorMessage: {

    marginTop:
      SPACING.xs,

    color:
      COLORS.textMuted,

    lineHeight:
      20,

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

    fontWeight:
      '800',

  },



  emptyCard: {

    alignItems:
      'center',

    marginTop:
      SPACING.lg,

    padding:
      SPACING.lg,

    borderWidth:
      1,

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

    fontSize:
      16,

    fontWeight:
      '800',

  },



  emptyText: {

    marginTop:
      SPACING.xs,

    textAlign:
      'center',

    color:
      COLORS.textMuted,

    lineHeight:
      20,

  },



  pressed: {

    opacity:
      0.72,

  },

});