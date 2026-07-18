import { Alert, FlatList, Image, ScrollView, ActivityIndicator, Pressable, StyleSheet, Text, Platform, useWindowDimensions, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import NewsCard from '../components/NewsCard';
import ShortcutCard from '../components/ShortcutCard';
import NextMassItem from '../components/NextMassItem';
import DailyLiturgyPreview from '../components/DailyLiturgyPreview';
import { MOCK_MASSES } from '../data/mockData';
import { COLORS, SPACING } from '../constants/theme';
import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  getLatestNews,
  LatestNewsApiError,
} from '../services/LatestNews';

import NearbyChurchesSection
  from '../components/NearbyChurchesSection';

export default function HomeScreen({ navigation }) {

  const [latestNews, setLatestNews] =
    useState([]);

  const [newsLoading, setNewsLoading] =
    useState(true);

  const [newsError, setNewsError] =
    useState(null);



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
            : 'Não foi possível carregar as notícias.';

        setNewsError(message);
      } finally {
        setNewsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const controller =
      new AbortController();

    loadLatestNews({
      signal: controller.signal,
    });

    return () => {
      controller.abort();
    };
  }, [loadLatestNews]);


  function showComingSoon(feature) {
    Alert.alert(feature, 'Essa funcionalidade será conectada na próxima etapa.');
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo_oficial.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="SantoGuia"
          />
        </View>
        <Text style={styles.title}>Encontre sua próxima celebração</Text>
        <Text style={styles.subtitle}>Igrejas, missas, orações e vida católica em um só lugar.</Text>

        <NearbyChurchesSection
          onSeeAll={() =>
            navigation.navigate('Igrejas')
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
          <SectionTitle title="Acesso rápido" />
          <View style={styles.shortcutsGrid}>
            <ShortcutCard title="Exame de Consciência" icon="checkmark-circle-outline" onPress={() => navigation.navigate('ExaminationOfConscience')} />
            <ShortcutCard title="Santo do Dia" icon="sunny-outline" onPress={() => navigation.navigate('SaintOfDay')} />
            <ShortcutCard title="Liturgia Diária" icon="reader-outline" onPress={() => navigation.navigate('Liturgy')} />
            <ShortcutCard title="Orações" icon="book-outline" onPress={() => navigation.navigate('Orações')} />
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle
            title="Próximas missas"
            actionLabel="Ver agenda"
            onActionPress={() => navigation.navigate('Missas')}
          />
          {MOCK_MASSES.slice(0, 3).map((mass) => (
            <NextMassItem key={mass.id} mass={mass} />
          ))}
        </View>

        <View style={styles.section}>
          <SectionTitle title="Serviços" />

          <View style={styles.servicesList}>
            <ShortcutCard
              title="Adorações"
              icon="heart-outline"
              onPress={() =>
                showComingSoon('Adorações')
              }
            />

            <ShortcutCard
              title="Confissões"
              icon="chatbubble-ellipses-outline"
              onPress={() =>
                showComingSoon('Confissões')
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
              navigation.navigate('News')
            }
          />

          {newsLoading ? (
            <View style={styles.newsLoading}>
              <ActivityIndicator
                color={COLORS.primary}
              />

              <Text style={styles.newsLoadingText}>
                Carregando notícias...
              </Text>
            </View>
          ) : null}

          {!newsLoading && newsError ? (
            <View style={styles.newsError}>
              <Text style={styles.newsErrorText}>
                {newsError}
              </Text>

              <Pressable
                onPress={() => {
                  setNewsLoading(true);

                  loadLatestNews({
                    ignoreCache: true,
                  });
                }}
              >
                <Text style={styles.newsRetry}>
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
              renderItem={({ item }) => (
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
  servicesList: {
    gap: SPACING.sm,
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
  actionGap: {
    gap: SPACING.sm,
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

  newsRetry: {
    marginTop: SPACING.sm,
    color: COLORS.primary,
    fontWeight: '800',
  },
});
