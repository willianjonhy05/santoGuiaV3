import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export default function MassTimeCard({ mass, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.timeColumn}>
        <Text style={styles.time}>{mass.time}</Text>
        <Text style={styles.label}>Hoje</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.church}>{mass.churchName}</Text>
        <Text style={styles.distance}>{mass.distance.toFixed(1)} km de distância</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeColumn: {
    width: 62,
  },
  time: {
    color: COLORS.primary,
    fontSize: 19,
    fontWeight: '900',
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  church: {
    color: COLORS.text,
    fontWeight: '700',
  },
  distance: {
    marginTop: SPACING.xs,
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
