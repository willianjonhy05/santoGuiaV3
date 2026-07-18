import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getClericBySlug,
} from '../services/ChurchApi';

import {
  COLORS,
  SPACING,
} from '../constants/theme';


export default function ClericDetailsScreen({
  route,
}) {
  const {
    slug,
    initialCleric = null,
  } = route?.params ?? {};

  const [
    cleric,
    setCleric,
  ] = useState(initialCleric);

  const [
    loading,
    setLoading,
  ] = useState(!initialCleric);

  const [
    error,
    setError,
  ] = useState('');


  const loadCleric = useCallback(
    async (signal) => {
      if (!slug) {
        setError(
          'O clérigo não foi informado.'
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const data =
          await getClericBySlug(
            slug,
            {
              signal,
            }
          );

        setCleric(data);
      } catch (loadError) {
        if (
          loadError?.name ===
          'AbortError'
        ) {
          return;
        }

        console.log(
          'Erro ao carregar clérigo:',
          loadError
        );

        setError(
          loadError?.message ||
          'Não foi possível carregar as informações do clérigo.'
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [slug]
  );


  useEffect(() => {
    const controller =
      new AbortController();

    loadCleric(
      controller.signal
    );

    return () => {
      controller.abort();
    };
  }, [loadCleric]);


  const contactLinks =
    useMemo(() => {
      if (!cleric) {
        return [];
      }

      const instagramUrl =
        buildSocialUrl(
          cleric.instagram_url ||
          cleric.instagram,
          'https://instagram.com/'
        );

      const facebookUrl =
        buildSocialUrl(
          cleric.facebook,
          'https://facebook.com/'
        );

      const youtubeUrl =
        buildYouTubeUrl(
          cleric.youtube
        );

      return [
        cleric.telefone
          ? {
              key: 'telefone',
              label: 'Telefone',
              value: cleric.telefone,
              icon: 'call-outline',

              url:
                `tel:${
                  cleric.telefone
                    .replace(
                      /[^\d+]/g,
                      ''
                    )
                }`,
            }
          : null,

        cleric.email
          ? {
              key: 'email',
              label: 'E-mail',
              value: cleric.email,
              icon: 'mail-outline',

              url:
                `mailto:${cleric.email}`,
            }
          : null,

        instagramUrl
          ? {
              key: 'instagram',
              label: 'Instagram',

              value:
                formatHandle(
                  cleric.instagram
                ),

              icon:
                'logo-instagram',

              url:
                instagramUrl,
            }
          : null,

        facebookUrl
          ? {
              key: 'facebook',
              label: 'Facebook',

              value:
                formatProfileValue(
                  cleric.facebook
                ),

              icon:
                'logo-facebook',

              url:
                facebookUrl,
            }
          : null,

        youtubeUrl
          ? {
              key: 'youtube',
              label: 'YouTube',

              value:
                formatProfileValue(
                  cleric.youtube,
                  'Abrir canal'
                ),

              icon:
                'logo-youtube',

              url:
                youtubeUrl,
            }
          : null,

        cleric.detalhe_url
          ? {
              key: 'site',
              label: 'Perfil no site',
              value: 'Abrir página',
              icon: 'globe-outline',
              url: cleric.detalhe_url,
            }
          : null,
      ].filter(Boolean);
    }, [cleric]);


  async function openLink(url) {
    try {
      await Linking.openURL(url);
    } catch (linkError) {
      console.log(
        'Erro ao abrir link:',
        linkError
      );

      Alert.alert(
        'Não foi possível abrir',
        'Verifique se existe um aplicativo compatível instalado.'
      );
    }
  }


  if (!cleric && loading) {
    return <LoadingState />;
  }


  if (!cleric) {
    return (
      <View
        style={
          styles.stateContainer
        }
      >
        <Ionicons
          name="alert-circle-outline"
          size={46}
          color={COLORS.primary}
        />

        <Text
          style={
            styles.stateTitle
          }
        >
          Não foi possível carregar
        </Text>

        <Text
          style={
            styles.stateText
          }
        >
          {
            error ||
            'Tente novamente em instantes.'
          }
        </Text>

        <Pressable
          onPress={() =>
            loadCleric()
          }
          style={({ pressed }) => [
            styles.retryButton,

            pressed &&
            styles.pressed,
          ]}
        >
          <Text
            style={
              styles.retryButtonText
            }
          >
            Tentar novamente
          </Text>
        </Pressable>
      </View>
    );
  }


  const badges = [
    cleric.paroco
      ? 'Pároco'
      : null,

    cleric.monsenhor
      ? 'Monsenhor'
      : null,

    cleric.vigario_arq
      ? 'Vigário'
      : null,

    cleric.religioso
      ? 'Religioso'
      : null,
  ].filter(Boolean);


  return (
    <ScrollView
      showsVerticalScrollIndicator={
        false
      }
      contentContainerStyle={
        styles.content
      }
    >
      <View
        style={
          styles.photoWrapper
        }
      >
        {
          cleric.foto_url
            ? (
              <Image
                source={{
                  uri:
                    cleric.foto_url,
                }}
                style={
                  styles.photo
                }
                resizeMode="cover"

                accessibilityLabel={
                  `Foto de ${cleric.nome}`
                }
              />
            )
            : (
              <View
                style={
                  styles.photoFallback
                }
              >
                <Ionicons
                  name="person-outline"
                  size={64}
                  color={
                    COLORS.primary
                  }
                />
              </View>
            )
        }

        {
          cleric.situacao
            ? (
              <View
                style={
                  styles.statusBadge
                }
              >
                <View
                  style={
                    styles.statusDot
                  }
                />

                <Text
                  style={
                    styles.statusText
                  }
                >
                  {
                    formatEnum(
                      cleric.situacao
                    )
                  }
                </Text>
              </View>
            )
            : null
        }
      </View>


      <View
        style={
          styles.header
        }
      >
        <Text
          style={
            styles.name
          }
        >
          {cleric.nome}
        </Text>

        {
          cleric.titulo
            ? (
              <Text
                style={
                  styles.title
                }
              >
                {cleric.titulo}
              </Text>
            )
            : null
        }

        {
          badges.length > 0
            ? (
              <View
                style={
                  styles.badgesContainer
                }
              >
                {
                  badges.map(
                    (badge) => (
                      <View
                        key={badge}
                        style={
                          styles.badge
                        }
                      >
                        <Text
                          style={
                            styles.badgeText
                          }
                        >
                          {badge}
                        </Text>
                      </View>
                    )
                  )
                }
              </View>
            )
            : null
        }
      </View>


      <Section
        title="Informações eclesiásticas"
        icon="book-outline"
      >
        <InfoRow
          label="Grau de ordem"
          value={
            formatEnum(
              cleric.grau_ordem
            )
          }
        />

        <InfoRow
          label="Situação"
          value={
            formatEnum(
              cleric.situacao
            )
          }
        />

        <InfoRow
          label="Ofício atual"
          value={
            cleric.oficio
          }
        />

        {
          cleric.religioso
            ? (
              <>
                <InfoRow
                  label="Ordem ou congregação"
                  value={
                    cleric.ordem
                  }
                />

                <InfoRow
                  label="Sigla da ordem"
                  value={
                    cleric.sigla_ordem
                  }
                />
              </>
            )
            : null
        }
      </Section>


      <Section
        title="Dados pessoais"
        icon="person-outline"
      >
        <InfoRow
          label="Data de nascimento"
          value={
            formatDate(
              cleric.data_nasc
            )
          }
        />

        <InfoRow
          label="Idade"
          value={
            formatYears(
              cleric.idade
            )
          }
        />
      </Section>


      <Section
        title="Ordenação e ministério"
        icon="calendar-outline"
      >
        <InfoRow
          label="Ordenação diaconal"
          value={
            formatDate(
              cleric
                .data_ordenacao_diaconal
            )
          }
        />

        <InfoRow
          label="Ordenação presbiteral"
          value={
            formatDate(
              cleric
                .data_ordenacao_presbiteral
            )
          }
        />

        <InfoRow
          label="Ordenação episcopal"
          value={
            formatDate(
              cleric
                .data_ordenacao_episcopal
            )
          }
        />

        <InfoRow
          label="Tempo de ministério"
          value={
            formatYears(
              cleric.idade_ministerio
            )
          }
        />
      </Section>


      {
        cleric.biografia
          ? (
            <Section
              title="Biografia"
              icon="document-text-outline"
            >
              <Text
                style={
                  styles.biography
                }
              >
                {cleric.biografia}
              </Text>
            </Section>
          )
          : null
      }


      {
        contactLinks.length > 0
          ? (
            <Section
              title="Contato e redes sociais"
              icon="share-social-outline"
            >
              <View
                style={
                  styles.actionsContainer
                }
              >
                {
                  contactLinks.map(
                    (item) => (
                      <ContactButton
                        key={item.key}
                        icon={item.icon}
                        label={item.label}
                        value={item.value}

                        onPress={() =>
                          openLink(
                            item.url
                          )
                        }
                      />
                    )
                  )
                }
              </View>
            </Section>
          )
          : null
      }


      {
        loading
          ? (
            <View
              style={
                styles.updatingContainer
              }
            >
              <ActivityIndicator
                size="small"
                color={
                  COLORS.primary
                }
              />

              <Text
                style={
                  styles.updatingText
                }
              >
                Atualizando informações...
              </Text>
            </View>
          )
          : null
      }
    </ScrollView>
  );
}


function LoadingState() {
  return (
    <View
      style={
        styles.stateContainer
      }
    >
      <ActivityIndicator
        size="large"
        color={COLORS.primary}
      />

      <Text
        style={
          styles.stateText
        }
      >
        Carregando informações...
      </Text>
    </View>
  );
}


function Section({
  title,
  icon,
  children,
}) {
  return (
    <View
      style={
        styles.section
      }
    >
      <View
        style={
          styles.sectionHeader
        }
      >
        <View
          style={
            styles.sectionIcon
          }
        >
          <Ionicons
            name={icon}
            size={19}
            color={COLORS.primary}
          />
        </View>

        <Text
          style={
            styles.sectionTitle
          }
        >
          {title}
        </Text>
      </View>

      <View
        style={
          styles.sectionContent
        }
      >
        {children}
      </View>
    </View>
  );
}


function InfoRow({
  label,
  value,
}) {
  if (!hasValue(value)) {
    return null;
  }

  return (
    <View
      style={
        styles.infoRow
      }
    >
      <Text
        style={
          styles.infoLabel
        }
      >
        {label}
      </Text>

      <Text
        style={
          styles.infoValue
        }
      >
        {String(value)}
      </Text>
    </View>
  );
}


function ContactButton({
  icon,
  label,
  value,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"

      accessibilityLabel={
        `${label}: ${value}`
      }

      style={({ pressed }) => [
        styles.contactButton,

        pressed &&
        styles.pressed,
      ]}
    >
      <View
        style={
          styles.contactIcon
        }
      >
        <Ionicons
          name={icon}
          size={21}
          color={COLORS.primary}
        />
      </View>

      <View
        style={
          styles.contactTextContainer
        }
      >
        <Text
          style={
            styles.contactLabel
          }
        >
          {label}
        </Text>

        <Text
          style={
            styles.contactValue
          }
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>

      <Ionicons
        name="open-outline"
        size={17}
        color={COLORS.textMuted}
      />
    </Pressable>
  );
}


function hasValue(value) {
  return (
    value !== null &&
    value !== undefined &&
    value !== ''
  );
}


function formatDate(value) {
  if (!value) {
    return '';
  }

  const match =
    String(value).match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

  if (!match) {
    return String(value);
  }

  const [
    ,
    year,
    month,
    day,
  ] = match;

  return (
    `${day}/${month}/${year}`
  );
}


function formatYears(value) {
  if (!hasValue(value)) {
    return '';
  }

  const years =
    Number(value);

  if (!Number.isFinite(years)) {
    return String(value);
  }

  return (
    `${years} ${
      years === 1
        ? 'ano'
        : 'anos'
    }`
  );
}


function formatEnum(value) {
  if (!value) {
    return '';
  }

  const text =
    String(value)
      .replace(
        /_/g,
        ' '
      )
      .toLocaleLowerCase(
        'pt-BR'
      );

  return (
    text
      .charAt(0)
      .toLocaleUpperCase(
        'pt-BR'
      ) +
    text.slice(1)
  );
}


function buildSocialUrl(
  value,
  baseUrl
) {
  if (!value) {
    return null;
  }

  const text =
    String(value).trim();

  if (!text) {
    return null;
  }

  if (
    /^https?:\/\//i.test(text)
  ) {
    return text;
  }

  const profile =
    text
      .replace(/^@/, '')
      .replace(/^\/+/, '');

  return profile
    ? `${baseUrl}${profile}`
    : null;
}


function buildYouTubeUrl(value) {
  if (!value) {
    return null;
  }

  const text =
    String(value).trim();

  if (!text) {
    return null;
  }

  if (
    /^https?:\/\//i.test(text)
  ) {
    return text;
  }

  const channel =
    text.replace(/^\/+/, '');

  return channel
    ? `https://youtube.com/${channel}`
    : null;
}


function formatHandle(value) {
  if (!value) {
    return 'Abrir perfil';
  }

  const text =
    String(value).trim();

  if (
    /^https?:\/\//i.test(text)
  ) {
    return 'Abrir perfil';
  }

  return text.startsWith('@')
    ? text
    : `@${text}`;
}


function formatProfileValue(
  value,
  fallback = 'Abrir perfil'
) {
  if (!value) {
    return fallback;
  }

  const text =
    String(value).trim();

  return /^https?:\/\//i.test(text)
    ? fallback
    : text;
}


const styles =
  StyleSheet.create({
    content: {
      padding: SPACING.md,
      paddingBottom: SPACING.xl,
    },

    stateContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.xl,

      backgroundColor:
        COLORS.background ||
        COLORS.surface,
    },

    stateTitle: {
      marginTop: SPACING.md,
      color: COLORS.text,
      fontSize: 20,
      fontWeight: '900',
      textAlign: 'center',
    },

    stateText: {
      marginTop: SPACING.sm,
      color: COLORS.textMuted,
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
    },

    retryButton: {
      marginTop: SPACING.lg,
      paddingHorizontal:
        SPACING.lg,
      paddingVertical:
        SPACING.sm,
      borderRadius: 12,
      backgroundColor:
        COLORS.primary,
    },

    retryButtonText: {
      color:
        COLORS.onPrimary ||
        '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },

    photoWrapper: {
      position: 'relative',
      width: '100%',
    },

    photo: {
      width: '100%',
      aspectRatio: 16 / 9,
      borderRadius: 20,
      backgroundColor:
        COLORS.border,
    },

    photoFallback: {
      width: '100%',
      aspectRatio: 16 / 9,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
    },

    statusBadge: {
      position: 'absolute',
      right: SPACING.sm,
      bottom: SPACING.sm,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
    },

    statusDot: {
      width: 8,
      height: 8,
      marginRight: 6,
      borderRadius: 4,
      backgroundColor:
        COLORS.primary,
    },

    statusText: {
      color: COLORS.text,
      fontSize: 12,
      fontWeight: '800',
    },

    header: {
      marginTop: SPACING.lg,
    },

    name: {
      color: COLORS.text,
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '900',
    },

    title: {
      marginTop: SPACING.xs,
      color: COLORS.primary,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '700',
    },

    badgesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: SPACING.sm,
      marginHorizontal: -3,
    },

    badge: {
      margin: 3,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
    },

    badgeText: {
      color: COLORS.text,
      fontSize: 12,
      fontWeight: '700',
    },

    section: {
      marginTop: SPACING.lg,
      overflow: 'hidden',
      borderRadius: 16,
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.md,
      paddingBottom: SPACING.sm,
    },

    sectionIcon: {
      width: 34,
      height: 34,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.sm,
      borderRadius: 10,
      backgroundColor:
        COLORS.border,
    },

    sectionTitle: {
      flex: 1,
      color: COLORS.text,
      fontSize: 16,
      fontWeight: '900',
    },

    sectionContent: {
      paddingHorizontal:
        SPACING.md,
      paddingBottom:
        SPACING.md,
    },

    infoRow: {
      paddingVertical:
        SPACING.sm,

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        COLORS.border,
    },

    infoLabel: {
      color: COLORS.textMuted,
      fontSize: 12,
      fontWeight: '700',
    },

    infoValue: {
      marginTop: 4,
      color: COLORS.text,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '600',
    },

    biography: {
      color: COLORS.text,
      fontSize: 15,
      lineHeight: 24,
    },

    actionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -4,
    },

    contactButton: {
      flexGrow: 1,
      flexBasis: '45%',
      minWidth: 145,
      flexDirection: 'row',
      alignItems: 'center',
      margin: 4,
      padding: SPACING.sm,
      borderRadius: 13,

      backgroundColor:
        COLORS.background ||
        COLORS.surface,

      borderWidth: 1,
      borderColor:
        COLORS.border,
    },

    contactIcon: {
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.sm,
      borderRadius: 11,
      backgroundColor:
        COLORS.surface,
    },

    contactTextContainer: {
      flex: 1,
      marginRight: 6,
    },

    contactLabel: {
      color: COLORS.text,
      fontSize: 13,
      fontWeight: '800',
    },

    contactValue: {
      marginTop: 2,
      color: COLORS.textMuted,
      fontSize: 11,
    },

    updatingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: SPACING.md,
    },

    updatingText: {
      marginLeft: SPACING.xs,
      color: COLORS.textMuted,
      fontSize: 12,
    },

    pressed: {
      opacity: 0.7,
    },
  });