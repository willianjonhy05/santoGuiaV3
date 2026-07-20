import { NavigationContainer, DefaultTheme, useNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';

import HomeScreen from '../pages/HomeScreen';
import ChurchesScreen from '../pages/ChurchesScreen';

import {
  useCallback,
  useEffect,
  useRef,
} from 'react';

import * as Notifications
  from 'expo-notifications';

import MassesScreen from '../pages/MassesScreen';
import PrayersScreen from '../pages/PrayersScreen';
import PrayerDetailScreen from '../pages/PrayerDetailScreen';
import ProfileScreen from '../pages/ProfileScreen';
import ContactScreen from '../pages/ContactScreen';
import FavoritesScreen from '../pages/FavoritesScreen';
import LiturgyScreen from '../pages/LiturgyScreen';
import SaintOfDayScreen from '../pages/SaintOfDayScreen';
import ExaminationOfConscienceScreen from '../pages/ExaminationOfConscienceScreen';

import NewsScreen
  from '../pages/NewsScreen';

import NewsDetailsScreen
  from '../pages/NewsDetailsScreen';

import FavoriteCelebrationsScreen
  from '../pages/FavoriteCelebrationsScreen';

import ChurchDetailsScreen
  from '../pages/ChurchDetailsScreen';

import ClericDetailsScreen
  from '../pages/ClericDetailsScreen';

import ChurchMapScreen
  from '../pages/ChurchMapScreen';

import { COLORS } from '../constants/theme';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

const TAB_ICONS = {
  Home: ['home', 'home-outline'],
  Igrejas: ['business', 'business-outline'],
  Missas: ['calendar', 'calendar-outline'],
  Orações: ['book', 'book-outline'],
  Opções: ['menu', 'menu-outline'],
};

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          height: 66,
          paddingTop: 6,
          paddingBottom: 8,
          borderTopColor: COLORS.border,
          backgroundColor: COLORS.surface,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },

        tabBarIcon: ({ focused, color, size }) => {
          const [filledIcon, outlineIcon] = TAB_ICONS[route.name];

          return (
            <Ionicons
              name={focused ? filledIcon : outlineIcon}
              color={color}
              size={size}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Igrejas"
        component={ChurchesScreen}
      />

      <Tab.Screen
        name="Missas"
        component={MassesScreen}
      />

      <Tab.Screen
        name="Orações"
        component={PrayersScreen}
      />

      <Tab.Screen
        name="Opções"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}

const navigationTheme = {
  ...DefaultTheme,

  colors: {
    ...DefaultTheme.colors,

    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.border,
  },
};

export default function Routes() {
  const navigationRef =
    useNavigationContainerRef();

  const pendingChurchSlugRef =
    useRef(null);

  const processedResponseRef =
    useRef(null);

  const handleNotificationResponse =
    useCallback(
      async (response) => {
        if (!response) {
          return;
        }

        const notification =
          response.notification;

        const content =
          notification
            ?.request
            ?.content;

        const data =
          content?.data;

        const churchSlug =
          data?.churchSlug;

        if (!churchSlug) {
          return;
        }

        /*
         * Evita abrir duas vezes quando a mesma
         * resposta é encontrada pelo listener e
         * pela consulta inicial.
         */
        const responseKey = [
          notification
            ?.request
            ?.identifier,

          notification?.date,

          churchSlug,
        ].join(':');

        if (
          processedResponseRef.current ===
          responseKey
        ) {
          return;
        }

        processedResponseRef.current =
          responseKey;

        /*
         * Se o NavigationContainer ainda não
         * estiver pronto, guarda o slug.
         */
        if (!navigationRef.isReady()) {
          pendingChurchSlugRef.current =
            churchSlug;

          return;
        }

        navigationRef.navigate(
          'ChurchDetails',
          {
            slug: churchSlug,
          }
        );
      },
      [navigationRef]
    );

  useEffect(() => {
    /*
     * Trata o toque quando o aplicativo
     * está aberto ou em segundo plano.
     */
    const subscription =
      Notifications
        .addNotificationResponseReceivedListener(
          handleNotificationResponse
        );

    /*
     * Trata o caso em que o aplicativo
     * estava fechado e foi iniciado pelo
     * toque na notificação.
     */
    async function checkInitialNotification() {
      try {
        const response =
          await Notifications
            .getLastNotificationResponseAsync();

        if (response) {
          await handleNotificationResponse(
            response
          );

          await Notifications
            .clearLastNotificationResponseAsync();
        }
      } catch (error) {
        console.error(
          'Erro ao verificar notificação inicial:',
          error
        );
      }
    }

    checkInitialNotification();

    return () => {
      subscription.remove();
    };
  }, [handleNotificationResponse]);

  function handleNavigationReady() {
    const churchSlug =
      pendingChurchSlugRef.current;

    if (!churchSlug) {
      return;
    }

    pendingChurchSlugRef.current = null;

    navigationRef.navigate(
      'ChurchDetails',
      {
        slug: churchSlug,
      }
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navigationTheme}
      onReady={handleNavigationReady}
    >
      <RootStack.Navigator
        screenOptions={{
          headerTintColor:
            COLORS.surface,

          headerStyle: {
            backgroundColor:
              COLORS.primary,
          },

          headerTitleStyle: {
            fontWeight: '700',
          },

          contentStyle: {
            backgroundColor:
              COLORS.background,
          },
        }}
      >
        <RootStack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{
            headerShown: false,
          }}
        />

        <RootStack.Screen
          name="PrayerDetail"
          component={PrayerDetailScreen}
          options={{
            title: 'Oração',
          }}
        />

        <RootStack.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            title: 'Favoritos',
          }}
        />

        <RootStack.Screen
          name="Contact"
          component={ContactScreen}
          options={{
            title: 'Fale Conosco',
          }}
        />

        <RootStack.Screen
          name="Liturgy"
          component={LiturgyScreen}
          options={{
            title: 'Liturgia Diária',
          }}
        />

        <RootStack.Screen
          name="SaintOfDay"
          component={SaintOfDayScreen}
          options={{
            title: 'Santo do Dia',
          }}
        />

        <RootStack.Screen
          name="ExaminationOfConscience"
          component={
            ExaminationOfConscienceScreen
          }
          options={{
            title:
              'Exame de Consciência',
          }}
        />

        <RootStack.Screen
          name="News"
          component={NewsScreen}
          options={{
            title: 'Notícias',
          }}
        />

        <RootStack.Screen
          name="NewsDetails"
          component={NewsDetailsScreen}
          options={{
            title: 'Notícia',
          }}
        />

        <RootStack.Screen
          name="ChurchMap"
          component={ChurchMapScreen}
          options={{
            title: 'Mapa de Igrejas',
          }}
        />

        <RootStack.Screen
          name="ChurchDetails"
          component={ChurchDetailsScreen}
          options={{
            title:
              'Detalhes da Igreja',
          }}
        />

        <RootStack.Screen
          name="ClericDetails"
          component={ClericDetailsScreen}
          options={{
            title:
              'Detalhes do clérigo',
          }}
        />
        <RootStack.Screen
          name="FavoriteCelebrations"
          component={
            FavoriteCelebrationsScreen
          }
          options={{
            title:
              'Celebrações favoritas',
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}