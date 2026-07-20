import { useState } from 'react';

import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import RenderHtml from 'react-native-render-html';

import {
  COLORS,
  SPACING,
} from '../constants/theme';

function formatDate(dateString) {
  if (!dateString) {
    return '';
  }

  const [year, month, day] = dateString
    .split('-')
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default function SaintOfDayContent({
  saint,
}) {
  const { width } = useWindowDimensions();

  const [imageRatio, setImageRatio] =
    useState(1);

  if (!saint) {
    return null;
  }

  if (!saint) {
    return null;
  }

  async function handleOpenSource() {
    if (!saint.fonte_url) {
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(
        saint.fonte_url
      );

      if (canOpen) {
        await Linking.openURL(
          saint.fonte_url
        );
      }
    } catch (error) {
      console.error(
        'Erro ao abrir fonte do Santo do Dia:',
        error
      );
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        

        <Text style={styles.name}>
          {saint.nome}
        </Text>

        
      </View>

      {saint.imagem_url ? (
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: saint.imagem_url,
            }}
            onLoad={({
              nativeEvent: {
                source: {
                  width: imageWidth,
                  height: imageHeight,
                },
              },
            }) => {
              if (imageWidth && imageHeight) {
                setImageRatio(
                  imageWidth / imageHeight
                );
              }
            }}
            resizeMode="contain"
            accessibilityLabel={
              saint.imagem_alt ||
              saint.nome
            }
            style={[
              styles.image,
              {
                aspectRatio: imageRatio,
              },
            ]}
          />
        </View>
      ) : (
        <View style={styles.imageFallback}>
          <Text style={styles.imageFallbackIcon}>
            🙏
          </Text>

          <Text style={styles.imageFallbackText}>
            Imagem não disponível
          </Text>
        </View>
      )}

      <View style={styles.article}>
        <RenderHtml
          contentWidth={Math.max(
            width - SPACING.md * 4,
            0
          )}
          source={{
            html:
              saint.conteudo_html ||
              '<p>Conteúdo não disponível.</p>',
          }}
          baseStyle={styles.htmlBase}
          tagsStyles={htmlTagStyles}
          defaultTextProps={{
            selectable: true,
          }}
        />
      </View>

      {saint.fonte_url ? (
        <Pressable
          onPress={handleOpenSource}
          style={({ pressed }) => [
            styles.sourceButton,
            pressed &&
            styles.sourceButtonPressed,
          ]}
        >
          <Text style={styles.sourceButtonText}>
            Ver conteúdo original
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const htmlTagStyles = {
  body: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 26,
  },

  p: {
    marginTop: 0,
    marginBottom: 15,
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'justify',
  },

  h2: {
    marginTop: 20,
    marginBottom: 10,
    color: COLORS.primary,
    fontSize: 22,
    lineHeight: 28,
  },

  h3: {
    marginTop: 18,
    marginBottom: 8,
    color: COLORS.text,
    fontSize: 19,
    lineHeight: 25,
  },

  blockquote: {
    marginVertical: 15,
    paddingLeft: 14,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    color: COLORS.textMuted,
  },

  ul: {
    marginBottom: 15,
  },

  ol: {
    marginBottom: 15,
  },

  li: {
    marginBottom: 8,
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
  },

  strong: {
    fontWeight: '800',
  },

  b: {
    fontWeight: '800',
  },
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  header: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },



  name: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: '900',
    lineHeight: 34,
    textAlign: 'center',
  },


  imageContainer: {
    width: '100%',
    height: 310,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: COLORS.border,
  },

  image: {
    height: '100%',
    maxWidth: '100%',
    borderRadius: 18,
  },

  imageFallback: {
    width: '100%',
    height: 310,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
  },

  imageFallbackIcon: {
    fontSize: 45,
  },

  imageFallbackText: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 14,
  },

  article: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
  },

  htmlBase: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 26,
  },

  sourceButton: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
  },

  sourceButtonPressed: {
    opacity: 0.7,
  },

  sourceButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
  },
});