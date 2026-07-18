import {
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SPACING,
} from '../constants/theme';

export default function ShortcutCard({
  title,
  icon,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={26}
        color={COLORS.primary}
      />

      <Text style={styles.title}>
        {title}
      </Text>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={COLORS.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },

  cardPressed: {
    opacity: 0.72,
  },

  title: {
    flex: 1,
    marginLeft: SPACING.md,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
});