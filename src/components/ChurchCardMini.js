import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
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

export default function ChurchCardMini({
  church,
  isFavorite = false,
  onFavoritePress,
  onPress,
}) {
  const distance = formatDistance(
    church?.distancia_km
  );

  const churchType = church?.paroquia
    ? 'Paróquia'
    : church?.capela
      ? 'Capela'
      : 'Igreja';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        `Ver detalhes de ${church.nome}`
      }
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.imageContainer}>
        {church.imagem_url ? (
          <Image
            source={{
              uri: church.imagem_url,
            }}
            resizeMode="cover"
            accessibilityLabel={
              church.nome
            }
            style={styles.image}
          />
        ) : (
          <View style={styles.imageFallback}>
            <Ionicons
              name="business-outline"
              size={38}
              color={COLORS.primary}
            />
          </View>
        )}

        <Pressable
          onPress={(event) => {
            event.stopPropagation?.();
            onFavoritePress?.();
          }}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite
              ? `Remover ${church.nome} dos favoritos`
              : `Adicionar ${church.nome} aos favoritos`
          }
          hitSlop={10}
          style={({ pressed }) => [
            styles.favoriteButton,
            pressed &&
              styles.favoriteButtonPressed,
          ]}
        >
          <Ionicons
            name={
              isFavorite
                ? 'heart'
                : 'heart-outline'
            }
            size={23}
            color={COLORS.primary}
          />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.typeRow}>
          <Text style={styles.type}>
            {churchType}
          </Text>

          {distance ? (
            <View style={styles.distance}>
              <Ionicons
                name="navigate-outline"
                size={13}
                color={COLORS.primary}
              />

              <Text
                style={styles.distanceText}
              >
                {distance}
              </Text>
            </View>
          ) : null}
        </View>

        <Text
          style={styles.name}
          numberOfLines={2}
        >
          {church.nome}
        </Text>

        <View style={styles.addressRow}>
          <Ionicons
            name="location-outline"
            size={15}
            color={COLORS.textMuted}
          />

          <Text
            style={styles.address}
            numberOfLines={2}
          >
            {church.enderecoCompleto ||
              [
                church.endereco,
                church.bairro,
                church.cidade,
              ]
                .filter(Boolean)
                .join(' · ') ||
              'Endereço não informado'}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.detailsText}>
            Ver detalhes
          </Text>

          <Ionicons
            name="chevron-forward"
            size={17}
            color={COLORS.primary}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 275,
    overflow: 'hidden',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },

  cardPressed: {
    opacity: 0.8,
  },

  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 145,
  },

  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.border,
  },

  imageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },

  favoriteButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    zIndex: 2,
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
  },

  favoriteButtonPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  content: {
    padding: SPACING.md,
  },

  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  type: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  distance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  distanceText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },

  name: {
    marginTop: SPACING.sm,
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
  },

  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },

  address: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },

  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
  },

  detailsText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
  },
});