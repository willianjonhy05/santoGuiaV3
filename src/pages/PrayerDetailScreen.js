import { ScrollView, StyleSheet, Text } from 'react-native';
import { MOCK_PRAYERS } from '../data/mockData';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export default function PrayerDetailScreen({ route }) {
  const prayer = route.params?.prayer ?? MOCK_PRAYERS[0];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{prayer.title}</Text>
      <Text style={styles.description}>{prayer.description}</Text>
      <Text style={styles.prayerText}>{prayer.content}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  prayerText: {
    marginTop: SPACING.lg,
    color: COLORS.text,
    fontSize: 18,
    lineHeight: 30,
    textAlign: 'center',
  },
});
