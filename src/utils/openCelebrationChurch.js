import { Alert } from 'react-native';

/**
 * Abre a página da igreja vinculada a uma celebração.
 *
 * @param {object} navigation - Objeto de navegação do React Navigation.
 * @param {object} celebration - Dados da celebração selecionada.
 */
export function openCelebrationChurch(
  navigation,
  celebration
) {
  const slug =
    celebration?.igreja_slug ||
    celebration?.igreja?.slug;

  if (!slug) {
    Alert.alert(
      'Igreja indisponível',
      'Não foi possível identificar ' +
        'a igreja desta celebração.'
    );

    return;
  }

  navigation.navigate(
    'ChurchDetails',
    {
      slug,
    }
  );
}