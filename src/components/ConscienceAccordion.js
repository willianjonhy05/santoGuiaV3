import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useState } from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  COLORS,
  SPACING,
} from '../constants/theme';

export default function ConscienceAccordion({
  title,
  initiallyOpen = false,
  children,
}) {
  const [isOpen, setIsOpen] = useState(
    initiallyOpen
  );

  function toggleAccordion() {
    setIsOpen((current) => !current);
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={toggleAccordion}
        accessibilityRole="button"
        accessibilityState={{
          expanded: isOpen,
        }}
        style={({ pressed }) => [
          styles.header,
          isOpen && styles.headerOpen,
          pressed && styles.headerPressed,
        ]}
      >
        <Text style={styles.title}>
          {title}
        </Text>

        <Ionicons
          name={
            isOpen
              ? 'chevron-up'
              : 'chevron-down'
          }
          size={21}
          color={COLORS.primary}
        />
      </Pressable>

      {isOpen ? (
        <View style={styles.content}>
          {children}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },

  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },

  headerOpen: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  headerPressed: {
    opacity: 0.7,
  },

  title: {
    flex: 1,
    paddingRight: SPACING.md,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },

  content: {
    gap: SPACING.sm,
    padding: SPACING.md,
  },
});