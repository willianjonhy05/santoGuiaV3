import { ScrollView, StyleSheet, Text, View } from 'react-native';
import CustomButton from '../components/CustomButton';
import { MOCK_CHURCHES } from '../data/mockData';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export default function ChurchDetailsScreen({ route }) {
  const church = route.params?.church ?? MOCK_CHURCHES[0];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.heroPlaceholder} />
      <Text style={styles.title}>{church.name}</Text>
      <Text style={styles.address}>{church.address}</Text>
      <Text style={styles.distance}>{church.distance.toFixed(1)} km de distância</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Horários de missa</Text>
        {church.masses.map((time) => (
          <View key={time} style={styles.massRow}>
            <Text style={styles.day}>Hoje</Text>
            <Text style={styles.time}>{time}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Outras celebrações</Text>
        <Text style={styles.body}>Adoração, confissões e eventos serão carregados pela API.</Text>
      </View>

      <CustomButton title="Traçar rota até a igreja" onPress={() => {}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  heroPlaceholder: {
    height: 190,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: '#D9C6B0',
  },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
  },
  address: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 15,
  },
  distance: {
    marginTop: SPACING.sm,
    color: COLORS.primary,
    fontWeight: '800',
  },
  card: {
    marginVertical: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
  },
  massRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  day: {
    color: COLORS.textMuted,
  },
  time: {
    color: COLORS.primary,
    fontWeight: '900',
  },
  body: {
    color: COLORS.textMuted,
    lineHeight: 21,
  },
});
