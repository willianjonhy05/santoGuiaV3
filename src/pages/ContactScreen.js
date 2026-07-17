import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import ContactForm from '../components/ContactForm';
import { COLORS, SPACING } from '../constants/theme';

export default function ContactScreen({ navigation }) {
  function handleSubmit(formData) {
    Alert.alert(
      'Mensagem enviada',
      `Obrigado, ${formData.name || 'usuário'}! Este envio ainda é um mock.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Fale com o SantoGuia</Text>
      <Text style={styles.subtitle}>Envie sua dúvida, sugestão ou correção de informações.</Text>
      <ContactForm onSubmit={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
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
});
