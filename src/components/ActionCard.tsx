import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

export interface ActionCardProps {
  id: string;
  badge?: string;
  title: string;
  subtitle: string;
  iconText?: string;
  isFocused: boolean;
  onFocus: () => void;
  onBlur?: () => void;
  onPress: () => void;
  hasTVPreferredFocus?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  badge,
  title,
  subtitle,
  iconText,
  isFocused,
  onFocus,
  onBlur,
  onPress,
  hasTVPreferredFocus,
  testID,
  accessibilityLabel,
  style,
}) => {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || `${title}, ${subtitle}`}
      hasTVPreferredFocus={hasTVPreferredFocus}
      onFocus={onFocus}
      onBlur={onBlur}
      onPress={onPress}
      style={[
        styles.card,
        isFocused ? styles.cardFocused : styles.cardDefault,
        style,
      ]}>
      <View style={styles.topRow}>
        {iconText ? (
          <View
            style={[
              styles.iconContainer,
              isFocused ? styles.iconContainerFocused : styles.iconContainerDefault,
            ]}>
            <Text style={styles.iconSymbol}>{iconText}</Text>
          </View>
        ) : null}
        {badge ? (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.title, isFocused && styles.titleFocused]}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.footerRow}>
        <Text style={[styles.hintText, isFocused && styles.hintTextFocused]}>
          {isFocused ? 'Press SELECT' : 'Use Remote to Focus'}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 24,
    justifyContent: 'space-between',
    borderWidth: 2,
  },
  cardDefault: {
    backgroundColor: '#121A2D',
    borderColor: '#1E293B',
    transform: [{scale: 1}],
  },
  cardFocused: {
    backgroundColor: '#1E2945',
    borderColor: '#38BDF8',
    transform: [{scale: 1.05}],
    shadowColor: '#38BDF8',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerDefault: {
    backgroundColor: '#1E293B',
  },
  iconContainerFocused: {
    backgroundColor: '#0284C7',
  },
  iconSymbol: {
    fontSize: 24,
    color: '#F8FAFC',
  },
  badgeContainer: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  badgeText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 8,
  },
  titleFocused: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
    color: '#94A3B8',
  },
  footerRow: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  hintText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hintTextFocused: {
    color: '#38BDF8',
  },
});
