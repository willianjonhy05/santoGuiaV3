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

import Ionicons from '@expo/vector-icons/Ionicons';

import ScreenContainer
  from '../components/ScreenContainer';

import SearchBar
  from '../components/SearchBar';

import ChurchListItem
  from '../components/ChurchListItem';

import {
  useFavorites,
} from '../contexts/FavoritesContext';

import {
  COLORS,
  SPACING,
} from '../constants/theme';

export default function FavoritesScreen({
  navigation,
}) {
  const [query, setQuery] =
    useState('');

  const {
    favorites,
    isReady,
    isFavorite,
    toggleFavorite,
    clearFavorites,
  } = useFavorites();

  const filteredFavorites =
    useMemo(() => {
      const normalizedQuery =
        query.trim().toLowerCase();

      if (!normalizedQuery) {
        return favorites;
      }

      return favorites.filter(
        (church) => {
          const searchableText = [
            church.nome,
            church.endereco,
            church.bairro,
            church.cidade,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          return searchableText.includes(
            normalizedQuery
          );
        }
      );
    }, [favorites, query]);

  function openChurch(church) {
    navigation.navigate(
      'ChurchDetails',
      {
        slug: church.slug,
      }
    );
  }

  function confirmClearFavorites() {
    if (favorites.length === 0) {
      return;
    }

    Alert.alert(
      'Limpar favoritos',
      'Deseja remover todas as igrejas dos favoritos?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover todas',
          style: 'destructive',
          onPress: clearFavorites,
        },
      ]
    );
  }

  if (!isReady) {
    return (
      <ScreenContainer>
        <View style={styles.loading}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text style={styles.loadingText}>
            Carregando favoritos...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleContent}>
            <Text style={styles.title}>
              Igrejas favoritas
            </Text>

            <Text style={styles.subtitle}>
              {favorites.length}{' '}
              {favorites.length === 1
                ? 'igreja salva'
                : 'igrejas salvas'}
            </Text>
          </View>

          {favorites.length > 0 ? (
            <Pressable
              onPress={
                confirmClearFavorites
              }
              accessibilityRole="button"
              accessibilityLabel="Remover todas as igrejas favoritas"
              hitSlop={10}
              style={({ pressed }) => [
                styles.clearButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="trash-outline"
                size={21}
                color={COLORS.primary}
              />
            </Pressable>
          ) : null}
        </View>

        {favorites.length > 0 ? (
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar nos favoritos"
          />
        ) : null}
      </View>

      <FlatList
        data={filteredFavorites}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={({ item }) => (
          <ChurchListItem
            church={item}
            isFavorite={isFavorite(
              item.id
            )}
            onFavoritePress={() =>
              toggleFavorite(item)
            }
            onPress={() =>
              openChurch(item)
            }
          />
        )}
        contentContainerStyle={[
          styles.listContent,

          filteredFavorites.length ===
            0 &&
            styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          query.trim() ? (
            <View style={styles.empty}>
              <Ionicons
                name="search-outline"
                size={48}
                color={COLORS.textMuted}
              />

              <Text style={styles.emptyTitle}>
                Nenhuma favorita encontrada
              </Text>

              <Text style={styles.emptyText}>
                Tente pesquisar por outro
                nome ou bairro.
              </Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <View
                style={
                  styles.emptyIcon
                }
              >
                <Ionicons
                  name="heart-outline"
                  size={45}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.emptyTitle}>
                Nenhuma igreja favorita
              </Text>

              <Text style={styles.emptyText}>
                Toque no coração de uma
                igreja para adicioná-la à
                sua lista de favoritas.
              </Text>

              <Pressable
                onPress={() =>
                  navigation.navigate(
                    'Igrejas'
                  )
                }
                style={({ pressed }) => [
                  styles.exploreButton,
                  pressed &&
                    styles.pressed,
                ]}
              >
                <Ionicons
                  name="business-outline"
                  size={18}
                  color={COLORS.surface}
                />

                <Text
                  style={
                    styles.exploreButtonText
                  }
                >
                  Encontrar igrejas
                </Text>
              </Pressable>
            </View>
          )
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.md,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },

  titleContent: {
    flex: 1,
  },

  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
  },

  subtitle: {
    marginTop: SPACING.xs,
    color: COLORS.textMuted,
    fontSize: 14,
  },

  clearButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    backgroundColor:
      COLORS.surface,
  },

  listContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },

  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textMuted,
    fontSize: 14,
  },

  empty: {
    flex: 1,
    minHeight: 420,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },

  emptyIcon: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 41,
    backgroundColor:
      `${COLORS.primary}12`,
  },

  emptyTitle: {
    marginTop: SPACING.md,
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyText: {
    maxWidth: 290,
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },

  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 13,
    backgroundColor:
      COLORS.primary,
  },

  exploreButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.7,
  },
});