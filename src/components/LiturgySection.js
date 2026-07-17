import { StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export default function LiturgySection({
  title,
  reference,
  subtitle,
  refrain,
  text,
}) {
  if (!text && !refrain) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      {reference ? <Text style={styles.reference}>{reference}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {refrain ? (
        <View style={styles.refrainBox}>
          <Text style={styles.refrainLabel}>Refrão</Text>
          <Text style={styles.refrain}>{refrain}</Text>
        </View>
      ) : null}

      {text ? <Text style={styles.text}>{text}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  title: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  reference: {
    marginTop: SPACING.xs,
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: SPACING.sm,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  refrainBox: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.background,
  },
  refrainLabel: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  refrain: {
    marginTop: SPACING.xs,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 23,
  },
  text: {
    marginTop: SPACING.md,
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 27,
  },
});
