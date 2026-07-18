import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';

import {
  useFavorites,
} from '../contexts/FavoritesContext';

import ScreenContainer
  from '../components/ScreenContainer';

import SearchBar
  from '../components/SearchBar';

import ChurchListItem
  from '../components/ChurchListItem';

import {
  ChurchApiError,
  getChurches,
} from '../services/ChurchApi';

import {
  COLORS,
  SPACING,
} from '../constants/theme';

export default function ChurchesScreen({
  navigation,
}) {
  const requestControllerRef =
    useRef(null);

  const [query, setQuery] =
    useState('');

  const [churches, setChurches] =
    useState([]);

  const [total, setTotal] =
    useState(0);

  const [nextPageUrl, setNextPageUrl] =
    useState(null);

  const [location, setLocation] =
    useState(null);

  const {
    isFavorite,
    toggleFavorite,
  } = useFavorites();

  const [
    locationResolved,
    setLocationResolved,
  ] = useState(false);

  const [
    locationStatus,
    setLocationStatus,
  ] = useState('loading');



  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [error, setError] =
    useState(null);

  const requestUserLocation =
    useCallback(async () => {
      setLocationStatus('loading');

      try {
        let permission =
          await Location
            .getForegroundPermissionsAsync();

        if (
          permission.status !==
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
          setLocation(null);
          setLocationStatus('denied');
          return;
        }

        let position =
          await Location
            .getLastKnownPositionAsync({
              maxAge: 5 * 60 * 1000,
              requiredAccuracy: 2000,
            });

        if (!position) {
          position =
            await Location
              .getCurrentPositionAsync({
                accuracy:
                  Location.Accuracy
                    .Balanced,
              });
        }

        setLocation({
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,
        });

        setLocationStatus('granted');
      } catch (locationError) {
        console.warn(
          'Erro ao obter localização:',
          locationError
        );

        setLocation(null);
        setLocationStatus(
          'unavailable'
        );
      } finally {
        setLocationResolved(true);
      }
    }, []);

  useEffect(() => {
    requestUserLocation();
  }, [requestUserLocation]);

  const loadFirstPage = useCallback(
    async ({
      refresh = false,
    } = {}) => {
      requestControllerRef.current
        ?.abort();

      const controller =
        new AbortController();

      requestControllerRef.current =
        controller;

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const response =
          await getChurches({
            search: query,

            latitude:
              location?.latitude,

            longitude:
              location?.longitude,

            signal: controller.signal,
          });

        setChurches(
          response.igrejas
        );

        setTotal(response.total);
        setNextPageUrl(response.next);
      } catch (requestError) {
        if (
          requestError?.name ===
          'AbortError'
        ) {
          return;
        }

        console.error(
          'Erro ao carregar igrejas:',
          requestError
        );

        setError(
          requestError instanceof
            ChurchApiError
            ? requestError.message
            : 'Não foi possível carregar as igrejas.'
        );
      } finally {
        if (
          requestControllerRef
            .current === controller
        ) {
          setLoading(false);
          setRefreshing(false);

          requestControllerRef.current =
            null;
        }
      }
    },
    [
      query,
      location?.latitude,
      location?.longitude,
    ]
  );

  /*
   * Aguarda a localização ser resolvida
   * antes de fazer a primeira chamada.
   *
   * Também aplica debounce de 450 ms
   * durante a busca.
   */
  useEffect(() => {
    if (!locationResolved) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      loadFirstPage();
    }, 450);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    locationResolved,
    loadFirstPage,
  ]);

  useEffect(
    () => () => {
      requestControllerRef.current
        ?.abort();
    },
    []
  );

  async function loadMoreChurches() {
    if (
      !nextPageUrl ||
      loading ||
      loadingMore ||
      refreshing
    ) {
      return;
    }

    setLoadingMore(true);

    try {
      const response =
        await getChurches({
          pageUrl: nextPageUrl,
        });

      setChurches((current) => {
        const existingIds = new Set(
          current.map((church) =>
            String(church.id)
          )
        );

        const newChurches =
          response.igrejas.filter(
            (church) =>
              !existingIds.has(
                String(church.id)
              )
          );

        return [
          ...current,
          ...newChurches,
        ];
      });

      setTotal(response.total);
      setNextPageUrl(response.next);
    } catch (requestError) {
      console.error(
        'Erro ao carregar mais igrejas:',
        requestError
      );
    } finally {
      setLoadingMore(false);
    }
  }



  function openChurch(church) {
    navigation.navigate(
      'ChurchDetails',
      {
        slug: church.slug,
      }
    );
  }

  function handleRefresh() {
    loadFirstPage({
      refresh: true,
    });
  }

  function retryLocation() {
    setLocationResolved(false);
    requestUserLocation();
  }

  const subtitle =
    locationStatus === 'granted'
      ? 'Ordenadas pela distância da sua localização.'
      : 'Em ordem alfabética. Ative a localização para ordenar pela distância.';

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>
          Igrejas
        </Text>

        <Text style={styles.subtitle}>
          {subtitle}
        </Text>

        {locationStatus ===
          'denied' ||
          locationStatus ===
          'unavailable' ? (
          <Pressable
            onPress={retryLocation}
            style={({ pressed }) => [
              styles.locationNotice,
              pressed &&
              styles.pressed,
            ]}
          >
            <Ionicons
              name="location-outline"
              size={20}
              color={COLORS.primary}
            />

            <View
              style={
                styles.locationContent
              }
            >
              <Text
                style={
                  styles.locationTitle
                }
              >
                Ativar localização
              </Text>

              <Text
                style={
                  styles.locationText
                }
              >
                Veja primeiro as igrejas
                mais próximas.
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={COLORS.primary}
            />
          </Pressable>
        ) : null}

        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por nome ou bairro"
        />

        {!loading && !error ? (
          <Text style={styles.resultCount}>
            {total}{' '}
            {total === 1
              ? 'igreja encontrada'
              : 'igrejas encontradas'}
          </Text>
        ) : null}
      </View>

      <FlatList
        data={churches}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={({ item }) => (
          <ChurchListItem
            church={item}
            isFavorite={isFavorite(item.id)}
            onFavoritePress={() =>
              toggleFavorite(item)
            }
            onPress={() =>
              navigation.navigate(
                'ChurchDetails',
                {
                  slug: item.slug,
                }
              )
            }
          />
        )}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,

          churches.length === 0 &&
          styles.emptyListContent,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={
          loadMoreChurches
        }
        onEndReachedThreshold={0.35}
        ListEmptyComponent={
          loading ? (
            <View style={styles.state}>
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
              />

              <Text
                style={styles.stateText}
              >
                Carregando igrejas...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.state}>
              <Ionicons
                name="alert-circle-outline"
                size={45}
                color={COLORS.primary}
              />

              <Text
                style={styles.stateTitle}
              >
                Não foi possível carregar
              </Text>

              <Text
                style={styles.stateText}
              >
                {error}
              </Text>

              <Pressable
                onPress={() =>
                  loadFirstPage()
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
          ) : (
            <View style={styles.state}>
              <Ionicons
                name="search-outline"
                size={42}
                color={COLORS.textMuted}
              />

              <Text
                style={styles.stateTitle}
              >
                Nenhuma igreja encontrada
              </Text>

              <Text
                style={styles.stateText}
              >
                Tente buscar por outro nome
                ou bairro.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator
                color={COLORS.primary}
              />

              <Text
                style={styles.footerText}
              >
                Carregando mais igrejas...
              </Text>
            </View>
          ) : null
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

  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
  },

  subtitle: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },

  locationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor:
      COLORS.surface,
  },

  locationContent: {
    flex: 1,
  },

  locationTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },

  locationText: {
    marginTop: 2,
    color: COLORS.textMuted,
    fontSize: 12,
  },

  resultCount: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  state: {
    flex: 1,
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },

  stateTitle: {
    marginTop: SPACING.md,
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },

  stateText: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    backgroundColor:
      COLORS.primary,
  },

  retryButtonText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: '800',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
  },

  footerText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },

  pressed: {
    opacity: 0.7,
  },
});