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
      month: 'long',
      year: 'numeric',
    }
  ).format(date);
}

export default function NewsListItem({
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
            size={30}
            color={COLORS.primary}
          />
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.date}>
          {formatNewsDate(news.date)}
        </Text>

        <Text
          style={styles.title}
          numberOfLines={3}
        >
          {news.title}
        </Text>

        {news.excerpt ? (
          <Text
            style={styles.excerpt}
            numberOfLines={2}
          >
            {news.excerpt}
          </Text>
        ) : null}

        <Text style={styles.readMore}>
          Ler mais
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },

  containerPressed: {
    opacity: 0.75,
  },

  image: {
    width: 115,
    minHeight: 145,
    backgroundColor: COLORS.border,
  },

  imageFallback: {
    width: 115,
    minHeight: 145,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },

  content: {
    flex: 1,
    padding: SPACING.md,
  },

  date: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    
  },

  title: {
    marginTop: SPACING.xs,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },

  excerpt: {
    marginTop: SPACING.xs,
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },

  readMore: {
    marginTop: SPACING.sm,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },
});