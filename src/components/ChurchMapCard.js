import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  COLORS,
  SPACING,
} from '../constants/theme';

function formatDistance(distanceKm) {
  if (
    distanceKm === null ||
    distanceKm === undefined
  ) {
    return null;
  }

  if (distanceKm < 1) {
    return `${Math.round(
      distanceKm * 1000
    )} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}

export default function ChurchMapCard({
  church,
  selected = false,
  onPress,
  onOpenDirections,
  style,
}) {
  if (!church) {
    return null;
  }

  const formattedDistance =
    formatDistance(
      church.distanceKm
    );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        `Selecionar ${church.name}`
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
      <View style={styles.iconContainer}>
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
          {church.name}
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
            onPress={(event) => {
              event.stopPropagation?.();
              onOpenDirections?.();
            }}
            accessibilityRole="link"
            style={({ pressed }) => [
              styles.routeButton,
              pressed &&
                styles.routeButtonPressed,
            ]}
          >
            <Ionicons
              name="map-outline"
              size={16}
              color={COLORS.surface}
            />

            <Text
              style={
                styles.routeButtonText
              }
            >
              Traçar rota
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
    backgroundColor: COLORS.surface,
  },

  cardSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
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
    justifyContent: 'space-between',
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

  routeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },

  routeButtonPressed: {
    opacity: 0.7,
  },

  routeButtonText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '800',
  },
});