/* eslint-disable react/prop-types */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../../data/theme.js';

export const StatusBadge = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'confirmada':
        return {
          label: 'Confirmada',
          bg: colors.successContainer,
          text: colors.success,
          dot: colors.success,
        };
      case 'pendiente de pago':
        return {
          label: 'Pendiente de pago',
          bg: colors.warningContainer,
          text: colors.warning,
          dot: colors.warning,
        };
      case 'utilizada':
        return {
          label: 'Utilizada',
          bg: colors.neutralBadgeContainer,
          text: colors.neutralBadge,
          dot: colors.neutralBadge,
        };
      case 'reembolsada':
        return {
          label: 'Reembolsada',
          bg: 'rgba(255, 178, 183, 0.15)',
          text: colors.secondary,
          dot: colors.secondary,
        };
      case 'cancelada':
        return {
          label: 'Cancelada',
          bg: colors.errorContainer,
          text: colors.error,
          dot: colors.error,
        };
      default:
        return {
          label: status,
          bg: colors.surfaceContainerHighest,
          text: colors.onSurfaceVariant,
          dot: colors.outline,
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
