import { Alert, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import ChurchCardMini from '../components/ChurchCardMini';
import NewsCard from '../components/NewsCard';
import ShortcutCard from '../components/ShortcutCard';
import NextMassItem from '../components/NextMassItem';
import CustomButton from '../components/CustomButton';
import DailyLiturgyPreview from '../components/DailyLiturgyPreview';
import { MOCK_CHURCHES, MOCK_MASSES, MOCK_NEWS } from '../data/mockData';
import { COLORS, SPACING } from '../constants/theme';

export default function HomeScreen({ navigation }) {
  function showComingSoon(feature) {
    Alert.alert(feature, 'Essa funcionalidade será conectada na próxima etapa.');
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>SantoGuia</Text>
        <Text style={styles.title}>Encontre sua próxima celebração</Text>
        <Text style={styles.subtitle}>Igrejas, missas, orações e vida católica em um só lugar.</Text>

        <View style={styles.section}>
          <SectionTitle title="Liturgia de hoje" />
          <DailyLiturgyPreview onPress={() => navigation.navigate('Liturgy')} />
        </View>

        <View style={styles.section}>
          <SectionTitle
            title="Igrejas próximas"
            actionLabel="Ver todas"
            onActionPress={() => navigation.navigate('Igrejas')}
          />
          <FlatList
            horizontal
            data={MOCK_CHURCHES.slice(0, 5)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChurchCardMini
                church={item}
                onPress={() => navigation.navigate('ChurchDetails', { church: item })}
              />
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={styles.section}>
          <SectionTitle title="Acesso rápido" />
          <View style={styles.shortcutsGrid}>
            <ShortcutCard title="Exame de Consciência" icon="checkmark-circle-outline" onPress={() => navigation.navigate('ExaminationOfConscience')} />
            <ShortcutCard title="Santo do Dia" icon="sunny-outline" onPress={() => navigation.navigate('SaintOfDay')} />
            <ShortcutCard title="Liturgia Diária" icon="reader-outline" onPress={() => navigation.navigate('Liturgy')} />
            <ShortcutCard title="Orações" icon="book-outline" onPress={() => navigation.navigate('Orações')} />
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle
            title="Próximas missas"
            actionLabel="Ver agenda"
            onActionPress={() => navigation.navigate('Missas')}
          />
          {MOCK_MASSES.slice(0, 3).map((mass) => (
            <NextMassItem key={mass.id} mass={mass} />
          ))}
        </View>

        <View style={styles.section}>
          <SectionTitle title="Serviços" />
          <View style={styles.actionGap}>
            <CustomButton title="Adorações" variant="secondary" onPress={() => showComingSoon('Adorações')} />
            <CustomButton title="Confissões" variant="secondary" onPress={() => showComingSoon('Confissões')} />
            <CustomButton title="Navegar no mapa" onPress={() => showComingSoon('Mapa de Igrejas')} />
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle title="Notícias da Arquidiocese" />
          <FlatList
            horizontal
            data={MOCK_NEWS.slice(0, 3)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <NewsCard news={item} onPress={() => showComingSoon(item.title)} />
            )}
            showsHorizontalScrollIndicator={false}
          />
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
  eyebrow: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  title: {
    marginTop: SPACING.xs,
    color: COLORS.text,
    fontSize: 29,
    fontWeight: '900',
    lineHeight: 34,
  },
  subtitle: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    marginTop: SPACING.lg,
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionGap: {
    gap: SPACING.sm,
  },
});
