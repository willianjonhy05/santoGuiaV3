import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  COLORS,
  SPACING,
} from '../constants/theme';

function buildTimeText(celebration) {
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

export default function ChurchCelebrationItem({
  celebration,
}) {
  const timeText =
    buildTimeText(celebration);

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
        <Text style={styles.name}>
          {celebration.nome}
        </Text>

        {celebration.categoriaDisplay ? (
          <Text style={styles.category}>
            {
              celebration
                .categoriaDisplay
            }
          </Text>
        ) : null}

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
          <Text
            style={
              styles.recurrence
            }
          >
            {
              celebration
                .descricaoRecorrencia
            }
          </Text>
        ) : null}

        {celebration.descricao ? (
          <Text
            style={
              styles.description
            }
          >
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

            <Text
              style={styles.badgeText}
            >
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
    backgroundColor: COLORS.surface,
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
});