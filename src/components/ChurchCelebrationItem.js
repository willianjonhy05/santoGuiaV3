import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useMemo,
  useState,
} from 'react';

import Ionicons
  from '@expo/vector-icons/Ionicons';

import {
  useFavorites,
} from '../contexts/FavoritesContext';

import {
  COLORS,
  SPACING,
} from '../constants/theme';


function buildTimeText(
  celebration
) {
  if (
    celebration.horarioInicio &&
    celebration.horarioFim
  ) {
    return (
      `${celebration.horarioInicio} às ` +
      celebration.horarioFim
    );
  }

  return (
    celebration.horarioInicio ||
    celebration.horarioFim ||
    ''
  );
}


function buildFavoriteCelebration(
  celebration,
  church
) {
  const celebrationChurch =
    celebration?.igreja ??
    church ??
    null;

  return {
    ...celebration,

    id:
      celebration?.id,

    nome:
      celebration?.nome,

    categoria:
      celebration?.categoria,

    categoriaDisplay:
      celebration?.categoriaDisplay,

    recorrencia:
      celebration?.recorrencia,

    descricaoRecorrencia:
      celebration?.descricaoRecorrencia,

    descricao:
      celebration?.descricao,

    dia:
      celebration?.dia,

    diaDisplay:
      celebration?.diaDisplay,

    horarioInicio:
      celebration?.horarioInicio,

    horarioFim:
      celebration?.horarioFim,

    proximaData:
      celebration?.proximaData,

    exigeAgendamento:
      celebration?.exigeAgendamento,

    igreja:
      celebrationChurch,

    igrejaId:
      celebration?.igrejaId ??
      celebrationChurch?.id ??
      church?.id,

    igrejaSlug:
      celebration?.igrejaSlug ??
      celebrationChurch?.slug ??
      church?.slug,

    igrejaNome:
      celebration?.igrejaNome ??
      celebrationChurch?.nome ??
      church?.nome,

    igrejaEndereco:
      celebration?.igrejaEndereco ??
      celebrationChurch?.endereco ??
      church?.endereco,

    igrejaBairro:
      celebration?.igrejaBairro ??
      celebrationChurch?.bairro ??
      church?.bairro,

    igrejaCidade:
      celebration?.igrejaCidade ??
      celebrationChurch?.cidade ??
      church?.cidade,
  };
}


export default function
ChurchCelebrationItem({
  celebration,
  church = null,
}) {
  const [
    favoriteLoading,
    setFavoriteLoading,
  ] = useState(false);

  const {
    isCelebrationFavorite,
    toggleCelebrationFavorite,
  } = useFavorites();


  const favoriteCelebration =
    useMemo(
      () =>
        buildFavoriteCelebration(
          celebration,
          church
        ),
      [
        celebration,
        church,
      ]
    );


  const isFavorite =
    isCelebrationFavorite(
      favoriteCelebration
    );


  const timeText =
    buildTimeText(
      celebration
    );


  async function
  handleFavoritePress() {
    if (favoriteLoading) {
      return;
    }

    if (!celebration?.id) {
      Alert.alert(
        'Não foi possível favoritar',
        (
          'A celebração não possui um ' +
          'identificador válido.'
        )
      );

      return;
    }

    setFavoriteLoading(true);

    try {
      const result =
        await toggleCelebrationFavorite(
          favoriteCelebration
        );

      if (
        result?.favorite &&
        result?.notificationScheduled ===
          false
      ) {
        Alert.alert(
          'Adicionado aos favoritos',
          (
            'A celebração foi salva, mas o ' +
            'lembrete não pôde ser ativado. ' +
            'Verifique a permissão de notificações.'
          )
        );
      }
    } catch (error) {
      console.error(
        'Erro ao favoritar celebração:',
        error
      );

      Alert.alert(
        'Erro',
        (
          error?.message ||
          'Não foi possível atualizar os favoritos.'
        )
      );
    } finally {
      setFavoriteLoading(false);
    }
  }


  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Ionicons
          name="time-outline"
          size={22}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.titleContent}>
            <Text style={styles.name}>
              {celebration.nome}
            </Text>

            {celebration
              .categoriaDisplay ? (
              <Text style={styles.category}>
                {
                  celebration
                    .categoriaDisplay
                }
              </Text>
            ) : null}
          </View>

          <Pressable
            onPress={
              handleFavoritePress
            }
            disabled={
              favoriteLoading
            }
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite
                ? (
                  'Remover celebração dos favoritos'
                )
                : (
                  'Adicionar celebração aos favoritos'
                )
            }
            style={({ pressed }) => [
              styles.favoriteButton,

              isFavorite &&
                styles
                  .favoriteButtonActive,

              pressed &&
                styles.pressed,

              favoriteLoading &&
                styles.disabled,
            ]}
          >
            <Ionicons
              name={
                isFavorite
                  ? 'heart'
                  : 'heart-outline'
              }
              size={22}
              color={
                isFavorite
                  ? COLORS.primary
                  : COLORS.textMuted
              }
            />
          </Pressable>
        </View>

        <View style={styles.schedule}>
          {celebration.diaDisplay ? (
            <Text style={styles.day}>
              {
                celebration
                  .diaDisplay
              }
            </Text>
          ) : null}

          {timeText ? (
            <Text style={styles.time}>
              {timeText}
            </Text>
          ) : null}
        </View>

        {celebration
          .descricaoRecorrencia ? (
          <Text style={styles.recurrence}>
            {
              celebration
                .descricaoRecorrencia
            }
          </Text>
        ) : null}

        {celebration.descricao ? (
          <Text style={styles.description}>
            {celebration.descricao}
          </Text>
        ) : null}

        {celebration
          .exigeAgendamento ? (
          <View style={styles.badge}>
            <Ionicons
              name="calendar-outline"
              size={13}
              color={COLORS.primary}
            />

            <Text style={styles.badgeText}>
              Exige agendamento
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor:
      COLORS.surface,
  },

  icon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    borderRadius: 12,
    backgroundColor:
      `${COLORS.primary}12`,
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  titleContent: {
    flex: 1,
    minWidth: 0,
    paddingRight: SPACING.xs,
  },

  name: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },

  category: {
    marginTop: 2,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },

  favoriteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -7,
    marginRight: -7,
    borderRadius: 20,
  },

  favoriteButtonActive: {
    backgroundColor:
      `${COLORS.primary}12`,
  },

  schedule: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },

  day: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },

  time: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
  },

  recurrence: {
    marginTop: SPACING.xs,
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },

  description: {
    marginTop: SPACING.xs,
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 19,
  },

  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 999,
    backgroundColor:
      `${COLORS.primary}12`,
  },

  badgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.65,
  },

  disabled: {
    opacity: 0.45,
  },
});