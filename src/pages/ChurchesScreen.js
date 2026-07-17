import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import SearchBar from '../components/SearchBar';
import ChurchListItem from '../components/ChurchListItem';
import { MOCK_CHURCHES } from '../data/mockData';
import { COLORS, SPACING } from '../constants/theme';

export default function ChurchesScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [favoriteIds, setFavoriteIds] = useState(new Set(['2']));

  const filteredChurches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return MOCK_CHURCHES;
    }

    return MOCK_CHURCHES.filter((church) =>
      church.name.toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  function toggleFavorite(churchId) {
    setFavoriteIds((current) => {
      const next = new Set(current);
      next.has(churchId) ? next.delete(churchId) : next.add(churchId);
      return next;
    });
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Igrejas</Text>
      <Text style={styles.subtitle}>Ordenadas inicialmente pela distância do usuário.</Text>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar igreja pelo nome"
      />

      <FlatList
        data={filteredChurches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChurchListItem
            church={item}
            isFavorite={favoriteIds.has(item.id)}
            onFavoritePress={() => toggleFavorite(item.id)}
            onPress={() => navigation.navigate('ChurchDetails', { church: item })}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma igreja encontrada.</Text>}
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
    marginHorizontal: SPACING.md,
    color: COLORS.textMuted,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  empty: {
    margin: SPACING.xl,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
