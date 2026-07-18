import { useState } from 'react';

import {
  Alert,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  KeyboardAwareScrollView,
} from 'react-native-keyboard-controller';

import ContactForm from '../components/ContactForm';

import {
  ContactApiError,
  sendContactMessage,
} from '../services/contactApi';

import {
  COLORS,
  SPACING,
} from '../constants/theme';

function validateForm(formData) {
  const name = formData?.name?.trim();
  const email = formData?.email?.trim();
  const phone = formData?.phone?.trim();
  const message = formData?.message?.trim();

  if (!name) {
    return 'Informe o seu nome.';
  }

  /*
   * Replica a regra do ContatoSerializer:
   * é obrigatório informar e-mail ou telefone.
   */
  if (!email && !phone) {
    return 'Informe pelo menos um meio de contato: e-mail ou telefone.';
  }

  if (email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return 'Informe um endereço de e-mail válido.';
    }
  }

  if (phone) {
    const phoneDigits = phone.replace(/\D/g, '');

    if (
      phoneDigits.length !== 10 &&
      phoneDigits.length !== 11
    ) {
      return 'Informe um telefone válido com DDD.';
    }
  }

  if (!message) {
    return 'Escreva a mensagem que deseja enviar.';
  }

  return null;
}

export default function ContactScreen({ navigation }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData) {
    if (isSubmitting) {
      return;
    }

    const validationError = validateForm(formData);

    if (validationError) {
      Alert.alert(
        'Verifique os dados',
        validationError
      );

      return;
    }

    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      const response = await sendContactMessage(formData);

      Alert.alert(
        'Mensagem enviada',
        response?.mensagem ||
          'Contato enviado com sucesso. Em breve retornaremos sua mensagem.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao enviar contato:', {
        message: error?.message,
        status: error?.status,
        data: error?.data,
      });

      const errorMessage =
        error instanceof ContactApiError
          ? error.message
          : 'Não foi possível enviar sua mensagem. Tente novamente.';

      Alert.alert(
        'Erro no envio',
        errorMessage
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        bottomOffset={100}
        extraKeyboardSpace={30}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={
          Platform.OS === 'ios'
            ? 'interactive'
            : 'on-drag'
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Fale com o SantoGuia
        </Text>

        <Text style={styles.subtitle}>
          Envie sua dúvida, sugestão ou correção de informações.
        </Text>

        <ContactForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />

        {isSubmitting && (
          <View style={styles.sendingContainer}>
            <Text style={styles.sendingText}>
              Enviando sua mensagem...
            </Text>
          </View>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scroll: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    padding: SPACING.md,
    paddingBottom: 180,
  },

  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '900',
  },

  subtitle: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
    color: COLORS.textMuted,
    lineHeight: 21,
  },

  sendingContainer: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },

  sendingText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});