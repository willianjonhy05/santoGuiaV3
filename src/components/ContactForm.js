import { useRef, useState } from 'react';

import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import InputField from './InputField';
import CustomButton from './CustomButton';

import {
  COLORS,
  SPACING,
} from '../constants/theme';

function formatPhone(value) {
  const digits = value
    .replace(/\D/g, '')
    .slice(0, 11);

  if (digits.length === 0) {
    return '';
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  /*
   * Telefone fixo:
   * (86) 3232-1234
   */
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(
      2,
      6
    )}-${digits.slice(6)}`;
  }

  /*
   * Celular:
   * (86) 99999-9999
   */
  return `(${digits.slice(0, 2)}) ${digits.slice(
    2,
    7
  )}-${digits.slice(7)}`;
}

export default function ContactForm({
  onSubmit,
  isSubmitting = false,
}) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const emailInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const subjectInputRef = useRef(null);
  const messageInputRef = useRef(null);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handlePhoneChange(value) {
    updateField('phone', formatPhone(value));
  }

  function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    onSubmit?.(form);
  }

  return (
    <View style={styles.container}>
      <InputField
        label="Nome"
        value={form.name}
        onChangeText={(value) => updateField('name', value)}
        placeholder="Seu nome"
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => {
          emailInputRef.current?.focus();
        }}
      />

      <InputField
        ref={emailInputRef}
        label="E-mail"
        value={form.email}
        onChangeText={(value) => updateField('email', value)}
        placeholder="voce@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => {
          phoneInputRef.current?.focus();
        }}
      />

      <InputField
        ref={phoneInputRef}
        label="Telefone"
        value={form.phone}
        onChangeText={handlePhoneChange}
        placeholder="(86) 99999-9999"
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        maxLength={15}
        returnKeyType="next"
        onSubmitEditing={() => {
          subjectInputRef.current?.focus();
        }}
      />

      <Text style={styles.contactHint}>
        Informe pelo menos um meio de contato: e-mail ou telefone.
      </Text>

      <InputField
        ref={subjectInputRef}
        label="Assunto"
        value={form.subject}
        onChangeText={(value) => updateField('subject', value)}
        placeholder="Como podemos ajudar?"
        autoCapitalize="sentences"
        returnKeyType="next"
        onSubmitEditing={() => {
          messageInputRef.current?.focus();
        }}
      />

      <View style={styles.field}>
        <Text style={styles.label}>
          Mensagem
        </Text>

        <TextInput
          ref={messageInputRef}
          value={form.message}
          onChangeText={(value) => {
            updateField('message', value);
          }}
          placeholder="Digite sua mensagem"
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          autoCapitalize="sentences"
          autoCorrect
          maxLength={2000}
          blurOnSubmit={false}
          style={[
            styles.input,
            styles.messageInput,
          ]}
        />

        <Text style={styles.characterCount}>
          {form.message.length}/2000
        </Text>
      </View>

      <CustomButton
        title={
          isSubmitting
            ? 'Enviando...'
            : 'Enviar mensagem'
        }
        onPress={handleSubmit}
        disabled={isSubmitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.xs,
    paddingBottom: SPACING.xl,
  },

  field: {
    width: '100%',
  },

  label: {
    marginBottom: SPACING.xs,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },

  contactHint: {
    marginTop: -SPACING.xs,
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },

  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    fontSize: 16,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
  },

  messageInput: {
    minHeight: 150,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },

  characterCount: {
    marginTop: SPACING.xs,
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'right',
  },
});