import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  useMemo,
  useState,
} from 'react';

import Ionicons
  from '@expo/vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SPACING,
} from '../constants/theme';


const DEFAULT_DAYS = [
  {
    label: 'Todos',
    value: '',
  },
  {
    label: 'Segunda',
    value: 'segunda',
  },
  {
    label: 'Terça',
    value: 'terca',
  },
  {
    label: 'Quarta',
    value: 'quarta',
  },
  {
    label: 'Quinta',
    value: 'quinta',
  },
  {
    label: 'Sexta',
    value: 'sexta',
  },
  {
    label: 'Sábado',
    value: 'sabado',
  },
  {
    label: 'Domingo',
    value: 'domingo',
  },
];


const DEFAULT_ORDER_OPTIONS = [
  {
    label: 'Próximas a iniciar',
    value: 'inicio',
  },
  {
    label: 'Mais próximas',
    value: 'proximidade',
  },
];


export default function
CollapsibleCelebrationFilters({
  filters,
  onChangeFilter,
  onApply,
  onClear,
  disabled = false,
  title = 'Filtros',
  initialExpanded = false,
  days = DEFAULT_DAYS,
  orderOptions =
    DEFAULT_ORDER_OPTIONS,
  locationHint = (
    'O aplicativo solicitará sua localização ' +
    'ao aplicar os filtros.'
  ),
}) {
  const [
    expanded,
    setExpanded,
  ] = useState(
    initialExpanded
  );


  const activeFiltersCount =
    useMemo(() => {
      let count = 0;

      if (filters?.dia) {
        count += 1;
      }

      if (filters?.horarioDe) {
        count += 1;
      }

      if (filters?.horarioAte) {
        count += 1;
      }

      if (
        filters?.ordenar &&
        filters.ordenar !== 'inicio'
      ) {
        count += 1;
      }

      return count;
    }, [filters]);


  function updateFilter(
    field,
    value
  ) {
    onChangeFilter?.(
      field,
      value
    );
  }


  function handleApply() {
    onApply?.();

    setExpanded(false);
  }


  function handleClear() {
    onClear?.();

    setExpanded(false);
  }


  return (
    <View style={styles.container}>
      <Pressable
        onPress={() =>
          setExpanded(
            (current) => !current
          )
        }
        accessibilityRole="button"
        accessibilityLabel={
          expanded
            ? 'Recolher filtros'
            : 'Abrir filtros'
        }
        accessibilityState={{
          expanded,
        }}
        style={({ pressed }) => [
          styles.header,

          pressed &&
            styles.pressed,
        ]}
      >
        <View style={styles.headerIcon}>
          <Ionicons
            name="options-outline"
            size={22}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>
              {title}
            </Text>

            {activeFiltersCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {activeFiltersCount}
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.headerSubtitle}>
            {activeFiltersCount > 0
              ? (
                activeFiltersCount === 1
                  ? '1 filtro ativo'
                  : `${activeFiltersCount} filtros ativos`
              )
              : (
                'Toque para escolher dia, horário e ordenação'
              )}
          </Text>
        </View>

        <Ionicons
          name={
            expanded
              ? 'chevron-up'
              : 'chevron-down'
          }
          size={21}
          color={COLORS.textMuted}
        />
      </Pressable>

      {expanded ? (
        <View style={styles.content}>
          <Text style={styles.filterTitle}>
            Dia da semana
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              styles.daysContainer
            }
          >
            {days.map((day) => {
              const selected =
                filters?.dia ===
                day.value;

              return (
                <Pressable
                  key={
                    day.value ||
                    'todos'
                  }
                  onPress={() =>
                    updateFilter(
                      'dia',
                      day.value
                    )
                  }
                  disabled={disabled}
                  style={({ pressed }) => [
                    styles.dayChip,

                    selected &&
                      styles
                        .dayChipSelected,

                    pressed &&
                      styles.pressed,

                    disabled &&
                      styles.disabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayChipText,

                      selected &&
                        styles
                          .dayChipTextSelected,
                    ]}
                  >
                    {day.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.filterTitle}>
            Faixa de horário
          </Text>

          <View style={styles.timeRow}>
            <View style={styles.timeField}>
              <Text style={styles.inputLabel}>
                A partir de
              </Text>

              <TextInput
                value={
                  filters?.horarioDe ??
                  ''
                }
                onChangeText={(value) =>
                  updateFilter(
                    'horarioDe',
                    value
                  )
                }
                editable={!disabled}
                placeholder="06:00"
                placeholderTextColor={
                  COLORS.textMuted
                }
                keyboardType="numbers-and-punctuation"
                returnKeyType="next"
                autoCorrect={false}
                maxLength={5}
                style={[
                  styles.input,

                  disabled &&
                    styles.disabled,
                ]}
              />
            </View>

            <View style={styles.timeField}>
              <Text style={styles.inputLabel}>
                Até
              </Text>

              <TextInput
                value={
                  filters?.horarioAte ??
                  ''
                }
                onChangeText={(value) =>
                  updateFilter(
                    'horarioAte',
                    value
                  )
                }
                editable={!disabled}
                placeholder="22:00"
                placeholderTextColor={
                  COLORS.textMuted
                }
                keyboardType="numbers-and-punctuation"
                returnKeyType="done"
                autoCorrect={false}
                maxLength={5}
                style={[
                  styles.input,

                  disabled &&
                    styles.disabled,
                ]}
              />
            </View>
          </View>

          <Text style={styles.filterTitle}>
            Ordenar por
          </Text>

          <View style={styles.orderContainer}>
            {orderOptions.map(
              (option) => {
                const selected =
                  filters?.ordenar ===
                  option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() =>
                      updateFilter(
                        'ordenar',
                        option.value
                      )
                    }
                    disabled={disabled}
                    style={({ pressed }) => [
                      styles.orderButton,

                      selected &&
                        styles
                          .orderButtonSelected,

                      pressed &&
                        styles.pressed,

                      disabled &&
                        styles.disabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles
                          .orderButtonText,

                        selected &&
                          styles
                            .orderButtonTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>

          {filters?.ordenar ===
          'proximidade' ? (
            <View style={styles.locationBox}>
              <Ionicons
                name="location-outline"
                size={18}
                color={COLORS.primary}
              />

              <Text style={styles.locationHint}>
                {locationHint}
              </Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              onPress={handleClear}
              disabled={disabled}
              style={({ pressed }) => [
                styles.clearButton,

                pressed &&
                  styles.pressed,

                disabled &&
                  styles.disabled,
              ]}
            >
              <Text style={styles.clearButtonText}>
                Limpar
              </Text>
            </Pressable>

            <Pressable
              onPress={handleApply}
              disabled={disabled}
              style={({ pressed }) => [
                styles.applyButton,

                pressed &&
                  styles.pressed,

                disabled &&
                  styles.disabled,
              ]}
            >
              <Ionicons
                name="checkmark"
                size={19}
                color={COLORS.surface}
              />

              <Text style={styles.applyButtonText}>
                Aplicar filtros
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor:
      COLORS.surface,
  },

  header: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal:
      SPACING.md,
    paddingVertical:
      SPACING.sm,
  },

  headerIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    borderRadius: 21,
    backgroundColor:
      COLORS.background,
  },

  headerContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },

  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },

  headerSubtitle: {
    marginTop: 3,
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },

  badge: {
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor:
      COLORS.primary,
  },

  badgeText: {
    color: COLORS.surface,
    fontSize: 11,
    fontWeight: '800',
  },

  content: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor:
      COLORS.border,
  },

  filterTitle: {
    marginBottom: SPACING.sm,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },

  daysContainer: {
    gap: SPACING.sm,
    paddingBottom: SPACING.md,
  },

  dayChip: {
    paddingHorizontal:
      SPACING.md,
    paddingVertical:
      SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    backgroundColor:
      COLORS.background,
  },

  dayChipSelected: {
    borderColor:
      COLORS.primary,
    backgroundColor:
      COLORS.primary,
  },

  dayChipText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },

  dayChipTextSelected: {
    color: COLORS.surface,
  },

  timeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },

  timeField: {
    flex: 1,
  },

  inputLabel: {
    marginBottom: 5,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },

  input: {
    minHeight: 46,
    paddingHorizontal:
      SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    color: COLORS.text,
    backgroundColor:
      COLORS.background,
    fontSize: 15,
  },

  orderContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },

  orderButton: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal:
      SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    backgroundColor:
      COLORS.background,
  },

  orderButtonSelected: {
    borderColor:
      COLORS.primary,
    backgroundColor:
      COLORS.primary,
  },

  orderButtonText: {
    textAlign: 'center',
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },

  orderButtonTextSelected: {
    color: COLORS.surface,
  },

  locationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor:
      COLORS.background,
  },

  locationHint: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },

  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },

  clearButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal:
      SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.sm,
  },

  clearButtonText: {
    color: COLORS.primary,
    fontWeight: '800',
  },

  applyButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingHorizontal:
      SPACING.md,
    borderRadius: RADIUS.sm,
    backgroundColor:
      COLORS.primary,
  },

  applyButtonText: {
    color: COLORS.surface,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.72,
  },

  disabled: {
    opacity: 0.55,
  },
});