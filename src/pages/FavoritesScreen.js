import { FlatList, StyleSheet, Text } from 'react-native';
import ChurchListItem from '../components/ChurchListItem';
import { MOCK_CHURCHES } from '../data/mockData';
import { COLORS, SPACING } from '../constants/theme';

export default function FavoritesScreen({ navigation }) {
  const favoriteChurches = MOCK_CHURCHES.slice(0, 2);

  return (
    <FlatList
      data={favoriteChurches}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ChurchListItem
          church={item}
          isFavorite
          onFavoritePress={() => {}}
          onPress={() => navigation.navigate('ChurchDetails', { church: item })}
        />
      )}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Favoritas</Text>
          <Text style={styles.subtitle}>Depois, esta lista virá do armazenamento local ou da API.</Text>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  title: {
    marginHorizontal: SPACING.md,
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.md,
    color: COLORS.textMuted,
  },
});
