import { StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export default function NextMassItem({ mass }) {
  return (
    <View style={styles.row}>
      <View style={styles.timeBox}>
        <Text style={styles.time}>{mass.time}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.church}>{mass.churchName}</Text>
        <Text style={styles.distance}>{mass.distance.toFixed(1)} km de distância</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeBox: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
  },
  time: {
    color: COLORS.surface,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
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
