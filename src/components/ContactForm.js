import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import InputField from './InputField';
import CustomButton from './CustomButton';
import { SPACING } from '../constants/theme';

export default function ContactForm({ onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit() {
    onSubmit?.(form);
  }

  return (
    <View style={styles.container}>
      <InputField
        label="Nome"
        value={form.name}
        onChangeText={(value) => updateField('name', value)}
        placeholder="Seu nome"
      />
      <InputField
        label="E-mail"
        value={form.email}
        onChangeText={(value) => updateField('email', value)}
        placeholder="voce@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <InputField
        label="Assunto"
        value={form.subject}
        onChangeText={(value) => updateField('subject', value)}
        placeholder="Como podemos ajudar?"
      />
      <InputField
        label="Mensagem"
        value={form.message}
        onChangeText={(value) => updateField('message', value)}
        placeholder="Escreva sua mensagem"
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        style={styles.messageInput}
      />
      <CustomButton title="Enviar mensagem" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING.xl,
  },
  messageInput: {
    minHeight: 120,
    paddingTop: SPACING.md,
  },
});
