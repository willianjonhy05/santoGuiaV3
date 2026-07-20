import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as Location from 'expo-location';

import ScreenContainer
  from '../components/ScreenContainer';

import SectionTitle
  from '../components/SectionTitle';

import NewsCard
  from '../components/NewsCard';

import ShortcutCard
  from '../components/ShortcutCard';

import NextMassItem
  from '../components/NextMassItem';

import NearbyChurchesSection
  from '../components/NearbyChurchesSection';

import {
  getLatestNews,
  LatestNewsApiError,
} from '../services/LatestNews';

import {
  getAllNearbyCelebrations,
  NearbyCelebrationsApiError,
} from '../services/NearbyCelebrationsApi';

import {
  COLORS,
  RADIUS,
  SPACING,
} from '../constants/theme';


const EMPTY_CELEBRATIONS = {
  missas: [],
  confissoes: [],
  adoracoes: [],
};


function NearbyCelebrationSection({
  title,
  actionLabel,
  onActionPress,
  celebrations,
  loading,
  error,
  onRetry,
  onCelebrationPress,
  limit = 3,
}) {
  const visibleCelebrations = Array.isArray(
    celebrations
  )
    ? celebrations.slice(0, limit)
    : [];

  return (
    <View style={styles.section}>
      <SectionTitle
        title={title}
        actionLabel={actionLabel}
        onActionPress={onActionPress}
      />

      {loading ? (
        <View style={styles.celebrationState}>
          <ActivityIndicator
            color={COLORS.primary}
          />

          <Text
            style={
              styles.celebrationStateText
            }
          >
            Buscando celebrações próximas...
          </Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.celebrationState}>
          <Text
            style={
              styles.celebrationErrorText
            }
          >
            {error}
          </Text>

          <Pressable
            onPress={onRetry}
            style={({ pressed }) => [
              styles.retryButton,
              pressed &&
                styles.buttonPressed,
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

      {!loading &&
      !error &&
      visibleCelebrations.length === 0 ? (
        <View style={styles.celebrationState}>
          <Text
            style={
              styles.celebrationStateText
            }
          >
            Nenhuma celebração próxima foi
            encontrada.
          </Text>
        </View>
      ) : null}

      {!loading &&
      !error &&
      visibleCelebrations.map(
        (celebration) => (
          <NextMassItem
            key={String(
              celebration.id
            )}
            celebration={celebration}
            onPress={() =>
              onCelebrationPress(
                celebration
              )
            }
          />
        )
      )}
    </View>
  );
}


export default function HomeScreen({
  navigation,
}) {
  const [latestNews, setLatestNews] =
    useState([]);

  const [newsLoading, setNewsLoading] =
    useState(true);

  const [newsError, setNewsError] =
    useState(null);

  const [
    nearbyCelebrations,
    setNearbyCelebrations,
  ] = useState(EMPTY_CELEBRATIONS);

  const [
    celebrationsLoading,
    setCelebrationsLoading,
  ] = useState(true);

  const [
    celebrationsError,
    setCelebrationsError,
  ] = useState(null);


  const loadLatestNews = useCallback(
    async ({
      ignoreCache = false,
      signal,
    } = {}) => {
      try {
        setNewsError(null);

        const response =
          await getLatestNews({
            ignoreCache,
            signal,
          });

        setLatestNews(response);
      } catch (error) {
        if (
          error?.name === 'AbortError'
        ) {
          return;
        }

        const message =
          error instanceof
            LatestNewsApiError
            ? error.message
            : (
              'Não foi possível carregar ' +
              'as notícias.'
            );

        setNewsError(message);
      } finally {
        setNewsLoading(false);
      }
    },
    []
  );


  const loadNearbyCelebrations =
    useCallback(
      async ({
        signal,
      } = {}) => {
        setCelebrationsLoading(true);
        setCelebrationsError(null);

        try {
          const permission =
            await Location
              .requestForegroundPermissionsAsync();

          if (
            permission.status !==
            'granted'
          ) {
            throw new Error(
              'Permita o acesso à sua ' +
              'localização para visualizar ' +
              'as celebrações próximas.'
            );
          }

          const currentLocation =
            await Location
              .getCurrentPositionAsync({
                accuracy:
                  Location.Accuracy
                    .Balanced,
              });

          if (signal?.aborted) {
            return;
          }

          const {
            latitude,
            longitude,
          } = currentLocation.coords;

          const result =
            await getAllNearbyCelebrations(
              latitude,
              longitude,
              {
                signal,
              }
            );

          setNearbyCelebrations({
            missas: Array.isArray(
              result?.missas
            )
              ? result.missas
              : [],

            confissoes: Array.isArray(
              result?.confissoes
            )
              ? result.confissoes
              : [],

            adoracoes: Array.isArray(
              result?.adoracoes
            )
              ? result.adoracoes
              : [],
          });
        } catch (error) {
          if (
            error?.name === 'AbortError'
          ) {
            return;
          }

          console.error(
            'Erro ao carregar celebrações:',
            error
          );

          const message =
            error instanceof
              NearbyCelebrationsApiError
              ? error.message
              : (
                error?.message ||
                'Não foi possível carregar ' +
                'as celebrações próximas.'
              );

          setCelebrationsError(message);
        } finally {
          if (!signal?.aborted) {
            setCelebrationsLoading(false);
          }
        }
      },
      []
    );


  useEffect(() => {
    const newsController =
      new AbortController();

    const celebrationsController =
      new AbortController();

    loadLatestNews({
      signal: newsController.signal,
    });

    loadNearbyCelebrations({
      signal:
        celebrationsController.signal,
    });

    return () => {
      newsController.abort();
      celebrationsController.abort();
    };
  }, [
    loadLatestNews,
    loadNearbyCelebrations,
  ]);


  function openCelebrationChurch(
    celebration
  ) {
    const slug =
      celebration?.igreja_slug ||
      celebration?.igreja?.slug;

    if (!slug) {
      Alert.alert(
        'Igreja indisponível',
        'Não foi possível identificar ' +
        'a igreja desta celebração.'
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


  function retryCelebrations() {
    loadNearbyCelebrations();
  }


  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <View
          style={
            styles.logoContainer
          }
        >
          <Image
            source={require(
              '../../assets/logo_oficial.png'
            )}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="SantoGuia"
          />
        </View>

        <Text style={styles.title}>
          Encontre sua próxima celebração
        </Text>

        <Text style={styles.subtitle}>
          Igrejas, missas, orações e vida
          católica em um só lugar.
        </Text>

        <NearbyChurchesSection
          onSeeAll={() =>
            navigation.navigate(
              'Igrejas'
            )
          }
          onOpenChurch={(church) =>
            navigation.navigate(
              'ChurchDetails',
              {
                slug: church.slug,
              }
            )
          }
        />

        <View style={styles.section}>
          <SectionTitle
            title="Acesso rápido"
          />

          <View
            style={
              styles.shortcutsGrid
            }
          >
            <ShortcutCard
              title="Exame de Consciência"
              icon="checkmark-circle-outline"
              onPress={() =>
                navigation.navigate(
                  'ExaminationOfConscience'
                )
              }
            />

            <ShortcutCard
              title="Santo do Dia"
              icon="sunny-outline"
              onPress={() =>
                navigation.navigate(
                  'SaintOfDay'
                )
              }
            />

            <ShortcutCard
              title="Liturgia Diária"
              icon="reader-outline"
              onPress={() =>
                navigation.navigate(
                  'Liturgy'
                )
              }
            />

            <ShortcutCard
              title="Orações"
              icon="book-outline"
              onPress={() =>
                navigation.navigate(
                  'Orações'
                )
              }
            />
          </View>
        </View>

        <NearbyCelebrationSection
          title="Próximas missas"
          actionLabel="Ver agenda"
          onActionPress={() =>
            navigation.navigate(
              'Missas'
            )
          }
          celebrations={
            nearbyCelebrations.missas
          }
          loading={
            celebrationsLoading
          }
          error={celebrationsError}
          onRetry={retryCelebrations}
          onCelebrationPress={
            openCelebrationChurch
          }
        />

        <NearbyCelebrationSection
          title="Próximas confissões"
          actionLabel="Ver agenda"
          onActionPress={() =>
            navigation.navigate(
              'Confissoes'
            )
          }
          celebrations={
            nearbyCelebrations.confissoes
          }
          loading={
            celebrationsLoading
          }
          error={celebrationsError}
          onRetry={retryCelebrations}
          onCelebrationPress={
            openCelebrationChurch
          }
        />

        <NearbyCelebrationSection
          title="Próximas adorações"
          actionLabel="Ver agenda"
          onActionPress={() =>
            navigation.navigate(
              'Adoracoes'
            )
          }
          celebrations={
            nearbyCelebrations.adoracoes
          }
          loading={
            celebrationsLoading
          }
          error={celebrationsError}
          onRetry={retryCelebrations}
          onCelebrationPress={
            openCelebrationChurch
          }
        />

        <View style={styles.section}>
          <SectionTitle
            title="Serviços"
          />

          <View
            style={
              styles.servicesList
            }
          >
            <ShortcutCard
              title="Adorações"
              icon="heart-outline"
              onPress={() =>
                navigation.navigate(
                  'Adoracoes'
                )
              }
            />

            <ShortcutCard
              title="Confissões"
              icon="chatbubble-ellipses-outline"
              onPress={() =>
                navigation.navigate(
                  'Confissoes'
                )
              }
            />

            <ShortcutCard
              title="Navegar no mapa"
              icon="map-outline"
              onPress={() =>
                navigation.navigate(
                  'ChurchMap'
                )
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle
            title="Notícias da Arquidiocese"
            actionLabel="Ver todas"
            onActionPress={() =>
              navigation.navigate(
                'News'
              )
            }
          />

          {newsLoading ? (
            <View
              style={
                styles.newsLoading
              }
            >
              <ActivityIndicator
                color={COLORS.primary}
              />

              <Text
                style={
                  styles.newsLoadingText
                }
              >
                Carregando notícias...
              </Text>
            </View>
          ) : null}

          {!newsLoading &&
          newsError ? (
            <View
              style={
                styles.newsError
              }
            >
              <Text
                style={
                  styles.newsErrorText
                }
              >
                {newsError}
              </Text>

              <Pressable
                onPress={() => {
                  setNewsLoading(true);

                  loadLatestNews({
                    ignoreCache: true,
                  });
                }}
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed &&
                    styles.buttonPressed,
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

          {!newsLoading &&
          !newsError &&
          latestNews.length > 0 ? (
            <FlatList
              horizontal
              data={latestNews}
              keyExtractor={(item) =>
                String(item.id)
              }
              renderItem={({
                item,
              }) => (
                <NewsCard
                  news={item}
                  onPress={() =>
                    navigation.navigate(
                      'NewsDetails',
                      {
                        newsId: item.id,
                        initialNews: item,
                      }
                    )
                  }
                />
              )}
              showsHorizontalScrollIndicator={
                false
              }
            />
          ) : null}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}


const styles = StyleSheet.create({
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  logoContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    marginBottom: SPACING.sm,
  },

  logo: Platform.select({
    android: {
      width: 190,
      height: 112,
    },

    ios: {
      width: 120,
      height: 70,
    },

    web: {
      width: 230,
      height: 134,
    },

    default: {
      width: 110,
      height: 64,
    },
  }),

  title: {
    marginTop: SPACING.sm,
    color: COLORS.text,
    fontSize: 29,
    fontWeight: '900',
    lineHeight: 34,
  },

  subtitle: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },

  section: {
    marginTop: SPACING.lg,
  },

  shortcutsGrid: {
    flexDirection: 'column',
    gap: SPACING.sm,
  },

  servicesList: {
    gap: SPACING.sm,
  },

  celebrationState: {
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },

  celebrationStateText: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

  celebrationErrorText: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

  newsLoading: {
    minHeight: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },

  newsLoadingText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },

  newsError: {
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },

  newsErrorText: {
    color: COLORS.textMuted,
    lineHeight: 20,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
  },

  retryButtonText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: '800',
  },

  buttonPressed: {
    opacity: 0.72,
  },
});