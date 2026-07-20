import {
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons
  from '@expo/vector-icons/Ionicons';

import ScreenContainer
  from '../components/ScreenContainer';

import SearchBar
  from '../components/SearchBar';

import NextMassItem
  from '../components/NextMassItem';

import {
  useFavorites,
} from '../contexts/FavoritesContext';

import {
  COLORS,
  SPACING,
} from '../constants/theme';


function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .trim()
    .toLowerCase();
}


function getCelebrationKey(
  celebration
) {
  if (
    celebration?.favoriteKey
  ) {
    return String(
      celebration.favoriteKey
    );
  }

  return (
    `${celebration?.categoria ?? 'celebracao'}:` +
    `${celebration?.id ?? ''}`
  );
}


function getChurchSlug(
  celebration
) {
  return (
    celebration?.igrejaSlug ||
    celebration?.igreja_slug ||
    celebration?.igreja?.slug ||
    celebration?.churchSlug ||
    null
  );
}


function getChurchName(
  celebration
) {
  return (
    celebration?.igrejaNome ||
    celebration?.igreja_nome ||
    celebration?.igreja?.nome ||
    celebration?.churchName ||
    ''
  );
}


function getCategoryText(
  celebration
) {
  return (
    celebration?.categoriaDisplay ||
    celebration?.categoria_display ||
    celebration?.categoria ||
    ''
  );
}


function getDayText(
  celebration
) {
  return (
    celebration?.diaDisplay ||
    celebration?.dia_display ||
    celebration?.dia ||
    ''
  );
}


function getTimeText(
  celebration
) {
  return (
    celebration?.horarioInicio ||
    celebration?.horario_inicio ||
    celebration?.time ||
    ''
  );
}


