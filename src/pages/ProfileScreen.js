import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import { COLORS, SPACING } from '../constants/theme';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState({
    name: 'Usuário SantoGuia',
    phone: '',
    birthDate: '',
    email: '',
  });

  function updateField(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function saveProfile() {
    Alert.alert('Perfil', 'Dados salvos localmente no mock.');
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Meu perfil</Text>
        <Text style={styles.subtitle}>Mantenha seus dados atualizados.</Text>

        <View style={styles.form}>
          <InputField label="Nome" value={profile.name} onChangeText={(value) => updateField('name', value)} />
          <InputField label="Telefone" value={profile.phone} onChangeText={(value) => updateField('phone', value)} keyboardType="phone-pad" placeholder="(86) 99999-9999" />
          <InputField label="Data de nascimento" value={profile.birthDate} onChangeText={(value) => updateField('birthDate', value)} placeholder="DD/MM/AAAA" />
          <InputField label="E-mail" value={profile.email} onChangeText={(value) => updateField('email', value)} keyboardType="email-address" autoCapitalize="none" placeholder="voce@email.com" />
          <CustomButton title="Salvar alterações" onPress={saveProfile} />
        </View>

        <View style={styles.links}>
          <CustomButton title="Minhas igrejas favoritas" variant="secondary" onPress={() => navigation.navigate('Favorites')} />
          <CustomButton title="Contato" variant="secondary" onPress={() => navigation.navigate('Contact')} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: SPACING.xs,
    color: COLORS.textMuted,
  },
  form: {
    marginTop: SPACING.lg,
  },
  links: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
});
