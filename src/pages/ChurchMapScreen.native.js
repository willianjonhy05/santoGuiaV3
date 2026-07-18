import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import MapView, {
  Callout,
  Marker,
  PROVIDER_GOOGLE,
} from 'react-native-maps';

import * as Location from 'expo-location';

import ChurchMapCard from '../components/ChurchMapCard';

import {
  buildChurchMapsUrl,
  ChurchMapApiError,
  getChurchesForMap,
} from '../services/ChurchMap';

import {
  COLORS,
  SPACING,
} from '../constants/theme';

const DEFAULT_REGION = {
  latitude: -5.0892,
  longitude: -42.8016,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

export default function ChurchMapScreen() {
  const mapRef = useRef(null);
  const listRef = useRef(null);

  const { width } =
    useWindowDimensions();

  const [churches, setChurches] =
    useState([]);

  const [userLocation, setUserLocation] =
    useState(null);

  const [
    selectedChurchId,
    setSelectedChurchId,
  ] = useState(null);

  const [locationDenied, setLocationDenied] =
    useState(false);

  const [mapReady, setMapReady] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const cardWidth = Math.min(
    width - SPACING.md * 2,
    350
  );

  const mapCoordinates = useMemo(
    () =>
      churches.map((church) => ({
        latitude: church.latitude,
        longitude: church.longitude,
      })),
    [churches]
  );

  const loadChurches = useCallback(
    async ({
      signal,
    } = {}) => {
      setLoading(true);
      setError(null);

      let currentLocation = null;

      try {
        const permission =
          await Location
            .requestForegroundPermissionsAsync();

        const permissionGranted =
          permission.status === 'granted';

        setLocationDenied(
          !permissionGranted
        );

        if (permissionGranted) {
          const position =
            await Location
              .getCurrentPositionAsync({
                accuracy:
                  Location.Accuracy
                    .Balanced,
              });

          currentLocation = {
            latitude:
              position.coords.latitude,

            longitude:
              position.coords.longitude,
          };

          setUserLocation(
            currentLocation
          );
        }
      } catch (locationError) {
        console.warn(
          'Não foi possível obter a localização:',
          locationError
        );
      }

      try {
        const response =
          await getChurchesForMap({
            latitude:
              currentLocation
                ?.latitude,

            longitude:
              currentLocation
                ?.longitude,

            signal,
          });

        setChurches(
          response.churches
        );

        setSelectedChurchId(
          response.churches[0]?.id ??
            null
        );
      } catch (requestError) {
        if (
          requestError?.name ===
          'AbortError'
        ) {
          return;
        }

        console.error(
          'Erro ao carregar mapa:',
          requestError
        );

        setError(
          requestError instanceof
          ChurchMapApiError
            ? requestError.message
            : 'Não foi possível carregar as igrejas.'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const controller =
      new AbortController();

    loadChurches({
      signal: controller.signal,
    });

    return () => {
      controller.abort();
    };
  }, [loadChurches]);

  useEffect(() => {
    if (
      !mapReady ||
      mapCoordinates.length === 0
    ) {
      return;
    }

    const coordinates =
      userLocation
        ? [
            ...mapCoordinates,
            userLocation,
          ]
        : mapCoordinates;

    if (coordinates.length === 1) {
      mapRef.current?.animateToRegion(
        {
          ...coordinates[0],
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        },
        500
      );

      return;
    }

    mapRef.current?.fitToCoordinates(
      coordinates,
      {
        edgePadding: {
          top: 100,
          right: 50,
          bottom: 230,
          left: 50,
        },
        animated: true,
      }
    );
  }, [
    mapReady,
    mapCoordinates,
    userLocation,
  ]);

  function focusChurch(
    church,
    scrollList = true
  ) {
    if (!church) {
      return;
    }

    setSelectedChurchId(
      church.id
    );

    mapRef.current?.animateToRegion(
      {
        latitude:
          church.latitude,

        longitude:
          church.longitude,

        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      },
      450
    );

    if (scrollList) {
      const index =
        churches.findIndex(
          (item) =>
            item.id === church.id
        );

      if (index >= 0) {
        listRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }
    }
  }

  function centerOnUser() {
    if (!userLocation) {
      return;
    }

    mapRef.current?.animateToRegion(
      {
        ...userLocation,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      450
    );
  }

  async function openDirections(
    church
  ) {
    const url =
      buildChurchMapsUrl(church);

    if (!url) {
      Alert.alert(
        'Localização indisponível',
        'Esta igreja não possui uma localização válida.'
      );

      return;
    }

    try {
      const canOpen =
        await Linking.canOpenURL(url);

      if (!canOpen) {
        throw new Error(
          'URL não suportada'
        );
      }

      await Linking.openURL(url);
    } catch (linkError) {
      console.error(
        'Erro ao abrir mapa:',
        linkError
      );

      Alert.alert(
        'Não foi possível abrir o mapa',
        'Tente novamente em alguns instantes.'
      );
    }
  }

  if (
    loading &&
    churches.length === 0
  ) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.stateTitle}>
          Carregando igrejas...
        </Text>

        <Text style={styles.stateText}>
          Aguarde enquanto preparamos o
          mapa.
        </Text>
      </View>
    );
  }

  if (
    error &&
    churches.length === 0
  ) {
    return (
      <View style={styles.stateContainer}>
        <Ionicons
          name="map-outline"
          size={52}
          color={COLORS.primary}
        />

        <Text style={styles.stateTitle}>
          Não foi possível carregar
        </Text>

        <Text style={styles.stateText}>
          {error}
        </Text>

        <Pressable
          onPress={() =>
            loadChurches()
          }
          style={({ pressed }) => [
            styles.retryButton,
            pressed &&
              styles.buttonPressed,
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

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={
          Platform.OS === 'android'
            ? PROVIDER_GOOGLE
            : undefined
        }
        initialRegion={
          DEFAULT_REGION
        }
        showsUserLocation={
          Boolean(userLocation)
        }
        showsMyLocationButton={
          false
        }
        loadingEnabled
        onMapReady={() =>
          setMapReady(true)
        }
      >
        {churches.map((church) => (
          <Marker
            key={church.id}
            coordinate={{
              latitude:
                church.latitude,

              longitude:
                church.longitude,
            }}
            title={church.name}
            description={
              church.addressLine
            }
            pinColor={
              church.id ===
              selectedChurchId
                ? COLORS.primary
                : undefined
            }
            onPress={() =>
              focusChurch(
                church,
                true
              )
            }
          >
            <Callout
              onPress={() =>
                openDirections(church)
              }
            >
              <View
                style={
                  styles.callout
                }
              >
                <Text
                  style={
                    styles.calloutTitle
                  }
                >
                  {church.name}
                </Text>

                {church.addressLine ? (
                  <Text
                    style={
                      styles.calloutText
                    }
                  >
                    {church.addressLine}
                  </Text>
                ) : null}

                <Text
                  style={
                    styles.calloutAction
                  }
                >
                  Toque para traçar rota
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.summary}>
        <Ionicons
          name="business-outline"
          size={18}
          color={COLORS.primary}
        />

        <View style={styles.summaryContent}>
          <Text style={styles.summaryTitle}>
            {churches.length}{' '}
            {churches.length === 1
              ? 'igreja encontrada'
              : 'igrejas encontradas'}
          </Text>

          <Text style={styles.summaryText}>
            {locationDenied
              ? 'Ordenadas por nome. Permita a localização para ver as mais próximas.'
              : 'Ordenadas pela distância da sua localização.'}
          </Text>
        </View>
      </View>

      <View style={styles.mapActions}>
        {userLocation ? (
          <Pressable
            onPress={centerOnUser}
            accessibilityLabel="Centralizar em minha localização"
            style={({ pressed }) => [
              styles.mapActionButton,
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Ionicons
              name="locate"
              size={23}
              color={COLORS.primary}
            />
          </Pressable>
        ) : null}

        <Pressable
          onPress={() =>
            loadChurches()
          }
          accessibilityLabel="Atualizar mapa"
          style={({ pressed }) => [
            styles.mapActionButton,
            pressed &&
              styles.buttonPressed,
          ]}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
            />
          ) : (
            <Ionicons
              name="refresh"
              size={23}
              color={COLORS.primary}
            />
          )}
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        horizontal
        data={churches}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={({ item }) => (
          <ChurchMapCard
            church={item}
            selected={
              item.id ===
              selectedChurchId
            }
            onPress={() =>
              focusChurch(
                item,
                false
              )
            }
            onOpenDirections={() =>
              openDirections(item)
            }
            style={{
              width: cardWidth,
            }}
          />
        )}
        contentContainerStyle={
          styles.churchListContent
        }
        showsHorizontalScrollIndicator={
          false
        }
        snapToInterval={
          cardWidth + SPACING.sm
        }
        decelerationRate="fast"
        onScrollToIndexFailed={(
          info
        ) => {
          setTimeout(() => {
            listRef.current
              ?.scrollToOffset({
                offset:
                  info.index *
                  (cardWidth +
                    SPACING.sm),

                animated: true,
              });
          }, 100);
        }}
        style={styles.churchList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },

  summary: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    right: 78,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor:
      COLORS.surface,
  },

  summaryContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },

  summaryTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },

  summaryText: {
    marginTop: 3,
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },

  mapActions: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    gap: SPACING.sm,
  },

  mapActionButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor:
      COLORS.surface,
  },

  churchList: {
    position: 'absolute',
    right: 0,
    bottom: SPACING.md,
    left: 0,
  },

  churchListContent: {
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },

  callout: {
    width: 220,
    padding: SPACING.sm,
  },

  calloutTitle: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '800',
  },

  calloutText: {
    marginTop: 4,
    color: '#555555',
    fontSize: 12,
    lineHeight: 17,
  },

  calloutAction: {
    marginTop: SPACING.sm,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },

  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor:
      COLORS.background,
  },

  stateTitle: {
    marginTop: SPACING.md,
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },

  stateText: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    backgroundColor:
      COLORS.primary,
  },

  retryButtonText: {
    color: COLORS.surface,
    fontWeight: '800',
  },

  buttonPressed: {
    opacity: 0.7,
  },
});