import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import {
  StyleSheet,
  View,
} from 'react-native';

import { WebView } from
  'react-native-webview';

const DEFAULT_CENTER = {
  latitude: -5.0892,
  longitude: -42.8016,
};

const LEAFLET_HTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
  />

  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""
  />

  <style>
    html,
    body,
    #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #ececec;
    }

    .leaflet-container {
      font-family:
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
    }

    .church-marker-wrapper {
      background: transparent;
      border: 0;
    }

    .church-marker {
      position: relative;
      width: 24px;
      height: 24px;
      border: 3px solid #ffffff;
      border-radius: 50% 50% 50% 0;
      background: #76502f;
      box-shadow:
        0 2px 8px
        rgba(0, 0, 0, 0.35);
      transform: rotate(-45deg);
    }

    .church-marker::after {
      position: absolute;
      top: 6px;
      left: 6px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #ffffff;
      content: "";
    }

    .church-marker.selected {
      width: 29px;
      height: 29px;
      background: #b5783f;
      box-shadow:
        0 3px 12px
        rgba(0, 0, 0, 0.5);
    }

    .church-marker.selected::after {
      top: 8px;
      left: 8px;
      width: 7px;
      height: 7px;
    }

    .user-marker-wrapper {
      background: transparent;
      border: 0;
    }

    .user-marker {
      width: 18px;
      height: 18px;
      border: 4px solid #ffffff;
      border-radius: 50%;
      background: #2778e8;
      box-shadow:
        0 0 0 7px
        rgba(39, 120, 232, 0.24);
    }

    .popup-title {
      margin: 0 0 5px;
      color: #111111;
      font-size: 14px;
      font-weight: 800;
    }

    .popup-address {
      margin: 0;
      color: #555555;
      font-size: 12px;
      line-height: 17px;
    }

    .map-error {
      display: none;
      position: absolute;
      z-index: 9999;
      top: 50%;
      left: 20px;
      right: 20px;
      padding: 14px;
      border-radius: 12px;
      color: #333333;
      background: #ffffff;
      box-shadow:
        0 2px 12px
        rgba(0, 0, 0, 0.2);
      text-align: center;
      transform:
        translateY(-50%);
    }
  </style>
</head>

