import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import ScreenContainer
  from '../components/ScreenContainer';

import CustomButton
  from '../components/CustomButton';

import {
  useFavorites,
} from '../contexts/FavoritesContext';

import {
  COLORS,
  SPACING,
} from '../constants/theme';

export default function ProfileScreen({
  navigation,
}) {
  const {
    favorites,
    isReady,
  } = useFavorites();

  const favoritesTitle = isReady
    ? `Minhas igrejas favoritas (${favorites.length})`
    : 'Minhas igrejas favoritas';

  async function openSocialLink(url) {
    try {
      const supported =
        await Linking.canOpenURL(url);

      if (!supported) {
        Alert.alert(
          'Não foi possível abrir',
          'Este endereço não está disponível no momento.'
        );

        return;
      }

      await Linking.openURL(url);
    } catch {
      Alert.alert(
        'Erro',
        'Não foi possível abrir este endereço.'
      );
    }
  }

  const socialNetworks = [
    {
      name: 'Instagram',
      icon: 'logo-instagram',
      url: 'https://www.instagram.com/santoguia',
    },
    {
      name: 'X',
      icon: 'logo-twitter',
      url: 'https://x.com/santoguia',
    },
    {
      name: 'E-mail',
      icon: 'mail-outline',
      url: 'mailto:contato@santoguia.com.br',
    },
    {
      name: 'Facebook',
      icon: 'logo-facebook',
      url: 'https://www.facebook.com/santoguia',
    },
  ];

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text style={styles.title}>
          Mais opções
        </Text>

        <Text style={styles.subtitle}>
          Configurações, informações e outros recursos do aplicativo Santo Guia.
        </Text>

        <View style={styles.links}>
          <CustomButton
            title={favoritesTitle}
            variant="secondary"
            onPress={() =>
              navigation.navigate(
                'Favorites'
              )
            }
          />

          <CustomButton
            title="Contato"
            variant="secondary"
            onPress={() =>
              navigation.navigate(
                'Contact'
              )
            }
          />
        </View>

        <View style={styles.socialSection}>
          <Text style={styles.sectionTitle}>
            Acompanhe o Santo Guia
          </Text>

          <Text style={styles.sectionSubtitle}>
            Siga nossas redes sociais e fique por dentro das novidades.
          </Text>

          <View style={styles.socialGrid}>
            {socialNetworks.map(
              (social) => (
                <Pressable
                  key={social.name}
                  style={({ pressed }) => [
                    styles.socialButton,
                    pressed &&
                      styles.socialButtonPressed,
                  ]}
                  onPress={() =>
                    openSocialLink(
                      social.url
                    )
                  }
                  accessibilityRole="link"
                  accessibilityLabel={
                    `Abrir ${social.name}`
                  }
                >
                  <View
                    style={
                      styles.socialIcon
                    }
                  >
                    <Ionicons
                      name={social.icon}
                      size={24}
                      color={
                        COLORS.primary
                      }
                    />
                  </View>

                  <Text
                    style={
                      styles.socialName
                    }
                  >
                    {social.name}
                  </Text>

                  <Ionicons
                    name="open-outline"
                    size={17}
                    color={
                      COLORS.textMuted
                    }
                  />
                </Pressable>
              )
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
  },

  subtitle: {
    marginTop: SPACING.xs,
    color: COLORS.textMuted,
    lineHeight: 21,
  },

  links: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },

  socialSection: {
    marginTop: SPACING.xl,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },

  sectionSubtitle: {
    marginTop: SPACING.xs,
    color: COLORS.textMuted,
    lineHeight: 20,
  },

  socialGrid: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },

  socialButton: {
    minHeight: 64,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  socialButtonPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  socialIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  socialName: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
});