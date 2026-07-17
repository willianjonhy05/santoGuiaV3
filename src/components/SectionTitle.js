import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

export default function SectionTitle({ title, actionLabel, onActionPress }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? (
        <Text style={styles.action} onPress={onActionPress}>
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },
  action: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