<body>
  <div id="map"></div>

  <div
    id="map-error"
    class="map-error"
  >
    Não foi possível carregar o mapa.
  </div>

  <script>
    window.__postToNative =
      function postToNative(
        type,
        payload
      ) {
        try {
          window.ReactNativeWebView
            .postMessage(
              JSON.stringify({
                type: type,
                ...(payload || {}),
              })
            );
        } catch (error) {
          /* Sem ação. */
        }
      };
  </script>

  <script
    src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
    crossorigin=""
    onerror="window.__postToNative('ERROR', { message: 'Não foi possível carregar o Leaflet.' })"
  ></script>

  <script>
    (function initializeMap() {
      var defaultCenter = [
        ${DEFAULT_CENTER.latitude},
        ${DEFAULT_CENTER.longitude}
      ];

      var map = null;
      var churchLayer = null;
      var userLayer = null;
      var markerById = {};
      var selectedChurchId = null;
      var pendingPayload = null;
      var hasFittedMap = false;

      function escapeHtml(value) {
        return String(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }

      function isValidCoordinate(
        latitude,
        longitude
      ) {
        return (
          Number.isFinite(latitude) &&
          Number.isFinite(longitude) &&
          latitude >= -90 &&
          latitude <= 90 &&
          longitude >= -180 &&
          longitude <= 180
        );
      }

      function createChurchIcon(
        selected
      ) {
        return L.divIcon({
          className:
            'church-marker-wrapper',

          html:
            '<div class="church-marker' +
            (selected
              ? ' selected'
              : '') +
            '"></div>',

          iconSize:
            selected
              ? [35, 35]
              : [30, 30],

          iconAnchor:
            selected
              ? [10, 31]
              : [9, 27],

          popupAnchor: [5, -27],
        });
      }

      function createUserIcon() {
        return L.divIcon({
          className:
            'user-marker-wrapper',

          html:
            '<div class="user-marker"></div>',

          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
      }

      function setSelectedChurch(
        churchId
      ) {
        selectedChurchId =
          churchId === null ||
          churchId === undefined
            ? null
            : String(churchId);

        Object.keys(
          markerById
        ).forEach(function updateMarker(
          markerId
        ) {
          var marker =
            markerById[markerId];

          marker.setIcon(
            createChurchIcon(
              markerId ===
                selectedChurchId
            )
          );
        });
      }

      function focusChurch(
        churchId,
        openPopup
      ) {
        var normalizedId =
          churchId === null ||
          churchId === undefined
            ? null
            : String(churchId);

        var marker =
          markerById[normalizedId];

        if (!marker || !map) {
          return;
        }

        setSelectedChurch(
          normalizedId
        );

        map.setView(
          marker.getLatLng(),
          Math.max(
            map.getZoom(),
            15
          ),
          {
            animate: true,
          }
        );

        if (openPopup !== false) {
          marker.openPopup();
        }
      }

      function fitAllMarkers() {
        if (!map) {
          return;
        }

        var coordinates = [];

        churchLayer.eachLayer(
          function collectChurch(
            layer
          ) {
            if (
              typeof layer.getLatLng ===
              'function'
            ) {
              coordinates.push(
                layer.getLatLng()
              );
            }
          }
        );

        userLayer.eachLayer(
          function collectUser(
            layer
          ) {
            if (
              typeof layer.getLatLng ===
              'function'
            ) {
              coordinates.push(
                layer.getLatLng()
              );
            }
          }
        );

        if (
          coordinates.length === 0
        ) {
          return;
        }

        if (
          coordinates.length === 1
        ) {
          map.setView(
            coordinates[0],
            15,
            {
              animate: true,
            }
          );

          return;
        }

        map.fitBounds(
          L.latLngBounds(
            coordinates
          ),
          {
            paddingTopLeft:
              [45, 105],

            paddingBottomRight:
              [45, 235],

            maxZoom: 15,
            animate: true,
          }
        );
      }

      function focusUser() {
        if (!map) {
          return;
        }

        var userMarker = null;

        userLayer.eachLayer(
          function findUser(layer) {
            userMarker = layer;
          }
        );

        if (!userMarker) {
          return;
        }

        map.setView(
          userMarker.getLatLng(),
          16,
          {
            animate: true,
          }
        );
      }

      function setMapData(payload) {
        if (!map) {
          pendingPayload = payload;
          return;
        }

        var churches =
          Array.isArray(
            payload &&
            payload.churches
          )
            ? payload.churches
            : [];

        var userLocation =
          payload &&
          payload.userLocation;

        churchLayer.clearLayers();
        userLayer.clearLayers();
        markerById = {};

        selectedChurchId =
          payload &&
          payload.selectedChurchId !==
            null &&
          payload.selectedChurchId !==
            undefined
            ? String(
                payload.selectedChurchId
              )
            : null;

        churches.forEach(
          function addChurchMarker(
            church
          ) {
            var latitude =
              Number(church.latitude);

            var longitude =
              Number(church.longitude);

            if (
              !isValidCoordinate(
                latitude,
                longitude
              )
            ) {
              return;
            }

            var churchId =
              String(church.id);

            var marker = L.marker(
              [
                latitude,
                longitude,
              ],
              {
                icon:
                  createChurchIcon(
                    churchId ===
                      selectedChurchId
                  ),

                keyboard: true,
                riseOnHover: true,
              }
            );

            var popupHtml =
              '<p class="popup-title">' +
              escapeHtml(
                church.name ||
                'Igreja'
              ) +
              '</p>';

            if (
              church.addressLine
            ) {
              popupHtml +=
                '<p class="popup-address">' +
                escapeHtml(
                  church.addressLine
                ) +
                '</p>';
            }

            marker.bindPopup(
              popupHtml,
              {
                closeButton: true,
                autoPan: true,
              }
            );

            marker.on(
              'click',
              function handleClick() {
                setSelectedChurch(
                  churchId
                );

                window.__postToNative(
                  'SELECT_CHURCH',
                  {
                    churchId:
                      churchId,
                  }
                );
              }
            );

            markerById[
              churchId
            ] = marker;

            marker.addTo(
              churchLayer
            );
          }
        );

        if (userLocation) {
          var userLatitude =
            Number(
              userLocation.latitude
            );

          var userLongitude =
            Number(
              userLocation.longitude
            );

          if (
            isValidCoordinate(
              userLatitude,
              userLongitude
            )
          ) {
            L.marker(
              [
                userLatitude,
                userLongitude,
              ],
              {
                icon:
                  createUserIcon(),

                keyboard: false,
                interactive: false,
              }
            )
              .bindTooltip(
                'Sua localização',
                {
                  direction: 'top',
                }
              )
              .addTo(
                userLayer
              );
          }
        }

        if (
  userLocation &&
  isValidCoordinate(
    Number(userLocation.latitude),
    Number(userLocation.longitude)
  )
) {

  window.setTimeout(
    function () {

      map.setView(
        [
          Number(userLocation.latitude),
          Number(userLocation.longitude)
        ],
        16,
        {
          animate: true,
        }
      );

    },
    300
  );

}

        if (
          !hasFittedMap &&
          churches.length > 0
        ) {
          hasFittedMap = true;

          window.setTimeout(
            fitAllMarkers,
            180
          );
        }
      }

      window.setMapData =
        setMapData;

      window.focusChurch =
        focusChurch;

      window.setSelectedChurch =
        setSelectedChurch;

      window.fitAllMarkers =
        fitAllMarkers;

      window.focusUser =
        focusUser;

      if (!window.L) {
        document
          .getElementById(
            'map-error'
          )
          .style.display =
            'block';

        window.__postToNative(
          'ERROR',
          {
            message:
              'A biblioteca do mapa não foi carregada.',
          }
        );

        return;
      }

      try {
        map = L.map(
          'map',
          {
            zoomControl: true,
            attributionControl: false,
            preferCanvas: true,
            minZoom: 3,
            maxZoom: 19,
          }
        ).setView(
          defaultCenter,
          12
        );

        L.tileLayer(
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            minZoom: 3,
            maxZoom: 19,
            detectRetina: false,
            updateWhenIdle: true,
            keepBuffer: 2,
          }
        ).addTo(map);

        churchLayer =
          L.layerGroup()
            .addTo(map);

        userLayer =
          L.layerGroup()
            .addTo(map);

        map.whenReady(
          function mapReady() {
            window.__postToNative(
              'READY'
            );

            if (pendingPayload) {
              var payload =
                pendingPayload;

              pendingPayload = null;

              setMapData(
                payload
              );
            }
          }
        );
      } catch (error) {
        document
          .getElementById(
            'map-error'
          )
          .style.display =
            'block';

        window.__postToNative(
          'ERROR',
          {
            message:
              error &&
              error.message
                ? error.message
                : 'Não foi possível iniciar o mapa.',
          }
        );
      }
    })();
  </script>
</body>
</html>
`;

function serializeForInjection(
  value
) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(
      /\u2028/g,
      '\\u2028'
    )
    .replace(
      /\u2029/g,
      '\\u2029'
    );
}

const OpenStreetMapView =
  forwardRef(
    function OpenStreetMapView(
      {
        churches = [],
        userLocation = null,
        selectedChurchId = null,
        onSelectChurch,
        onReady,
        onError,
        style,
      },
      ref
    ) {
      const webViewRef =
        useRef(null);

      const [webMapReady, setWebMapReady] =
        useState(false);

      const sendMapData =
        useCallback(() => {
          if (
            !webMapReady ||
            !webViewRef.current
          ) {
            return;
          }

          const payload =
            serializeForInjection({
              churches,
              userLocation,
              selectedChurchId,
            });

          webViewRef.current
            .injectJavaScript(
              `window.setMapData(${payload}); true;`
            );
        }, [
          churches,
          selectedChurchId,
          userLocation,
          webMapReady,
        ]);

      useEffect(() => {
        sendMapData();
      }, [sendMapData]);

      useEffect(() => {
        if (
          !webMapReady ||
          !webViewRef.current
        ) {
          return;
        }

        const churchId =
          serializeForInjection(
            selectedChurchId
          );

        webViewRef.current
          .injectJavaScript(
            `window.setSelectedChurch(${churchId}); true;`
          );
      }, [
        selectedChurchId,
        webMapReady,
      ]);

      useImperativeHandle(
        ref,
        () => ({
          focusChurch(
            churchId,
            openPopup = true
          ) {
            const serializedId =
              serializeForInjection(
                churchId
              );

            const serializedPopup =
              openPopup
                ? 'true'
                : 'false';

            webViewRef.current
              ?.injectJavaScript(
                `window.focusChurch(${serializedId}, ${serializedPopup}); true;`
              );
          },

          centerOnUser() {
            webViewRef.current
              ?.injectJavaScript(
                'window.focusUser(); true;'
              );
          },

          fitAll() {
            webViewRef.current
              ?.injectJavaScript(
                'window.fitAllMarkers(); true;'
              );
          },

          reload() {
            setWebMapReady(false);
            webViewRef.current
              ?.reload();
          },
        }),
        []
      );

      const handleMessage =
        useCallback(
          (event) => {
            let message = null;

            try {
              message = JSON.parse(
                event.nativeEvent.data
              );
            } catch {
              return;
            }

            if (
              message?.type ===
              'READY'
            ) {
              setWebMapReady(true);
              onReady?.();
              return;
            }

            if (
              message?.type ===
              'SELECT_CHURCH'
            ) {
              onSelectChurch?.(
                message.churchId
              );
              return;
            }

            if (
              message?.type ===
              'ERROR'
            ) {
              onError?.(
                message.message ||
                'Não foi possível carregar o mapa.'
              );
            }
          },
          [
            onError,
            onReady,
            onSelectChurch,
          ]
        );

      return (
        <View
          style={[
            styles.container,
            style,
          ]}
        >
          <WebView
            ref={webViewRef}
            source={{
              html: LEAFLET_HTML,
              baseUrl:
                'https://missaemteresina.com.br',
            }}
            originWhitelist={['*']}
            onMessage={handleMessage}
            onLoadStart={() => {
              setWebMapReady(false);
            }}
            onHttpError={(event) => {
              onError?.(
                `Erro HTTP ${event.nativeEvent.statusCode} ao carregar o mapa.`
              );
            }}
            onError={(event) => {
              onError?.(
                event.nativeEvent
                  ?.description ||
                'Não foi possível abrir o mapa.'
              );
            }}
            javaScriptEnabled
            domStorageEnabled
            cacheEnabled
            cacheMode="LOAD_DEFAULT"
            applicationNameForUserAgent={
              'SantoGuia/1.0'
            }
            mixedContentMode="never"
            allowFileAccess={false}
            setSupportMultipleWindows={
              false
            }
            scrollEnabled={false}
            overScrollMode="never"
            androidLayerType="hardware"
            style={styles.webView}
          />
        </View>
      );
    }
  );

export default OpenStreetMapView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#ececec',
  },

  webView: {
    flex: 1,
    backgroundColor: '#ececec',
  },
});