import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons
  from '@expo/vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SPACING,
} from '../constants/theme';

import {
  useFavorites,
} from '../contexts/FavoritesContext';


function getChurch(celebration) {
  return celebration?.igreja ?? {};
}


function getTime(celebration) {
  return (
    celebration?.horario_inicio ||
    celebration?.time ||
    '--:--'
  );
}


function getChurchName(
  celebration
) {
  const church =
    getChurch(celebration);

  return (
    church.nome ||
    celebration?.churchName ||
    'Igreja não informada'
  );
}


function getDistance(
  celebration
) {
  const church =
    getChurch(celebration);

  const value =
    church.distancia_km ??
    celebration?.distancia_km ??
    celebration?.distance;

  const parsedValue =
    Number(value);

  return Number.isFinite(
    parsedValue
  )
    ? parsedValue
    : null;
}


function getChurchAddress(
  celebration
) {
  const church =
    getChurch(celebration);

  return [
    church.bairro,
    church.cidade,
  ]
    .filter(Boolean)
    .join(' · ');
}


export default function NextMassItem({
  celebration,
  mass,
  onPress,
}) {
  /*
   * Mantém compatibilidade com o
   * antigo uso mass={mass}.
   */
  const item =
    celebration ?? mass;

  const {
    isCelebrationFavorite,
    toggleCelebrationFavorite,
  } = useFavorites();

  if (!item) {
    return null;
  }

  const distance =
    getDistance(item);

  const address =
    getChurchAddress(item);

  const favorite =
    isCelebrationFavorite(item);


  function handleFavoritePress(
    event
  ) {
    /*
     * Evita que o clique no coração
     * também abra ChurchDetails.
     */
    event?.stopPropagation?.();

    toggleCelebrationFavorite(
      item
    );
  }


  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={
        onPress ? 'button' : undefined
      }
      style={({ pressed }) => [
        styles.row,
        pressed &&
          styles.rowPressed,
      ]}
    >
      <View style={styles.timeBox}>
        <Text style={styles.time}>
          {getTime(item)}
        </Text>
      </View>

      <View style={styles.content}>
        <Text
          style={styles.church}
          numberOfLines={2}
        >
          {getChurchName(item)}
        </Text>



        {item.proxima_data ? (
          <Text style={styles.date}>
            {item.proxima_data}
          </Text>
        ) : null}

        {distance !== null ? (
          <Text style={styles.distance}>
            {distance.toFixed(1)} km de distância
          </Text>
        ) : null}

        {address ? (
          <Text
            style={styles.address}
            numberOfLines={1}
          >
            {address}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightActions}>
        <Pressable
          onPress={
            handleFavoritePress
          }
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={
            favorite
              ? 'Remover dos favoritos'
              : 'Adicionar aos favoritos'
          }
          style={({ pressed }) => [
            styles.favoriteButton,

            pressed &&
              styles.favoritePressed,
          ]}
        >
          <Ionicons
            name={
              favorite
                ? 'heart'
                : 'heart-outline'
            }
            size={23}
            color={COLORS.primary}
          />
        </Pressable>

        {onPress ? (
          <Ionicons
            name="chevron-forward"
            size={19}
            color={COLORS.textMuted}
          />
        ) : null}
      </View>
    </Pressable>
  );
}


const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  rowPressed: {
    opacity: 0.78,
  },

  timeBox: {
    minWidth: 64,
    alignItems: 'center',
    paddingHorizontal:
      SPACING.sm,
    paddingVertical:
      SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor:
      COLORS.primary,
  },

  time: {
    color: COLORS.surface,
    fontWeight: '800',
  },

  content: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },

  church: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },

  celebrationName: {
    marginTop: 3,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },

  date: {
    marginTop: SPACING.xs,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },

  distance: {
    marginTop: SPACING.xs,
    color: COLORS.textMuted,
    fontSize: 12,
  },

  address: {
    marginTop: 2,
    color: COLORS.textMuted,
    fontSize: 12,
  },

  rightActions: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },

  favoriteButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor:
      COLORS.background,
  },

  favoritePressed: {
    opacity: 0.6,
    transform: [
      {
        scale: 0.92,
      },
    ],
  },
});