export default function
FavoriteCelebrationsScreen({
  navigation,
}) {
  const [
    query,
    setQuery,
  ] = useState('');

  const [
    clearing,
    setClearing,
  ] = useState(false);

  const favoritesContext =
    useFavorites();

  /*
   * Compatibilidade com diferentes nomes
   * que podem existir no FavoritesContext.
   */
  const celebrationsSource =
    favoritesContext
      .favoriteCelebrations ??
    favoritesContext
      .celebrationFavorites ??
    favoritesContext
      .favoritesCelebrations ??
    [];

  const favoriteCelebrations =
    Array.isArray(
      celebrationsSource
    )
      ? celebrationsSource
      : [];

  const isReady =
    favoritesContext.isReady ??
    true;

  const toggleCelebrationFavorite =
    favoritesContext
      .toggleCelebrationFavorite;

  const clearCelebrationFavorites =
    favoritesContext
      .clearCelebrationFavorites ??
    favoritesContext
      .clearFavoriteCelebrations ??
    favoritesContext
      .clearFavoritesCelebrations;


  const filteredCelebrations =
    useMemo(() => {
      const normalizedQuery =
        normalizeSearchText(
          query
        );

      if (!normalizedQuery) {
        return favoriteCelebrations;
      }

      return (
        favoriteCelebrations.filter(
          (celebration) => {
            const searchableText =
              [
                celebration?.nome,

                getChurchName(
                  celebration
                ),

                getCategoryText(
                  celebration
                ),

                getDayText(
                  celebration
                ),

                getTimeText(
                  celebration
                ),

                celebration
                  ?.descricao,

                celebration
                  ?.descricaoRecorrencia,

                celebration
                  ?.descricao_recorrencia,

                celebration
                  ?.igrejaBairro,

                celebration
                  ?.igreja_bairro,

                celebration
                  ?.igrejaCidade,

                celebration
                  ?.igreja_cidade,
              ]
                .filter(Boolean)
                .join(' ');

            return normalizeSearchText(
              searchableText
            ).includes(
              normalizedQuery
            );
          }
        )
      );
    }, [
      favoriteCelebrations,
      query,
    ]);


  function openChurch(
    celebration
  ) {
    const slug =
      getChurchSlug(
        celebration
      );

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


  async function
  handleClearCelebrations() {
    if (
      favoriteCelebrations.length ===
      0
    ) {
      return;
    }

    setClearing(true);

    try {
      if (
        typeof clearCelebrationFavorites ===
        'function'
      ) {
        await clearCelebrationFavorites();

        return;
      }

      /*
       * Alternativa para contextos que ainda
       * não possuem uma função de limpeza.
       */
      if (
        typeof toggleCelebrationFavorite ===
        'function'
      ) {
        for (
          const celebration
          of favoriteCelebrations
        ) {
          await toggleCelebrationFavorite(
            celebration
          );
        }

        return;
      }

      throw new Error(
        (
          'A função para limpar as ' +
          'celebrações favoritas não foi encontrada.'
        )
      );
    } catch (error) {
      console.error(
        (
          'Erro ao limpar celebrações ' +
          'favoritas:'
        ),
        error
      );

      Alert.alert(
        'Não foi possível limpar',
        (
          error?.message ||
          (
            'Ocorreu um erro ao remover ' +
            'as celebrações favoritas.'
          )
        )
      );
    } finally {
      setClearing(false);
    }
  }


  function confirmClearFavorites() {
    if (
      favoriteCelebrations.length ===
      0 ||
      clearing
    ) {
      return;
    }

    Alert.alert(
      'Limpar celebrações favoritas',
      (
        'Deseja remover todas as ' +
        'celebrações dos favoritos e ' +
        'cancelar seus lembretes?'
      ),
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover todas',
          style: 'destructive',

          onPress:
            handleClearCelebrations,
        },
      ]
    );
  }


  function renderCelebration({
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


  function renderEmpty() {
    if (query.trim()) {
      return (
        <View style={styles.empty}>
          <Ionicons
            name="search-outline"
            size={48}
            color={
              COLORS.textMuted
            }
          />

          <Text
            style={
              styles.emptyTitle
            }
          >
            Nenhuma celebração encontrada
          </Text>

          <Text
            style={
              styles.emptyText
            }
          >
            Tente pesquisar pelo nome da
            celebração, igreja, categoria,
            dia ou horário.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.empty}>
        <View
          style={
            styles.emptyIcon
          }
        >
          <Ionicons
            name="calendar-outline"
            size={43}
            color={
              COLORS.primary
            }
          />

          <View
            style={
              styles.emptyHeart
            }
          >
            <Ionicons
              name="heart"
              size={17}
              color={
                COLORS.primary
              }
            />
          </View>
        </View>

        <Text
          style={
            styles.emptyTitle
          }
        >
          Nenhuma celebração favorita
        </Text>

        <Text
          style={
            styles.emptyText
          }
        >
          Toque no coração de uma missa,
          confissão, adoração, novena ou
          outra celebração para salvá-la
          e ativar seu lembrete.
        </Text>

        <Pressable
          onPress={() =>
            navigation.navigate(
              'Missas'
            )
          }
          style={({ pressed }) => [
            styles.exploreButton,

            pressed &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={
              COLORS.surface
            }
          />

          <Text
            style={
              styles.exploreButtonText
            }
          >
            Encontrar celebrações
          </Text>
        </Pressable>
      </View>
    );
  }


  if (!isReady) {
    return (
      <ScreenContainer>
        <View style={styles.loading}>
          <ActivityIndicator
            size="large"
            color={
              COLORS.primary
            }
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Carregando celebrações
            favoritas...
          </Text>
        </View>
      </ScreenContainer>
    );
  }


  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View
            style={
              styles.titleContent
            }
          >
            <Text style={styles.title}>
              Celebrações favoritas
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              {
                favoriteCelebrations
                  .length
              }{' '}

              {
                favoriteCelebrations
                  .length === 1
                  ? 'celebração salva'
                  : 'celebrações salvas'
              }
            </Text>
          </View>

          {favoriteCelebrations
            .length > 0 ? (
            <Pressable
              onPress={
                confirmClearFavorites
              }
              disabled={clearing}
              accessibilityRole="button"
              accessibilityLabel={
                (
                  'Remover todas as ' +
                  'celebrações favoritas'
                )
              }
              hitSlop={10}
              style={({ pressed }) => [
                styles.clearButton,

                pressed &&
                  styles.pressed,

                clearing &&
                  styles.disabled,
              ]}
            >
              {clearing ? (
                <ActivityIndicator
                  size="small"
                  color={
                    COLORS.primary
                  }
                />
              ) : (
                <Ionicons
                  name="trash-outline"
                  size={21}
                  color={
                    COLORS.primary
                  }
                />
              )}
            </Pressable>
          ) : null}
        </View>

        {favoriteCelebrations
          .length > 0 ? (
          <SearchBar
            value={query}
            onChangeText={
              setQuery
            }
            placeholder={
              'Buscar nas celebrações'
            }
          />
        ) : null}
      </View>

      <FlatList
        data={
          filteredCelebrations
        }
        keyExtractor={
          getCelebrationKey
        }
        renderItem={
          renderCelebration
        }
        contentContainerStyle={[
          styles.listContent,

          filteredCelebrations
            .length === 0 &&
            styles
              .emptyListContent,
        ]}
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          renderEmpty
        }
      />
    </ScreenContainer>
  );
}


const styles = StyleSheet.create({
  header: {
    paddingTop:
      SPACING.md,

    paddingHorizontal:
      SPACING.md,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom:
      SPACING.md,
  },

  titleContent: {
    flex: 1,
    paddingRight:
      SPACING.sm,
  },

  title: {
    color:
      COLORS.text,

    fontSize: 28,
    fontWeight: '900',
  },

  subtitle: {
    marginTop:
      SPACING.xs,

    color:
      COLORS.textMuted,

    fontSize: 14,
  },

  clearButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor:
      COLORS.border,

    borderRadius: 13,
    backgroundColor:
      COLORS.surface,
  },

  listContent: {
    paddingHorizontal:
      SPACING.md,

    paddingTop:
      SPACING.md,

    paddingBottom:
      SPACING.xl,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding:
      SPACING.xl,
  },

  loadingText: {
    marginTop:
      SPACING.md,

    color:
      COLORS.textMuted,

    fontSize: 14,
    textAlign: 'center',
  },

  empty: {
    flex: 1,
    minHeight: 420,
    alignItems: 'center',
    justifyContent: 'center',
    padding:
      SPACING.xl,
  },

  emptyIcon: {
    position: 'relative',
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 41,
    backgroundColor:
      `${COLORS.primary}12`,
  },

  emptyHeart: {
    position: 'absolute',
    right: 13,
    bottom: 13,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor:
      COLORS.background,

    borderRadius: 13,
    backgroundColor:
      COLORS.surface,
  },

  emptyTitle: {
    marginTop:
      SPACING.md,

    color:
      COLORS.text,

    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyText: {
    maxWidth: 310,
    marginTop:
      SPACING.sm,

    color:
      COLORS.textMuted,

    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },

  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop:
      SPACING.lg,

    paddingHorizontal:
      SPACING.lg,

    paddingVertical:
      SPACING.md,

    borderRadius: 13,
    backgroundColor:
      COLORS.primary,
  },

  exploreButtonText: {
    color:
      COLORS.surface,

    fontSize: 14,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.7,
  },

  disabled: {
    opacity: 0.5,
  },
});