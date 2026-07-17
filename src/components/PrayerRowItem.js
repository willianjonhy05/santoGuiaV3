import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export default function PrayerRowItem({ prayer, onPress }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.iconBox}>
        <Ionicons name="book-outline" size={22} color={COLORS.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{prayer.title}</Text>
        <Text style={styles.description}>{prayer.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
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
  iconBox: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: '#F4E7E9',
  },
  content: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  description: {
    marginTop: SPACING.xs,
    color: COLORS.textMuted,
    fontSize: 13,
  },
});
