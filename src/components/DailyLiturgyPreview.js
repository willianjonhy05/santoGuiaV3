import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import useLiturgy from '../hooks/useLiturgy';
import { getLocalDateString } from '../utils/date';
import { COLORS, RADIUS, SPACING } from '../constants/theme';


export default function DailyLiturgyPreview({ onPress }) {
  const { liturgy, loading, error } = useLiturgy(getLocalDateString());
  const gospelReference = liturgy?.leituras?.evangelho?.[0]?.referencia;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Abrir a liturgia diária"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.iconBox}>
        <Ionicons name="reader-outline" size={28} color={COLORS.surface} />
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.mutedText}>Carregando liturgia de hoje...</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <>
            <Text style={styles.title}>Liturgia diária</Text>
            <Text style={styles.mutedText}>Toque para tentar abrir novamente.</Text>
          </>
        ) : null}

        {!loading && liturgy ? (
          <>
            <Text style={styles.title} numberOfLines={2}>
              {liturgy.liturgia}
            </Text>
            <Text style={styles.meta}>
              {liturgy.data}
              {gospelReference ? ` • Evangelho: ${gospelReference}` : ''}
            </Text>
          </>
        ) : null}
      </View>

      <Ionicons name="chevron-forward" size={22} color={COLORS.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  pressed: {
    opacity: 0.82,
  },
  iconBox: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
  },
  meta: {
    marginTop: SPACING.xs,
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  mutedText: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
