import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';

import HomeScreen from '../pages/HomeScreen';
import ChurchesScreen from '../pages/ChurchesScreen';
import ChurchDetailsScreen from '../pages/ChurchDetailsScreen';
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
  Perfil: ['person', 'person-outline'],
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
        name="Perfil"
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
  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator
        screenOptions={{
          headerTintColor: COLORS.surface,

          headerStyle: {
            backgroundColor: COLORS.primary,
          },

          headerTitleStyle: {
            fontWeight: '700',
          },

          contentStyle: {
            backgroundColor: COLORS.background,
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
          name="ChurchDetails"
          component={ChurchDetailsScreen}
          options={{
            title: 'Detalhes da Igreja',
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
            title: 'Igrejas Favoritas',
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
          component={ExaminationOfConscienceScreen}
          options={{
            title: 'Exame de Consciência',
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
      </RootStack.Navigator>
    </NavigationContainer>
  );
}