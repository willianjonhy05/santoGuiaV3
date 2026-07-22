import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useNavigation,
} from '@react-navigation/native';

import Ionicons from
  '@expo/vector-icons/Ionicons';

import {
  COLORS,
  SPACING,
} from '../constants/theme';

function formatDistance(distanceKm) {
  const parsedDistance =
    Number(distanceKm);

  if (
    !Number.isFinite(parsedDistance) ||
    parsedDistance < 0
  ) {
    return null;
  }

  if (parsedDistance < 1) {
    return `${Math.round(
      parsedDistance * 1000
    )} m`;
  }

  return `${parsedDistance.toFixed(1)} km`;
}

function normalizeSlug(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  return String(value)
    .trim()
    .replace(/^\/+|\/+$/g, '');
}

function extractSlugFromUrl(value) {
  if (!value) {
    return '';
  }

  const url = String(value).trim();

  const match = url.match(
    /\/igrejas\/([^/?#]+)\/?/i
  );

  return normalizeSlug(
    match?.[1]
  );
}

function createSlugFromName(value) {
  if (!value) {
    return '';
  }

  return String(value)
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getChurchSlug(church) {
  return (
    normalizeSlug(
      church?.slug
    ) ||
    extractSlugFromUrl(
      church?.detailsUrl
    ) ||
    extractSlugFromUrl(
      church?.detailUrl
    ) ||
    extractSlugFromUrl(
      church?.url
    ) ||
    extractSlugFromUrl(
      church?.link
    ) ||
    createSlugFromName(
      church?.name
    )
  );
}

export default function ChurchMapCard({
  church,
  selected = false,
  onPress,
  style,
}) {
  const navigation =
    useNavigation();

  if (!church) {
    return null;
  }

  const churchName =
    church.name || 'Igreja';

  const formattedDistance =
    formatDistance(
      church.distanceKm
    );

  function openChurchDetails(event) {
    event?.stopPropagation?.();

    const slug =
      getChurchSlug(church);

    if (!slug) {
      Alert.alert(
        'Detalhes indisponíveis',
        'Esta igreja não possui um identificador válido para abrir a página de detalhes.'
      );

      return;
    }

    navigation.navigate(
      'ChurchDetails',
      {
        slug,

        /*
         * O objeto também é enviado para
         * permitir uma exibição imediata
         * caso a tela de detalhes use esse
         * dado como fallback.
         */
        church,
      }
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{
        selected,
      }}
      accessibilityLabel={
        `Selecionar ${churchName}`
      }
      style={({ pressed }) => [
        styles.card,

        selected &&
          styles.cardSelected,

        pressed &&
          styles.cardPressed,

        style,
      ]}
    >
      <View
        style={
          styles.iconContainer
        }
      >
        <Ionicons
          name="location-outline"
          size={25}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.content}>
        <Text
          style={styles.name}
          numberOfLines={2}
        >
          {churchName}
        </Text>

        {church.addressLine ? (
          <Text
            style={styles.address}
            numberOfLines={2}
          >
            {church.addressLine}
          </Text>
        ) : null}

        <View style={styles.footer}>
          {formattedDistance ? (
            <View
              style={
                styles.distanceContainer
              }
            >
              <Ionicons
                name="navigate-outline"
                size={14}
                color={COLORS.primary}
              />

              <Text
                style={
                  styles.distanceText
                }
              >
                {formattedDistance}
              </Text>
            </View>
          ) : (
            <View />
          )}

          <Pressable
            onPress={
              openChurchDetails
            }
            accessibilityRole="button"
            accessibilityLabel={
              `Ver detalhes de ${churchName}`
            }
            style={({ pressed }) => [
              styles.detailsButton,

              pressed &&
                styles.detailsButtonPressed,
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={17}
              color={COLORS.surface}
            />

            <Text
              style={
                styles.detailsButtonText
              }
            >
              Ver igreja
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    minHeight: 145,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor:
      COLORS.surface,
  },

  cardSelected: {
    borderWidth: 2,
    borderColor:
      COLORS.primary,
  },

  cardPressed: {
    opacity: 0.8,
  },

  iconContainer: {
    width: 43,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    borderRadius: 13,
    backgroundColor:
      `${COLORS.primary}12`,
  },

  content: {
    flex: 1,
  },

  name: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },

  address: {
    marginTop: SPACING.xs,
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginTop: 'auto',
    paddingTop: SPACING.sm,
  },

  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  distanceText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },

  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal:
      SPACING.sm,
    paddingVertical:
      SPACING.sm,
    borderRadius: 10,
    backgroundColor:
      COLORS.primary,
  },

  detailsButtonPressed: {
    opacity: 0.7,
  },

  detailsButtonText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '800',
  },
});