import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  COLORS,
  SPACING,
} from '../constants/theme';

function formatNewsDate(dateString) {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);

  if (
    Number.isNaN(date.getTime())
  ) {
    return '';
  }

  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  ).format(date);
}

export default function NewsCard({
  news,
  onPress,
}) {
  if (!news) {
    return null;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        `Abrir notícia: ${news.title}`
      }
      style={({ pressed }) => [
        styles.container,
        pressed &&
          styles.containerPressed,
      ]}
    >
      {news.imageUrl ? (
        <Image
          source={{
            uri: news.imageUrl,
          }}
          resizeMode="cover"
          accessibilityLabel={
            news.imageAlt
          }
          style={styles.image}
        />
      ) : (
        <View style={styles.imageFallback}>
          <Ionicons
            name="newspaper-outline"
            size={38}
            color={COLORS.primary}
          />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.dateRow}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={COLORS.textMuted}
          />

          <Text style={styles.date}>
            {formatNewsDate(news.date)}
          </Text>
        </View>

        <Text
          style={styles.title}
          numberOfLines={3}
        >
          {news.title}
        </Text>

        {news.excerpt ? (
          <Text
            style={styles.excerpt}
            numberOfLines={3}
          >
            {news.excerpt}
          </Text>
        ) : null}

        <Text style={styles.readMore}>
          Ler notícia
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    overflow: 'hidden',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },

  containerPressed: {
    opacity: 0.75,
  },

  image: {
    width: '100%',
    height: 155,
    backgroundColor: COLORS.border,
  },

  imageFallback: {
    width: '100%',
    height: 155,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },

  content: {
    padding: SPACING.md,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },

  date: {
    color: COLORS.textMuted,
    fontSize: 12,
    
  },

  title: {
    marginTop: SPACING.sm,
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
  },

  excerpt: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },

  readMore: {
    marginTop: SPACING.md,
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
  },
});