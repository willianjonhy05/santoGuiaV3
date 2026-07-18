import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';

import ConscienceAccordion from '../components/ConscienceAccordion';
import ConscienceCheckboxItem from '../components/ConscienceCheckboxItem';

import {
  EXAMINATION_SECTIONS,
  LAST_CONFESSION_OPTIONS,
} from '../data/examinationOfConscience';

import {
  COLORS,
  SPACING,
} from '../constants/theme';

const DEFAULT_LAST_CONFESSION =
  LAST_CONFESSION_OPTIONS[0].value;

const ALL_EXAMINATION_ITEMS =
  EXAMINATION_SECTIONS.flatMap(
    (section) => section.items
  );

export default function ExaminationOfConscienceScreen() {
  const scrollViewRef = useRef(null);
  const copiedTimeoutRef = useRef(null);

  const [lastConfession, setLastConfession] =
    useState(DEFAULT_LAST_CONFESSION);

  const [selectedIds, setSelectedIds] =
    useState(() => new Set());

  const [copied, setCopied] =
    useState(false);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        clearTimeout(
          copiedTimeoutRef.current
        );
      }
    };
  }, []);

  const selectedStatements = useMemo(() => {
    return ALL_EXAMINATION_ITEMS
      .filter((item) =>
        selectedIds.has(item.id)
      )
      .map((item) => item.statement);
  }, [selectedIds]);

  const confessionScript = useMemo(() => {
    const sinsText =
      selectedStatements.length > 0
        ? selectedStatements
            .map(
              (statement) =>
                `• ${statement}`
            )
            .join('\n')
        : '';

    return [
      'Abençoe-me, Padre, porque pequei.',
      `Minha última confissão foi ${lastConfession}.`,
      '',
      sinsText,
      sinsText ? '' : null,
      'Estes são os pecados de que me lembro. Peço o perdão, a penitência e a absolvição de Deus.',
    ]
      .filter((line) => line !== null)
      .join('\n');
  }, [
    lastConfession,
    selectedStatements,
  ]);

  function toggleItem(itemId) {
    setSelectedIds((current) => {
      const updated = new Set(current);

      if (updated.has(itemId)) {
        updated.delete(itemId);
      } else {
        updated.add(itemId);
      }

      return updated;
    });
  }

  async function handleCopy() {
    try {
      await Clipboard.setStringAsync(
        confessionScript
      );

      setCopied(true);

      if (copiedTimeoutRef.current) {
        clearTimeout(
          copiedTimeoutRef.current
        );
      }

      copiedTimeoutRef.current =
        setTimeout(() => {
          setCopied(false);
        }, 2000);
    } catch (error) {
      console.error(
        'Erro ao copiar roteiro:',
        error
      );

      Alert.alert(
        'Não foi possível copiar',
        'Ocorreu um erro ao copiar o texto para a área de transferência.'
      );
    }
  }

  function clearSelections() {
    setSelectedIds(new Set());

    setLastConfession(
      DEFAULT_LAST_CONFESSION
    );

    setCopied(false);

    scrollViewRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  }

  function handleClear() {
    if (
      selectedIds.size === 0 &&
      lastConfession ===
        DEFAULT_LAST_CONFESSION
    ) {
      Alert.alert(
        'Nenhuma marcação',
        'Não há informações para limpar.'
      );

      return;
    }

    Alert.alert(
      'Limpar todas as marcações?',
      'Essa ação apagará as opções selecionadas nesta tela.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: clearSelections,
        },
      ]
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      <View style={styles.hero}>
        <View style={styles.tag}>
          <Ionicons
            name="heart-outline"
            size={15}
            color={COLORS.primary}
          />

          <Text style={styles.tagText}>
            Preparando para confissão
          </Text>
        </View>

        <Text style={styles.title}>
          Exame de Consciência
        </Text>

        <Text style={styles.subtitle}>
          Antes de se confessar com o
          sacerdote, faça uma experiência
          de autoconhecimento e reconheça
          suas falhas.
        </Text>

        <View style={styles.privacyNotice}>
          <Ionicons
            name="lock-closed-outline"
            size={21}
            color={COLORS.primary}
          />

          <Text style={styles.privacyText}>
            Suas marcações permanecem
            somente nesta tela. Nenhuma
            informação é enviada para o
            servidor.
          </Text>
        </View>
      </View>

      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {selectedIds.size === 0
            ? 'Nenhum item marcado'
            : `${selectedIds.size} ${
                selectedIds.size === 1
                  ? 'item marcado'
                  : 'itens marcados'
              }`}
        </Text>
      </View>

      {EXAMINATION_SECTIONS.map(
        (section) => (
          <ConscienceAccordion
            key={section.id}
            title={section.title}
            initiallyOpen={
              section.initiallyOpen
            }
          >
            {section.showLastConfessionOptions ? (
              <View
                style={
                  styles.lastConfessionContainer
                }
              >
                <Text
                  style={
                    styles.lastConfessionLabel
                  }
                >
                  Quando ocorreu a sua
                  última confissão?
                </Text>

                <View
                  style={styles.options}
                >
                  {LAST_CONFESSION_OPTIONS.map(
                    (option) => {
                      const selected =
                        lastConfession ===
                        option.value;

                      return (
                        <Pressable
                          key={option.value}
                          onPress={() =>
                            setLastConfession(
                              option.value
                            )
                          }
                          accessibilityRole="radio"
                          accessibilityState={{
                            checked:
                              selected,
                          }}
                          style={({
                            pressed,
                          }) => [
                            styles.option,

                            selected &&
                              styles.optionSelected,

                            pressed &&
                              styles.optionPressed,
                          ]}
                        >
                          <View
                            style={[
                              styles.radio,

                              selected &&
                                styles.radioSelected,
                            ]}
                          >
                            {selected ? (
                              <View
                                style={
                                  styles.radioDot
                                }
                              />
                            ) : null}
                          </View>

                          <Text
                            style={[
                              styles.optionText,

                              selected &&
                                styles.optionTextSelected,
                            ]}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    }
                  )}
                </View>
              </View>
            ) : null}

            {section.items.map(
              (item) => (
                <ConscienceCheckboxItem
                  key={item.id}
                  question={item.question}
                  checked={selectedIds.has(
                    item.id
                  )}
                  onPress={() =>
                    toggleItem(item.id)
                  }
                />
              )
            )}
          </ConscienceAccordion>
        )
      )}

      <View style={styles.scriptContainer}>
        <View style={styles.scriptHeader}>
          <View
            style={styles.scriptIconContainer}
          >
            <Ionicons
              name="document-text-outline"
              size={24}
              color={COLORS.surface}
            />
          </View>

          <View style={styles.scriptHeading}>
            <Text style={styles.scriptTitle}>
              Modo Confessionário
            </Text>

            <Text
              style={styles.scriptSubtitle}
            >
              Roteiro gerado com suas
              marcações
            </Text>
          </View>
        </View>

        <View style={styles.scriptBox}>
          <Text
            selectable
            style={styles.scriptText}
          >
            {confessionScript}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <Pressable
            onPress={handleCopy}
            style={({ pressed }) => [
              styles.actionButton,
              styles.copyButton,
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Ionicons
              name={
                copied
                  ? 'checkmark-circle-outline'
                  : 'copy-outline'
              }
              size={20}
              color={COLORS.surface}
            />

            <Text
              style={
                styles.copyButtonText
              }
            >
              {copied
                ? 'Copiado!'
                : 'Copiar texto'}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleClear}
            style={({ pressed }) => [
              styles.actionButton,
              styles.clearButton,
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={COLORS.primary}
            />

            <Text
              style={
                styles.clearButtonText
              }
            >
              Limpar tudo
            </Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.footerNotice}>
        Este roteiro é apenas um auxílio
        para a preparação pessoal.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },

  hero: {
    marginBottom: SPACING.lg,
  },

  tag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 999,
    backgroundColor: `${COLORS.primary}12`,
  },

  tagText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  title: {
    color: COLORS.text,
    fontSize: 29,
    fontWeight: '900',
    lineHeight: 36,
  },

  subtitle: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 15,
    lineHeight: 23,
  },

  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
  },

  privacyText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },

  counterContainer: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.sm,
  },

  counterText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },

  lastConfessionContainer: {
    marginBottom: SPACING.sm,
  },

  lastConfessionLabel: {
    marginBottom: SPACING.sm,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },

  options: {
    gap: SPACING.sm,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },

  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}0D`,
  },

  optionPressed: {
    opacity: 0.75,
  },

  radio: {
    width: 21,
    height: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 999,
  },

  radioSelected: {
    borderColor: COLORS.primary,
  },

  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },

  optionText: {
    color: COLORS.text,
    fontSize: 14,
  },

  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  scriptContainer: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
  },

  scriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },

  scriptIconContainer: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
  },

  scriptHeading: {
    flex: 1,
  },

  scriptTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '900',
  },

  scriptSubtitle: {
    marginTop: 2,
    color: COLORS.textMuted,
    fontSize: 13,
  },

  scriptBox: {
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.background,
  },

  scriptText: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 24,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },

  actionButton: {
    minHeight: 48,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: 12,
  },

  copyButton: {
    backgroundColor: COLORS.primary,
  },

  clearButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },

  copyButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '800',
  },

  clearButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
  },

  buttonPressed: {
    opacity: 0.72,
  },

  footerNotice: {
    marginTop: SPACING.md,
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});