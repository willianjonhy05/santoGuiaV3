import { FlatList, StyleSheet, Text } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import PrayerRowItem from '../components/PrayerRowItem';
import { MOCK_PRAYERS } from '../data/mockData';
import { COLORS, SPACING } from '../constants/theme';

export default function PrayersScreen({ navigation }) {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Orações</Text>
      <Text style={styles.subtitle}>Escolha uma oração para ler o texto completo.</Text>

      <FlatList
        data={MOCK_PRAYERS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PrayerRowItem
            prayer={item}
            onPress={() => navigation.navigate('PrayerDetail', { prayer: item })}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: SPACING.md,
    marginHorizontal: SPACING.md,
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.md,
    color: COLORS.textMuted,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
});
