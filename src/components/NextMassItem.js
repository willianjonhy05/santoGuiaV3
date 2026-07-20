import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useState,
} from 'react';

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
   * Mantém compatibilidade com:
   *
   * <NextMassItem mass={mass} />
   *
   * e:
   *
   * <NextMassItem
   *   celebration={celebration}
   * />
   */
  const item =
    celebration ?? mass;

  const [
    favoriteLoading,
    setFavoriteLoading,
  ] = useState(false);

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


  async function handleFavoritePress(
    event
  ) {
    /*
     * Impede que o toque no coração
     * execute também o onPress do card.
     */
    event?.stopPropagation?.();

    /*
     * Evita múltiplos agendamentos
     * causados por toques repetidos.
     */
    if (favoriteLoading) {
      return;
    }

    setFavoriteLoading(true);

    try {
      const result =
        await toggleCelebrationFavorite(
          item
        );

      /*
       * Usa optional chaining para não
       * quebrar se o contexto ainda estiver
       * retornando undefined.
       */
      if (
        result?.favorite === true &&
        result?.notificationScheduled ===
          false
      ) {
        Alert.alert(
          'Celebração favoritada',
          (
            'A celebração foi adicionada aos favoritos, ' +
            'mas o lembrete não pôde ser agendado. ' +
            'Verifique a permissão de notificações.'
          )
        );
      }
    } catch (error) {
      console.error(
        'Erro ao alterar celebração favorita:',
        error
      );

      Alert.alert(
        'Não foi possível concluir',
        (
          'Ocorreu um erro ao adicionar ou remover ' +
          'a celebração dos favoritos.'
        )
      );
    } finally {
      setFavoriteLoading(false);
    }
  }


  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={
        onPress
          ? 'button'
          : undefined
      }
      accessibilityLabel={
        onPress
          ? (
            `Abrir detalhes de ${getChurchName(
              item
            )}`
          )
          : undefined
      }
      style={({ pressed }) => [
        styles.row,

        pressed &&
        onPress &&
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

        {item.nome ? (
          <Text
            style={styles.celebrationName}
            numberOfLines={1}
          >
            {item.nome}
          </Text>
        ) : null}

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
          disabled={favoriteLoading}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={
            favorite
              ? 'Remover celebração dos favoritos'
              : 'Adicionar celebração aos favoritos'
          }
          accessibilityState={{
            selected: favorite,
            disabled: favoriteLoading,
            busy: favoriteLoading,
          }}
          style={({ pressed }) => [
            styles.favoriteButton,

            favorite &&
              styles.favoriteButtonActive,

            pressed &&
              !favoriteLoading &&
              styles.favoritePressed,

            favoriteLoading &&
              styles.favoriteLoading,
          ]}
        >
          {favoriteLoading ? (
            <Ionicons
              name="hourglass-outline"
              size={21}
              color={COLORS.primary}
            />
          ) : (
            <Ionicons
              name={
                favorite
                  ? 'heart'
                  : 'heart-outline'
              }
              size={23}
              color={COLORS.primary}
            />
          )}
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
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor:
      COLORS.surface,
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor:
      COLORS.background,
  },

  favoriteButtonActive: {
    borderColor: COLORS.primary,
  },

  favoritePressed: {
    opacity: 0.6,
    transform: [
      {
        scale: 0.92,
      },
    ],
  },

  favoriteLoading: {
    opacity: 0.55,
  },
});