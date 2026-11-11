import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../data/theme.js';

export default function BuyerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface },
      }}
    />
  );
}
