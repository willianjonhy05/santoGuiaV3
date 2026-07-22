import {
    FlatList,
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
    getUpcomingWordCelebrations,
} from '../services/UpcomingWordCelebrationsApi';


import {
    COLORS,
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

        `${item?.categoria ?? 'palavra'}:` +

        `${item?.id ?? ''}`

    );

}



export default function WordCelebrationsScreen({

    navigation,

}) {


    const [

        celebrations,

        setCelebrations,

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

        error,

        setError,

    ] = useState('');



    const abortControllerRef =

        useRef(null);





    const loadCelebrations =

        useCallback(

            async () => {


                try {


                    const controller =

                        new AbortController();



                    abortControllerRef.current =

                        controller;



                    const response =

                        await getUpcomingWordCelebrations(

                            appliedFilters,

                            {

                                signal:

                                    controller.signal,

                            }

                        );



                    setCelebrations(

                        Array.isArray(

                            response.resultados

                        )

                            ?

                            response.resultados

                            :

                            []

                    );



                } catch (err) {


                    console.error(

                        'Erro ao carregar celebrações da palavra:',

                        err

                    );


                    setError(

                        err.message

                    );


                } finally {


                    setLoading(false);


                }


            },

            [

                appliedFilters

            ]

        );





    useEffect(() => {


        loadCelebrations();



        return () => {


            abortControllerRef

                .current

                ?.abort();



        };


    }, [

        loadCelebrations

    ]);





    return (


        <ScreenContainer>


            <FlatList



                data={

                    error

                        ?

                        []

                        :

                        celebrations

                }



                keyExtractor={

                    getCelebrationKey

                }



                renderItem={

                    ({ item }) => (


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


                    )

                }



                ListHeaderComponent={() => (


                    <View>


                        <Text style={styles.title}>

                            Próximas celebrações da Palavra

                        </Text>



                        <Text style={styles.subtitle}>

                            Encontre celebrações da Palavra próximas.

                        </Text>



                        <CollapsibleCelebrationFilters


                            filters={draftFilters}


                            onChangeFilter={

                                (field, value) =>

                                    setDraftFilters(

                                        current => ({

                                            ...current,

                                            [field]: value

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



                            title="Filtrar celebrações da Palavra"


                        />


                    </View>


                )}



                ListEmptyComponent={() =>


                    loading

                        ?

                        null

                        :

                        <Text>

                            Nenhuma celebração encontrada.

                        </Text>


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