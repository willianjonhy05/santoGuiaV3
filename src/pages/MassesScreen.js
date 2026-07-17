import { Alert, FlatList, StyleSheet, Text } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import MassTimeCard from '../components/MassTimeCard';
import { MOCK_MASSES } from '../data/mockData';
import { COLORS, SPACING } from '../constants/theme';

export default function MassesScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Próximas missas</Text>
      <Text style={styles.subtitle}>Celebrações organizadas pelo horário de início.</Text>

      <FlatList
        data={MOCK_MASSES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MassTimeCard
            mass={item}
            onPress={() => Alert.alert(item.churchName, `Missa às ${item.time}`)}
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
