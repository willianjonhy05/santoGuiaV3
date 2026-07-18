import { StatusBar } from 'expo-status-bar';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import {
  FavoritesProvider,
} from './src/contexts/FavoritesContext';

import Routes from './src/routes';



export default function App() {
  return (
    <KeyboardProvider>
      <StatusBar style="dark"      
      />
      <FavoritesProvider>

      <Routes />
      </FavoritesProvider>

    </KeyboardProvider>
  );
}