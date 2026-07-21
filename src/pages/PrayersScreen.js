import {
  useMemo,
  useState,
} from 'react';

import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ScreenContainer
  from '../components/ScreenContainer';

import SearchBar
  from '../components/SearchBar';

import PrayerRowItem
  from '../components/PrayerRowItem';

import {
  PRAYERS,
} from '../data/prayers';

import {
  COLORS,
  SPACING,
} from '../constants/theme';


function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .trim()
    .toLowerCase();
}


export default function PrayersScreen({
  navigation,
}) {
  const [
    query,
    setQuery,
  ] = useState('');


  const filteredPrayers =
    useMemo(() => {
      const normalizedQuery =
        normalizeText(query);

      if (!normalizedQuery) {
        return PRAYERS;
      }

      return PRAYERS.filter(
        (prayer) => {
          const searchableText =
            [
              prayer.title,
              prayer.description,
              prayer.category,
              prayer.content,
            ]
              .filter(Boolean)
              .join(' ');

          return normalizeText(
            searchableText
          ).includes(
            normalizedQuery
          );
        }
      );
    }, [query]);


  function openPrayer(prayer) {
    navigation.navigate(
      'PrayerDetail',
      {
        prayerId:
          prayer.id,

        prayer,
      }
    );
  }


  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>
          Orações
        </Text>

        <Text style={styles.subtitle}>
          Escolha uma oração para ler
          o texto completo.
        </Text>

        <SearchBar
          value={query}
          onChangeText={
            setQuery
          }
          placeholder="Buscar oração..."
        />

        <Text style={styles.resultCount}>
          {filteredPrayers.length}{' '}

          {filteredPrayers.length === 1
            ? 'oração encontrada'
            : 'orações encontradas'}
        </Text>
      </View>

      <FlatList
        data={
          filteredPrayers
        }
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={({ item }) => (
          <PrayerRowItem
            prayer={item}
            onPress={() =>
              openPrayer(item)
            }
          />
        )}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.listContent,

          filteredPrayers.length ===
            0 &&
            styles.emptyListContent,
        ]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              Nenhuma oração encontrada
            </Text>

            <Text style={styles.emptyText}>
              Não encontramos resultados
              para “{query}”. Tente pesquisar
              por outro nome ou categoria.
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}


const styles = StyleSheet.create({
  header: {
    paddingTop:
      SPACING.md,

    paddingHorizontal:
      SPACING.md,
  },

  title: {
    color:
      COLORS.text,

    fontSize: 28,
    fontWeight: '900',
  },

  subtitle: {
    marginTop:
      SPACING.xs,

    marginBottom:
      SPACING.xs,

    color:
      COLORS.textMuted,

    fontSize: 14,
    lineHeight: 20,
  },

  resultCount: {
    marginTop:
      SPACING.xs,

    marginBottom:
      SPACING.sm,

    color:
      COLORS.textMuted,

    fontSize: 12,
    fontWeight: '600',
  },

  listContent: {
    paddingBottom:
      SPACING.xl,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  empty: {
    flex: 1,
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
    padding:
      SPACING.xl,
  },

  emptyTitle: {
    color:
      COLORS.text,

    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyText: {
    maxWidth: 300,
    marginTop:
      SPACING.sm,

    color:
      COLORS.textMuted,

    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});