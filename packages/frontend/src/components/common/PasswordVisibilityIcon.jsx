import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../data/theme.js';

/* eslint-disable react/prop-types */
export function PasswordVisibilityIcon({ visible }) {
  return (
    <View accessible={false} style={styles.icon}>
      <View style={styles.eye}>
        {visible ? <View style={styles.pupil} /> : null}
      </View>
      {!visible && <View style={styles.slash} />}
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  eye: { width: 21, height: 14, borderWidth: 2, borderColor: colors.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pupil: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary },
  slash: { position: 'absolute', width: 27, height: 2, borderRadius: 1, backgroundColor: colors.primary, transform: [{ rotate: '-42deg' }] },
});
