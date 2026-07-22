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
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import Ionicons from
  '@expo/vector-icons/Ionicons';

import * as Location from
  'expo-location';

import ChurchMapCard from
  '../components/ChurchMapCard';

import OpenStreetMapView from
  '../components/OpenStreetMapView';

import {
  buildChurchMapsUrl,
  ChurchMapApiError,
  getCachedChurchesForMap,
  refreshChurchesForMap,
  sortChurchesForMap,
} from '../services/ChurchMap';

import {
  COLORS,
  SPACING,
} from '../constants/theme';

const OSM_COPYRIGHT_URL =
  'https://www.openstreetmap.org/copyright';

function isValidLocation(
  location
) {
  return (
    Number.isFinite(
      location?.latitude
    ) &&
    Number.isFinite(
      location?.longitude
    )
  );
}

function formatLastUpdate(
  savedAt
) {
  if (!Number.isFinite(savedAt)) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat(
      'pt-BR',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    ).format(
      new Date(savedAt)
    );
  } catch {
    return null;
  }
}

export default function ChurchMapScreen() {
  const mapRef = useRef(null);
  const listRef = useRef(null);
  const locationRef = useRef(null);
  const churchesRef = useRef([]);

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

  const [
    locationDenied,
    setLocationDenied,
  ] = useState(false);

  const [mapReady, setMapReady] =
    useState(false);

  const [mapError, setMapError] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [cacheInfo, setCacheInfo] =
    useState(null);

  const [syncWarning, setSyncWarning] =
    useState(null);

  const cardWidth = Math.min(
    width - SPACING.md * 2,
    350
  );

  useEffect(() => {
    churchesRef.current =
      churches;
  }, [churches]);

  useEffect(() => {
    locationRef.current =
      userLocation;
  }, [userLocation]);

  const applyResponse =
    useCallback((response) => {
      const responseChurches =
        Array.isArray(
          response?.churches
        )
          ? response.churches
          : [];

      churchesRef.current =
        responseChurches;

      setChurches(
        responseChurches
      );

      setCacheInfo(
        response?.cache ??
        null
      );

      setSyncWarning(
        response?.syncError ??
        null
      );

      setSelectedChurchId(
        (currentId) => {
          const currentExists =
            responseChurches.some(
              (church) =>
                String(church.id) ===
                String(currentId)
            );

          if (currentExists) {
            return currentId;
          }

          return (
            responseChurches[0]
              ?.id ??
            null
          );
        }
      );
    }, []);

  const requestUserLocation =
    useCallback(async () => {
      try {
        const permission =
          await Location
            .requestForegroundPermissionsAsync();

        const permissionGranted =
          permission.status ===
          'granted';

        setLocationDenied(
          !permissionGranted
        );

        if (!permissionGranted) {
          return null;
        }

        let position =
          await Location
            .getLastKnownPositionAsync();

        if (!position) {
          position =
            await Location
              .getCurrentPositionAsync({
                accuracy:
                  Location.Accuracy
                    .Balanced,
              });
        }

        const location = {
          latitude:
            Number(
              position
                ?.coords
                ?.latitude
            ),

          longitude:
            Number(
              position
                ?.coords
                ?.longitude
            ),
        };

        if (
          !isValidLocation(location)
        ) {
          return null;
        }

        locationRef.current =
          location;

        setUserLocation(
          location
        );

        setChurches(
          (currentChurches) =>
            sortChurchesForMap(
              currentChurches,
              location
            )
        );

        return location;
      } catch (locationError) {
        console.warn(
          'Não foi possível obter a localização:',
          locationError
        );

        return null;
      }
    }, []);

  useEffect(() => {
    const controller =
      new AbortController();

    let active = true;
    let hasCachedData = false;

    async function start() {
      setLoading(true);
      setError(null);
      setSyncWarning(null);

      try {
        const cachedResponse =
          await getCachedChurchesForMap();

        if (
          active &&
          cachedResponse
        ) {
          hasCachedData = true;

          applyResponse(
            cachedResponse
          );

          setLoading(false);
        }
      } catch (cacheError) {
        console.warn(
          'Não foi possível abrir o cache do mapa:',
          cacheError
        );
      }

      const locationPromise =
        requestUserLocation();

      const synchronizationPromise =
        refreshChurchesForMap({
          signal: controller.signal,
        });

      locationPromise.catch(
        () => null
      );

      try {
        if (hasCachedData) {
          setRefreshing(true);
        }

        const synchronizedResponse =
          await synchronizationPromise;

        if (!active) {
          return;
        }

        const currentLocation =
          locationRef.current;

        applyResponse({
          ...synchronizedResponse,

          churches:
            sortChurchesForMap(
              synchronizedResponse
                .churches,
              currentLocation
            ),

          locationAvailable:
            isValidLocation(
              currentLocation
            ),

          userLocation:
            currentLocation,
        });
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

        if (
          !hasCachedData &&
          active
        ) {
          setError(
            requestError instanceof
              ChurchMapApiError
              ? requestError.message
              : 'Não foi possível carregar as igrejas.'
          );
        }
      } finally {
        await locationPromise;

        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    start();

    return () => {
      active = false;
      controller.abort();
    };
  }, [
    applyResponse,
    requestUserLocation,
  ]);

  const refreshChurches =
    useCallback(async () => {
      if (refreshing) {
        return;
      }

      setRefreshing(true);
      setError(null);
      setSyncWarning(null);

      try {
        const currentLocation =
          locationRef.current;

        const response =
          await refreshChurchesForMap({
            latitude:
              currentLocation
                ?.latitude,

            longitude:
              currentLocation
                ?.longitude,

            forceRefresh: true,
          });

        applyResponse(
          response
        );

        mapRef.current
          ?.fitAll();
      } catch (requestError) {
        console.error(
          'Erro ao atualizar mapa:',
          requestError
        );

        setSyncWarning(
          requestError instanceof
            ChurchMapApiError
            ? requestError.message
            : 'Não foi possível atualizar os dados.'
        );
      } finally {
        setRefreshing(false);
      }
    }, [
      applyResponse,
      refreshing,
    ]);

  const focusChurch =
    useCallback(
      (
        church,
        scrollList = true,
        openPopup = true
      ) => {
        if (!church) {
          return;
        }

        setSelectedChurchId(
          church.id
        );

        mapRef.current
          ?.focusChurch(
            church.id,
            openPopup
          );

        if (!scrollList) {
          return;
        }

        const index =
          churchesRef.current
            .findIndex(
              (item) =>
                String(item.id) ===
                String(church.id)
            );

        if (index >= 0) {
          listRef.current
            ?.scrollToIndex({
              index,
              animated: true,
              viewPosition: 0.5,
            });
        }
      },
      []
    );

  const handleMarkerSelection =
    useCallback(
      (churchId) => {
        const church =
          churchesRef.current
            .find(
              (item) =>
                String(item.id) ===
                String(churchId)
            );

        focusChurch(
          church,
          true,
          false
        );
      },
      [focusChurch]
    );

  const centerOnUser =
    useCallback(() => {
      if (
        !locationRef.current
      ) {
        return;
      }

      mapRef.current
        ?.centerOnUser();
    }, []);

  const openDirections =
    useCallback(
      async (church) => {
        const url =
          buildChurchMapsUrl(
            church,
            locationRef.current
          );

        if (!url) {
          Alert.alert(
            'Localização indisponível',
            'Esta igreja não possui uma localização válida.'
          );

          return;
        }

        try {
          const canOpen =
            await Linking
              .canOpenURL(url);

          if (!canOpen) {
            throw new Error(
              'URL não suportada'
            );
          }

          await Linking.openURL(
            url
          );
        } catch (linkError) {
          console.error(
            'Erro ao abrir a rota:',
            linkError
          );

          Alert.alert(
            'Não foi possível abrir a rota',
            'Tente novamente em alguns instantes.'
          );
        }
      },
      []
    );

  const openOsmCopyright =
    useCallback(async () => {
      try {
        await Linking.openURL(
          OSM_COPYRIGHT_URL
        );
      } catch (linkError) {
        console.warn(
          'Não foi possível abrir a atribuição do mapa:',
          linkError
        );
      }
    }, []);

  const summaryText =
    useMemo(() => {
      if (refreshing) {
        return 'Sincronizando a lista de igrejas...';
      }

      if (syncWarning) {
        return 'Exibindo os dados salvos no aparelho.';
      }

      const updateTime =
        formatLastUpdate(
          cacheInfo?.savedAt
        );

      if (
        cacheInfo?.source ===
        'network'
      ) {
        return updateTime
          ? `Dados atualizados às ${updateTime}.`
          : 'Dados atualizados agora.';
      }

      if (
        cacheInfo?.source ===
        'stale-cache'
      ) {
        return 'Dados salvos; a atualização será tentada novamente.';
      }

      if (locationDenied) {
        return 'Dados salvos. Permita a localização para ordenar por distância.';
      }

      if (userLocation) {
        return 'Dados salvos e ordenados pela distância.';
      }

      return 'Dados salvos no aparelho por até 12 horas.';
    }, [
      cacheInfo,
      locationDenied,
      refreshing,
      syncWarning,
      userLocation,
    ]);

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
          Procurando dados salvos no
          aparelho.
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
          onPress={
            refreshChurches
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
      <OpenStreetMapView
        ref={mapRef}
        churches={churches}
        userLocation={
          userLocation
        }
        selectedChurchId={
          selectedChurchId
        }
        onSelectChurch={
          handleMarkerSelection
        }
        onReady={() => {
          setMapReady(true);
          setMapError(null);
        }}
        onError={(message) => {
          setMapError(message);
        }}
        style={styles.map}
      />

      {!mapReady ? (
        <View
          pointerEvents="none"
          style={styles.mapLoading}
        >
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text
            style={
              styles.mapLoadingText
            }
          >
            Preparando OpenStreetMap...
          </Text>
        </View>
      ) : null}

      <View style={styles.summary}>
        <Ionicons
          name="business-outline"
          size={18}
          color={COLORS.primary}
        />

        <View
          style={
            styles.summaryContent
          }
        >
          <Text
            style={
              styles.summaryTitle
            }
          >
            {churches.length}{' '}
            {churches.length === 1
              ? 'igreja encontrada'
              : 'igrejas encontradas'}
          </Text>

          <Text
            style={
              styles.summaryText
            }
          >
            {summaryText}
          </Text>
        </View>
      </View>

      <View style={styles.mapActions}>
        {userLocation ? (
          <Pressable
            onPress={
              centerOnUser
            }
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
          onPress={
            refreshChurches
          }
          disabled={refreshing}
          accessibilityLabel="Atualizar lista de igrejas"
          style={({ pressed }) => [
            styles.mapActionButton,
            pressed &&
            styles.buttonPressed,
          ]}
        >
          {refreshing ? (
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

      {mapError ? (
        <Pressable
          onPress={() => {
            setMapError(null);
            setMapReady(false);
            mapRef.current
              ?.reload();
          }}
          style={({ pressed }) => [
            styles.mapErrorBanner,
            pressed &&
            styles.buttonPressed,
          ]}
        >
          <Ionicons
            name="warning-outline"
            size={18}
            color={COLORS.primary}
          />

          <Text
            numberOfLines={2}
            style={
              styles.mapErrorText
            }
          >
            {mapError} Toque para tentar
            novamente.
          </Text>
        </Pressable>
      ) : null}

      {syncWarning ? (
        <View
          style={
            styles.syncWarning
          }
        >
          <Ionicons
            name="cloud-offline-outline"
            size={16}
            color={COLORS.primary}
          />

          <Text
            numberOfLines={2}
            style={
              styles.syncWarningText
            }
          >
            {syncWarning}
          </Text>
        </View>
      ) : null}

      <Pressable
        onPress={
          openOsmCopyright
        }
        accessibilityRole="link"
        accessibilityLabel="Direitos autorais do OpenStreetMap"
        style={({ pressed }) => [
          styles.attribution,
          pressed &&
          styles.buttonPressed,
        ]}
      >
        <Text
          style={
            styles.attributionText
          }
        >
          © OpenStreetMap contributors
        </Text>
      </Pressable>

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
              String(item.id) ===
              String(selectedChurchId)
            }
            onPress={() =>
              focusChurch(
                item,
                false,
                true
              )
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

  mapLoading: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      `${COLORS.background}E8`,
  },

  mapLoadingText: {
    marginTop: SPACING.sm,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },

  summary: {
    position: 'absolute',
    zIndex: 5,
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
    zIndex: 6,
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

  mapErrorBanner: {
    position: 'absolute',
    zIndex: 8,
    top: 104,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor:
      COLORS.surface,
  },

  mapErrorText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 17,
  },

  syncWarning: {
    position: 'absolute',
    zIndex: 7,
    right: SPACING.md,
    bottom: 210,
    left: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor:
      COLORS.surface,
  },

  syncWarningText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },

  attribution: {
    position: 'absolute',
    zIndex: 7,
    right: SPACING.md,
    bottom: 178,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor:
      'rgba(255,255,255,0.92)',
  },

  attributionText: {
    color: '#333333',
    fontSize: 10,
    fontWeight: '600',
  },

  churchList: {
    position: 'absolute',
    zIndex: 6,
    right: 0,
    bottom: SPACING.md,
    left: 0,
  },

  churchListContent: {
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
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