import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import FavoriteButton from './FavoriteButton';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export default function ChurchListItem({ church, isFavorite, onFavoritePress, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.iconBox}>
        <Ionicons name="business-outline" size={25} color={COLORS.primary} />
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{church.name}</Text>
        <Text style={styles.address} numberOfLines={1}>{church.address}</Text>
        <Text style={styles.distance}>{church.distance.toFixed(1)} km</Text>
      </View>

      <FavoriteButton
        isFavorite={isFavorite}
        onPress={(event) => {
          event.stopPropagation?.();
          onFavoritePress?.();
        }}
      />
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
  iconBox: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#F4E7E9',
  },
  content: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  name: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  address: {
    marginTop: SPACING.xs,
    color: COLORS.textMuted,
    fontSize: 12,
  },
  distance: {
    marginTop: SPACING.xs,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
