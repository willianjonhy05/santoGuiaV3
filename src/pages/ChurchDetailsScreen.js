import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons
  from '@expo/vector-icons/Ionicons';

import ChurchCelebrationItem
  from '../components/ChurchCelebrationItem';

import ClericCard
  from '../components/ClericCard';

import {
  buildChurchMapUrl,
  ChurchApiError,
  getChurchBySlug,
  getChurchCelebrations,
} from '../services/ChurchApi';

import {
  COLORS,
  SPACING,
} from '../constants/theme';


export default function ChurchDetailsScreen({
  route,
  navigation,
}) {
  const slug =
    route.params?.slug;

  const [
    church,
    setChurch,
  ] = useState(null);

  const [
    celebrations,
    setCelebrations,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    celebrationsError,
    setCelebrationsError,
  ] = useState(null);

  const [
    imageAspectRatio,
    setImageAspectRatio,
  ] = useState(16 / 9);


  const loadData =
    useCallback(
      async ({
        signal,
        ignoreCache = false,
      } = {}) => {
        if (!slug) {
          setError(
            'A igreja selecionada é inválida.'
          );

          setLoading(false);
          setRefreshing(false);

          return;
        }

        setError(null);
        setCelebrationsError(null);

        const [
          churchResult,
          celebrationsResult,
        ] = await Promise.allSettled([
          getChurchBySlug(
            slug,
            {
              signal,
              ignoreCache,
            }
          ),

          getChurchCelebrations(
            slug,
            {
              signal,
              ignoreCache,
            }
          ),
        ]);

        if (
          churchResult.status ===
          'fulfilled'
        ) {
          setChurch(
            churchResult.value
          );
        } else if (
          churchResult.reason?.name !==
          'AbortError'
        ) {
          const requestError =
            churchResult.reason;

          setError(
            requestError instanceof
              ChurchApiError
              ? requestError.message
              : (
                'Não foi possível ' +
                'carregar a igreja.'
              )
          );
        }

        if (
          celebrationsResult.status ===
          'fulfilled'
        ) {
          const celebrationsData =
            celebrationsResult.value;

          setCelebrations(
            Array.isArray(
              celebrationsData
            )
              ? celebrationsData
              : []
          );
        } else if (
          celebrationsResult.reason
            ?.name !== 'AbortError'
        ) {
          setCelebrations([]);

          setCelebrationsError(
            celebrationsResult.reason
              ?.message ||
            (
              'Não foi possível carregar ' +
              'as celebrações.'
            )
          );
        }

        setLoading(false);
        setRefreshing(false);
      },
      [slug]
    );


  useEffect(() => {
    const controller =
      new AbortController();

    loadData({
      signal:
        controller.signal,
    });

    return () => {
      controller.abort();
    };
  }, [loadData]);


  useEffect(() => {
    if (church?.nome) {
      navigation.setOptions({
        title:
          church.nome,
      });
    }
  }, [
    church?.nome,
    navigation,
  ]);


  function handleRefresh() {
    setRefreshing(true);

    loadData({
      ignoreCache: true,
    });
  }


  async function openUrl(url) {
    if (!url) {
      return;
    }

    try {
      const supported =
        await Linking.canOpenURL(
          url
        );

      if (!supported) {
        throw new Error(
          'URL não suportada.'
        );
      }

      await Linking.openURL(
        url
      );
    } catch (linkError) {
      console.error(
        'Erro ao abrir link:',
        linkError
      );

      Alert.alert(
        'Não foi possível abrir',
        (
          'Verifique se existe um ' +
          'aplicativo compatível instalado.'
        )
      );
    }
  }


  function openPhone() {
    if (!church?.telefone) {
      return;
    }

    const phone =
      church.telefone
        .split('/')[0]
        .replace(/[^\d+]/g, '');

    if (!phone) {
      Alert.alert(
        'Telefone indisponível',
        (
          'Não foi possível identificar ' +
          'um telefone válido.'
        )
      );

      return;
    }

    openUrl(
      `tel:${phone}`
    );
  }


  function openMap() {
    const mapUrl =
      buildChurchMapUrl(
        church
      );

    if (!mapUrl) {
      Alert.alert(
        'Localização indisponível',
        (
          'Esta igreja não possui ' +
          'coordenadas cadastradas.'
        )
      );

      return;
    }

    openUrl(mapUrl);
  }


  if (
    loading &&
    !church
  ) {
    return (
      <View
        style={
          styles.stateContainer
        }
      >
        <ActivityIndicator
          size="large"
          color={
            COLORS.primary
          }
        />

        <Text
          style={
            styles.stateText
          }
        >
          Carregando igreja...
        </Text>
      </View>
    );
  }


  if (
    error &&
    !church
  ) {
    return (
      <View
        style={
          styles.stateContainer
        }
      >
        <Ionicons
          name="alert-circle-outline"
          size={50}
          color={
            COLORS.primary
          }
        />

        <Text
          style={
            styles.errorTitle
          }
        >
          Igreja indisponível
        </Text>

        <Text
          style={
            styles.stateText
          }
        >
          {error}
        </Text>

        <Pressable
          onPress={() => {
            setLoading(true);

            loadData({
              ignoreCache: true,
            });
          }}
          style={({
            pressed,
          }) => [
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


  if (!church) {
    return null;
  }


  return (
    <ScrollView
      style={
        styles.container
      }
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
      refreshControl={
        <RefreshControl
          refreshing={
            refreshing
          }
          onRefresh={
            handleRefresh
          }
          colors={[
            COLORS.primary,
          ]}
          tintColor={
            COLORS.primary
          }
        />
      }
    >
      {church.imagem_url ? (
        <Image
          source={{
            uri:
              church.imagem_url,
          }}
          resizeMode="contain"
          accessibilityLabel={
            church.nome
          }
          onLoad={({
            nativeEvent,
          }) => {
            const {
              width,
              height,
            } =
              nativeEvent
                ?.source || {};

            if (
              width > 0 &&
              height > 0
            ) {
              setImageAspectRatio(
                width / height
              );
            }
          }}
          style={[
            styles.coverImage,
            {
              aspectRatio:
                imageAspectRatio,
            },
          ]}
        />
      ) : (
        <View
          style={
            styles.coverFallback
          }
        >
          <Ionicons
            name="business-outline"
            size={58}
            color={
              COLORS.primary
            }
          />
        </View>
      )}

      <View
        style={
          styles.header
        }
      >
        <Text
          style={
            styles.type
          }
        >
          {church.paroquia
            ? 'Paróquia'
            : church.capela
              ? 'Capela'
              : 'Igreja'}
        </Text>

        <Text
          style={
            styles.name
          }
        >
          {church.nome}
        </Text>

        {church.enderecoCompleto ? (
          <View
            style={
              styles.addressRow
            }
          >
            <Ionicons
              name="location-outline"
              size={19}
              color={
                COLORS.primary
              }
            />

            <Text
              style={
                styles.address
              }
            >
              {
                church
                  .enderecoCompleto
              }
            </Text>
          </View>
        ) : null}
      </View>

      <View
        style={
          styles.actions
        }
      >
        <Pressable
          onPress={
            openMap
          }
          style={({
            pressed,
          }) => [
            styles.actionButton,

            pressed &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name="map-outline"
            size={21}
            color={
              COLORS.primary
            }
          />

          <Text
            style={
              styles.actionText
            }
          >
            Como chegar
          </Text>
        </Pressable>

        {church.telefone ? (
          <Pressable
            onPress={
              openPhone
            }
            style={({
              pressed,
            }) => [
              styles.actionButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="call-outline"
              size={21}
              color={
                COLORS.primary
              }
            />

            <Text
              style={
                styles.actionText
              }
            >
              Ligar
            </Text>
          </Pressable>
        ) : null}

        {church.whatsapp_url ? (
          <Pressable
            onPress={() =>
              openUrl(
                church
                  .whatsapp_url
              )
            }
            style={({
              pressed,
            }) => [
              styles.actionButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="logo-whatsapp"
              size={21}
              color={
                COLORS.primary
              }
            />

            <Text
              style={
                styles.actionText
              }
            >
              WhatsApp
            </Text>
          </Pressable>
        ) : null}

        {church.instagram_url ? (
          <Pressable
            onPress={() =>
              openUrl(
                church
                  .instagram_url
              )
            }
            style={({
              pressed,
            }) => [
              styles.actionButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="logo-instagram"
              size={21}
              color={
                COLORS.primary
              }
            />

            <Text
              style={
                styles.actionText
              }
            >
              Instagram
            </Text>
          </Pressable>
        ) : null}
      </View>

      {church.descricao ? (
        <View
          style={
            styles.section
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Sobre
          </Text>

          <View
            style={
              styles.aboutCard
            }
          >
            <Text
              style={
                styles.aboutText
              }
            >
              {
                church
                  .descricao
              }
            </Text>
          </View>
        </View>
      ) : null}

      {church.clerigos?.length >
      0 ? (
        <View
          style={
            styles.section
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Clérigos
          </Text>

          <Text
            style={
              styles.sectionDescription
            }
          >
            Sacerdotes e clérigos
            vinculados a esta igreja.
          </Text>

          {church.clerigos.map(
            (cleric) => (
              <ClericCard
                key={String(
                  cleric.id ||
                  cleric.slug
                )}
                cleric={
                  cleric
                }
                onPress={() =>
                  navigation.navigate(
                    'ClericDetails',
                    {
                      slug:
                        cleric.slug,

                      initialCleric:
                        cleric,
                    }
                  )
                }
              />
            )
          )}
        </View>
      ) : null}

      <View
        style={
          styles.section
        }
      >
        <Text
          style={
            styles.sectionTitle
          }
        >
          Horários das celebrações
        </Text>

        {celebrationsError ? (
          <View
            style={
              styles.warning
            }
          >
            <Text
              style={
                styles.warningText
              }
            >
              {celebrationsError}
            </Text>
          </View>
        ) : null}

        {!celebrationsError &&
        celebrations.length === 0 ? (
          <View
            style={
              styles.empty
            }
          >
            <Ionicons
              name="time-outline"
              size={34}
              color={
                COLORS.textMuted
              }
            />

            <Text
              style={
                styles.emptyText
              }
            >
              Nenhuma celebração
              cadastrada para esta igreja.
            </Text>
          </View>
        ) : null}

        {celebrations.map(
          (celebration) => (
            <ChurchCelebrationItem
              key={
                `${
                  celebration
                    .categoria ||
                  'celebracao'
                }:` +
                `${celebration.id}`
              }
              celebration={
                celebration
              }
              church={
                church
              }
            />
          )
        )}
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  content: {
    padding:
      SPACING.md,

    paddingBottom:
      SPACING.xl * 2,
  },

  coverImage: {
    width: '100%',
    borderRadius: 18,
    backgroundColor:
      COLORS.surface,
  },

  coverFallback: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor:
      COLORS.surface,
  },

  header: {
    marginTop:
      SPACING.lg,
  },

  type: {
    color:
      COLORS.primary,

    fontSize: 12,
    fontWeight: '800',
    textTransform:
      'uppercase',
  },

  name: {
    marginTop:
      SPACING.xs,

    color:
      COLORS.text,

    fontSize: 27,
    fontWeight: '900',
    lineHeight: 34,
  },

  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginTop:
      SPACING.md,
  },

  address: {
    flex: 1,
    color:
      COLORS.textMuted,

    fontSize: 14,
    lineHeight: 21,
  },

  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop:
      SPACING.lg,
  },

  actionButton: {
    minWidth: 105,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor:
      COLORS.border,

    borderRadius: 14,
    backgroundColor:
      COLORS.surface,
  },

  actionText: {
    color:
      COLORS.primary,

    fontSize: 12,
    fontWeight: '800',
  },

  section: {
    marginTop:
      SPACING.xl,
  },

  sectionTitle: {
    marginBottom:
      SPACING.md,

    color:
      COLORS.text,

    fontSize: 20,
    fontWeight: '900',
  },

  sectionDescription: {
    marginTop:
      -SPACING.sm,

    marginBottom:
      SPACING.md,

    color:
      COLORS.textMuted,

    fontSize: 13,
    lineHeight: 19,
  },

  aboutCard: {
    padding:
      SPACING.md,

    borderWidth: 1,
    borderColor:
      COLORS.border,

    borderRadius: 14,
    backgroundColor:
      COLORS.surface,
  },

  aboutText: {
    color:
      COLORS.text,

    fontSize: 15,
    lineHeight: 24,
  },

  empty: {
    alignItems: 'center',
    padding:
      SPACING.xl,

    borderRadius: 14,
    backgroundColor:
      COLORS.surface,
  },

  emptyText: {
    marginTop:
      SPACING.sm,

    color:
      COLORS.textMuted,

    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

  warning: {
    padding:
      SPACING.md,

    borderWidth: 1,
    borderColor:
      COLORS.border,

    borderRadius: 14,
    backgroundColor:
      COLORS.surface,
  },

  warningText: {
    color:
      COLORS.textMuted,

    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding:
      SPACING.xl,

    backgroundColor:
      COLORS.background,
  },

  stateText: {
    marginTop:
      SPACING.md,

    color:
      COLORS.textMuted,

    lineHeight: 20,
    textAlign: 'center',
  },

  errorTitle: {
    marginTop:
      SPACING.md,

    color:
      COLORS.text,

    fontSize: 19,
    fontWeight: '800',
  },

  retryButton: {
    marginTop:
      SPACING.lg,

    paddingHorizontal:
      SPACING.lg,

    paddingVertical:
      SPACING.md,

    borderRadius: 12,
    backgroundColor:
      COLORS.primary,
  },

  retryButtonText: {
    color:
      COLORS.surface,

    fontWeight: '800',
  },

  pressed: {
    opacity: 0.72,
  },
});