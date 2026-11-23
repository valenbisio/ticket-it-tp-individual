import React from 'react';
import { StyleSheet, View } from 'react-native';
import { borderRadius, colors, spacing } from '../../data/theme.js';

/* eslint-disable react/prop-types */
function SkeletonBlock({ style }) {
  return <View accessible={false} style={[styles.block, style]} />;
}

export function EventListSkeleton() {
  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Cargando eventos" style={styles.list}>
      {[0, 1, 2].map((key) => (
        <View key={key} style={styles.eventCard}>
          <SkeletonBlock style={styles.eventImage} />
          <View style={styles.eventContent}>
            <SkeletonBlock style={styles.title} />
            <SkeletonBlock style={styles.line} />
            <SkeletonBlock style={styles.lineShort} />
            <SkeletonBlock style={styles.footer} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function PurchaseListSkeleton() {
  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Cargando compras" style={styles.purchaseList}>
      {[0, 1, 2].map((key) => (
        <View key={key} style={styles.purchaseCard}>
          <SkeletonBlock style={styles.title} />
          <SkeletonBlock style={styles.line} />
          <SkeletonBlock style={styles.details} />
          <SkeletonBlock style={styles.footer} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: colors.surfaceContainerHighest, borderRadius: borderRadius.sm },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.md },
  eventCard: { borderRadius: borderRadius.lg, overflow: 'hidden', backgroundColor: colors.surfaceContainerHigh },
  eventImage: { width: '100%', height: 140, borderRadius: 0 },
  eventContent: { padding: spacing.md, gap: spacing.sm },
  title: { height: 18, width: '68%' },
  line: { height: 12, width: '88%' },
  lineShort: { height: 12, width: '52%' },
  footer: { height: 34, width: '100%', marginTop: spacing.xs },
  purchaseList: { padding: spacing.md, gap: spacing.md },
  purchaseCard: { padding: spacing.md, gap: spacing.sm, borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerHigh },
  details: { height: 48, marginTop: spacing.xs },
});
