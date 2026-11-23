import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../data/theme.js';

/* eslint-disable react/prop-types */
export function PasswordVisibilityIcon({ visible, color = colors.onSurfaceVariant, size = 20 }) {
  return (
    <Ionicons
      name={visible ? 'eye-outline' : 'eye-off-outline'}
      size={size}
      color={color}
    />
  );
}
