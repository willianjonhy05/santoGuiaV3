import { Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../constants/theme';

export default function FavoriteButton({ isFavorite, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      onPress={onPress}
      hitSlop={10}
      style={styles.button}
    >
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={25}
        color={isFavorite ? COLORS.danger : COLORS.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});
