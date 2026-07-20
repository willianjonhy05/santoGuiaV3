import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import ScreenContainer from '../components/ScreenContainer';
import CustomButton from '../components/CustomButton';
import LiturgySection from '../components/LiturgySection';
import useLiturgy from '../hooks/useLiturgy';
import {
  formatDateLong,
  getLocalDateString,
} from '../utils/date';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ],
  monthNamesShort: [
    'Jan.',
    'Fev.',
    'Mar.',
    'Abr.',
    'Mai.',
    'Jun.',
    'Jul.',
    'Ago.',
    'Set.',
    'Out.',
    'Nov.',
    'Dez.',
  ],
  dayNames: [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ],
  dayNamesShort: ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'],
  today: 'Hoje',
};
LocaleConfig.defaultLocale = 'pt-br';

const LITURGICAL_COLORS = {
  Verde: '#2E7D32',
  Vermelho: '#B3261E',
  Roxo: '#6A1B9A',
  Rosa: '#C95C8B',
  Branco: '#F2EBDD',
};

function normalizeItems(items) {
  return Array.isArray(items) ? items : [];
}

export default function LiturgyScreen() {
  const today = useMemo(() => getLocalDateString(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const { liturgy, loading, error, retry } = useLiturgy(selectedDate);

  const markedDates = useMemo(
    () => ({
      [selectedDate]: {
        selected: true,
        selectedColor: COLORS.primary,
        selectedTextColor: COLORS.surface,
      },
    }),
    [selectedDate]
  );

  const liturgicalColor =
    LITURGICAL_COLORS[liturgy?.cor] ?? COLORS.textMuted;
  const whiteBadge = liturgy?.cor === 'Branco';

  function renderReadings(defaultTitle, items) {
    const normalizedItems = normalizeItems(items);

    return normalizedItems.map((item, index) => (
      <LiturgySection
        key={`${defaultTitle}-${item.referencia ?? item.titulo ?? index}`}
        title={
          item.tipo ||
          (normalizedItems.length > 1
            ? `${defaultTitle} ${index + 1}`
            : defaultTitle)
        }
        reference={item.referencia}
        subtitle={item.titulo}
        text={item.texto}
      />
    ));
  }

  function renderPsalms(items) {
    const normalizedItems = normalizeItems(items);

    return normalizedItems.map((item, index) => (
      <LiturgySection
        key={`salmo-${item.referencia ?? index}`}
        title={
          normalizedItems.length > 1
            ? `Salmo ${index + 1}`
            : 'Salmo Responsorial'
        }
        reference={item.referencia}
        refrain={item.refrao}
        text={item.texto}
      />
    ));
  }

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>Palavra de Deus</Text>
        <Text style={styles.pageTitle}>Liturgia Diária</Text>
        <Text style={styles.pageSubtitle}>
          Escolha uma data para consultar as orações, leituras, salmo e evangelho.
        </Text>

        <View style={styles.dateActions}>
          <Pressable
            style={styles.dateButton}
            onPress={() => setCalendarVisible((visible) => !visible)}
          >
            <Ionicons name="calendar-outline" size={21} color={COLORS.primary} />
            <Text style={styles.dateButtonText}>{formatDateLong(selectedDate)}</Text>
            <Ionicons
              name={calendarVisible ? 'chevron-up' : 'chevron-down'}
              size={19}
              color={COLORS.primary}
            />
          </Pressable>

          {selectedDate !== today ? (
            <Pressable style={styles.todayButton} onPress={() => setSelectedDate(today)}>
              <Text style={styles.todayButtonText}>Hoje</Text>
            </Pressable>
          ) : null}
        </View>

        {calendarVisible ? (
          <View style={styles.calendarCard}>
            <Calendar
              current={selectedDate}
              firstDay={1}
              enableSwipeMonths
              hideExtraDays={false}
              markedDates={markedDates}
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setCalendarVisible(false);
              }}
              theme={{
                calendarBackground: COLORS.surface,
                textSectionTitleColor: COLORS.textMuted,
                selectedDayBackgroundColor: COLORS.primary,
                selectedDayTextColor: COLORS.surface,
                todayTextColor: COLORS.primary,
                dayTextColor: COLORS.text,
                textDisabledColor: '#B9B2AA',
                arrowColor: COLORS.primary,
                monthTextColor: COLORS.text,
                textMonthFontWeight: '900',
                textDayHeaderFontWeight: '700',
              }}
            />
          </View>
        ) : null}

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.stateText}>Carregando a liturgia...</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.stateCard}>
            <Ionicons name="cloud-offline-outline" size={38} color={COLORS.primary} />
            <Text style={styles.errorTitle}>Não foi possível carregar</Text>
            <Text style={styles.stateText}>{error.message}</Text>
            <View style={styles.retryButton}>
              <CustomButton title="Tentar novamente" onPress={retry} />
            </View>
          </View>
        ) : null}

        {!loading && liturgy ? (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryTextBox}>
                  <Text style={styles.summaryDate}>{liturgy.data}</Text>
                  <Text style={styles.summaryTitle}>{liturgy.liturgia}</Text>
                </View>

                <View
                  style={[
                    styles.colorBadge,
                    { backgroundColor: liturgicalColor },
                    whiteBadge && styles.whiteBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.colorBadgeText,
                      whiteBadge && styles.whiteBadgeText,
                    ]}
                  >
                    {liturgy.cor}
                  </Text>
                </View>
              </View>
            </View>

            <LiturgySection
              title="Antífona de Entrada"
              text={liturgy.antifonas?.entrada}
            />

            <LiturgySection
              title="Oração da Coleta"
              text={liturgy.oracoes?.coleta}
            />

            {renderReadings(
              'Primeira Leitura',
              liturgy.leituras?.primeiraLeitura
            )}

            {renderPsalms(liturgy.leituras?.salmo)}

            {renderReadings(
              'Segunda Leitura',
              liturgy.leituras?.segundaLeitura
            )}

            {renderReadings('Evangelho', liturgy.leituras?.evangelho)}

            {renderReadings('Leitura adicional', liturgy.leituras?.extras)}

            {normalizeItems(liturgy.oracoes?.extras).map((item, index) => (
              <LiturgySection
                key={`oracao-extra-${item.titulo ?? index}`}
                title={item.titulo || `Oração adicional ${index + 1}`}
                text={item.texto}
              />
            ))}

            <LiturgySection
              title="Oração sobre as Oferendas"
              text={liturgy.oracoes?.oferendas}
            />

            <LiturgySection
              title="Antífona da Comunhão"
              text={liturgy.antifonas?.comunhao}
            />

            <LiturgySection
              title="Oração depois da Comunhão"
              text={liturgy.oracoes?.comunhao}
            />
          </>
        ) : null}
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
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  pageTitle: {
    marginTop: SPACING.xs,
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '900',
  },
  pageSubtitle: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  dateActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  dateButton: {
    minHeight: 50,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  dateButtonText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  todayButton: {
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  todayButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '900',
  },
  calendarCard: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    overflow: 'hidden',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  stateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  stateText: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  errorTitle: {
    marginTop: SPACING.sm,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
  },
  retryButton: {
    width: '100%',
    marginTop: SPACING.md,
  },
  summaryCard: {
    padding: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  summaryTextBox: {
    flex: 1,
  },
  summaryDate: {
    color: '#F1DCA9',
    fontSize: 13,
    fontWeight: '800',
  },
  summaryTitle: {
    marginTop: SPACING.xs,
    color: COLORS.surface,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 27,
  },
  colorBadge: {
    minWidth: 70,
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 7,
    borderRadius: 999,
  },
  whiteBadge: {
    borderWidth: 1,
    borderColor: '#D9CCB5',
  },
  colorBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  whiteBadgeText: {
    color: COLORS.text,
  },
});
