import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import SectionTitle
  from './SectionTitle';

import NextMassItem
  from './NextMassItem';

import {
  COLORS,
  RADIUS,
  SPACING,
} from '../constants/theme';


export default function NearbyCelebrationSection({
  title,
  actionLabel,
  onActionPress,
  celebrations,
  loading,
  error,
  onRetry,
  onCelebrationPress,
  limit = 3,
}) {
  const visibleCelebrations =
    Array.isArray(celebrations)
      ? celebrations.slice(0, limit)
      : [];

  return (
    <View style={styles.section}>
      <SectionTitle
        title={title}
        actionLabel={actionLabel}
        onActionPress={onActionPress}
      />

      {loading ? (
        <View style={styles.celebrationState}>
          <ActivityIndicator
            color={COLORS.primary}
          />

          <Text
            style={
              styles.celebrationStateText
            }
          >
            Buscando celebrações próximas...
          </Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.celebrationState}>
          <Text
            style={
              styles.celebrationErrorText
            }
          >
            {error}
          </Text>

          <Pressable
            onPress={onRetry}
            style={({ pressed }) => [
              styles.retryButton,
              pressed &&
                styles.buttonPressed,
            ]}
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
      ) : null}

      {!loading &&
      !error &&
      visibleCelebrations.length === 0 ? (
        <View style={styles.celebrationState}>
          <Text
            style={
              styles.celebrationStateText
            }
          >
            Nenhuma celebração próxima foi
            encontrada.
          </Text>
        </View>
      ) : null}

      {!loading &&
      !error &&
      visibleCelebrations.map(
        (celebration) => (
          <NextMassItem
            key={String(
              celebration.id
            )}
            celebration={celebration}
            onPress={() =>
              onCelebrationPress(
                celebration
              )
            }
          />
        )
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  section: {
    marginTop: SPACING.lg,
  },

  celebrationState: {
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },

  celebrationStateText: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

  celebrationErrorText: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
  },

  retryButtonText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: '800',
  },

  buttonPressed: {
    opacity: 0.72,
  },
});