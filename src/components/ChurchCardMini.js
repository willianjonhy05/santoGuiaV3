import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export default function ChurchCardMini({ church, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.iconBox}>
        <Ionicons name="business-outline" size={24} color={COLORS.primary} />
      </View>
      <Text style={styles.name} numberOfLines={2}>{church.name}</Text>
      <Text style={styles.distance}>{church.distance.toFixed(1)} km</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 190,
    minHeight: 132,
    marginRight: SPACING.md,
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
    marginBottom: SPACING.sm,
  },
  name: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  distance: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 13,
  },
});
