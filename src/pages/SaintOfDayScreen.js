import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Calendar,
  LocaleConfig,
} from 'react-native-calendars';

import {
  formatDateLong,
  formatDateShort,
  getLocalDateString,
} from '../utils/date';

import SaintOfDayContent from '../components/SaintOfDayContent';

import {
  buscarSantoDeHoje,
  buscarSantoPorData,
  SantoDoDiaApiError,
} from '../services/santoDoDia';

import {
  COLORS,
  SPACING,
} from '../constants/theme';

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

  dayNamesShort: [
    'Dom.',
    'Seg.',
    'Ter.',
    'Qua.',
    'Qui.',
    'Sex.',
    'Sáb.',
  ],

  today: 'Hoje',
};

LocaleConfig.defaultLocale = 'pt-br';


export default function SaintOfDayScreen() {
  const today = getLocalDateString();

  const [selectedDate, setSelectedDate] =
    useState(today);

  const [calendarVisible, setCalendarVisible] =
    useState(false);

  const [saint, setSaint] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [reloadKey, setReloadKey] =
    useState(0);

  const markedDates = useMemo(() => {
    if (selectedDate === today) {
      return {
        [today]: {
          selected: true,
          marked: true,
          selectedColor: COLORS.primary,
          selectedTextColor: COLORS.surface,
          dotColor: COLORS.surface,
        },
      };
    }

    return {
      [today]: {
        marked: true,
        dotColor: COLORS.primary,
      },

      [selectedDate]: {
        selected: true,
        selectedColor: COLORS.primary,
        selectedTextColor: COLORS.surface,
      },
    };
  }, [
    selectedDate,
    today,
  ]);

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadSaint() {
      if (!refreshing) {
        setLoading(true);
      }

      setError(null);

      try {
        let result;

        const options = {
          signal: controller.signal,
          ignoreCache: reloadKey > 0,
        };

        if (selectedDate === today) {
          result =
            await buscarSantoDeHoje(
              options
            );
        } else {
          result =
            await buscarSantoPorData(
              selectedDate,
              options
            );
        }

        setSaint(result);
      } catch (requestError) {
        if (
          requestError?.name ===
          'AbortError'
        ) {
          return;
        }

        console.error(
          'Erro ao carregar Santo do Dia:',
          {
            message:
              requestError?.message,

            status:
              requestError?.status,

            code:
              requestError?.code,

            data:
              requestError?.data,
          }
        );

        const errorMessage =
          requestError instanceof
            SantoDoDiaApiError
            ? requestError.message
            : (
              'Não foi possível carregar ' +
              'o Santo do Dia.'
            );

        setError(errorMessage);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }

    loadSaint();

    return () => {
      controller.abort();
    };
  }, [
    selectedDate,
    today,
    reloadKey,
  ]);

  function handleSelectDate(day) {
    if (!day?.dateString) {
      return;
    }

    setSelectedDate(day.dateString);
    setCalendarVisible(false);
  }

  function handleToday() {
    setCalendarVisible(false);

    if (selectedDate === today) {
      setReloadKey(
        (current) => current + 1
      );

      return;
    }

    setSelectedDate(today);
  }

  function handleRetry() {
    setReloadKey(
      (current) => current + 1
    );
  }

  function handleRefresh() {
    setRefreshing(true);

    setReloadKey(
      (current) => current + 1
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[
            COLORS.primary,
          ]}
          tintColor={
            COLORS.primary
          }
        />
      }
    >
      <View style={styles.introduction}>
        <View
          style={
            styles.introductionContent
          }
        >
          <Text style={styles.title}>
            Santo do Dia
          </Text>

          <Text style={styles.subtitle}>
            Conheça a história, a fé e o
            testemunho dos santos da Igreja.
          </Text>
        </View>

        <Pressable
          onPress={handleToday}
          style={({ pressed }) => [
            styles.todayButton,

            pressed &&
            styles.buttonPressed,
          ]}
        >
          <Text
            style={
              styles.todayButtonText
            }
          >
            Hoje
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() =>
          setCalendarVisible(
            (current) => !current
          )
        }
        style={({ pressed }) => [
          styles.calendarToggleButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <View style={styles.calendarToggleContent}>
          <Text style={styles.calendarToggleLabel}>
            Data selecionada
          </Text>

          <Text style={styles.calendarToggleDate}>
            {formatDateLong(selectedDate)}
          </Text>
        </View>

        <Text style={styles.calendarToggleAction}>
          {calendarVisible
            ? 'Ocultar'
            : 'Alterar'}
        </Text>
      </Pressable>

      {calendarVisible ? (
        <View style={styles.calendarContainer}>
          <Calendar
            /*
             * A chave muda quando o usuário
             * navega para outro mês pelo botão
             * "Hoje".
             */
            key={selectedDate.slice(0, 7)}
            current={selectedDate}
            firstDay={1}
            enableSwipeMonths
            hideExtraDays={false}
            onDayPress={handleSelectDate}
            markedDates={markedDates}
            theme={{
              calendarBackground:
                COLORS.surface,

              backgroundColor:
                COLORS.surface,

              textSectionTitleColor:
                COLORS.textMuted,

              selectedDayBackgroundColor:
                COLORS.primary,

              selectedDayTextColor:
                COLORS.surface,

              todayTextColor:
                COLORS.primary,

              dayTextColor:
                COLORS.text,

              textDisabledColor:
                COLORS.border,

              dotColor:
                COLORS.primary,

              selectedDotColor:
                COLORS.surface,

              arrowColor:
                COLORS.primary,

              monthTextColor:
                COLORS.text,

              indicatorColor:
                COLORS.primary,

              textMonthFontWeight:
                '800',

              textDayHeaderFontWeight:
                '700',
            }}
          />
        </View>
      ) : null}
      {loading && !refreshing ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text style={styles.stateText}>
            Carregando Santo do Dia...
          </Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>
            🙏
          </Text>

          <Text style={styles.errorTitle}>
            Não foi possível carregar
          </Text>

          <Text style={styles.errorMessage}>
            {error}
          </Text>

          <Pressable
            onPress={handleRetry}
            style={({ pressed }) => [
              styles.retryButton,

              pressed &&
              styles.buttonPressed,
            ]}
          >
            <Text
              style={
                styles.retryButtonText
              }
            >
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      ) : null}

      {!loading &&
        !error &&
        saint ? (
        <SaintOfDayContent
          saint={saint}
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  content: {
    padding: SPACING.md,
    paddingBottom:
      SPACING.xl * 2,
  },

  introduction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent:
      'space-between',
    marginBottom: SPACING.md,
  },

  introductionContent: {
    flex: 1,
    paddingRight: SPACING.md,
  },

  title: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: '900',
  },

  subtitle: {
    marginTop: SPACING.xs,
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },

  todayButton: {
    paddingHorizontal:
      SPACING.md,

    paddingVertical:
      SPACING.sm,

    borderRadius: 10,
    backgroundColor:
      COLORS.primary,
  },

  todayButtonText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: '800',
  },

  buttonPressed: {
    opacity: 0.72,
  },

  calendarContainer: {
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor:
      COLORS.surface,
  },

  stateContainer: {
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stateText: {
    marginTop: SPACING.md,
    color: COLORS.textMuted,
    fontSize: 14,
  },

  errorContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor:
      COLORS.surface,
  },

  errorIcon: {
    fontSize: 44,
  },

  errorTitle: {
    marginTop: SPACING.sm,
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '800',
  },

  errorMessage: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: SPACING.lg,
    paddingHorizontal:
      SPACING.lg,

    paddingVertical:
      SPACING.md,

    borderRadius: 12,
    backgroundColor:
      COLORS.primary,
  },

  retryButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '800',
  },
  calendarToggleButton: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
  },

  calendarToggleContent: {
    flex: 1,
    paddingRight: SPACING.md,
  },

  calendarToggleLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },

  calendarToggleDate: {
    marginTop: 3,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
    
  },

  calendarToggleAction: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
  },
});