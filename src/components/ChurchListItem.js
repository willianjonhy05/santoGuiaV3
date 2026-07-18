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

function formatDistance(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (value < 1) {
    return `${Math.round(
      value * 1000
    )} m`;
  }

  return `${value.toFixed(1)} km`;
}

export default function ChurchListItem({
  church,
  isFavorite,
  onFavoritePress,
  onPress,
}) {
  const distance =
    formatDistance(
      church.distancia_km
    );

  const type = church.paroquia
    ? 'Paróquia'
    : church.capela
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
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      {church.imagem_url ? (
        <Image
          source={{
            uri: church.imagem_url,
          }}
          resizeMode="cover"
          style={styles.image}
        />
      ) : (
        <View style={styles.imageFallback}>
          <Ionicons
            name="business-outline"
            size={30}
            color={COLORS.primary}
          />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.type}>
            {type}
          </Text>

          {distance ? (
            <View style={styles.distance}>
              <Ionicons
                name="navigate-outline"
                size={13}
                color={COLORS.primary}
              />

              <Text
                style={
                  styles.distanceText
                }
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
      </View>

      <Pressable
        onPress={(event) => {
          event.stopPropagation?.();
          onFavoritePress?.();
        }}
        accessibilityRole="button"
        accessibilityLabel={
          isFavorite
            ? 'Remover dos favoritos'
            : 'Adicionar aos favoritos'
        }
        hitSlop={10}
        style={({ pressed }) => [
          styles.favoriteButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name={
            isFavorite
              ? 'heart'
              : 'heart-outline'
          }
          size={22}
          color={COLORS.primary}
        />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },

  image: {
    width: 82,
    height: 82,
    borderRadius: 12,
    backgroundColor: COLORS.border,
  },

  imageFallback: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor:
      COLORS.background,
  },

  content: {
    flex: 1,
    marginLeft: SPACING.md,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  type: {
    color: COLORS.primary,
    fontSize: 10,
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
    fontSize: 11,
    fontWeight: '800',
  },

  name: {
    marginTop: 4,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },

  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: SPACING.xs,
  },

  address: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },

  favoriteButton: {
    alignSelf: 'flex-start',
    padding: SPACING.xs,
  },

  pressed: {
    opacity: 0.7,
  },
});