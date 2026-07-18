import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  COLORS,
  SPACING,
} from '../constants/theme';

export default function ConscienceCheckboxItem({
  question,
  checked,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{
        checked,
      }}
      accessibilityLabel={question}
      style={({ pressed }) => [
        styles.container,
        checked && styles.containerChecked,
        pressed && styles.containerPressed,
      ]}
    >
      <View
        style={[
          styles.checkbox,
          checked && styles.checkboxChecked,
        ]}
      >
        {checked ? (
          <Ionicons
            name="checkmark"
            size={17}
            color={COLORS.surface}
          />
        ) : null}
      </View>

      <Text
        style={[
          styles.question,
          checked && styles.questionChecked,
        ]}
      >
        {question}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },

  containerChecked: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}0D`,
  },

  containerPressed: {
    opacity: 0.75,
  },

  checkbox: {
    width: 23,
    height: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
  },

  checkboxChecked: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },

  question: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },

  questionChecked: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});