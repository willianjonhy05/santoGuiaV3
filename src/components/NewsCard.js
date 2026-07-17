import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export default function NewsCard({ news, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imagePlaceholder} />
      <View style={styles.content}>
        <Text style={styles.date}>{news.date}</Text>
        <Text style={styles.title} numberOfLines={3}>{news.title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 250,
    overflow: 'hidden',
    marginRight: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imagePlaceholder: {
    height: 100,
    backgroundColor: '#D9C6B0',
  },
  content: {
    padding: SPACING.md,
  },
  date: {
    marginBottom: SPACING.xs,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
});
