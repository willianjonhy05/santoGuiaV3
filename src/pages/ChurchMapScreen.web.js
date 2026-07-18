import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import ChurchMapCard from '../components/ChurchMapCard';

import {
  buildChurchMapsUrl,
  ChurchMapApiError,
  getChurchesForMap,
} from '../services/ChurchMap';

import {
  COLORS,
  SPACING,
} from '../constants/theme';

export default function ChurchMapScreen() {
  const [churches, setChurches] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const loadChurches = useCallback(
    async ({
      signal,
    } = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await getChurchesForMap({
            signal,
          });

        setChurches(
          response.churches
        );
      } catch (requestError) {
        if (
          requestError?.name ===
          'AbortError'
        ) {
          return;
        }

        setError(
          requestError instanceof
          ChurchMapApiError
            ? requestError.message
            : 'Não foi possível carregar as igrejas.'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const controller =
      new AbortController();

    loadChurches({
      signal: controller.signal,
    });

    return () => {
      controller.abort();
    };
  }, [loadChurches]);

  async function openDirections(
    church
  ) {
    const url =
      buildChurchMapsUrl(church);

    if (url) {
      await Linking.openURL(url);
    }
  }

  if (
    loading &&
    churches.length === 0
  ) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.stateText}>
          Carregando igrejas...
        </Text>
      </View>
    );
  }

  if (
    error &&
    churches.length === 0
  ) {
    return (
      <View style={styles.stateContainer}>
        <Ionicons
          name="map-outline"
          size={48}
          color={COLORS.primary}
        />

        <Text style={styles.errorTitle}>
          Não foi possível carregar
        </Text>

        <Text style={styles.stateText}>
          {error}
        </Text>

        <Pressable
          onPress={() =>
            loadChurches()
          }
          style={styles.retryButton}
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
    );
  }

  return (
    <FlatList
      data={churches}
      keyExtractor={(item) =>
        String(item.id)
      }
      renderItem={({ item }) => (
        <ChurchMapCard
          church={item}
          onOpenDirections={() =>
            openDirections(item)
          }
          style={styles.churchCard}
        />
      )}
      contentContainerStyle={
        styles.content
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>
            Mapa de Igrejas
          </Text>

          <Text style={styles.subtitle}>
            Encontre igrejas e abra a
            localização diretamente no
            Google Maps.
          </Text>

          <View style={styles.webNotice}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={COLORS.primary}
            />

            <Text
              style={
                styles.webNoticeText
              }
            >
              O mapa interativo está
              disponível no aplicativo
              Android e iOS.
            </Text>
          </View>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
    backgroundColor:
      COLORS.background,
  },

  header: {
    marginBottom: SPACING.lg,
  },

  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
  },

  subtitle: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },

  webNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: 14,
    backgroundColor:
      COLORS.surface,
  },

  webNoticeText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },

  churchCard: {
    width: '100%',
    marginBottom: SPACING.sm,
  },

  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor:
      COLORS.background,
  },

  stateText: {
    marginTop: SPACING.md,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  errorTitle: {
    marginTop: SPACING.md,
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '800',
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
    fontWeight: '800',
  },
});