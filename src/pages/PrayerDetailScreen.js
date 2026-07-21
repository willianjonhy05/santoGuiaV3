import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  getPrayerById,
  PRAYERS,
} from '../data/prayers';

import {
  COLORS,
  RADIUS,
  SPACING,
} from '../constants/theme';


export default function
PrayerDetailScreen({
  route,
}) {
  const routePrayer =
    route.params?.prayer;

  const prayerId =
    route.params?.prayerId;

  const prayer =
    routePrayer ||
    getPrayerById(prayerId) ||
    PRAYERS[0] ||
    null;


  if (!prayer) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>
          Oração não encontrada
        </Text>

        <Text style={styles.emptyText}>
          Não foi possível localizar
          o texto desta oração.
        </Text>
      </View>
    );
  }


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.scrollContent
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      <View style={styles.card}>
        <Text style={styles.title}>
          {prayer.title}
        </Text>

        {prayer.description ? (
          <Text
            style={
              styles.description
            }
          >
            {prayer.description}
          </Text>
        ) : null}

        <View style={styles.divider} />

        <Text
          selectable
          style={
            styles.prayerText
          }
        >
          {prayer.content}
        </Text>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  scrollContent: {
    padding:
      SPACING.md,

    paddingBottom:
      SPACING.xl * 2,
  },

  card: {
    padding:
      SPACING.lg,

    borderRadius:
      RADIUS.lg,

    backgroundColor:
      COLORS.surface,

    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  title: {
    color:
      COLORS.primary,

    fontSize: 28,
    fontWeight: '900',
    lineHeight: 35,
    textAlign: 'center',
  },

  description: {
    marginTop:
      SPACING.sm,

    color:
      COLORS.textMuted,

    fontSize: 14,
    textAlign: 'center',
  },

  divider: {
    height: 1,
    marginVertical:
      SPACING.lg,

    backgroundColor:
      COLORS.border,
  },

  prayerText: {
    color:
      COLORS.text,

    fontSize: 18,
    lineHeight: 30,
    textAlign: 'center',
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding:
      SPACING.xl,

    backgroundColor:
      COLORS.background,
  },

  emptyTitle: {
    color:
      COLORS.text,

    fontSize: 19,
    fontWeight: '800',
  },

  emptyText: {
    marginTop:
      SPACING.sm,

    color:
      COLORS.textMuted,

    fontSize: 14,
    textAlign: 'center',
  },
});