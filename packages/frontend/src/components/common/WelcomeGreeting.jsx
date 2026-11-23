/* eslint-disable react/prop-types */
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../data/theme.js';

export function WelcomeGreeting({ name }) {
  return (
    <View>
      <Text style={styles.label}>Bienvenido/a</Text>
      <Text accessibilityRole="header" style={styles.title}>Hola, {name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: colors.onSurface,
    fontSize: 22,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
});
