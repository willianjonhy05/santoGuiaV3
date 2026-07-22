import {
  Alert,
  Linking,
} from 'react-native';


export default async function openSocialLink(
  url
) {
  try {
    const supported =
      await Linking.canOpenURL(
        url
      );

    if (supported) {
      await Linking.openURL(
        url
      );

      return;
    }


    if (
      url.startsWith('https://')
    ) {
      await Linking.openURL(
        url
      );

      return;
    }


    Alert.alert(
      'Não foi possível abrir',
      'Este endereço não está disponível.'
    );

  } catch (error) {

    Alert.alert(
      'Erro',
      'Não foi possível abrir este endereço.'
    );

  }
}